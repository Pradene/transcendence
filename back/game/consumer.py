import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Union, List
import json
from game.game import PlayerInterface, Game

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
            "data": self.data,
        }

        return response

class GameConsumer(AsyncJsonWebsocketConsumer):
    GAMES: dict[Game] = []
    USERS = []

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.__updateCallback = None
        self.__p1: PlayerInterface = PlayerInterface('p1', lambda a: None)
        self.__currentGame: Union[Game, None] = None

        GameConsumer.USERS.append(self)

    def __del__(self):
#         super().__del__()

        for user in GameConsumer.USERS:
            if user == self:
                GameConsumer.USERS.remove(user)

    async def connect(self):
        await self.accept()
        self.__updateCallback = self.updateClient
        self.__p1.setCallback(self.__updateCallback)
        logging.log(logging.INFO, "New websocket connection")
        await self.getGames()

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        """Handle incoming messages from the client"""

        logging.log(logging.INFO, text_data)
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logging.log(logging.ERROR, "Invalid JSON: {text_data}")
            return
        method = data["method"]
        if not method:
            return

        match method:
            case "get_games":
                await self.getGames()
            case "create_game":
                await self.createGame(data)
            case "join_game":
                await self.joinGame(data)

    async def disconnect(self, close_code):
        pass

    async def getGames(self):
        """Send a list of all games to the client"""

        arr = [x.gameInfo() for x in self.GAMES]
        response: GameConsumerResponse = GameConsumerResponse(method="get_games", status=True, data=arr)

        await self.send_json(response.toJSON())

    async def send_json(self, data):
        await super().send_json(data)
        logging.log(logging.INFO, data)

    async def updateClient(self, gameData: dict):
        """Send updated game data to the client"""

        logging.log(logging.INFO, "Update client")
        await self.send_json(gameData)

    async def joinGame(self, data):
        """Add the player to the game"""

        username = self.__p1.getName()
        if username == "":
            response = GameConsumerResponse(method="join_game", status=False, reason="Invalid username")
            await self.send_json(response.toJSON())
            return
        elif self.__currentGame is not None:
            response = GameConsumerResponse(method="join_game", status=False, reason="Already in a game")
            await self.send_json(response.toJSON())
            return
        elif data["data"]["gameid"] not in GameConsumer.GAMES.keys():
            response = GameConsumerResponse(method="join_game", status=False, reason="Game not found")
            await self.send_json(response.toJSON())
            return
        elif data["data"]["gameid"] == self.__currentGame:
            response = GameConsumerResponse(method="join_game", status=False, reason="Already in this game")
            await self.send_json(response.toJSON())
            return

        self.__currentGame = GameConsumer.GAMES[data["data"]["gameid"]]
        self.__currentGame.addPlayer(PlayerInterface(username, self.__updateCallback))
        await game.update()

        for user in GameConsumer.USERS:
            await user.getGames()

    async def createGame(self, data):
        """Create a new game and add the player to it"""

        self.__p1.setName(data["data"]["username"])
        if self.__p1.getName() == "":
            response = GameConsumerResponse(method="create_game", status=False, reason="Invalid username")
            await self.send_json(response.toJSON())
            return
        elif self.__currentGame is not None:
            response = GameConsumerResponse(method="create_game", status=False, reason="Already in a game")
            await self.send_json(response.toJSON())
            return

        self.__currentGame = Game(self.__p1)
        GameConsumer.GAMES.append(self.__currentGame)
        await self.__currentGame.update()

        for user in GameConsumer.USERS:
            await user.getGames()