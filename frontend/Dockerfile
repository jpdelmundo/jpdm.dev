#frontend
#base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY shared/ ./shared/
COPY frontend/ ./frontend/
RUN npm ci

#development
FROM base AS development
WORKDIR /app/frontend
EXPOSE 5173
CMD ["npm", "run", "dev"]

#builder
FROM base AS builder
WORKDIR /app/frontend
RUN npm run build

#use nginx to serve production
FROM node:22-alpine AS production
WORKDIR /app/frontend
COPY --from=builder /app/frontend/dist ./dist
EXPOSE 5173
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]