# Production Dockerfile for Gerege Nexus Node.js Express CommonJS backend
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Ulaanbaatar

RUN apk add --no-cache tzdata

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY backend/src/ ./backend/src/
COPY catalog/ ./catalog/
COPY backend/db/migrations/ ./backend/db/migrations/

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "src/server.js"]
