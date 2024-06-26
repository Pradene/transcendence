from django.http import JsonResponse
from .models import ChatRoom, Message

def chat(request):
    rooms = ChatRoom.objects.all()
    return JsonResponse(rooms)
