let tableRows = [];
let cinemas = [];

// the data array contains object with the following structure:
// {
//     createdAt: "2021-09-01T00:00:00.000Z",
//     id: 1,
//     responseTime: 100,
//     statusCode: 200,
//     uniqueVisitors: "192.168.25.199",
//     url: "/api/movies?search=star+wars",
//     userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
// }

// Get data from the database
fetch("/api/getAnalyticsData")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(data);
    tableRows = data;
  })
  .catch((error) => {
    console.error("Error:", error);
  });

fetch("/api/getCinemasList")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(data);
    cinemas = data;
  })
  .catch((error) => {
    console.error("Error:", error);
  });

/*
 *
 * Util functions to use in other files
 *
 */

async function groupDataBy(key) {
  // Wait for the data to be fetched
  while (tableRows.length === 0 || cinemas.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const groupedData = tableRows.reduce((acc, item) => {
    if (!acc[item[key]]) {
      acc[item[key]] = [];
    }
    acc[item[key]].push(item);
    return acc;
  }, {});

  return groupedData;
}

function getCinemaFromOid(oid) {
  return cinemas.find((cinema) => cinema.cinemaOid === oid);
}
