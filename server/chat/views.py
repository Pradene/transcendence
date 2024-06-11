from django.http import HttpResponse
from django.shortcuts import render

def chat(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'chat/chat.html')
    return render(request, 'chat/index.html')