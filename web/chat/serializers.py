from rest_framework import serializers

from account.models import CustomUser
from account.serializers import CustomUserSerializer

from .models import ChatRoom, Message

class ChatRoomSerializer(serializers.ModelSerializer):
    users = CustomUserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'users', 'last_message')

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None


class MessageSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ('id', 'user', 'content', 'timestamp')

    def get_user(self, obj):
        return obj.user.username if obj.user else None