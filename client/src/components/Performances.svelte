<script>
  import PerformanceFilterCard from "./performanceFilterCard.svelte";

  import { createEventDispatcher } from "svelte";
  import {
    getFormattedPerformanceDateLabel,
    filterPerformances,
    countSelectedFilters,
  } from "../utils/utils.js";
  import { cinemas as cinemasData } from "../utils/cinemas";
  import {
    getPerformances,
    getPreviousAndNextPerformanceDatesForMovie,
  } from "../utils/performances";

  import { cinemaOids, selectedDate, sortBy } from "../stores";

  const dispatch = createEventDispatcher();

  export let movie;
  export let isFullscreened;

  let currentPerformanceDate = movie.performances[0].cinemaDate;

  $: performanceDateText = getFormattedPerformanceDateLabel(
    new Date(currentPerformanceDate)
  );

  let filteredPerformances = movie.performances;
  let filterCardVisible = false;
  let activeFiltersCount = 0;
  let selectedFilters = {};

  // dispactheri
  function openPerformance(movie, performance) {
    dispatch("selectedPerformance", { movie, performance });
  }

  // funkcije
  function groupPerformancesByCinema(performances) {
    const groupedPerformances = new Map();

    for (const e of performances) {
      const cinema = cinemasData.find((cinema) => cinema.cinemaOid === e.cinemaOid);
      const cinemaName = cinema.cinemaName + " (" + cinema.cinemaCity + ")";
      if (!groupedPerformances.has(cinemaName)) {
        groupedPerformances.set(cinemaName, []);
      }
      groupedPerformances.get(cinemaName).push(e);
    }

    return groupedPerformances;
  }

  function displayFilterCard() {
    filterCardVisible = !filterCardVisible;
  }

  function handlePerformanceFilterChange(event) {
    selectedFilters = event.detail;

    activeFiltersCount = countSelectedFilters(selectedFilters);

    filteredPerformances = filterPerformances(movie.performances, selectedFilters);
  }

  $: {
    filteredPerformances = filterPerformances(movie.performances, selectedFilters);
  }

  let loadingPerformances = false;

  async function getPrevDatePerformances() {
    const prevDate = getPreviousAndNextPerformanceDatesForMovie(
      movie.availableDates,
      currentPerformanceDate
    ).previousDate;

    if (prevDate === null) {
      console.log("No previous date available");
      return;
    }

    loadingPerformances = true;

    const performances = await getPerformances($cinemaOids, prevDate, movie.id);

    console.log(performances);

    loadingPerformances = false;

    if (performances === undefined) return;

    currentPerformanceDate = prevDate;
    movie.performances = performances;
  }

  async function getNextDatePerformances() {
    const nextDate = getPreviousAndNextPerformanceDatesForMovie(
      movie.availableDates,
      currentPerformanceDate
    ).nextDate;

    if (nextDate === null) {
      console.log("No next date available");
      return;
    }

    loadingPerformances = true;

    const performances = await getPerformances($cinemaOids, nextDate, movie.id);

    console.log(performances);

    loadingPerformances = false;

    if (performances === undefined) return;

    currentPerformanceDate = nextDate;
    movie.performances = performances;
  }
</script>

<div class="performancesContainer">
  <!-- Performances minimizirano -->
  <div class="performanceContainer" style:display={isFullscreened ? "none" : "flex"}>
    <div class="performanceslabel">
      {performanceDateText}
    </div>
    <div class="performanceList">
      {#each movie.performances as performance}
        <div
          class="performanceCard"
          on:click={() => {
            openPerformance(movie, performance);
          }}
        >
          <p class="performanceTime">{performance.performanceTime}</p>
          <div class="performanceFeature">
            {#each performance.performanceFeatures as feature}
              <p>{feature}</p>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="performanceManipulationContainer"
    style:display={isFullscreened ? "flex" : "none"}
  >
    <button class="performanceFilter button" on:click={displayFilterCard}>
      <img src="/images/filterPerfomanceIcon.svg" alt="filter icon" />
      {#if activeFiltersCount > 0}
        <div class="activeFiltersCount">{activeFiltersCount}</div>
      {/if}
    </button>

    <div class="performanceDatePicker">
      <button
        class="arrowCircle button"
        class:disabled={getPreviousAndNextPerformanceDatesForMovie(
          movie.availableDates,
          currentPerformanceDate
        ).previousDate === null}
        on:click={getPrevDatePerformances}
      >
        <img src="images/leftArrow.svg" alt="left arrow" />
      </button>
      {loadingPerformances ? "Loading..." : performanceDateText}
      <button
        class="arrowCircle button"
        class:disabled={getPreviousAndNextPerformanceDatesForMovie(
          movie.availableDates,
          currentPerformanceDate
        ).nextDate === null}
        on:click={getNextDatePerformances}
      >
        <img src="images/rightArrow.svg" alt="right arrow" />
      </button>
    </div>
  </div>

  <PerformanceFilterCard
    on:performanceFilterChange={handlePerformanceFilterChange}
    performances={movie.performances}
    displayComponent={isFullscreened && filterCardVisible ? "flex" : "none"}
  />

  <!-- Performances fullscreen (odvojena kina) -->
  <div class="performanceContainer" style:display={isFullscreened ? "flex" : "none"}>
    {#each [...groupPerformancesByCinema(filteredPerformances)] as [key, value]}
      <div class="performanceslabel">
        {key}
      </div>
      <div class="performanceList">
        {#each value as performance}
          <div
            class="performanceCard"
            on:click={() => {
              openPerformance(movie, performance);
            }}
          >
            <p class="performanceTime">{performance.performanceTime}</p>
            <div class="performanceFeature">
              {#each performance.performanceFeatures as feature}
                <p>{feature}</p>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .performancesContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.625rem;
    /* max-width: calc(100% - 3.5rem); */
  }

  .performanceManipulationContainer {
    /* Linija koja odvaja info i performance je ovdje gornji border */
    margin-top: 2rem; /* + 1rem row-gap */
    border-top: 2px solid #808080;
    padding-top: 3rem;

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
    padding: 0.125rem;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 1.5rem;
    background: #101623;
    text-transform: capitalize;
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

  .performanceContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }
  .performanceContainer .performanceslabel {
    color: #e6e6e6;
    font-weight: 500;
    font-size: 0.875rem;
    text-transform: capitalize;
  }
  .performanceContainer .performanceList {
    display: flex;
    column-gap: 0.5rem;
    overflow-x: scroll;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
  }
  .performanceCard {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-radius: 0.25rem;
    border: 1px solid #596fa6;
    background: #06080e;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;
  }
  .performanceCard .performanceTime {
    color: #e6e6e6;
    font-size: 0.75rem;
  }
  .performanceCard .performanceFeature {
    text-align: center;
    color: #bfbfbf;
    font-size: 0.625rem;
    font-weight: 400;
    line-height: 140%;
  }
</style>
