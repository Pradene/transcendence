FROM python:3.11.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN apk update && \
    apk add --no-cache postgresql-dev gcc python3-dev musl-dev
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py makemigrations chat game && \
    python manage.py sqlmigrate chat 0001 && \
    python manage.py sqlmigrate game 0001 && \
    python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
