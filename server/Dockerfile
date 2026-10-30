# Refresh Node.js from its official image independently of Puppeteer's release cycle.
FROM node:24-bookworm AS node-runtime

# Use the official Puppeteer image which includes Chromium and all required OS deps.
# Both stages use Debian Bookworm; retain Puppeteer's browser and OS dependencies.
FROM ghcr.io/puppeteer/puppeteer:24

COPY --from=node-runtime /usr/local/ /usr/local/

# Set the working directory inside the container
WORKDIR /app/server

ENV PORT=3000

# Note: we intentionally allow Puppeteer to download its compatible Chromium
# during `npm ci` (the base image provides all OS dependencies).

# Install curl for healthchecks
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Ensure the app directory is writable for the non-root user.
RUN chown -R pptruser:pptruser /app

# Create the SQLite data directory so Docker named volumes mounted here
# get initialized with the correct ownership/permissions.
RUN mkdir -p /app/data && chown -R pptruser:pptruser /app/data
USER pptruser

# Copy root package.json and package-lock.json
COPY --chown=pptruser:pptruser server/package.json server/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the server application code
COPY --chown=pptruser:pptruser server/ ./
COPY --chown=pptruser:pptruser shared/ /app/shared/

# Expose the port the server listens on (adjust if different)
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]
