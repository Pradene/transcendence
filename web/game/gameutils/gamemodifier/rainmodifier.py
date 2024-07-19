from game.gameutils.IntVector import IntVector
from gamemodifier import GameModifier


class RainModifier(GameModifier):
    def __init__(self, strength: float):
        super().__init__()
        self.__strength: float = strength

    def getVector(self) -> IntVector:
        return IntVector([0, self.__strength])

    def modifierType(self) -> str:
        return "Rain"
