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
docker compose up --build
```

This will start the server, the client, and the scraper (configured to run on a schedule).

#### Local development override

For local testing (server exposed on `localhost:3000`, client on `localhost:8080`), run:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Notes:

- The local override builds the client with `PUBLIC_API_URL=http://localhost:3000`.
- The scraper is disabled by default in the local override; enable it with:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.local.yml --profile scraper up --build
  ```

### Environment variables (important)

This repo uses environment variables in two different ways:

- **Runtime env (server/scraper containers):** values are read at process startup by the Zod-based config loaders:
  - [server/config/environment.js](server/config/environment.js)
  - [scraper/config/environment.js](scraper/config/environment.js)

  When running via Docker Compose, these are set via `environment:` in [docker-compose.yml](docker-compose.yml) (or your platform’s equivalent, e.g. Coolify).

- **Build-time env (client container):** the client is a static build, so `PUBLIC_API_URL` is baked in at build time. It is passed as a Docker build arg (`build.args.PUBLIC_API_URL`) and is exported during the build in [client/Dockerfile](client/Dockerfile).

#### Recommended way to set secrets in production

- Set `SCRAPER_SECRET` and `ANALYTICS_HASH_SALT` in your deployment platform (Coolify) or via a root-level `.env` used by Compose for variable substitution.

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

## Useful config knobs

Common runtime tunables (server container):

- `CINESTAR_API_URL` (default: `https://shop.cinestarcinemas.hr/api`)
- `PUPPETEER_MAX_CONCURRENCY` (default: `2`)
- `PUPPETEER_IDLE_TTL_MS` (default: `1200000`)
- `PUPPETEER_NAV_TIMEOUT_MS` (default: `12000`)
- `SEATING_CACHE_TTL_MS` (default: `60000`)
- `SEATING_CACHE_MAX_ENTRIES` (default: `50`)

## Research & Tools

- `/scripts/research`: Contains utility scripts for analyzing CineStar's seating codes and other data structures.
