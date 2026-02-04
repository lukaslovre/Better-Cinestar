require("dotenv").config();
const axios = require("axios");
const { getCinemas } = require("./utils/cinemasList.js");
const { fetchMoviesAndPerformances } = require("./scraping/cinestarFunctions.js");
const { getPerformanceDatesFrom } = require("./scraping/getPerformanceDates.js");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("./scraping/imdbAndLetterboxdFunctions.js");
const { configuration } = require("./config/environment.js");
const { CronJob } = require("cron");
const { launchBrowser } = require("./modules/browser/browser.js");
const { withRetry } = require("./utils/retry.js");

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
    const enrichedMovies = await enrichMoviesWithExternalData(browser, movies);
    // Send data to server API
    console.log("[performScrape] Sending data to server API...");
    const payload = {
      movies: enrichedMovies,
      performances: performances,
      performanceDates: performanceDates,
    };

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
    const moviesWithLetterboxdUrl = enrichedMovies.filter(
      (movie) => movie.letterboxdUrl,
    ).length;
    const percentageWithLetterboxdUrl = (
      (moviesWithLetterboxdUrl / enrichedMovies.length) *
      100
    ).toFixed(2);
    const successMessage = `Successfully sent ${enrichedMovies.length} movies and ${performances.length} performances to the server. ${moviesWithLetterboxdUrl} (${percentageWithLetterboxdUrl}%) of the movies have a Letterboxd URL.`;
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

async function enrichMoviesWithExternalData(browser, movies) {
  let enrichedMovies = await fillMoviesWithLetterboxdData(browser, movies);

  // validation
  if (!enrichedMovies || !Array.isArray(enrichedMovies)) {
    throw new Error(
      "Error occurred during LetterBoxd data enrichment process: movies is not an array",
    );
  }

  console.log("Finished enriching with Letterboxd data and starting IMDb data fetch...");

  enrichedMovies = await fillMoviesWithImdbData(enrichedMovies);

  return enrichedMovies;
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
