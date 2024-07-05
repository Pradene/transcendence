FROM nginx:1.19.0-alpine

RUN apk update && apk add bash

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

COPY ./tools/script.sh /usr/local/bin/script.sh
RUN chmod +x /usr/local/bin/script.sh

CMD ["/usr/local/bin/script.sh"]