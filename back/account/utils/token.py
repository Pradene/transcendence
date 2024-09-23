import jwt

from django.conf import settings
from datetime import datetime, timedelta

from account.models import CustomUser

def create_access_token(user):
    exp = timedelta(minutes=1)

    try:
        payload = {
            'exp': datetime.utcnow() + exp,
            'iat': datetime.utcnow(),
            'user': user.id
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token, exp

    except Exception as e:
        return e


def create_refresh_token(user, remember_me=False):
    exp = timedelta(days=1)
    if remember_me:
        exp = timedelta(days=7)

    try:
        payload = {
            'exp': datetime.utcnow() + exp,
            'iat': datetime.utcnow(),
            'user': user.id
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token, exp

    except Exception as e:
        return e

def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')
        return payload['user']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None