from typing import List, Dict, Union, Callable
from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament
from game.gameutils.PlayerInterface import PlayerInterface

import logging
import time
import asyncio

from threading import RLock, Thread


class ThreadingDict:
    def __init__(self):
        self.__dict: Dict = {}
        # self.__ondelete: Callable = onDelete
        self.__lock: RLock = RLock()
        self.__thread: Thread = Thread(target=self.__checkAndDelete)

        self.__thread.start()

    def __del__(self):
        self.__thread.join()

    def __checkAndDelete(self):
        oneDeleted: bool = False

        while True:

            with self.__lock:
                # iterate over the keys and delete the ones that should be deleted
                for key in list(self.__dict.keys()):
                    if self.__dict[key].isFinished():
                        game = self.__dict.pop(key)
                        game.saveToDB()
                        logging.log(logging.INFO, f"Game {key} deleted")
                        oneDeleted = True

            if oneDeleted:
                from game.consumers import GameConsumer
                oneDeleted = False
                asyncio.run(GameConsumer.onGameChange())

            time.sleep(1)

    def __getitem__(self, key):
        with self.__lock:
            item = self.__dict[key]

        return item

    def __setitem__(self, key, value):
        with self.__lock:
            self.__dict[key] = value

    def __contains__(self, key):
        with self.__lock:
            check = key in self.__dict

        return check

    def pop(self, key):
        with self.__lock:
            item = self.__dict.pop(key)

        return item

    def keys(self):
        with self.__lock:
            keys = self.__dict.keys()

        return keys

    def values(self):
        with self.__lock:
            values = self.__dict.values()

        return values


class GameManager:
    from game.consumers import GameConsumer

    GAMES: ThreadingDict = ThreadingDict()
    TOURNAMENTS: ThreadingDict = ThreadingDict()
    USERLIST: List[GameConsumer] = []
    __instance = None

    def __init__(self):
        pass

    def __del__(self):
        pass

    async def createGame(self, player: PlayerInterface) -> Game:
        logging.info(f"[GameManager]: creating new game instance")
        from game.consumers import GameConsumer
        game = Game(player)
        GameManager.GAMES[player.getName()] = game

        await GameConsumer.onGameChange()
        logging.info(f"[GameManager]: Game instance created")
        return game

    def gameExists(self, gameid: str) -> bool:
        return gameid in GameManager.GAMES.keys()

    def getGame(self, gameid: str) -> Game:
        return GameManager.GAMES[gameid]

    def createTournament(self, player: PlayerInterface) -> Tournament:
        GameManager.TOURNAMENTS[player.getName()] = Tournament(player)
        return GameManager.TOURNAMENTS[player.getName()]

    def tournamentExists(self, name: str) -> bool:
        return name in GameManager.TOURNAMENTS.keys()

    def getTournament(self, name: str) -> Tournament:
        return GameManager.TOURNAMENTS[name]

    def gameOrTournamentExists(self, name: str) -> bool:
        return self.gameExists(name) or self.tournamentExists(name)

    def getGameOrTournament(self, name: str) -> Union[Game, Tournament]:
        if self.gameExists(name):
            return self.getGame(name)
        elif self.tournamentExists(name):
            return self.getTournament(name)
        else:
            raise KeyError(f"Game or Tournament {name} does not exist")

    def __deleteGame(self, gameid: str) -> None:
        game = GameManager.GAMES.pop(gameid, None)
        game.removeFromClients()
        logging.log(logging.INFO, f"Game {gameid} deleted")

    def __deleteTournament(self, name: str) -> None:
        GameManager.TOURNAMENTS.pop(name, None)
        logging.log(logging.INFO, f"Tournament {name} deleted")

    def toJSON(self) -> Dict:
        garr = [x.gameInfo() for x in GameManager.GAMES.values() if not x.gameInfo()["is_full"]]
        tarr = [x.tournamentInfo() for x in GameManager.TOURNAMENTS.values()]
        return {"games": garr, "tournaments": tarr}

    @staticmethod
    def getInstance() -> 'GameManager':
        if GameManager.__instance is None:
            logging.log(logging.INFO, "Creating GameManager instance")
            GameManager.__instance = GameManager()
            logging.info("GameManager instance created")
        return GameManager.__instance

    @staticmethod
    def setUserList(userlist: List):
        GameManager.USERLIST = userlist
        logging.log(logging.INFO, "Userlist set")