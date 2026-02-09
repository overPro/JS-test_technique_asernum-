FROM node:24-alpine

WORKDIR /app/sharing-api

# Copy package files
COPY sharing-api/package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY sharing-api/src ./src
COPY sharing-api/tsconfig.json ./
COPY sharing-api/tsconfig.paths.js ./

# Build application
RUN npm run build

# Expose port
EXPOSE 3002

# Start application with tsconfig-paths loaded
CMD ["node", "-r", "./tsconfig.paths.js", "dist/main.js"]
