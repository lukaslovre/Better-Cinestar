const { z } = require("zod");
const crypto = require("node:crypto");

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  // SEQUELIZE_LOGGING: z.coerce.boolean().default(false), // This is not good because Boolean("false") === true
  SEQUELIZE_LOGGING: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "false") return false;
    } else {
      return Boolean(val);
    }
  }, z.boolean().default(false)),
  SCRAPER_SECRET: z.string(),
  CINESTAR_API_URL: z.string().default("https://shop.cinestarcinemas.hr/api"),
  // Optional tuning knobs for the on-demand Puppeteer seating fetcher
  PUPPETEER_MAX_CONCURRENCY: z.coerce.number().default(2),
  PUPPETEER_IDLE_TTL_MS: z.coerce.number().default(20 * 60 * 1000), // 20 minutes
  PUPPETEER_NAV_TIMEOUT_MS: z.coerce.number().default(12_000),
  SEATING_CACHE_TTL_MS: z.coerce.number().default(60_000),
  SEATING_CACHE_MAX_ENTRIES: z.coerce.number().default(50),
  ANALYTICS_STORAGE_ITEMS: z.coerce.number().default(200),
  ANALYTICS_STORAGE_TIME_MINUTES: z.coerce.number().default(10),
  ANALYTICS_HASH_SALT: z.string().default(crypto.randomBytes(16).toString("hex")),
});

const env = envSchema.parse(process.env); // This will throw if the environment variables are not set correctly and shut down the server

const configuration = {
  ...env,
  // Add any other configuration options you need
};

console.log("Configuration loaded:", configuration);

module.exports = {
  configuration,
};
