FROM node:6.10

ADD . /app
WORKDIR /app

RUN apt-get update
RUN apt-get install -y cron
RUN npm install
RUN mkdir /var/log/mutualapp
RUN ./node_modules/.bin/gulp build
RUN crontab cron

EXPOSE 3000
ENTRYPOINT npm start
