<script>
  import { selectedDate } from "../stores";

  let dropdownOpen = false;
  let selectedDateText = "Danas";

  const date = new Date();
  const dropdownOptionValues = [{ text: "Danas", value: dateToYMDFormat(date) }];
  date.setDate(date.getDate() + 1);
  dropdownOptionValues.push({ text: "Sutra", value: dateToYMDFormat(date) });
  for (let i = 0; i < 5; i++) {
    date.setDate(date.getDate() + 1);
    const dateString = date.toLocaleDateString("hr-HR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    dropdownOptionValues.push({ text: dateString, value: dateToYMDFormat(date) });
  }
  dropdownOptionValues.push({ text: "Sve", value: "any" });

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }
  function dateToYMDFormat(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
</script>

<div class="input-container">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/dateIcon.svg" alt="sort icon" />
    <p class="label-text">Datum</p>
  </div>

  <!-- Dropdown element -->
  <div
    id="dateDropdown"
    class="dropdown-element secondary-color-scheme"
    on:click={toggleDropdown}
  >
    <p class="selectedValue">{selectedDateText}</p>
    <img src="/images/dropdownArrow.svg" alt="dropdown arrow" />
  </div>

  <!-- Dropdown options -->
  <div
    class="dropdown-options secondary-color-scheme"
    style:display={dropdownOpen ? "flex" : "none"}
  >
    {#each dropdownOptionValues as dateOption}
      <div
        class="option"
        class:selected-option={$selectedDate === dateOption.value}
        on:click={() => {
          $selectedDate = dateOption.value;
          selectedDateText = dateOption.text;
          dropdownOpen = false;
        }}
      >
        <p>{dateOption.text}</p>
      </div>
    {/each}
  </div>
</div>

<style>
</style>
