import json

from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from config.decorators import jwt_required
from .models import ChatRoom, Message

@jwt_required
@require_GET
def getRoomsView(request):
    user = request.user
    chatrooms = ChatRoom.objects.filter(users=user)

    chatroom_list = []
    for chatroom in chatrooms:
        last_message = Message.objects.filter(room=chatroom).order_by('-timestamp').first()
        
        chatroom_info = {
            'id': chatroom.id,
            'name': chatroom.name,
            'last_message': {
                'content': last_message.content if last_message else '',
                'timestamp': last_message.timestamp if last_message else None
            } if last_message else None
        }
        chatroom_list.append(chatroom_info)

    return JsonResponse({'rooms': chatroom_list}, status=200)


@jwt_required
@require_GET
def getRoomView(request, room_id):
    user = request.user
    chatroom = get_object_or_404(
        ChatRoom.objects.filter(users=user, id=room_id)
    )

    messages = Message.objects.filter(room=chatroom).order_by('timestamp')
    message_list = [{'content': message.content, 'timestamp': message.timestamp, 'user': message.user.username} for message in messages]

    chatroom_info = {
        'id': chatroom.id,
        'name': chatroom.name,
        'messages': message_list
    }

    return JsonResponse({'room': chatroom_info}, status=200)


@jwt_required
@require_GET
def searchRoomsView(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        chatrooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        chatroom_list = [{'id': room.id, 'name': room.name} for room in chatrooms]
        return JsonResponse({'rooms': chatroom_list}, status=200)
    
    return JsonResponse(status=400)
