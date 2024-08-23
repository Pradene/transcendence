#!/bin/bash

cd /app

python3 ./manage.py makemigrations
python3 ./manage.py migrate

daphne -b 0.0.0.0 -p 8000 config.asgi:application