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

from game.utils.LocalGameManager import LocalGameManager
from game.utils.GameManager import GameManager
from game.utils.TournamentManager import TournamentManager
from game.utils.defines import *

from account.models import CustomUser
from chat.models import ChatRoom
from game.models import Game, Tournament

from utils.logger import Logger


class TournamentConsumer(AsyncJsonWebsocketConsumer, Logger):
    
    channels: dict[int, str] = {}
    managers: dict[int, 'TournamentManager'] = {}
    managers_lock: asyncio.Lock = asyncio.Lock()

    def __init__(self, *args, **kwargs):
        AsyncJsonWebsocketConsumer.__init__(self, *args, **kwargs)
        Logger.__init__(self)

    async def connect(self):
        self.user = self.scope['user']
        self.set_log_identifier(self.user.username)

        try:
            if self.user.is_authenticated:
                self.info(f"connected for tournament")
                self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
                self.group_name = f'tournament_{self.tournament_id}'

                # Get tournament and check user can join
                self.tournament = await database_sync_to_async(
                    Tournament.objects.get
                )(id=self.tournament_id)
                if not await database_sync_to_async(self.tournament.isInTournament)(self.user):
                    raise Exception('User is not in tournament')

                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                self.channels[self.user.id] = self.channel_name

                await self.accept()
                self.info(f"connected to tournament {self.tournament_id}")

                # Join tournament if tournament is not finished
                async with TournamentConsumer.managers_lock:
                    if self.tournament_id not in TournamentConsumer.managers:

                        self.info(f'Tournament {self.tournament_id} not in managers, adding it')
                        users = await database_sync_to_async(list)(self.tournament.players.all())
                        self.manager = TournamentManager(self.tournament, users)
                        self.manager.add_observer(self)
                        
                        TournamentConsumer.managers[self.tournament_id] = self.manager
                    
                    else:
                        self.info(f'Tournament {self.tournament_id} already in managers, getting it')
                        self.manager = TournamentConsumer.managers[self.tournament_id]

                # Start tournament if not already started
                self.info(f'Starting tournament {self.tournament_id}')
                asyncio.create_task(self.manager.start_tournament())


            else:
                await self.close()

        except Tournament.DoesNotExist as e:
            await self.close(code=1011, reason="Tournament does not exists")
            
        except Exception as e:
            logging.error(f'Error: {e}')
            await self.close(code=1011)

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)


    async def send_game(self, game_id, action='action'):
        logging.info(f'game id: {game_id}')
        
        game = await database_sync_to_async(
            Game.objects.get
        )(id=game_id)

        players = await database_sync_to_async(
            list
        )(game.players.all())

        for player in players:
            await self.send_game_to_user(player.id, game_id, action)


    async def send_game_to_user(self, user_id, game_id, action='action'):
        channel_name = self.channels.get(user_id)
        if not channel_name:
            return

        await self.channel_layer.send(
            channel_name,
            {
                'type': 'game_found',
                'game_id': game_id,
                'action': action,
                'tournament_id': self.tournament.id
            }
        )

    async def game_found(self, data):
        await self.send_json(data)


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

            # user not in game, close connection
            game_user = await database_sync_to_async(self.game.players.filter)(id=self.user.id)
            if not await database_sync_to_async(game_user.exists)():
                await self.close(1000)
                return

            # game finished, close connection
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
            elif data['quit']:
                self.game_manager.quit(self.user.id)

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


    async def send_username(self):
        users = await database_sync_to_async(list)(self.game.players.all())

        player = next((user for user in users if user.id == self.user.id), None)
        opponent = next((user for user in users if user.id != self.user.id), None)

        await self.send_json({
            'type': 'player_info',
            'player': player.username,
            'opponent': opponent.username
        })


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

        elif data['status'] == 'started' or data['status'] == 'finished':
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
    tournament_queue = deque()
    game_queue = deque()
    channels = {}

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.type = self.scope['url_route']['kwargs']['type']

            await self.channel_layer.group_add(
                f'matchmaking_pool',
                self.channel_name
            )

            self.channels[self.user.id] = self.channel_name

            await self.accept()

            logging.info(f'type: {self.type}')

            if self.type == 'game':
                await self.join_game_queue()

            elif self.type == 'tournament':
                await self.join_tournament_queue()

        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f'matchmaking_pool',
            self.channel_name
        )

        if self.user in self.game_queue:
            self.game_queue.remove(self.user)
        if self.user in self.tournament_queue:
            self.tournament_queue.remove(self.user)

    async def receive(self, text_data):
        data = json.loads(text_data)
        logging.info(data)

    async def join_tournament_queue(self):
        if self.user not in self.tournament_queue:
            self.tournament_queue.append(self.user)
            await self.join_tournament()

        else:
            logging.error('user is already in queue')

    async def join_tournament(self):
        if len(self.tournament_queue) >= 4:
            tournament = await database_sync_to_async(
                Tournament.objects.create
            )()

            player1 = self.tournament_queue.popleft()
            player2 = self.tournament_queue.popleft()
            player3 = self.tournament_queue.popleft()
            player4 = self.tournament_queue.popleft()

            # create tournament and save
            await database_sync_to_async(
                tournament.players.add
            )(player1, player2, player3, player4)
            await database_sync_to_async(tournament.saveAll)()
            logging.info(f'tournament: {tournament.id} created, redirecting players')

            await self.tournament_found(player1.id, tournament.id)
            await self.tournament_found(player2.id, tournament.id)
            await self.tournament_found(player3.id, tournament.id)
            await self.tournament_found(player4.id, tournament.id)

    async def tournament_found(self, user_id, tournament_id):
        channel_name = self.channels.get(user_id)
        if not channel_name:
            return

        await self.channel_layer.send(
            channel_name,
            {
                'type': 'tournament_found_response',
                'tournament_id': tournament_id
            }
        )

    async def tournament_found_response(self, data):
        tournament_id = data.get('tournament_id')
        
        await self.send_json({
            'type': 'tournament_found',
            'tournament_id': tournament_id
        })

    
    async def join_game_queue(self):
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
        
        await self.send_json({
            'type': 'game_found',
            'game_id': game_id
        })


class LocalGameConsumer(AsyncJsonWebsocketConsumer):
    connected_users = {}
    game_managers = {}
    game_manager_lock = asyncio.Lock()

    async def connect(self):
        self.user = self.scope['user']
        logging.info("Creating local game")

        if self.user.is_authenticated:
            self.group_name = f'local_game_{self.user.username}'

            # create game model (will be deleted on disconnect)
            self.local_user = await database_sync_to_async(CustomUser.objects.get)(username="local")
            self.game = await database_sync_to_async(
                Game.objects.create
            )()
            await database_sync_to_async(self.game.players.add)(self.user, self.local_user)
            # await database_sync_to_async(self.game.save)()
            self.game_id = self.game.id

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
                    self.game_manager = LocalGameManager(self.game, users)

                    GameConsumer.game_managers[self.game_id] = self.game_manager
                    self.game_manager.add_observer(self)
                    asyncio.create_task(self.game_manager.start_game())

                else:
                    self.game_manager = GameConsumer.game_managers[self.game_id]

        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await database_sync_to_async(self.game.delete)()
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            self.remove_connected_user(self.user, self.game_id)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if not self.game_manager:
                return

            # logging.info(f'data: {data}')
            if 'movement' in data:
                self.game_manager.update_player(self.user.id, data['movement'])
            elif 'p2movement' in data:
                self.game_manager.update_player(self.local_user.id, data['p2movement'])
            elif data['quit']:
                await self.game_manager.quit(self.user.id)

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

    async def send_username(self):
        users = await database_sync_to_async(list)(self.game.players.all())

        player = next((user for user in users if user.id == self.user.id), None)
        opponent = next((user for user in users if user.id != self.user.id), None)

        await self.send_json({
            'type':     'player_info',
            'player':   player.username,
            'opponent': opponent.username
        })

    async def send_game_state(self, game_state):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_game',
                'data': game_state
            }
        )

    async def send_game(self, event):
        data = event.get('data')

        if data['status'] == 'waiting':
            await self.send_json(data)

        elif data['status'] == 'started' or data['status'] == 'finished':
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
                'status':   data['status'],
                'player':   player,
                'opponent': opponent,
                'ball':     ball
            })

