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
  const anyDate = selectedDate == "any";
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
      // Ako je odabrano kino
      if (cinemaOids.includes(performance.cinemaOid)) {
        // Ako je odabrani datum
        if (!anyDate) {
          return selectedDate === performance.cinemaDate;
        } else {
          return true;
        }
      } else {
        return false;
      }
    })
    .sort((a, b) => ("" + a.performanceTime).localeCompare(b.performanceTime));
  console.log("Performances: " + filteredPerformances.length);

  // Grupiranje performanca po filmu
  const groupedPerformances = new Map();
  for (const e of filteredPerformances) {
    if (!groupedPerformances.has(e.filmId)) {
      groupedPerformances.set(e.filmId, []);
    }
    groupedPerformances.get(e.filmId).push(e);
  }

  // Ako je anyDate, maknuti sve osim samo jednog datuma (najraniji od danas)
  if (anyDate) {
    const yesterd = new Date();
    yesterd.setDate(yesterd.getDate() - 1);
    const year = yesterd.getFullYear();
    const month = (yesterd.getMonth() + 1).toString().padStart(2, "0");
    const day = yesterd.getDate().toString().padStart(2, "0");
    const jucer = `${year}-${month}-${day}`;

    for (const filmId of groupedPerformances.keys()) {
      let najranijiDatum = "9999-99-99";
      let earliestPerformances = [];
      for (const perf of groupedPerformances.get(filmId)) {
        if (perf.cinemaDate.localeCompare(jucer) === 1) {
          if (perf.cinemaDate.localeCompare(najranijiDatum) === -1) {
            najranijiDatum = perf.cinemaDate;
            earliestPerformances = [perf];
          } else if (perf.cinemaDate.localeCompare(najranijiDatum) === 0) {
            earliestPerformances.push(perf);
          }
        }
      }

      groupedPerformances.set(filmId, earliestPerformances);
    }
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
  if (
    sortBy === "durationMins" ||
    sortBy === "imdbRating" ||
    sortBy === "letterboxdRating"
  ) {
    formattedData.sort((a, b) => b[sortBy] - a[sortBy]);
  } else if (sortBy === "genre") {
    formattedData.sort((a, b) => {
      const aGenre = a.englishCategories || a.genres;
      const bGenre = b.englishCategories || b.genres;
      const comparison = ("" + bGenre[0]).localeCompare(aGenre[0]);
      if (comparison === 0) {
        return b.imdbRating - a.imdbRating;
      } else {
        return comparison;
      }
    });
  } else {
    formattedData.sort((a, b) => {
      const comparison = b.nationwideStart.localeCompare(a.nationwideStart);
      if (comparison === 0) {
        return b.imdbRating - a.imdbRating;
      } else {
        return comparison;
      }
    });
  }

  return formattedData;
}
