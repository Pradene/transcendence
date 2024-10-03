import json
import logging

from django.db.models import Q
from django.http import JsonResponse
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import FriendList, FriendRequest, CustomUser
from chat.models import ChatRoom

class FriendsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )

            await self.accept()

        else:
            await self.close()


    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f'user_{self.user.id}',
                self.channel_name
            )


    async def receive(self, text_data):
        event = json.loads(text_data)
        message_type = event['type']

        if message_type == 'friend_request_sended':
            await self.send_friend_request(event)
        
        elif message_type == "friend_request_cancelled":
            await self.cancel_friend_request(event)

        elif message_type == 'friend_request_accepted':
            await self.accept_friend_request(event)

        elif message_type == 'friend_request_declined':
            await self.decline_friend_request(event)


    async def send_friend_request(self, event):
        try:
            receiver_id = event.get('receiver')
            if self.user.id == receiver_id:
                return # Exit if the request is sent to yourself

            receiver = await database_sync_to_async(
                CustomUser.objects.get)(id=receiver_id)

            friend_list, created = await database_sync_to_async(
                FriendList.objects.get_or_create)(
                    user=self.user
            )

            is_friend = await database_sync_to_async(friend_list.is_friend)(receiver)

            if is_friend:
                return # Exit if users are already friends

            # Check if a friend request already exists before creating it
            existing_request = await database_sync_to_async(
                FriendRequest.objects.filter(
                    Q(sender=self.user, receiver=receiver) |
                    Q(sender=receiver, receiver=self.user)
                ).exists
            )()

            if existing_request:
                return  # Exit if the friend request already exists

            friend_request = await database_sync_to_async(FriendRequest.objects.create)(sender=self.user, receiver=receiver)

            sender_data = friend_request.sender.toJSON()
            receiver_data = friend_request.receiver.toJSON()

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


    async def cancel_friend_request(self, event):
        try:
            receiver_id = event.get('receiver')
            receiver = await database_sync_to_async(CustomUser.objects.get)(id=receiver_id)
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=self.user, receiver=receiver)

            await database_sync_to_async(friend_request.cancel)()

        except Exception as e:
            logging.info(f'error: {e}')


    async def accept_friend_request(self, event):
        try:
            sender_id = event.get('sender')
            sender = await database_sync_to_async(CustomUser.objects.get)(id=sender_id)
            receiver = await database_sync_to_async(CustomUser.objects.get)(id=self.user.id)

            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=sender, receiver=self.user)

            await database_sync_to_async(friend_request.accept)()

            receiver_data = receiver.toJSON()
            sender_data = sender.toJSON()

            for user_id in [receiver.id, sender.id]:
                await self.channel_layer.group_send(
                    f'user_{user_id}',
                    {
                        'type': 'friend_request_response',
                        'action': 'friend_request_accepted',
                        'receiver': receiver_data,
                        'sender': sender_data
                    }
                )

            room = await database_sync_to_async(
                ChatRoom.objects
                .filter(is_private=True)
                .filter(users=sender)
                .filter(users=receiver)
                .first
            )()

            if room:
                return # Exit if the room already exists
            
            room = await database_sync_to_async(
                ChatRoom.objects.create
            )(is_private=True)

            for user_id in [receiver.id, sender.id]:
                await self.channel_layer.group_send(
                    f'chat_user_{user_id}',
                    {
                        'type': 'join_room',
                        'room_id': room.id
                    }
                )
        
        except Exception as e:
            logging.info(f'error: {e}')
    

    async def decline_friend_request(self, event):
        sender_id = event.get('sender')
        receiver_id = event.get('receiver')

        try:
            # Retrieve the friend request
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(
                sender_id=sender_id,
                receiver_id=receiver_id
            )

            receiver_data = friend_request.receiver.toJSON()
            sender_data = friend_request.sender.toJSON()

            # Delete the friend request
            await database_sync_to_async(friend_request.delete)()

            # Notify sender and receiver about the decline
            for user_id in [friend_request.receiver.id, friend_request.sender.id]:
                await self.channel_layer.group_send(
                    f'user_{friend_request.sender.id}',
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


    async def friend_request_response(self, event):
        action = event['action']
        receiver = event['receiver']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'action': action,
            'receiver': receiver,
            'sender': sender
        }))
