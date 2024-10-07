from chat.models import ChatRoom
from account.models import CustomUser

def is_user_room_member(user, room_id):
    try:
        room = ChatRoom.objects.get(id=room_id)
        return room.users.filter(id=user.id).exists()
    except ChatRoom.DoesNotExist:
        return False
