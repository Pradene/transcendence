import logging

from django.http import JsonResponse
from django.db.models import Q

from config.decorators import jwt_required
from .models import GameModel, TournamentModel
from account.models import CustomUser


@jwt_required
def gameHistory(request):
    try:
        user = request.user
        tournaments = TournamentModel.objects.filter(users__in=[user])
        tournament_gameids = [[t.game1.id, t.game2.id, t.game3.id] for t in tournaments]
        tournament_gameids = [gameid for sublist in tournament_gameids for gameid in sublist]

        games = GameModel.objects.filter(~Q(id__in=tournament_gameids), Q(user1=user) | Q(user2=user))

        data = [game.toJSON(user) for game in games] + [tournament.toJSON() for tournament in tournaments]
        data = sorted(data, key=lambda element: element['date'])
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

@jwt_required
def gameInfo(request, gameid):
    try:
        game = GameModel.objects.get(id=gameid)
        data = game.toJSON(request.user)

        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'exists': False}, safe=False, status=500)

@jwt_required
def tournamentInfo(request, tournamentid):
    try:
        tournament = TournamentModel.objects.get(id=tournamentid)
        data = {
            'winner': tournament.winner.username,
            'data': [
                tournament.game1.toJSON(request.user),
                tournament.game2.toJSON(request.user),
                tournament.game3.toJSON(request.user)
            ],
            'exists': True
        }

        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'exists': False}, safe=False, status=500)