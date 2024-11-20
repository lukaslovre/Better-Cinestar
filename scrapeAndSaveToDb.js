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

    const { movies, performances, performanceDates } = await updateMoviesAndPerformances(
      cinemas
    );

    await saveMoviesToDatabase(movies);
    await savePerformancesToDatabase(performances);
    await savePerformanceDatesToDatabase(performanceDates);

    const enrichedMovies = await enrichMoviesWithExternalData(movies);

    await saveMoviesToDatabase(enrichedMovies);

    // const moviesWithLetterboxdUrl = movies.filter((movie) => movie.letterboxdUrl).length;
    // const percentageWithLetterboxdUrl = (
    //   (moviesWithLetterboxdUrl / enrichedMovies.length) *
    //   100
    // ).toFixed(2);

    // const successMessage = `Successfully saved ${enrichedMovies.length} movies and ${performances.length} performances to the database. ${moviesWithLetterboxdUrl} (${percentageWithLetterboxdUrl}%) of the movies have a Letterboxd URL.`;
    // console.log(successMessage);
    // sendToErrorCollector(successMessage);
  } catch (err) {
    console.error("Error occurred during data fetch and save process:", err.message);
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

  const performanceDates = getPerformanceDatesFrom(performancesFormatted);

  return {
    movies: moviesFormatted,
    performances: performancesFormatted,
    performanceDates,
  };
}

async function enrichMoviesWithExternalData(movies) {
  let enrichedMovies = await fillMoviesWithLetterboxdData(movies);

  // validation
  if (!enrichedMovies || !Array.isArray(enrichedMovies)) {
    throw new Error(
      "Error occurred during LetterBoxd data enrichment process: movies is not an array"
    );
  }

  console.log("Finished enriching with Letterboxd data and starting IMDb data fetch...");

  enrichedMovies = await fillMoviesWithImdbData(movies);

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
