FROM node:8.2

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD ./service/ /usr/src/app

RUN yarn install

CMD yarn start

EXPOSE 8000
