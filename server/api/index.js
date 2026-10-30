const {
  getPerformancesFiltered,
  groupPerformancesByFilmid,
  filterPerformancesByEarliestDate,
} = require("./performances");
const { dateToYYYYMMDD, dateToHHMM } = require("../utils/utils.js");

const { getMoviesByIds, sortMovies } = require("./movies");
const { getPerformanceDatesForMovies } = require("../db/db.js");

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

  const dateRows = await getPerformanceDatesForMovies(
    cinemaOids,
    movies.map((movie) => movie.id)
  );
  const datesByFilmId = new Map();
  for (const row of dateRows) {
    const filmId = String(row.filmId);
    if (!datesByFilmId.has(filmId)) datesByFilmId.set(filmId, new Set());
    const dates = datesByFilmId.get(filmId);
    for (const date of Array.isArray(row.date) ? row.date : []) {
      if (typeof date === "string" && date >= today) dates.add(date);
    }
  }

  // spojiti filmove sa performansama
  for (const movie of movies) {
    const performanceGroup = performancesGroupedByFilmid.find(
      (group) => group.filmId === movie.id
    );

    movie.performances = performanceGroup ? performanceGroup.performances : [];

    movie.availableDates = [...(datesByFilmId.get(String(movie.id)) || [])].sort();
  }

  // sortirati filmove
  sortMovies(movies, sortBy);

  return movies;
}

module.exports = {
  getFormattedMovies,
};
