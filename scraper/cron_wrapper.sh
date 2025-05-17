#!/bin/bash

# Reason for this file:
# I was having problems with the cron job not being able to access the environment 
# variables set in the Dockerfile, so now I am using a wrapper script to run the 
# scrape command and export the environment variables.

# Exit immediately if a command exits with a non-zero status
set -e

# --- Source Environment Variables ---
# Load variables from the file created in the Dockerfile
# This will set all the ENV variables from your Dockerfile in this script's environment
if [ -f /etc/container_environment ]; then
  . /etc/container_environment
fi

# --- Navigate and Execute ---
# Change directory to your application's working directory
cd /app

# Execute command
/usr/local/bin/npm run scrape

# Log the completion of the script
echo "Wrapper script finished successfully at $(date)"
