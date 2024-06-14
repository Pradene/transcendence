FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py makemigrations chat && \
    python manage.py sqlmigrate chat 0001 && \
    python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
