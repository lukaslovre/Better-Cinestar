const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize.js");

const Movie = sequelize.define(
  "Movie",
  {
    ageRating: DataTypes.STRING,
    ageRatingInformation: DataTypes.JSON,
    countries: DataTypes.JSON,
    director: DataTypes.STRING,
    filmEDI: DataTypes.STRING,
    filmNumber: DataTypes.INTEGER,
    genres: DataTypes.JSON,
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    imageUrl: DataTypes.STRING,
    lengthInMinutes: DataTypes.INTEGER,
    name: DataTypes.STRING,
    nationwideStart: DataTypes.STRING,
    originalTitle: DataTypes.STRING,
    productionYear: DataTypes.STRING,
    synopsis: DataTypes.STRING,
    ticketTitle: DataTypes.STRING,
    title: DataTypes.STRING,

    tmdb_movie_id: DataTypes.INTEGER,
    tmdb_url: DataTypes.STRING,
    tmdb_rating: DataTypes.FLOAT,
    tmdb_vote_count: DataTypes.INTEGER,
    tmdb_synopsis: DataTypes.TEXT,
    tmdb_genres: DataTypes.JSON,
    tmdb_runtime: DataTypes.INTEGER,
    tmdb_poster_path: DataTypes.STRING,
    tmdb_poster_url: DataTypes.STRING,
    tmdb_cast: DataTypes.JSON,
    tmdb_directors: DataTypes.JSON,
    tmdb_trailer_url: DataTypes.STRING,
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
