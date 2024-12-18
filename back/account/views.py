import json
import jwt
import datetime
import logging
import pyotp
import os
import requests

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from config import settings
from config.decorators import jwt_required

from .models import CustomUser, FriendList, FriendRequest


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
			user: CustomUser = request.user

			username = request.POST.get('username', user.username)
			bio = request.POST.get('bio', user.bio)
			email = request.POST.get('email', user.email)
			is_2fa_enabled = request.POST.get('is_2fa_enabled', user.is_2fa_enabled)
			language = request.POST.get('language', user.language)

			if 'picture' in request.FILES:
				picture = request.FILES['picture']
			else:
				picture = user.picture

			if CustomUser.objects.exclude(id=user.id).filter(username=username).exists():
				return JsonResponse({'error': 'Username is already taken'}, status=400)

			logging.info("Updating user profile")
			logging.info(f"Username: {username}")
			logging.info(f"Email: {email}")
			logging.info(f"Bio: {bio}")
			logging.info(f"Picture: {picture}")
			logging.info(f"2FA: {is_2fa_enabled}")

			user.username = username
			user.email = email
			user.bio = bio
			user.picture = picture
			user.is_2fa_enabled = True if is_2fa_enabled == u'true' else False
			user.language = language

			logging.info(f"2FA test: {user.is_2fa_enabled}")

			user.save()

			logging.info(f'user : {user}')

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
	try:
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
		return JsonResponse(data, safe=False, status=200)

	except Exception as e:
		return JsonResponse({}, status=400)


@jwt_required
@require_http_methods(["GET"])
def getFriendRequestsView(request, user_id=None):
	try:
		if user_id is None:
			user = request.user
		else:
			try:
				user = CustomUser.objects.get(id=user_id)
			except:
				return JsonResponse({"error": str(e)}, status=400)

		requests = FriendRequest.objects.filter(receiver=user)
		data = [request.toJSON() for request in requests]
		return JsonResponse(data, safe=False, status=200)

	except Exception as e:
		return JsonResponse({}, status=400)

@jwt_required
@require_http_methods(["GET"])
def userLevel(request, user_id):
	try:
		user = request.user

		data = {
			'level': user.level,
			'xp': user.xp,
			'requiredxp': user.level * 100
		}

		return JsonResponse(data, safe=False, status=200)

	except Exception as e:
		logging.error(f'[userLevel]: {e.__str__()}')
		return JsonResponse({}, status=400)

@require_http_methods(["GET"])
def getLanguage(request):
	try:
		# if user logged in
		if request.user.is_authenticated:
			return JsonResponse({'language': request.user.language}, status=200)
		else:
			return JsonResponse({'language': 'none'}, status=200)

	# do not bother about exceptions
	except Exception as e:
		return JsonResponse({'language': 'none'}, status=200)
