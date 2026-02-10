#base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN npm ci

#development
FROM base AS development
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "run", "dev"]

#builder
FROM base AS builder
WORKDIR /app/backend
RUN npm run build

#prod deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
RUN npm ci --omit=dev

#production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
#COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
#COPY --from=builder /app/backend/certs ./backend/certs
#COPY --from=builder /app/backend/db ./backend/db
COPY --from=builder /app/shared/dist ./shared/dist
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/app.js"]