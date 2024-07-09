#!/bin/bash

cd /app

python manage.py collectstatic --noinput

python manage.py makemigrations account chat
python manage.py migrate

daphne -b 0.0.0.0 -p 8000 config.asgi:application