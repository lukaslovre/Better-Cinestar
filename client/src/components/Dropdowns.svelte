<script>
  import LocationDropdown from "./LocationDropdown.svelte";
  import DateDropdown from "./DateDropdown.svelte";
  import SortDropdown from "./SortDropdown.svelte";

  import { cinemaOids, selectedDate, sortBy } from "../stores";

  // when any of the store values change, add it to the URL as a query parameter
  $: {
    const parameters = new URLSearchParams();

    $cinemaOids.forEach((oid) => parameters.append("cinemaOids", oid));
    parameters.append("date", $selectedDate);
    parameters.append("sortBy", $sortBy);

    history.replaceState(null, "", `?${parameters.toString()}`);
  }

  let locationDropdownOpen = {
    level: 0,
    selectedCity: null,
  };
  let dateDropdownOpen = {
    value: false,
  };
  let sortDropdownOpen = {
    value: false,
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest(".dropdown-options")) return;
    if (e.target.closest(".dropdown-element")) return;

    locationDropdownOpen.level = 0;
    dateDropdownOpen.value = false;
    sortDropdownOpen.value = false;
  });
</script>

<div id="dropdowns">
  <LocationDropdown {locationDropdownOpen} on:showPerformanceInfoPopup />

  <div id="dateAndSortContainer">
    <DateDropdown {dateDropdownOpen} />
    <SortDropdown {sortDropdownOpen} />
  </div>
</div>

<style>
  #dropdowns {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
  }

  #dateAndSortContainer {
    display: flex;
    justify-content: space-between;
    column-gap: 1rem;
  }
</style>
