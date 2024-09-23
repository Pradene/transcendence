import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Union, List
import json

from game.response import Response

from game.gameutils.PlayerInterface import PlayerInterface
from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament
from game.gameutils.Matchmaking import matchmaker


# This is a global variable that is used to check if the module has been initialised
MODULE_INITIALIZED: bool = False

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

        # logging.info(f"Received message from {self.__interface.getName()}: {text_data}")

        try:
            data = json.loads(text_data)
            method = data["method"]
        except json.JSONDecodeError:
            logging.error(f"Invalid JSON data received from {self.__interface.getName()}")
            return
        except KeyError:
            logging.error(f"Invalid JSON data received from {self.__interface.getName()}")
            return

        method = data["method"]
        if not method:
            return

        match method:
            case "get_games":
                await self.getGames()
            case "join_queue":
                await self.join_queue(data)
            case "update_player":
                await self.updatePlayer(data)

    async def disconnect(self, close_code):
        """Handle client disconnection"""

        logging.log(logging.INFO, f"User {self.__interface.getName()} disconnecting...")
        if self.isInGame():
            logging.log(logging.INFO, f"User {self.__interface.getName()} is in game {self.__interface.current_game.getGameid()}, quitting")
            await self.__interface.current_game.quit()
            logging.log(logging.INFO, f"User {self.__interface.getName()} has quit the game {self.__interface.current_game.getGameid()}")

        for user in GameConsumer.USERS:
            if user == self:
                GameConsumer.USERS.remove(user)

        logging.log(logging.INFO, f"User {self.__interface.getName()} has disconnected")
        await GameConsumer.onUserChange()


    def isInGame(self) -> bool:
        """Check if the user is in a game"""

        return self.__interface.current_game is not None and self.__interface.current_game.isFinished() is not True


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

    async def join_queue(self, data: dict):
        """Join the game or tournament queue"""

        if self.isInGame():
            response = GameConsumerResponse(method="join_queue", status=False, reason=Response.ALREADYINGAME)
            await self.send_json(response.toJSON())
            return

        try:
            queue_type = data['data']['mode']

            # Join the queue or raise an exception if the queue type is invalid
            if queue_type == 'game':
                await matchmaker.join_game_queue(self.__interface)
            elif queue_type == 'tournament':
                await matchmaker.join_tournament_queue(self.__interface)
            else:
                raise ValueError("Invalid queue type")

            # Send a success response
            response = GameConsumerResponse(method="join_queue", status=True)
            await self.send_json(response.toJSON())
        except KeyError as e:
            response = GameConsumerResponse(method="join_queue", status=False, reason="Invalid request")
        except ValueError as e:
            response = GameConsumerResponse(method="join_queue", status=False, reason=str(e))
            await self.send_json(response.toJSON())


    def __deleteCurrentGame(self):
        logging.log(logging.INFO, f"User {self.__interface.getName()} left the game {self.__interface.current_game.getGameid()}")
        self.__interface.current_game = None


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
                                            reason=f"{Response.INVALIDMOVEMENT}: {error}")
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


class GameMatchmakingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            f'matchmaking_pool',
            self.channel_name
        )

        await self.accept()

    async def disconnect(self):
        await self.channel_layer.group_discard(
            f'matchmaking_pool',
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            f'matchmaking_pool',
            {
                'type': 'match_found',
                'message': 'Match found'
            }
        )
