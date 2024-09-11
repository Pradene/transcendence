from .models import GameModel

# class GameModelSerializer(serializers.ModelSerializer):
#     user1 = CustomUserSerializer(read_only=True)
#     user2 = CustomUserSerializer(read_only=True)

#     class Meta:
#         model = GameModel
#         fields = ['id', 'user1', 'user2', 'user1_score', 'user2_score', 'winner']

# class GameModelSerializer(serializers.ModelSerializer):
#     player = serializers.SerializerMethodField()
#     player_score = serializers.SerializerMethodField()
#     opponent = serializers.SerializerMethodField()
#     opponent_score = serializers.SerializerMethodField()

#     class Meta:
#         model = GameModel
#         fields = ['player', 'player_score', 'opponent', 'opponent_score', 'winner']

#     def get_opponent(self, obj):
#         request_user = self.context['request'].user
#         if obj.user1 == request_user:
#             return CustomUserSerializer(obj.user2, context=self.context).data
#         elif obj.user2 == request_user:
#             return CustomUserSerializer(obj.user1, context=self.context).data
#         return None

#     def get_opponent_score(self, obj):
#         request_user = self.context['request'].user
#         if obj.user1 == request_user:
#             return obj.user2_score
#         elif obj.user2 == request_user:
#             return obj.user1_score
#         return None

#     def get_player(self, obj):
#         request_user = self.context['request'].user
#         if obj.user1 == request_user:
#             return CustomUserSerializer(obj.user1, context=self.context).data
#         elif obj.user2 == request_user:
#             return CustomUserSerializer(obj.user2, context=self.context).data
#         return None

#     def get_player_score(self, obj):
#         request_user = self.context['request'].user
#         if obj.user1 == request_user:
#             return obj.user1_score
#         elif obj.user2 == request_user:
#             return obj.user2_score
#         return None