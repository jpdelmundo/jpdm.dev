#base
FROM node:24.13-alpine AS base
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
FROM node:24.13-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
RUN npm ci --omit=dev
RUN npm run preload -w backend

#production
FROM node:24.13-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY ./backend/migrations ./backend/migrations
WORKDIR /app/backend
EXPOSE 3000
#CMD ["node", "dist/app.js"]
CMD ["/bin/sh", "-c", "rm -rf /mnt/frontend-out/* && cp -r /app/frontend/dist/. /mnt/frontend-out && node dist/app.js"]