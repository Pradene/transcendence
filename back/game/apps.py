from django.apps import AppConfig
from django.db.models.signals import post_migrate
import logging


def delete_unfinished_games_and_tournaments(sender, **kwargs):
    try:
        from game.models import Game, Tournament
        tournaments = Tournament.objects.all()
        deleted_tournaments = 0
        deleted_tournaments_games = 0
        deleted_games = 0

        # clean up unfinished tournaments
        for tournament in tournaments:

            if not tournament.isFinished():
                games = tournament.getGames()

                for game in games:
                    game.delete()
                    deleted_tournaments_games += 1

                tournament.delete()
                deleted_tournaments += 1

        # clean up unfinished games
        games = Game.objects.all()

        for game in games:

            if not game.is_finished():
                game.delete()
                deleted_games += 1

        logging.info(f'Deleted {deleted_tournaments} unfinished tournaments ({deleted_tournaments_games} games) and {deleted_games} games')

    except Exception as e:
        logging.error(f'Error deleting unfinished games and tournaments: {e}')

class GameConfig(AppConfig):
    name = 'game'

    def ready(self):
        post_migrate.connect(delete_unfinished_games_and_tournaments, sender=self)
