import __future__
import logging
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer
    from account.models import CustomUser


class Duel:
    def __init__(self, p1: 'CustomUser', p2: 'CustomUser'):
        self.players: typing.List['CustomUser'] = [p1, p2]

        self.__accept: typing.Dict['CustomUser', bool] = {}
        self.__accept[p1] = True
        self.__accept[p2] = False

    def accept(self, player: 'CustomUser'):
        if not player in self.players:
            return

        self.__accept[player] = True

    def refuse(self, player: 'CustomUser'):
        if not player in self.players:
            return

        self.__accept[player] = False

    def is_ready(self):
        return self.__accept[self.players[0]] and self.__accept[self.players[1]]

    def are_in(self, p1: 'CustomUser', p2: 'CustomUser'):
        return p1 in self.players and p2 in self.players

    def is_in(self, player):
        return player in self.players

    def get_opponent(self, player: 'CustomUser') -> 'CustomUser':
        return self.players[0] if player == self.players[1] else self.players[1]


class DuelManager:
    def __init__(self):
        self.duels: typing.List[Duel] = []

    def invite(self, challenger: 'CustomUser', challenged: 'CustomUser'):
        for duel in self.duels:
            if duel.are_in(challenger, challenged):
                return

        self.duels.append(Duel(challenger, challenged))
        logging.info(f"Player {challenger.username} has invited {challenged.username} to a duel.")
        logging.info(f"Current duels: {self.duels}")

    def get_duel(self, p1: 'CustomUser', p2: 'CustomUser') -> Duel | None:
        for duel in self.duels:
            if duel.are_in(p1, p2):
                return duel

        return None

    def get_duels(self, player: 'CustomUser') -> typing.List[Duel]:
        l = []

        for duel in self.duels:
            if duel.is_in(player):
                l.append(duel)

        return l

    def get_active_duel(self, player: 'CustomUser') -> Duel | None:
        actives = self.get_duels(player)

        for duel in actives:
            if duel.is_ready():
                return duel

        return None

    def remove_duel(self, duel: Duel):
        self.duels.remove(duel)

    def remove_duels(self, duels: typing.List[Duel]):
        for duel in duels:
            self.duels.remove(duel)


DUELMANAGER: DuelManager = DuelManager()
