const path = require("path");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../", "Database.sqlite"),
  logging: false,
});

init();

const Movie = sequelize.define(
  "Movie",
  {
    actors: DataTypes.JSON,
    ageRating: DataTypes.STRING,
    ageRatingInformation: DataTypes.JSON,
    countries: DataTypes.JSON,
    director: DataTypes.STRING,
    duration: DataTypes.STRING,
    durationMins: DataTypes.INTEGER,
    englishCategories: DataTypes.JSON,
    englishDirectors: DataTypes.JSON,
    englishSynopsis: DataTypes.STRING,
    filmEDI: DataTypes.STRING,
    filmNumber: DataTypes.INTEGER,
    genres: DataTypes.JSON,
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    imageUrl: DataTypes.STRING,
    imdbRating: DataTypes.FLOAT,
    imdbUrl: DataTypes.STRING,
    lengthInMinutes: DataTypes.INTEGER,
    letterboxdRating: DataTypes.STRING,
    letterboxdUrl: DataTypes.STRING,
    name: DataTypes.STRING,
    nationwideStart: DataTypes.STRING,
    originalTitle: DataTypes.STRING,
    posterUrl: DataTypes.STRING,
    productionYear: DataTypes.STRING,
    synopsis: DataTypes.STRING,
    ticketTitle: DataTypes.STRING,
    title: DataTypes.STRING,
    trailerLink: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

const Performance = sequelize.define(
  "Performance",
  {
    access: DataTypes.JSON,
    auditorium: DataTypes.JSON,
    auditoriumId: DataTypes.STRING,
    auditoriumName: DataTypes.STRING,
    auditoriumNumber: DataTypes.INTEGER,
    cinemaDate: DataTypes.STRING,
    cinemaOid: DataTypes.STRING,
    displayTitle: DataTypes.STRING,
    filmId: DataTypes.STRING,
    filmReleaseCode: DataTypes.STRING,
    filmReleaseId: DataTypes.STRING,
    filmTitle: DataTypes.STRING,
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    is3D: DataTypes.BOOLEAN,
    limitations: DataTypes.JSON,
    name: DataTypes.STRING,
    performanceDateTime: DataTypes.STRING,
    performanceFeatures: DataTypes.JSON,
    performanceTime: DataTypes.STRING,
    releaseTypeName: DataTypes.STRING,
    releaseTypeNumber: DataTypes.INTEGER,
    ticketTitle: DataTypes.STRING,
    title: DataTypes.STRING,
    useAssignedSeating: DataTypes.BOOLEAN,
    weekfilmSortOrderPrio: DataTypes.INTEGER,
  },
  {
    timestamps: false,
  }
);

const PerformanceDates = sequelize.define(
  "PerformanceDates",
  {
    cinemaOid: DataTypes.STRING,
    filmId: DataTypes.STRING,
    date: DataTypes.JSON,
  },
  {
    timestamps: false,
  }
);

const Analytics = sequelize.define(
  "Analytics",
  {
    uniqueVisitors: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    url: DataTypes.STRING,
    statusCode: DataTypes.INTEGER,
    responseTime: DataTypes.INTEGER,
  },
  {
    // only allow the createdAt field and not the updatedAt
    timestamps: true,
    updatedAt: false,
  }
);

async function init() {
  try {
    await sequelize.authenticate();
    console.log("Connection with the DB has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // await sequelize.sync({ force: true });

  await sequelize.sync();
}

// INSERTING
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
    console.log(`Error saving ${type} to the database:`, error.message);
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

async function saveAnalyticsToDatabase(analytics) {
  await Analytics.bulkCreate(analytics);
}

// SELECTING
async function getPerformanceDatesFor(cinemaOid, filmId) {
  const queryResult = await PerformanceDates.findAll({
    where: {
      cinemaOid,
      filmId,
    },
  });

  return queryResult.at(0).toJSON();
}
async function getAnalytics() {
  const queryResult = await Analytics.findAll();
  return queryResult.map((a) => a.toJSON());
}

module.exports = {
  Movie,
  Performance,
  Op,
  saveMoviesToDatabase,
  savePerformancesToDatabase,
  savePerformanceDatesToDatabase,
  getPerformanceDatesFor,
  saveAnalyticsToDatabase,
  getAnalytics,
};

// define two models: Movie and Performance
// based on the following typescript interfaces:
// interface Performance {
//     access: { viewOnly: boolean; salesOnly: boolean; reservationsOnly: boolean };
//     auditorium: { name: string; number: number; id: string };
//     auditoriumId: string;
//     auditoriumName: string;
//     auditoriumNumber: number;
//     cinemaDate: string;
//     cinemaOid: string;
//     displayTitle: string;
//     filmId: string;
//     filmReleaseCode: string;
//     filmReleaseId: string;
//     filmTitle: string;
//     id: string;
//     is3D: boolean;
//     limitations: { purchaseUntil: string };
//     name: string;
//     performanceDateTime: string;
//     performanceFeatures: string[];
//     performanceTime: string;
//     releaseTypeName: string;
//     releaseTypeNumber: number;
//     ticketTitle: string;
//     title: string;
//     useAssignedSeating: boolean;
//     weekfilmSortOrderPrio: number;
//   }

//   interface Movie {
//     actors: { name: string; portraitUrl: string; lbUrl: string }[];
//     ageRating: string;
//     ageRatingInformation: { acceptanceMethod: string; name: string };
//     countries: string[];
//     director: string;
//     duration: string;
//     durationMins: number;
//     englishCategories: string[];
//     englishDirectors: { name: string; portraitUrl: string; lbUrl: string }[];
//     englishSynopsis: string;
//     filmEDI: string;
//     filmNumber: number;
//     genres: string[];
//     id: string;
//     imageUrl: string;
//     imdbRating: number;
//     imdbUrl: string;
//     lengthInMinutes: number;
//     letterboxdRating: string;
//     letterboxdUrl: string;
//     name: string;
//     nationwideStart: string;
//     originalTitle: string;
//     posterUrl: string;
//     productionYear: string;
//     synopsis: string;
//     ticketTitle: string;
//     title: string;
//     trailerLink: string;
//     performances?: Performance[];
//   }
