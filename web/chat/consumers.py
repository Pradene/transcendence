import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from django.contrib.auth.models import User
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
        else:
            self.user.username = self.scope['user'].username
            self.user_rooms = await self.get_user_rooms()

            for room in self.user_rooms:
                await self.channel_layer.group_add(
                    f'chat_{room.id}',
                    self.channel_name
                )
            
            await self.accept()


    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            for room in self.user_rooms:
                await self.channel_layer.group_discard(
                    f'chat_{room.id}',
                    self.channel_name
                )
    

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'message':
            await self.message(data)


    async def message(self, data):
        content = data['content']
        room_id = data['room']

        user = self.user
        room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)

        await self.save_message(room, user, content)

        await self.channel_layer.group_send(
            f'chat_{room.id}',
            {
                'type': 'room_message',
                'room': room.id,
                'user': user.username,
                'content': content
            }
        )


    async def room_message(self, event):
        room_id = event['room']
        user = event['user']
        content = event['content']

        await self.send(text_data=json.dumps({
            'room': room_id,
            'user': user,
            'content': content
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