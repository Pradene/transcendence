from typing import List, Tuple
from game.gameutils.PlayerInterface import PlayerInterface, PADDLE_HEIGHT, PADDLE_WIDTH
from game.gameutils.IntVector import IntVector
from game.gameutils.defines import *

import random
import math
import logging


def genStartVector() -> IntVector:
    """Generates a random starting vector for the ball"""

    logging.info("Generating new vector")

    angle = random.uniform(0, math.pi * 2)
    while math.fabs(math.sin(angle)) < 0.1 or math.fabs(math.sin(angle)) > 0.9:
        angle = random.uniform(0, math.pi)

    sin = math.sin(angle)
    cos = math.cos(angle)
    return IntVector([cos, sin])

class Ball:
    def __init__(self):
        logging.info("[Ball]: in ctor")
        self.__position: list[int] = BALL_BASE_POSITION.copy()
        self.__direction: IntVector = genStartVector()
        self.__speed: float = BALL_SPEED
        self.__finished: bool = False

    def getPosition(self) -> list[int]:
        """Returns the position of the ball"""

        return self.__position.copy()

    def getX(self) -> int:
        return self.__position[0]

    def getY(self) -> int:
        return self.__position[1]

    def incrSpeed(self) -> None:
        """Increases the speed of the ball, should be called after hitting a paddle"""

        self.__speed += BALL_SPEED_INCREMENT

    def __revX(self, arr: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        narr = [(-x, y) for x, y in arr]
        self.__direction.reverseX()
        return narr

    def __revY(self, arr: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        narr = [(x, -y) for x, y in arr]
        self.__direction.reverseY()
        return narr
    
    def isFinished(self) -> bool:
        """Did the current ball hit the left or right wall"""

        return self.__finished
    
    def finishBall(self) -> None:
        """Finish the ball"""

        self.__finished = True

    def computeNext(self, p1: PlayerInterface, p2: PlayerInterface) -> None:
        ispeed = int(self.__speed)
        arr = self.__direction.computeMoves(ispeed)
        p1.setBallSpeed(ispeed)
        p2.setBallSpeed(ispeed)

        while len(arr) > 0 and not self.isFinished():
            x, y = arr[0]

            #check hit p1 paddle horizontally
            if self.getX() == p1.getX() + PADDLE_WIDTH and x < 0 and self.getY() >= p1.getY() and self.getY() <= p1.getY() + PADDLE_HEIGHT:
                arr = self.__revX(arr)
                self.incrSpeed()
            #check hit p2 paddle horizontally
            elif self.getX() + BALL_SIZE == p2.getX() and x > 0 and self.getY() >= p2.getY() and self.getY() <= p2.getY() + PADDLE_HEIGHT:
                arr = self.__revX(arr)
                self.incrSpeed()
            #check hit p1 or p2 vertically
            elif self.__hitPlayer(y, p1) or self.__hitPlayer(y, p2):
                arr = self.__revY(arr)
            #check hit top wall
            elif self.getY() == 0 and y < 0:
                arr = self.__revY(arr)
            #check hit bottom wall
            elif self.getY() == SCREEN_HEIGHT - BALL_SIZE and y > 0:
                arr = self.__revY(arr)
            #check hit right wall
            elif self.getX() == SCREEN_WIDTH - BALL_SIZE:
                p1.incrPoints()
                self.finishBall()
                break
            #check hit left wall
            elif self.getX() == 0:
                p2.incrPoints()
                self.finishBall()
                break

            x, y = arr[0]
            arr = arr[1:] if len(arr) > 1 else []
            self.__position[0] += x
            self.__position[1] += y
            p1.move()
            p2.move()

    def __hitPlayer(self, y, player: PlayerInterface) -> bool:
        cx = self.getX()
        px = player.getX()

        if y != 0 and cx > px and cx < px + PADDLE_WIDTH:
            if y == -1 and self.getY() == player.getY() + PADDLE_HEIGHT:
                return True
            elif y == 1 and self.getY() + BALL_SIZE == player.getY():
                return True
        return False
