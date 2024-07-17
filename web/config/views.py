from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def getCSRFTokenView(request):
    token = get_token(request)
    return JsonResponse({'token': token}, status=200)

@csrf_exempt
def base(request):
    return render(request, 'index.html')