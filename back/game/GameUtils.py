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

class IntVector:
	def __init__(self, x: int, y: int):
		self.x: int = x
		self.y: int = y

	def __init__(self, vector: list[int]):
		self.x: int = vector[0]
		self.y: int = vector[1]

	def reverseX() -> None:
		self.x *= -1

	def reverseY() -> None:
		self.y *= -1

	def getVector(self) -> list[int]:
		return [self.x, self.y]

	def __getitem__(self, idx: int) -> int:
		return self.getVector()[idx]


class Ball:
    def __init__(self):
        self.__position: list[int] = [0, 0]
		self.__direction: IntVector = IntVector(1, 1)
        self.__speed: int = 5

    def getPosition(self) -> list[int]:
        """Returns the position of the ball"""

        return self.__position.copy()

    def incrSpeed(self) -> None:
        """Increases the speed of the ball, should be called after hitting a paddle"""

        self.__speed += 1

    def computeNext(self, p1: PlayerInterface, p2: PlayerInterface) -> None:
        //TODO Implement this method
		tomove: IntVector = IntVector([x * self.__speed for x in self.__direction.getVector()])
		idx: int = 0 if tomove[0] > tomove[1] else 1

		while tomove[0] > 0 and tomove[1] > 0:
			if tomove[idx] > 0:
				self.__position[idx] += 1
				tomove[idx] -= 1
