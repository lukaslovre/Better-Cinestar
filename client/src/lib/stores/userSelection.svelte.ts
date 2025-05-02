import { writable } from 'svelte/store';
import { dateToYMDFormat } from '../utils/utils';

const danas: string = dateToYMDFormat(new Date());

// Postavlja default vrednosti za store-ove
export const cinemaOids = writable<string[]>([]);
export const selectedDate = writable<string>(danas);
export const sortBy = writable<string>('nationwideStart');

export function resetFiltersToDefault() {
	cinemaOids.set([]);
	selectedDate.set(danas);
	sortBy.set('nationwideStart');
}

// export const scrollToMovieId = writable(null);
