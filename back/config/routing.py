from django.urls import re_path
from channels.routing import URLRouter
from chat.routing import websocket_urlpatterns as chat_ws_patterns

websocket_urlpatterns = [
    re_path('ws/chat/room/<str:room_name>', URLRouter(chat_ws_patterns))
]