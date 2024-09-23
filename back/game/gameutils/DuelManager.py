import __future__
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer


class DuelManager:
    def __init__(self):
        self.duels: typing.List[typing.Tuple[str, str, bool]] = []

    def invite(self, challenger: str, challenged: str):
        for duel in self.duels:
            if duel[0] == challenger or duel[1] == challenged:
                return
            elif duel[0] == challenged or duel[1] == challenged:
                return

        duel += (challenger, challenged, False)

    def accept(self, challenged: str):
        for duel in self.duels:
            if duel[1] == challenged:
                duel[2] = True

    def decline(self, challenged: str):
        for duel in self.duels:
            if duel[1] == challenged:
                self.duels.remove(duel)

    def have_active_duel(self, player: str) -> bool:
        for duel in self.duels:
            if duel[0] == player or duel[1] == player:
                return duel[2]


DUELMANAGER: DuelManager = DuelManager()
