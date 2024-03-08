const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { dateToHHMM, dateToYYYYMMDD } = require("./serving/utils.js");
const { getFormattedMovies } = require("./serving/index.js");
const { fetchSeating } = require("./serving/seating.js");
const { getPerformancesForDateAndMovie } = require("./serving/performances.js");

const { analyticsMiddleware } = require("./analytics.js");
const { getAnalytics } = require("./db.js");

app.use(cors());

app.get("/api/movies", analyticsMiddleware, async (req, res) => {
  const { cinemaOids, date, sortBy } = req.query;

  const { valid, message, cinemaOidsArray } = validateMovieParameters(
    cinemaOids,
    date,
    sortBy
  );

  if (!valid) {
    res.status(400).send(message);
    return;
  }

  // Movies matching the filters and with performances added to them
  const formattedMovies = await getFormattedMovies(cinemaOidsArray, date, sortBy);

  res.send(formattedMovies);
});

app.get("/api/seating", analyticsMiddleware, async (req, res) => {
  const { cinemaOid, performanceId } = req.query;

  const { valid, message } = validateSeatingParameters(cinemaOid, performanceId);

  if (!valid) {
    res.status(400).send(message);
    return;
  }

  const seating = await fetchSeating(cinemaOid, performanceId);

  res.send(seating);
});

app.get("/api/performances", analyticsMiddleware, async (req, res) => {
  const { cinemaOids, date, movieId } = req.query;

  const { valid, message, cinemaOidsArray } = validatePerformanceParameters(
    cinemaOids,
    date,
    movieId
  );

  if (!valid) {
    res.status(400).send(message);
    return;
  }

  const present = new Date();
  const today = dateToYYYYMMDD(present);
  const currentTime = dateToHHMM(present);

  // Get the performances
  const performances = await getPerformancesForDateAndMovie(
    cinemaOidsArray,
    date,
    today,
    currentTime,
    movieId
  );

  res.send(performances);
});

// app.get("/status", async (req, res) => {
//   const analytics = await getAnalytics();
//   res.send(analytics);
// });

app.use(express.static(path.join(__dirname, "client/public")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

console.log("Current time:", dateToHHMM(new Date()));

function validateMovieParameters(cinemaOids, date, sortBy) {
  // if any of the parameters is missing, return an error
  if (!cinemaOids || !date || !sortBy) {
    return { valid: false, message: "Missing parameters" };
  }

  // transform cinemaOids to array
  const cinemaOidsArray = Array.isArray(cinemaOids) ? cinemaOids : [cinemaOids];

  // check that parameters are of expected type
  if (Array.isArray(date) || Array.isArray(sortBy)) {
    return { valid: false, message: "Invalid parameters" };
  }

  if (
    cinemaOidsArray.every((cinemaOid) => cinemaOid.length !== 18) ||
    (date.length !== 10 && date !== "any")
  ) {
    return { valid: false, message: "Invalid parameters" };
  }

  // If we reach this point, the parameters are valid
  return { valid: true, message: "", cinemaOidsArray };
}
function validateSeatingParameters(cinemaOid, performanceId) {
  // if any of the parameters is missing, return an error
  if (!cinemaOid || !performanceId) {
    return { valid: false, message: "Missing parameters" };
  }

  // they mustnt be arrays
  if (Array.isArray(cinemaOid) || Array.isArray(performanceId)) {
    return { valid: false, message: "Invalid parameters" };
  }

  if (cinemaOid.length !== 18) {
    return { valid: false, message: "Invalid parameters" };
  }

  // If we reach this point, the parameters are valid
  return { valid: true, message: "" };
}

function validatePerformanceParameters(cinemaOids, date, movieId) {
  // if any of the parameters is missing, return an error
  if (!cinemaOids || !date || !movieId) {
    return { valid: false, message: "Missing parameters" };
  }

  // transform cinemaOids to array
  const cinemaOidsArray = Array.isArray(cinemaOids) ? cinemaOids : [cinemaOids];

  // check that parameters are of expected type
  if (Array.isArray(date) || Array.isArray(movieId)) {
    return { valid: false, message: "Invalid parameters" };
  }

  if (
    cinemaOidsArray.every((cinemaOid) => cinemaOid.length !== 18) ||
    (date.length !== 10 && date !== "any")
  ) {
    return { valid: false, message: "Invalid parameters" };
  }

  // If we reach this point, the parameters are valid
  return { valid: true, message: "", cinemaOidsArray };
}
