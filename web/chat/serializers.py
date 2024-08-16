from rest_framework import serializers
from .models import ChatRoom

class ChatRoomSerializer(serializers.ModelSerializer):
    users = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'users')