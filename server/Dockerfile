FROM node:22
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
ENV DATABASE_PATH=/data/interrail.db
CMD ["node", "dist/server.js"]
