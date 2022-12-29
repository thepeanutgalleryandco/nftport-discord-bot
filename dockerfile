FROM node:16-alpine3.15

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install --silent

COPY . /usr/src/app

RUN apk --no-cache add curl

HEALTHCHECK --interval=5s --timeout=3s CMD ps -ef|grep bot.js || exit 1

CMD [ "npm", "start" ]