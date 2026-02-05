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
  if (["tmdb_runtime", "tmdb_rating", "tmdb_vote_count"].includes(sortBy)) {
    movies.sort((a, b) => sortByNumber(a, b, sortBy));
    return;
  }

  if (sortBy === "genre") {
    movies.sort((a, b) => sortByGenre(a, b, "tmdb_rating"));
    return;
  }

  if (sortBy === "nationwideStart") {
    movies.sort((a, b) => sortByString(a, b, "nationwideStart", "tmdb_rating"));
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
  const aValue = a[property];
  const bValue = b[property];

  const aStr = aValue == null ? "" : String(aValue);
  const bStr = bValue == null ? "" : String(bValue);
  const comparison = bStr.localeCompare(aStr);
  return comparison === 0 ? sortByNumber(a, b, secondarySortProperty) : comparison;
}

function getFirstGenreName(movie) {
  const tmdbGenres = movie?.tmdb_genres;
  if (Array.isArray(tmdbGenres) && tmdbGenres.length) {
    const first = tmdbGenres[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.name) return String(first.name);
  }

  const genres = movie?.genres;
  if (Array.isArray(genres) && genres.length) return String(genres[0]);

  return "";
}

function sortByGenre(a, b, secondarySortProperty) {
  const aStr = getFirstGenreName(a);
  const bStr = getFirstGenreName(b);
  const comparison = String(bStr).localeCompare(String(aStr));
  return comparison === 0 ? sortByNumber(a, b, secondarySortProperty) : comparison;
}

module.exports = {
  getMoviesByIds,
  sortMovies,
};
