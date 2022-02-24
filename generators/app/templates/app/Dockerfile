FROM node:14-slim
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD [ "npm", "start" ]