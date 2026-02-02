# Use the official Puppeteer image which includes Chromium and all required OS deps.
# This avoids Alpine/Chromium dependency issues when running Puppeteer in production.
FROM ghcr.io/puppeteer/puppeteer:24

# Set the working directory inside the container
WORKDIR /app

ENV PORT=3000
ENV SCRAPER_SECRET="your_very_secret_string_here"
ENV CINESTAR_API_URL="https://shop.cinestarcinemas.hr/api"
ENV SEQUELIZE_LOGGING=false
ENV ANALYTICS_STORAGE_ITEMS=200
ENV ANALYTICS_STORAGE_TIME_MINUTES=10
ENV ANALYTICS_HASH_SALT="your_very_secret_salt_here"

# Note: we intentionally allow Puppeteer to download its compatible Chromium
# during `npm ci` (the base image provides all OS dependencies).

# Install curl for healthchecks
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Ensure the app directory is writable for the non-root user.
RUN chown -R pptruser:pptruser /app
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