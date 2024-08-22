from rest_framework import serializers
from .models import CustomUser, FriendRequest

class CustomUserSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'picture', 'bio', 'is_active']

    def get_picture(self, obj):
        if obj.picture:
            return obj.picture.url
        return None


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer(read_only=True)
    receiver = CustomUserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'timestamp']