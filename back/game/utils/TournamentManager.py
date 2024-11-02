import logging
import asyncio

from channels.db import database_sync_to_async

from math import ceil, log2

from game.models import Game


class TournamentManager:
    def __init__(self, tournament, players):
        self.tournament = tournament
        self.players = list(players)
        self.game_tree = {}
        self.started = False
        self.observers = []

    def add_observer(self, observer):
        self.observers.append(observer)


    def remove_observer(self, observer):
        self.observers.remove(observer)


    async def notify_observers(self, game_id):
        for observer in self.observers:
            await observer.send_game(game_id)

    async def start_tournament(self):
        if self.started:
            return

        self.started = True

        players_number = len(self.players)
        rounds_number = ceil(log2(players_number))

        current_players = self.players

        round_number = 1
        while len(current_players) > 1:
            logging.info(f'start')
            games = await self.create_round(current_players)
            self.game_tree[round_number] = games

            logging.info(f'round created, waiting for winner')
            
            current_players = await self.wait(games)
            round_number += 1

            logging.info(f'some winners')

        logging.info(f'winner')


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

                # Placeholder for winner
                games.append(game.id)

                await self.notify_observers(game.id)

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
