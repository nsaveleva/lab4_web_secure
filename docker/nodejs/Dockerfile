FROM node:8-alpine
MAINTAINER Nastya Saveleva <Savelyevanastya@mail.ru>
ENV NODEJS_PORT=4128

RUN npm install -g pm2

WORKDIR /opt/web_secure
CMD PORT=${NODEJS_PORT} pm2-dev config.yaml