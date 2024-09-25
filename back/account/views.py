import json
import jwt
import datetime
import logging
import pyotp
import os
import requests

from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.http import JsonResponse, HttpResponseRedirect
from django.core.mail import send_mail

from config import settings
from config.decorators import jwt_required

from .models import CustomUser, BlackListedToken, FriendList, FriendRequest, OTP

from .utils.token import create_access_token, create_refresh_token, decode_token
from .utils.otp import send_otp_code

from requests_oauthlib import OAuth2Session
from urllib.parse import urlencode


@jwt_required
@require_http_methods(["GET", "POST"])
def userView(request, user_id=None):
	if request.method == "GET":
		if user_id is None:
			user = request.user
		else:
			try:
				user = CustomUser.objects.get(id=user_id)
			except Exception as e:
				return JsonResponse({"error": str(e)}, status=400)

		data = user.toJSON(request.user)
		return JsonResponse(data, safe=False, status=200)

	elif request.method == "POST":
		try:
			# Update user profile
			user = request.user

			username = request.POST.get('username', user.username)
			bio = request.POST.get('bio', user.bio)
			email = request.POST.get('email', user.email)

			logging.info(f'{username} : {email}')

			if 'picture' in request.FILES:
				picture = request.FILES['picture']
			else:
				picture = user.picture

			if CustomUser.objects.exclude(id=user.id).filter(username=username).exists():
				return JsonResponse({'error': 'Username is already taken'}, status=400)
			
			user.username = username
			user.email = email
			user.bio = bio
			user.picture = picture
			
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
	try:
		query = request.GET.get("q", "")
		if query:
			users = CustomUser.objects.filter(username__icontains=query)
			data = [user.toJSON() for user in users]
			return JsonResponse(data, safe=False, status=200)

		return JsonResponse({"error": "User not found"}, status=400)
	
	except Exception as e:
		return JsonResponse({}, status=400)



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
	data = [friend.toJSON() for friend in friends]
	return JsonResponse(serializer.data, safe=False, status=200)


@jwt_required
@require_http_methods(["GET"])
def getFriendRequestsView(request):
	try:
		user = request.user
		requests = FriendRequest.objects.filter(receiver=user)
		data = [request.toJSON() for request in requests]
		return JsonResponse(data, safe=False, status=200)
	except Exception as e:
		return JsonResponse({}, status=400)
	

# Registration
@require_http_methods(["POST"])
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
			'grant_type': 'client_credentials',
			'client_id': uid,
			'redirect_uri': redirect_uri,
			'response_type': 'code',
			'scope': 'public'
		}

		url = f'{auth_url}?{urlencode(params)}'
		return JsonResponse({'url': url}, status=200)
	
	except Exception as e:
		logging.info(f'error: {e}')


def login_42user(token):
	try:
		headers = {
			"Authorization": f"Bearer {token}"
		}

		response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)
		data = response.json()

		id = data.get("id")
		login = data.get("login")
		email = data.get("email")

		if CustomUser.objects.filter(api_42_id=id).exists():
			user = CustomUser.objects.get(api_42_id=id)
		else:
			user = CustomUser.objects.create_user(
				username=login,
				password=None,
				email=email,
				api_42_id=id
			)

		return user
	except Exception as e:
		logging.info(f'error: {e}')


def ft_auth_callback(request):
	code = request.GET.get('code', '')
	if code is None:
		return JsonResponse({'error': 'No code from api'}, status=400)

	uid = settings.FT_API_UID
	secret = settings.FT_API_SECRET
	redirect_uri = f'https://{os.getenv("HOST_HOSTNAME")}:5000/api/users/ft_auth/callback/'

	data = {
		"client_id": uid,
		'client_secret': secret,
		"grant_type": 'authorization_code',
		"code": code,
		'redirect_uri': redirect_uri
	}
	
	token_url = "https://api.intra.42.fr/oauth/token"
	response = requests.post(token_url, data=data)

	if response.status_code != 200:
		logging.info(f'Error response from token request: {response.status_code} = {response.text}')
		return JsonResponse({'error': 'Failed to obtain token'}, status=400)
	
	token_data = response.json()
	access_token = token_data.get("access_token")

	user = login_42user(access_token)
	login(request, user)

	at, access_exp = create_access_token(user)
	rt, refresh_exp = create_refresh_token(user)

	response = HttpResponseRedirect(f'https://{os.getenv("HOST_HOSTNAME")}:5000/')

	response.set_cookie(
		"access_token", at,
		httponly=False, secure=True,
		samesite="Lax", max_age=access_exp
	)
	
	response.set_cookie(
		"refresh_token", rt,
		httponly=True, secure=True,
		samesite="Lax", max_age=refresh_exp
	)

	return response


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


@require_http_methods(["POST"])
def check2FA(request):
	try:
		user_id = request.session.get('pre_2fa_user_id')
		if user_id is None:
			return JsonResponse({"error": "Access denied. Please login first."}, status=403)
		
		data = json.loads(request.body)
		code = data.get('code')
		user = CustomUser.objects.get(id=user_id)

		if OTP.validate(user, code):
			login(request, user)
			
			access_token, access_exp = create_access_token(user)
			refresh_token, refresh_exp = create_refresh_token(user)
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
		
		else:
			return JsonResponse({}, status=400)
	
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["POST"])
def refreshTokenView(request):
	token = request.COOKIES.get("refresh_token")

	if token is None:
		return JsonResponse({"error": "Invalid token"}, status=400)

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

		response = JsonResponse({}, status=200)
		response.delete_cookie("access_token")
		response.delete_cookie("refresh_token")

		return response

	except Exception as e:
		JsonResponse({"error": "Invalid token"}, status=400)
