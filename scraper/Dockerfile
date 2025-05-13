# Use an official Puppeteer image which includes Chromium and all necessary dependencies.
# Pick a specific version tag for reproducibility. Check for latest tags on ghcr.io/puppeteer/puppeteer
FROM ghcr.io/puppeteer/puppeteer:latest

# Set the working directory inside the container
WORKDIR /app

# Set environment variables for the scraper
ENV SERVER_API_URL="http://localhost:3000/api/v1/scrape-results"
ENV SCRAPER_SECRET="your_very_secret_string_here"
ENV CINESTAR_API_URL="https://shop.cinestarcinemas.hr/api"

# Puppeteer images come with Node.js.
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci 

# Copy the scripts directory into the container
COPY . .

# The command to run your scraper script.
# This container is intended to be run on a schedule (e.g., via Coolify cron), execute, and then exit.
CMD [ "npm", "run", "scrape" ] 