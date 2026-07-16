FROM node:22-alpine AS deps
WORKDIR /monorepo

# Root workspace manifests
COPY package*.json ./
# Planner package manifests (workspace member)
COPY bloomy-packages/planner/package*.json ./bloomy-packages/planner/
# Frontend manifests
COPY bloomy-frontend/package*.json ./bloomy-frontend/

# Install all workspace deps — creates the @bloomy/bloomy-planner symlink
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /monorepo

ARG BACKEND_INTERNAL_URL=http://backend:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Restore installed modules from deps stage
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/bloomy-frontend/node_modules ./bloomy-frontend/node_modules

# Copy planner source (node_modules symlink resolves here at build time)
COPY bloomy-packages/planner/ ./bloomy-packages/planner/

# Copy frontend source
COPY bloomy-frontend/ ./bloomy-frontend/

WORKDIR /monorepo/bloomy-frontend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=builder /monorepo/bloomy-frontend/public ./public
COPY --from=builder /monorepo/bloomy-frontend/.next/standalone ./
COPY --from=builder /monorepo/bloomy-frontend/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]
