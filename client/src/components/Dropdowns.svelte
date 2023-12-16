<script>
  import LocationDropdown from "./LocationDropdown.svelte";
  import DateDropdown from "./DateDropdown.svelte";
  import SortDropdown from "./SortDropdown.svelte";
</script>

<div id="dropdowns">
  <LocationDropdown on:showPerformanceInfoPopup />

  <div id="dateAndSortContainer">
    <DateDropdown />
    <SortDropdown />
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
