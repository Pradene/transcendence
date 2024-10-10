import asyncio
import logging
import time
from typing import List, Union

import account.models
from game.gameutils.Game import Game
from game.gameutils.PlayerInterface import PlayerInterface
from game.gameutils.abstractgame import AbstractGame
from utils.logger import Logger

from threading import Thread

import game.models as gamemodels
from game.models import TournamentModel
import account.models as accountmodels


class Tournament(AbstractGame, Logger):
    def __init__(self, player: PlayerInterface):
        AbstractGame.__init__(self, creator=player)
        Logger.__init__(self)

        self.__players: List[PlayerInterface] = []
        self.__games: List[Game] = []
        self.__gamemodel: 'TournamentModel' | None = None

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

        self.log("Tournament started")

        # wait for one game to finish
        while not game0.isFinished() and not game1.isFinished():
            time.sleep(1)

        # get the first winner and start the next game
        self.log("First game finished")
        winner0 = game0.getWinner() if game0.isFinished() else game1.getWinner()
        remaining_game = game0 if not game0.isFinished() else game1

        if winner0 is None:
            self.error("First game finished because a player left, stopping tournament")
            await self._setFinished()
            return


        game3 = Game(winner0)
        self.__games.append(game3)
        await game3.update()

        # wait for the remaining game to finish
        while not remaining_game.isFinished():
            time.sleep(1)

        # get the second winner and start the last game
        self.log("Second game finished")
        winner1 = remaining_game.getWinner()
        if winner1 is None:
            self.error("Second game finished because a player left, stopping tournament")
            await self._setFinished()
            return

        # start last game
        self.log("Starting last game")
        await game3.join(winner1)
        game3.start()

        while not game3.isFinished():
            time.sleep(1)

        self.log("Last game finished")
        winner3 = game3.getWinner()
        if winner3 is None:
            self.error("Last game finished because a player left, stopping tournament")
            await self._setFinished()
            return

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
        self.__gamemodel = dbentry

    async def redirectClients(self):
        if self.__gamemodel is None:
            return

        data = {
            "method": "redirect_game",
            "status": True,
            "url": f"/tournament/{self.__gamemodel.id}"
        }

        self.log(f"Redirecting clients to {data['url']}")
        for player in self.__players:
            await player.getUpdateCallback()(data)
