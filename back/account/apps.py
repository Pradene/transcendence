import logging

from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_dummy_user(sender, **kwargs):
    from account.models import CustomUser
    if not CustomUser.objects.filter(username="local").exists():
        CustomUser.objects.create(username="local")

    # create test users
    import os
    env = os.getenv("DEVELOPMENT")
    if env is not None:
        try:
            user_manager = CustomUser.objects.create_user(username="1", password="test")
            user_manager = CustomUser.objects.create_user(username="2", password="test")
            user_manager = CustomUser.objects.create_user(username="3", password="test")
            user_manager = CustomUser.objects.create_user(username="4", password="test")
            logging.info("Dummy users created")

        except Exception as e:
            logging.error(f"Error creating dummy users: {e}")

class AccountConfig(AppConfig):
    name = 'account'

    def ready(self):
        post_migrate.connect(create_dummy_user, sender=self)
