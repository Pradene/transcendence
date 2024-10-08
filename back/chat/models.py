import logging

from django.conf import settings
from django.db import models

from account.models import CustomUser
from game.models import Game

class ChatRoom(models.Model):
    picture = models.ImageField(upload_to='room_pictures/', default="room_pictures/default.png", blank=True, null=True)
    is_private =  models.BooleanField(default=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="rooms")
    
    def toJSON(self, requesting_user):

        # Get other user (for private rooms)
        def get_name():
            return self.get_other_user(requesting_user).username

        # Get last message
        def get_last_message():
            last_message = self.get_last_message()
            if last_message:
                return last_message.toJSON()
            return None

        # Get picture (for private rooms and public rooms)
        def get_picture():
            if self.is_private:
                other_user = CustomUser.objects.get(id=self.get_other_user(requesting_user).id)
                return other_user.picture.url if other_user.picture else 'profile-pictures/default.png'
            else:
                last_message = self.get_last_message()
                if last_message:
                    return last_message.user.picture.url if last_message.user.picture else 'profile-pictures/default.png'
                return 'profile-pictures/default.png'

        return {
            'id': self.id,
            'name': get_name(),
            'users': [user.toJSON() for user in self.users.all()],
            'last_message': get_last_message(),
            'picture': get_picture(),
        }

    @classmethod
    def create(cls, is_private=True, user_ids=None):
        room = cls.objects.create(is_private=is_private)
        if user_ids:
            users = CustomUser.objects.filter(id__in=user_ids)
            room.users.add(*users)
        return room
    
    def join(self, user):
        if not self.is_private:
            self.users.add(user)

    def quit(self, user):
        if not self.is_private:
            self.users.remove(user)

    def get_last_message(self):
        last_message = self.messages.order_by('-timestamp').first()
        if last_message:
            return last_message
        return None
    
    def get_other_user(self, current_user):
        if self.is_private:
            other_user = self.users.exclude(id=current_user.id).first()
            return other_user
        else:
            return None

    def is_in_room(self, user: CustomUser):
        return self.users.filter(id=user.id).exists()

    def get_active_duels_for(self, user: CustomUser):
        duels = self.invitations.filter(sender=user, status="pending")
        return duels

    def get_users_tuple(self):
        users = self.users.all()
        return (users[0], users[1])


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content

    def toJSON(self):
        return {
            'id': self.id,
            'user': self.user.username if self.user else None,
            'content': self.content,
            'timestamp': self.timestamp.isoformat()
        }

class Invitation(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='invitations', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='invitations', on_delete=models.CASCADE)
    status = models.CharField(choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('canceled', 'Canceled'),
        ('finished', 'Finished')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'Game invitation from {self.sender}'
