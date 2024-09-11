import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from account.models import CustomUser
from .models import ChatRoom, Message
from .utils.elapsed_time import elapsed_time

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
    

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'message':
            await self.message(data)
        
        elif message_type == 'create_room':
            await self.create_room(data)
        
        elif message_type == 'join_room':
            await self.join_room(data)
        
        elif message_type == 'quit_room':
            await self.quit_room(data)
        


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