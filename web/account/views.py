import json
import jwt
import datetime
import logging

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse

from .models import CustomUser, BlackListedToken, FriendList, FriendRequest
from .utils import create_access_token, create_refresh_token, decode_token
from .serializers import FriendRequestSerializer, CustomUserSerializer
from config import settings
from config.decorators import jwt_required


@jwt_required
@require_GET
def userView(request, user_id=None):
    if user_id is None:
        user = request.user
    else:
        try:
            user = CustomUser.objects.get(id=user_id)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    serializer = CustomUserSerializer(user)
    return JsonResponse(serializer.data, safe=False, status=200)


# Search
@jwt_required
@require_GET
def searchUsersView(request):
    query = request.GET.get("q", "")
    if query:
        users = CustomUser.objects.filter(username__icontains=query)
        serializer = CustomUserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
    
    return JsonResponse({"error": "User not found"}, status=400)



#Friend Requests
@jwt_required
@require_GET
def getFriendsView(request):
    user = request.user
    friend_list, created = FriendList.objects.get_or_create(user=user)
    friends = friend_list.friends.all()
    serializer = CustomUserSerializer(friends, many=True)
    return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_GET
def getFriendRequestsView(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(receiver=user)
    serializer = FriendRequestSerializer(friend_requests, many=True)
    return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_POST
def sendFriendRequestView(request, user_id):
    sender = request.user
    receiver = CustomUser.objects.get(id=user_id)

    if sender == receiver:
        return JsonResponse({"error": "You cannot send to yourself"}, status=400)

    if FriendRequest.objects.filter(sender=sender, receiver=receiver):
        return JsonResponse({"error": "A friend request alreay exists"}, status=400)
    
    elif FriendRequest.objects.filter(sender=receiver, receiver=sender):
        return JsonResponse({"error": "A friend request alreay exists"}, status=400)
    
    else:
        friend_request = FriendRequest.objects.create(sender=sender, receiver=receiver)
        serializer = FriendRequestSerializer(friend_request)
        return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_POST
def acceptFriendRequestView(request, user_id):
    receiver = request.user
    try:
        sender = CustomUser.objects.get(id=user_id)
        friend_request = FriendRequest.objects.get(receiver=receiver, sender=sender)
        friend_request.accept()
        return JsonResponse({"message": "friend request accepted"}, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# Registration
@require_POST
def signupView(request):
    try:
        data = json.loads(request.body)
        
        username = data.get("username")
        password1 = data.get("password1")
        password2 = data.get("password2")

        if not username:
            return JsonResponse({"error": "This field is required."}, status=400)
        elif CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"error": "A user with that username already exists."}, status=400)

        if password1 != password2:
            return JsonResponse({"error": "The password doesn't match."}, status=400)
        # elif len(password1) < 8:
            # return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

        try:
            user = CustomUser.objects.create_user(username=username, password=password1)
            return JsonResponse({}, status=200)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_POST
def loginView(request):
    try:
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        try:
            user = authenticate(request, username=username, password=password)
            if user is None:
                return JsonResponse({"error": "Login failed"}, status=400)

        except Exception as auth_error:
            return JsonResponse({"error": str(auth_error)}, status=400)

        login(request, user)

        try:
            access_token = create_access_token(user)
            refresh_token = create_refresh_token(user)
            return JsonResponse({"access": access_token, "refresh": refresh_token}, status=200)
        
        except Exception as token_error:
            return JsonResponse({"error": str(token_error)}, status=400)

    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def checkLoginView(request):
    try:
        data = json.loads(request.body)

        refresh = data.get("refresh")
        user_id = decode_token(refresh)

        user = CustomUser.objects.get(id=user_id)
        if user.is_authenticated:
            return JsonResponse({"authenticated": True}, status=200)
        else:
            return JsonResponse({"authenticated": False}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_POST
def refreshTokenView(request):
    data = json.loads(request.body)
    token = data.get("refresh")

    if BlackListedToken.objects.filter(token=token).exists():
        return JsonResponse({"error": "Invalid token"}, status=400)

    user_id = decode_token(token)

    if user_id is not None:
        try:
            user = CustomUser.objects.get(id=user_id)
            access_token = create_access_token(user)
            return JsonResponse({"access": access_token}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid token"}, status=400)


@jwt_required
@require_POST
def logoutView(request):
    try:
        data = json.loads(request.body)

        refresh_token = data.get("refresh")
        
        token = BlackListedToken.objects.create(token=refresh_token)

        logout(request)
        return JsonResponse({}, status=200)

    except Exception as e:
        JsonResponse({"error": "Invalid token"}, status=400)
