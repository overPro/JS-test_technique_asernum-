FROM node:24-alpine

WORKDIR /app/sharing-api


COPY sharing-api/package*.json ./


RUN npm install --legacy-peer-deps


COPY sharing-api/src ./src
COPY sharing-api/tsconfig.json ./
COPY sharing-api/tsconfig.paths.js ./


RUN npm run build


EXPOSE 3002


CMD ["node", "-r", "./tsconfig.paths.js", "dist/main.js"]
