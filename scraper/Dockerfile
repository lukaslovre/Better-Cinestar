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

# Define the default user name - commonly 'pptruser' for this base image
ARG DEFAULT_USER=pptruser

# switch to root so we can install cron
USER root

# hourly cron job schedule
ARG CRON_SCHEDULE="*/30 * * * *" 

# Install cron, define job for the DEFAULT_USER, set permissions, register and prepare log
RUN apt-get update && apt-get install -y cron --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && touch /var/log/cron.log \
  && chown ${DEFAULT_USER}:${DEFAULT_USER} /var/log/cron.log

# Copy the scripts directory into the container (this happens as root)
COPY . .

# Add the wrapper script and make it executable
COPY cron_wrapper.sh /app/cron_wrapper.sh
RUN chmod +x /app/cron_wrapper.sh

# Ensure the default user can read and execute the application code and write to the log
RUN chown -R ${DEFAULT_USER}:${DEFAULT_USER} /app

# Update the crontab to use the wrapper script
RUN printf "${CRON_SCHEDULE} ${DEFAULT_USER} /app/cron_wrapper.sh >> /var/log/cron.log 2>&1\n" > /etc/cron.d/scraper-cron \
  && chmod 0644 /etc/cron.d/scraper-cron \
  && crontab /etc/cron.d/scraper-cron

# Start cron in foreground so container stays alive and jobs run on schedule
# The cron daemon runs as root, but the scheduled JOB will run as ${DEFAULT_USER}
CMD ["cron", "-f"]