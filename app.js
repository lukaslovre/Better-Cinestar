const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { getFormattedMovies } = require("./serving/index.js");
const { fetchSeating } = require("./serving/seating.js");

app.use(cors());

app.get("/api/movies", async (req, res) => {
  // for measuring response time
  const startTime = Date.now();

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

  // for measuring response time
  const endTime = Date.now();
  console.log(`Response time: ${endTime - startTime}ms`);

  res.send(formattedMovies);
});

app.get("/api/seating", async (req, res) => {
  const { cinemaOid, performanceId } = req.query;

  // validate parameters
  if (!cinemaOid || !performanceId) {
    res.status(400).send("Missing parameters");
    return;
  }

  // they mustnt be arrays
  if (Array.isArray(cinemaOid) || Array.isArray(performanceId)) {
    res.status(400).send("Invalid parameters");
    return;
  }

  if (cinemaOid.length !== 18) {
    res.status(400).send("Invalid parameters");
    return;
  }

  const seating = await fetchSeating(cinemaOid, performanceId);

  res.send(seating);
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
