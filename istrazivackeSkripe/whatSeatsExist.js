const { getPerformancesForDate } = require("../serving/performances");
const { getCinemas } = require("../cinemasList");

const cinemas = getCinemas();

const cinemaOids = cinemas.map((cinema) => cinema.cinemaOid).slice(0, 3);

init();

async function init() {
  const performances = await getPerformancesForDate(
    cinemaOids,
    "2024-03-08",
    "2024-03-08",
    "00:00"
  );

  console.log(performances.slice(0, 3));
}
