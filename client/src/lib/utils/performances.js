export async function getPerformances(cinemaOids, date, movieId) {
  // Generate the url params for the fetch
  const urlParams = new URLSearchParams();
  cinemaOids.forEach((cinemaOid) => {
    urlParams.append('cinemaOids', cinemaOid);
  });
  urlParams.append('date', date);
  urlParams.append('movieId', movieId);

  console.log('Going to fetch performances with params: ', urlParams.toString());

  // Fetch the performances
  const res = await fetch(`/api/performances?${urlParams.toString()}`);

  if (!res.ok) {
    console.log('Error fetching performances');
    return [];
  }

  const performances = await res.json();

  // Return the performances
  return performances;
}

export function getPreviousAndNextPerformanceDatesForMovie(availableDates, date) {
  const dateIndex = availableDates.indexOf(date);

  let previousDate = null;
  let nextDate = null;

  if (dateIndex === -1) {
    console.log('Date not found in available dates');
    console.log('Available dates: ', availableDates);
    console.log('Date: ', date);

    return { previousDate, nextDate };
  }

  if (dateIndex > 0) {
    previousDate = availableDates[dateIndex - 1];
  }

  if (dateIndex < availableDates.length - 1) {
    nextDate = availableDates[dateIndex + 1];
  }

  return { previousDate, nextDate };
}
