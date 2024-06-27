from typing import List, Dict
from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament
from game.gameutils.PlayerInterface import PlayerInterface

import logging

class GameManager:
    GAMES: Dict[str, Game] = {}
    TOURNAMENTS: Dict[str, Tournament] = {}

    def __init__(self):
        pass

    def __del__(self):
        pass

    def createGame(self, player: PlayerInterface) -> Game:
        game = Game(player, self.__deleteGame)
        GameManager.GAMES[player.getName()] = game
        return game

    def gameExists(self, gameid: str) -> bool:
        return gameid in GameManager.GAMES.keys()
    
    def getGame(self, gameid: str) -> Game:
        return GameManager.GAMES[gameid]
    
    def createTournament(self, name: str) -> None:
        GameManager.TOURNAMENTS[name] = Tournament()

    def __deleteGame(self, gameid: str) -> None:
        game = GameManager.GAMES.pop(gameid, None)
        game.removeFromClients()
        logging.log(logging.INFO, f"Game {gameid} deleted")

    def toJSON(self) -> List:
        garr = [x.gameInfo() for x in GameManager.GAMES.values()]
        tarr = []
        return garr + tarr