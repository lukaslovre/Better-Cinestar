const fs = require("fs");

const headers = {
  "CENTER-OID": "10000000014OCPXCOG",
  //"SESSION-ID": "4ba9185e85b64c6583651c53329ffa7f",
  Host: "shop.cinestarcinemas.hr", //nepotrebno
  Referer: "https://shop.cinestarcinemas.hr/ZG", //nepotrebno
  "Accept-Encoding": "gzip, deflate, br",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0", //nepotrebno
};

async function cinestarApi(endpoint, cinema) {
  const url = "https://shop.cinestarcinemas.hr/api" + endpoint;
  headers["CENTER-OID"] = cinema.cinemaOid;

  const response = await fetch(url, { headers });
  const data = await response.json();

  console.log(data.length);
  return data;
}

// ovo pozivat svakih par dana?
async function getAllMovies(cinema) {
  const today = new Date();
  today.setDate(today.getDate() + 10);
  const month = today.getMonth() + 1;

  const tenDaysFromToday =
    today.getFullYear() +
    "-" +
    month.toString().padStart(2, "0") +
    "-" +
    today.getDate().toString().padStart(2, "0");

  const data = await cinestarApi(`/films?&cinemadate.to=${tenDaysFromToday}`, cinema);
  const moviesFormatted = data.map(
    ({ performances, filmEDI, name, imageUrl, ageRatingInformation, ...otherFields }) => {
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
        backgroundImage: null,
      };
    }
  );

  fs.writeFileSync("./data/movies.json", JSON.stringify(moviesFormatted));
  //return moviesWithoutPerformances;
}

async function getPerformanceTimesFor(filmId, cinema) {
  //https://shop.cinestarcinemas.hr/api/films/0A510000012FEPADHG
  const data = await cinestarApi("/films/" + filmId, cinema);
  const filmNumber = data.filmNumber;

  // filmReleaseTypeName i onda ga splitati po '/', GC je goldclass
  const formattedPerformances = data.performances.map(
    ({ id, performanceDateTime, releaseTypeName, filmId }) => {
      return {
        id,
        performanceDateTime,
        releaseTypeName,
        filmId,
        filmNumber,
        cinemaOid: cinema.cinemaOid,
      };
    }
  );

  fs.writeFileSync("./data/performances.json", JSON.stringify(formattedPerformances));

  //return formattedPerformances;
}
//getPerformanceTimesFor("0A510000012FEPADHG");

function getSeating() {
  ///api/performances/50C20000023VITSDHB/seatingplan
}

module.exports = { getAllMovies, getPerformanceTimesFor };
