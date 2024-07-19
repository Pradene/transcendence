from abc import ABC
from game.gameutils.IntVector import IntVector


class GameModifier(ABC):
    def __init__(self):
        pass

    def getVector(self) -> IntVector:
        return IntVector([0, 0])

    def modifyBall(self, ball):
        pass

    def modifierType(self) -> str:
        pass

    def isActive(self) -> bool:
        return False
