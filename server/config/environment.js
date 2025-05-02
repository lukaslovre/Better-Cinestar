const { z } = require("zod");

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SEQUELIZE_LOGGING: z.coerce.boolean().default(false),
  ANALYTICS_STORAGE_ITEMS: z.coerce.number().default(200),
  ANALYTICS_STORAGE_TIME_MINUTES: z.coerce.number().default(10),
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
