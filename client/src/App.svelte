<script>
  import Navigation from "./components/Navigation.svelte";
  import Dropdowns from "./components/Dropdowns.svelte";
  import Loading from "./components/Loading.svelte";
  import MovieList from "./components/MovieList.svelte";
  import PerformanceSeats from "./components/PerformanceSeats.svelte";
  import NoResultsGif from "./components/NoResultsGif.svelte";
  import PerformanceInfoPopup from "./components/PerformanceInfoPopup.svelte";

  import { cinemaOids, selectedDate, sortBy } from "./stores";
  import PerformanceFilterCard from "./components/performanceFilterCard.svelte";

  const origin = window.location.origin; // Za radenje API requesta
  let showPerformanceInfoPopup = false;
  let performanceData = null;

  // Event catcheri

  function setPerformanceData(event) {
    performanceData = event.detail;
  }
  function setShowPerformanceInfoPopup(event) {
    showPerformanceInfoPopup = event.detail;
  }

  // Api call
  let moviesPromise = getMovies();
  async function getMovies() {
    const res = await fetch(
      `${origin}/api/movies?cinemaOids=${$cinemaOids.join(
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

<div id="content">
  <Dropdowns on:showPerformanceInfoPopup={setShowPerformanceInfoPopup} />

  {#await moviesPromise}
    <Loading />
  {:then movies}
    {#if movies.length == 0}
      <NoResultsGif />
    {:else}
      <MovieList {movies} on:setPerformanceData={setPerformanceData} />
    {/if}
  {/await}
</div>

<!-- Popup prozori -->
{#if performanceData}
  <PerformanceSeats {performanceData} on:setPerformanceData={setPerformanceData} />
{/if}

{#if showPerformanceInfoPopup}
  <PerformanceInfoPopup on:showPerformanceInfoPopup={setShowPerformanceInfoPopup} />
{/if}

<style>
  #content {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    row-gap: 3rem;
  }
</style>
