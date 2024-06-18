from channels.generic.websocket import AsyncJsonWebsocketConsumer
import typing
import threading

class GameConsumer(AsyncJsonWebsocketConsumer):
    rooms: typing.Dict[str, threading.Thread] = {}
    
    async def connect(self):
        await self.accept()
        await self.send_json({"message": self.scope["user"]})

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        await self.send_json({"message": self.scope["user"]})

    async def disconnect(self, close_code):
        pass
