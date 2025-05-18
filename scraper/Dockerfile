# Use an official Puppeteer image which includes Chromium and all necessary dependencies.
# Pick a specific version tag for reproducibility. Check for latest tags on ghcr.io/puppeteer/puppeteer
FROM ghcr.io/puppeteer/puppeteer:24

# Set the working directory inside the container
WORKDIR /app

# Set environment variables for the scraper (can be overridden at runtime)
ENV SERVER_API_URL="http://server:3000/api/v1/scrape-results"
ENV SCRAPER_SECRET="your_very_secret_string_here"
ENV CINESTAR_API_URL="https://shop.cinestarcinemas.hr/api"
ENV RUN_MODE="scheduled"
ENV CRON_SCHEDULE="0 2 * * *" 

# Puppeteer images come with Node.js.
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci 

# Copy the rest of the application code
COPY . .

# Start the Node.js scraper (ensure package.json has a start script, or use node scrapeAndSaveToDb.js)
CMD ["npm", "start"]