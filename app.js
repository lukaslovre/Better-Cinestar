const express = require("express");
const app = express();
const port = 3000;
// const fs = require("fs");
const cors = require("cors");

app.use(cors());
app.use(express.static("client/public"));

const { getCinemaMoviesAndPerformances, getSeating } = require("./cinestarFunctions.js");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("./scraperFunctions.js");

const cinemas = [
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
let movies = [];
let performances = [];
// let movies = JSON.parse(fs.readFileSync("./data/movies.json"));
// let performances = JSON.parse(fs.readFileSync("./data/performances.json"));

app.get("/api/movies", (req, res) => {
  console.log(req.query);
  const { cinemaOids, selectedDate, sortBy } = req.query;

  if (movies.length === 0 || performances.length === 0) {
    res.send([]);
    return;
  }

  const formattedMovies = formatDataForFrontend(
    cinemaOids.split(","),
    selectedDate,
    sortBy
  );
  res.send(formattedMovies);
});
app.get("/api/seating", async (req, res) => {
  console.log(req.query);
  const { cinemaOid, performanceId } = req.query;
  res.send(await getSeating(cinemaOid, performanceId));
});
app.get("/getMovies", async (req, res) => {
  res.send("Dohvacanje filmova i performance-a sa CineStar-a.");
  await updateMoviesAndPerformances();
  updateExternalData();
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

getDataOnAppStart();
// const oneDay = 1 * 24 * 60 * 60 * 1000;
// setInterval(updateMoviesAndPerformances, oneDay);
const sixHours = 6 * 60 * 60 * 1000;
setInterval(updateExternalData, sixHours);

async function updateMoviesAndPerformances() {
  console.log("Dohvacanje filmova i performance-a sa CineStar-a.");
  const tempMovies = [];
  const tempPerformances = [];

  for (const cinema of cinemas) {
    const { moviesFormatted, performancesFormatted } =
      await getCinemaMoviesAndPerformances(cinema);
    tempMovies.push(...moviesFormatted);
    tempPerformances.push(...performancesFormatted);
  }

  movies = tempMovies.filter(uniqueMovies);
  performances = tempPerformances;

  console.log(
    "Pronadeno " + movies.length + " filmova (" + performances.length + " performances)."
  );
}
async function updateExternalData() {
  movies = await fillMoviesWithLetterboxdData(movies);
  movies = await fillMoviesWithImdbData(movies);

  console.log("Gotovo popunjavanje sa eksternim podacima");
}
async function getDataOnAppStart() {
  await updateMoviesAndPerformances();
  updateExternalData();
}

// Helper functions
function uniqueMovies(value, index, array) {
  for (let i = 0; i < array.length; i++) {
    if (value.filmNumber === array[i].filmNumber) {
      return index === i;
    }
  }
}
function formatDataForFrontend(cinemaOids, selectedDate, sortBy) {
  const anyDate = selectedDate === "all";
  if (!selectedDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    selectedDate = `${year}-${month}-${day}`;
  }

  // Ako je u trazenom kinu i na odabrani datum
  const filteredPerformances = performances
    .filter((performance) => {
      // if in
      if (cinemaOids.includes(performance.cinemaOid)) {
        if (anyDate) {
          return true;
        } else {
          return selectedDate === performance.cinemaDate;
        }
      } else {
        return false;
      }
    })
    .sort((a, b) => ("" + a.performanceTime).localeCompare(b.performanceTime));
  console.log("Performances: " + filteredPerformances.length);

  // Grupiranje prikazivanja po filmu
  const groupedPerformances = new Map();
  for (const e of filteredPerformances) {
    if (!groupedPerformances.has(e.filmId)) {
      groupedPerformances.set(e.filmId, []);
    }
    groupedPerformances.get(e.filmId).push(e);
  }

  // Spajanje perfromanca sa podacima o filmu
  // moze se efikasnije mozda, jer .keys() vrati niz i onda gledati isto
  // sa contains
  const formattedData = [];
  for (const filmId of groupedPerformances.keys()) {
    const movieData = structuredClone(movies.find((movie) => movie.id === filmId));
    movieData.performances = groupedPerformances.get(filmId);
    formattedData.push(movieData);
  }

  // Sortiranje filmova
  if (sortBy === "durationMins" || sortBy === "imdbRating") {
    formattedData.sort((a, b) => b[sortBy] - a[sortBy]);
  } else if (sortBy === "genre") {
    formattedData.sort((a, b) => {
      if (!b.englishCategories || !a.englishCategories) {
        const comparison = ("" + b.genres[0]).localeCompare(a.genres[0]);
        if (comparison === 0) {
          return b.imdbRating - a.imdbRating;
        } else {
          return comparison;
        }
      } else {
        const comparison = ("" + b.englishCategories[0]).localeCompare(
          a.englishCategories[0]
        );
        if (comparison === 0) {
          return b.imdbRating - a.imdbRating;
        } else {
          return comparison;
        }
      }
    });
  } else {
    formattedData.sort((a, b) => {
      if (b[sortBy] == null) return -1;

      const comparison = ("" + b[sortBy]).localeCompare(a[sortBy]);
      if (comparison === 0) {
        return b.imdbRating - a.imdbRating;
      } else {
        return comparison;
      }
    });
  }

  return formattedData;
}
