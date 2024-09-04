import json
import logging

from account.models import FriendList

def serialize_user(user, requesting_user=None):
    """Convert a User object to a JSON-serializable dictionary including relationship status."""    
    user_data = {
        'id': user.id,
        'username': user.username,
        'picture': user.picture.url if user.picture else None,
    }

    if requesting_user is not None:
        try:
            friend_list, created = FriendList.objects.get_or_create(user=requesting_user)
            user_data['status'] = friend_list.get_friend_status(user)
        except:
            user_data['status'] = 'none'

    return user_data


def serialize_friend_request(friend_request):
    """Convert a FriendRequest object to a JSON-serializable dictionary."""
    return {
        'id': friend_request.id,
        'sender': serialize_user(friend_request.sender),
        'receiver': serialize_user(friend_request.receiver),
        'timestamp': friend_request.timestamp.isoformat()  # Convert datetime to ISO format
    }