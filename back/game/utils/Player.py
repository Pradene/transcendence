import typing
import logging

from game.utils.defines import *
from game.utils.Vector import Vector2


class Player:
    def __init__(self, id, pos_x = 0, pos_y = 0):
        self.id = id
        self.position = Vector2(pos_x, pos_y)
        self.movement = 'NONE'

        logging.info(f'player id: {self.id}')
        logging.info(f'player position: {self.position}')

    def setMovement(self, movement):
        if movement != "UP" and movement != "DOWN" and movement != "NONE":
            raise ValueError("Invalid movement")
        
        self.movement = movement

    def move(self):
        speed = PADDLE_SPEED
        if self.movement == "UP":
            self.position.y -= speed
            if self.position.y < -300 + PADDLE_HEIGHT / 2:
                self.position.y = -300 + PADDLE_HEIGHT / 2
        elif self.movement == "DOWN":
            self.position.y += speed
            if self.position.y > 300 - PADDLE_HEIGHT / 2:
                self.position.y = 300 - PADDLE_HEIGHT / 2

# class Player:
#     def __init__(self, name: str, updateCallback: Callable, deleteGameCallback: Callable):
#         self.__name: str = name
#         self.__movement: str = "NONE"
#         self.__updateCallback: Callable = updateCallback
#         self.__deleteGameCallback: Callable = deleteGameCallback # callback to delete the game from the player
#         self.__position: List[float] = [0, 0]
#         self.__joined: bool = False
#         self.__ballspeed: int = 5 # the speed of the ball, is used to compute the by how much the paddle should move at each frame
#         self.__points: int = 0
#         self.current_game: Union[Game | Tournament | None] = None

#     def getName(self) -> str:
#         """Returns the name of the player"""

#         return self.__name

#     def setName(self, name: str) -> None:
#         """Sets the name of the player"""

#         self.__name = name

#     def getMovement(self) -> str:
#         """Returns the movement of the player"""

#         return self.__movement
    
#     def setMovement(self, movement: str) -> None:
#         """Sets the movement of the player"""

#         if movement != "UP" and movement != "DOWN" and movement != "NONE":
#             raise ValueError("Invalid movement")
        
#         self.__movement = movement

#     def getUpdateCallback(self) -> Callable:
#         """Returns the callback of the player"""

#         return self.__updateCallback
    
#     def getDeleteGameCallback(self) -> Callable:
#         """Returns the delete game callback of the player"""

#         return self.__deleteGameCallback

#     def getPosition(self) -> List[int]:
#         """Returns the position of the player"""

#         return [int(x) for x in self.__position]
    
#     def setPosition(self, position: List[int]):
#         """Sets the position of the player"""

#         self.__position = position

#     def haveJoined(self) -> bool:
#         """Returns whether the player has joined the game"""

#         return self.__joined

#     def setJoined(self, joined: bool) -> None:
#         """Sets whether the player has joined the game"""

#         self.__joined = joined

#     def getX(self) -> int:
#         """Returns the x position of the player"""

#         return self.__position[0]

#     def getY(self) -> int:
#         """Returns the y position of the player"""

#         return self.__position[1]

#     def setY(self, y: int):
#         """Sets the y position of the player"""

#         self.__position[1] = y

#     def setBallSpeed(self, speed: int):
#         """Sets the speed of the ball"""

#         self.__ballspeed = speed

#     def getPoints(self) -> int:
#         """Returns the points of the player"""

#         return self.__points
    
#     def getScore(self) -> int:
#         """Returns the score of the player"""

#         return self.__points

#     def setScore(self, score: int) -> None:
#         """Sets the score of the player"""

#         self.__points = score
    
#     def incrPoints(self) -> None:
#         self.__points += 1

#     def won(self) -> bool:
#         return self.__points >= POINTS_TO_WIN
    
#     def move(self):
#         """Moves the player"""
    
#         speed: float = PADDLE_SPEED / self.__ballspeed
#         if self.__movement == "UP":
#             self.__position[1] -= speed
#             if self.__position[1] < 0:
#                 self.__position[1] = 0
#         elif self.__movement == "DOWN":
#             self.__position[1] += speed
#             if self.__position[1] > SCREEN_HEIGHT - PADDLE_HEIGHT:
#                 self.__position[1] = SCREEN_HEIGHT - PADDLE_HEIGHT

