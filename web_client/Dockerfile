# Frontend multi-stage Dockerfile for SyncNote (Vite + Vue)
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
# copy source
COPY . .
# build
RUN npm run build

# Production stage: nginx serves static files and proxies API/ws to backend
FROM nginx:1.25-alpine
# Remove default content and copy built dist
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if provided (optional, container can use default)
COPY deploy/nginx/syncnote.conf /etc/nginx/conf.d/syncnote.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
