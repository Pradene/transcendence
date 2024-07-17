import json
import jwt
import datetime
import logging

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse

from .models import CustomUser, BlackListedToken
from config import settings
from config.decorators import jwt_required
from .utils import create_access_token, create_refresh_token, decode_token


@jwt_required
@require_GET
def searchUsersView(request):
    query = request.GET.get('q', '')
    if query:
        users = CustomUser.objects.filter(username__icontains=query)
        user_list = [{'id': user.id, 'name': user.username} for user in users]
        return JsonResponse({'users': user_list}, status=200)
    
    return JsonResponse({'users': []}, status=400)


@jwt_required
@require_GET
def getFriendsView(request):
    user = request.user
    friends = CustomUser.objects.filter(friends=user)
    friend_list = [{'id': friend.id, 'name': friend.username} for friend in friends]
    return JsonResponse({'users': friend_list}, status=200)


@require_POST
def userSignupView(request):
    try:
        data = json.loads(request.body)
        
        username = data.get('username')
        password1 = data.get('password1')
        password2 = data.get('password2')

        error = {}

        if not username:
            error['username'] = 'This field is required.'
        elif CustomUser.objects.filter(username=username).exists():
            error['username'] = 'A user with that username already exists.'

        if password1 != password2:
            error['password'] = "The password doesn't match."
        # elif len(password1) < 8:
        #     error['password'] = 'Password must be at least 8 characters long.'

        if error:
            return JsonResponse({'error': error}, status=400)

        try:
            user = CustomUser.objects.create_user(username=username, password=password1)
            user.save()
            return JsonResponse({}, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
     
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@require_POST
def userLoginView(request):
    try:
        data = json.loads(request.body)

        username = data.get('username')
        password = data.get('password')
        
        try:
            user = authenticate(request, username=username, password=password)
            if user is None:
                return JsonResponse({'error': 'Login failed'}, status=400)

        except Exception as auth_error:
            return JsonResponse({'error': str(auth_error)}, status=400)

        login(request, user)

        try:
            access_token = create_access_token(user)
            refresh_token = create_refresh_token(user)
        except Exception as token_error:
            return JsonResponse({'error': str(token_error)}, status=400)

        return JsonResponse({'access': access_token, 'refresh': refresh_token}, status=200)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@jwt_required
@require_POST
def refreshTokenView(request):
    refresh_token = request.data.get('refresh')
    user_id = decode_token(refresh_token)

    if user_id is not None:
        try:
            user = CustomUser.objects.get(id=user_id)
            access_token = create_access_token(user)
            return JsonResponse({'access': access_token}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid token'}, status=400)


@jwt_required
@require_POST
def userLogoutView(request):
    logging.info('logout')
    try:
        data = json.loads(request.body)
        logging.info('Data parsed')

        refresh_token = data.get('refresh')
        logging.info(f'{refresh_token}')
        
        token = BlackListedToken.objects.create(token=refresh_token)
        token.save()

        logging.info('token deleted')

        logout(request)
        return JsonResponse({}, status=200)

    except Exception as e:
        JsonResponse({'error': 'Invalid token'}, status=400)
