FROM node:22-alpine AS deps
WORKDIR /app

COPY bloomy-frontend/package*.json bloomy-frontend/
COPY bloomy-packages/planner/package.json bloomy-packages/planner/
WORKDIR /app/bloomy-frontend
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG BACKEND_INTERNAL_URL=http://backend:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

COPY --from=deps /app/bloomy-frontend/node_modules bloomy-frontend/node_modules
COPY bloomy-packages/planner bloomy-packages/planner
COPY bloomy-frontend bloomy-frontend

WORKDIR /app/bloomy-frontend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/bloomy-frontend/public ./public
COPY --from=builder /app/bloomy-frontend/.next/standalone ./
COPY --from=builder /app/bloomy-frontend/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]
