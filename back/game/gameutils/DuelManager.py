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
<<<<<<< HEAD
            if challengedid in duel and challengerid in duel:
                logging.info(f"Player {challengerid} and {challengedid} are already in a duel.")
                return

        self.duels.append([challengerid, challengedid, False])
        logging.info(f"Player {challengerid} has invited {challengedid} to a duel.")
        logging.info(f"Current duels: {self.duels}")

    def accept(self, user: int, opponent: int) -> bool:
        for duel in self.duels:
            if user in duel and opponent in duel:
                duel[2] = True
                return True
        return False

    def decline(self, challengedid: int, challengerid: int):
        for duel in self.duels:
            if challengedid in duel and challengerid in duel:
                self.duels.remove(duel)
                logging.info(f"Player {challengerid} and {challengedid} have declined the duel.")

    def have_active_duel(self, playerid: int) -> bool:
        logging.info(f"[DuelManager]: Checking if player {playerid} has an active duel.")
        logging.info(f"[DuelManager]: Current duels: {self.duels}")
        for duel in self.duels:
            if playerid in duel:
                return duel[2]

    def remove_from_duels(self, playerid: int, onlynonactive: bool = False):
        if onlynonactive:
            for duel in self.duels:
                if playerid in duel and not duel[2]:
                    self.duels.remove(duel)
                    logging.info(f"Player {playerid} has been removed from duels.")
        else:
            for duel in self.duels:
                if playerid in duel:
                    self.duels.remove(duel)
                    logging.info(f"Player {playerid} has been removed from duels.")

    def get_opponent_id(self, playerid: int):
        for duel in self.duels:
            if duel[0] == playerid and duel[2]:
                return duel[1]
            elif duel[1] == playerid and duel[2]:
                return duel[0]
            
    def have_duel_with(self, p1: int, p2: int):
        for duel in self.duels:
            if p1 in duel and p2 in duel:
                return True
        return False
=======
            if user in duel.users:
                return duel
        return None
>>>>>>> d7fdbcc282e378e2a9ed9fa1430e497b030036bf

    def remove_duel(self, duel: Duel):
        self.duels.remove(duel)

DUELMANAGER: DuelManager = DuelManager()
