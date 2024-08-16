import uuid

from django.conf import settings
from django.db import models

class ChatRoom(models.Model):
    name = models.CharField(max_length=255)
    is_private =  models.BooleanField(default=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="rooms")
    
    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='room', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content