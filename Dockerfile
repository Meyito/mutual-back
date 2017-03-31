FROM node:6.10

ADD . /app
WORKDIR /app

RUN npm install
RUN mkdir /var/log && mkdir /var/log/mutualapp && touch /var/log/mutualapp/access.log && touch /var/log/mutualapp/error.log
RUN ./node_modules/.bin/gulp build

EXPOSE 3000
ENTRYPOINT npm start
