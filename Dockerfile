FROM node:22-alpine AS deps
WORKDIR /app

COPY bloomy-packages/tile-planner/package.json bloomy-packages/tile-planner/
COPY bloomy-packages/garden-planner/package.json bloomy-packages/garden-planner/
COPY bloomy-frontend/package*.json bloomy-frontend/

WORKDIR /app/bloomy-packages/tile-planner
RUN npm install

WORKDIR /app/bloomy-packages/garden-planner
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

COPY bloomy-packages/shared bloomy-packages/shared
COPY bloomy-packages/tile-planner bloomy-packages/tile-planner
COPY bloomy-packages/garden-planner bloomy-packages/garden-planner
COPY bloomy-frontend bloomy-frontend
COPY --from=deps /app/bloomy-packages/tile-planner/node_modules bloomy-packages/tile-planner/node_modules
COPY --from=deps /app/bloomy-packages/garden-planner/node_modules bloomy-packages/garden-planner/node_modules
COPY --from=deps /app/bloomy-frontend/node_modules bloomy-frontend/node_modules

WORKDIR /app/bloomy-packages/tile-planner
RUN npm run build
RUN cp -r dist /app/bloomy-frontend/node_modules/@bloomy/tile-planner/

WORKDIR /app/bloomy-packages/garden-planner
RUN npm run build
RUN cp -r dist /app/bloomy-frontend/node_modules/@bloomy/garden-planner/

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
