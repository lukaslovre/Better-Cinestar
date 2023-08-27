const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

const cors = require("cors");
app.use(cors());

const { getCinemaMoviesAndPerformances } = require("./cinestarFunctions.js");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("./scraperFunctions.js");

app.use(express.static("public"));
app.set("view engine", "ejs");

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
const cinemasFormattedForDisplay = [
  {
    city: "Zagreb",
    cinemas: [
      { cinemaOid: "10000000014OCPXCOG", cinemaName: "Branimir mingle mall" },
      { cinemaOid: "20000000014FEPADHG", cinemaName: "Avenue mall" },
      { cinemaOid: "37000000014FEPADHG", cinemaName: "Arena centar" },
      { cinemaOid: "B7000000014FEPADHG", cinemaName: "Z centar" },
      { cinemaOid: "87000000014FEPADHG", cinemaName: "Kaptol boutique" },
    ],
  },
  {
    city: "Split",
    cinemas: [
      { cinemaOid: "17000000014FEPADHG", cinemaName: "Joker centar" },
      { cinemaOid: "97000000014FEPADHG", cinemaName: "Mall of split" },
    ],
  },
  {
    city: "Dubrovnik",
    cinemas: [{ cinemaOid: "57000000014FEPADHG", cinemaName: "Dvori lapad" }],
  },
  {
    city: "Osijek",
    cinemas: [{ cinemaOid: "27000000014FEPADHG", cinemaName: "Portanova centar" }],
  },
  {
    city: "Pula",
    cinemas: [{ cinemaOid: "A7000000014FEPADHG", cinemaName: "Max city" }],
  },
  {
    city: "Rijeka",
    cinemas: [{ cinemaOid: "40000000014FEPADHG", cinemaName: "Tower centar" }],
  },
  {
    city: "Slavnoski Brod",
    cinemas: [{ cinemaOid: "67000000014FEPADHG", cinemaName: "City colosseum" }],
  },
  {
    city: "Varaždin",
    cinemas: [{ cinemaOid: "47000000014FEPADHG", cinemaName: "Lumini centar" }],
  },
  {
    city: "Vukovar",
    cinemas: [{ cinemaOid: "77000000014FEPADHG", cinemaName: "K centar golubica" }],
  },
  {
    city: "Zadar",
    cinemas: [{ cinemaOid: "D4000000014FEPADHG", cinemaName: "City galleria" }],
  },
  {
    city: "Šibenik",
    cinemas: [{ cinemaOid: "07000000014FEPADHG", cinemaName: "Dalmare centar" }],
  },
];
let movies = JSON.parse(fs.readFileSync("./data/movies.json"));
let performances = JSON.parse(fs.readFileSync("./data/performances.json"));

app.get("/api/movies", (req, res) => {
  console.log(req.query);
  const { cinemaOids, selectedDate, sortBy } = req.query;

  const formattedMovies = formatDataForFrontend(
    cinemaOids.split(","),
    selectedDate,
    sortBy
  );
  res.send(formattedMovies);
});

app.get("/fillWithExternalData", async (req, res) => {
  res.end();

  movies = await fillMoviesWithLetterboxdData(movies);
  movies = await fillMoviesWithImdbData(movies);

  fs.writeFileSync("./data/movies.json", JSON.stringify(movies));
  console.log("Gotovo popunjavanje sa eksternim podacima");
});

app.get("/getCinestarMovies", async (req, res) => {
  res.end();

  console.log("Dohvacanje svih filmova sa CineStar-a");
  const tempMovies = [];
  performances = [];

  for (const cinema of cinemas) {
    const { moviesFormatted, performancesFormatted } =
      await getCinemaMoviesAndPerformances(cinema);
    tempMovies.push(...moviesFormatted);
    performances.push(...performancesFormatted);
  }

  console.log("Ukupno nadeno filmova: " + tempMovies.length);
  movies = tempMovies.filter(uniqueMovies);
  console.log("Jedinstvenih filmova: " + movies.length);
  console.log("performances.json: " + performances.length);

  fs.writeFileSync("./data/movies.json", JSON.stringify(movies));
  fs.writeFileSync("./data/performances.json", JSON.stringify(performances));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function uniqueMovies(value, index, array) {
  for (let i = 0; i < array.length; i++) {
    if (value.filmNumber === array[i].filmNumber) {
      return index === i;
    }
  }
}

function isSameDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}
function formatDataForFrontend(cinemaOids, selectedDate, sortBy) {
  const anyDate = selectedDate === "all";
  // Ako nije predan datum funkciji
  if (!selectedDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    selectedDate = `${year}-${month}-${day}`;
  }
  console.log(selectedDate);

  // Ako je u trazenom kinu i samo za danas
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

  // Spajanje perfromanca sa podacimo o filmu
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
