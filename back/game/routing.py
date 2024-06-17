from django.urls import path
from game.consumer import GameConsumer

game_urlpatterns = [
    path('ws/game', GameConsumer.as_asgi())
]
