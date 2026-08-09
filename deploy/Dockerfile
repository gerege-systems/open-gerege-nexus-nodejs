# Production Dockerfile for the Gerege Nexus TypeScript backend
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Ulaanbaatar

RUN apk add --no-cache tzdata

COPY backend/package*.json backend/tsconfig.json ./backend/
RUN cd backend && npm ci --include=dev

COPY backend/src/ ./backend/src/
COPY catalog/ ./catalog/
COPY backend/db/migrations/ ./backend/db/migrations/

RUN cd backend && npm run build && npm prune --omit=dev

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "dist/src/server.js"]
