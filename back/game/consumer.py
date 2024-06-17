from channels.consumer import AsyncConsumer

class GameConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        print("connected", event)

    async def websocket_receive(self, event):
        print("receive", event)

    async def websocket_disconnect(self, event):
        print("disconnected", event)