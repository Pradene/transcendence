from rest_framework import serializers

from account.models import CustomUser
from account.serializers import CustomUserSerializer

from .models import ChatRoom, Message

class ChatRoomSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    users = CustomUserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    picture = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'users', 'last_message', 'picture')

    def get_name(self, obj):
        requesting_user = self.context['request'].user
        return obj.get_other_user(requesting_user)

    def get_last_message(self, obj):
        last_message = obj.get_last_message()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_picture(self, obj):
        # For private rooms, show the other user's profile picture
        if obj.is_private:
            requesting_user = self.context['request'].user
            other_user = CustomUser.objects.get(username=obj.get_other_user(requesting_user))
            return other_user.picture.url if other_user.picture else 'profile-pictures/default.png'
        
        # For public rooms, show a default picture if there are no messages
        else:
            last_message = obj.get_last_message()
            if last_message:
                return last_message.user.picture.url if last_message.user.profile_picture else 'profile-pictures/default.png'
            return 'profile-pictures/default.png'


class MessageSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ('id', 'user', 'content', 'timestamp')

    def get_user(self, obj):
        return obj.user.username if obj.user else None