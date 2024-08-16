import jwt
from django.conf import settings
from datetime import datetime, timedelta

from account.models import CustomUser

def create_access_token(user):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(minutes=5),
            'iat': datetime.utcnow(),
            'user': user.id
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    except Exception as e:
        return e


def create_refresh_token(user):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'user': user.id
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

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