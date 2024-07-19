from rest_framework import serializers
from .models import CustomUser, FriendRequest

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer(read_only=True)
    receiver = CustomUserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'timestamp']