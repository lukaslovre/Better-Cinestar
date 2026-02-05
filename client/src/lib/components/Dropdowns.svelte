<script lang="ts">
  import LocationDropdown from './LocationDropdown.svelte';
  import DateDropdown from './DateDropdown.svelte';
  import SortDropdown from './SortDropdown.svelte';

  let { onshowPerformanceInfoPopup } = $props();

  // Setting initial dropdown states
  let locationDropdownOpen = $state({
    level: 0,
    selectedCity: null
  });
  let dateDropdownOpen = $state({
    value: false
  });
  let sortDropdownOpen = $state({
    value: false
  });

  // Event listener to close dropdowns when clicking outside of them
  $effect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!e.target || !(e.target instanceof Element)) return;
      if (e.target.closest('.dropdown-options')) return;
      if (e.target.closest('.dropdown-element')) return;

      locationDropdownOpen.level = 0;
      dateDropdownOpen.value = false;
      sortDropdownOpen.value = false;
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
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
