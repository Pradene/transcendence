from channels.generic.websocket import AsyncJsonWebsocketConsumer

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        await self.send_json({"message": "Received"})

    async def disconnect(self, close_code):
        pass
