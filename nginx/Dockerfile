FROM nginx:1.19.0-alpine

ARG		NGINX_CONF_FILE=/etc/nginx/nginx.conf
ARG		HOST_HOSTNAME=$HOST_HOSTNAME

RUN		apk update && \
		apk add	bash \
				sed

COPY	./conf/nginx.conf $NGINX_CONF_FILE
RUN		sed 's/$HOST_HOSTNAME/'$HOST_HOSTNAME'/g' $NGINX_CONF_FILE >/tmp/tmp && \
		mv /tmp/tmp $NGINX_CONF_FILE

COPY ./tools/script.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
