import __future__
import typing

if typing.TYPE_CHECKING:
    from chat.consumers import ChatConsumer


class DuelManager:
    def __init__(self):
        self.duels: typing.List[typing.Tuple[str, str, bool]] = []

    def invite(self, challenger: ChatConsumer, challenged: ChatConsumer):
        for duel in self.duels:
            if duel[0] == challenger.user or duel[1] == challenged.user:
                return
            elif duel[0] == challenged.user or duel[1] == challenged.user:
                return

        duel += (challenger.user, challenged.user, False)

    def accept(self, challenged: ChatConsumer):
        for duel in self.duels:
            if duel[1] == challenged.user:
                duel[2] = True

    def decline(self, challenged: ChatConsumer):
        for duel in self.duels:
            if duel[1] == challenged.user:
                self.duels.remove(duel)

    def have_active_duel(self, player: str) -> bool:
        for duel in self.duels:
            if duel[0] == player or duel[1] == player:
                return duel[2]


DUELMANAGER: DuelManager = DuelManager()
