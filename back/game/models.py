from django.db import models

# Create your models here.
class GameModel(models.Model):
    user1 = models.CharField(max_length=255)
    user2 = models.CharField(max_length=255)
    user1_score = models.IntegerField(default=0)
    user2_score = models.IntegerField(default=0)
