import { writable } from "svelte/store";

const danas = dateToYMDFormat(new Date());

export const cinemaOids = writable([]);
export const selectedDate = writable(danas);
export const sortBy = writable("nationwideStart");

function dateToYMDFormat(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
