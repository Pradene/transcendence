from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('history/', views.gameHistory),
    path('stats/', views.gameStats),
    path('gameinfo/<int:gameid>/', views.gameInfo),
    path('tournamentinfo/<int:tournamentid>/', views.tournamentInfo),
]
