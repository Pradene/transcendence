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
    
    def createTournament(self, player: PlayerInterface) -> Tournament:
        GameManager.TOURNAMENTS[player.getName()] = Tournament(player)
        return GameManager.TOURNAMENTS[player.getName()]

    def tournamentExists(self, name: str) -> bool:
        return name in GameManager.TOURNAMENTS.keys()
    
    def getTournament(self, name: str) -> Tournament:
        return GameManager.TOURNAMENTS[name]

    def __deleteGame(self, gameid: str) -> None:
        game = GameManager.GAMES.pop(gameid, None)
        game.removeFromClients()
        logging.log(logging.INFO, f"Game {gameid} deleted")

    def toJSON(self) -> Dict:
        garr = [x.gameInfo() for x in GameManager.GAMES.values()]
        tarr = []
        return {"games": garr, "tournaments": tarr}