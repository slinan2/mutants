FROM node:10.15-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --quiet

COPY . .

EXPOSE 3030

CMD npm test
CMD npm start
