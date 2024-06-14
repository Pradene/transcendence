from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from .models import ChatRoom, Message

def chat(request):
    rooms = ChatRoom.objects.all()
    return render(request, 'chat/chat.html', {'rooms': rooms})

def room(request, room_name):
    room = get_object_or_404(ChatRoom, name=room_name)
    messages = Message.objects.filter(room=room).order_by('timestamp')
    return render(request, 'chat/room.html', {'room': room, 'messages': messages})