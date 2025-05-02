const statusCtx = document.getElementById("statusCodesChart");
const responseTimeCtx = document.getElementById("responseTimeChart");
const uniqueVisitorsCtx = document.getElementById("uniqueVisitorsChart");
const cinemaOidsCtx = document.getElementById("cinemaOidsChart");
const sortByCtx = document.getElementById("sortByChart");

// get timespan value from url params
let timespan = new URLSearchParams(window.location.search).get("timespan") || "hour";

chartMain();

async function chartMain() {
  // Status Codes
  const distinctStatusCodes = await groupDataBy("statusCode");

  createChart(
    distinctStatusCodes,
    statusCtx,
    "bar",
    "Status Codes",
    (data) => data.length
  );

  // Response Times
  const responseTimes = await groupDataBy("responseTime");

  const responseTimesRanges = {};

  Object.keys(responseTimes).forEach((key) => {
    const range =
      (key < 50
        ? Math.floor(key / 4) * 4
        : key < 100
        ? Math.floor(key / 10) * 10
        : key < 1000
        ? Math.floor(key / 100) * 100
        : Math.floor(key / 1000) * 1000) + " ms";
    if (!responseTimesRanges[range]) {
      responseTimesRanges[range] = [];
    }
    responseTimesRanges[range].push(...responseTimes[key]);
  });

  createChart(
    responseTimesRanges,
    responseTimeCtx,
    "line",
    "Response Time (ms)",
    (data) => data.length
  );

  // visitors per 'timespan'
  const dateRanges = {};

  tableRows.forEach((row) => {
    const dateInTimezone = new Date(row.createdAt);
    let dateKey;

    switch (timespan) {
      case "hour":
        dateKey = `${dateInTimezone.getFullYear()}-${
          dateInTimezone.getMonth() + 1
        }-${dateInTimezone.getDate()} ${dateInTimezone.getHours()}:00:00`;
        break;
      case "day":
        dateKey = `${dateInTimezone.getFullYear()}-${
          dateInTimezone.getMonth() + 1
        }-${dateInTimezone.getDate()}`;
        break;
      case "week":
        // getDay() returns the day of the week (from 0 to 6) for the specified date
        // subtracting it from the date gives the first day of the week (Sunday)
        const firstDayOfWeek = new Date(
          dateInTimezone.setDate(dateInTimezone.getDate() - dateInTimezone.getDay())
        );
        dateKey = `${firstDayOfWeek.getFullYear()}-${
          firstDayOfWeek.getMonth() + 1
        }-${firstDayOfWeek.getDate()}`;
        break;
      default:
        throw new Error(`Invalid timespan: ${timespan}`);
    }

    if (!dateRanges[dateKey]) {
      dateRanges[dateKey] = [];
    }

    dateRanges[dateKey].push(row);
  });

  createChart(
    dateRanges,
    uniqueVisitorsCtx,
    "line",
    `Visitors per ${timespan}`,
    (data) => new Set(data.map((item) => item.uniqueVisitors)).size
  );

  // pie chart of params
  const urlParams = await groupDataBy("url");

  const cinemaOidsCount = {};
  const sortByCount = {};

  Object.keys(urlParams).forEach((key) => {
    const url = key.split("?")[1];

    // make a urlParams object
    const params = new URLSearchParams(url);

    // make a count of cinemaOids
    if (params.has("cinemaOid")) {
      const cinemaOids = params.getAll("cinemaOid");

      cinemaOids.forEach((cinemaOid) => {
        const cinema = getCinemaFromOid(cinemaOid);

        const label = cinema.cinemaName;

        if (!cinemaOidsCount[label]) {
          cinemaOidsCount[label] = 0;
        }
        cinemaOidsCount[label]++;
      });
    }

    // make a count of sort by params
    if (params.has("sortBy")) {
      const sortBy = params.getAll("sortBy");

      sortBy.forEach((sort) => {
        if (!sortByCount[sort]) {
          sortByCount[sort] = 0;
        }
        sortByCount[sort]++;
      });
    }
  });

  createChart(cinemaOidsCount, cinemaOidsCtx, "pie", "Cinema Oids", (data) => data);

  createChart(sortByCount, sortByCtx, "pie", "Sort By", (data) => data);
}

function createChart(data, ctx, chartType, label, functionToPerformOnData) {
  const chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          label: label,
          data: Object.values(data).map(functionToPerformOnData),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });

  return chart;
}
