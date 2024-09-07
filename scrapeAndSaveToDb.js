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

getDataOnAppStart(movies, performances);

async function getDataOnAppStart(movies = [], performances = []) {
  try {
    const { movies: moviesFormatted, performances: performancesFormatted } =
      await updateMoviesAndPerformances(movies, performances);

    movies = moviesFormatted;
    performances = performancesFormatted;

    movies = await enrichMoviesWithExternalData(movies);

    await saveMoviesToDatabase(movies);
    await savePerformancesToDatabase(performances);

    const moviesWithLetterboxdUrl = movies.filter((movie) => movie.letterboxdUrl).length;

    const successMessage = `Successfully saved ${movies.length} movies and ${
      performances.length
    } performances to the database. ${moviesWithLetterboxdUrl} (${(
      (moviesWithLetterboxdUrl / movies.length) *
      100
    ).toFixed(2)}%) of the movies have a Letterboxd URL.`;

    sendToErrorCollector(successMessage);
  } catch (err) {
    sendToErrorCollector(err);
  }
}

async function updateMoviesAndPerformances(movies, performances) {
  console.log("Fetching movies and performances from CineStar.");

  const { moviesFormatted, performancesFormatted } = await fetchMoviesAndPerformances(
    cinemas
  );

  movies = moviesFormatted;
  performances = performancesFormatted;

  console.log(`Found ${movies.length} movies (${performances.length} performances).\n`);

  //  Get performance dates and save them to the database
  const performanceDates = getPerformanceDatesFrom(performances);
  await savePerformanceDatesToDatabase(performanceDates);

  return { movies, performances };
}
async function enrichMoviesWithExternalData(movies) {
  movies = await fillMoviesWithLetterboxdData(movies);
  console.log("\nFinished enriching with Letterboxd data\n");

  movies = await fillMoviesWithImdbData(movies);
  console.log("\nFinished enriching with IMDb data\n");

  return movies;
}

function sendToErrorCollector(message) {
  fetch("http://localhost:12120/report_error", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  }).catch((err) => console.error(err));
}
