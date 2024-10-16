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
            games = await self.create_round(current_players, round_number)
            self.game_tree[round_number] = games

            logging.info(f'round created, waiting for winner')
            
            current_players = await self.wait(games)
            round_number += 1

            logging.info(f'some winners')

        logging.info(f'winner')


    async def create_round(self, players, round_number):
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
    


# class Tournament(AbstractGame):
#     def __init__(self, player: Player):
#         super().__init__(player)

#         self.__players: List[Player] = []
#         self.__games: List[Game] = []

#         self.__th = Thread(target=asyncio.run, args=(self.__tournamentLoop(),))

#     async def join(self, player: Player) -> None:
#         nplayers = len(self.__players)

#         # if tournament is full, raise an error
#         if nplayers == 4:
#             raise RuntimeError("Tournament is full")

#         # else add player to the tournament
#         self.__players.append(player)
#         nplayers += 1

#         # if first or second player, create a game
#         if nplayers == 1 or nplayers == 2:
#             ngame = Game(player)
#             self.__games.append(ngame)
#             await ngame.update()
#         elif nplayers == 3:
#             await self.__games[0].join(player)
#         elif nplayers == 4:
#             await self.__games[1].join(player)
#             self.start()

#     def start(self) -> None:
#         if len(self.__players) < 4:
#             raise RuntimeError("Tournament not full")

#         self.__th.start()

#     def tournamentInfo(self) -> dict:
#         return {
#             "creator":      self.getGameid(),
#             "player_count": len(self.__players),
#             "is_full":      len(self.__players) == 4,
#         }

#     async def __tournamentLoop(self) -> None:
#         game0 = self.__games[0]
#         game1 = self.__games[1]

#         game0.start()
#         game1.start()

#         # wait for one game to finish
#         while not game0.isFinished() and not game1.isFinished():
#             time.sleep(1)

#         # get the first winner and start the next game
#         winner0 = game0.getWinner() if game0.isFinished() else game1.getWinner()
#         remaining_game = game0 if not game0.isFinished() else game1

#         if winner0 is None:
#             await self._setFinished()
#             return

#         logging.log(logging.INFO, f"Game 0 finished, winner: {winner0.getName()}")

#         game3 = Game(winner0)
#         self.__games.append(game3)
#         await game3.update()

#         # wait for the remaining game to finish
#         while not remaining_game.isFinished():
#             time.sleep(1)

#         winner1 = remaining_game.getWinner()
#         if winner1 is None:
#             await self._setFinished()
#             return

#         logging.log(logging.INFO, f"Game 1 finished, winner: {winner1.getName()}")

#         # start last game
#         await game3.join(winner1)
#         game3.start()

#         while not game3.isFinished():
#             time.sleep(1)

#         winner3 = game3.getWinner()
#         logging.log(logging.INFO, f"Game 2 finished, winner: {winner3.getName()}")
#         await self._setFinished(game3.getWinner())

#     async def quit(self) -> None:
#         await self._setFinished()

#         for game in self.__games:
#             await game.quit()

#     async def update(self) -> None:
#         pass

#     def saveToDB(self) -> None:
#         game1 = self.__games[0]
#         game2 = self.__games[1]
#         game3 = self.__games[2]

#         game1.saveToDB()
#         game2.saveToDB()
#         game3.saveToDB()

#         if self.getWinner() is None:
#             return

#         game1 = self.__games[0].getGameModel()
#         game2 = self.__games[1].getGameModel()
#         game3 = self.__games[2].getGameModel()

#         winner = accountmodels.CustomUser.objects.get(username=self.getWinner().getName())

#         dbentry = gamemodels.TournamentModel(
#             game1=game1,
#             game2=game2,
#             game3=game3,
#             winner=winner
#         )
#         dbentry.save()

#     async def redirectClients(self):
#         if self.__gamemodel is None:
#             return

#         data = {
#             "method": "redirect_game",
#             "status": True,
#             "gameid": self.__gamemodel.id
#         }

#         for player in self.__players:
#             await player.getUpdateCallback()(data)
#         pass
