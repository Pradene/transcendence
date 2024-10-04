from __future__ import annotations
import typing

# Perform type checking
if typing.TYPE_CHECKING:
    from game.gameutils.PlayerInterface import PlayerInterface

import logging
import random


class Matchmaking:
    def __init__(self):
        self.game_queue: typing.List[PlayerInterface] = []
        self.tournament_queue: typing.List[PlayerInterface] = []

    async def join_game_queue(self, player: 'PlayerInterface'):
        if player in self.game_queue or player in self.tournament_queue:
            raise ValueError("Player is already in a queue")
        self.game_queue.append(player)

        # Log the player's joining for debugging purpose
        logging.info(f"{player.getName()} joined the game queue")
        logging.info(f"Current game queue: {[p.getName() for p in self.game_queue]}")

        # if enough players start a game and remove players from the queue
        if len(self.game_queue) >= 2:
            logging.info(f"Enougth players in queue, creating a new game")
            players = [self.game_queue.pop(0), self.game_queue.pop(0)]
            random.shuffle(players)

            from game.gameutils.GameManager import GameManager
            from game.gameutils.Game import Game
            game_manager: GameManager = GameManager.getInstance()

            # create the game and join
            game: Game = await game_manager.createGame(players[0])
            await game.join(players[1])

            logging.info(f"Adding players to game")
            # register the new game as the current game for both players
            for player in players:
                player.current_game = game

            game.start()

    async def join_tournament_queue(self, player: 'PlayerInterface'):
        if player in self.game_queue or player in self.tournament_queue:
            raise ValueError("Player is already in a queue")
        self.tournament_queue.append(player)

        # log the player joining for debugging purpose
        logging.info(f"{player.getName()} joined the tournament queue")
        logging.info(f"Current tournament queue: {[p.getName() for p in self.tournament_queue]}")

        # if enough player start the tournament and remove the player from the queue
        if len(self.tournament_queue) >= 4:
            players = [self.tournament_queue.pop(0), self.tournament_queue.pop(0), self.tournament_queue.pop(0),
                       self.tournament_queue.pop(0)]
            random.shuffle(players)

            from game.gameutils.GameManager import GameManager
            from game.gameutils.Tournament import Tournament
            game_manager: GameManager = GameManager.getInstance()

            # create the tournament, join and register as current game for each player
            tournament: Tournament = game_manager.createTournament(players[0])
            for player in players:
                await tournament.join(player)
                player.current_game = tournament

            # tournament.start()

    def remove_from_queues(self, player: 'PlayerInterface'):
        if player in self.game_queue:
            self.game_queue.remove(player)
        if player in self.tournament_queue:
            self.tournament_queue.remove(player)


matchmaker = Matchmaking()  # Create an instance of Matchmaking and export when required
