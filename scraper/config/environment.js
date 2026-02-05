const { z } = require("zod");

const envSchema = z.object({
  SERVER_API_URL: z.string().url().default("http://localhost:3000/api/v1/scrape-results"),
  SCRAPER_SECRET: z.string(),
  CINESTAR_API_URL: z.string().url().default("https://shop.cinestarcinemas.hr/api"),

  // Metadata enrichment (TMDB)

  SCRAPER_DRY_RUN: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  TMDB_API_KEY: z.string().optional().default(""),
  TMDB_API_BASE_URL: z.string().url().default("https://api.themoviedb.org/3"),
  TMDB_IMAGE_BASE_URL: z.string().url().default("https://image.tmdb.org/t/p/"),
  TMDB_POSTER_SIZE: z.string().default("w500"),
  TMDB_PROFILE_SIZE: z.string().default("w185"),
  TMDB_LANGUAGE_PRIMARY: z.string().default("hr-HR"),
  TMDB_LANGUAGE_FALLBACK: z.string().default("en-US"),

  RUN_MODE: z.enum(["once", "scheduled"]).default("scheduled"),
  CRON_SCHEDULE: z.string().default("0 2 * * *"),
  SCRAPE_ON_START: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const env = envSchema.parse(process.env); // This will throw if the environment variables are not set correctly and stop the execution

const configuration = {
  ...env,
  // Add any other configuration options you need
};

function maskSecret(value) {
  if (!value) return "";
  const str = String(value);
  if (str.length <= 6) return "***";
  return `${str.slice(0, 2)}***${str.slice(-2)}`;
}

// Avoid printing secrets into logs
console.log("Configuration loaded:", {
  ...configuration,
  SCRAPER_SECRET: maskSecret(configuration.SCRAPER_SECRET),
  TMDB_API_KEY: configuration.TMDB_API_KEY ? "***" : "",
});

module.exports = {
  configuration,
};
