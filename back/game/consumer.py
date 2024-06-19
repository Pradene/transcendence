import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
import typing
import json
from game.game import PlayerInterface, Game


class GameConsumer(AsyncJsonWebsocketConsumer):
    GAMES: typing.List[Game] = []

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.__updateCallback = None
        self.__p1: PlayerInterface = PlayerInterface('p1', lambda a: None)
        self.__username: str = "test" #TODO remove this

    async def connect(self):
        await self.accept()
        self.__updateCallback = self.updateClient
        self.__p1.setCallback(self.__updateCallback)
        logging.log(logging.INFO, "New websocket connection")

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
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
            case "set_username":
                self.__username = data["username"]
                self.__p1.setName(self.__username)
            case "get_games":
                await self.getGames()
            case "create_game":
                await self.createGame(data)

    async def disconnect(self, close_code):
        pass

    async def getGames(self):
        arr = [x.gameInfo() for x in self.GAMES]
        await self.send_json(arr)

    async def updateClient(self, gameData: dict):
        logging.log(logging.INFO, "Update client")
        await self.send_json(gameData)

    async def joinGame(self, data):
        if self.__username == "" or "gameid" not in data or data["gameid"] == self.__username:
            return
        game = GameConsumer.GAMES[data["gameid"]]
        game.addPlayer(PlayerInterface(self.__username, self.__updateCallback))
        await game.update()

    async def createGame(self, data):
        if self.__username == "":
            return
        newgame = Game(self.__p1)
        GameConsumer.GAMES.append(newgame)
        await newgame.update()
