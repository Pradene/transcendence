import __future__
import logging
import typing
from utils.logger import Logger

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer
    from account.models import CustomUser
    from chat.models import Message


class Duel:
    def __init__(self, users: typing.Tuple['CustomUser', 'CustomUser'], duel_message: 'Message'):
        self.users: typing.Tuple['CustomUser', 'CustomUser'] = users
        self.message: 'Message' = duel_message

    def get_opponent(self, user: 'CustomUser'):
        return self.users[1] if user.id != self.users[1].id else self.users[0]

    def __str__(self):
        return f"{self.users[0].username}:{self.users[1].username}"


class DuelManager(Logger):
    def __init__(self):
        super().__init__()
        self.duels: typing.List[Duel] = []

    def create_duel(self, users: typing.Tuple['CustomUser', 'CustomUser'], message: 'Message') -> bool:
        if self.get_duel(users[0]) is not None or self.get_duel(users[1]) is not None:
            self.error(f"duel {users[0].username}:{users[1].username} already exists")
            self.display()
            return False

        self.log(f"duel {users[0].username}:{users[1].username} does not exists, creating")
        self.duels.append(Duel(users, message))
        self.display()
        return True

    def get_duel(self, user: 'CustomUser') -> Duel | None:
        self.display("looking for duel")
        for duel in self.duels:
            if user in duel.users:
                return duel
        return None

    def remove_duel(self, duel: Duel):
        self.duels.remove(duel)
        self.display()

    def display(self, message: str = ""):
        self.info(f"{message} {[duel.__str__() for duel in self.duels].__str__()}")


DUELMANAGER: DuelManager = DuelManager()
