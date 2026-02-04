const { z } = require("zod");

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

const analyticsQuerySchema = z.object({
  timespan: z.enum(["hour", "day", "week"]).default("hour"),
});

// Validates the incoming data from the scraper
const movieSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

const performanceSchema = z
  .object({
    id: z.string(),
    cinemaOid: z.string(),
    filmId: z.string(),
    performanceDateTime: z.string(),
  })
  .passthrough();

const performanceDatesSchema = z
  .object({
    cinemaOid: z.string(),
    filmId: z.string(),
    date: z.array(z.string()),
  })
  .passthrough();

const scrapeResultsSchema = z.object({
  movies: z.array(movieSchema).nonempty("Movies array cannot be empty"),
  performances: z.array(performanceSchema).nonempty("Performances array cannot be empty"),
  performanceDates: z
    .array(performanceDatesSchema)
    .nonempty("Performance dates array cannot be empty"),
});

module.exports = {
  moviesQuerySchema,
  seatingQuerySchema,
  performancesQuerySchema,
  analyticsQuerySchema,
  scrapeResultsSchema,
};
