from django.db import models


# Create your models here.
class GameModel(models.Model):
    user1 = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE)
    user2 = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE)

    user1_score = models.IntegerField()
    user2_score = models.IntegerField()

    winner = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE)


class TournamentModel(models.Model):
    game1 = models.ForeignKey('GameModel', on_delete=models.CASCADE)
    game2 = models.ForeignKey('GameModel', on_delete=models.CASCADE)
    game3 = models.ForeignKey('GameModel', on_delete=models.CASCADE)

    winner = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE)
