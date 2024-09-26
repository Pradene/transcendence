import typing
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from account.models import CustomUser
from .models import ChatRoom, Message
from .utils.elapsed_time import elapsed_time

if typing.TYPE_CHECKING:
    from game.gameutils.DuelManager import DUELMANAGER

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
        else:
            rooms = await self.get_user_rooms()

            for room in rooms:
                await self.channel_layer.group_add(
                    f'chat_{room.id}',
                    self.channel_name
                )

            await self.channel_layer.group_add(
                'chat',
                self.channel_name
            )
            
            await self.accept()
            logging.info(f"User {self.user} connected to the chat")


    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            rooms = await self.get_user_rooms()
            for room in rooms:
                await self.channel_layer.group_discard(
                    f'chat_{room.id}',
                    self.channel_name
                )
            
            await self.channel_layer.group_discard(
                'chat',
                self.channel_name
            )

            from game.gameutils.DuelManager import DUELMANAGER
            DUELMANAGER.remove_from_duels(self.user.id, onlynonactive=True)
    

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        logging.info(f"Consumer {self.user} received: {data}")
        
        if message_type == 'message':
            await self.message(data)
        
        elif message_type == 'create_room':
            await self.create_room(data)
        
        elif message_type == 'join_room':
            await self.join_room(data)
        
        elif message_type == 'quit_room':
            await self.quit_room(data)

        elif message_type == 'duel_request':
            await self.request_duel(data)

        elif message_type == 'duel_accept':
            await self.accept_duel(data)

        elif message_type == 'duel_refuse':
            await self.refuse_duel(data)

    async def request_duel(self, data: dict):
        logging.info(f"User {self.user} requested a duel")

        try:
            roomid = data['room']
            room: ChatRoom = await database_sync_to_async(ChatRoom.objects.get)(id=roomid)
            opponent = await database_sync_to_async(CustomUser.objects.get)(username=room.get_other_user(self.user))

            await self.channel_layer.group_send(
                f"chat_{roomid}",
                {
                    "type": "duel_response",
                    "action": "duel_request",
                    "challenger": self.user.id,
                    "challenged": opponent.id,
                    "room_id": room.id
                }
            )

            from game.gameutils.DuelManager import DUELMANAGER
            DUELMANAGER.invite(self.user.id, opponent.id)

        except KeyError as e:
            logging.error("KeyError in request_duel")
            return

        except ChatRoom.DoesNotExist as e:
            logging.error("Room does not exist")
            return

    async def accept_duel(self, data: dict):
        try:
            from game.gameutils.DuelManager import DUELMANAGER
            if DUELMANAGER.have_active_duel(self.user.id):
                logging.error("User does already have an active duel")
                return

            roomid = data['room']
            challengerid = data['challenger']

            if not DUELMANAGER.accept(self.user.id, challengerid):
                logging.error("User tried to accept a duel that does not exist")
                return

            logging.log(logging.INFO, f"User {self.user} accepted the duel")
            await self.channel_layer.group_send(
                f"chat_{roomid}",
                {
                    "type": "duel_response",
                    "action": "duel_accept",
                    "challenger": challengerid,
                    "challenged": self.user.id,
                    "room_id": roomid
                }
            )

        except KeyError as e:
            logging.error("KeyError in accept_duel")
            return

        except ChatRoom.DoesNotExist as e:
            logging.error("Room does not exist")
            return

    async def refuse_duel(self, data):
        try:
            from game.gameutils.DuelManager import DUELMANAGER
            if not DUELMANAGER.have_active_duel(self.user.id):
                return

            roomid = data['room']
            challengerid = data['challenger']

            DUELMANAGER.decline(self.user.id, challengerid)

            await self.channel_layer.group_send(
                f"chat_{roomid}",
                {
                    "type": "duel_response",
                    "action": "duel_refuse",
                    "challenger": challengerid,
                    "challenged": self.user.id,
                    "room_id": roomid
                }
            )

        except KeyError as e:
            logging.error("KeyError in refuse_duel")
            return

        except ChatRoom.DoesNotExist as e:
            logging.error("Room does not exist")
            return

    async def message(self, data):
        content = data['content']
        room_id = data['room']

        try:
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)

            message = await self.save_message(room, self.user, content)

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'message_response',
                    'room_id': message.room.id,
                    'user_id': message.user.id,
                    'username': message.user.username,
                    'picture': message.user.picture.url if message.user.picture else None,
                    'content': message.content,
                    'timestamp': elapsed_time(message.timestamp)
                }
            )

        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({
                'error': 'Room does not exist'
            }))

    async def message_response(self, data):
        await self.send(text_data=json.dumps({
            'action': 'message',
            'room_id': data['room_id'],
            'user_id': data['user_id'],
            'username': data['username'],
            'picture': data['picture'],
            'content': data['content'],
            'timestamp': data['timestamp']
        }))

    async def duel_response(self, data):
        await self.send(text_data=json.dumps(data))

    async def create_room(self, data):
        room_name = data.get('room_name')
        is_private = data.get('is_private', True)
        user_ids = data.get('users', [])

        if self.user.id not in user_ids:
            user_ids.append(self.users.id)

        room, created = await database_sync_to_async(ChatRoom.objects.get_or_create)(
            name=room_name,
            is_private=is_private,
        )

        if created:
            # Add the users to the room
            for user_id in user_ids:
                user = await database_sync_to_async(CustomUser.objects.get)(id=user_id)
                await database_sync_to_async(room.users.add)(user)

        # Add the user to the channel layer group for real-time messaging
        await self.channel_layer.group_add(
            f'chat_{room.id}',
            self.channel_name
        )

        # Send a confirmation to the group that the room has been created or already exists
        await self.channel_layer.group_send(
            f'chat_{room.id}',
            {
                'type': 'create_room_response',
                'room_id': room.id,
                'room_name': room.name,
                'is_private': room.is_private
            }
        )

    async def create_room_response(self, data):
        await self.send(text_data=json.dumps({
            'action': 'room_created',
            'room_id': data['room_id'],
            'room_name': data['room_name'],
            'is_private': data['is_private']
        }))

    
    async def join_room(self, data):
        room_id = data.get('room_id')
        
        try:
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)
            await database_sync_to_async(room.join_room)(self.user)

            await self.channel_layer.group_add(
                f'chat_{room.id}',
                self.channel_name
            )

            await self.channel_layer.group_send(
                f'chat{room.id}',
                {
                    'action': 'join_room_response',
                    'room_id': room.id
                }
            )
        
        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({
                'error': 'Room does not exist'
            }))

    async def join_room_response(self, data):
        await self.send(text_data=json.dumps({
            'action': 'room_joined',
            'room_id': data['room_id']
        }))


    async def quit_room(self, data):
        room_id = data.get('room_id')
        try:
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)
            await database_sync_to_async(room.quit)(self.user)
            
            await self.channel_layer.group_discard({
                f'chat_{room_id}',
                self.channel_name
            })

            await self.channel_layer.group_send(
                f'chat_{room_id}',
                {
                    'type': 'quit_room_response',
                    'room_id': room_id
                }
            )
        
        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({
                'error': 'Room does not exist'
            }))

    async def quit_room_response(self, data):
        await self.send(text_data=json.dumps({
            'action': 'room_quit',
            'room_id': data['room_id']
        }))


    # get all rooms of an user
    @database_sync_to_async
    def get_user_rooms(self):
        rooms = self.user.rooms.all()
        return list(rooms)

    # save a message in the db
    @database_sync_to_async
    def save_message(self, room, user, message):
        message = Message.objects.create(room=room, user=user, content=message)
        message.save()

        return message