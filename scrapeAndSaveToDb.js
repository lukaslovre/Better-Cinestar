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

let movies = [];
let performances = [];

(async () => {
  await getDataOnAppStart(movies, performances);
})();

async function getDataOnAppStart(movies = [], performances = []) {
  try {
    console.log("Starting data fetch on app start...");

    const { movies: moviesFormatted, performances: performancesFormatted } =
      await updateMoviesAndPerformances(movies, performances);

    movies = moviesFormatted;
    performances = performancesFormatted;

    console.log(
      "Movies and performances fetched. Enriching movies with external data..."
    );

    movies = await enrichMoviesWithExternalData(movies);

    console.log("Saving movies and performances to the database...");

    await saveMoviesToDatabase(movies);
    await savePerformancesToDatabase(performances);

    const moviesWithLetterboxdUrl = movies.filter((movie) => movie.letterboxdUrl).length;

    const successMessage = `Successfully saved ${movies.length} movies and ${
      performances.length
    } performances to the database. ${moviesWithLetterboxdUrl} (${(
      (moviesWithLetterboxdUrl / movies.length) *
      100
    ).toFixed(2)}%) of the movies have a Letterboxd URL.`;

    console.log(successMessage);
    sendToErrorCollector(successMessage);
  } catch (err) {
    console.error("Error occurred during data fetch and save process:", err);
    sendToErrorCollector(err.message);
  }
}

async function updateMoviesAndPerformances(movies, performances) {
  console.log("Fetching movies and performances from CineStar...");

  const { moviesFormatted, performancesFormatted } = await fetchMoviesAndPerformances(
    cinemas
  );

  movies = moviesFormatted;
  performances = performancesFormatted;

  console.log(`Found ${movies.length} movies and ${performances.length} performances.`);

  // Get performance dates and save them to the database
  const performanceDates = getPerformanceDatesFrom(performances);
  await savePerformanceDatesToDatabase(performanceDates);

  return { movies, performances };
}

async function enrichMoviesWithExternalData(movies) {
  console.log("Enriching movies with Letterboxd data...");
  movies = await fillMoviesWithLetterboxdData(movies);
  console.log("Finished enriching with Letterboxd data.");

  console.log("Enriching movies with IMDb data...");
  movies = await fillMoviesWithImdbData(movies);
  console.log("Finished enriching with IMDb data.");

  return movies;
}

function sendToErrorCollector(message) {
  fetch("http://localhost:12120/report_error", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  }).catch((err) => console.error("Failed to send error report:", err));
}
