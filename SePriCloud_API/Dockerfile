FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY ./src ./src

EXPOSE 3001

USER node

CMD ["npm", "start"]
