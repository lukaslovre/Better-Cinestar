const { sequelize } = require("../config/sequelize.js");
const { Movie, Performance, PerformanceDates } = require("./models/index.js");

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
    // Targeted, idempotent removal of retired request tracking and its stored data.
    // Keep the schema version unchanged so this deployment preserves cinema data.
    await sequelize.query('DROP TABLE IF EXISTS "Analytics";');

    // Read configuration and optional schema/version flags
    const { configuration } = require("../config/environment.js");
    const expectedSchemaVersion = Number(configuration.DB_SCHEMA_VERSION ?? process.env.DB_SCHEMA_VERSION ?? 1);
    const forceReset = configuration.FORCE_DB_RESET || (String(process.env.FORCE_DB_RESET || "").toLowerCase() === "true");

    // Read current DB schema version from SQLite PRAGMA user_version
    const [rows] = await sequelize.query("PRAGMA user_version;");
    let currentVersion = 0;
    if (Array.isArray(rows) && rows.length > 0) {
      const first = rows[0];
      currentVersion = first.user_version ?? Object.values(first)[0] ?? 0;
    } else if (rows && typeof rows === "object") {
      currentVersion = rows.user_version ?? Object.values(rows)[0] ?? 0;
    }

    if (forceReset || Number(currentVersion) !== Number(expectedSchemaVersion)) {
      console.warn(
        `DB schema version mismatch (db=${currentVersion}, expected=${expectedSchemaVersion}) or FORCE_DB_RESET=${forceReset} => recreating schema (force=true). THIS WILL DESTROY DATA.`,
      );

      // Drop and recreate tables according to models
      await sequelize.sync({ force: true });

      // Persist the schema version in the SQLite file for future starts
      await sequelize.query(`PRAGMA user_version = ${expectedSchemaVersion};`);

      console.log("Database recreated and schema version set.");
    } else {
      // Try to automatically alter tables to match models where possible
      await sequelize.sync({ alter: true });
      console.log("Database synchronized successfully (alter).");
    }
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

    await model.bulkCreate(data, {
      transaction,
      fields: Object.keys(model.rawAttributes),
    });

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

// SELECTING
async function getPerformanceDatesForMovies(cinemaOids, filmIds) {
  if (!cinemaOids.length || !filmIds.length) return [];

  const rows = await PerformanceDates.findAll({
    attributes: ["filmId", "date"],
    where: { cinemaOid: cinemaOids, filmId: filmIds },
  });

  return rows.map((row) => row.toJSON());
}
module.exports = {
  init,
  saveMoviesToDatabase,
  savePerformancesToDatabase,
  savePerformanceDatesToDatabase,
  getPerformanceDatesForMovies,
};
