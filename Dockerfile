FROM node:latest

RUN apt-get -yq update && \
    apt-get -yq clean && \
    apt-get -yq autoclean && \
    curl -o- -L https://yarnpkg.com/install.sh | bash

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD ./service/ /usr/src/app
CMD $HOME/.yarn/bin/yarn install
CMD $HOME/.yarn/bin/yarn start
EXPOSE 8000
