#!/bin/bash

# Reason for this file:
# I was having problems with the cron job not being able to access the environment 
# variables set in the Dockerfile, so now I am using a wrapper script to run the 
# scrape command and export the environment variables.

# Exit immediately if a command exits with a non-zero status
set -e

# --- Set Environment Variables ---
# Set the PATH to include standard directories and where node/npm are installed.
# /usr/local/bin is where node/npm are typically installed in Node.js images.
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin

# Export your application-specific environment variables.
# It's good practice to explicitly export these here to ensure they are available,
# even though Dockerfile ENV might pass them down.
export SERVER_API_URL="${SERVER_API_URL}"
export SCRAPER_SECRET="${SCRAPER_SECRET}"
export CINESTAR_API_URL="${CINESTAR_API_URL}"

# --- Navigate and Execute ---
# Change directory to your application's working directory
cd /app

# Execute command
# Using just 'npm' relies on the PATH we exported above.
# Also log when the script starts and finishes.
echo "Wrapper script started at $(date)"
echo "SERVER_API_URL is: ${SERVER_API_URL}"
npm run scrape # Or just 'npm run scrape' if /usr/local/bin is reliably in PATH
echo "Wrapper script finished at $(date)"
