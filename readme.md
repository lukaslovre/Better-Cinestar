# BetterCinestar

## Project Structure

- `/server`
  - Backend built with **Express.js** and **Sequelize ORM** using **SQLite** as the database.

- `/scripts`
  - `/scripts/research`
    - Contains scripts and notes for analyzing and understanding what different seat codes mean.
  - `/scripts/scraping`
    - Scraping data from the Cinestar website and saving it to the database.
    - Scraping **Letterboxd** and **IMDb** data for each Cinestar movie.
    - `npm run fetch` runs the scraping script (`scrapeAndSaveToDb.js`)

- `/client`
  - Frontend built with **Svelte 4**.
