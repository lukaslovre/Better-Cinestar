const { z } = require("zod");

const envSchema = z.object({
  SERVER_API_URL: z.string().url().default("http://localhost:3000/api/v1/scrape-results"),
  SCRAPER_SECRET: z.string(),
  CINESTAR_API_URL: z.string().url().default("https://shop.cinestarcinemas.hr/api"),
});

const env = envSchema.parse(process.env); // This will throw if the environment variables are not set correctly and stop the execution

const configuration = {
  ...env,
  // Add any other configuration options you need
};

console.log("Configuration loaded:", configuration);

module.exports = {
  configuration,
};
