const API_URL = "https://shop.cinestarcinemas.hr/api";
const DEFAULT_HEADERS = {
  "Accept-Encoding": "gzip, deflate, br",
};

async function cinestarApi(endpoint, cinemaOid) {
  const url = `${API_URL}${endpoint}`;
  const headers = { ...DEFAULT_HEADERS, "CENTER-OID": cinemaOid };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(response.statusText, response.status);
  }

  const data = await response.json();
  return data;
}

async function fetchSeating(cinemaOid, performanceId) {
  try {
    const data = await cinestarApi(
      `/performances/${performanceId}/seatingplan`,
      cinemaOid
    );

    const formattedSeating = formatSeating(data);

    return formattedSeating;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function formatSeating(data) {
  const seatGroups = data.seatGroups.map((group) => group.seats);
  return {
    height: data.height,
    width: data.width,
    maxX: findLargestX(seatGroups),
    maxY: findLargestY(seatGroups),
    seats: seatGroups.flat().map(formatSeat),
  };
}

function formatSeat(seat) {
  return {
    x: seat.x,
    y: seat.y,
    sg: seat.sg,
    stat: seat.stat,
  };
}
function findLargestX(seatGroups) {
  return seatGroups.reduce((max, group) => Math.max(max, group[group.length - 1].x), 0);
}

function findLargestY(seatGroups) {
  return seatGroups.reduce((max, group) => Math.max(max, group[0].y), 0);
}

module.exports = {
  fetchSeating,
  cinestarApi,
};
