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

        logging.info(message_type)

        if message_type == 'friend_request_sended':
            await self.send_friend_request(event)
        
        elif message_type == "friend_request_cancelled":
            await self.cancel_friend_request(event)

        elif message_type == 'friend_request_accepted':
            await self.accept_friend_request(event)

        elif message_type == 'friend_request_declined':
            await self.decline_friend_request(event)

        elif message_type == 'friend_removed':
            await self.remove_friend(event)


    async def send_friend_request(self, event):
        try:
            receiver_id = event.get('user_id')
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

            user_data = self.user.toJSON()

            await self.channel_layer.group_send(
                f'user_{receiver.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_request_received',
                    'user': user_data
                }
            )

        except Exception as e:
            logging.info(f'error: {e}')


    async def cancel_friend_request(self, event):
        try:
            receiver_id = event.get('user_id')
            logging.info(f'id: {receiver_id}')
            receiver = await database_sync_to_async(CustomUser.objects.get)(id=receiver_id)
            logging.info(f'user: {receiver}')
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=self.user, receiver=receiver)
            logging.info(f'request: {friend_request}')

            await database_sync_to_async(friend_request.cancel)()

            user_data = self.user.toJSON()

            await self.channel_layer.group_send(
                f'user_{receiver.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_request_cancelled',
                    'user': user_data
                }
            )


        except Exception as e:
            logging.info(f'error: {e}')


    async def accept_friend_request(self, event):
        try:
            sender_id = event.get('user_id')
            sender = await database_sync_to_async(CustomUser.objects.get)(id=sender_id)

            friend_request = await database_sync_to_async(FriendRequest.objects.get)(sender=sender, receiver=self.user)

            await database_sync_to_async(friend_request.accept)()

            receiver_data = self.user.toJSON()
            sender_data = sender.toJSON()

            await self.channel_layer.group_send(
                f'user_{self.user.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_request_accepted',
                    'user': sender_data,
                }
            )

            await self.channel_layer.group_send(
                f'user_{sender.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_request_accepted',
                    'user': receiver_data,
                }
            )

            room = await database_sync_to_async(
                ChatRoom.objects
                .filter(is_private=True)
                .filter(users=sender)
                .filter(users=self.user)
                .first
            )()

            if room:
                return # Exit if the room already exists
            
            room = await database_sync_to_async(
                ChatRoom.objects.create
            )(is_private=True)

            for user_id in [self.user.id, sender.id]:
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
        try:
            sender_id = event.get('user_id')
            sender = await database_sync_to_async(CustomUser.objects.get)(id=sender_id)

            # Retrieve the friend request
            friend_request = await database_sync_to_async(FriendRequest.objects.get)(
                sender=sender,
                receiver=self.user
            )

            receiver_data = self.user.toJSON()
            sender_data = sender.toJSON()

            # Delete the friend request
            await database_sync_to_async(friend_request.delete)()

            await self.channel_layer.group_send(
                f'user_{sender.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_request_declined',
                    'user': receiver_data
                }
            )

        except Exception as e:
            logging.info(f'Error declining friend request: {e}')


    async def remove_friend(self, event):
        try:
            friend_id = event.get('user_id')
            logging.info(friend_id)

            friend = await database_sync_to_async(
                CustomUser.objects.get
            )(id=friend_id)
            logging.info(friend)

            friend_friend_list, created = await database_sync_to_async(
                FriendList.objects.get_or_create
            )(user=friend)

            logging.info(friend_friend_list)

            user_friend_list, created = await database_sync_to_async(
                FriendList.objects.get_or_create
            )(user=self.user)

            logging.info(user_friend_list)

            await database_sync_to_async(friend_friend_list.remove_friend)(self.user)
            await database_sync_to_async(user_friend_list.remove_friend)(friend)

            logging.info('removed')

            user_data = self.user.toJSON()
            friend_data = friend.toJSON()

            await self.channel_layer.group_send(
                f'user_{self.user.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_removed',
                    'user': friend_data
                }
            )

            await self.channel_layer.group_send(
                f'user_{friend.id}',
                {
                    'type': 'friend_response',
                    'action': 'friend_removed',
                    'user': user_data
                }
            )

        except Exception as e:
            logging.info(f'remove friend error: {e}')


    async def friend_response(self, event):
        action = event['action']
        user = event['user']

        await self.send(text_data=json.dumps({
            'action': action,
            'user': user
        }))
