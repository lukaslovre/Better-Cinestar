const { z } = require("zod");
const crypto = require("node:crypto");

function parseBooleanish(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(v)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(v)) return false;
  }
  return undefined;
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  // SEQUELIZE_LOGGING: z.coerce.boolean().default(false), // This is not good because Boolean("false") === true
  SEQUELIZE_LOGGING: z.preprocess(parseBooleanish, z.boolean().default(false)),
  SQLITE_STORAGE: z
    .string()
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v)),
  SCRAPER_SECRET: z.string(),
  CINESTAR_API_URL: z.string().default("https://shop.cinestarcinemas.hr/api"),
  // Optional tuning knobs for the on-demand Puppeteer seating fetcher
  PUPPETEER_MAX_CONCURRENCY: z.coerce.number().default(2),
  PUPPETEER_IDLE_TTL_MS: z.coerce.number().default(20 * 60 * 1000), // 20 minutes
  PUPPETEER_NAV_TIMEOUT_MS: z.coerce.number().default(12_000),
  PUPPETEER_EXECUTABLE_PATH: z
    .string()
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v)),
  PUPPETEER_USER_AGENT: z
    .string()
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v)),
  SEATING_CACHE_TTL_MS: z.coerce.number().default(60_000),
  SEATING_CACHE_MAX_ENTRIES: z.coerce.number().default(50),
  ANALYTICS_STORAGE_ITEMS: z.coerce.number().default(200),
  ANALYTICS_STORAGE_TIME_MINUTES: z.coerce.number().default(10),
  ANALYTICS_HASH_SALT: z.string().default(crypto.randomBytes(16).toString("hex")),
  // Optional DB schema version - increment when your models change in incompatible ways
  // If this value differs from the DB PRAGMA user_version the server can optionally reset the DB schema.
  DB_SCHEMA_VERSION: z.coerce.number().default(1),
  // If true, always reset DB schema on startup (dangerous: destroys data)
  FORCE_DB_RESET: z.preprocess(parseBooleanish, z.boolean().default(false)),
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
