from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import ChatRoom

@require_GET
def get_chatrooms(request):
    user = request.user
    chatrooms = ChatRoom.objects.filter(users=user)
    chatroom_list = [{'id': room.id, 'name': room.name} for room in chatrooms]
    return JsonResponse({'success': True, 'rooms': chatroom_list})

@require_GET
def search_chatroom(request):
    user = request.user
    query = request.GET.get('q', '')
    if query:
        chatrooms = ChatRoom.objects.filter(users=user, name__icontains=query)
        chatroom_list = [{'id': room.id, 'name': room.name} for room in chatrooms]
        return JsonResponse({'success': True, 'rooms': chatroom_list})
    
    return JsonResponse({'success': False, 'rooms': []})
