FROM node:14-slim
WORKDIR /app
COPY app .
RUN npm install --only=production
ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD [ "npm", "start" ]