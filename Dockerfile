# This Dockerfile has been consolidated into bloomy-deploy/Dockerfile.frontend.
#
# To build from the monorepo root:
#   docker build -f bloomy-deploy/Dockerfile.frontend \
#     --build-arg SERVICE=bloomy-frontend \
#     --build-arg PORT=3001 \
#     --build-arg BUILD_GARDEN=true \
#     .
#
# For deployment use docker compose (bloomy-deploy/docker-compose.yml).
# CI uses bloomy-deploy/Dockerfile.frontend directly — see .github/workflows/deploy.yml.

FROM alpine AS stub
RUN echo "ERROR: Use bloomy-deploy/Dockerfile.frontend with --build-arg SERVICE=bloomy-frontend" >&2 && exit 1
