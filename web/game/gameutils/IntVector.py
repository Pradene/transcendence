from typing import List, Tuple
import logging

class IntVector:
    def __init__(self, vector: list[float]):
        self.x: float = vector[0]
        self.y: float = vector[1]

    def reverseX(self) -> None:
        self.x = -self.x

    def reverseY(self) -> None:
        self.y = -self.y

    def getVector(self) -> list[float]:
        """Returns the vector as a list"""

        return [self.x, self.y]

    def getNorm(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def normalize(self) -> tuple[float, float]:
        norm = self.getNorm()
        return (self.x / norm, self.y / norm)

    def setNorm(self, norm: float) -> None:
        x, y = self.normalize()
        self.x = x * norm
        self.y = y * norm

    def __getitem__(self, idx: int) -> float:
        return self.getVector()[idx]

    def __add__(self, other: 'IntVector') -> 'IntVector':
        return IntVector([self.x + other.x, self.y + other.y])

    def computeMoves(self) -> list[Tuple[int, int]]:
        """Computes the moves to reach the destination"""
        x, y = self.normalize()
        absx: int = abs(x)
        absy: int = abs(y)

        ratio: float = absx / absy
        bratio = ratio

        n = 0
        arr: List[Tuple[int, int]] = []

        for i in range(0, int(self.getNorm())):
            if n < ratio:
                arr.append((1 if x > 0 else -1, 0))
                n += 1
            else:
                arr.append((0, 1 if y > 0 else -1))
                ratio += bratio

        return arr

    def copy(self):
        nvector = [self.x, self.y]
        return IntVector(nvector)