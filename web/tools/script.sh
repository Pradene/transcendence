#!/bin/bash

cd /app

python manage.py collectstatic --noinput

python3 ./manage.py makemigrations
python3 ./manage.py migrate
RETV=$?

if [ ! $RETV -eq 0 ]; then
    echo "Migrations changes detected, migrating..."
    
    python3 ./manage.py makemigrations
    python3 ./manage.py migrate
fi

daphne -b 0.0.0.0 -p 8000 config.asgi:application
