let analyticsData = null;
let cinemas = [];

const timespanFromUrl =
  new URLSearchParams(window.location.search).get("timespan") || "hour";

// Get data from the database
fetch(`/api/getAnalyticsData?timespan=${timespanFromUrl}`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data) {
      analyticsData = data;
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

fetch("/api/getCinemasList")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data && Array.isArray(data)) {
      cinemas = data;
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

/*
 *
 * Util functions to use in other files
 *
 */

async function waitForData() {
  // Wait for the data to be fetched
  while (!analyticsData || cinemas.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

function getCinemaFromOid(oid) {
  return cinemas.find((cinema) => cinema.cinemaOid === oid);
}
