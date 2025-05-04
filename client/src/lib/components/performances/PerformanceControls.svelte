<script lang="ts">
  import { getPreviousAndNextPerformanceDatesForMovie } from '$lib/utils/performances';

  interface PerformanceControlsProps {
    activeFiltersCount: number;
    availableDates: string[];
    currentPerformanceDate: string | undefined;
    selectedDate: string;
    loadingPerformances: boolean;
    performanceDateText: string | undefined;
    // Events
    toggleFilter: () => void;
    previousDate: () => void;
    nextDate: () => void;
    resetDate: () => void;
  }
  let {
    activeFiltersCount,
    availableDates,
    currentPerformanceDate,
    selectedDate,
    loadingPerformances,
    performanceDateText,
    toggleFilter,
    previousDate,
    nextDate,
    resetDate
  }: PerformanceControlsProps = $props();
</script>

<div class="performanceManipulationContainer">
  <button class="performanceFilter button" type="button" onclick={toggleFilter}>
    <img src="/images/filterPerfomanceIcon.svg" alt="filter icon" />
    {#if activeFiltersCount > 0}
      <div class="activeFiltersCount">{activeFiltersCount}</div>
    {/if}
  </button>

  <div class="performanceDatePicker">
    <button
      class="arrowCircle button"
      class:disabled={getPreviousAndNextPerformanceDatesForMovie(
        availableDates,
        currentPerformanceDate
      ).previousDate === null}
      onclick={previousDate}
    >
      <img src="images/leftArrow.svg" alt="left arrow" />
    </button>

    <button
      type="button"
      class="dateText"
      onclick={resetDate}
      class:italic={selectedDate === 'any'
        ? currentPerformanceDate !== availableDates[0]
        : currentPerformanceDate !== selectedDate}
    >
      {loadingPerformances ? 'Loading...' : performanceDateText}
    </button>

    <button
      class="arrowCircle button"
      class:disabled={getPreviousAndNextPerformanceDatesForMovie(
        availableDates,
        currentPerformanceDate
      ).nextDate === null}
      onclick={nextDate}
    >
      <img src="images/rightArrow.svg" alt="right arrow" />
    </button>
  </div>
</div>

<style>
  .performanceManipulationContainer {
    /* Linija koja odvaja info i performance je ovdje gornji border */
    /* + 2.5rem row-gap */
    /* margin-top: 1.5rem;  */
    border-top: 2px solid rgba(255, 255, 255, 0.15);
    padding-top: 2.5rem;

    display: flex;
    justify-content: space-between;
    column-gap: 1.5rem;
    margin-bottom: 0.5rem;

    color: #e6e6e6;
    font-size: 1rem;
  }
  .performanceManipulationContainer > .performanceFilter {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    position: relative;
  }
  .performanceManipulationContainer > .performanceFilter .activeFiltersCount {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background-color: #ffcc00;
    color: #05060b;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .performanceManipulationContainer > .performanceDatePicker {
    flex-grow: 1;

    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 0.5rem;

    border-radius: 3rem;
    padding: 0.125rem;
    background-color: #101623;
  }

  .performanceManipulationContainer .performanceDatePicker > .arrowCircle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .performanceManipulationContainer .performanceDatePicker .dateText {
    padding: 0.25rem 0.375rem;
    border-radius: 0.25rem;
    color: #e6e6e6;
    font-size: 1rem;
    font-weight: 500;
    text-transform: capitalize;

    background-color: rgba(255, 255, 255, 0);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .performanceManipulationContainer .performanceDatePicker .dateText:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .performanceManipulationContainer .performanceDatePicker .dateText.italic {
    font-style: italic;
  }
</style>
