const { configuration } = require("../config/environment");
const { saveAnalyticsToDatabase } = require("../db/db");
const { msFromMinutes } = require("../utils/utils");
const crypto = require("node:crypto");

// save to database every `timeInMs` or when the array is `items` long
const storageSavingFrequency = {
  timeInMs: msFromMinutes(configuration.ANALYTICS_STORAGE_TIME_MINUTES),
  items: configuration.ANALYTICS_STORAGE_ITEMS,
};

// In-memory request counter
let analyticsStorage = [];

// Middleware function
const analyticsMiddleware = (req, res, next) => {
  const startHrTime = process.hrtime();

  // Check request address to generate unique visitors field
  const uniqueVisitors = hashIp(req.ip);

  // Other essential fields for analytics
  const userAgent = req.get("User-Agent");
  const url = req.originalUrl;

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    // Add to storage
    analyticsStorage.push({
      uniqueVisitors,
      userAgent,
      url,
      statusCode: res.statusCode,
      responseTime: parseInt(elapsedTimeInMs),
    });

    if (analyticsStorage.length >= storageSavingFrequency.items) {
      saveAnalyticsToDatabase(analyticsStorage)
        .then(() => {
          analyticsStorage = [];
        })
        .catch((error) => {
          console.error("Error saving analytics data:", error.message);
        });
    }
  });
  // Pass control to the next middleware
  next();
};

// if the analyticsStorage gets to 100 items, or after 10 seconds, save it to database
setInterval(() => {
  saveAnalyticsToDatabase(analyticsStorage)
    .then(() => {
      analyticsStorage = [];
    })
    .catch((error) => {
      console.error("Error saving analytics data:", error.message);
    });
}, storageSavingFrequency.timeInMs);

function hashIp(ip) {
  return crypto
    .createHmac("sha256", configuration.ANALYTICS_HASH_SALT)
    .update(ip)
    .digest("hex");
}

module.exports = {
  analyticsMiddleware,
};
