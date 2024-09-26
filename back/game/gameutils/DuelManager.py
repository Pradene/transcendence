import __future__
import logging
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer


class DuelManager:
    def __init__(self):
        self.duels: typing.List[typing.List[int, int, bool]] = []

    def invite(self, challengerid: int, challengedid: int):
        for duel in self.duels:
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
        logging.info(f"Checking if player {playerid} has an active duel.")
        logging.info(f"Current duels: {self.duels}")
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


DUELMANAGER: DuelManager = DuelManager()
