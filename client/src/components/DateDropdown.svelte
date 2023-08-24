<script>
  let dropdownOpen = false;
  let selectedDate = "Danas";

  const date = new Date();
  const dropdownOptionValues = ["Danas", "Sutra"];
  date.setDate(date.getDate() + 1);
  for (let i = 0; i < 5; i++) {
    date.setDate(date.getDate() + 1);
    const dateString = date.toLocaleDateString("en-EN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    dropdownOptionValues.push(dateString);
  }
  dropdownOptionValues.push("Sve");

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // data-date="<%= date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate() %>"
</script>

<div class="input-container">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/sortIcon.svg" alt="sort icon" />
    <p class="label-text">Datum</p>
  </div>

  <!-- Dropdown element -->
  <div
    id="dateDropdown"
    class="dropdown-element secondary-color-scheme"
    on:click={toggleDropdown}
  >
    <p class="selectedValue">{selectedDate}</p>
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
        class:selected-option={selectedDate === dateOption}
        on:click={() => {
          selectedDate = dateOption;
        }}
      >
        <p>{dateOption}</p>
      </div>
    {/each}
  </div>
</div>

<style>
</style>
