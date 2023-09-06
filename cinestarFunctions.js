const fs = require("fs");

// Preset header za API poziv
const headers = {
  "CENTER-OID": "10000000014OCPXCOG",
  //"SESSION-ID": "4ba9185e85b64c6583651c53329ffa7f",
  Host: "shop.cinestarcinemas.hr", //nepotrebno
  Referer: "https://shop.cinestarcinemas.hr/ZG", //nepotrebno
  "Accept-Encoding": "gzip, deflate, br",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0", //nepotrebno
};

// Funkcija za lakse fetchanje sa shop.cinestar.hr
async function cinestarApi(endpoint, cinemaOid) {
  const url = "https://shop.cinestarcinemas.hr/api" + endpoint;
  headers["CENTER-OID"] = cinemaOid;

  const response = await fetch(url, { headers });
  const data = await response.json();

  return data;
}

// Vraca sve podatke o filmovima za odredeno kino
async function getCinemaMoviesAndPerformances(cinema) {
  const data = await cinestarApi("/films", cinema.cinemaOid);
  let performancesFormatted = [];

  // Movies
  const moviesFormatted = data.map(
    ({ performances, filmEDI, name, ageRatingInformation, ...otherFields }) => {
      // mozda bi bilo korisno tu invertat ovo da se vidi koji podaci ostaju.

      performancesFormatted.push(...performances);
      return {
        ...otherFields,
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
  );

  // Performances
  performancesFormatted = performancesFormatted.map(
    ({
      id,
      performanceDateTime,
      cinemaDate,
      auditoriumName,
      releaseTypeName,
      filmId,
    }) => {
      return {
        id,
        performanceDateTime,
        performanceTime: performanceDateTime.slice(11, 16),
        cinemaDate,
        auditoriumName,
        performanceFeatures: formatPerformanceFeatures(releaseTypeName),
        filmId,
        cinemaOid: cinema.cinemaOid,
      };
    }
  );

  return { moviesFormatted, performancesFormatted };
}

async function getSeating(cinemaOid, performanceId) {
  const data = await cinestarApi(`/performances/${performanceId}/seatingplan`, cinemaOid);
  if (data.errorMessage) return;

  const seatGroups = data.seatGroups.map((group) => group.seats);
  const formattedSeating = {
    height: data.height,
    width: data.width,
    maxX: findLargestX(seatGroups),
    maxY: seatGroups[seatGroups.length - 1][0].y,
    seats: seatGroups.flat().map((seat) => {
      return {
        x: seat.x,
        y: seat.y,
        // w: seat.w,
        // h: seat.h,
        sg: seat.sg,
        stat: seat.stat,
      };
    }),
  };

  return formattedSeating;
}

// Helper
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
function findLargestX(seatGroups) {
  if (seatGroups.length === 0) {
    return undefined;
  }

  let largest = seatGroups[0][seatGroups[0].length - 1].x;

  for (let i = 1; i < seatGroups.length; i++) {
    if (seatGroups[i][seatGroups[i].length - 1].x > largest) {
      largest = seatGroups[i][seatGroups[i].length - 1].x; // Update largest if a larger element is found
    }
  }

  return largest;
}

module.exports = { getCinemaMoviesAndPerformances, getSeating };
