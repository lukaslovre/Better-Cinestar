const { Op } = require("sequelize");
const { Movie } = require("../db/models");

async function getMoviesByIds(movieIds) {
  const movies = [];

  const moviesResult = await Movie.findAll({
    where: {
      id: {
        [Op.in]: movieIds,
      },
    },
  });

  moviesResult.forEach((movie) => {
    movies.push(movie.toJSON());
  });

  return movies;
}

// Main sorting function
function sortMovies(movies, sortBy) {
  if (["durationMins", "imdbRating", "letterboxdRating"].includes(sortBy)) {
    movies.sort((a, b) => sortByNumber(a, b, sortBy));
  } else if (sortBy === "genre") {
    movies.sort((a, b) => sortByString(a, b, "englishCategories", "imdbRating"));
  } else if (sortBy === "nationwideStart") {
    movies.sort((a, b) => sortByString(a, b, "nationwideStart", "imdbRating"));
  }
}

// Helper function to sort by number
function sortByNumber(a, b, property) {
  const aValue = a[property] || 0;
  const bValue = b[property] || 0;
  return bValue - aValue;
}

// Helper function to sort by string
function sortByString(a, b, property, secondarySortProperty) {
  const aValue = a[property] || a.genres;
  const bValue = b[property] || b.genres;

  let comparison;
  // ako je niz
  if (Array.isArray(aValue) && Array.isArray(bValue)) {
    comparison = ("" + bValue[0]).localeCompare(aValue[0]);
  } else {
    comparison = ("" + bValue).localeCompare(aValue);
  }
  return comparison === 0 ? sortByNumber(a, b, secondarySortProperty) : comparison;
}

module.exports = {
  getMoviesByIds,
  sortMovies,
};
