import __future__
import logging
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer
    from account.models import CustomUser
    from chat.models import Message


class Duel:
    def __init__(self, users: typing.Tuple['CustomUser', 'CustomUser'], duel_message: 'Message'):
        self.users = users
        self.message = duel_message

    def get_opponent(self, user: 'CustomUser'):
        return self.users[1] if user.id != self.users[1].id else self.users[0]

class DuelManager:
    def __init__(self):
        self.duels: typing.List[Duel] = []

    def create_duel(self, users: typing.Tuple['CustomUser', 'CustomUser'], message: 'Message') -> bool:
        if self.get_duel(users[0]) is not None or self.get_duel(users[1]) is not None:
            return False

        self.duels.append(Duel(users, message))
        return True

    def get_duel(self, user: 'CustomUser') -> Duel | None:
        for duel in self.duels:
            if user in duel.users:
                return duel
        return None

    def remove_duel(self, duel: Duel):
        self.duels.remove(duel)

DUELMANAGER: DuelManager = DuelManager()
