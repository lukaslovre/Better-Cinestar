require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");

const { Movie, Performance } = require("./db/models");

const { dateToHHMM, dateToYYYYMMDD } = require("./utils/utils.js");
const { getFormattedMovies } = require("./api/index.js");
const { fetchSeating } = require("./api/seating.js");
const { getPerformancesForDateAndMovie } = require("./api/performances.js");
const { analyticsMiddleware } = require("./middleware/analyticsMiddleware.js");
const { browserManager } = require("./scraping/browserManager.js");
const { getCinemas } = require("./utils/cinemasList.js");
const {
  init,
  getAnalytics,
  saveMoviesToDatabase,
  savePerformancesToDatabase,
  savePerformanceDatesToDatabase,
} = require("./db/db.js");
const { configuration } = require("./config/environment.js");
const {
  moviesQuerySchema,
  seatingQuerySchema,
  performancesQuerySchema,
  scrapeResultsSchema,
} = require("./schemas/index.js");

// Initialize the database
init();

// We expose a custom header so the browser can read it from fetch() responses.
// Without `exposedHeaders`, the header is still sent over the network, but JS can't access it due to CORS.
app.use(
  cors({
    exposedHeaders: ["X-Movies-Empty-Reason"],
  })
);
app.set("trust proxy", true); // trust the reverse proxy (nginx) to set the x-forwarded-for header
app.use(express.json({ limit: "20mb" })); // Increase the limit for JSON payloads, as of writing this a SQLite database is 3mb after scraping

async function getMoviesEmptyReason() {
  // Why this exists:
  // The client needs to distinguish between:
  // - the DB being empty (scraper hasn't run / data got wiped)
  // - a valid query that simply returns no results
  // We keep the response body as an array (non-breaking) and add metadata via a header.
  const [movieCount, performanceCount] = await Promise.all([
    Movie.count(),
    Performance.count(),
  ]);

  if (movieCount === 0 || performanceCount === 0) return "db_empty";

  return "no_performances_for_date";
}

app.get("/api/movies", analyticsMiddleware, async (req, res) => {
  const result = moviesQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOids, date, sortBy } = result.data;

  // Movies matching the filters and with performances added to them
  const formattedMovies = await getFormattedMovies(cinemaOids, date, sortBy);

  if (Array.isArray(formattedMovies) && formattedMovies.length === 0) {
    // The client will use this for a more accurate empty-state message.
    // (Body stays as `[]` so we don't break existing consumers.)
    res.setHeader("X-Movies-Empty-Reason", await getMoviesEmptyReason());
  }

  res.send(formattedMovies);
});

app.get("/api/seating", analyticsMiddleware, async (req, res) => {
  const result = seatingQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOid, performanceId } = result.data;

  const startedAt = Date.now();
  console.log(`[seating] Request start cinemaOid=${cinemaOid} performanceId=${performanceId}`);

  try {
    const seating = await fetchSeating(cinemaOid, performanceId);
    console.log(
      `[seating] Request OK cinemaOid=${cinemaOid} performanceId=${performanceId} (${Date.now() - startedAt}ms)`
    );
    res.send(seating);
  } catch (error) {
    console.error(
      `[seating] Failed for cinemaOid=${cinemaOid} performanceId=${performanceId}:`,
      error
    );

    console.log(
      `[seating] Request FAIL cinemaOid=${cinemaOid} performanceId=${performanceId} (${Date.now() - startedAt}ms)`
    );

    res.status(502).json({
      message: "Seating temporarily unavailable. Please try again.",
    });
  }
});

app.get("/api/performances", analyticsMiddleware, async (req, res) => {
  const result = performancesQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOids, date, movieId } = result.data;

  const present = new Date();
  const today = dateToYYYYMMDD(present);
  const currentTime = dateToHHMM(present);

  // Get the performances
  const performances = await getPerformancesForDateAndMovie(
    cinemaOids,
    date,
    today,
    currentTime,
    movieId
  );

  res.send(performances);
});

app.get("/api/health", (req, res) => {
  res.send("OK");
});

app.get("/api/getAnalyticsData", async (req, res) => {
  const analytics = await getAnalytics();
  res.send(analytics);
});
app.get("/api/getCinemasList", (req, res) => {
  res.send(getCinemas());
});

const authenticateScraper = (req, res, next) => {
  const secret = req.headers["x-scraper-secret"];
  if (secret && secret === process.env.SCRAPER_SECRET) {
    next();
  } else {
    console.warn("Unauthorized attempt to access scrape endpoint");
    res.status(401).send("Unauthorized");
  }
};

app.post("/api/v1/scrape-results", authenticateScraper, async (req, res) => {
  try {
    const result = scrapeResultsSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid data format",
        errors: result.error.flatten(),
      });
    }

    const { movies, performances, performanceDates } = result.data;

    console.log(
      `Received ${movies.length} movies, ${performances.length} performances, ${performanceDates.length} performance dates.`
    );
    await saveMoviesToDatabase(movies);
    await savePerformancesToDatabase(performances);
    await savePerformanceDatesToDatabase(performanceDates);
    res.status(200).json({ message: "Data saved successfully." });
  } catch (error) {
    console.error("Error processing scraped data:", error);
    res
      .status(500)
      .json({ message: "Failed to save scraped data.", error: error.message });
  }
});

app.use("/analytics", express.static(path.join(__dirname, "public", "analytics")));
app.use(express.static(path.join(__dirname, "client", "public")));

const httpServer = app.listen(configuration.PORT, () => {
  console.log(`Example app listening on port ${configuration.PORT}`);
});

// Graceful shutdown: close Chromium so Docker restarts don't leave stray processes.
async function shutdown(signal) {
  try {
    console.log(`[shutdown] Received ${signal}, shutting down...`);
    await browserManager.shutdown();

    // Stop accepting new connections.
    httpServer.close(() => {
      console.log("[shutdown] HTTP server closed.");
      process.exit(0);
    });

    // Force-exit after a short grace period.
    setTimeout(() => {
      console.warn("[shutdown] Force exiting after timeout");
      process.exit(1);
    }, 10_000).unref?.();
  } catch (e) {
    console.error("[shutdown] Error during shutdown", e);
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

console.log("Current time:", dateToHHMM(new Date()));
