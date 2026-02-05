require("dotenv").config();
const axios = require("axios");
const { getCinemas } = require("./utils/cinemasList.js");
const { fetchMoviesAndPerformances } = require("./scraping/cinestarFunctions.js");
const { getPerformanceDatesFrom } = require("./scraping/getPerformanceDates.js");
const { configuration } = require("./config/environment.js");
const { CronJob } = require("cron");
const { launchBrowser } = require("./modules/browser/browser.js");
const { withRetry } = require("./utils/retry.js");
const fs = require("fs/promises");
const path = require("path");

const cinemas = getCinemas();

// Encapsulate the main scrape logic
async function performScrape() {
  const browser = await launchBrowser();
  try {
    console.log("[performScrape] Starting data fetch and send process...");
    const { movies, performances, performanceDates } = await updateMoviesAndPerformances(
      browser,
      cinemas,
    );
    const enrichedMovies = await enrichMovies(movies);
    // Send data to server API
    console.log("[performScrape] Sending data to server API...");
    const payload = {
      movies: enrichedMovies,
      performances: performances,
      performanceDates: performanceDates,
    };

    if (configuration.SCRAPER_DRY_RUN) {
      const artifactsDir = path.resolve(__dirname, "tests", "artifacts");
      await fs.mkdir(artifactsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const outPath = path.join(artifactsDir, `dry_run_payload_${timestamp}.json`);
      await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
      console.log(
        `[performScrape] DRY RUN enabled: skipping POST. Payload written to ${outPath}`,
      );
    } else {
      const response = await withRetry(
        () =>
          axios.post(configuration.SERVER_API_URL, payload, {
            headers: {
              "Content-Type": "application/json",
              "X-Scraper-Secret": configuration.SCRAPER_SECRET,
            },
          }),
        {
          retries: 5,
          delay: 2000,
          shouldRetry: (error) => {
            // Don't retry if the server explicitly rejected the request (4xx)
            if (
              error.response &&
              error.response.status >= 400 &&
              error.response.status < 500
            ) {
              return false;
            }
            return true;
          },
        },
      );
      console.log("[performScrape] Data successfully sent to server:", response.data);
    }
    const moviesWithTmdbMatch = enrichedMovies.filter(
      (movie) => movie.tmdb_movie_id,
    ).length;
    const percentageWithTmdbMatch = (
      (moviesWithTmdbMatch / enrichedMovies.length) *
      100
    ).toFixed(2);
    const successMessage = `Processed ${enrichedMovies.length} movies and ${performances.length} performances. ${moviesWithTmdbMatch} (${percentageWithTmdbMatch}%) of the movies matched on TMDB.`;
    console.log("[performScrape] " + successMessage);
  } catch (error) {
    console.error(
      "[performScrape] Error occurred during data fetch and send process:",
      error.message,
    );
    throw error;
  } finally {
    console.log("[performScrape] Closing browser...");
    await browser.close();
  }
}

async function updateMoviesAndPerformances(browser, cinemas) {
  console.log(`Fetching movies and performances for ${cinemas.length} cinemas...`);

  const { moviesFormatted, performancesFormatted } = await fetchMoviesAndPerformances(
    browser,
    cinemas,
  );

  if (moviesFormatted.length === 0) {
    console.warn(
      "[updateMoviesAndPerformances] WARNING: No movies found! This might indicate a blocking issue or no movies scheduled.",
    );
  }

  console.log(
    `Found ${moviesFormatted.length} unique movies and ${performancesFormatted.length} total performances.`,
  );

  const performanceDates = getPerformanceDatesFrom(performancesFormatted);

  return {
    movies: moviesFormatted,
    performances: performancesFormatted,
    performanceDates,
  };
}

async function enrichMovies(movies) {
  const { fillMoviesWithTmdbData } = require("./modules/tmdb/index.js");

  try {
    return await fillMoviesWithTmdbData(movies);
  } catch (err) {
    // Graceful fallback: keep CineStar data if TMDB is unavailable/misconfigured.
    console.warn(`[enrichMovies] TMDB enrichment skipped: ${err.message}`);
    return movies;
  }
}

// --- ENTRY POINT ---
(async () => {
  const RUN_MODE = configuration.RUN_MODE;
  const CRON_SCHEDULE = configuration.CRON_SCHEDULE;
  console.log(`[startup] RUN_MODE: ${RUN_MODE}`);

  if (RUN_MODE === "once") {
    console.log("[startup] Running scrape task once...");
    try {
      await performScrape();
      console.log("[startup] Scrape task completed successfully. Exiting.");
      process.exit(0);
    } catch (err) {
      console.error("[startup] Scrape task failed:", err);
      process.exit(1);
    }
  } else if (RUN_MODE === "scheduled") {
    console.log("[startup] Starting scheduler...");
    console.log(`[startup] Using CRON_SCHEDULE: ${CRON_SCHEDULE}`);

    if (configuration.SCRAPE_ON_START) {
      console.log("[startup] SCRAPE_ON_START is true, running initial scrape...");
      performScrape().catch((err) => {
        console.error("[startup] Initial scrape failed:", err.message);
      });
    }

    const job = new CronJob(CRON_SCHEDULE, async () => {
      console.log(`[scheduler] Triggered at ${new Date().toISOString()}`);
      try {
        await performScrape();
        console.log(
          `[scheduler] Scrape task completed successfully at ${new Date().toISOString()}`,
        );
      } catch (err) {
        console.error(
          `[scheduler] Scrape task failed at ${new Date().toISOString()}:`,
          err,
        );
      }
    });
    job.start();
    console.log("[startup] Scheduler started. Waiting for next scheduled run...");
  }
})();
