import logging
import typing
import json
import asyncio
import time
import math

from django.db import transaction
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from collections import deque

from game.utils.GameManager import GameManager
from game.utils.defines import *

from account.models import CustomUser
from chat.models import ChatRoom
from game.models import Game


class GameConsumer(AsyncJsonWebsocketConsumer):
    connected_users = {}
    game_managers = {}
    game_manager_lock = asyncio.Lock()

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.group_name = f'game_{self.game_id}'
            if not await self.is_user_in_game():
                await self.close(1000)
                return

            self.game = await database_sync_to_async(
                Game.objects.get
            )(id=self.game_id)

            if self.game.status == 'finished':
                await self.close(1000)
                return

            self.add_connected_user(self.user, self.game_id)
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await self.accept()

            await self.send_username()

            async with GameConsumer.game_manager_lock:
                if self.game_id not in GameConsumer.game_managers:
                    
                    users = await database_sync_to_async(list)(self.game.players.all())
                    self.game_manager = GameManager(self.game, users)
                    
                    GameConsumer.game_managers[self.game_id] = self.game_manager
                
                else:
                    self.game_manager = GameConsumer.game_managers[self.game_id]

            if await database_sync_to_async(self.check_users_connected)():
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

    async def send_username(self):
        users = await database_sync_to_async(list)(self.game.players.all())

        player = next((user for user in users if user.id == self.user.id), None)
        opponent = next((user for user in users if user.id != self.user.id), None)

        await self.send_json({
            'type': 'player_info',
            'player': player.username,
            'opponent': opponent.username
        })


    async def send_game(self, event):
        data = event.get('data')

        if data['status'] == 'waiting':
            await self.send_json(data)

        elif data['status'] == 'started' or data['status'] == 'ready':
            players = data['players']
            ball = data['ball']
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
                ball['position']['x'] = -ball['position']['x']

            await self.send_json({
                'status': data['status'],
                'player': player,
                'opponent': opponent,
                'ball': ball
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
#         self.__interface: Player = Player('p1', self.updateClient, self.__deleteCurrentGame)
#         self.__user = None

#         if not MODULE_INITIALIZED:
#             from game.utils.GameManager import GameManager
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

#         from game.utils.DuelManager import DUELMANAGER

#         if DUELMANAGER.get_duel(self.__user) is not None:
#             from game.utils.GameManager import GameManager
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

#         from game.utils.GameManager import GameManager

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
