# ---- Builder Stage ----
# Use a current Node.js LTS version (e.g., 20.x or 22.x)
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Set build-time argument for API URL
ARG PUBLIC_API_URL="https://api.bettercinestar.lukaslovretic.from.hr"

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies using 'ci' for clean installs based on lock file
RUN npm ci

# Copy the rest of the client application code
COPY . .

# Build the SvelteKit application for production using adapter-static
# This should output to the 'build' directory by default with adapter-static
RUN npm run build



# ---- Caddy Web Server Stage ----
    
# Use the official Caddy image to serve the static files
FROM caddy:2-alpine

# Set the working directory inside the Caddy container
WORKDIR /srv

# Copy built static files from the builder stage
COPY --from=builder /app/build /srv

# Copy Caddyfile for configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80 for the Caddy server
EXPOSE 80