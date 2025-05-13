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

    const enrichedMovies = await enrichMoviesWithExternalData(movies);

    // Send data to server API
    console.log("Sending data to server API...");
    try {
      const payload = {
        movies: enrichedMovies,
        performances: performances,
        performanceDates: performanceDates,
      };
      const response = await axios.post(configuration.SERVER_API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Scraper-Secret": configuration.SCRAPER_SECRET,
        },
      });
      console.log("Data successfully sent to server:", response.data);
      const moviesWithLetterboxdUrl = enrichedMovies.filter(
        (movie) => movie.letterboxdUrl
      ).length;
      const percentageWithLetterboxdUrl = (
        (moviesWithLetterboxdUrl / enrichedMovies.length) *
        100
      ).toFixed(2);
      const successMessage = `Successfully sent ${enrichedMovies.length} movies and ${performances.length} performances to the server. ${moviesWithLetterboxdUrl} (${percentageWithLetterboxdUrl}%) of the movies have a Letterboxd URL.`;
      console.log(successMessage);
    } catch (error) {
      console.error(
        "Error sending data to server API:",
        error.response ? error.response.data : error.message
      );
    }
  } catch (err) {
    console.error("Error occurred during data fetch and send process:", err.message);
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

  enrichedMovies = await fillMoviesWithImdbData(enrichedMovies);

  return enrichedMovies;
}
