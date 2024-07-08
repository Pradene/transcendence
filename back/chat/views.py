import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from .models import ChatRoom, Message

@login_required
@require_GET
def get_rooms(request):
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

    return JsonResponse({'success': True, 'rooms': chatroom_list})


@login_required
@require_GET
def get_room(request, room_id):
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

    return JsonResponse({'success': True, 'room': chatroom_info})


@login_required
@require_GET
def search_rooms(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        chatrooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        chatroom_list = [{'id': room.id, 'name': room.name} for room in chatrooms]
        return JsonResponse({'success': True, 'rooms': chatroom_list})
    
    return JsonResponse({'success': False, 'rooms': []})
