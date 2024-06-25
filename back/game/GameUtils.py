from typing import Callable, Union


class PlayerInterface:
    def __init__(self, name: str, callback: Callable):
        self.__name: str = name
        self.__callback: Union[Callable, None] = callback
        self.__position: list[int] = [0, 0]
        self.__joined: bool = False

    def getName(self) -> str:
        """Returns the name of the player"""

        return self.__name

    def setName(self, name: str) -> None:
        """Sets the name of the player"""

        self.__name = name

    def getCallback(self) -> Union[Callable, None]:
        """Returns the callback of the player"""

        return self.__callback

    def setCallback(self, callback: Callable) -> None:
        """Sets the callback of the player"""

        self.__callback = callback

    def getPosition(self) -> list[int]:
        """Returns the position of the player"""

        return self.__position

    def setPosition(self, position: list[int]):
        """Sets the position of the player"""

        self.__position = position

    def haveJoined(self) -> bool:
        """Returns whether the player has joined the game"""

        return self.__joined

    def setJoined(self, joined: bool) -> None:
        """Sets whether the player has joined the game"""

        self.__joined = joined

    def getX(self) -> int:
        """Returns the x position of the player"""

        return self.__position[0]

    def getY(self) -> int:
        """Returns the y position of the player"""

        return self.__position[1]

    def setY(self, y: int):
        """Sets the y position of the player"""

        self.__position[1] = y


class Ball:
    def __init__(self):
        self.__position: list[int] = [0, 0]
        self.__direction: list[int] = [1, 1]
        self.__speed: int = 5

    def getPosition(self) -> list[int]:
        """Returns the position of the ball"""

        return self.__position.copy()

    def incrSpeed(self) -> None:
        """Increases the speed of the ball, should be called after hitting a paddle"""

        self.__speed += 1

    def computeNext(self, p1: PlayerInterface, p2: PlayerInterface) -> None:
        pass

    def __doesHit(self, p: PlayerInterface) -> bool:
        if self.__position[0] < p.getX() and self.__direction[0] > 0:
            pass
        elif self.__position[0] > p.getX() and self.__direction[0] < 0:
            pass
        return False
