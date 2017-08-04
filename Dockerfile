FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD ./service/ /usr/src/app

CMD $HOME/.yarn/bin/yarn install

EXPOSE 8000
