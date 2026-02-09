FROM node:24-alpine

WORKDIR /app/processing-worker


RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev


COPY processing-worker/package*.json ./


RUN npm install --legacy-peer-deps


COPY processing-worker/src ./src
COPY processing-worker/tsconfig.json ./
COPY processing-worker/tsconfig.paths.js ./


RUN npm run build


CMD ["node", "-r", "./tsconfig.paths.js", "dist/main.js"]
