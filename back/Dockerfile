FROM python:3.11.9-alpine

WORKDIR /app

RUN apk update && \
    apk add --no-cache \
    postgresql-dev \
    python3-dev \
    musl-dev \
    bash

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . /app
COPY ./tools/script.sh /usr/sbin/entrypoint.sh
COPY ./insults.txt .
RUN chmod +x /usr/sbin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/sbin/entrypoint.sh"]
