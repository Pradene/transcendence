import json

from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from config.decorators import jwt_required

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

@jwt_required
def roomsView(request):
    user = request.user
    if request.method == "GET":
        try:
            rooms = ChatRoom.objects.filter(users=user)
            serializer = ChatRoomSerializer(rooms, many=True)
            return JsonResponse(serializer.data, safe=False, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            user_ids = data.get("user_ids", [])
            users = CustomUser.objects.filter(id__in=user_ids)

            if not users.exists():
                return JsonResponse({"error": "At least one user must be specified"}, status=400)

            room = ChatRoom.objects.create(name=name, is_private=False)
            room.users.set(users)
            room.save()

            serializer = ChatRoomSerializer(room)
            return JsonResponse(serializer.data, safe=False, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@jwt_required
@require_GET
def roomView(request, room_id):
    user = request.user
    room = get_object_or_404(
        ChatRoom.objects.filter(users=user, id=room_id)
    )

    messages = Message.objects.filter(room=room).order_by('timestamp')
    serializer = MessageSerializer(messages, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_GET
def searchRoomsView(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        rooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        serializer = ChatRoomSerializer(rooms, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
    
    return JsonResponse({}, status=400)
