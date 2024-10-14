from django.conf import settings

from django.db import models
from account.models import CustomUser
from django.utils import timezone


# Create your models here.
class GameModel(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user2')

    user1_score = models.IntegerField()
    user2_score = models.IntegerField()

    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='game_winner')

    date = models.DateTimeField(default=timezone.now)

    def toJSON(self, user):
        def get_opponent():
            if self.user1 == user:
                return self.user2.toJSON()
            elif self.user2 == user:
                return self.user1.toJSON()
            return None

        def get_opponent_score():
            if self.user1 == user:
                return self.user2_score
            elif self.user2 == user:
                return self.user1_score
            return None

        def get_player():
            if self.user1 == user:
                return self.user1.toJSON()
            elif self.user2 == user:
                return self.user2.toJSON()
            return None

        def get_player_score():
            if self.user1 == user:
                return self.user1_score
            elif self.user2 == user:
                return self.user2_score
            return None

        return {
            'id': self.id,
            'player': get_player(),
            'opponent': get_opponent(),
            'player_score': get_player_score(),
            'opponent_score': get_opponent_score(),
            'winner': self.winner.toJSON(),
            'isTournament': False,
            'date': self.date
        }



class TournamentModel(models.Model):
    game1 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game1')
    game2 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game2')
    game3 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game3')

    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_winner')
    users = models.ManyToManyField('account.CustomUser', related_name='users')

    date = models.DateTimeField(default=timezone.now)

    def toJSON(self) -> dict:
        return {
            'id': self.id,
            'winner': self.winner.toJSON(),
            'isTournament': True,
            'date': self.date
        }
