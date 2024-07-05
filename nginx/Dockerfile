FROM nginx:1.19.0-alpine

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

COPY ./tools/script.sh /sbin/entrypoint.sh
RUN chmod +x /sbin/entrypoint.sh

CMD ["/sbin/entrypoint.sh"]