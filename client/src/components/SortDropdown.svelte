<script>
  import { sortBy } from "../stores";

  let dropdownOpen = false;
  let selectedSortText = "Datum izlaska";

  const dropdownOptionValues = [
    { text: "Datum izlaska", value: "nationwideStart" },
    { text: "IMDB ocjena", value: "imdbRating" },
    { text: "Letterboxd ocjena", value: "letterboxdRating" },
    { text: "Žanr", value: "genre" },
    { text: "Trajanje", value: "durationMins" },
  ];

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
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
    style:display={dropdownOpen ? "flex" : "none"}
  >
    {#each dropdownOptionValues as sortOption}
      <div
        class="option"
        class:selected-option={$sortBy === sortOption.value}
        on:click={() => {
          $sortBy = sortOption.value;
          selectedSortText = sortOption.text;
        }}
      >
        <p>{sortOption.text}</p>
      </div>
    {/each}
  </div>
</div>

<style>
</style>
