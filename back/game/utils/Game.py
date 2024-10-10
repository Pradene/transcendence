import logging
import asyncio
import time
import typing

from typing import Union
from threading import Thread, Lock

from game.utils.Player import Player
from game.utils.Ball import Ball
from game.utils.defines import *
from game.utils.abstractgame import AbstractGame

from game import models as gamemodels
from account import models as accountmodels
from chat.models import Message

FPS: int = 30
TIME_TO_SLEEP: float = (1 / FPS)


class Game(AbstractGame):
    def __init__(self, p1: Player, related_duel: Message | None = None):
        logging.info("[Game]: in ctor")
        super().__init__(p1)

        self.__p1: Union[Player, None] = p1
        self.__p2: Union[Player, None] = None
        self.__ball: Ball = Ball()
        self.__dataLock: Lock = Lock()

        self.__th: Thread = Thread(target=asyncio.run, args=(self.__gameLoop(),))

        self.__p1.setPosition(P1_POSITION.copy())
        self.__p1.setJoined(True)
        self.__p1.setScore(0)

        self.__score: tuple[int] = (0, 0)

        self.__gamemodel: Union[gamemodels.GameModel | None] = None

        self.__related_duel = related_duel


    def __del__(self):
        if self.__th is not None and self.__th.is_alive():
            self.__th.join()

    async def join(self, p2: Player) -> None:
        """Join a player to the game"""

        logging.info(f"[Game]: Player {p2.getName()} joining game {self.getGameid()}")

        if self.__p2 is not None:
            logging.error(f"[Game]: Game is full, aborting")
            raise RuntimeError("Game is full")

        self.__p2 = p2
        self.__p2.setPosition(P2_POSITION.copy())
        self.__p2.setJoined(True)
        self.__p2.setScore(0)

        logging.info(f"[Game]: Player joined")
        # send game data to clients
        await self.update()

    async def __gameLoop(self) -> None:
        logging.info(f"Game {self.getGameid()} started")

        # wait 5 seconds for game start
        for i in range(0, 5):
            await self.update(i + 1)
            time.sleep(1)

        last_frame = time.time()
        while self.__p1 is not None and self.__p2 is not None and not self.isFinished():
            if self.__ball.isFinished():
                self.__ball = Ball()
                self.__p1.setPosition(P1_POSITION.copy())
                self.__p2.setPosition(P2_POSITION.copy())

                if self.__p1.won() or self.__p2.won():
                    self.__score = (self.__p1.getScore(), self.__p2.getScore())
                    await self._setFinished(self.__p1 if self.__p1.won() else self.__p2)
                    break

            self.__dataLock.acquire()
            self.__ball.computeNext(self.__p1, self.__p2)
            self.__dataLock.release()

            await self.update()
            ctime = time.time()
            if ctime - last_frame < TIME_TO_SLEEP:
                # logging.info(f"Sleeping for {TIME_TO_SLEEP - (ctime - last_frame)}")
                await asyncio.sleep(TIME_TO_SLEEP - (ctime - last_frame))
            last_frame = ctime

    async def update(self, timer: Union[int | None] = None) -> None:
        """Send game datas to clients, and delete the game if it's finished"""


        # logging.info("[Game]: Updating clients")
        # Send game datas to client
        data = self.__toJSON(timer)

        if self.__p1 is not None:
            await self.__p1.getUpdateCallback()(data[0])
        if self.__p2 is not None:
            await self.__p2.getUpdateCallback()(data[1])

    def __toJSON(self, timer: Union[int | None] = None) -> List[dict]:
        """Return the game data in JSON format"""

        self.__dataLock.acquire()

        status = "finished" if self.isFinished() else "waiting" if not self.isStarted() else "running"

        # data for first player
        dic1 = {
            "method": "update_game",
            "status": True,
            "data":   {
                "status":         status,
                "gameid":         self.getGameid(),
                "current_player": {
                    "position": self.__p1.getPosition().copy(),
                    "score":    self.__p1.getScore(),
                    "name":		self.__p1.getName(),
                    "username": self.__p1.getName()
                },
                "opponent":       {
                    "position": self.__p2.getPosition().copy() if self.__p2 is not None else P2_POSITION.copy(),
                    "score":    self.__p2.getScore() if self.__p2 is not None else 0,
                    "name":		self.__p2.getName() if self.__p2 is not None else "?",
                    "username": self.__p2.getName() if self.__p2 is not None else "?"
                },
                "ball":           self.__ball.getPosition()
            }
        }

        # data for second player
        dic2 = {
            "method": "update_game",
            "status": True,
            "data":   {
                "status":         status,
                "gameid":         self.getGameid(),
                "current_player": {
                    "position": self.__p2.getPosition().copy() if self.__p2 is not None else P2_POSITION.copy(),
                    "score":    self.__p2.getScore() if self.__p2 is not None else 0,
                    "name":		self.__p2.getName() if self.__p2 is not None else "?",
                    "username": self.__p2.getName() if self.__p2 is not None else "?"
                },
                "opponent":       {
                    "position": self.__p1.getPosition().copy(),
                    "score":    self.__p1.getScore(),
                    "name":		self.__p1.getName(),
                    "username": self.__p1.getName()
                },
                "ball":           self.__ball.getPosition()
            }
        }

        #reverse position so that each player sees itself at right side
        dic2["data"]["current_player"]["position"][0] = P1_POSITION[0]
        dic2["data"]["opponent"]["position"][0] = P2_POSITION[0]
        dic2["data"]["ball"][0] = SCREEN_WIDTH - dic2["data"]["ball"][0]

        if timer is not None:
            dic1["data"]["timer"] = timer
            dic2["data"]["timer"] = timer

        self.__dataLock.release()

        return [dic1, dic2]

    def gameInfo(self) -> dict:
        self.__dataLock.acquire()
        dic: dict = {
            "creator":      self.__p1.getName(),
            "player_count": 2 if self.__p2 else 1,
            "is_full":      True if self.__p2 else False
        }
        self.__dataLock.release()

        return dic

    async def quit(self) -> None:
        """Terminate the game and update the clients"""

        await self._setFinished()

    def removeFromClients(self):
        """Remove the game from the clients, so they can join another game"""

        self.__p1.getDeleteGameCallback()()
        self.__p2.getDeleteGameCallback()()

    def isStarted(self) -> bool:
        """Return True if the game loop is started"""

        return self.__th.is_alive()

    def start(self) -> None:
        """Start the game loop"""

        self.__th.start()
        logging.info(f"Thread for game {self.getGameid()} started")

    def saveToDB(self) -> None:
        """Save the game to the database"""

        if self.getWinner() is None:
            return

        user1 = accountmodels.CustomUser.objects.get(username=self.__p1.getName())
        user2 = accountmodels.CustomUser.objects.get(username=self.__p2.getName())
        winner = accountmodels.CustomUser.objects.get(username=self.getWinner().getName())

        dbentry = gamemodels.GameModel.objects.create(
            user1 = user1,
            user2 = user2,
            user1_score = self.__score[0],
            user2_score = self.__score[1],
            winner = winner
        )
        dbentry.save()

        if self.__related_duel is not None:
            self.__related_duel.duel = dbentry
            self.__related_duel.save()

        self.__gamemodel = dbentry

    def getGameModel(self) -> Union[gamemodels.GameModel, None]:
        """Return the game model"""

        return self.__gamemodel

    async def redirectClients(self):
        if self.__gamemodel is None:
            return

        data = {
            "method": "redirect_game",
            "status": True,
            "gameid": self.__gamemodel.id
        }

        await self.__p1.getUpdateCallback()(data)
        await self.__p2.getUpdateCallback()(data)
