const API_URL = "https://shop.cinestarcinemas.hr/api";
const DEFAULT_HEADERS = {
  "Accept-Encoding": "gzip, deflate, br",
};

async function cinestarApi(endpoint, cinemaOid) {
  const url = `${API_URL}${endpoint}`;
  const headers = { ...DEFAULT_HEADERS, "CENTER-OID": cinemaOid };

  const response = await fetch(url, { headers });
  const data = await response.json();

  return data;
}

async function fetchMoviesAndPerformances(cinemas) {
  const movies = [];
  const performances = [];

  for (const cinema of cinemas) {
    const { movies: moviesFormatted, formattedPerformances: performancesFormatted } =
      await getCinemaMoviesAndPerformances(cinema);
    movies.push(...moviesFormatted);
    performances.push(...performancesFormatted);
  }

  const uniqueMovies = filterUniqueMovies(movies);

  return { moviesFormatted: uniqueMovies, performancesFormatted: performances };
}

async function getCinemaMoviesAndPerformances(cinema) {
  const data = await cinestarApi("/films", cinema.cinemaOid);
  let performances = [];

  const movies = data.map(({ performances: moviePerformances, ...movie }) => {
    performances.push(...moviePerformances);
    return formatMovie(movie);
  });

  const formattedPerformances = performances.map((performance) =>
    formatPerformance(performance, cinema.cinemaOid)
  );

  return { movies, formattedPerformances };
}

function formatMovie(movie) {
  return {
    ...movie,
    duration: null,
    letterboxdUrl: null,
    letterboxdRating: null,
    imdbUrl: null,
    imdbRating: null,
    englishCategories: null,
    englishSynopsis: null,
    trailerLink: null,
    englishDirectors: null,
    posterUrl: null,
  };
}

function formatPerformance(performance, cinemaOid) {
  return {
    ...performance,
    performanceTime: performance.performanceDateTime.slice(11, 16),
    performanceFeatures: formatPerformanceFeatures(performance.releaseTypeName),
    cinemaOid,
  };
}

function formatPerformanceFeatures(releaseTypeName) {
  const features = releaseTypeName.split("/");

  let index;
  if ((index = features.indexOf("3D")) !== -1) {
    swap(features, 0, index);
  } else {
    features.unshift("2D");
  }

  if (
    (index = features.indexOf("SINK")) !== -1 ||
    (index = features.indexOf("TITL")) !== -1
  ) {
    swap(features, 1, index);
  }

  if ((index = features.indexOf("GC")) !== -1) {
    features[index] = "GOLD";
  }

  return features.slice(0, 2).concat(features.slice(2).sort());
}

function swap(arr, a, b) {
  if (a === b) return;
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function filterUniqueMovies(movies) {
  return movies.filter(
    (value, index, array) =>
      array.findIndex((movie) => movie.filmNumber === value.filmNumber) === index
  );
}

module.exports = { fetchMoviesAndPerformances };

// // ovo ce se izvrsavat na klijentu?
// async function getSeating(cinemaOid, performanceId) {
//   const data = await cinestarApi(`/performances/${performanceId}/seatingplan`, cinemaOid);
//   if (data.errorMessage) return;

//   const formattedSeating = formatSeating(data);

//   return formattedSeating;
// }

// function formatSeating(data) {
//   const seatGroups = data.seatGroups.map((group) => group.seats);
//   return {
//     height: data.height,
//     width: data.width,
//     maxX: findLargestX(seatGroups),
//     maxY: findLargestY(seatGroups),
//     seats: seatGroups.flat().map(formatSeat),
//   };
// }

// function formatSeat(seat) {
//   return {
//     x: seat.x,
//     y: seat.y,
//     sg: seat.sg,
//     stat: seat.stat,
//   };
// }
// function findLargestX(seatGroups) {
//   return seatGroups.reduce((max, group) => Math.max(max, group[group.length - 1].x), 0);
// }

// function findLargestY(seatGroups) {
//   return seatGroups.reduce((max, group) => Math.max(max, group[0].y), 0);
// }
