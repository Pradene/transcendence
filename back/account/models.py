import logging

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.conf import settings
from django.db import models

from account.utils.defines import TWO_FA_METHOD

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        """
        Creates and saves a User with the given username
        and password.
        """
        if not username:
            raise ValueError("Users must have an username")

        user = self.model(
            username=username,
            **extra_fields
        )

        if password is not None:
            user.set_password(password)
        
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given usename
        and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        user = self.create_user(username, password, **extra_fields)

        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=32, unique=True)
    picture = models.ImageField(upload_to="profile_pictures/", default="profile_pictures/default.png", blank=True, null=True)
    email = models.EmailField(null=True)
    bio = models.TextField(blank=True, null=True)
    email = models.EmailField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    api_42_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)

    is_2fa_enabled = models.BooleanField(default=False)
    twofa_method = models.IntegerField(default=TWO_FA_METHOD.EMAIL)

    language = models.CharField(max_length=2, choices=[
        ('en', 'en'),
        ('fr', 'fr'),
        ('de', 'de'),
    ], default='en')

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def add_xp(self, amount):
        self.xp += amount
        self.check_level_up()
        self.save()

    def check_level_up(self):
        # Example criteria: level up every 100 XP
        next_level_xp = self.level * 100
        while self.xp >= next_level_xp:
            self.level += 1
            self.xp -= next_level_xp
            next_level_xp = self.level * 100

    def toJSON(self, requesting_user=None):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'picture': self.picture.url if self.picture else None,
            'is_active': self.is_online
        }

        if requesting_user is not None:
            try:
                friend_list, created = FriendList.objects.get_or_create(user=requesting_user)
                data['status'] = friend_list.get_friend_status(self)
            except Exception as e:
                data['status'] = 'none'

            if requesting_user.id == self.id:
                data['is_2fa_enabled'] = self.is_2fa_enabled

        return data


class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friends")
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="friend_of")

    def add_friend(self, user):
        if user not in self.friends.all():
            self.friends.add(user)

    def remove_friend(self, user):
        if user in self.friends.all():
            self.friends.remove(user)

    def unfriend(self, user):
        self.remove_friend(user)

        friend_list, created = FriendList.objects.get_or_create(user=user)
        friend_list.remove_friend(self.user)

    def is_friend(self, user):
        return user in self.friends.all()

    def get_friend_status(self, user):
        if user == self.user:
            return 'self'
        elif self.is_friend(user):
            return 'friend'
        elif FriendRequest.objects.filter(sender=self.user, receiver=user).exists():
            return 'request_sent'
        elif FriendRequest.objects.filter(sender=user, receiver=self.user).exists():
            return 'request_received'
        else:
            return 'none'
        

class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    timestamp = models.DateTimeField(auto_now_add=True)

    def toJSON(self):
        return {
            'user': self.sender.toJSON(),
        }

    def accept(self):
        sender_friend_list, created = FriendList.objects.get_or_create(user=self.sender)
        receiver_friend_list, created = FriendList.objects.get_or_create(user=self.receiver)

        if sender_friend_list and receiver_friend_list:
            sender_friend_list.add_friend(self.receiver)
            receiver_friend_list.add_friend(self.sender)
            self.delete()

    def decline(self):
        self.delete()

    def cancel(self):
        self.delete()


class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blockeds", on_delete=models.CASCADE)
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blockers", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
