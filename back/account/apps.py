from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_dummy_user(sender, **kwargs):
    from account.models import CustomUser
    if not CustomUser.objects.filter(username="local").exists():
        CustomUser.objects.create(username="local")


class AccountConfig(AppConfig):
    name = 'account'

    def ready(self):
        post_migrate.connect(create_dummy_user, sender=self)
