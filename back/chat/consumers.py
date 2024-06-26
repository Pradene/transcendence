import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from django.contrib.auth.models import User
from .models import ChatRoom, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
        else:
            self.user.name = self.scope['user'].username
            self.user_rooms = await self.get_user_rooms()

            for room in self.user_rooms:
                await self.channel_layer.group_add(
                    f'chat_{room.id}',
                    self.channel_name
                )
            
            await self.accept()

            rooms = [room.name for room in self.user_rooms]

            await self.send(text_data=json.dumps({
                'rooms': rooms
            }))


    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            for room in self.user_rooms:
                await self.channel_layer.group_discard(
                    f'chat_{room.id}',
                    self.channel_name
                )
    

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        room_id = text_data_json['room']

        user = self.user
        room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)

        await self.save_message(room, user, message)

        await self.channel_layer.group_send(
            f'chat_{room.id}',
            {
                'type': 'chat_message',
                'room': f'chat_{room.id}',
                'user': user.name,
                'message': message
            }
        )


    async def chat_message(self, event):
        room = event['room']
        user = event['user']
        message = event['message']

        await self.send(text_data=json.dumps({
            'room': room,
            'user': user,
            'message': message
        }))
        

    @database_sync_to_async
    def get_user_rooms(self):
        rooms = self.user.rooms.all()
        return list(rooms)

    @database_sync_to_async
    def save_message(self, room, user, message):
        message = Message.objects.create(room=room, user=user, content=message)
        message.save()