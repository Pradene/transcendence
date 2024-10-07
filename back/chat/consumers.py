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

from utils.logger import Logger

if typing.TYPE_CHECKING:
    from game.gameutils.DuelManager import DUELMANAGER


class ChatConsumer(AsyncWebsocketConsumer, Logger):

    def __init__(self):
        super().__init__()

    async def connect(self):
        self.user = self.scope['user']
        self._logClassIdentifier = self.user.username
        
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
            self.log("disconnecting...")

            rooms = await self.get_user_rooms()
            for room in rooms:
                duels = await database_sync_to_async(room.get_active_duels_for)(self.user)
                messages = await self.outdated_duels(duels)

                for message in messages:
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
                        }
                    )

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

        self.log(f"received: {data}")

        if 'room' not in data.keys() and 'room_id' not in data.keys():
            self.error("Invalid request, missing room or room_id field", is_error=True)
            return

        room = await database_sync_to_async(ChatRoom.objects.get)(id=data['room'] if 'room' in data.keys() else data['room_id'])
        if not await database_sync_to_async(room.is_in_room)(self.user):
            self.error(f"not in room {room.id}")
            return

        if message_type == 'message':
            await self.message(data)
        
        elif message_type == 'create_room':
            await self.create_room(data)
        
        elif message_type == 'join_room':
            await self.join_room(data)
        
        elif message_type == 'quit_room':
            await self.quit_room(data)

        # elif message_type == 'duel_request':
        #     await self.request_duel(data)

        elif message_type == 'duel_accept':
            await self.accept_duel(data)

        elif message_type == 'duel_refuse':
            await self.refuse_duel(data)

    @database_sync_to_async
    def outdated_duels(self, duels: typing.List[Message], create_message: bool = True) -> list[dict]:
        retv = []

        for duel in duels:
            duel.is_duel_expired = True
            duel.save()

            if not create_message:
                continue

            message = Message.objects.create(room=duel.room, user=self.user, content="A duel invitation has expired")
            message.save()

            retv.append({
                'type':      "message_response",
                'room_id':   message.room.id,
                'user_id':   message.user.id,
                'username':  message.user.username,
                'picture':   message.user.picture.url if message.user.picture else None,
                'content':   message.content,
                'timestamp': elapsed_time(message.timestamp)
            })

        return retv


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
            from game.gameutils.DuelManager import DUELMANAGER
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
                'action': 'message',
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
            from game.gameutils.DuelManager import DUELMANAGER
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

    async def message(self, data):
        content = data['content']
        room_id = data['room']
        is_duel = 'is_duel' in data.keys() and data['is_duel']

        try:
            room = await database_sync_to_async(ChatRoom.objects.get)(id=room_id)

            if is_duel:
                duel_action = data['duel_action']

                match duel_action:
                    case 'duel_request':
                        message = await self.request_duel(data)
                    case 'duel_accept':
                        await self.accept_duel(data)
                    case 'duel_refuse':
                        await self.refuse_duel(data)

            else:
                message = await self.save_message(room, self.user, content)

            rdata = {
                'type':      'message_response',
                'room_id':   message.room.id,
                'user_id':   message.user.id,
                'username':  message.user.username,
                'picture':   message.user.picture.url if message.user.picture else None,
                'content':   message.content,
                'timestamp': elapsed_time(message.timestamp),
                'is_duel':   message.is_duel
            }

            # merge dict with new datas for duel handling
            if is_duel:
                rdata = rdata | data['duel_data']

            await self.channel_layer.group_send(
                f'chat_{room.id}',
                rdata
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