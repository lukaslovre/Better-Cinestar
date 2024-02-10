const { Performance, Op } = require("../db");

async function getPerformancesFiltered(cinemaOids, date, today, currentTime) {
  const performances = [];

  if (date === "any") {
    const performanceResult = await Performance.findAll({
      where: {
        cinemaOid: {
          [Op.in]: cinemaOids,
        },
        cinemaDate: {
          [Op.gte]: today,
        },
      },
      order: [
        ["cinemaDate", "ASC"],
        ["performanceTime", "ASC"],
      ],
    });

    performanceResult.forEach((performance) => {
      performances.push(performance.toJSON());
    });
  } else {
    let whereClause = {
      cinemaOid: {
        [Op.in]: cinemaOids,
      },
      cinemaDate: {
        [Op.eq]: date,
      },
    };

    if (date === today) {
      whereClause.performanceTime = {
        [Op.gte]: currentTime,
      };
    }

    const performancesResult = await Performance.findAll({
      where: whereClause,
      order: [["performanceTime", "ASC"]],
    });

    performancesResult.forEach((performance) => {
      performances.push(performance.toJSON());
    });
  }

  return performances;
}

function groupPerformancesByFilmid(performances) {
  const performancesGroupedByFilmid = [];

  for (const performance of performances) {
    const performanceGroup = performancesGroupedByFilmid.find(
      (p) => p.filmId === performance.filmId
    );

    if (!performanceGroup) {
      performancesGroupedByFilmid.push({
        filmId: performance.filmId,
        performances: [performance],
      });
    } else {
      performanceGroup.performances.push(performance);
    }
  }

  return performancesGroupedByFilmid;
}

function filterPerformancesByEarliestDate(performancesGroupedByFilmid, today) {
  for (const group of performancesGroupedByFilmid) {
    let firstAppearingDate = "9999-99-99";
    let filteredPerformances = [];

    for (const perf of group.performances) {
      // ako je datum prije danas, odbaciti
      if (perf.cinemaDate < today) continue;

      //ako je novi najraniji, resetirati listu
      if (perf.cinemaDate < firstAppearingDate) {
        firstAppearingDate = perf.cinemaDate;
        filteredPerformances = [perf];
      } else if (perf.cinemaDate === firstAppearingDate) {
        filteredPerformances.push(perf);
      }
    }

    group.performances = filteredPerformances;
  }
}

module.exports = {
  getPerformancesFiltered,
  groupPerformancesByFilmid,
  filterPerformancesByEarliestDate,
};
