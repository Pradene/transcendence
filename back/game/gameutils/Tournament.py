from typing import List, Callable

import logging

from game.gameutils.Game import Game
from game.gameutils.PlayerInterface import PlayerInterface

class Tournament:
    def __init__(self, player: PlayerInterface, deleteCallback: Callable):
        self.__games: List[Game] = []
        self.__id = player.getName()

        self.__players: List[PlayerInterface] = [player]

        self.__deleteTournament: Callable = deleteCallback

        logging.log(logging.INFO, f"Tournament {self.__id} created")

    async def join(self, player: PlayerInterface) -> None:
        if len(self.__players) < 4:
            logging.log(logging.INFO, f"Player {player.getName()} joined tournament {self.__id}")
            self.__players.append(player)
        else:
            logging.log(logging.INFO, f"Tournament {self.__id} is full")

    def start(self) -> None:
        game0 = Game(self.__players[0], self.__deleteGame)
        game0.join(self.__players[1])
        game1 = Game(self.__players[2], self.__deleteGame)
        game1.join(self.__players[3])

    def __deleteGame(self, gameid: str) -> None:
        for game in self.__games:
            if game.getGameid() == gameid:
                self.__games.remove(game)
                break

    def tournamentInfo(self) -> dict:
        return {
            "creator": self.__id,
            "player_count": len(self.__players),
            "is_full": len(self.__players) == 4,
        }