<script>
  import { sortBy } from "../stores";

  export let sortDropdownOpen;

  const dropdownOptionValues = [
    { text: "po Datumu izlaska", value: "nationwideStart" },
    { text: "po IMDB ocjeni", value: "imdbRating" },
    { text: "po Letterboxd ocjeni", value: "letterboxdRating" },
    { text: "po Žanru", value: "genre" },
    { text: "po Trajanju", value: "durationMins" },
  ];

  let selectedSortText = dropdownOptionValues.find(
    (option) => option.value === $sortBy
  )?.text;

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
    <svg
      class="fill"
      width="10"
      height="9"
      viewBox="0 0 10 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.64952 7.875C5.36084 8.375 4.63916 8.375 4.35048 7.875L0.453368 1.125C0.164693 0.624999 0.525536 -9.15707e-07 1.10289 -8.65233e-07L8.89712 -1.8384e-07C9.47447 -1.33367e-07 9.83531 0.625 9.54663 1.125L5.64952 7.875Z"
        fill="#8F95A3"
      />
    </svg>
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
  .input-container {
    max-width: calc(55% - 0.5rem);
  }
</style>
