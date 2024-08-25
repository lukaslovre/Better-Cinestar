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

const cinemas = getCinemas(); //.slice(0, 2);

let movies = [];
let performances = [];

getDataOnAppStart();

async function getDataOnAppStart() {
  await updateMoviesAndPerformances();
  await enrichMoviesWithExternalData();

  await saveMoviesToDatabase(movies);
  await savePerformancesToDatabase(performances);
}

async function updateMoviesAndPerformances() {
  console.log("Fetching movies and performances from CineStar.");

  const { moviesFormatted, performancesFormatted } = await fetchMoviesAndPerformances(
    cinemas
  );

  movies = moviesFormatted;
  performances = performancesFormatted;

  //  Get performance dates and save them to the database
  const performanceDates = await getPerformanceDatesFrom(performances);
  await savePerformanceDatesToDatabase(performanceDates);

  console.log(`Found ${movies.length} movies (${performances.length} performances).\n`);
  sendToErrorCollector(
    `Found ${movies.length} movies (${performances.length} performances).`
  );
}
async function enrichMoviesWithExternalData() {
  movies = await fillMoviesWithLetterboxdData(movies);
  console.log("\nFinished enriching with Letterboxd data\n");

  movies = await fillMoviesWithImdbData(movies);
  console.log("\nFinished enriching with IMDb data\n");
}

function sendToErrorCollector(message) {
  fetch("localhost:12120/report_error", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  }).catch((err) => console.error(err));
}
