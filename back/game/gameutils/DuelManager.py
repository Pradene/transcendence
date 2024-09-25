import __future__
import logging
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer


class DuelManager:
    def __init__(self):
        self.duels: typing.List[typing.Tuple[int, int, bool]] = []

    def invite(self, challengerid: int, challengedid: int):
        for duel in self.duels:
            if duel[0] == challengerid and duel[1] == challengedid:
                return
            elif duel[0] == challengedid and duel[1] == challengedid:
                return

        self.duels += (challengerid, challengedid, False)

    def accept(self, challengedid: int, challengerid: int):
        for duel in self.duels:
            if duel[1] == challengedid and duel[0] == challengerid:
                duel[2] = True
                logging.info(f"Player {challengerid} and {challengedid} have accepted the duel.")

    def decline(self, challengedid: int, challengerid: int):
        for duel in self.duels:
            if duel[1] == challengedid and duel[0] == challengerid:
                self.duels.remove(duel)
                logging.info(f"Player {challengerid} and {challengedid} have declined the duel.")

    def have_active_duel(self, playerid: int) -> bool:
        for duel in self.duels:
            if duel[0] == playerid or duel[1] == playerid:
                return duel[2]

    def remove_from_duels(self, playerid: int, onlynonactive: bool = False):
        if onlynonactive:
            for duel in self.duels:
                if (duel[0] == playerid or duel[1] == playerid) and not duel[2]:
                    self.duels.remove(duel)
                    logging.info(f"Player {playerid} has been removed from duels.")
        else:
            for duel in self.duels:
                if duel[0] == playerid or duel[1] == playerid:
                    self.duels.remove(duel)
                    logging.info(f"Player {playerid} has been removed from duels.")

    def get_opponent_id(self, playerid: int):
        for duel in self.duels:
            if duel[0] == playerid and duel[2]:
                return duel[1]
            elif duel[1] == playerid and duel[2]:
                return duel[0]


DUELMANAGER: DuelManager = DuelManager()
