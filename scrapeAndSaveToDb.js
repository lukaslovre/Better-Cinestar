const { getCinemas } = require("./cinemasList.js");
const {
  saveMoviesToDatabase,
  savePerformancesToDatabase,
  savePerformanceDatesToDatabase,
} = require("./db.js");

const { fetchMoviesAndPerformances } = require("./scraping/cinestarFunctions.js");
const { getPerformanceDatesFrom } = require("./scraping/getPerformanceDates.js");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("./scraping/imdbAndLetterboxdFunctions.js");

const cinemas = getCinemas();

(async () => {
  await getDataOnAppStart();
})();

async function getDataOnAppStart() {
  try {
    console.log("Starting data fetch on app start...");

    const { movies, performances } = await updateMoviesAndPerformances(cinemas);

    console.log(
      "Movies and performances fetched. Enriching movies with external data..."
    );

    console.log("Saving movies and performances to the database...");
    await saveMoviesToDatabase(movies);
    await savePerformancesToDatabase(performances);

    const enrichedMovies = await enrichMoviesWithExternalData(movies);

    console.log("Saving enriched movies to the database...");
    await saveMoviesToDatabase(enrichedMovies);

    const moviesWithLetterboxdUrl = movies.filter((movie) => movie.letterboxdUrl).length;
    const percentageWithLetterboxdUrl = (
      (moviesWithLetterboxdUrl / enrichedMovies.length) *
      100
    ).toFixed(2);

    const successMessage = `Successfully saved ${enrichedMovies.length} movies and ${performances.length} performances to the database. ${moviesWithLetterboxdUrl} (${percentageWithLetterboxdUrl}%) of the movies have a Letterboxd URL.`;
    console.log(successMessage);
    // sendToErrorCollector(successMessage);
  } catch (err) {
    console.error("Error occurred during data fetch and save process:", err);
    // sendToErrorCollector(err.message);
  }
}

async function updateMoviesAndPerformances(cinemas) {
  console.log("Fetching movies and performances from CineStar...");

  const { moviesFormatted, performancesFormatted } = await fetchMoviesAndPerformances(
    cinemas
  );

  console.log(
    `Found ${moviesFormatted.length} movies and ${performancesFormatted.length} performances.`
  );

  // Get performance dates and save them to the database
  const performanceDates = getPerformanceDatesFrom(performancesFormatted);
  await savePerformanceDatesToDatabase(performanceDates);

  return { movies: moviesFormatted, performances: performancesFormatted };
}

async function enrichMoviesWithExternalData(movies) {
  console.log("Enriching movies with Letterboxd data...");
  let enrichedMovies = await fillMoviesWithLetterboxdData(movies);
  console.log("Finished enriching with Letterboxd data.");

  console.log("Enriching movies with IMDb data...");
  enrichedMovies = await fillMoviesWithImdbData(movies);
  console.log("Finished enriching with IMDb data.");

  return enrichedMovies;
}

// function sendToErrorCollector(message) {
//   fetch("http://localhost:12120/report_error", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ message }),
//   }).catch((err) => console.error("Failed to send error report:", err));
// }
