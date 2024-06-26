docker compose up --build
docker exec -it back bash

    python manage.py makemigrations chat
    python manage.py migrate
    python manage.py createsuperuser

