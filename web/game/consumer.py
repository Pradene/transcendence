import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Union, List
import json

from game.response import Response

from game.gameutils.PlayerInterface import PlayerInterface
from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament

from game.gameutils.gamemodifier.gamemodifier import GameModifier
from game.gameutils.gamemodifier.rainmodifier import RainModifier
from game.gameutils.gamemodifier.windmodifier import WindModifier
from game.gameutils.gamemodifier.lighnightmodifier import LightnightModifier

# This is a global variable that is used to check if the module has been initialised
MODULE_INITIALIZED: bool = False
MODIFIERS: dict[str, callable] = {
    "Rain":       lambda: RainModifier(),
    "Wind":       lambda: WindModifier(),
    "Lightnight": lambda: LightnightModifier()
}


def createGameModifiers(modifiers: list[str]) -> list[GameModifier]:
    """Create a list of GameModifier objects from a list of modifier names"""

    gameModifiers = []

    for modifier in modifiers:
        if modifier not in MODIFIERS.keys():
            raise ValueError(f"Modifier {modifier} does not exist")
        else:
            gameModifiers.append(MODIFIERS[modifier]())
    return gameModifiers


class GameConsumerResponse:
    def __init__(self, method: str, status: bool, data: dict = {}, reason: str = ""):
        self.method = method
        self.status = status
        self.data = data
        self.reason = reason

    def toJSON(self) -> dict:
        response: dict = {
            "method": self.method,
            "status": self.status,
            "reason": self.reason,
            "data":   self.data,
        }

        return response


class GameConsumer(AsyncJsonWebsocketConsumer):
    USERS: List = []

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.__interface: PlayerInterface = PlayerInterface('p1', self.updateClient, self.__deleteCurrentGame)
        self.__currentGame: Union[Game, Tournament, None] = None
        self.__user = None

        if not MODULE_INITIALIZED:
            from game.gameutils.GameManager import GameManager
            logging.log(logging.INFO, "Initialising GameConsumer")
            GameManager.setUserList(GameConsumer.USERS)
            MODULE_INITIALISED = True

    async def connect(self):
        self.__user = self.scope["user"]

        if not self.__user.is_authenticated:
            await self.close()
            return
        elif self.__user.username in [user.getUsername() for user in GameConsumer.USERS]:
            await self.close()
            return

        GameConsumer.USERS.append(self)

        logging.log(logging.INFO, f"New GameConsumer connected: {str(self.__user)}:{self.__user.username}")
        self.__interface.setName(self.__user.username)
        await self.accept()
        await self.getGames()
        await self.onUserChange()

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        """Handle incoming messages from the client"""

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return
        method = data["method"]
        if not method:
            return

        match method:
            case "get_games":
                await self.getGames()
            case "create_game":
                await self.createGame(data)
            case "create_tournament":
                await self.createTournament(data)
            case "join_game":
                await self.joinGame(data)
            case "update_player":
                await self.updatePlayer(data)

    async def disconnect(self, close_code):
        """Handle client disconnection"""

        logging.log(logging.INFO, f"User {self.__interface.getName()} disconnecting...")
        if self.isInGame():
            logging.log(logging.INFO,
                        f"User {self.__interface.getName()} is in game {self.__currentGame.getGameid()}, quitting")
            await self.__currentGame.quit()
            logging.log(logging.INFO,
                        f"User {self.__interface.getName()} has quit the game {self.__currentGame.getGameid()}")

        for user in GameConsumer.USERS:
            if user == self:
                GameConsumer.USERS.remove(user)
        logging.log(logging.INFO, f"User {self.__interface.getName()} has disconnected")
        await GameConsumer.onUserChange()

    def isInGame(self) -> bool:
        """Check if the user is in a game"""

        return self.__currentGame is not None and self.__currentGame.isFinished() is not True

    async def getGames(self):
        """Send a list of all games to the client"""

        from game.gameutils.GameManager import GameManager

        manager: GameManager = GameManager.getInstance()
        response: GameConsumerResponse = GameConsumerResponse(method="get_games", status=True, data=manager.toJSON())

        await self.send_json(response.toJSON())

    async def send_json(self, data):
        """Send JSON data to the client and log it to the console"""

        await super().send_json(data)

    async def updateClient(self, gameData: dict):
        """Send updated game data to the client"""

        await self.send_json(gameData)

    async def joinGame(self, data):
        """Add the player to the game"""

        from game.gameutils.GameManager import GameManager

        # check request format
        gameid: str = ""
        try:
            gameid = data["data"]["gameid"]
        except KeyError:
            response = GameConsumerResponse(method="join_game", status=False, reason=Response.INVALIDREQUEST)
            await self.send_json(response.toJSON())
            return

        # Check if the user can join a game
        manager: GameManager = GameManager.getInstance()
        username = self.__interface.getName()
        if username == "":
            response = GameConsumerResponse(method="join_game", status=False, reason=Response.INVALIDUSERNAME)
            await self.send_json(response.toJSON())
            return
        elif self.isInGame():
            response = GameConsumerResponse(method="join_game", status=False, reason=Response.ALREADYINGAME)
            await self.send_json(response.toJSON())
            return

        try:
            # join the game
            self.__currentGame = manager.getGameOrTournament(gameid)
            await self.__currentGame.join(self.__interface)

            # if game is not a tournament, start it
            try:
                manager.getGame(gameid)
                self.__currentGame.start()
            except KeyError:
                pass

            # update game list for all users
            await GameConsumer.onGameChange()
        except KeyError:
            response = GameConsumerResponse(method="join_game", status=False, reason=Response.NOSUCHGAME)
            await self.send_json(response.toJSON())
        except RuntimeError as error:
            response = GameConsumerResponse(method="join_game", status=False, reason=str(error))
            await self.send_json(response.toJSON())

    async def createGame(self, data):
        """Create a new game and add the player to it"""

        from game.gameutils.GameManager import GameManager

        modifiers: List[GameModifier] = []

        # Check if the user can join a game
        if self.isInGame():
            response = GameConsumerResponse(method="create_game", status=False, reason=Response.ALREADYINGAME)
            await self.send_json(response.toJSON())
            return

        try:
            modifiers = createGameModifiers(data["data"]["modifiers"])
            manager: GameManager = GameManager.getInstance()
            self.__currentGame = await manager.createGame(self.__interface, modifiers=modifiers)
            await self.__currentGame.update()
        except KeyError:
            response = GameConsumerResponse(method="create_game", status=False, reason=Response.INVALIDREQUEST)
            await self.send_json(response.toJSON())
        except ValueError:
            response = GameConsumerResponse(method="create_game", status=False, reason=Response.INVALIDREQUEST)
            await self.send_json(response.toJSON())

    async def createTournament(self, data):
        """Create a new tournament and add the player to it"""

        from game.gameutils.GameManager import GameManager

        # Check if the user can join a game
        if self.isInGame():
            response = GameConsumerResponse(method="create_tournament", status=False, reason=Response.ALREADYINGAME)
            await self.send_json(response.toJSON())
            return

        # Check request format
        try:
            modifiers: List[GameModifier] = createGameModifiers(data["data"]["modifiers"])
            manager: GameManager = GameManager.getInstance()
            self.__currentGame = manager.createTournament(self.__interface, modifiers)
            await self.__currentGame.join(self.__interface)  # required to trigger the update method

            for user in GameConsumer.USERS:
                await user.getGames()
        except KeyError:
            response = GameConsumerResponse(method="create_tournament", status=False, reason=Response.INVALIDREQUEST)
            await self.send_json(response.toJSON())
            return
        except RuntimeError:
            response = GameConsumerResponse(method="create_tournament", status=False, reason=Response.GAMEFULL)
            await self.send_json(response.toJSON())
        except ValueError:
            response = GameConsumerResponse(method="create_tournament", status=False, reason=Response.INVALIDREQUEST)
            await self.send_json(response.toJSON())

    def __deleteCurrentGame(self):
        logging.log(logging.INFO, f"User {self.__interface.getName()} left the game {self.__currentGame.getGameid()}")
        self.__currentGame = None

    async def updatePlayer(self, data) -> None:
        """Update player movement"""

        if not self.isInGame():
            # response = GameConsumerResponse(method="update_player", status=False, reason=Response.NOTINGAME)
            # await self.send_json(response.toJSON())
            return

        try:
            movement = data["data"]["movement"]
            self.__interface.setMovement(movement)
        except KeyError as error:
            response = GameConsumerResponse(method="update_player", status=False,
                                            reason=f"{Response.INVALIDREQUEST}: {error}")
            await self.send_json(response.toJSON())
            return
        except ValueError as error:
            response = GameConsumerResponse(method="update_player", status=False,
                                            reason=f"{Response.INVALIDREQUEST}: {error}")
            await self.send_json(response.toJSON())
            return

    @staticmethod
    async def onGameChange():
        """Update the game list for all users"""
        for user in GameConsumer.USERS:
            await user.getGames()

    @staticmethod
    async def onUserChange():
        """Update the user list for all users"""
        """Is triggered when a user connects or disconnects"""

        userlist: List[str] = [user.getUsername() for user in GameConsumer.USERS]

        for user in GameConsumer.USERS:
            await user.updateUserList(userlist)

    async def updateUserList(self, userlist: List[str]):
        """Send the updated user list to the client"""

        response: GameConsumerResponse = GameConsumerResponse(method="get_users", status=True, data={"users": userlist})
        await self.send_json(response.toJSON())

    def getUsername(self) -> str:
        """Return the username of the user"""

        return self.__user.username
