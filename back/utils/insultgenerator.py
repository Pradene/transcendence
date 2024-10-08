import typing
import random

from utils.logger import Logger

class InsultGenerator(Logger):
    instance: None | 'InsultGenerator' = None

    def __init__(self):
        super.__init__()
        self.__insults: typing.List[str] = []
        
    def __parse_insult_file(self):
        with open("/app/insults.txt") as file:
            self.__insults.append(file.readline())

    def get_random_insult(self) -> str:
        with random.randint(0, len(self.__insults) - 1) as line:
            return self.__insults[line]

    @staticmethod
    def get():
        if InsultGenerator.instance is None:
            InsultGenerator.instance = InsultGenerator()
        return InsultGenerator.instance