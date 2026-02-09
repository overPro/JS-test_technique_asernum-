FROM node:24-alpine

WORKDIR /app/documents-api


COPY documents-api/package*.json ./


RUN npm install --legacy-peer-deps


COPY documents-api/src ./src
COPY documents-api/tsconfig.json ./  
COPY documents-api/tsconfig.paths.js ./
COPY shared ../shared


RUN npm run build


EXPOSE 3001


CMD ["node", "-r", "./tsconfig.paths.js", "dist/main.js"]
