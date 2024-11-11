from django.urls import path
from chat.consumers import ChatConsumer
from account.consumers import FriendsConsumer
from game.consumers import LocalGameConsumer,GameConsumer, MatchmakingConsumer, TournamentConsumer

websocket_urlpatterns = [
    path('ws/tournament/<int:tournament_id>/', TournamentConsumer.as_asgi()),
    path('ws/game/<int:game_id>/', GameConsumer.as_asgi()),
    path('ws/localgame/', LocalGameConsumer.as_asgi()),
    path('ws/matchmaking/<str:type>/', MatchmakingConsumer.as_asgi()),
    path('ws/chat/', ChatConsumer.as_asgi()),
    path('ws/friends/', FriendsConsumer.as_asgi()),
]