const RUN_WITHOUT_FETCHING_MOVIES = true;

const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { saveMoviesToDatabase, savePerformancesToDatabase } = require("./db.js");

const { fetchMoviesAndPerformances } = require("./scraping/cinestarFunctions.js");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("./scraping/imdbAndLetterboxdFunctions.js");

const { getFormattedMovies } = require("./serving/index.js");

app.use(cors());

app.get("/api/movies", async (req, res) => {
  const { cinemaOids, date, sortBy } = req.query;
  console.log(cinemaOids, date, sortBy);

  // if any of the parameters is missing, return an error
  if (!cinemaOids || !date || !sortBy) {
    res.status(400).send("Missing parameters");
    return;
  }

  // transform cinemaOids to array
  const cinemaOidsArray = Array.isArray(cinemaOids) ? cinemaOids : [cinemaOids];

  // check that parameters are of expected type
  // cinemaOids: string[]
  // date: string
  // sortBy: string
  if (Array.isArray(date) || Array.isArray(sortBy)) {
    res.status(400).send("Invalid parameters");
    return;
  }

  if (
    cinemaOidsArray.every((cinemaOid) => cinemaOid.length !== 18) ||
    date.length !== 10
  ) {
    res.status(400).send("Invalid parameters");
    return;
  }

  // Movies matching the filters
  // and with performances added to them
  const formattedMovies = await getFormattedMovies(cinemaOidsArray, date, sortBy);

  res.send(formattedMovies);
});

app.get("/api/seating", async (req, res) => {
  console.log(req.query);
  const { cinemaOid, performanceId } = req.query;
  res.send(await getSeating(cinemaOid, performanceId));
});
// app.get("/getMovies", async (req, res) => {
//   res.send("Dohvacanje filmova i performance-a sa CineStar-a.");
//   await updateMoviesAndPerformances();
//   updateExternalData();
// });

app.use(express.static(path.join(__dirname, "client/public")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const cinemas = getCinemas(); //.slice(0, 2);

let movies = [];
let performances = [];

if (!RUN_WITHOUT_FETCHING_MOVIES) {
  getDataOnAppStart();
}

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
