export async function getPerformances(cinemaOids, date, movieId) {
  // Generate the url params for the fetch
  const urlParams = new URLSearchParams();
  cinemaOids.forEach((cinemaOid) => {
    urlParams.append("cinemaOids", cinemaOid);
  });
  urlParams.append("date", date);
  urlParams.append("movieId", movieId);

  const res = await fetch(`/api/performances?${urlParams.toString()}`);

  if (!res.ok) {
    console.log("Error fetching performances");
    return;
  }

  const data = await res.json();
  console.log(data);
}

export function getPreviousAndNextPerformanceDatesForMovie(availableDates, date) {
  const dateIndex = availableDates.indexOf(date);

  if (dateIndex === -1) {
    return {
      previousDate: null,
      nextDate: null,
    };
  } else if (dateIndex === 0) {
    return {
      previousDate: null,
      nextDate: availableDates.at(dateIndex + 1),
    };
  } else if (dateIndex === availableDates.length - 1) {
    return {
      previousDate: availableDates.at(dateIndex - 1),
      nextDate: null,
    };
  } else {
    return {
      previousDate: availableDates.at(dateIndex - 1),
      nextDate: availableDates.at(dateIndex + 1),
    };
  }
}