import logging
import pyotp

from datetime import datetime, timedelta

from django.utils import timezone
from django.conf import settings
from django.db import models


class BlackListedToken(models.Model):
    token = models.CharField(max_length=255)
    blacklisted_on = models.DateTimeField(auto_now_add=True)


class OTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    secret = models.CharField(max_length=32, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def has_expired(self):
        return timezone.now() > self.expires_at

    @classmethod
    def generate(cls, user):
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret, digits=6)
        expires_at = timezone.now() + timedelta(minutes=10)
        instance = cls.objects.create(user=user, secret=secret, expires_at=expires_at)
        return totp.now()

    @classmethod
    def validate(cls, user, code):
        instance = cls.objects.filter(user=user).last()

        if not instance:
            return False

        if instance.has_expired():
            instance.delete()
            return False

        totp = pyotp.TOTP(instance.secret, digits=6)
        valid_window = 20 # make otp code valid for 10 minutes 20 * 30s = 10m
        if not totp.verify(code, valid_window=valid_window):
            return False

        instance.delete()

        return True
