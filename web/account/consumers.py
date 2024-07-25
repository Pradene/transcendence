import json
import logging

from django.http import JsonResponse
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import FriendRequest, CustomUser

class FriendsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )

            await self.accept()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f'user_{self.user.id}',
                self.channel_name
            )


    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        
        if message_type == 'friend_request_accepted':
            await self.accept_friend_request(data)


    async def accept_friend_request(self, data):
        sender_id = data.get('sender')
        logging.info(f'{sender_id}')

        try:
            sender = await database_sync_to_async(CustomUser.objects.get)(id=sender_id)
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=sender, receiver=self.user)

            await database_sync_to_async(friend_request.accept)()

            await self.channel_layer.group_send(
                f'user_{friend_request.sender.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_accepted',
                    'receiver_id': self.user.id,
                    'sender_id': friend_request.sender.id
                }
            )

            await self.channel_layer.group_send(
                f'user_{friend_request.receiver.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_accepted',
                    'receiver_id': self.user.id,
                    'sender_id': friend_request.sender.id
                }
            )

            await self.channel_layer.group_send(
                    'chat',  # Group where ChatConsumer listens for room creation
                    {
                        'type': 'create_room',
                        'room_name': f"chat",
                        'is_private': True,
                        'users': [friend_request.receiver.id, friend_request.sender.id]
                    }
                )
        
        except Exception as e:
            logging.info(f'{e}')
    
    async def friend_request_response(self, data):
        await self.send(text_data=json.dumps({
            'action': data['action'],
            'receiver_id': data['receiver_id'],
            'sender_id': data['sender_id']
        }))


    async def decline_friend_request(self, data):
        pass
