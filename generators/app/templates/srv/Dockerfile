FROM node:14-slim
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
<% if(hana){ -%>
RUN apt-get update
RUN apt-get install -y openssl python make g++
<% } -%>
COPY . .
ENV NODE_ENV=production
EXPOSE 5001
USER node
CMD [ "npm", "start" ]