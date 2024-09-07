function getPerformanceDatesFrom(performances) {
  const leanPerformances = performances.map((perf) => {
    return {
      date: perf.cinemaDate,
      filmId: perf.filmId,
      cinemaOid: perf.cinemaOid,
    };
  });

  // Group the performances by cinemaOid
  const groupedByCinema = groupArrayBy(leanPerformances, "cinemaOid");

  // Group the performances by filmId
  Object.keys(groupedByCinema).forEach((cinema) => {
    groupedByCinema[cinema] = groupArrayBy(groupedByCinema[cinema], "filmId");
  });

  //  Group the performances by date
  Object.keys(groupedByCinema).forEach((cinema) => {
    Object.keys(groupedByCinema[cinema]).forEach((film) => {
      groupedByCinema[cinema][film] = groupArrayBy(groupedByCinema[cinema][film], "date");
    });
  });

  //  Turn the nested object into an array of objects with the properties cinemaOid, filmId and date
  const performancesByCinemaFilmAndDate = [];

  Object.keys(groupedByCinema).forEach((cinema) => {
    Object.keys(groupedByCinema[cinema]).forEach((film) => {
      performancesByCinemaFilmAndDate.push({
        cinemaOid: cinema,
        filmId: film,
        date: Object.keys(groupedByCinema[cinema][film]),
      });
    });
  });

  return performancesByCinemaFilmAndDate;
}

module.exports = {
  getPerformanceDatesFrom,
};

function groupArrayBy(array, key) {
  return array.reduce((acc, item) => {
    if (acc[item[key]] === undefined) {
      acc[item[key]] = [];
    }

    acc[item[key]].push(item);

    return acc;
  }, {});
}
