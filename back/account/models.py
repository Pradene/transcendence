from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    pp = models.ImageField(upload_to='pp/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, symmetrical=False, blank=True)

    def __str__(self):
        return self.username