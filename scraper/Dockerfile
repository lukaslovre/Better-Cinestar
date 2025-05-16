# Use an official Puppeteer image which includes Chromium and all necessary dependencies.
# Pick a specific version tag for reproducibility. Check for latest tags on ghcr.io/puppeteer/puppeteer
FROM ghcr.io/puppeteer/puppeteer:24

# Set the working directory inside the container
WORKDIR /app

# Set environment variables for the scraper
ENV SERVER_API_URL="http://server:3000/api/v1/scrape-results"
ENV SCRAPER_SECRET="your_very_secret_string_here"
ENV CINESTAR_API_URL="https://shop.cinestarcinemas.hr/api"

# Puppeteer images come with Node.js.
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci 

# switch to root so we can install cron
USER root

# Install cron, define job, set permissions, register and prepare log
RUN apt-get update && apt-get install -y cron \
  && echo "0 2 * * * root cd /app && /usr/local/bin/npm run scrape >> /var/log/cron.log 2>&1" > /etc/cron.d/scraper-cron \
  && chmod 0644 /etc/cron.d/scraper-cron \
  && crontab /etc/cron.d/scraper-cron \
  && touch /var/log/cron.log

# Copy the scripts directory into the container
COPY . .

# Start cron in foreground so container stays alive and jobs run on schedule
CMD ["cron", "-f"]