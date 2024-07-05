import logging
import asyncio
from typing import Union, List, Callable
from threading import Thread, Lock

from game.gameutils.PlayerInterface import PlayerInterface
from game.gameutils.Ball import Ball
from game.gameutils.defines import *


FPS: int = 24
TIME_TO_SLEEP: float = (1 / FPS)


class Game:
    def __init__(self, p1: PlayerInterface):
        self.__p1: Union[PlayerInterface, None] = p1
        self.__p2: Union[PlayerInterface, None] = None
        self.__ball: Ball = Ball()
        self.__dataLock: Lock = Lock()

        self.__th: Union[Thread, None] = None
        self.__finished: bool = False
        self.__finishedLock: Lock = Lock()
        self.__shouldDelete: bool = False

        self.__p1.setPosition(P1_POSITION.copy())
        self.__p1.setJoined(True)

    def __del__(self):
        self.__th.join()
        logging.log(logging.INFO, f"Game {self.getGameid()} deleted")

    def getGameid(self) -> str:
        return self.__p1.getName()

    async def join(self, p2: PlayerInterface) -> None:
        """Join a player to the game"""

        self.__p2 = p2
        self.__p2.setPosition(P2_POSITION.copy())
        self.__p2.setJoined(True)

        # send game data to clients
        await self.update()

        # logging.log(logging.INFO, f"{self.__p2.getName()} joined the game {self.getGameid()}")
        # start the game
        self.__th = Thread(target=asyncio.run, args=(self.__gameLoop(),))
        self.__th.start()

    async def __gameLoop(self) -> None:
        # logging.log(logging.INFO, f"Game {self.getGameid()} started")

        while self.__p1 is not None and self.__p2 is not None and not self.isFinished():
            if self.__ball.isFinished():
                self.__ball = Ball()
                self.__p1.setPosition(P1_POSITION.copy())
                self.__p2.setPosition(P2_POSITION.copy())

                if self.__p1.won() or self.__p2.won():
                    self.__finish()
                    break

            self.__dataLock.acquire()
            self.__ball.computeNext(self.__p1, self.__p2)
            self.__dataLock.release()

            await self.update()
            await asyncio.sleep(TIME_TO_SLEEP)

    def isFinished(self) -> bool:
        self.__finishedLock.acquire()
        finished = self.__finished
        self.__finishedLock.release()

        return finished

    async def __finish(self) -> None:
        self.__finishedLock.acquire()

        logging.log(logging.INFO, f"Game {self.getGameid()} finished")
        self.__finished = True
        await self.update()
        
        self.__finishedLock.release()

    async def update(self) -> None:
        """Send game datas to clients, and delete the game if it's finished"""

        # Send game datas to client
        data = self.__toJSON()

        if self.__p1 is not None:
            await self.__p1.getUpdateCallback()(data[0])
        if self.__p2 is not None:
            await self.__p2.getUpdateCallback()(data[1])

    def __toJSON(self) -> List[dict]:
        if self.isFinished():
            self.__shouldDelete = True

        self.__dataLock.acquire()
        # data for first player
        dic1 = {
            "method": "update_game",
            "status": True,
            "data":   {
                "status": "running" if not self.isFinished() else "finished",
                "gameid": self.getGameid(),
                "current_player": {
                    "position": self.__p1.getPosition().copy(),
                    "score": self.__p1.getScore()
                },
                "opponent": {
                    "position": self.__p2.getPosition().copy() if self.__p2 is not None else P2_POSITION.copy(),
                    "score": self.__p2.getScore() if self.__p2 is not None else 0
                },
                "ball": self.__ball.getPosition()
            }
        }

        # data for second player
        dic2 = {
            "method": "update_game",
            "status": True,
            "data":   {
                "status": "running" if not self.isFinished() else "finished",
                "gameid": self.getGameid(),
                "current_player": {
                    "position": self.__p2.getPosition().copy() if self.__p2 is not None else P2_POSITION.copy(),
                    "score": self.__p2.getScore() if self.__p2 is not None else 0
                },
                "opponent": {
                    "position": self.__p1.getPosition().copy(),
                    "score": self.__p1.getScore()
                },
                "ball": self.__ball.getPosition()
            }
        }
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

        self.__finish()
        await self.update()

    def removeFromClients(self):
        """Remove the game from the clients so they can join another game"""

        self.__p1.getDeleteGameCallback()()
        self.__p2.getDeleteGameCallback()()