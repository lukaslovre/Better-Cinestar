const { sequelize } = require("../config/sequelize.js");
const { Movie, Performance, PerformanceDates, Analytics } = require("./models/index.js");

// Initialize the database
async function init() {
  try {
    await sequelize.authenticate();
    console.log("Connection with the DB has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error; // Re-throw error to indicate initialization failure
  }

  try {
    // Sync all models
    await sequelize.sync();
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Unable to synchronize the database:", error);
    throw error; // Re-throw error
  }
}

// Database operations
/**
 * Generic database save function
 * @param {Object} model - Sequelize model
 * @param {Array} data - Array of items to save
 * @param {string} type - Type name for error messages
 */
async function saveToDatabase(model, data, type) {
  if (!data || !Array.isArray(data)) {
    throw new Error(`No ${type} provided to save to the database.`);
  }

  try {
    // clear the table before inserting new data
    await model.destroy({ truncate: true });

    await model.bulkCreate(data);

    console.log(`${type} successfully saved to the database.`);
  } catch (error) {
    console.error(`Error saving ${type} to the database:`, error.message);
    throw error;
  }
}

async function saveMoviesToDatabase(movies) {
  return saveToDatabase(Movie, movies, "movies");
}

async function savePerformancesToDatabase(performances) {
  return saveToDatabase(Performance, performances, "performances");
}

async function savePerformanceDatesToDatabase(performancesByCinemaFilmAndDates) {
  return saveToDatabase(
    PerformanceDates,
    performancesByCinemaFilmAndDates,
    "performance dates"
  );
}

/**
 * Saves analytics data without clearing the table first.
 * @param {Array} analyticsData - Array of analytics objects to save
 */
async function saveAnalyticsToDatabase(analyticsData) {
  if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
    console.warn("No analytics data provided to save.");
    return;
  }

  try {
    await Analytics.bulkCreate(analyticsData);
  } catch (error) {
    console.error("Error saving analytics data:", error.message);
    throw error;
  }
}

// SELECTING
async function getPerformanceDatesFor(cinemaOid, filmId) {
  try {
    const queryResult = await PerformanceDates.findOne({
      where: {
        cinemaOid,
        filmId,
      },
    });

    return queryResult ? queryResult.toJSON() : null;
  } catch (error) {
    console.error(
      `Error fetching performance dates for cinemaOid ${cinemaOid}, filmId ${filmId}:`,
      error.message
    );
    throw error;
  }
}
async function getAnalytics() {
  try {
    const queryResult = await Analytics.findAll({
      order: [["createdAt", "DESC"]],
    });
    return queryResult.map((a) => a.toJSON());
  } catch (error) {
    console.error("Error fetching analytics data:", error.message);
    throw error;
  }
}

module.exports = {
  init,
  saveMoviesToDatabase,
  savePerformancesToDatabase,
  savePerformanceDatesToDatabase,
  saveAnalyticsToDatabase,
  getPerformanceDatesFor,
  getAnalytics,
};
