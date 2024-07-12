#!/bin/bash

cd /app

# python manage.py collectstatic --noinput

python manage.py makemigrations --check
RETV=$?

if [ ! $RETV -eq 0 ]; then
    python manage.py makemigrations account game chat
    python manage.py migrate
fi

daphne -b 0.0.0.0 -p 8000 config.asgi:application