import logging

from abc import ABC, abstractmethod
from typing import Union

from threading import RLock

from game.utils.Player import Player

class AbstractGame(ABC):
    def __init__(self, creator: Player):
        self.__id = creator.getName()

        self._winner: Union[Player, None] = None
        self._finished: bool = False
        self._finishedLock: RLock = RLock()

        logging.log(logging.INFO, f"[AbstractGame]: Game {self.getGameid()} created")

    @abstractmethod
    async def join(self, player: Player) -> None:
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

    async def _setFinished(self, winner: Union[Player, None] = None) -> None:
        with self._finishedLock:
            self._finished = True
            self._winner = winner
            await self.update()

    def getWinner(self) -> Union[Player, None]:
        return self._winner

    def getGameid(self) -> str:
        return self.__id