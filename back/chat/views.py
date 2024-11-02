import json
import logging

from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from itertools import chain
from operator import itemgetter

from config.decorators import jwt_required

from .models import ChatRoom, Message, Invitation
from .utils.elapsed_time import elapsed_time

@jwt_required
def roomsView(request):
	user = request.user
	if request.method == "GET":
		try:
			rooms = ChatRoom.objects.filter(users=user)
			data = [room.toJSON(user) for room in rooms]
			return JsonResponse(data, safe=False, status=200)

		except Exception as e:
			logging.info(e)
			return JsonResponse({'error': str(e)}, status=400)
	
"""		elif request.method == "POST":
		try:
			data = json.loads(request.body)
			user_ids = data.get("user_ids", [])
			users = CustomUser.objects.filter(id__in=user_ids)

			if not users.exists():
				return JsonResponse({"error": "At least one user must be specified"}, status=400)

			room = ChatRoom.objects.create(is_private=False)
			room.users.set(users)
			room.save()

			data = room.toJSON(user)
			return JsonResponse(data, safe=False, status=200)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=400) """


@jwt_required
@require_GET
def roomView(request, room_id):
	user = request.user
	room = get_object_or_404(
		ChatRoom.objects.filter(users=user, id=room_id)
	)

	messages = Message.objects.filter(room=room).order_by('timestamp')

	messages_data = [{
		'type': 'message',
		'sender': message.user.toJSON(),
		'content': message.content,
		'elapsed_timestamp': elapsed_time(message.timestamp),
		'timestamp': message.timestamp
	} for message in messages]
	
	invitations = Invitation.objects.filter(room=room).order_by('created_at')
	
	invitations_data = [{
		'id': invitation.id,
		'type': 'invitation',
		'sender': invitation.sender.toJSON(),
		'elapsed_timestamp': elapsed_time(invitation.created_at),
		'timestamp': invitation.created_at,
		'status': invitation.status
	} for invitation in invitations]

	# is a duel have been played, fetch info about game
	logging.info(f"[ROOM_VIEW]: Fetching duels data in room")

	for i in invitations_data:
		logging.info(i)
		if not i or i.get('status') != 'finished':
			continue
	
		logging.info(f"[ROOM_VIEW]: Fetching data for duel request {m['duel_id']} in room {room.id}")
		duel = Invitation.objects.get(id=i.game.id).duel
		if duel is None:
			continue
	""" 
		logging.info(f"[ROOM_VIEW]: Corresponding duel found, recovering datas")
		game_data = {
			'winner_id': i.game.winner.id,
			'user1': i.game.user1.username,
			'user2': i.game.user2.username,
			'user1_score': i.game.user1_score,
			'user2_score': i.game.user2_score
		}
	
		i['game_data'] = game_data """

	combined_data = list(chain(messages_data, invitations_data))
	sorted_combined_data = sorted(combined_data, key=itemgetter('timestamp'))

	logging.info(f"[ROOM_VIEW]: Fetching user data for room {room.id}")

	users = room.users.all()
	users_data = [{
		'id': user.id,
		'username': user.username,
		'profile_picture': user.picture.url if user.picture else None,
	} for user in users]

	if room.is_private:
		other_user = room.users.exclude(id=user.id).first()
		if not other_user:
			return JsonResponse({'error': 'no other user found in this room'}, status=400)
		room_picture = user.picture.url if user.picture else None

	else:
		room_picture = room.picture

	data = {
		'room_picture': room_picture,
		'users': users_data,
		'messages': sorted_combined_data,
	}

	return JsonResponse(data, status=200)
