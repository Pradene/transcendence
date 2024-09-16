import os
import logging

from corsheaders.defaults import default_methods, default_headers

from pathlib import Path
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING:
# keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', get_random_secret_key())

# SECURITY WARNING: 
# don't run with debug turned on in production!
DEBUG = True

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend'
]

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'corsheaders',
    'channels',
    'account',
    'chat',
    'game',
	'requests_oauthlib'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ALLOWED_HOSTS = [
    f'{os.getenv("HOST_HOSTNAME")}',
    f'localhost',
	'api.intra.42.fr'
]

# Set session expiration to 1 day (adjust as needed)
CSRF_COOKIE_AGE = 86400
CSRF_TRUSTED_ORIGINS = [
    f'https://localhost:5000',
    f'http://localhost:5000',
    f'https://{os.getenv("HOST_HOSTNAME")}',
    f'http://{os.getenv("HOST_HOSTNAME")}',
    f'https://{os.getenv("HOST_HOSTNAME")}:5000',
    f'http://{os.getenv("HOST_HOSTNAME")}:5000',
	'https://api.intra.42.fr'
]

CORS_ALLOWED_ORIGINS = [
    f'https://localhost:5000',
    f'http://localhost:5000',
    f'https://{os.getenv("HOST_HOSTNAME")}',
    f'http://{os.getenv("HOST_HOSTNAME")}',
    f'https://{os.getenv("HOST_HOSTNAME")}:5000',
    f'http://{os.getenv("HOST_HOSTNAME")}:5000',
	'https://api.intra.42.fr'
]

ROOT_URLCONF = 'config.urls'

MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates/')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

AUTH_USER_MODEL = 'account.CustomUser'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'pong.point42@gmail.com'

FT_API_SECRET = os.getenv('42_API_SECRET')
FT_API_UID = os.getenv('42_API_UID')