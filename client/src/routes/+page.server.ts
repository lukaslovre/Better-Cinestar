import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_API_URL } from '$env/static/public';
import {
  SELECTION_COOKIE,
  hasLegacyParams,
  hasSelectionParams,
  legacyParamsToQuery,
  resolveSelection,
  serializeSelection,
  type Selection
} from '$lib/selection';
import type { PageServerLoad } from './$types';

type MoviesEmptyReason = 'db_empty' | 'no_performances_for_date';

export type MoviesResult =
  | { status: 'no_cinemas' }
  | { status: 'error'; httpStatus?: number }
  | { status: 'success'; movies: Movie[]; emptyReason: MoviesEmptyReason | null };

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// In Docker the page server reaches the API over the internal network.
const apiBaseUrl = () => env.API_INTERNAL_URL || PUBLIC_API_URL;

async function fetchMovies(
  fetch: typeof globalThis.fetch,
  selection: Selection
): Promise<MoviesResult> {
  if (selection.cinemaOids.length === 0) {
    return { status: 'no_cinemas' };
  }

  const params = new URLSearchParams();
  selection.cinemaOids.forEach((oid) => params.append('cinemaOids', oid));
  params.append('date', selection.date);
  params.append('sortBy', selection.sortBy);

  try {
    const response = await fetch(`${apiBaseUrl()}/api/movies?${params}`);

    if (!response.ok) {
      console.error('Error fetching movies:', response.status, response.statusText);
      return { status: 'error', httpStatus: response.status };
    }

    const movies: Movie[] = await response.json();

    // Why we use a header: we want a richer empty state without changing the JSON body.
    const reason = response.headers.get(
      'X-Movies-Empty-Reason'
    ) as MoviesEmptyReason | null;
    return {
      status: 'success',
      movies,
      emptyReason: movies.length === 0 ? reason : null
    };
  } catch (e) {
    console.error('Error fetching movies:', e);
    return { status: 'error' };
  }
}

export const load: PageServerLoad = async ({ url, cookies, fetch, setHeaders }) => {
  if (hasLegacyParams(url.searchParams)) {
    redirect(301, `/?${legacyParamsToQuery(url.searchParams)}`);
  }

  const { selection, fromSavedPreferences } = resolveSelection(
    url,
    cookies.get(SELECTION_COOKIE)
  );

  // An explicit choice in the URL becomes the saved preference for the next visit.
  if (hasSelectionParams(url.searchParams)) {
    cookies.set(SELECTION_COOKIE, serializeSelection(selection), {
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  // The HTML depends on the cookie and on the current time, so it must not be shared.
  setHeaders({ 'cache-control': 'private, no-cache' });

  return {
    selection,
    fromSavedPreferences,
    moviesResult: await fetchMovies(fetch, selection)
  };
};
