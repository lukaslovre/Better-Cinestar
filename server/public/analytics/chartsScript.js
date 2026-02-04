const statusCtx = document.getElementById("statusCodesChart");
const responseTimeCtx = document.getElementById("responseTimeChart");
const uniqueVisitorsCtx = document.getElementById("uniqueVisitorsChart");
const cinemaOidsCtx = document.getElementById("cinemaOidsChart");
const sortByCtx = document.getElementById("sortByChart");

// get timespan value from url params
let timespan = new URLSearchParams(window.location.search).get("timespan") || "hour";

chartMain();

async function chartMain() {
  await waitForData(); // Wait for data fetch to complete

  // Status Codes
  const distinctStatusCodes = {};
  if (analyticsData.statusCodes) {
    analyticsData.statusCodes.forEach((item) => {
      distinctStatusCodes[item.statusCode] = item.count;
    });
  }

  createChart(
    distinctStatusCodes,
    statusCtx,
    "bar",
    "Status Codes",
    (data) => data
  );

  // Response Times
  const responseTimesRanges = {};
  if (analyticsData.responseTimes) {
    analyticsData.responseTimes.forEach((time) => {
      const range =
        (time < 50
        ? Math.floor(time / 4) * 4
        : time < 100
        ? Math.floor(time / 10) * 10
        : time < 1000
        ? Math.floor(time / 100) * 100
        : Math.floor(time / 1000) * 1000) + " ms";
      if (!responseTimesRanges[range]) {
        responseTimesRanges[range] = 0;
      }
      responseTimesRanges[range]++;
    });
  }

  createChart(
    responseTimesRanges,
    responseTimeCtx,
    "line",
    "Response Time (ms)",
    (data) => data
  );

  // Visitors per 'timespan'
  // Data is already aggregated by dateKey
  const dateRanges = {};
  if (analyticsData.visitors) {
    analyticsData.visitors.forEach((item) => {
      dateRanges[item.dateKey] = item.count;
    });
  }

  createChart(
    dateRanges,
    uniqueVisitorsCtx,
    "line",
    `Visitors per ${timespan}`,
    (data) => data
  );

  // Pie chart of params
  const cinemaOidsCount = {};
  const sortByCount = (analyticsData.filters && analyticsData.filters.sortBy) || {};

  if (analyticsData.filters && analyticsData.filters.cinemaOids) {
    Object.entries(analyticsData.filters.cinemaOids).forEach(([oid, count]) => {
      const cinema = getCinemaFromOid(oid);
      const label = cinema ? cinema.cinemaName : oid;

      cinemaOidsCount[label] = (cinemaOidsCount[label] || 0) + count;
    });
  }

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
