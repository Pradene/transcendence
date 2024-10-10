import logging
import time
import asyncio

from channels.db import database_sync_to_async

from typing import List, Dict, Union, Callable

from game.utils.Game import Game
from game.utils.Ball import Ball
from game.utils.Tournament import Tournament
from game.utils.Player import Player
from game.utils.defines import *
from game.utils.Vector import Vector2
from game.utils.intersections import *

from chat.models import Message

TIME_TO_SLEEP: float = (1 / FPS)

class GameManager:
    def __init__(self, game, users):
        self.game = game
        self.users = users
        self.players = self.init_players()
        self.ball = Ball()
        self.observers = []
        self.countdown = COUNTDOWN


    def init_players(self):
        positions = {
            0: -400 + 20,
            1: 400 - 20
        }

        return {
            user.id: Player(
                id=user.id,
                pos_x=positions[i]
            ) for i, user in enumerate(self.users)
        }


    def add_observer(self, observer):
        self.observers.append(observer)


    def remove_observer(self, observer):
        self.observers.remove(observer)


    async def notify_observers(self):
        game_state = self.get_game_state()
        for observer in self.observers:
            await observer.send_game_state(game_state)


    async def start_game(self):
        try:
            while self.countdown >= 0:
                await self.notify_observers()
                await asyncio.sleep(1)
                self.countdown -= 1

            self.game.status = 'ready'
            logging.info(f'ready')
            await database_sync_to_async(self.game.save)()
            await self.notify_observers()

            self.game.status = 'started'
            logging.info(f'starting')
            await database_sync_to_async(self.game.save)()
            await self.notify_observers()

            last_frame = time.time()
            while self.game.status != 'finished':
                
                for user_id, player in self.players.items():
                    player.move()

                self.ball.move()

                self.check_collisions()

                await self.notify_observers()

                current_frame = time.time()
                if current_frame - last_frame < TIME_TO_SLEEP:
                    await asyncio.sleep(TIME_TO_SLEEP - (current_frame - last_frame))
                
                last_frame = current_frame

            logging.info(f'game finished')
            await self.notify_observers()


        except Exception as e:
            logging.error(f'error: {e}')


    def check_collisions(self):
        future_position = self.ball.position + self.ball.direction.scale(self.ball.speed)

        collision_normal = self.check_wall_collisions(self.ball.position, future_position)
        if collision_normal:
            # Reflect the ball's direction based on wall collision
            self.ball.direction = self.ball.direction.reflect(collision_normal)
            return

        for player in self.players.values():
            collision_normal = line_rect_collision(self.ball.position, future_position, player)
            if collision_normal:
                # Reflect the ball's direction based on the collision normal
                self.ball.direction = self.ball.direction.reflect(collision_normal)
                break


    def check_wall_collisions(self, start, end):
        # Check collision with left wall
        if line_intersects_line(start, end, Vector2(-400, 300), Vector2(-400, -300)):
            return Vector2(1, 0)  # Collision normal facing right
        # Check collision with right wall
        if line_intersects_line(start, end, Vector2(400, 300), Vector2(400, -300)):
            return Vector2(-1, 0)  # Collision normal facing left
        # Check collision with top wall
        if line_intersects_line(start, end, Vector2(-400, 300), Vector2(400, 300)):
            return Vector2(0, 1)  # Collision normal facing down
        # Check collision with bottom wall
        if line_intersects_line(start, end, Vector2(-400, -300), Vector2(400, -300)):
            return Vector2(0, -1)  # Collision normal facing up
        
        return None


    def update_player(self, user_id, movement):
        player = self.players.get(user_id)
        player.setMovement(movement)


    def get_player_info(self, user_id):
        player = self.players.get(user_id)
        return {
            "id": player.id,
            "position": {
                'x': player.position.x,
                'y': player.position.y
            }
        } if player else None


    def get_game_state(self):
        status = self.game.status

        if status == 'waiting':
            return {
                'status': status,
                'timer': self.countdown
            }

        elif status == 'ready' or status == 'started':
            return {
                'status': status,
                'players': {
                    user_id: self.get_player_info(user_id)
                    for user_id in self.players
                },
                'ball': {
                    'position': {
                        'x': self.ball.position.x,
                        'y': self.ball.position.y
                    }
                }
            }

        elif status == 'finished':
            return {
                'status': status
            }

        else:
            return {
                'status': 'undefined'
            }


# class ThreadingDict:
#     def __init__(self):
#         self.__dict: Dict = {}
#         # self.__ondelete: Callable = onDelete
#         self.__lock: RLock = RLock()
#         self.__thread: Thread = Thread(target=asyncio.run, args=(self.__checkAndDelete(),))

#         self.__thread.start()

#     def __del__(self):
#         self.__thread.join()

#     async def __checkAndDelete(self):
#         oneDeleted: bool = False

#         while True:

#             with self.__lock:
#                 # iterate over the keys and delete the ones that should be deleted
#                 for key in list(self.__dict.keys()):
#                     if self.__dict[key].isFinished():
#                         game = self.__dict.pop(key)
#                         await sync_to_async(game.saveToDB, thread_sensitive=True)()
#                         await game.redirectClients()
#                         logging.log(logging.INFO, f"Game {key} deleted")
#                         oneDeleted = True

#             if oneDeleted:
#                 from game.consumers import GameConsumer
#                 oneDeleted = False
#                 await GameConsumer.onGameChange()

#             time.sleep(1)

#     def __getitem__(self, key):
#         with self.__lock:
#             item = self.__dict[key]

#         return item

#     def __setitem__(self, key, value):
#         with self.__lock:
#             self.__dict[key] = value

#     def __contains__(self, key):
#         with self.__lock:
#             check = key in self.__dict

#         return check

#     def pop(self, key):
#         with self.__lock:
#             item = self.__dict.pop(key)

#         return item

#     def keys(self):
#         with self.__lock:
#             keys = self.__dict.keys()

#         return keys

#     def values(self):
#         with self.__lock:
#             values = self.__dict.values()

#         return values


# class GameManager:
#     from game.consumers import GameConsumer

#     GAMES: ThreadingDict = ThreadingDict()
#     TOURNAMENTS: ThreadingDict = ThreadingDict()
#     USERLIST: List[GameConsumer] = []
#     __instance = None

#     def __init__(self):
#         pass

#     def __del__(self):
#         pass

#     async def createGame(self, player: Player, related_duel: Message | None = None) -> Game:
#         self.log(f"creating new game instance")
#         from game.consumers import GameConsumer
#         game = Game(player, related_duel=related_duel)
#         GameManager.GAMES[player.getName()] = game

#         await GameConsumer.onGameChange()
#         self.log(f"Game instance created")
#         return game

#     def gameExists(self, gameid: str) -> bool:
#         return gameid in GameManager.GAMES.keys()

#     def getGame(self, gameid: str) -> Game:
#         return GameManager.GAMES[gameid]

#     def createTournament(self, player: Player) -> Tournament:
#         GameManager.TOURNAMENTS[player.getName()] = Tournament(player)
#         return GameManager.TOURNAMENTS[player.getName()]

#     def tournamentExists(self, name: str) -> bool:
#         return name in GameManager.TOURNAMENTS.keys()

#     def getTournament(self, name: str) -> Tournament:
#         return GameManager.TOURNAMENTS[name]

#     def gameOrTournamentExists(self, name: str) -> bool:
#         return self.gameExists(name) or self.tournamentExists(name)

#     def getGameOrTournament(self, name: str) -> Union[Game, Tournament]:
#         if self.gameExists(name):
#             return self.getGame(name)
#         elif self.tournamentExists(name):
#             return self.getTournament(name)
#         else:
#             raise KeyError(f"Game or Tournament {name} does not exist")

#     def __deleteGame(self, gameid: str) -> None:
#         game = GameManager.GAMES.pop(gameid, None)
#         game.removeFromClients()
#         self.log(f"Game {gameid} deleted")

#     def __deleteTournament(self, name: str) -> None:
#         GameManager.TOURNAMENTS.pop(name, None)
#         self.log(f"Tournament {name} deleted")

#     def toJSON(self) -> Dict:
#         garr = [x.gameInfo() for x in GameManager.GAMES.values() if not x.gameInfo()["is_full"]]
#         tarr = [x.tournamentInfo() for x in GameManager.TOURNAMENTS.values()]
#         return {"games": garr, "tournaments": tarr}

#     @staticmethod
#     def getInstance() -> 'GameManager':
#         if GameManager.__instance is None:
#             logging.info("Creating GameManager instance")
#             GameManager.__instance = GameManager()
#             logging.info("GameManager instance created")
#         return GameManager.__instance

#     @staticmethod
#     def setUserList(userlist: List):
#         GameManager.USERLIST = userlist
#         logging.log(logging.INFO, "Userlist set")

#     def log(self, message: str):
#         logmsg = f"[{type(self).__name__}]: {message}"
#         logging.info(logmsg)

#     def error(self, message: str):
#         logmsg = f"[{type(self).__name__}]: {message}"
#         logging.error(logmsg)

