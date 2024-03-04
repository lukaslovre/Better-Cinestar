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
}
async function enrichMoviesWithExternalData() {
  movies = await fillMoviesWithLetterboxdData(movies);
  console.log("\nFinished enriching with Letterboxd data\n");

  movies = await fillMoviesWithImdbData(movies);
  console.log("\nFinished enriching with IMDb data\n");
}

// Helper functions

function getCinemas() {
  return [
    {
      cinemaOid: "10000000014OCPXCOG",
      cinemaName: "Branimir mingle mall",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "20000000014FEPADHG",
      cinemaName: "Avenue mall",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "37000000014FEPADHG",
      cinemaName: "Arena centar",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "B7000000014FEPADHG",
      cinemaName: "Z centar",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "87000000014FEPADHG",
      cinemaName: "Kaptol boutique",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "57000000014FEPADHG",
      cinemaName: "Dvori lapad",
      cinemaCity: "Dubrovnik",
    },
    {
      cinemaOid: "27000000014FEPADHG",
      cinemaName: "Portanova centar",
      cinemaCity: "Osijek",
    },
    {
      cinemaOid: "A7000000014FEPADHG",
      cinemaName: "Max city",
      cinemaCity: "Pula",
    },
    {
      cinemaOid: "40000000014FEPADHG",
      cinemaName: "Tower centar",
      cinemaCity: "Rijeka",
    },
    {
      cinemaOid: "67000000014FEPADHG",
      cinemaName: "City colosseum",
      cinemaCity: "Slavonski Brod",
    },
    {
      cinemaOid: "17000000014FEPADHG",
      cinemaName: "Joker centar",
      cinemaCity: "Split",
    },
    {
      cinemaOid: "97000000014FEPADHG",
      cinemaName: "Mall of split",
      cinemaCity: "Split",
    },
    {
      cinemaOid: "47000000014FEPADHG",
      cinemaName: "Lumini centar",
      cinemaCity: "Varaždin",
    },
    {
      cinemaOid: "77000000014FEPADHG",
      cinemaName: "K centar golubica",
      cinemaCity: "Vukovar",
    },
    {
      cinemaOid: "D4000000014FEPADHG",
      cinemaName: "City galleria",
      cinemaCity: "Zadar",
    },
    {
      cinemaOid: "07000000014FEPADHG",
      cinemaName: "Dalmare centar",
      cinemaCity: "Šibenik",
    },
  ];
}
