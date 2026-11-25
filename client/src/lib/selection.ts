// The user's selection (cinemas, date, sort) as it appears in the URL and in the cookie.
//
// URL format: /?kino=arena-centar,z-centar&datum=2026-11-25&sort=tmdb_rating
// Cinemas are referenced by slug in the URL; the API keeps using cinema OIDs.

import { cinemas } from './utils/cinemas';
import { isYMD, todayYMD } from './utils/time';

export type SortOption = 'nationwideStart' | 'tmdb_rating' | 'genre' | 'tmdb_runtime';

export interface Selection {
  cinemaOids: string[];
  /** "YYYY-MM-DD" or "any" */
  date: string;
  sortBy: SortOption;
}

export const SELECTION_COOKIE = 'selection';

const SORT_OPTIONS: readonly SortOption[] = [
  'nationwideStart',
  'tmdb_rating',
  'genre',
  'tmdb_runtime'
];
const DEFAULT_SORT: SortOption = 'tmdb_rating';
const ANY_DATE_PARAM = 'sve';

const PARAM = { cinemas: 'kino', date: 'datum', sort: 'sort' } as const;
const LEGACY_PARAM = { cinemas: 'cinemaOids', date: 'date', sort: 'sortBy' } as const;

const oidBySlug = new Map(cinemas.map((cinema) => [cinema.slug, cinema.cinemaOid]));
const slugByOid = new Map(cinemas.map((cinema) => [cinema.cinemaOid, cinema.slug]));

export function defaultSelection(): Selection {
  return {
    cinemaOids: cinemas
      .filter((cinema) => cinema.cinemaCity === 'Zagreb')
      .map((cinema) => cinema.cinemaOid),
    date: todayYMD(),
    sortBy: DEFAULT_SORT
  };
}

function isSortOption(value: string): value is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value);
}

/** Past or malformed dates fall back to today, so old links and cookies stay usable. */
function sanitizeDate(value: string): string {
  if (value === 'any') return 'any';
  const today = todayYMD();
  if (!isYMD(value)) return today;
  // YYYY-MM-DD compares lexicographically.
  return value < today ? today : value;
}

function parseDate(value: string): string {
  return sanitizeDate(value === ANY_DATE_PARAM ? 'any' : value);
}

function uniqueKnownOids(oids: string[]): string[] {
  return [...new Set(oids.filter((oid) => slugByOid.has(oid)))];
}

/** Reads the fields present in `params`; unknown slugs and invalid sort values are dropped. */
export function parseSelectionParams(params: URLSearchParams): Partial<Selection> {
  const selection: Partial<Selection> = {};

  const cinemasParam = params.get(PARAM.cinemas);
  if (cinemasParam !== null) {
    const oids = cinemasParam
      .split(',')
      .map((slug) => oidBySlug.get(slug.trim()))
      .filter((oid): oid is string => oid !== undefined);
    selection.cinemaOids = uniqueKnownOids(oids);
  }

  const dateParam = params.get(PARAM.date);
  if (dateParam) selection.date = parseDate(dateParam);

  const sortParam = params.get(PARAM.sort);
  if (sortParam && isSortOption(sortParam)) selection.sortBy = sortParam;

  return selection;
}

export function hasSelectionParams(params: URLSearchParams): boolean {
  return Object.values(PARAM).some((name) => params.has(name));
}

/** Builds the query string by hand so the comma between slugs stays readable (no %2C). */
export function serializeSelection(selection: Selection): string {
  const slugs = selection.cinemaOids
    .map((oid) => slugByOid.get(oid))
    .filter((slug): slug is string => slug !== undefined);

  const date = selection.date === 'any' ? ANY_DATE_PARAM : selection.date;

  // Slugs, dates and sort values only contain [a-z0-9-_], so no escaping is needed.
  return `${PARAM.cinemas}=${slugs.join(',')}&${PARAM.date}=${date}&${PARAM.sort}=${selection.sortBy}`;
}

export function selectionsEqual(a: Selection, b: Selection): boolean {
  return (
    a.date === b.date &&
    a.sortBy === b.sortBy &&
    a.cinemaOids.length === b.cinemaOids.length &&
    a.cinemaOids.every((oid, i) => oid === b.cinemaOids[i])
  );
}

/** Old links used `?cinemaOids=...&cinemaOids=...&date=...&sortBy=...`. */
export function hasLegacyParams(params: URLSearchParams): boolean {
  return Object.values(LEGACY_PARAM).some((name) => params.has(name));
}

/**
 * Converts legacy parameters to the new query string. New-style parameters that are
 * also present win, so a half-migrated URL keeps its newest values.
 */
export function legacyParamsToQuery(params: URLSearchParams): string {
  const legacy: Partial<Selection> = {};

  if (params.has(LEGACY_PARAM.cinemas)) {
    legacy.cinemaOids = uniqueKnownOids(params.getAll(LEGACY_PARAM.cinemas));
  }
  const legacyDate = params.get(LEGACY_PARAM.date);
  if (legacyDate) legacy.date = sanitizeDate(legacyDate);
  const legacySort = params.get(LEGACY_PARAM.sort);
  if (legacySort && isSortOption(legacySort)) legacy.sortBy = legacySort;

  return serializeSelection({
    ...defaultSelection(),
    ...legacy,
    ...parseSelectionParams(params)
  });
}

/**
 * Resolves the selection for a request: URL values win, then the saved cookie,
 * then first-visit defaults (Zagreb cinemas, today, by rating).
 */
export function resolveSelection(
  url: URL,
  cookieValue: string | undefined
): { selection: Selection; fromSavedPreferences: boolean } {
  const saved = cookieValue ? parseSelectionParams(new URLSearchParams(cookieValue)) : {};
  const fromUrl = parseSelectionParams(url.searchParams);

  return {
    selection: { ...defaultSelection(), ...saved, ...fromUrl },
    fromSavedPreferences: cookieValue !== undefined
  };
}
