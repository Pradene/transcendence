from typing import List, Tuple
from game.gameutils.PlayerInterface import PlayerInterface, PADDLE_HEIGHT, PADDLE_WIDTH
from game.gameutils.IntVector import IntVector
from game.gameutils.defines import *
from game.gameutils.gamemodifier.gamemodifier import GameModifier

from enum import Enum

import random
import math


def genStartVector() -> IntVector:
    """Generates a random starting vector for the ball"""

    angle = random.uniform(0, math.pi)
    while math.sin(angle) < BALL_MIN_SIN or math.sin(angle) > BALL_MAX_SIN:
        angle = random.uniform(0, math.pi)

    sin = math.sin(angle) * 2 - 1
    cos = math.cos(angle) * 2 - 1
    return IntVector([cos, sin])


class Ball:
    def __init__(self):
        self.__position: list[float] = BALL_BASE_POSITION.copy()
        self.__direction: IntVector = genStartVector()
        self.__speed: float = BALL_SPEED
        self.__finished: bool = False

    def getPosition(self) -> list[int]:
        """Returns the position of the ball"""

        return [int(self.__position[0]), int(self.__position[1])]

    def getX(self) -> int:
        return int(self.__position[0])

    def getY(self) -> int:
        return int(self.__position[1])

    def incrSpeed(self) -> None:
        """Increases the speed of the ball, should be called after hitting a paddle"""

        self.__speed += BALL_SPEED_INCREMENT

    def __revX(self) -> None:
        self.__direction.reverseX()

    def __revY(self) -> None:
        self.__direction.reverseY()

    def isFinished(self) -> bool:
        """Did the current ball hit the left or right wall"""

        return self.__finished

    def finishBall(self) -> None:
        """Finish the ball"""

        self.__finished = True

    def genVector(self, modifiers: List[GameModifier]) -> IntVector:
        nvector = self.__direction.copy()
        for mod in modifiers:
            nvector += mod.getVector()

        return nvector

    def __move_by_one(self, vector: IntVector, current: float) -> float:
        lx, ly = vector.getVector()
        x, y = self.__position
        xratio: float = 1.0
        yratio: float = 1.0
        remaining: float = 1.0 - current

        # compute xratio
        if lx > 0:
            target = x + 1 if self.getX() == x else math.ceil(x)
            xratio = (target - x) / lx
        elif lx < 0:
            target = x - 1 if self.getX() == x else math.floor(x)
            xratio = (target - x) / lx

        # compute yratio
        if ly > 0:
            target = y + 1 if self.getY() == y else math.ceil(y)
            yratio = (target - y) / ly
        elif ly < 0:
            target = y - 1 if self.getY() == y else math.floor(y)
            yratio = (target - y) / ly

        # get the minimum ratio and update the position
        mratio = min(xratio, yratio, remaining)
        self.__position = [x + lx * mratio, y + ly * mratio]
        return current + mratio

    def computeNext(self, p1: PlayerInterface, p2: PlayerInterface, modifiers: List[GameModifier] = []) -> None:
        """Computes the next position of the ball"""

        # recompute the ball vector based on the speed
        ispeed = int(self.__speed)
        self.__direction.setNorm(ispeed)

        turn_vec: IntVector = self.genVector(modifiers)
        ratio = 0.0

        while ratio < 1 and not self.isFinished():
            lratio = self.__move_by_one(turn_vec, ratio)
            ratio += lratio

            # check hit p1 paddle horizontally
            if turn_vec.x < 0 and self.__hitP1Hor(p1):
                self.incrSpeed()
                self.__revX()
                turn_vec = self.genVector(modifiers)
            #check hit p1 paddle vertically
            elif turn_vec.y != 0 and self.__hitP2Vert(p1):
                self.__revY()
                turn_vec = self.genVector(modifiers)
            # check hit p2 paddle horizontally
            elif turn_vec.x > 0 and self.__hitP2Hor(p2):
                self.incrSpeed()
                self.__revX()
                turn_vec = self.genVector(modifiers)
            # check hit p2 paddle vertically
            elif turn_vec.y != 0 and self.__hitP2Vert(p2):
                self.__revY()
                turn_vec = self.genVector(modifiers)
            # check hit right or left wall
            elif self.getX() == 0 or self.getX() + BALL_SIZE == SCREEN_WIDTH:
                self.finishBall()
            # check hit top or bottom wall
            elif self.getY() == 0 or self.getY() + BALL_SIZE == SCREEN_HEIGHT:
                self.__revY()
                turn_vec = self.genVector(modifiers)

            p1.move(lratio)
            p2.move(lratio)

    def __hitP1Vert(self, p: PlayerInterface):
        if self.getY() + BALL_SIZE == p.getY() or self.getY() == p.getY() + PADDLE_HEIGHT:
            if p.getX() - BALL_SIZE <= self.getX() <= p.getX() + PADDLE_WIDTH:
                return True
        return False

    def __hitP2Vert(self, p: PlayerInterface):
        if self.getY() + BALL_SIZE == p.getY() or self.getY() == p.getY() + PADDLE_HEIGHT:
            if p.getX() - BALL_SIZE <= self.getX() <= p.getX() + PADDLE_WIDTH:
                return True
        return False

    def __hitP1Hor(self, p: PlayerInterface):
        if self.getX() == p.getX():
            if p.getY() - BALL_SIZE <= self.getY() <= p.getY() + PADDLE_HEIGHT:
                return True
        return False
    
    def __hitP2Hor(self, p: PlayerInterface):
        if self.getX() + BALL_SIZE == p.getX():
            if p.getY() - BALL_SIZE <= self.getY() <= p.getY() + PADDLE_HEIGHT:
                return True
        return False
