import math
import random

from game.gameutils.gamemodifier.gamemodifier import GameModifier
from game.gameutils.IntVector import IntVector


def genRandomWind() -> tuple[float, float]:
    rand_angle = random.uniform(0, math.pi)
    return (math.cos(rand_angle), math.sin(rand_angle))


class WindModifier(GameModifier):
    def __init__(self, windSpeed: float = 5.0):
        super().__init__()

        direction = genRandomWind()
        self.__vec: IntVector = IntVector([direction[0] * windSpeed, direction[1] * windSpeed])

    def getVector(self) -> IntVector:
        return self.__vec

    def modifyBall(self, ball):
        pass

    def modifierType(self) -> str:
        return "Wind"
