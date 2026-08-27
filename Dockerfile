# =================================================================
# bloomy-frontend production image
# Build from the CI workspace root (parent of bloomy-frontend/ and tily-packages/)
# =================================================================

ARG PORT=3001
ARG BUILD_GARDEN=false

# -----------------------------------------------------------------
# Stage 1: deps — install node_modules
# -----------------------------------------------------------------
FROM node:22-alpine AS deps
ARG BUILD_GARDEN

WORKDIR /app

COPY tily-packages/tile-planner/package*.json  tily-packages/tile-planner/
COPY tily-packages/garden-planner/package.json tily-packages/garden-planner/
COPY bloomy-frontend/package*.json             bloomy-frontend/

RUN npm ci --prefix tily-packages/tile-planner

# Always materialise the dir so the COPY in builder never fails on an absent path.
RUN mkdir -p tily-packages/garden-planner/node_modules && \
    if [ "$BUILD_GARDEN" = "true" ]; then \
      npm install --prefix tily-packages/garden-planner; \
    fi

RUN npm ci --prefix bloomy-frontend

# -----------------------------------------------------------------
# Stage 2: builder — compile packages and the Next.js app
# -----------------------------------------------------------------
FROM node:22-alpine AS builder
ARG BUILD_GARDEN
ARG BACKEND_INTERNAL_URL=http://backend:3000
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

ENV DOCKER_BUILD=1
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

WORKDIR /app

COPY tily-packages/shared         tily-packages/shared
COPY tily-packages/tile-planner   tily-packages/tile-planner
COPY tily-packages/garden-planner tily-packages/garden-planner
COPY bloomy-frontend               bloomy-frontend

COPY --from=deps /app/tily-packages/tile-planner/node_modules   tily-packages/tile-planner/node_modules
COPY --from=deps /app/tily-packages/garden-planner/node_modules tily-packages/garden-planner/node_modules
COPY --from=deps /app/bloomy-frontend/node_modules              bloomy-frontend/node_modules

RUN npm run build --prefix tily-packages/tile-planner
RUN if [ "$BUILD_GARDEN" = "true" ]; then \
      npm run build --prefix tily-packages/garden-planner; \
    fi
RUN cd bloomy-frontend && cp tsconfig.build.json tsconfig.json && npm run build

# -----------------------------------------------------------------
# Stage 3: runner — minimal production image
# -----------------------------------------------------------------
FROM node:22-alpine AS runner
ARG PORT

ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /app/bloomy-frontend/public          ./public
COPY --from=builder /app/bloomy-frontend/.next/standalone ./
COPY --from=builder /app/bloomy-frontend/.next/static    ./.next/static

EXPOSE $PORT

CMD ["node", "server.js"]
