# Use the official Puppeteer image which includes Chromium and all required OS deps.
# This avoids Alpine/Chromium dependency issues when running Puppeteer in production.
FROM ghcr.io/puppeteer/puppeteer:24

# Set the working directory inside the container
WORKDIR /app

ENV PORT=3000

# Note: we intentionally allow Puppeteer to download its compatible Chromium
# during `npm ci` (the base image provides all OS dependencies).

# Install curl for healthchecks
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Ensure the app directory is writable for the non-root user.
RUN chown -R pptruser:pptruser /app

# Create the SQLite data directory so Docker named volumes mounted here
# get initialized with the correct ownership/permissions.
RUN mkdir -p /app/data && chown -R pptruser:pptruser /app/data
USER pptruser

# Copy root package.json and package-lock.json
COPY --chown=pptruser:pptruser package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the server application code
COPY --chown=pptruser:pptruser . .

# Expose the port the server listens on (adjust if different)
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]