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
            #iterate over the keys and delete the ones that should be deleted
            with self.__lock:
                logging.log(logging.INFO, "Checking and deleting finished games")
                for key in list(self.__dict.keys()):
                    if self.__dict[key].isFinished():
                        self.__dict.pop(key)
                        logging.log(logging.INFO, f"Game {key} deleted")

            time.sleep(1)

    def __getitem__(self, key):
        with self.__lock:
            return self.__dict[key]
        
    def __setitem__(self, key, value):
        with self.__lock:
            self.__dict[key] = value

    def __contains__(self, key):
        with self.__lock:
            return key in self.__dict.keys()
        
    def pop(self, key):
        with self.__lock:
            return self.__dict.pop(key, None)
        
    def keys(self):
        with self.__lock:
            return self.__dict.keys()
        
    def values(self):
        with self.__lock:
            return self.__dict.values()
        
class GameManager:
    GAMES: ThreadingDict = ThreadingDict()
    TOURNAMENTS: ThreadingDict = ThreadingDict()

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