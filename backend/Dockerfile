FROM node:20-alpine

# Install docker cli for the worker to communicate with host docker daemon
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
