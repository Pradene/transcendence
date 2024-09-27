import logging

from django.http import JsonResponse
from django.db.models import Q

from config.decorators import jwt_required
from .models import GameModel
from account.models import CustomUser


@jwt_required
def gameHistory(request):
    try:
        user = request.user
        games = GameModel.objects.filter(Q(user1=user) | Q(user2=user))
        data = [game.toJSON(user) for game in games]
        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@jwt_required
def gameStats(request):
    try:
        user = request.user
        games = GameModel.objects.filter(Q(user1=user) | Q(user2=user))

        wins = games.filter(winner=user).count()
        loses = games.exclude(winner=user).count()

        total_games = games.count()

        data = {
            'total_games': total_games,
            'wins': wins,
            'loses': loses,
        }

        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)