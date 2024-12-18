import logging
import asyncio
import typing

from channels.db import database_sync_to_async
from math import ceil, log2
from game.models import Game
from utils.logger import Logger

if typing.TYPE_CHECKING:
    from game.consumers import TournamentConsumer


class TournamentManager(Logger):
    def __init__(self, tournament, players):
        self.tournament = tournament
        self.players = list(players)
        self.game_tree = {}
        self.observers: ['TournamentConsumer'] = []

        super().__init__()
        # self.set_log_identifier(self.players)


    def add_observer(self, observer: 'TournamentConsumer'):
        self.observers.append(observer)
        self.info(f'Observer added: {observer}')


    def remove_observer(self, observer: 'TournamentConsumer'):
        self.observers.remove(observer)
        self.info(f'Observer removed: {observer}')


    async def notify_observers(self, game_id, action='action'):
        for observer in self.observers:
            await observer.send_game(game_id, action=action)
        self.info(f'Notified observers about game {game_id}')

    async def isFinished(self):
        finished_games = await database_sync_to_async(self.tournament.getFinishedGames)()
        count = await database_sync_to_async(finished_games.count)()
        return count == 3

    async def start_tournament(self):
        if self.tournament.started:
            self.error('Tournament already started')
            return

        self.info('Tournament started')
        self.tournament.started = True
        await database_sync_to_async(self.tournament.saveAll)()
        current_players = self.players

        # create first round
        self.info('Creating first round')
        games = await self.create_round(current_players)

        # notify observers about the first round, update tournament page
        await database_sync_to_async(self.tournament.saveAll)()
        await self.notify_observers(games[0], action='query_tournament')
        await self.notify_observers(games[1], action='query_tournament')
        self.info('Waiting for 5 seconds before starting the first round')
        await asyncio.sleep(5)

        # start first round
        for gameid in games:
            await self.notify_observers(gameid)

        # game finished, get winners and create last round
        current_players = await self.wait(games)
        old_games = games
        games = await self.create_round(current_players)
        await self.notify_observers(old_games[0], action='query_tournament')
        await self.notify_observers(old_games[1], action='query_tournament')
        await asyncio.sleep(5)
        for gameid in games:
            await self.notify_observers(gameid)
        await self.wait(games)

        return

    async def create_round(self, players):
        games = []

        # Create games in pairs and store game IDs
        for i in range(0, len(players), 2):
            if i + 1 < len(players):
                game = await database_sync_to_async(
                    Game.objects.create
                )(tournament=self.tournament)

                await database_sync_to_async(
                    game.players.add
                )(players[i], players[i + 1])
                await database_sync_to_async(game.save)()

                # Placeholder for winner
                games.append(game.id)

        return games


    async def wait(self, games):
        while True:
            # Check if all matches are finished
            winners = []
            for game_id in games:
                game = await database_sync_to_async(
                    Game.objects.get
                )(id=game_id)

                if await self.check_game_finished(game):
                    winner = await database_sync_to_async(lambda: game.winner)()  # Get the winner
                    winners.append(winner)

            if len(winners) == len(games):  # All games are finished
                print("All matches finished. Proceeding to the next round.")
                return winners
            
            await asyncio.sleep(1)
        
        return None


    async def check_game_finished(self, game):
        # Assume there's a method or a property in the Game model that checks if it's finished
        return await database_sync_to_async(game.is_finished)()
