import logging

from django.http import JsonResponse
from django.db.models import Q

from config.decorators import jwt_required
from .models import Game, Tournament
from account.models import CustomUser


@jwt_required
def gameHistory(request):
    try:
        user = request.user
        games = Game.objects.filter(players=user, tournament=None)
        tournaments = Tournament.objects.filter(players=user)
        data = [game.toJSON() for game in games] + [tournament.toJSON() for tournament in tournaments]
        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@jwt_required
def gameStats(request):
    try:
        user = request.user
        games = Game.objects.filter(players=user)

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

@jwt_required
def gameInfo(request, gameid):
    try:
        game = Game.objects.get(id=gameid)
        data = game.toJSON()

        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'exists': False}, safe=False, status=500)

@jwt_required
def tournamentInfo(request, tournamentid):
    try:
        tournament = Tournament.objects.get(id=tournamentid)
        data = tournament.toJSON()
        return JsonResponse(data, safe=False, status=200)

    except Tournament.DoesNotExist as e:
        return JsonResponse({'error': "Tournament does not exist"}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
