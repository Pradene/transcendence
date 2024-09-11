import json

from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from config.decorators import jwt_required

from .models import ChatRoom, Message
from .utils.elapsed_time import elapsed_time

@jwt_required
def roomsView(request):
    user = request.user
    if request.method == "GET":
        try:
            rooms = ChatRoom.objects.filter(users=user)
            data = [room.toJSON() for room in rooms]
            return JsonResponse(data, safe=False, status=200)

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

            data = room.toJSON()
            return JsonResponse(data, safe=False, status=200)
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
    messages_data = [{
        'user_id': message.user.id,
        'username': message.user.username,
        'picture': message.user.picture.url if message.user.picture else None,
        'content': message.content,
        'timestamp': elapsed_time(message.timestamp)
    } for message in messages]

    users = room.users.all()
    users_data = [{
        'id': user.id,
        'username': user.username,
        'profile_picture': user.picture.url if user.picture else None,
    } for user in users]

    if room.is_private:
        other_user = room.users.exclude(id=user.id).first()
        if not other_user:
            return JsonResponse({'error': 'no other user found in this room'}, status=400)
        room_name = other_user.username
        room_picture = user.picture.url if user.picture else None

    else:
        room_name = room.name
        room_picture = room.picture

    data = {
        'room_name': room_name,
        'room_picture': room_picture,
        'users': users_data,
        'messages': messages_data
    }
    
    return JsonResponse(data, status=200)


@jwt_required
@require_GET
def searchRoomsView(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        rooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        data = [room.toJSON() for room in rooms]
        return JsonResponse(data, safe=False, status=200)
    
    return JsonResponse({}, status=400)
