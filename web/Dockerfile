FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY ./tools/script.sh /run/script.sh

RUN chmod +x /run/script.sh

EXPOSE 8000

ENTRYPOINT ["/run/script.sh"]
