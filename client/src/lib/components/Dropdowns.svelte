<script lang="ts">
  import LocationDropdown from './LocationDropdown.svelte';
  import DateDropdown from './DateDropdown.svelte';
  import SortDropdown from './SortDropdown.svelte';

  // Setting initial dropdown states
  let locationDropdownOpen = $state({
    level: 0,
    selectedCity: null as string | null
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

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target instanceof Element ? event.target : null;
      const container = target?.closest('.input-container');
      if (!container) return;
      const trigger = container.querySelector<HTMLButtonElement>('.dropdown-element');
      locationDropdownOpen.level = 0;
      dateDropdownOpen.value = false;
      sortDropdownOpen.value = false;
      trigger?.focus();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
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
