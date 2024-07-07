FROM python:3.11.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN apk update && \
    apk add --no-cache postgresql-dev gcc python3-dev musl-dev
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x ./tools/script.sh

EXPOSE 8000

ENTRYPOINT ["./tools/script.sh"]
