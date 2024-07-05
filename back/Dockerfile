FROM python:3.11.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN apk update && \
    apk add --no-cache postgresql-dev gcc python3-dev musl-dev
RUN pip install -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
