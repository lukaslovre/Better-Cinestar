# ---- Builder Stage ----
# Build with the project's Node.js 24 runtime.
FROM node:24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app/client

# Set build-time argument for API URL
ARG PUBLIC_API_URL="https://api.bettercinestar.com"

# SvelteKit's $env/static/public reads from environment variables at build time.
ENV PUBLIC_API_URL=$PUBLIC_API_URL

# Copy package.json and package-lock.json first to leverage Docker cache
COPY client/package.json client/package-lock.json ./

# Install dependencies using 'ci' for clean installs based on lock file
RUN npm ci

# Copy the rest of the client application code
COPY client/ ./
COPY shared/ /app/shared/

# Build the SvelteKit application for production (adapter-node writes to 'build')
RUN npm run build

# ---- Runtime Stage ----
# adapter-node output: renders pages on the server and serves the static assets.
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=80 \
    TZ=Europe/Zagreb

# Only runtime dependencies; the server bundle imports packages listed in "dependencies".
COPY client/package.json client/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/client/build ./build

# Docker lets non-root processes bind to low ports inside the container.
USER node

EXPOSE 80

HEALTHCHECK --interval=1m30s --timeout=10s --start-period=15s --retries=5 \
  CMD wget -q --spider http://127.0.0.1:80/robots.txt || exit 1

CMD ["node", "build"]
