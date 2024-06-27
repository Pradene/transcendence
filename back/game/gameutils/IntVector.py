from typing import List, Tuple
import logging

class IntVector:
    def __init__(self, vector: list[int]):
        self.x: int = vector[0]
        self.y: int = vector[1]

    def reverseX(self) -> None:
        self.x = -self.x

    def reverseY(self) -> None:
        self.y = -self.y

    def getVector(self) -> list[int]:
        return [self.x, self.y]

    def __getitem__(self, idx: int) -> int:
        return self.getVector()[idx]

    def computeMoves(self, moves: int) -> list[Tuple[int, int]]:
        """Computes the moves to reach the destination"""
        
        absx: int = abs(self.x)
        absy: int = abs(self.y)

        ratio: float = absx / absy
        bratio = ratio

        n = 0
        arr: List[Tuple[int, int]] = []

        for i in range(0, moves):
            if n < ratio:
                arr.append((1 if self.x > 0 else -1, 0))
                n += 1
            else:
                arr.append((0, 1 if self.y > 0 else -1))
                ratio += bratio

        return arr
