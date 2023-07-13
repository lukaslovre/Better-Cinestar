const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

const { getAllMovies, getPerformanceTimesFor } = require("./cinestarFunctions.js");
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
    cinemaCity: "Slavonski brod",
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
let movies = JSON.parse(fs.readFileSync("./data/movies.json"));
let performances = JSON.parse(fs.readFileSync("./data/performances.json"));

app.get("/", (req, res) => {
  const dataFormattedForDisplay = formatDataForCinemas();
  res.render("index", { movies: dataFormattedForDisplay });
});

app.get("/fillWithExternalData", async (req, res) => {
  // TODO: formatirati sta se salje da ima svamo informacije koje treba i
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
    const cinemaMovies = await getAllMovies(cinema);
    cinemaMovies.forEach(async (movie) => {
      performances.push(...(await getPerformanceTimesFor(movie.id, cinema)));
    });
    tempMovies.push(...cinemaMovies);
  }
  console.log("Ukupno nadeno filmova: " + tempMovies.length);
  movies = tempMovies.filter(uniqueMovies);
  console.log("Jedinstvenih filmova: " + movies.length);
  console.log("performances.json: " + performances.length);

  fs.writeFileSync("./data/movies.json", JSON.stringify(movies));
  fs.writeFileSync("./data/performances.json", JSON.stringify(performances));
});
// funkcija getMovieData koji dobi sve podatke za sve filmove
// funkcija getMovieSchedules koji dobi kada sve igraju filmovi u kojem mjestu (sve jedna lista koja ima neki atribut cinema-oid)

// funkcija getPlayingMovies koji dobi samo listu imena filmova za mjesto (zato da se moze napraviti nova lista sa samo unique vrijednostima)

// za svaki film u toj unique listi naci podatke iz podatka o filmovima
// za svaki film naci kada igraju danas

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
function isToday(date) {
  const today = new Date();
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

function formatDataForCinemas() {
  // Ako je u trazenom kinu i samo za danas
  const filteredPerformances = performances.filter((performance) => {
    if (performance.cinemaOid === cinemas[0].cinemaOid) {
      const performanceDateTime = new Date(performance.performanceDateTime);
      return isToday(performanceDateTime);
    }
  });
  console.log(filteredPerformances.length);

  // Grupiranje prikazivanja po filmu
  const groupedPerformances = new Map();
  for (const e of filteredPerformances) {
    if (!groupedPerformances.has(e.filmNumber)) {
      groupedPerformances.set(e.filmNumber, []);
    }
    groupedPerformances.get(e.filmNumber).push(e);
  }

  // Formatiranje za display
  const formattedData = [];
  for (const filmNumber of groupedPerformances.keys()) {
    const movieData = structuredClone(
      movies.find((movie) => movie.filmNumber === filmNumber)
    );
    movieData.performances = groupedPerformances.get(filmNumber);
    formattedData.push(movieData);
  }

  return formattedData;
}
