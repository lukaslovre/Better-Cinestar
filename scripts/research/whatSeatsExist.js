const { getPerformancesForDate } = require("../serving/performances");
const { getCinemas } = require("../cinemasList");
const { cinestarApi } = require("../serving/seating");

const fs = require("fs");
const { group } = require("console");

const cinemas = getCinemas();

const cinemaOids = cinemas.map((cinema) => cinema.cinemaOid); //.slice(0, 3);

// init();

async function init() {
  const performances = await getPerformancesForDate(
    cinemaOids,
    "2024-03-08",
    "2024-03-08",
    "00:00"
  );

  //   console.log(performances.slice(0, 3));

  const seats = [];

  for (const performance of performances) {
    const link = `https://shop.cinestarcinemas.hr/landingpage?center=${performance.cinemaOid}&page=seatingplan&performance=${performance.id}`;

    const seating = await fetchSeating(performance.cinemaOid, performance.id);

    if (seating === undefined) continue;

    seats.push({ seatGroups: cleanSeatGroups(seating.seatGroups), link });
  }

  //   console.log(seats);
  //   console.log(seats[0]);

  const uniqueSeatGrouped = [];

  for (const seat of seats) {
    const uniqueSeats = seat.seatGroups
      .filter(
        (seat, index, self) =>
          index === self.findIndex((s) => s.sg === seat.sg && s.stat === seat.stat)
      )
      .map((filtered) => {
        return {
          ...filtered,
          link: seat.link,
        };
      });

    uniqueSeatGrouped.push(uniqueSeats);
  }

  //   console.log(uniqueSeatGrouped);

  const uniqueSeats = uniqueSeatGrouped.flat().filter((seat, index, self) => {
    return index === self.findIndex((s) => s.sg === seat.sg && s.stat === seat.stat);
  });

  //   console.log(uniqueSeats);

  //   save to a JSON file
  fs.writeFileSync("./uniqueSeats.json", JSON.stringify(uniqueSeats));
}

// functions
async function fetchSeating(cinemaOid, performanceId) {
  try {
    const data = await cinestarApi(
      `/performances/${performanceId}/seatingplan`,
      cinemaOid
    );

    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function cleanSeatGroups(seatGroups) {
  //   console.log(seatGroups[0].seats[0]);
  return seatGroups.flatMap((group) =>
    group.seats.map((seat) => {
      return { sg: seat.sg, stat: seat.stat, row: seat.row, column: seat.col };
    })
  );
}

// getSeatsForLink();

async function getSeatsForLink() {
  // https://shop.cinestarcinemas.hr/landingpage?center=97000000014FEPADHG&page=seatingplan&performance=C3A41000023BTRKFXU

  let seating = await fetchSeating("87000000014FEPADHG", "99CC0000023EDZCTNJ");

  seating = cleanSeatGroups(seating.seatGroups);

  // filter out unique seats
  seating = seating.filter((seat, index, self) => {
    return index === self.findIndex((s) => s.sg === seat.sg && s.stat === seat.stat);
  });

  console.log(seating);
}

init2();

async function init2() {
  //   console.log(performances.slice(0, 3));

  let seating = await fetchSeating("87000000014FEPADHG", "96DC0000023EDZCTNJ");

  console.log(seating);

  const seatingAreas = seating.seatingAreas;

  console.log(seatingAreas);

  const seats = seating.seatGroups.flatMap((group) => {
    return group.seats.map((seat) => {
      return {
        sg: seat.sg,
        stat: seat.stat,
        row: seat.row,
        column: seat.col,
        sar: seat.sar,
        name: seatingAreas.find((area) => area.id === seat.sar).name,
      };
    });
  });

  // console.log(seats);
}
