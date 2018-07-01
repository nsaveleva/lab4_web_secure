FROM nginx:1.12-alpine
MAINTAINER Nastya Saveleva <Savelyevanastya@mail.ru>
# Эти значения по умолчанию не действуют при сборке через docker-compose, если эти переменные среды определены в хеше environment
ENV CONF_DIR=docker/nginx
ENV NODEJS_PORT=4128

COPY ${CONF_DIR}/nginx.conf /etc/nginx/
RUN mkdir /etc/nginx/ssl/
COPY ${CONF_DIR}/local.crt /etc/nginx/ssl/local.crt
COPY ${CONF_DIR}/local.key /etc/nginx/ssl/local.key
COPY ${CONF_DIR}/default.conf /etc/nginx/conf.d/

CMD \
    sed -i "s@#NODEJS_PORT#@${NODEJS_PORT}@g" /etc/nginx/conf.d/default.conf;\
    nginx -g "daemon off;"
