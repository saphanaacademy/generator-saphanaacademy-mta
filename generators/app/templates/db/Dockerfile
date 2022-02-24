FROM node:14-slim
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
RUN apt-get update
RUN apt-get install -y openssl python make g++
COPY . .
ENV NODE_ENV=production
USER node
CMD [ "npm", "start", "--", "--exit" ]