import asyncio
import typing
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from account.models import CustomUser
from .models import ChatRoom, Message
from .utils.elapsed_time import elapsed_time
from asgiref.sync import sync_to_async

if typing.TYPE_CHECKING:
    from game.gameutils.DuelManager import DUELMANAGER

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if self.user.is_authenticated:
            rooms = await self.get_user_rooms()

            for room in rooms:
                await self.channel_layer.group_add(
                    f'chat_{room.id}',
                    self.channel_name
                )

            await self.channel_layer.group_add(
                f'chat_user_{self.user.id}',
                self.channel_name
            )
            
            await self.accept()
        
        else:
            await self.close()


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
            duels = DUELMANAGER.get_duels(self.user)
            if DUELMANAGER.get_active_duel(self.user) is not None:
                duels.remove(DUELMANAGER.get_active_duel(self.user))
            DUELMANAGER.remove_duels(duels)
    

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
            opponent = await sync_to_async(room.get_other_user, thread_sensitive=True)(current_user=self.user)

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
            DUELMANAGER.invite(self.user, opponent)

        except KeyError as e:
            logging.error("KeyError in request_duel")
            return

        except ChatRoom.DoesNotExist as e:
            logging.error("Room does not exist")
            return

    async def accept_duel(self, data: dict):
        try:
            from game.gameutils.DuelManager import DUELMANAGER
            if DUELMANAGER.get_active_duel(self.user) is not None:
                logging.error("User does already have an active duel")
                return

            roomid = data['room']
            challenger = await database_sync_to_async(CustomUser.objects.get)(id=data['challenger'])

            if not DUELMANAGER.accept(self.user, challenger):
                logging.error("User tried to accept a duel that does not exist")
                return

            logging.log(logging.INFO, f"User {self.user} accepted the duel")
            await self.channel_layer.group_send(
                f"chat_{roomid}",
                {
                    "type": "duel_response",
                    "action": "duel_accept",
                    "challenger": challenger.id,
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

            roomid = data['room']
            room = await database_sync_to_async(ChatRoom.objects.get)(id=roomid)
            challenger = await sync_to_async(room.get_other_user)(current_user=self.user)

            duel = DUELMANAGER.get_duel(self.user, challenger)
            if duel is None:
                return
            else:
                DUELMANAGER.remove_duel(duel)

            await self.channel_layer.group_send(
                f"chat_{roomid}",
                {
                    "type": "duel_response",
                    "action": "duel_refuse",
                    "challenger": challenger.id,
                    "challenged": self.user.id,
                    "room_id": roomid
                }
            )

        except KeyError as e:
            logging.error(f"KeyError in refuse_duel: {e.__str__()}")
            return

        except ChatRoom.DoesNotExist as e:
            logging.error("Room does not exist")
            return

    
    async def duel_response(self, data):
        await self.send(text_data=json.dumps(data))


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


    async def create_room(self, data):
        try:
            user_ids = data.get('users', [])

            if self.user.id not in user_ids:
                user_ids.append(self.users.id)

            room = await database_sync_to_async(ChatRoom.objects.create)(
                is_private=False
            )

            # Add the users to the room
            for user_id in user_ids:
                await self.channel_layer.group_send(
                    f'chat_user_{user_id}',
                    {
                        'type': 'join_room',
                        'room_id': room.id
                    }
                )

        except Exception as e:
            logging.info(e)

    
    async def join_room(self, data):
        try:
            room_id = data.get('room_id')
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)
            
            await database_sync_to_async(room.users.add)(self.user)

            await self.channel_layer.group_add(
                f'chat_{room.id}',
                self.channel_name
            )

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'join_room_response',
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