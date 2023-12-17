<script>
  import { sortBy } from "../stores";

  export let sortDropdownOpen;

  let selectedSortText = "po Datumu izlaska";

  const dropdownOptionValues = [
    { text: "po Datumu izlaska", value: "nationwideStart" },
    { text: "po IMDB ocjeni", value: "imdbRating" },
    { text: "po Letterboxd ocjeni", value: "letterboxdRating" },
    { text: "po Žanru", value: "genre" },
    { text: "po Trajanju", value: "durationMins" },
  ];

  function toggleDropdown() {
    sortDropdownOpen.value = !sortDropdownOpen.value;
  }
</script>

<div id="sortContainer" class="input-container" style:align-items="flex-end">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/sortIcon.svg" alt="sort icon" />
    <p class="label-text">Sortiranje</p>
  </div>

  <!-- Dropdown element -->
  <div class="dropdown-element secondary-color-scheme" on:click={toggleDropdown}>
    <p class="selectedValue">{selectedSortText}</p>
    <img src="/images/dropdownArrow.svg" alt="dropdown arrow" />
  </div>

  <!-- Dropdown options -->
  <div
    class="dropdown-options secondary-color-scheme"
    style:display={sortDropdownOpen.value ? "flex" : "none"}
  >
    {#each dropdownOptionValues as sortOption}
      <div
        class="option"
        class:selected={$sortBy === sortOption.value}
        on:click={() => {
          $sortBy = sortOption.value;
          selectedSortText = sortOption.text;
          sortDropdownOpen.value = false;
        }}
      >
        <p>{sortOption.text}</p>
      </div>
    {/each}
  </div>
</div>

<style>
</style>
