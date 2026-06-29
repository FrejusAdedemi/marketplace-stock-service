FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY stock-service/ ./stock-service/
EXPOSE 3003
CMD ["npm", "start"]