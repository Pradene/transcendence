import asyncio
import typing
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

from account.models import CustomUser
from game.models import Game
from .models import ChatRoom, Message, Invitation
from .utils.elapsed_time import elapsed_time
from .utils.rooms import is_user_room_member

from game.utils.DuelManager import DUELMANAGER


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
                f'chat_user_{self.user.id}',
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        logging.info(f"received: {data}")

        message_type = data.get('type')
        room_id = data.get('room_id')

        room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)
        is_member = await database_sync_to_async(room.is_in_room)(self.user)
        
        if not is_member:
            logging.error(f"{self.user} not in room {room.id}")
            return

        if message_type == 'message':
            await self.message(data)

        elif message_type == 'send_invitation':
            await self.send_invitation(data)

        elif message_type == 'cancel_invitation':
            await self.cancel_invitation(data)

        elif message_type == 'decline_invitation':
            await self.decline_invitation(data)

        elif message_type == 'accept_invitation':
            await self.accept_invitation(data)
        
        elif message_type == 'create_room':
            await self.create_room(data)
        
        elif message_type == 'join_room':
            await self.join_room(data)
        
        elif message_type == 'quit_room':
            await self.quit_room(data)


    async def send_invitation(self, data):
        try:
            room_id = data.get('room_id')
            room = await database_sync_to_async(
                ChatRoom.objects.get
            )(id=room_id)

            existing_invitation = await database_sync_to_async(
                Invitation.objects
                .filter()
            )(sender=self.user, status='pending')

            if existing_invitation.exists():
                await database_sync_to_async(
                    existing_invitation.update
                )(status='canceled')

            invitation = await database_sync_to_async(
                Invitation.objects.create
            )(room=room, sender=self.user)

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'invitation_response',
                    'id': invitation.id,
                    'status': invitation.status,
                    'sender': self.user.toJSON()
                }
            )

        except Exception as e:
            logging.info(f'error {e}')


    async def cancel_invitation(self, data):
        try:
            room_id = data.get('room_id')
            invitation_id = data.get('invitation_id')

            room = await database_sync_to_async(
                ChatRoom.objects.get
            )(id=room_id)

            invitation = await database_sync_to_async(
                Invitation.objects.get
            )(id=invitation_id)

            if invitation.sender != self.user:
                return
            elif invitation.room.id != room.id:
                return

            invitation.status = 'canceled'
            await database_sync_to_async(invitation.save)()

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'invitation_response',
                    'id': invitation.id,
                    'status': invitation.status,
                    'sender': self.user.toJSON()
                }
            )

        except Exception as e:
            logging.error(f'error: {e}')


    async def decline_invatition(self, data):
        try:
            room_id = data.get('room_id')
            invitation_id = data.get('invitation_id')

            room = await database_sync_to_async(
                ChatRoom.objects.get
            )(id=room_id)

            invitation = await database_sync_to_async(
                Invitation.objects.get
            )(id=invitation_id)

            if invitation.sender == self.user:
                return

            if invitation.room.id != room.id:
                return

            invitation.status = 'declined'
            await database_sync_to_async(invitation.save)()

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'invitation_response',
                    'id': invitation.id,
                    'status': invitation.status,
                    'sender': invitation.sender
                }
            )

        except Exception as e:
            logging.error(f'error: {e}')


    async def request_duel(self, data: dict):
        self.log(f"requested a duel")

        try:
            self.log(f"processing duel_request")
            roomid = data['room']
            room: ChatRoom = await database_sync_to_async(ChatRoom.objects.get)(id=roomid)
            opponent = await sync_to_async(room.get_other_user, thread_sensitive=True)(current_user=self.user)

            # clear former duel invitation and create new one
            outdated_duels = room.get_active_duels_for(self.user)
            self.log(f"found {await sync_to_async(len, thread_sensitive=True)(outdated_duels)} duels, removing them")
            for m in await self.outdated_duels(outdated_duels):
                await self.channel_layer.group_send(
                    f'chat_{roomid}',
                    m
                )

            message = await self.save_message(room=room, user=self.user, message="", is_duel=True)

            # craft request data
            data['duel_data'] = {
                'duel_id':           message.id,
                'duel_message_type': 'duel_request'
            }

            return message

        except KeyError as e:
            self.error("KeyError in request_duel")
            return

        except ChatRoom.DoesNotExist as e:
            self.error("Room does not exist")
            return

    async def accept_duel(self, data: dict):
        try:
            from game.utils.DuelManager import DUELMANAGER
            if DUELMANAGER.get_duel(self.user) is not None:
                self.log("User does already have an active duel", is_error=True)
                return

            room = await database_sync_to_async(ChatRoom.objects.get)(id=data['room'])
            challenger = await database_sync_to_async(room.get_other_user)(self.user)

            # recover duel message, should be unique else error
            message = await database_sync_to_async(room.messages.get)(is_duel=True, is_duel_expired=False, is_duel_accepted=False, user=challenger)
            message.is_duel_accepted = True
            await database_sync_to_async(message.save)()

            users = await database_sync_to_async(room.get_users_tuple)()
            if not DUELMANAGER.create_duel(users, message):
                self.log("could not create duel", is_error=True)
                return

            self.log("duel accepted")

            message = await self.save_message(room, self.user, "Duel have been accepted.")
            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                'type':      'message_response',
                'action':    'message',
                'room_id':   message.room.id,
                'user_id':   message.user.id,
                'username':  message.user.username,
                'picture':   message.user.picture.url if message.user.picture else None,
                'content':   message.content,
                'timestamp': elapsed_time(message.timestamp),
                'is_duel':   message.is_duel
            })

            await self.channel_layer.group_send(
                f"chat_{room.id}",
                {
                    "type":       "duel_response",
                    "action":     "duel_accept",
                    "challenger": challenger.id,
                    "challenged": self.user.id,
                    "room_id":    room.id
                }
            )

        except KeyError as e:
            self.log("KeyError in accept_duel", is_error=True)
            return

        except ChatRoom.DoesNotExist as e:
            self.log("Room does not exist in accept_duel", is_error=True)
            return
        
        except Message.DoesNotExist as e:
            self.log(f"Duel request does not exists in accept_duel", is_error=True)

    async def refuse_duel(self, data):
        try:
            from game.utils.DuelManager import DUELMANAGER
            roomid = data['room']
            room = await database_sync_to_async(ChatRoom.objects.get)(id=roomid)
            challenger = await sync_to_async(room.get_other_user)(current_user=self.user)
            duels = await sync_to_async(room.get_active_duels_for)(user=challenger)
            await self.outdated_duels(duels)

            message = await database_sync_to_async(Message.objects.create)(
                user=self.user,
                room=room,
                content="The duel have been refused"
            )

            rdata = {
                'type':      'message_response',
                'action': 'message',
                'room_id':   message.room.id,
                'user_id':   message.user.id,
                'username':  message.user.username,
                'picture':   message.user.picture.url if message.user.picture else None,
                'content':   message.content,
                'timestamp': elapsed_time(message.timestamp),
                'is_duel':   message.is_duel
            }

            await self.channel_layer.group_send(
                f"chat_{roomid}",
                rdata
            )

        except KeyError as e:
            self.error(f"KeyError in refuse_duel: {e.__str__()}")
            return

        except ChatRoom.DoesNotExist as e:
            self.error("Room does not exist")
            return

    async def duel_response(self, data):
        await self.send(text_data=json.dumps(data))

    
    def log(self, message: str, is_error: bool = False):
        logmsg = f"[{type(self).__name__} ({self.user.username})]: {message}"

        if is_error:
            logging.error(logmsg)
        else:
            logging.info(logmsg)

    def error(self, message: str):
        self.log(message, True)

    async def message(self, data):
        content = data.get('content')
        room_id = data.get('room_id')

        try:
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)
            message = await database_sync_to_async(
                Message.objects.create
            )(room=room, user=self.user, content=content)

            data = {
                'type':      'message_response',
                'room_id':   message.room.id,
                'user_id':   message.user.id,
                'username':  message.user.username,
                'picture':   message.user.picture.url if message.user.picture else None,
                'content':   message.content,
                'timestamp': elapsed_time(message.timestamp)
            }

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                data
            )

        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({
                'error': 'Room does not exist'
            }))


    async def message_response(self, data: dict):
        if not 'action' in data.keys():
            data['action'] = 'message'

        await self.send(text_data=json.dumps(data))




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
            self.log(e)

    
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

            # removing duels
            duels = await sync_to_async(room.get_active_duels_for)(user=self.user)
            messages = await self.outdated_duels(duels)
            for m in messages:
                await self.channel_layer.group_send(
                    f'chat_{room_id}',
                    m
                )

            self.log(f"due to {self.user.username} quitting, removed {len(messages)} duels")

            # removing room
            # await database_sync_to_async(room.quit)(self.user)
            # await self.channel_layer.group_discard({
            #     f'chat_{room_id}',
            #     self.channel_name
            # })
            #
            # await self.channel_layer.group_send(
            #     f'chat_{room_id}',
            #     {
            #         'type': 'quit_room_response',
            #         'room_id': room_id
            #     }
            # )

        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({
                'error': 'Room does not exist'
            }))

    async def quit_room_response(self, data):
        await self.send(text_data=json.dumps({
            'action':  'room_quit',
            'room_id': data['room_id']
        }))


    # get all rooms of an user
    @database_sync_to_async
    def get_user_rooms(self):
        rooms = self.user.rooms.all()
        return list(rooms)

    # save a message in the db
    @database_sync_to_async
    def save_message(self, room, user, message, is_duel=False):
        message = Message.objects.create(room=room, user=user, content=message, is_duel=is_duel)
        message.save()

        return message
