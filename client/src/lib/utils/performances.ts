// TODO: Unit test this file and other utils

import { PUBLIC_API_URL } from '$env/static/public';
import type { CinemaLocation } from './cinemas';

export async function getPerformances(
  cinemaOids: CinemaLocation['cinemaOid'][],
  date: string,
  movieId: Movie['id']
): Promise<MoviePerformance[]> {
  const url: URL = new URL('/api/performances', PUBLIC_API_URL);
  const urlParams: URLSearchParams = generatePerformancesQueryParams(
    cinemaOids,
    date,
    movieId
  );

  // assign search params to url
  url.search = urlParams.toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);

  const performances = (await res.json()) as MoviePerformance[];
  return performances;
}

function generatePerformancesQueryParams(
  cinemaOids: CinemaLocation['cinemaOid'][],
  date: string,
  movieId: Movie['id']
): URLSearchParams {
  // Generate the URLSearchParams object
  const urlParams = new URLSearchParams();

  cinemaOids.forEach((cinemaOid) => {
    urlParams.append('cinemaOids', cinemaOid);
  });
  urlParams.append('date', date);
  urlParams.append('movieId', movieId);

  return urlParams;
}

export function getPreviousAndNextPerformanceDatesForMovie(
  availableDates: string[],
  targetDate: string | undefined
): { previousDate: string | null; nextDate: string | null } {
  if (!targetDate) {
    return { previousDate: null, nextDate: null };
  }

  const dateIndex = availableDates.indexOf(targetDate);

  if (dateIndex === -1) {
    console.warn(`"${targetDate}" not found in available dates`, availableDates);
    return { previousDate: null, nextDate: null };
  }

  return {
    previousDate: availableDates[dateIndex - 1] ?? null,
    nextDate: availableDates[dateIndex + 1] ?? null
  };
}
