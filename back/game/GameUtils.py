from typing import Callable, Union, List, Tuple


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
    def __init__(self, vector: list[int]):
        self.x: int = vector[0]
        self.y: int = vector[1]

    def reverseX(self) -> None:
        self.x *= -1

    def reverseY(self) -> None:
        self.y *= -1

    def getVector(self) -> list[int]:
        return [self.x, self.y]

    def __getitem__(self, idx: int) -> int:
        return self.getVector()[idx]

    def computeMoves(self, moves: int) -> list[Tuple[int, int]]:
        """Computes the moves to reach the destination"""

        ratio: float = self.x / self.y
        bratio = ratio

        n = 0
        moves: List[Tuple[int, int]] = []

        for i in range(0, moves):
            if n < ratio:
                moves.append((1, 0))
                n += 1
            else:
                moves.append((0, 1))
                ratio += bratio

        return moves

class Ball:
    def __init__(self):
        self.__position: list[int] = [0, 0]
        self.__direction: IntVector = IntVector([1, 1])
        self.__speed: int = 5

    def getPosition(self) -> list[int]:
        """Returns the position of the ball"""

        return self.__position.copy()

    def getX(self) -> int:
        return self.__position[0]

    def getY(self) -> int:
        return self.__position[1]

    def incrSpeed(self) -> None:
        """Increases the speed of the ball, should be called after hitting a paddle"""

        self.__speed += 1

    def __revX(self, arr: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        narr = [(x * -1, y) for x, y in arr]
        return narr

    def __revY(self, arr: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        narr = [(x, y * -1) for x, y in arr]
        return narr

    def computeNext(self, p1: PlayerInterface, p2: PlayerInterface) -> None:
        #TODO Implement this method
        arr = self.__direction.computeMoves(self.__speed)

        while len(arr) > 0:
            x, y = arr[0]
            arr = arr[1:] if len(arr) > 1 else []

            #check hit p1 paddle horizontally
            if self.getX() == p1.getX() + 8 and x < 0:
                self.__revX(arr)
                x *= -1
            #check hit p2 paddle horizontally
            elif self.getX() + 4 == p2.getX() and x > 0:
                self.__revX(arr)
                x *= -1
            #check hit top wall
            elif self.getY() == 0 and y < 0:
                self.__revY(arr)
                y *= -1
            #check hit bottom wall
            elif self.getY() == 800 - 4 and y > 0:
                self.__revY(arr)
                y *= -1

            self.__position[0] += x
            self.__position[1] += y
            #TODO move paddles