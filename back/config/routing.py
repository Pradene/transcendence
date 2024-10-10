from django.urls import re_path
from chat.consumers import ChatConsumer
from account.consumers import FriendsConsumer
from game.consumers import GameConsumer, MatchmakingConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<game_id>\d+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/matchmaking/', MatchmakingConsumer.as_asgi()),
    re_path(r'ws/chat/', ChatConsumer.as_asgi()),
    re_path(r'ws/friends/', FriendsConsumer.as_asgi()),
]