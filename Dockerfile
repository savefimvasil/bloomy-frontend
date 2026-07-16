FROM node:22-alpine AS deps
WORKDIR /monorepo

# 1. Install workspace (planner package) — creates @bloomy/bloomy-planner symlink
#    and installs its deps (jspdf, jspdf-autotable, zod) into root node_modules
COPY package*.json ./
COPY bloomy-packages/planner/package*.json ./bloomy-packages/planner/
RUN npm ci

# 2. Install frontend deps
COPY bloomy-frontend/package*.json ./bloomy-frontend/
WORKDIR /monorepo/bloomy-frontend
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /monorepo

ARG BACKEND_INTERNAL_URL=http://backend:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Workspace node_modules (contains the @bloomy/bloomy-planner symlink)
COPY --from=deps /monorepo/node_modules ./node_modules
# Planner source (the symlink resolves here at build time)
COPY bloomy-packages/planner/ ./bloomy-packages/planner/

# Frontend node_modules and source
COPY --from=deps /monorepo/bloomy-frontend/node_modules ./bloomy-frontend/node_modules
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
