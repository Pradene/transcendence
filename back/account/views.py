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
# from authenticate.models import BlackListedToken, OTP





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
