# ---- Builder Stage ----
# Use a current Node.js LTS version (e.g., 20.x or 22.x)
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies using 'ci' for clean installs based on lock file
RUN npm ci

# Copy the rest of the client application code
COPY . .

# Build the SvelteKit application for production using adapter-static
# This should output to the 'build' directory by default with adapter-static
RUN npm run build

# ---- Final Stage ----
# This stage simply holds the built assets.
# Coolify will need to be configured to serve files from /app/build from this image.
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/build ./build

# You could add a label to indicate where the static files are, if helpful for Coolify
LABEL static_files_path="/app/build"