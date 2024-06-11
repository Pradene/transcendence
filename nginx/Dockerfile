FROM debian:bullseye

RUN apt-get update -y \
&& apt-get upgrade -y \
&& apt-get install -y \
nginx \
openssl

RUN mkdir -p /etc/nginx/ssl \
&& openssl req -x509 -nodes -newkey rsa:2048 -out /etc/nginx/ssl/inception.crt -keyout /etc/nginx/ssl/inception.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=student/CN=lpradene.42.fr/UID=lpradene"

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
RUN chown -R www-data:www-data /var/www/html

COPY ./tools/script.sh /usr/local/bin/script.sh
RUN chmod +x /usr/local/bin/script.sh

ENTRYPOINT ["/usr/local/bin/script.sh"]