const {
  getPerformancesFiltered,
  groupPerformancesByFilmid,
  filterPerformancesByEarliestDate,
} = require("./performances");
const { dateToYYYYMMDD, dateToHHMM } = require("./utils");

const { getMoviesByIds, sortMovies } = require("./movies");

const { getPerformanceDatesFor } = require("../db.js");

async function getFormattedMovies(cinemaOids, date, sortBy) {
  const present = new Date();
  const today = dateToYYYYMMDD(present);
  const currentTime = dateToHHMM(present);

  // console.log("today", today);
  // console.log("currentTime", currentTime);

  const performances = await getPerformancesFiltered(
    cinemaOids,
    date,
    today,
    currentTime
  );

  // grupirati performanse po filmu
  const performancesGroupedByFilmid = groupPerformancesByFilmid(performances);

  // ako je "any", maknuti sve osim samo jednog datuma (najraniji od danas)
  if (date === "any") {
    filterPerformancesByEarliestDate(performancesGroupedByFilmid, today, currentTime);
  }

  // nabaviti filmove
  const movieIdsFromPerformances = performancesGroupedByFilmid.map(
    (group) => group.filmId
  );

  const movies = await getMoviesByIds(movieIdsFromPerformances);

  // spojiti filmove sa performansama
  for (const movie of movies) {
    const performanceGroup = performancesGroupedByFilmid.find(
      (group) => group.filmId === movie.id
    );

    movie.performances = performanceGroup ? performanceGroup.performances : [];

    movie.availableDates = (await getPerformanceDatesFor(cinemaOids, movie.id)).date
      .filter((date) => date >= today)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  // sortirati filmove
  sortMovies(movies, sortBy);

  return movies;
}

module.exports = {
  getFormattedMovies,
};
