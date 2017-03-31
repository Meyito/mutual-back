FROM node:6.10

ADD . /app
WORKDIR /app

RUN npm install
RUN mkdir /var/log/mutualapp
RUN ./node_modules/.bin/gulp build

EXPOSE 3000
ENTRYPOINT npm start