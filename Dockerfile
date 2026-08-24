FROM node:22-alpine AS deps
WORKDIR /app

COPY tily-packages/tile-planner/package.json tily-packages/tile-planner/
COPY tily-packages/garden-planner/package.json tily-packages/garden-planner/
COPY bloomy-frontend/package*.json bloomy-frontend/

WORKDIR /app/tily-packages/tile-planner
RUN npm install

WORKDIR /app/tily-packages/garden-planner
RUN npm install

WORKDIR /app/bloomy-frontend
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG BACKEND_INTERNAL_URL=http://backend:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

ARG NEXT_PUBLIC_BLOOMY_CDN_TOKEN
ENV NEXT_PUBLIC_BLOOMY_CDN_TOKEN=$NEXT_PUBLIC_BLOOMY_CDN_TOKEN

ENV DOCKER_BUILD=1

COPY tily-packages/shared tily-packages/shared
COPY tily-packages/tile-planner tily-packages/tile-planner
COPY tily-packages/garden-planner tily-packages/garden-planner
COPY bloomy-frontend bloomy-frontend
COPY --from=deps /app/tily-packages/tile-planner/node_modules tily-packages/tile-planner/node_modules
COPY --from=deps /app/tily-packages/garden-planner/node_modules tily-packages/garden-planner/node_modules
COPY --from=deps /app/bloomy-frontend/node_modules bloomy-frontend/node_modules

WORKDIR /app/tily-packages/tile-planner
RUN npm run build

WORKDIR /app/tily-packages/garden-planner
RUN npm run build

WORKDIR /app/bloomy-frontend
RUN cp tsconfig.build.json tsconfig.json
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
