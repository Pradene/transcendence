FROM python:3.11.9-alpine

WORKDIR /app

COPY requirements.txt .
COPY ./tools/script.sh /usr/sbin/entrypoint.sh
RUN chmod +x /usr/sbin/entrypoint.sh

RUN apk update && \
    apk add --no-cache \
    postgresql-dev \
    python3-dev \
    musl-dev \
    bash

RUN pip install -r requirements.txt

EXPOSE 8000

ENTRYPOINT ["/usr/sbin/entrypoint.sh"]
