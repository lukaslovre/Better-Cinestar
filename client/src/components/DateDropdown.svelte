<script>
  import { selectedDate } from "../stores";
  import { dateToYMDFormat, getFormattedPerformanceDateLabel } from "../utils/utils";

  export let dateDropdownOpen;

  const dropdownOptionValues = [];

  const date = new Date();
  for (let i = 0; i < 7; i++) {
    dropdownOptionValues.push({
      text: getFormattedPerformanceDateLabel(date),
      value: dateToYMDFormat(date),
    });

    date.setDate(date.getDate() + 1);
  }

  dropdownOptionValues.push({ text: "Sve", value: "any" });

  // set the selected date to the value in the store
  $: selectedDateText =
    $selectedDate === "any"
      ? "Sve"
      : getFormattedPerformanceDateLabel(new Date($selectedDate));

  function toggleDropdown() {
    dateDropdownOpen.value = !dateDropdownOpen.value;
  }
</script>

<div class="input-container">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/dateIcon.svg" alt="sort icon" />
    <p class="label-text">Datum</p>
  </div>

  <!-- Dropdown element -->
  <button
    type="button"
    id="dateDropdown"
    class="dropdown-element secondary-color-scheme"
    on:click={toggleDropdown}
  >
    <p class="selectedValue">{selectedDateText}</p>
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
  </button>

  <!-- Dropdown options -->
  <div
    class="dropdown-options secondary-color-scheme"
    style:display={dateDropdownOpen.value ? "flex" : "none"}
  >
    {#each dropdownOptionValues as dateOption}
      <button
        type="button"
        class="option"
        class:selected={$selectedDate === dateOption.value}
        on:click={() => {
          $selectedDate = dateOption.value;
          dateDropdownOpen.value = false;
        }}
      >
        <p>{dateOption.text}</p>
      </button>
    {/each}
  </div>
</div>

<style>
  .input-container {
    max-width: calc(45% - 0.5rem);
  }
</style>
