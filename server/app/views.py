from django.http import HttpResponse
from django.shortcuts import render

def home(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'app/app.html')
    return render(request, 'app/index.html')