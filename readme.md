# BetterCinestar

## Project Structure

- `/server`
  - Backend built with **Express.js** and **Sequelize ORM** using **SQLite** as the database.
  - Exposes API endpoints for the client and a POST endpoint for the scraper.
  - Configure with `.env` (see `/server/.env.example`).
  - Install dependencies: `npm install --prefix server`
  - Start server: `npm start --prefix server` or `npm run dev --prefix server`

- `/scraper`
  - Standalone Node.js app for scraping Cinestar, Letterboxd, and IMDb data.
  - Sends results to the server via HTTP POST.
  - Configure with `.env` (see `/scraper/.env.example`).
  - Install dependencies: `npm install --prefix scraper`
  - Run scraper: `npm run scrape --prefix scraper`

- `/client`
  - Frontend built with **Svelte 4** (half-transfered to **Svelte 5**).

- `/scripts/research`
  - Contains scripts and notes for analyzing and understanding what different seat codes mean.

## Monorepo Scripts

- `npm run install-all` — Install all dependencies for server and scraper.
- `npm run start-server` — Start the server.
- `npm run scrape` — Run the scraper.

## Environment Variables

- Both `/server` and `/scraper` require their own `.env` files. The `SCRAPER_SECRET` must match in both.

## Data Flow

1. Start the server (`/server`).
2. Run the scraper (`/scraper`).
3. Scraper POSTs data to the server, which saves it to the database.
