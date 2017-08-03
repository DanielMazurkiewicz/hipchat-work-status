FROM node:latest

RUN apt-get -yq update && \
    apt-get -yq clean && \
    apt-get -yq autoclean && \
    apt-get install yarn

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN yarn
ADD ./service/ /usr/src/app
RUN yarn start