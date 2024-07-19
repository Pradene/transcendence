import random

from game.gameutils.gamemodifier.gamemodifier import GameModifier


class LightnightModifier(GameModifier):
    def __init__(self, probability: float = 0.01):
        super().__init__()
        self.__probability: float = probability
        self.__active: bool = False

    def modifyBall(self, ball):
        from game.gameutils.Ball import Ball

        b: Ball = ball
        if random.random() < self.__probability:
            b.finishBall()
            self.__active = True
        else:
            self.__active = False

    def modifierType(self) -> str:
        return "Lightnight"

    def isActive(self) -> bool:
        if self.__active:
            self.__active = False
            return True
        return False
