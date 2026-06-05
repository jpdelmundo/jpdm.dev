#base
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/
RUN npm ci
COPY tsconfig*.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

#builder - builds everything from root
FROM base AS builder
RUN npm run build

#prod deps
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
RUN npm ci --omit=dev
RUN npm run preload -w backend

#production (backend)
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY ./backend/migrations ./backend/migrations
COPY backend/docker-entrypoint.sh ./backend/
RUN chmod +x backend/docker-entrypoint.sh
WORKDIR /app/backend
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]

#nginx
FROM nginx:stable-alpine AS frontend
COPY --from=builder /app/frontend/dist /var/www/frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf