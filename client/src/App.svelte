<script>
  import Navigation from "./components/Navigation.svelte";
  import Dropdowns from "./components/Dropdowns.svelte";
  import Loading from "./components/Loading.svelte";
  import MovieList from "./components/MovieList.svelte";
  import PerformanceSeats from "./components/PerformanceSeats.svelte";
  import NoResultsGif from "./components/NoResultsGif.svelte";
  import PerformanceInfoPopup from "./components/PerformanceInfoPopup.svelte";

  import { cinemaOids, selectedDate, sortBy } from "./stores";

  const origin = window.location.origin; // Za radenje API requesta
  let showTooltipPopup = false;
  let openedPerformance = null;

  // Event catcheri
  function setOpenedPerformance(event) {
    openedPerformance = event.detail;
  }
  function setShowTooltipPopup(event) {
    showTooltipPopup = event.detail;
  }

  // Api call
  let moviesPromise = getMovies($cinemaOids, $selectedDate, $sortBy);

  async function getMovies(cinemaOids, selectedDate, sortBy) {
    if (cinemaOids.length === 0) return { noCinemasSelected: true };

    // create a URL parameter from the arguments
    const urlParams = new URLSearchParams();
    cinemaOids.forEach((oid) => urlParams.append("cinemaOids", oid));
    urlParams.append("date", selectedDate);
    urlParams.append("sortBy", sortBy);

    // const getMoviesUrl = `${origin}/api/movies`;
    const getMoviesUrl = `http://localhost:3000/api/movies`;

    const res = await fetch(`${getMoviesUrl}?${urlParams.toString()}`);

    if (res.ok) {
      const data = await res.json();
      console.log(data);
      return data;
    }
  }
  $: {
    // Zove getMovies() svaki put kad se promjeni neka vrijednost u dropdownu
    moviesPromise = getMovies($cinemaOids, $selectedDate, $sortBy);
  }
</script>

<Navigation />

<div id="content">
  <Dropdowns on:showPerformanceInfoPopup={setShowTooltipPopup} />

  {#await moviesPromise}
    <Loading />
  {:then movies}
    {#if movies.noCinemasSelected}
      <NoResultsGif />
    {:else if movies.length == 0}
      <p style:color="red">Nema filmova na odabrani datum</p>
    {:else}
      <MovieList {movies} on:selectedPerformance={setOpenedPerformance} />
    {/if}
  {/await}
</div>

<!-- Popup prozori -->
{#if openedPerformance}
  <PerformanceSeats
    performanceData={openedPerformance}
    on:selectedPerformance={setOpenedPerformance}
  />
{/if}

{#if showTooltipPopup}
  <PerformanceInfoPopup on:showPerformanceInfoPopup={setShowTooltipPopup} />
{/if}

<style>
  #content {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    row-gap: 3rem;
  }
</style>
