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
    email = models.EmailField(max_length=254)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    otp_secret = models.CharField(blank=True, null=True)
    api_42_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def toJSON(self, requesting_user=None):
        data = {
            'id': self.id,
            'username': self.username,
            'picture': self.picture.url if self.picture else None,
            'is_active': self.is_active,
        }

        if requesting_user is not None:
            try:
                friend_list, created = FriendList.objects.get_or_create(user=self)
                data['status'] = friend_list.get_friend_status(requesting_user)
            except Exception as e:
                data['status'] = 'none'

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

    def unfriend(self, rm_user):
        self.remove_friend(rm_user)

        user, created = FriendList.objects.get_or_create(user=rm_user)
        user.remove_friend(self.user)

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
            'sender': self.sender.toJSON(),
            'receiver': self.receiver.toJSON()
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


class BlackListedToken(models.Model):
    token = models.CharField(max_length=255)
    blacklisted_on = models.DateTimeField(auto_now_add=True)
