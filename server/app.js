const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { dateToHHMM, dateToYYYYMMDD } = require("./utils/utils.js");
const { getFormattedMovies } = require("./api/index.js");
const { fetchSeating } = require("./api/seating.js");
const { getPerformancesForDateAndMovie } = require("./api/performances.js");
const { analyticsMiddleware } = require("./middleware/analyticsMiddleware.js");
const { getCinemas } = require("./utils/cinemasList.js");
const { getAnalytics } = require("./db/db.js");
const { z } = require("zod");

app.use(cors());
app.set("trust proxy", true); // trust the reverse proxy (nginx) to set the x-forwarded-for header

// Zod Schemas
const cinemaOidSchema = z.string().length(18, "Invalid cinema OID format");
const cinemaOidsSchema = z.preprocess(
  (val) => (Array.isArray(val) ? val : [val]),
  z.array(cinemaOidSchema).nonempty("At least one cinema OID is required")
);
const dateSchema = z.union(
  [z.string().length(10, "Invalid date format"), z.literal("any")],
  {
    errorMap: () => ({ message: "Date must be YYYY-MM-DD or 'any'" }),
  }
);

const moviesQuerySchema = z.object({
  cinemaOids: cinemaOidsSchema,
  date: dateSchema,
  sortBy: z.string().min(1, "SortBy is required"),
});

const seatingQuerySchema = z.object({
  cinemaOid: cinemaOidSchema,
  performanceId: z.string().min(1, "Performance ID is required"),
});

const performancesQuerySchema = z.object({
  cinemaOids: cinemaOidsSchema,
  date: dateSchema,
  movieId: z.string().min(1, "Movie ID is required"),
});

app.get("/api/movies", analyticsMiddleware, async (req, res) => {
  const result = moviesQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOids, date, sortBy } = result.data;

  // Movies matching the filters and with performances added to them
  const formattedMovies = await getFormattedMovies(cinemaOids, date, sortBy);

  res.send(formattedMovies);
});

app.get("/api/seating", analyticsMiddleware, async (req, res) => {
  const result = seatingQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOid, performanceId } = result.data;

  const seating = await fetchSeating(cinemaOid, performanceId);

  res.send(seating);
});

app.get("/api/performances", analyticsMiddleware, async (req, res) => {
  const result = performancesQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const { cinemaOids, date, movieId } = result.data;

  const present = new Date();
  const today = dateToYYYYMMDD(present);
  const currentTime = dateToHHMM(present);

  // Get the performances
  const performances = await getPerformancesForDateAndMovie(
    cinemaOids,
    date,
    today,
    currentTime,
    movieId
  );

  res.send(performances);
});

app.get("/api/health", (req, res) => {
  res.send("OK");
});

app.get("/api/getAnalyticsData", async (req, res) => {
  const analytics = await getAnalytics();
  res.send(analytics);
});
app.get("/api/getCinemasList", (req, res) => {
  res.send(getCinemas());
});

app.use("/analytics", express.static(path.join(__dirname, "public", "analytics")));
app.use(express.static(path.join(__dirname, "client", "public")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

console.log("Current time:", dateToHHMM(new Date()));
