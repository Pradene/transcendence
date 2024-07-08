import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
# from django.contrib.sessions.models import Session
from django.http import JsonResponse

from .models import CustomUser


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


@require_POST
def user_login(request):
    try:
        data = json.loads(request.body)

        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': 'Login failed'})
    
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'errors': 'Invalid JSON'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'errors': str(e)})

@login_required
@require_POST
def user_logout(request):
    logout(request)
    return JsonResponse({'success': True})