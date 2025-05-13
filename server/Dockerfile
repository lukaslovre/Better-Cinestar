# Use a current Node.js LTS version
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV PORT=3000
ENV SCRAPER_SECRET="your_very_secret_string_here"
ENV SEQUELIZE_LOGGING=false
ENV ANALYTICS_STORAGE_ITEMS=200
ENV ANALYTICS_STORAGE_TIME_MINUTES=10

# Copy root package.json and package-lock.json
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the server application code
COPY . .

# Copy the SQLite database file into the image.
# This acts as an initial version if the volume is empty.
# The volume mount in docker-compose.yml will override this with the persistent version.
# COPY ./Database.sqlite ./Database.sqlite

# Expose the port the server listens on (adjust if different)
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]