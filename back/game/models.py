from django.conf import settings
from django.db import models


class Tournament(models.Model):
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="tournaments")
    started = models.BooleanField(default=False)

    def getGames(self):
        return Game.objects.all().filter(tournament=self).order_by('id')

    def getFinishedGames(self):
        return self.getGames().filter(status='finished')

    def isFinished(self):
        return self.getFinishedGames().count() == 3

    def isInTournament(self, player):
        return player in self.players.all()

    def toJSON(self):

        games = Game.objects.all().filter(tournament=self).order_by('id')
        finished_games = games.filter(status='finished', tournament=self)

        winner = None
        try:
            winner = games[2].winner.toJSON()
        except Exception as e:
            pass

        return {
            'id': self.id,
            'players': [player.toJSON() for player in self.players.all()],
            'games': [game.toJSON() for game in games],
            'status': 'finished' if finished_games.count() == games.count() else 'started',
            'winner': winner
        }

class Game(models.Model):
    status = models.CharField(choices=[
        ('waiting', 'Waiting'),
        ('ready', 'Ready'),
        ('started', 'Started'),
        ('paused', 'Paused'),
        ('finished', 'Finished')
    ], default='waiting')
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='games')
    tournament = models.ForeignKey(Tournament, related_name='games', blank=True, null=True, on_delete=models.CASCADE)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

    def set_winner(self):
        scores = {ps.player: ps.score for ps in self.scores.all()}
        self.winner = max(scores, key=scores.get, default=None)
        self.status = 'finished'
        self.save()

    def is_finished(self):
        return self.status == 'finished'

    def toJSON(self):
        players = [{
            'id': score.player.id,
            'picture': score.player.picture.url if score.player.picture else None,
            'username': score.player.username,
            'score': score.score
        } for score in self.scores.all()]

        data = {
            'id': self.id,
            'status': self.status,
            'tournament': self.tournament.id if self.tournament else None,
            'winner': self.winner.toJSON() if self.winner else None,
            'players': players
        }

        return data

class Score(models.Model):
    game = models.ForeignKey(Game, related_name='scores', on_delete=models.CASCADE)
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('game', 'player')

    def toJSON(self):
        return {
            'player': self.player.toJSON(),
            'score': self.score
        }