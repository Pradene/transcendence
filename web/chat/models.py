from django.conf import settings
from django.db import models

from account.models import CustomUser

class ChatRoom(models.Model):
    name = models.CharField(max_length=255)
    is_private =  models.BooleanField(default=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="rooms")
    
    @classmethod
    def create(cls, name, is_private=True, user_ids=None):
        room = cls.objects.create(name=name, is_private=is_private)
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


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content