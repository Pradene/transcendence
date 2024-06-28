from django.shortcuts import render

def base(request):
    return render(request, 'index.html')

def baseID(request, id):
    return render(request, 'index.html')