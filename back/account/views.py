import json
import jwt
import datetime
import logging
import pyotp
import os
import requests

from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponseRedirect
from django.core.mail import send_mail

from config import settings
from config.decorators import jwt_required

from .models import CustomUser, BlackListedToken, FriendList, FriendRequest
from .serializers import FriendRequestSerializer, CustomUserSerializer
from .utils.token import create_access_token, create_refresh_token, decode_token

from .utils.serializers import serialize_user
from .utils.otp import send_otp_code, validate_otp

from requests_oauthlib import OAuth2Session
from urllib.parse import urlencode


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

	logging.info(f'{user.username} : {request.user.username}')
	user_data = serialize_user(user, request.user)
	return JsonResponse(user_data, status=200)


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
@require_GET
def getFriendRequestsView(request):
	user = request.user
	friend_requests = FriendRequest.objects.filter(receiver=user)
	serializer = FriendRequestSerializer(friend_requests, many=True)
	return JsonResponse(serializer.data, safe=False, status=200)


# Registration
@require_POST
def signupView(request):
	try:
		data = json.loads(request.body)
		
		email = data.get("email")
		username = data.get("username")
		password = data.get("password")
		password_confirmation = data.get("password_confirmation")

		if not username or not email or not password:
			return JsonResponse({"error": "This field is required."}, status=400)
		elif CustomUser.objects.filter(username=username).exists():
			return JsonResponse({"error": "A user with that username already exists."}, status=400)

		if password != password_confirmation:
			return JsonResponse({"error": "The password doesn't match."}, status=400)
		# elif len(password1) < 8:
			# return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

		try:
			subject = "Account creation confirmation"
			message = f"Dear {username},\n\nYour accounthas been created.\n\nThank you!\n\nIf you're not the one that create this account please contact us at pong.point42@gmail.com"
			from_email = settings.DEFAULT_FROM_EMAIL
			recipient_list = [email]
			ret = send_mail(subject, message, from_email, recipient_list)
			logging.info(ret)
			if ret == 0:
				return JsonResponse({"error": "Invalid email"}, status=400)
			user = CustomUser.objects.create_user(email=email, username=username, password=password)
			return JsonResponse({}, status=200)
		
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=400)

	except json.JSONDecodeError:
		return JsonResponse({"error": "Invalid JSON"}, status=400)


def ft_auth(request):
	try:
		uid = settings.FT_API_UID
		auth_url = "https://api.intra.42.fr/oauth/authorize"
		redirect_uri = f'https://{os.getenv("HOST_HOSTNAME")}:5000/api/users/ft_auth/callback/'

		params = {
			'client_id': uid,
			'redirect_uri': redirect_uri,
			'grant_type': 'client_credentials',
			'response_type': 'code',
			'scope': 'public'
		}

		url = f'{auth_url}?{urlencode(params)}'

		logging.info(f'url: {url}')

		return JsonResponse({'url': url})
	
	except Exception as e:
		logging.info(f'error: {e}')


def ft_auth_callback(request):

	code = request.GET.get('code', '')
	if code is None :
		return JsonResponse({'error': 'No code from api'}, status=400)

	uid = settings.FT_API_UID
	token_url = "https://api.intra.42.fr/oauth/token"
	redirect_uri = f'https://{os.getenv("HOST_HOSTNAME")}:5000/api/users/ft_auth/callback/'

	data = {
		"grant_type": 'authorization_code',
		"client_id": uid,
		"code": code,
		'redirect_uri': redirect_uri
	}
	
	response = requests.post(token_url, data=data)
	if response.status_code != 200:
		return JsonResponse({'error': 'Failed to obtain token'}, status=400)
	
	token_data = response.json()
	logging.info(f'token: {token_data}')
	
	response = HttpResponseRedirect("/")

	# response.set_cookie(
	# 	"access_token", access_token,
	# 	httponly=False, secure=True,
	# 	samesite="Lax", max_age=300
	# )
	
	# response.set_cookie(
	# 	"refresh_token", refresh_token,
	# 	httponly=True, secure=True,
	# 	samesite="Lax", max_age=3600
	# )

	return response

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

		except Exception as e:
			return JsonResponse({"error": str(e)}, status=400)

		try:
			request.session['pre_2fa_user_id'] = user.id
			send_otp_code(user)

			return JsonResponse({}, status=200)
		
		except Exception as token_error:
			return JsonResponse({"error": str(token_error)}, status=400)

	
	except json.JSONDecodeError:
		return JsonResponse({"error": "Invalid JSON"}, status=400)
	
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=400)

@require_POST
def check2FA(request):
	try:
		user_id = request.session.get('pre_2fa_user_id')
		if user_id is None:
			return JsonResponse({"error": "Access denied. Please login first."}, status=403)
		
		data = json.loads(request.body)
		otp_code = data.get('code')
		user = CustomUser.objects.get(id=user_id)

		if validate_otp(user, otp_code):
			login(request, user)
			
			access_token = create_access_token(user)
			refresh_token = create_refresh_token(user)
			response = JsonResponse({}, status=200)

			response.set_cookie(
				"access_token", access_token,
				httponly=False, secure=True,
				samesite="Lax", max_age=300
			)

			response.set_cookie(
				"refresh_token", refresh_token,
				httponly=True, secure=True,
				samesite="Lax", max_age=3600
			)

			return response
		
		else:
			return JsonResponse({}, status=400)
	
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
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


@require_POST
def refreshTokenView(request):
	token = request.COOKIES.get("refresh_token")

	if BlackListedToken.objects.filter(token=token).exists():
		return JsonResponse({"error": "Invalid token"}, status=400)

	user_id = decode_token(token)

	if user_id is not None:
		try:
			user = CustomUser.objects.get(id=user_id)
			access_token = create_access_token(user)
			response = JsonResponse({}, status=200)
			response.set_cookie(
				"access_token", access_token,
				httponly=True, secure=True,
				samesite="Lax", max_age=300
			)
			return response
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=400)
	else:
		return JsonResponse({"error": "Invalid token"}, status=400)


@jwt_required
@require_POST
def logoutView(request):
	try:
		refresh_token = request.COOKIES.get("refresh_token")
		token = BlackListedToken.objects.create(token=refresh_token)

		logout(request)
		return JsonResponse({}, status=200)

	except Exception as e:
		JsonResponse({"error": "Invalid token"}, status=400)
