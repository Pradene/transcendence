import json
import logging

from django.http import JsonResponse
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import FriendRequest, CustomUser
from .serializers import CustomUserSerializer

class FriendsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        logging.info("try to connect to account websocket")

        if self.user.is_authenticated:
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )

            await self.accept()
            
            await self.channel_layer.group_send(
                f'user_{self.user.id}',
                {
                    'type': 'connect_response',
                    'message': 'you are connected to websocket'
                }
            )

            logging.info("connected to account websocket")

    async def connect_response(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f'user_{self.user.id}',
                self.channel_name
            )


    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        logging.info(f'{message_type} received')
        
        if message_type == 'friend_request_accepted':
            await self.accept_friend_request(data)

        elif message_type == 'friend_request_sended':
            await self.send_friend_request(data)

        elif message_type == 'friend_request_declined':
            await self.decline_friend_request(data)


    async def send_friend_request(self, data):
        receiver_id = data.get('receiver')
        logging.info(f'receiver: {receiver_id}')
        
        try:
            receiver = await database_sync_to_async(CustomUser.objects.get)(id=receiver_id)

            # Check if a friend request already exists before creating it
            existing_request = await database_sync_to_async(
                FriendRequest.objects.filter(
                    sender=self.user,
                    receiver=receiver
                ).exists
            )()

            if existing_request:
                logging.info(f'Friend request already exists')
                return  # Exit the function if the friend request already exists


            friend_request = await database_sync_to_async(FriendRequest.objects.create)(sender=self.user, receiver=receiver)

            receiver_data = CustomUserSerializer(friend_request.receiver).data
            sender_data = CustomUserSerializer(friend_request.sender).data

            await self.channel_layer.group_send(
                f'user_{friend_request.sender.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_sended',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

            await self.channel_layer.group_send(
                f'user_{friend_request.receiver.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_received',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

        except Exception as e:
            logging.info(f'error: {e}')


    async def accept_friend_request(self, data):
        sender_id = data.get('sender')
        logging.info(f'friend request from {sender_id} accepted')

        try:
            sender = await database_sync_to_async(CustomUser.objects.get)(id=sender_id)
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=sender, receiver=self.user)

            await database_sync_to_async(friend_request.accept)()

            receiver_data = CustomUserSerializer(friend_request.receiver).data
            sender_data = CustomUserSerializer(friend_request.sender).data

            await self.channel_layer.group_send(
                f'user_{friend_request.sender.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_accepted',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

            await self.channel_layer.group_send(
                f'user_{friend_request.receiver.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_accepted',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

            usernames = sorted([friend_request.sender.username, friend_request.receiver.username])
            room_name = f'{usernames[0]}_{usernames[1]}'

            await self.channel_layer.group_send(
                'chat',  # Send to chat consumer room creation message
                {
                    'type': 'create_room',
                    'room_name': f'{room_name}',
                    'is_private': True,
                    'users': [friend_request.receiver.id, friend_request.sender.id]
                }
            )
        
        except Exception as e:
            logging.info(f'error: {e}')
    

    async def decline_friend_request(self, data):
        sender_id = data.get('sender')
        receiver_id = data.get('receiver')  # Assuming you also pass receiver_id for validation

        try:
            # Retrieve the friend request
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(
                sender_id=sender_id,
                receiver_id=receiver_id
            )

            receiver_data = CustomUserSerializer(friend_request.receiver).data
            sender_data = CustomUserSerializer(friend_request.sender).data

            # Delete the friend request
            await database_sync_to_async(friend_request.delete)()

            # Notify sender and receiver about the decline
            await self.channel_layer.group_send(
                f'user_{friend_request.sender.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_declined',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

            await self.channel_layer.group_send(
                f'user_{friend_request.receiver.id}',
                {
                    'type': 'friend_request_response',
                    'action': 'friend_request_declined',
                    'receiver': receiver_data,
                    'sender': sender_data
                }
            )

        except ObjectDoesNotExist:
            logging.info('Friend request does not exist.')
        except Exception as e:
            logging.info(f'Error declining friend request: {e}')


    async def friend_request_response(self, data):
        action = data['action']
        receiver = data['receiver']
        sender = data['sender']

        await self.send(text_data=json.dumps({
            'action': action,
            'receiver': receiver,
            'sender': sender
        }))
