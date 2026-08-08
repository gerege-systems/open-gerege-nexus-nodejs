# Production Multi-stage Dockerfile for Gerege Nexus Node.js Express backend
FROM node:22-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
COPY catalog/ /app/catalog/

RUN npm run build

# Production Runner Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Ulaanbaatar

RUN apk add --no-cache tzdata

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY --from=builder /app/backend/dist ./backend/dist
COPY catalog/ ./catalog/
COPY backend/db/migrations/ ./backend/db/migrations/

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "dist/server.js"]
