const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { dateToHHMM } = require("./serving/utils.js");
const { getFormattedMovies } = require("./serving/index.js");
const { fetchSeating } = require("./serving/seating.js");

app.use(cors());

app.get("/api/movies", async (req, res) => {
  // for measuring response time
  const startTime = Date.now();

  const { cinemaOids, date, sortBy } = req.query;

  const { valid, message, cinemaOidsArray } = validateParameters(
    cinemaOids,
    date,
    sortBy
  );

  if (!valid) {
    res.status(400).send(message);
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

app.use(express.static(path.join(__dirname, "client/public")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

console.log("Current time:", dateToHHMM(new Date()));

function validateParameters(cinemaOids, date, sortBy) {
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
