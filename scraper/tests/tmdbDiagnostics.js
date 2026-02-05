require("dotenv").config();

const { configuration } = require("../config/environment.js");
const { fillMoviesWithTmdbData } = require("../modules/tmdb/index.js");

const DEFAULT_TMDB_DIAGNOSTIC_MOVIES = [
  {
    id: "diagnostic-1",
    title: "The Matrix",
    originalTitle: "The Matrix",
    nationwideStart: "1999-03-31",
  },
  {
    id: "diagnostic-2",
    title: "Dune",
    originalTitle: "Dune",
    nationwideStart: "2021-09-03",
  },
];

/**
 * Runs a real TMDB enrichment pass on sample movies.
 *
 * - Exported so other diagnostics (e.g. scraperDiagnostics) can reuse the exact same logic.
 * - Still runnable as a standalone script via `node tests/tmdbDiagnostics.js`.
 */
async function runTmdbDiagnostics(options = {}) {
  const {
    sampleMovies = DEFAULT_TMDB_DIAGNOSTIC_MOVIES,
    requireAllMatch = true,
    printHeader = true,
    printPerMovie = true,
    logger = console,
  } = options;

  if (printHeader) {
    logger.log("=== BetterCinestar TMDB Diagnostics ===\n");
  }

  if (!configuration.TMDB_API_KEY) {
    return {
      ok: false,
      matched: 0,
      total: Array.isArray(sampleMovies) ? sampleMovies.length : 0,
      reason:
        "TMDB_API_KEY is not set. Add it to scraper/.env or container env and retry.",
      movies: sampleMovies,
    };
  }

  const movies = Array.isArray(sampleMovies) ? sampleMovies : [sampleMovies];

  await fillMoviesWithTmdbData(movies);

  if (printPerMovie) {
    for (const m of movies) {
      logger.log("\n---");
      logger.log(
        `Query: ${m.originalTitle || m.title} (${m.nationwideStart?.slice(0, 4)})`,
      );
      logger.log(`tmdb_movie_id: ${m.tmdb_movie_id}`);
      logger.log(`tmdb_rating: ${m.tmdb_rating}`);
      logger.log(`tmdb_poster_url: ${m.tmdb_poster_url}`);
      logger.log(`tmdb_trailer_url: ${m.tmdb_trailer_url}`);
      logger.log(
        `cast: ${Array.isArray(m.tmdb_cast) ? m.tmdb_cast.length : 0}, directors: ${
          Array.isArray(m.tmdb_directors) ? m.tmdb_directors.length : 0
        }`,
      );
    }
  }

  const matched = movies.filter((m) => m.tmdb_movie_id).length;
  const ok = requireAllMatch ? matched === movies.length : matched > 0;

  return {
    ok,
    matched,
    total: movies.length,
    movies,
  };
}

module.exports = {
  runTmdbDiagnostics,
  DEFAULT_TMDB_DIAGNOSTIC_MOVIES,
};

if (require.main === module) {
  (async () => {
    try {
      const result = await runTmdbDiagnostics();
      if (!result.ok) {
        console.log(`\n❌ TMDB diagnostics failed: ${result.reason || "no match"}`);
        process.exit(1);
      }
      console.log(
        `\n✅ Diagnostics complete. Matched ${result.matched}/${result.total} movies on TMDB.`,
      );
    } catch (err) {
      console.error("\n❌ TMDB diagnostics failed:", err.message);
      process.exit(1);
    }
  })();
}
