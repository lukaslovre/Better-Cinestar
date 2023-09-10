<script>
  import Navigation from "./components/Navigation.svelte";
  import LocationDropdown from "./components/LocationDropdown.svelte";
  import DateDropdown from "./components/DateDropdown.svelte";
  import SortDropdown from "./components/SortDropdown.svelte";
  import MovieCard from "./components/MovieCard.svelte";
  import PerformanceSeats from "./components/PerformanceSeats.svelte";
  import NoResultsGif from "./components/NoResultsGif.svelte";

  import { cinemaOids, selectedDate, sortBy } from "./stores";

  const hostname = window.location.hostname; // Za radenje API requesta
  let fullscreenedMovieNumber = 0;
  let performanceData = null;

  // Event catcheri
  function setFullscreen(event) {
    const filmNumber = event.detail;
    if (filmNumber === fullscreenedMovieNumber) {
      fullscreenedMovieNumber = 0;
    } else {
      fullscreenedMovieNumber = filmNumber;
    }
  }
  function setPerformanceData(event) {
    performanceData = event.detail;
  }

  // Api call
  let moviesPromise = getMovies();
  async function getMovies() {
    const res = await fetch(
      `http://${hostname}:3000/api/movies?cinemaOids=${$cinemaOids.join(
        ","
      )}&selectedDate=${$selectedDate}&sortBy=${$sortBy}`
    );
    const data = await res.json();

    if (res.ok) {
      return data;
    } else {
      throw new Error(data);
    }
  }
  $: {
    // Zove getMovies() svaki put kad se promjeni neka vrijednost u dropdownu
    console.log($cinemaOids, $selectedDate, $sortBy);
    moviesPromise = getMovies();
  }
</script>

<Navigation />

<LocationDropdown />

<div id="dateAndSortContainer">
  <DateDropdown />
  <SortDropdown />
</div>

{#await moviesPromise}
  <p>Dohvaćanje filmova...</p>
{:then movies}
  {#if movies.length == 0}
    <NoResultsGif />
  {:else}
    <div id="movieCardsContainer">
      {#each movies as movie}
        <MovieCard
          {movie}
          {fullscreenedMovieNumber}
          on:setFullscreen={setFullscreen}
          on:setPerformanceData={setPerformanceData}
        />
      {/each}
    </div>
  {/if}
{/await}

{#if performanceData}
  <PerformanceSeats {performanceData} on:setPerformanceData={setPerformanceData} />
{/if}

<style>
  #dateAndSortContainer {
    margin: 2.5rem 0;
    display: flex;
    justify-content: space-between;
  }

  #movieCardsContainer {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
  }
</style>
