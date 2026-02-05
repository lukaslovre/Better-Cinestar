require("dotenv").config();

const { configuration } = require("../config/environment.js");
const { fillMoviesWithTmdbData } = require("../modules/tmdb/index.js");

(async function runTmdbDiagnostics() {
  console.log("=== BetterCinestar TMDB Diagnostics ===\n");

  if (!configuration.TMDB_API_KEY) {
    console.log(
      "❌ TMDB_API_KEY is not set. Add it to scraper/.env or container env and retry."
    );
    process.exit(1);
  }

  const sampleMovies = [
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

  try {
    await fillMoviesWithTmdbData(sampleMovies);

    for (const m of sampleMovies) {
      console.log("\n---");
      console.log(`Query: ${m.originalTitle} (${m.nationwideStart?.slice(0, 4)})`);
      console.log(`tmdb_movie_id: ${m.tmdb_movie_id}`);
      console.log(`tmdb_rating: ${m.tmdb_rating}`);
      console.log(`tmdb_poster_url: ${m.tmdb_poster_url}`);
      console.log(`tmdb_trailer_url: ${m.tmdb_trailer_url}`);
      console.log(
        `cast: ${Array.isArray(m.tmdb_cast) ? m.tmdb_cast.length : 0}, directors: ${
          Array.isArray(m.tmdb_directors) ? m.tmdb_directors.length : 0
        }`
      );
    }

    const matched = sampleMovies.filter((m) => m.tmdb_movie_id).length;
    console.log(
      `\n✅ Diagnostics complete. Matched ${matched}/${sampleMovies.length} movies on TMDB.`
    );
  } catch (err) {
    console.error("\n❌ TMDB diagnostics failed:", err.message);
    process.exit(1);
  }
})();
