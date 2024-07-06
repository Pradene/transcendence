FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN chmod +x ./tools/script.sh

EXPOSE 8000

ENTRYPOINT ["./tools/script.sh"]
