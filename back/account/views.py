import json

from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import CustomUser


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
