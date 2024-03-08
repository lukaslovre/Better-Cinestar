const { saveAnalyticsToDatabase } = require("./db.js");

// In-memory request counter
let analyticsStorage = [];
const storageSavingFrequency = {
  timeInMs: 10 * 60 * 1000, // 10 minutes
  items: 200, // 200 items
};

// Middleware function
const analyticsMiddleware = (req, res, next) => {
  const startHrTime = process.hrtime();

  // Check request address to generate unique visitors field
  const uniqueVisitors = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Your other essential fields for analytics
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
      referrer: req.get("Referrer") || "",
      responseTime: parseInt(elapsedTimeInMs),
    });

    // if the array is 100 items long, save it to the database
    if (analyticsStorage.length >= storageSavingFrequency.items) {
      saveAnalyticsToDatabase(analyticsStorage);
      analyticsStorage = [];
    }
  });
  // Pass control to the next middleware
  next();
};

// if the analyticsStorage gets to 100 items, or after 10 seconds, save it to database
setInterval(() => {
  saveAnalyticsToDatabase(analyticsStorage);
  analyticsStorage = [];
}, storageSavingFrequency.timeInMs);

module.exports = {
  analyticsMiddleware,
  analyticsStorage,
};
