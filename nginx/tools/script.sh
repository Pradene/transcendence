#!/bin/bash

chmod -R a+r /app
echo "printing nginx conf"
cat /etc/nginx/nginx.conf
nginx -g "daemon off;"
