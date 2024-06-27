from typing import Callable, Union, List

PADDLE_SPEED: int = 5
PADDLE_WIDTH: int = 8
PADDLE_HEIGHT: int = 32

class PlayerInterface:
    def __init__(self, name: str, callback: Callable):
        self.__name: str = name
        self.__movement: str = "NONE"
        self.__callback: Union[Callable, None] = callback
        self.__position: List[float] = [0, 0]
        self.__joined: bool = False
        self.__ballspeed: int = 5 # the speed of the ball, is used to compute the by how much the paddle should move at each frame
        self.__points: int = 0

    def getName(self) -> str:
        """Returns the name of the player"""

        return self.__name

    def setName(self, name: str) -> None:
        """Sets the name of the player"""

        self.__name = name

    def getMovement(self) -> str:
        """Returns the movement of the player"""

        return self.__movement
    
    def setMovement(self, movement: str) -> None:
        """Sets the movement of the player"""

        if movement != "UP" and movement != "DOWN" and movement != "NONE":
            raise ValueError("Invalid movement")
        
        self.__movement = movement

    def getCallback(self) -> Union[Callable, None]:
        """Returns the callback of the player"""

        return self.__callback

    def setCallback(self, callback: Callable) -> None:
        """Sets the callback of the player"""

        self.__callback = callback

    def getPosition(self) -> List[int]:
        """Returns the position of the player"""

        return [int(x) for x in self.__position]
    
    def setPosition(self, position: List[int]):
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

    def setBallSpeed(self, speed: int):
        """Sets the speed of the ball"""

        self.__ballspeed = speed

    def getPoints(self) -> int:
        """Returns the points of the player"""

        return self.__points
    
    def incrPoints(self) -> None:
        self.__points += 1

    def move(self):
        """Moves the player"""
    
        speed: float = PADDLE_SPEED / self.__ballspeed
        if self.__movement == "UP":
            self.__position[1] -= speed
            if self.__position[1] < 0:
                self.__position[1] = 0
        elif self.__movement == "DOWN":
            self.__position[1] += speed
            if self.__position[1] > 800 - PADDLE_HEIGHT:
                self.__position[1] = 800 - PADDLE_HEIGHT
