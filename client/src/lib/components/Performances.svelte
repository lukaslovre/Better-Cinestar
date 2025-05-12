<script lang="ts">
  import PerformanceFilterPopover from './performances/PerformanceFilterPopover.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    getFormattedPerformanceDateLabel,
    filterPerformances,
    countSelectedPerformanceFilters,
    dateToYMDFormat
  } from '../utils/utils.js';
  import {
    getPerformances,
    getPreviousAndNextPerformanceDatesForMovie
  } from '../utils/performances';
  import { cinemaOids, selectedDate, sortBy } from '$lib/stores/userSelection.svelte';
  import PerformanceListMinimized from './performances/PerformanceListMinimized.svelte';
  import PerformanceListGrouped from './performances/PerformanceListGrouped.svelte';
  import PerformanceControls from './performances/PerformanceControls.svelte';

  interface PerformancesProps {
    movie: Movie;
    isFullscreened: boolean;
  }

  let { movie, isFullscreened }: PerformancesProps = $props();

  let componentLocalPerformances: MoviePerformance[] = $state(movie.performances || []);

  const dispatch = createEventDispatcher();

  // State
  let firstRender: boolean = $state(true);
  let loadingPerformances: boolean = $state(false);
  let filterCardVisible: boolean = $state(false);
  let selectedFilters: PerformanceFilters = $state({} as PerformanceFilters);

  let currentPerformanceDate = $derived(componentLocalPerformances[0]?.cinemaDate);
  let performanceDateText = $derived(
    currentPerformanceDate
      ? getFormattedPerformanceDateLabel(new Date(currentPerformanceDate))
      : 'No date selected'
  ); // TODO: I think this should be a utility function used in the children components and removed from here

  let filteredPerformances = $derived(
    filterPerformances(componentLocalPerformances, selectedFilters)
  );

  $effect(() => {
    if (firstRender) {
      firstRender = false;
    } else {
      if (currentPerformanceDate) getAndSetPerformancesForDate(currentPerformanceDate);
    }
  });

  onMount(() => {
    // Close filter popover on outside click
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // if the click is not inside the filter popover or the button that opens it
      if (filterCardVisible === false) return;
      if (target?.closest('.column') !== null) return;
      if (target?.closest('.performanceFilter') !== null) return;

      filterCardVisible = false;
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  async function getAndSetPerformancesForDate(date: string): Promise<void> {
    const performances = await getPerformancesForDate(date);
    componentLocalPerformances = performances;
  }

  async function getPerformancesForDate(date: string): Promise<MoviePerformance[]> {
    try {
      loadingPerformances = true;
      const performances = await getPerformances($cinemaOids, date, movie.id);
      return performances;
    } catch (error: any) {
      // TODO: UI error display
      console.error('Error fetching performances:', error.message);
      return []; // Return an empty array in case of error
    } finally {
      loadingPerformances = false;
    }
  }

  // dispactheri
  function openPerformance(movie: Movie, performance: MoviePerformance) {
    dispatch('selectedPerformance', { movie, performance });
  }

  // funkcije

  function handlePerformanceFilterChange(event: CustomEvent) {
    selectedFilters = event.detail;
  }

  async function getAndSetPrevDatePerformances() {
    const { previousDate, nextDate } = getPreviousAndNextPerformanceDatesForMovie(
      movie.availableDates || [],
      currentPerformanceDate
    );

    if (previousDate != null) {
      currentPerformanceDate = previousDate;
    }
  }

  async function getAndSetNextDatePerformances() {
    const { previousDate, nextDate } = getPreviousAndNextPerformanceDatesForMovie(
      movie.availableDates || [],
      currentPerformanceDate
    );

    if (nextDate != null) {
      currentPerformanceDate = nextDate;
    }
  }

  function resetPerformanceDatePickerToDefault() {
    if (currentPerformanceDate === $selectedDate) return;

    if ($selectedDate === 'any') {
      getAndSetPerformancesForDate(movie.availableDates?.[0] || '');
    } else {
      getAndSetPerformancesForDate($selectedDate);
    }
  }
</script>

<div class="performancesContainer">
  {#if !isFullscreened}
    <!-- Performances minimizirano (sva kina u jednom redu) -->
    <PerformanceListMinimized
      performances={movie.performances || []}
      {performanceDateText}
      onSelectPerformance={(performance) => openPerformance(movie, performance)}
    />
  {:else if isFullscreened}
    <PerformanceControls
      activeFiltersCount={countSelectedPerformanceFilters(selectedFilters)}
      availableDates={movie.availableDates || []}
      {currentPerformanceDate}
      selectedDate={$selectedDate}
      {loadingPerformances}
      {performanceDateText}
      toggleFilter={() => (filterCardVisible = !filterCardVisible)}
      previousDate={getAndSetPrevDatePerformances}
      nextDate={getAndSetNextDatePerformances}
      resetDate={resetPerformanceDatePickerToDefault}
    />

    <PerformanceFilterPopover
      on:performanceFilterChange={handlePerformanceFilterChange}
      performances={movie.performances}
      {filteredPerformances}
      displayComponent={filterCardVisible ? 'flex' : 'none'}
    />

    <!-- Performances fullscreen (odvojena kina) -->
    <PerformanceListGrouped
      {filteredPerformances}
      onSelectPerformance={(performance) => openPerformance(movie, performance)}
    />
  {/if}
</div>

<style>
  .performancesContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.625rem;
  }
</style>
