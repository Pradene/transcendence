import logging

from abc import ABC, abstractmethod
from typing import Union

from threading import RLock

from game.gameutils.PlayerInterface import PlayerInterface

class AbstractGame(ABC):
    def __init__(self, creator: PlayerInterface):
        self.__id = creator.getName()

        self._winner: Union[PlayerInterface, None] = None
        self._finished: bool = False
        self._finishedLock: RLock = RLock()

        logging.log(logging.INFO, f"Game {self.getGameid()} created")

    @abstractmethod
    async def join(self, player: PlayerInterface) -> None:
        pass

    @abstractmethod
    def start(self) -> None:
        pass

    @abstractmethod
    def quit(self) -> None:
        pass

    @abstractmethod
    async def update(self) -> None:
        pass

    @abstractmethod
    def saveToDB(self) -> None:
        pass

    def isFinished(self) -> bool:
        with self._finishedLock:
            return self._finished

    async def _setFinished(self, winner: Union[PlayerInterface, None] = None) -> None:
        with self._finishedLock:
            self._finished = True
            self._winner = winner
            await self.update()

    def getWinner(self) -> Union[PlayerInterface, None]:
        return self._winner

    def getGameid(self) -> str:
        return self.__id