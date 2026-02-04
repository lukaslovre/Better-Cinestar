const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize.js");

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
    indexes: [
      {
        fields: ["createdAt"],
      },
      {
        fields: ["statusCode"],
      },
    ],
  }
);

module.exports = {
  Movie,
  Performance,
  PerformanceDates,
  Analytics,
};
