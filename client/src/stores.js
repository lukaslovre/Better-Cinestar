import { writable } from "svelte/store";

export const cinemaOids = writable(["10000000014OCPXCOG"]);
const danas = dateToYMDFormat(new Date());
export const selectedDate = writable(danas);
export const sortBy = writable("nationwideStart");

function dateToYMDFormat(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}