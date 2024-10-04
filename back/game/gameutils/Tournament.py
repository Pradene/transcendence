import asyncio
import logging
import time
from typing import List, Union

import account.models
from game.gameutils.Game import Game
from game.gameutils.PlayerInterface import PlayerInterface
from game.gameutils.abstractgame import AbstractGame

from threading import Thread

import game.models as gamemodels
import account.models as accountmodels


class Tournament(AbstractGame):
    def __init__(self, player: PlayerInterface):
        super().__init__(player)

        self.__players: List[PlayerInterface] = []
        self.__games: List[Game] = []

        self.__th = Thread(target=asyncio.run, args=(self.__tournamentLoop(),))

    async def join(self, player: PlayerInterface) -> None:
        nplayers = len(self.__players)

        # if tournament is full, raise an error
        if nplayers == 4:
            raise RuntimeError("Tournament is full")

        # else add player to the tournament
        self.__players.append(player)
        nplayers += 1

        # if first or second player, create a game
        if nplayers == 1 or nplayers == 2:
            ngame = Game(player)
            self.__games.append(ngame)
            await ngame.update()
        elif nplayers == 3:
            await self.__games[0].join(player)
        elif nplayers == 4:
            await self.__games[1].join(player)
            self.start()

    def start(self) -> None:
        if len(self.__players) < 4:
            raise RuntimeError("Tournament not full")

        self.__th.start()

    def tournamentInfo(self) -> dict:
        return {
            "creator":      self.getGameid(),
            "player_count": len(self.__players),
            "is_full":      len(self.__players) == 4,
        }

    async def __tournamentLoop(self) -> None:
        game0 = self.__games[0]
        game1 = self.__games[1]

        game0.start()
        game1.start()

        # wait for one game to finish
        while not game0.isFinished() and not game1.isFinished():
            time.sleep(1)

        # get the first winner and start the next game
        winner0 = game0.getWinner() if game0.isFinished() else game1.getWinner()
        remaining_game = game0 if not game0.isFinished() else game1

        if winner0 is None:
            await self._setFinished()
            return

        logging.log(logging.INFO, f"Game 0 finished, winner: {winner0.getName()}")

        game3 = Game(winner0)
        self.__games.append(game3)
        await game3.update()

        # wait for the remaining game to finish
        while not remaining_game.isFinished():
            time.sleep(1)

        winner1 = remaining_game.getWinner()
        if winner1 is None:
            await self._setFinished()
            return

        logging.log(logging.INFO, f"Game 1 finished, winner: {winner1.getName()}")

        # start last game
        await game3.join(winner1)
        game3.start()

        while not game3.isFinished():
            time.sleep(1)

        winner3 = game3.getWinner()
        logging.log(logging.INFO, f"Game 2 finished, winner: {winner3.getName()}")
        await self._setFinished(game3.getWinner())

    async def quit(self) -> None:
        await self._setFinished()

        for game in self.__games:
            await game.quit()

    async def update(self) -> None:
        pass

    def saveToDB(self) -> None:
        game1 = self.__games[0]
        game2 = self.__games[1]
        game3 = self.__games[2]

        game1.saveToDB()
        game2.saveToDB()
        game3.saveToDB()

        if self.getWinner() is None:
            return

        game1 = self.__games[0].getGameModel()
        game2 = self.__games[1].getGameModel()
        game3 = self.__games[2].getGameModel()

        winner = accountmodels.CustomUser.objects.get(username=self.getWinner().getName())

        dbentry = gamemodels.TournamentModel(
            game1=game1,
            game2=game2,
            game3=game3,
            winner=winner
        )
        dbentry.save()

    async def redirectClients(self):
        # if self.__gamemodel is None:
        #     return

        # data = {
        #     "method": "redirect_game",
        #     "status": True,
        #     "gameid": self.__gamemodel.id
        # }

        # for player in self.__players:
        #     await player.getUpdateCallback()(data)
        pass
