FROM node:22-alpine AS deps
WORKDIR /app

COPY bloomy-packages/planner/package.json bloomy-packages/planner/
COPY bloomy-frontend/package*.json bloomy-frontend/

# Install planner's own deps so webpack can resolve them during frontend build.
# node_modules resolution walks UP from the source file, so the planner needs
# its own node_modules — it can't reach bloomy-frontend/node_modules (sibling).
WORKDIR /app/bloomy-packages/planner
RUN npm install

WORKDIR /app/bloomy-frontend
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG BACKEND_INTERNAL_URL=http://backend:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

COPY --from=deps /app/bloomy-packages/planner/node_modules bloomy-packages/planner/node_modules
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
