from typing import List
from game.gameutils.Game import Game
from game.gameutils.PlayerInterface import PlayerInterface

class Tournament:
    def __init__(self, player: PlayerInterface):
        self.__games: List[Game] = []
        self.__id = player.getName()
