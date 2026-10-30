# Refresh Node.js from its official image independently of Puppeteer's release cycle.
FROM node:24-bookworm AS node-runtime

# Use an official Puppeteer image which includes Chromium and all necessary dependencies.
# The tag identifies Puppeteer, not Node.js; both stages use Debian Bookworm.
FROM ghcr.io/puppeteer/puppeteer:25.16.0

COPY --from=node-runtime /usr/local/ /usr/local/

# Set the working directory inside the container
WORKDIR /app/scraper

# Set environment variables for the scraper (can be overridden at runtime)
ENV SERVER_API_URL="http://server:3000/api/v1/scrape-results"
ENV CINESTAR_API_URL="https://shop.cinestarcinemas.hr/api"
ENV RUN_MODE="scheduled"
ENV CRON_SCHEDULE="0 2 * * *" 
ENV SCRAPE_ON_START="false"

# Keep installs and browser downloads writable by the image's non-root user.
USER root
RUN chown -R pptruser:pptruser /app
USER pptruser

COPY --chown=pptruser:pptruser scraper/package.json scraper/package-lock.json ./

# Install dependencies
RUN npm ci 

# Copy the rest of the application code
COPY --chown=pptruser:pptruser scraper/ ./
COPY --chown=pptruser:pptruser shared/ /app/shared/

# Start the Node.js scraper
CMD ["npm", "run", "scrape"]
