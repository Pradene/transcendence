import logging
import typing
import json
import asyncio
import time

from django.db import transaction
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Union, List
from collections import deque

from game.response import Response

from game.gameutils.PlayerInterface import PlayerInterface
# from game.gameutils.Game import Game
from game.gameutils.Tournament import Tournament
from game.gameutils.Matchmaking import matchmaker
from game.gameutils.DuelManager import DUELMANAGER
from game.gameutils.defines import *
from account.models import CustomUser
from chat.models import ChatRoom
from .models import Game

# This is a global variable that is used to check if the module has been initialised
# MODULE_INITIALIZED: bool = False


# class GameConsumerResponse:
#     def __init__(self, method: str, status: bool, data: dict = {}, reason: str = ""):
#         self.method = method
#         self.status = status
#         self.data = data
#         self.reason = reason

#     def toJSON(self) -> dict:
#         response: dict = {
#             "method": self.method,
#             "status": self.status,
#             "reason": self.reason,
#             "data":   self.data,
#         }

#         return response


# class GameConsumer(AsyncJsonWebsocketConsumer):
#     USERS: List = []

#     def __init__(self, *args, **kwargs):
#         super().__init__(args, kwargs)
#         self.__interface: PlayerInterface = PlayerInterface('p1', self.updateClient, self.__deleteCurrentGame)
#         self.__user = None

#         if not MODULE_INITIALIZED:
#             from game.gameutils.GameManager import GameManager
#             logging.log(logging.INFO, "Initialising GameConsumer")
#             GameManager.setUserList(GameConsumer.USERS)
#             MODULE_INITIALISED = True

#     async def connect(self):
#         self.__user = self.scope["user"]

#         if not self.__user.is_authenticated:
#             await self.close()
#             return

#         elif self.__user.username in [user.getUsername() for user in GameConsumer.USERS]:
#             await self.close()
#             return

#         GameConsumer.USERS.append(self)

#         self.log("connected")
#         self.__interface.setName(self.__user.username)
#         await self.accept()
#         await self.getGames()
#         await self.onUserChange()

#         from game.gameutils.DuelManager import DUELMANAGER

#         if DUELMANAGER.get_duel(self.__user) is not None:
#             from game.gameutils.GameManager import GameManager
#             self.log("active duel found")

#             gamemanager: GameManager = GameManager.getInstance()
#             duel = DUELMANAGER.get_duel(self.__user)
#             opponent = await database_sync_to_async(duel.get_opponent)(self.__user)

#             if gamemanager.gameExists(opponent.username):
#                 self.log(f"Game with {opponent.username} already exists, joining")
#                 self.__interface.current_game = gamemanager.getGame(opponent.username)
#                 await self.__interface.current_game.join(self.__interface)
#                 self.__interface.current_game.start()
#                 DUELMANAGER.remove_duel(duel)
#             else:
#                 self.log(f"Game with {opponent.username} does not exist, creating")
#                 self.__interface.current_game = await gamemanager.createGame(self.__interface, duel.message)

#     async def receive(self, text_data=None, bytes_data=None, **kwargs):
#         """Handle incoming messages from the client"""

#         # logging.info(f"Received message from {self.__interface.getName()}: {text_data}")

#         try:
#             data = json.loads(text_data)
#             method = data["method"]
#         except json.JSONDecodeError:
#             logging.error(f"Invalid JSON data received from {self.__interface.getName()}")
#             return
#         except KeyError:
#             logging.error(f"Invalid JSON data received from {self.__interface.getName()}")
#             return

#         method = data["method"]
#         if not method:
#             return

#         match method:
#             case "get_games":
#                 await self.getGames()
#             case "join_queue":
#                 await self.join_queue(data)
#             case "update_player":
#                 await self.updatePlayer(data)

#     def log(self, message: str, is_error=False):
#         logmsg = f"[{type(self).__name__} ({self.__user.username})]: {message}"

#         if is_error:
#             logging.error(logmsg)
#         else:
#             logging.info(logmsg)

#     async def disconnect(self, close_code):
#         """Handle client disconnection"""

#         matchmaker.remove_from_queues(self.__interface)

#         self.log("disconnecting...")

#         # Remove from game if a game is active
#         if self.isInGame():
#             self.log(f"is in game {self.__interface.current_game.getGameid()}, quitting")
#             await self.__interface.current_game.quit()
#             self.__interface.current_game = None
#             self.log(f"has quit the game {self.__interface.current_game.getGameid()}")

#         # Remove duel if duel is active
#         if DUELMANAGER.get_duel(self.__user) is not None:
#             self.log("user have an active duel, removing")
#             DUELMANAGER.remove_duel(DUELMANAGER.get_duel(self.__user))

#         # Useless ???
#         for user in GameConsumer.USERS:
#             if user == self:
#                 GameConsumer.USERS.remove(user)

#         self.log("disconnected")
#         await GameConsumer.onUserChange()

#     def isInGame(self) -> bool:
#         """Check if the user is in a game"""

#         return self.__interface.current_game is not None and self.__interface.current_game.isFinished() is not True

#     async def getGames(self):
#         """Send a list of all games to the client"""

#         from game.gameutils.GameManager import GameManager

#         manager: GameManager = GameManager.getInstance()
#         response: GameConsumerResponse = GameConsumerResponse(method="get_games", status=True, data=manager.toJSON())

#         await self.send_json(response.toJSON())

#     async def send_json(self, data):
#         """Send JSON data to the client and log it to the console"""
#         try:
#             await super().send_json(data)
#         except Exception as e:
#             self.log(f"{e.__str__()}", is_error=True)
#             self.close()

#     async def updateClient(self, gameData: dict):
#         """Send updated game data to the client"""

#         await self.send_json(gameData)

#     async def join_queue(self, data: dict):
#         """Join the game or tournament queue"""

#         if self.isInGame():
#             response = GameConsumerResponse(method="join_queue", status=False, reason=Response.ALREADYINGAME)
#             await self.send_json(response.toJSON())
#             return

#         try:
#             queue_type = data['data']['mode']

#             # Join the queue or raise an exception if the queue type is invalid
#             if queue_type == 'game':
#                 await matchmaker.join_game_queue(self.__interface)
#             elif queue_type == 'tournament':
#                 await matchmaker.join_tournament_queue(self.__interface)
#             else:
#                 raise ValueError("Invalid queue type")

#             # Send a success response
#             response = GameConsumerResponse(method="join_queue", status=True)
#             await self.send_json(response.toJSON())

#         except KeyError as e:
#             response = GameConsumerResponse(method="join_queue", status=False, reason="Invalid request")

#         except ValueError as e:
#             response = GameConsumerResponse(method="join_queue", status=False, reason=str(e))
#             await self.send_json(response.toJSON())

#     def __deleteCurrentGame(self):
#         self.log(f"left the game {self.__interface.current_game.getGameid()}")
#         self.__interface.current_game = None

#     async def updatePlayer(self, data) -> None:
#         """Update player movement"""

#         if not self.isInGame():
#             # response = GameConsumerResponse(method="update_player", status=False, reason=Response.NOTINGAME)
#             # await self.send_json(response.toJSON())
#             return

#         try:
#             movement = data["data"]["movement"]
#             self.__interface.setMovement(movement)
#         except KeyError as error:
#             response = GameConsumerResponse(method="update_player", status=False,
#                                             reason=f"{Response.INVALIDREQUEST}: {error}")
#             await self.send_json(response.toJSON())
#             return
#         except ValueError as error:
#             response = GameConsumerResponse(method="update_player", status=False,
#                                             reason=f"{Response.INVALIDMOVEMENT}: {error}")
#             await self.send_json(response.toJSON())
#             return

#     @staticmethod
#     async def onGameChange():
#         """Update the game list for all users"""
#         for user in GameConsumer.USERS:
#             await user.getGames()

#     @staticmethod
#     async def onUserChange():
#         """Update the user list for all users"""
#         """Is triggered when a user connects or disconnects"""

#         userlist: List[str] = [user.getUsername() for user in GameConsumer.USERS]

#         for user in GameConsumer.USERS:
#             await user.updateUserList(userlist)

#     async def updateUserList(self, userlist: List[str]):
#         """Send the updated user list to the client"""

#         response: GameConsumerResponse = GameConsumerResponse(method="get_users", status=True, data={"users": userlist})
#         await self.send_json(response.toJSON())

#     def getUsername(self) -> str:
#         """Return the username of the user"""

#         return self.__user.username


class Player:
    def __init__(self, id, pos_x = 0, pos_y = 0):
        self.id = id
        self.position = {'x': pos_x, 'y': pos_y}
        self.movement = 'NONE'

        logging.info(f'player id: {self.id}')
        logging.info(f'player position: {self.position}')

    def setMovement(self, movement):
        if movement != "UP" and movement != "DOWN" and movement != "NONE":
            raise ValueError("Invalid movement")
        
        self.movement = movement

    def move(self):
        speed = PADDLE_SPEED
        if self.movement == "UP":
            self.position['y'] -= speed
            if self.position['y'] < -300 + PADDLE_HEIGHT / 2:
                self.position['y'] = -300 + PADDLE_HEIGHT / 2
        elif self.movement == "DOWN":
            self.position['y'] += speed
            if self.position['y'] > 300 - PADDLE_HEIGHT / 2:
                self.position['y'] = 300 - PADDLE_HEIGHT / 2

FPS: int = 30
TIME_TO_SLEEP: float = (1 / FPS)

class GameManager:
    def __init__(self, game, users):
        self.game = game
        self.users = users
        self.players = self.init_players()
        self.observers = []
        self.countdown = COUNTDOWN

        logging.info(f'game status: {self.game.status}')

    def init_players(self):
        positions = {
            0: -400 + 10,
            1: 400 - 10
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

                await self.notify_observers()

                current_frame = time.time()
                if current_frame - last_frame < TIME_TO_SLEEP:
                    await asyncio.sleep(TIME_TO_SLEEP - (current_frame - last_frame))
                
                last_frame = current_frame

            logging.info(f'game finished')
            await self.notify_observers()


        except Exception as e:
            logging.error(f'error: {e}')

    def update_player(self, user_id, movement):
        logging.info(f'update user {user_id}')
        logging.info(f'move {movement}')

        self.players.get(user_id).setMovement(movement)

    def get_player_info(self, user_id):
        player = self.players.get(user_id)
        return {
            "id": player.id,
            "position": player.position,
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


    

class GameConsumer(AsyncJsonWebsocketConsumer):
    connected_users = {}
    game_managers = {}

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.group_name = f'game_{self.game_id}'
            if not await self.is_user_in_game():
                await self.close()
                return

            self.game = await database_sync_to_async(
                Game.objects.get
            )(id=self.game_id)

            if self.game.status == 'finished':
                await self.close()
                return

            self.add_connected_user(self.user, self.game_id)
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await self.accept()

            if self.game_id not in GameConsumer.game_managers:
                users = await database_sync_to_async(list)(self.game.players.all())
                self.game_manager = GameManager(self.game, users)
                GameConsumer.game_managers[self.game_id] = self.game_manager
            else:
                self.game_manager = GameConsumer.game_managers[self.game_id]

            if await database_sync_to_async(self.check_users_connected)():
                logging.info(f"All players are connected. Starting the game!")
                self.game_manager.add_observer(self)
                
                asyncio.create_task(self.game_manager.start_game())

        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            self.remove_connected_user(self.user, self.game_id)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logging.info(data)

            if not self.game_manager:
                return

            if data['movement']:
                self.game_manager.update_player(self.user.id, data['movement'])

        except Exception as e:
            logging.error(f'error: {e}')

    async def is_user_in_game(self):
        ''' Check if the current user is in the game. '''
        return await database_sync_to_async(
            Game.objects
            .filter(id=self.game_id, players=self.user)
            .exists
        )()

    def get_connected_users(self):
        """Return the list of connected users for the current game."""
        return list(self.connected_users.get(self.game_id, []))

    def add_connected_user(self, user, game_id):
        if game_id not in self.connected_users:
            self.connected_users[game_id] = set()
        self.connected_users[game_id].add(user)

    def remove_connected_user(self, user, game_id):
        if game_id in self.connected_users and user in self.connected_users[game_id]:
            self.connected_users[game_id].remove(user)
            # Clean up if no users are connected
            if not self.connected_users[game_id]:
                del self.connected_users[game_id]

    def check_users_connected(self):
        # Check if both players are connected
        with transaction.atomic():
            game = Game.objects.select_for_update().get(id=self.game_id)
        
            if game.status == 'waiting':
                players_count = game.players.count()
                connected_players = self.connected_users.get(self.game_id, set())
        
                if len(connected_players) == players_count:
                    game.status = 'started'
                    game.save()
                    return True
        return False

    async def send_game_state(self, game_state):
        await self.channel_layer.group_send(
            f'game_{self.game.id}',
            {
                'type': 'send_game',
                'data': game_state
            }
        )

    async def send_game(self, event):
        data = event.get('data')

        if data['status'] == 'waiting':
            await self.send_json(data)

        elif data['status'] == 'started' or data['status'] == 'ready':
            players = data['players']
            player = players.get(self.user.id)

            opponent = next(
                (p for user_id, p in players.items() if user_id != self.user.id),
                None
            )

            if opponent and opponent['id'] == self.user.id:
                opponent = None

            if player and player['position']['x'] < 0:
                opponent['position']['x'] = -opponent['position']['x']
                player['position']['x'] = -player['position']['x']

            await self.send_json({
                'status': data['status'],
                'player': player,
                'opponent': opponent
            })


class MatchmakingConsumer(AsyncJsonWebsocketConsumer):
    game_queue = deque()
    channels = {}

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.channels[self.user.id] = self.channel_name

            await self.channel_layer.group_add(
                f'matchmaking_pool',
                self.channel_name
            )

            await self.accept()

        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f'matchmaking_pool',
            self.channel_name
        )

        if self.user in self.game_queue:
            self.game_queue.remove(self.user)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        logging.info(data)

        if message_type == 'join_queue':
            await self.join_queue(data)

    async def join_queue(self, data):
        if self.user not in self.game_queue:
            self.game_queue.append(self.user)
            await self.join_game()

        else:
            logging.error('user is already in queue')


    async def join_game(self):
        if len(self.game_queue) >= 2:
            game = await database_sync_to_async(
                Game.objects.create
            )()

            player1 = self.game_queue.popleft()
            player2 = self.game_queue.popleft()

            await database_sync_to_async(
                game.players.add
            )(player1, player2)

            await self.game_found(player1.id, game.id)
            await self.game_found(player2.id, game.id)


    async def game_found(self, user_id, game_id):
        channel_name = self.channels.get(user_id)
        if not channel_name:
            return

        await self.channel_layer.send(
            channel_name,
            {
                'type': 'game_found_response',
                'game_id': game_id
            }
        )

    async def game_found_response(self, data):
        game_id = data.get('game_id')
        
        await self.send(text_data=json.dumps({
            'type': 'game_found',
            'game_id': game_id
        }))