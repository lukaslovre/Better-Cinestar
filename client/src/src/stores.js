import { writable } from "svelte/store";
import { dateToYMDFormat } from "./utils/utils";

const danas = dateToYMDFormat(new Date());

// Postavlja default vrednosti za store-ove
export const cinemaOids = writable([]);
export const selectedDate = writable(danas);
export const sortBy = writable("nationwideStart");

export function resetFiltersToDefault() {
  cinemaOids.set([]);
  selectedDate.set(danas);
  sortBy.set("nationwideStart");
}

// export const scrollToMovieId = writable(null);
