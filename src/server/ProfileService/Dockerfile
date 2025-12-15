FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Service này chạy ở port 4000
EXPOSE 4000

CMD ["npm", "start"]