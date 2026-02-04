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

  const transaction = await sequelize.transaction();

  try {
    // clear the table before inserting new data
    await model.destroy({ truncate: true, transaction });

    await model.bulkCreate(data, { transaction });

    await transaction.commit();
    console.log(`${type} successfully saved to the database.`);
  } catch (error) {
    await transaction.rollback();
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
    "performance dates",
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

  await Analytics.bulkCreate(analyticsData);
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
      error.message,
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

async function getAggregatedAnalytics(timespan = "hour") {
  try {
    let groupClause;
    if (timespan === "day") {
      groupClause = sequelize.fn("strftime", "%Y-%m-%d", sequelize.col("createdAt"));
    } else if (timespan === "week") {
      groupClause = sequelize.fn("strftime", "%Y-%W", sequelize.col("createdAt"));
    } else if (timespan === "hour") {
      groupClause = sequelize.fn(
        "strftime",
        "%Y-%m-%d %H:00:00",
        sequelize.col("createdAt"),
      );
    } else {
      throw new Error(`Unsupported timespan: ${timespan}`);
    }

    const [visitors, statusCodes, responseTimes, urls] = await Promise.all([
      Analytics.findAll({
        attributes: [
          [groupClause, "dateKey"],
          [
            sequelize.fn(
              "COUNT",
              sequelize.fn("DISTINCT", sequelize.col("uniqueVisitors")),
            ),
            "count",
          ],
        ],
        group: [groupClause],
        order: [[sequelize.col("dateKey"), "ASC"]],
        raw: true,
      }),
      Analytics.findAll({
        attributes: ["statusCode", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["statusCode"],
        raw: true,
      }),
      Analytics.findAll({
        attributes: ["responseTime"],
        raw: true,
      }),
      Analytics.findAll({
        attributes: ["url"],
        raw: true,
      }),
    ]);

    const cinemaOidsCount = {};
    const sortByCount = {};

    urls.forEach((u) => {
      const urlString = u.url;
      if (!urlString) return;
      const splitUrl = urlString.split("?");
      if (splitUrl.length < 2) return;

      const params = new URLSearchParams(splitUrl[1]);

      if (params.has("cinemaOid")) {
        params.getAll("cinemaOid").forEach((oid) => {
          cinemaOidsCount[oid] = (cinemaOidsCount[oid] || 0) + 1;
        });
      }

      if (params.has("sortBy")) {
        params.getAll("sortBy").forEach((sort) => {
          sortByCount[sort] = (sortByCount[sort] || 0) + 1;
        });
      }
    });

    return {
      visitors,
      statusCodes,
      responseTimes: responseTimes.map((r) => r.responseTime),
      filters: {
        cinemaOids: cinemaOidsCount,
        sortBy: sortByCount,
      },
    };
  } catch (error) {
    console.error("Error fetching aggregated analytics data:", error.message);
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
  getAggregatedAnalytics,
};
