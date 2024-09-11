from django.http import JsonResponse

from .models import GameModel
# from .serializers import GameModelSerializer
from account.models import CustomUser

def gameHistory(request):
    player = request.user
    try:
        games = GameModel.objects.filter(user1=player).select_related('user1', 'user2', 'winner') | \
                GameModel.objects.filter(user2=player).select_related('user1', 'user2', 'winner')
        # serializer = GameModelSerializer(games, many=True, context={'request': request})
        # return JsonResponse(serializer.data, safe=False, status=200)
        return JsonResponse({}, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)