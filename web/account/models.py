from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.conf import settings
from django.db import models

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
    picture = models.ImageField(upload_to="profile-pictures/", default="profile-pictures/default.png", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friends")
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="friend_of")

    def add_friend(self, user):
        if user not in self.friends.all():
            self.friends.add(user)

    def remove_friend(self, user):
        if user in self.friends.all():
            self.friends.remove(user)

    def unfriend(self, rm_user):
        self.remove_friend(rm_user)

        user, created = FriendList.objects.get_or_create(user=rm_user)
        user.remove_friend(self.user)

    def is_friend(self, user):
        return user in self.friends.all()
        

class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    timestamp = models.DateTimeField(auto_now_add=True)

    def accept(self):
        sender_friend_list, created = FriendList.objects.get_or_create(user=self.sender)
        receiver_friend_list, created = FriendList.objects.get_or_create(user=self.receiver)

        if sender_friend_list and receiver_friend_list:
            sender_friend_list.add_friend(self.receiver)
            receiver_friend_list.add_friend(self.sender)
            self.delete()

    def decline(self):
        self.delete()


class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blockeds", on_delete=models.CASCADE)
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blockers", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)


class BlackListedToken(models.Model):
    token = models.CharField(max_length=255)
    blacklisted_on = models.DateTimeField(auto_now_add=True)
