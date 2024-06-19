import asyncio
from threading import Thread
import typing
import logging


class PlayerInterface:
    def __init__(self, name: str, callback: typing.Callable):
        self.__name: str = name
        self.__callback: typing.Callable = callback
        self.__position: list[int] = [0, 0]

    def getName(self) -> str:
        return self.__name

    def setName(self, name: str) -> None:
        self.__name = name

    def getCallback(self) -> typing.Callable:
        return self.__callback

    def setCallback(self, callback: typing.Callable) -> None:
        self.__callback = callback

    def getPosition(self) -> list[int]:
        return self.__position

    def setPosition(self, position: list[int]):
        self.__position = position

    def setY(self, y: int):
        self.__position[1] = y


class Game:
    def __init__(self, p1: PlayerInterface):
        self.__p1: PlayerInterface = p1
        self.__p2: PlayerInterface = PlayerInterface('p2', lambda gameData: None)
        self.__ball: list[int] = [400, 300]
        self.__ready: bool = False

        self.__p1.setPosition([8, 270])
        self.__p2.setPosition([800 - 16, 270])

    async def join(self, p2: PlayerInterface) -> PlayerInterface:
        self.__p2.setName(p2.getName())
        self.__p2.setCallback(p2.getCallback())

        await self.update()

        return self.__p2

    async def update(self) -> None:
        # Send game datas to client
        data = self.toJSON()

        await self.__p1.getCallback()(data)
        await self.__p2.getCallback()(data)

    def toJSON(self) -> dict:
        dic = {
            "status": self.__ready,
            "p1": self.__p1.getPosition(),
            "p2": self.__p2.getPosition(),
            "ball": self.__ball
        }
        return dic

    def gameInfo(self) -> dict:
        return dict({"status": self.__ready, "creator": self.__p1.getName()})