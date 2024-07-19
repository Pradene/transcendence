#!/bin/bash

cd /app

python manage.py collectstatic --noinput
    
python3 ./manage.py makemigrations account game chat
python3 ./manage.py migrate

daphne -b 0.0.0.0 -p 8000 config.asgi:application