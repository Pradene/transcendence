import json

from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from config.decorators import jwt_required

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

@jwt_required
@require_GET
def getRoomsView(request):
    user = request.user
    try:
        rooms = ChatRoom.objects.filter(users=user)
        serializer = ChatRoomSerializer(rooms, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)



@jwt_required
@require_GET
def getRoomView(request, room_id):
    user = request.user
    chatroom = get_object_or_404(
        ChatRoom.objects.filter(users=user, id=room_id)
    )

    messages = Message.objects.filter(room=chatroom).order_by('timestamp')
    serializer = MessageSerializer(messages, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_GET
def searchRoomsView(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        chatrooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        serializer = ChatRoomSerializer(rooms, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
    
    return JsonResponse({}, status=400)
