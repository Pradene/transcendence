from account.models import FriendList, FriendRequest, Block

def are_friends(user1, user2):
    friend_list = FriendList.objects.get(user=user1)

    return friend_list.friends.filter(
        id=user2.id
    ).exists()

def friend_request_exists(user1, user2):
    return FriendRequest.obejcts.filter(
        (sender=user1, receiver=user2) |
        (sender=user2, receiver=user1)
    ).exists()

def is_blocked(user1, user2):
    return Block.objects.filter(
        (blocker=user1, blocked=user2)
    ).exists()