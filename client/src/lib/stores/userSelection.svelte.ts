import { writable } from 'svelte/store';
import { SvelteDate } from 'svelte/reactivity';
import { dateToYMDFormat } from '../utils/utils';
import { cinemas } from '../utils/cinemas';

const defaultCinemaOids = cinemas
  .filter((cinema) => cinema.cinemaCity === 'Zagreb')
  .map((cinema) => cinema.cinemaOid);
const defaultSortBy = 'tmdb_rating';

// URL and saved preferences override these first-visit defaults on page load.
export const cinemaOids = writable<string[]>([...defaultCinemaOids]);
export const selectedDate = writable<string>(dateToYMDFormat(new SvelteDate()));
export const sortBy = writable<string>(defaultSortBy);

export function resetFiltersToDefault() {
  cinemaOids.set([...defaultCinemaOids]);
  selectedDate.set(dateToYMDFormat(new SvelteDate()));
  sortBy.set(defaultSortBy);
}
