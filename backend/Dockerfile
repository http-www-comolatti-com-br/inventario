FROM node:20-alpine

# Instala wget para o healthcheck do docker-compose
RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8201

CMD ["node", "src/index.js"]
