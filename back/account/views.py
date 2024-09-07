import json
import jwt
import datetime
import logging

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse

from config import settings
from config.decorators import jwt_required

from .models import CustomUser, BlackListedToken, FriendList, FriendRequest
from .serializers import FriendRequestSerializer, CustomUserSerializer
from .utils.token import create_access_token, create_refresh_token, decode_token

from .utils.serializers import serialize_user

@jwt_required
@require_http_methods(["GET", "PUT"])
def userView(request, user_id=None):
    if request.method == "GET":
        if user_id is None:
            user = request.user
        else:
            try:
                user = CustomUser.objects.get(id=user_id)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

        user_data = serialize_user(user, request.user)
        return JsonResponse(user_data, status=200)

    elif request.method == "PUT":
        try:
            # Parse JSON request body
            data = json.loads(request.body)

            # Get user from database
            user = CustomUser.objects.get(id=request.user.id)

            # Update user profile
            user.username = data.get('username', user.username)
            user.bio = data.get('bio', user.bio)  # Update only if provided
            if (picture in request.FILES):
                user.picture = request.FILES['picture']
            
            user.save()
            
            return JsonResponse({'message': 'Profile updated successfully'}, status=200)
    
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'Profile does not exist'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


# Search
@jwt_required
@require_http_methods(["GET"])
def searchUsersView(request):
    query = request.GET.get("q", "")
    if query:
        users = CustomUser.objects.filter(username__icontains=query)
        serializer = CustomUserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
    
    return JsonResponse({"error": "User not found"}, status=400)



#Friend Requests
@jwt_required
@require_http_methods(["GET"])
def getFriendsView(request, user_id=None):
    if user_id is None:
        user = request.user
    else:
        try:
            user = CustomUser.objects.get(id=user_id)
        except:
            return JsonResponse({"error": str(e)}, status=400)

    friend_list, created = FriendList.objects.get_or_create(user=user)
    friends = friend_list.friends.all()
    serializer = CustomUserSerializer(friends, many=True)
    return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_http_methods(["GET"])
def getFriendRequestsView(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(receiver=user)
    serializer = FriendRequestSerializer(friend_requests, many=True)
    return JsonResponse(serializer.data, safe=False, status=200)
    

# Registration
@require_http_methods(["POST"])
def signupView(request):
    try:
        data = json.loads(request.body)
        
        username = data.get("username")
        password = data.get("password")
        password_confirmation = data.get("password_confirmation")

        if not username:
            return JsonResponse({"error": "This field is required."}, status=400)
        elif CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"error": "A user with that username already exists."}, status=400)

        if password != password_confirmation:
            return JsonResponse({"error": "The password doesn't match."}, status=400)
        # elif len(password1) < 8:
            # return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

        try:
            user = CustomUser.objects.create_user(username=username, password=password)
            return JsonResponse({}, status=200)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["POST"])
def loginView(request):
    try:
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")
        remember_me = data.get("remember_me", False)

        try:
            user = authenticate(request, username=username, password=password)
            if user is None:
                return JsonResponse({"error": "Login failed"}, status=400)

        except Exception as auth_error:
            return JsonResponse({"error": str(auth_error)}, status=400)

        login(request, user)

        try:
            access_token, access_exp = create_access_token(user)
            refresh_token, refresh_exp = create_refresh_token(user, remember_me)
            response = JsonResponse({}, status=200)

            response.set_cookie(
                "access_token", access_token,
                httponly=False, secure=True,
                samesite="Lax", max_age=access_exp
            )

            response.set_cookie(
                "refresh_token", refresh_token,
                httponly=True, secure=True,
                samesite="Lax", max_age=refresh_exp
            )

            return response
        
        except Exception as token_error:
            return JsonResponse({"error": str(token_error)}, status=400)

    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def checkLoginView(request):
    try:
        token = request.COOKIES.get("refresh_token")
        if BlackListedToken.objects.filter(token=token).exists():
            return JsonResponse({"authenticated": False}, status=200)

        user_id = decode_token(token)

        user = CustomUser.objects.get(id=user_id)
        if user.is_authenticated:
            return JsonResponse({"authenticated": True}, status=200)
        else:
            return JsonResponse({"authenticated": False}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["POST"])
def refreshTokenView(request):
    token = request.COOKIES.get("refresh_token")

    if BlackListedToken.objects.filter(token=token).exists():
        return JsonResponse({"error": "Invalid token"}, status=400)

    user_id = decode_token(token)

    if user_id is not None:
        try:
            user = CustomUser.objects.get(id=user_id)
            access_token, access_exp = create_access_token(user)

            response = JsonResponse({}, status=200)
            
            response.set_cookie(
                "access_token", access_token,
                httponly=False, secure=True,
                samesite="Lax", max_age=access_exp
            )
            
            return response
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    else:
        return JsonResponse({"error": "Invalid token"}, status=400)


@jwt_required
@require_http_methods(["POST"])
def logoutView(request):
    try:
        refresh_token = request.COOKIES.get("refresh_token")
        token = BlackListedToken.objects.create(token=refresh_token)

        logout(request)

        return JsonResponse({}, status=200)

    except Exception as e:
        JsonResponse({"error": "Invalid token"}, status=400)
