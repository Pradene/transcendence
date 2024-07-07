from typing import List, Dict, Union, Callable
from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament
from game.gameutils.PlayerInterface import PlayerInterface

import logging
import time

from threading import Lock, Thread


class ThreadingDict:
    def __init__(self):
        self.__dict: Dict = {}
        self.__lock: Lock = Lock()
        self.__thread: Thread = Thread(target=self.__checkAndDelete)

        self.__thread.start()

    def __del__(self):
        self.__thread.join()

    def __checkAndDelete(self):
        while True:

            self.__lock.acquire()
            # iterate over the keys and delete the ones that should be deleted
            for key in list(self.__dict.keys()):
                if self.__dict[key].isFinished():
                    self.__dict.pop(key)
                    logging.log(logging.INFO, f"Game {key} deleted")
            self.__lock.release()

            time.sleep(1)

    def __getitem__(self, key):

        self.__lock.acquire()
        item = self.__dict[key]
        self.__lock.release()

        return item

    def __setitem__(self, key, value):

        self.__lock.acquire()
        self.__dict[key] = value
        self.__lock.release()

    def __contains__(self, key):
        self.__lock.acquire()
        check = key in self.__dict.keys()
        self.__lock.release()

        return check

    def pop(self, key):

        self.__lock.acquire()
        item = self.__dict.pop(key, None)
        self.__lock.release()

        return item

    def keys(self):
        self.__lock.acquire()
        item = self.__dict.keys()
        self.__lock.release()

        return item

    def values(self):
        self.__lock.acquire()
        items = self.__dict.values()
        self.__lock.release()

        return items


class GameManager:
    GAMES: ThreadingDict = ThreadingDict()
    TOURNAMENTS: ThreadingDict = ThreadingDict()
    USERLIST: List = []
    __instance = None

    def __init__(self):
        pass

    def __del__(self):
        pass

    def createGame(self, player: PlayerInterface) -> Game:
        game = Game(player)
        GameManager.GAMES[player.getName()] = game
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
        garr = [x.gameInfo() for x in GameManager.GAMES.values()]
        tarr = [x.tournamentInfo() for x in GameManager.TOURNAMENTS.values()]
        return {"games": garr, "tournaments": tarr}

    @staticmethod
    def getInstance() -> 'GameManager':
        if GameManager.__instance is None:
            logging.log(logging.INFO, "Creating GameManager instance")
            GameManager.__instance = GameManager()
        return GameManager.__instance

    @staticmethod
    def setUserList(userlist: List):
        GameManager.USERLIST = userlist
        logging.log(logging.INFO, "Userlist set")