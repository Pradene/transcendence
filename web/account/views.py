import json
import jwt
import datetime
import logging

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse

from .models import CustomUser
from config import settings


@login_required
@require_GET
def search_users(request):
    query = request.GET.get('q', '')
    if query:
        users = CustomUser.objects.filter(username__icontains=query)
        user_list = [{'id': user.id, 'name': user.username} for user in users]
        return JsonResponse({'success': True, 'users': user_list})
    
    return JsonResponse({'success': False, 'users': []})


@login_required
@require_GET
def get_friends(request):
    user = request.user
    friends = CustomUser.objects.filter(friends=user)
    friend_list = [{'id': friend.id, 'name': friend.username} for friend in friends]
    return JsonResponse({'success': True, 'users': friend_list})


@require_POST
def user_signup(request):
    try:
        data = json.loads(request.body)
        
        username = data.get('username')
        password1 = data.get('password1')
        password2 = data.get('password2')

        errors = {}

        if not username:
            errors['username'] = 'This field is required.'
        elif CustomUser.objects.filter(username=username).exists():
            errors['username'] = 'A user with that username already exists.'

        if password1 != password2:
            errors['password'] = "The password doesn't match."
        elif len(password1) < 8:
            errors['password'] = 'Password must be at least 8 characters long.'

        if errors:
            return JsonResponse({'success': False, 'errors': errors})

        try:
            user = CustomUser.objects.create_user(username=username, password=password1)
            user.save()
            return JsonResponse({'success': True})
        
        except Exception as e:
            return JsonResponse({'success': False, 'errors': str(e)})
     
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'errors': 'Invalid JSON'})


def create_token(user_id):
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            'iat': datetime.datetime.utcnow(),
            'user': user_id
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    except Exception as e:
        return e


@csrf_exempt
@require_POST
def user_login(request):
    try:
        data = json.loads(request.body)

        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            token = create_token(user.id)
            return JsonResponse({'success': True, 'token': token})
        else:
            return JsonResponse({'success': False, 'errors': 'Login failed'})
    
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'errors': 'Invalid JSON'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'errors': str(e)})

@require_POST
def user_logout(request):
    logging.log(logging.INFO, 'logout')
    logout(request)
    return JsonResponse({'success': True})