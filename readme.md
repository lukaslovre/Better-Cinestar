# BetterCinestar

BetterCinestar is a web application designed to provide a superior browsing experience for CineStar movie listings. It aggregates data from CineStar, enriches it with ratings and links from Letterboxd and IMDb, and presents it through a modern, responsive interface.

## Project Architecture

The project is a monolith composed of three main services:

### 1. Server (`/server`)

- **Tech Stack**: Node.js, Express.js, Sequelize ORM, SQLite.
- **Responsibility**:
  - Stores movie, performance, and analytics data.
  - Provides a REST API for the frontend.
  - Exposes a secure POST endpoint (`/api/v1/scrape-results`) for the scraper to upload data.
- **Setup**:
  - Requires a `.env` file (see `server/.env.example`).
  - `npm install --prefix server`
  - `npm run dev --prefix server` (Development with nodemon)

### 2. Scraper (`/scraper`)

- **Tech Stack**: Node.js, Puppeteer, Cheerio.
- **Responsibility**:
  - Scrapes movie and performance data from CineStar.
  - Enriches data by fetching ratings and URLs from Letterboxd and IMDb.
  - Sends the processed data to the server.
  - Can be run as a one-off script or on a cron schedule.
- **Setup**:
  - Requires a `.env` file (see `scraper/.env.example`).
  - `npm install --prefix scraper`
  - `npm run scrape --prefix scraper`

### 3. Client (`/client`)

- **Tech Stack**: SvelteKit (Svelte 5), Tailwind, Vite.
- **Responsibility**:
  - Modern UI for browsing movies, filtering by cinema and date, and viewing seating plans.
  - Built as a Static Site (SPA) using `@sveltejs/adapter-static`.
- **Setup**:
  - `npm install --prefix client`
  - `npm run dev --prefix client`

## Getting Started

### Using Docker (Recommended)

The easiest way to run the entire stack is using Docker Compose:

```bash
docker-compose up --build
```

This will start the server, the client, and the scraper (configured to run on a schedule).

### Manual Setup

1. **Install all dependencies**:
   ```bash
   npm run install-all
   ```
2. **Configure Environment Variables**:
   - Create `.env` files in both `/server` and `/scraper` based on their respective `.env.example` files.
   - Ensure `SCRAPER_SECRET` is identical in both files.
3. **Start the Server**:
   ```bash
   npm run dev-server
   ```
4. **Run the Scraper** (to populate the database):
   ```bash
   npm run scrape
   ```
5. **Start the Client**:
   ```bash
   npm run dev-client
   ```

## Monorepo Scripts

- `npm run install-all` — Install all dependencies for server, scraper, and client.
- `npm run start-server` — Start the server in production mode.
- `npm run dev-server` — Start the server in development mode.
- `npm run scrape` — Run the scraper script once.
- `npm run dev-client` — Start the frontend development server.
- `npm run build-client` — Build the frontend for production.

## Data Flow

1. **Scraper** fetches data from CineStar and external sources (Letterboxd/IMDb).
2. **Scraper** sends a POST request with the data to the **Server**.
3. **Server** validates the request using `SCRAPER_SECRET` and saves data to `Database.sqlite`.
4. **Client** fetches movie and performance data from the **Server** API to display to the user.

## Research & Tools

- `/scripts/research`: Contains utility scripts for analyzing CineStar's seating codes and other data structures.
