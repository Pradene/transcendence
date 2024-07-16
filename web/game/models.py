from django.db import models


# Create your models here.
class GameModel(models.Model):
    user1 = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='user2')

    user1_score = models.IntegerField()
    user2_score = models.IntegerField()

    winner = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='game_winner')


class TournamentModel(models.Model):
    game1 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game1')
    game2 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game2')
    game3 = models.ForeignKey('GameModel', on_delete=models.CASCADE, related_name='game3')

    winner = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='tournament_winner')
