<script>
  import Navigation from "./components/Navigation.svelte";
  import Dropdowns from "./components/Dropdowns.svelte";
  import Loading from "./components/Loading.svelte";
  import MovieList from "./components/MovieList.svelte";
  import Seating from "./components/Seating.svelte";
  import NoResultsGif from "./components/NoResultsGif.svelte";
  import PerformanceInfoPopup from "./components/PerformanceInfoPopup.svelte";

  import { cinemaOids, selectedDate, sortBy } from "./stores";
  import { dateToYMDFormat } from "./utils/utils";

  // Setting up initial variables
  const origin = window.location.origin; // Za radenje API requesta (mislim da ni ne treba zapravo, ne znam zasto sam stavio ako moze samo /api/movies)
  // const origin = "http://localhost:3000"; // Za radenje API requesta
  let showTooltipPopup = false;
  let openedPerformance = null;
  let moviesPromise = null;

  // Setting store values from URL parameters and local storage on page load
  setStoreValues();

  // Zove fetchMovies() svaki put kad se promjeni neka vrijednost u dropdownu
  $: moviesPromise = fetchMovies($cinemaOids, $selectedDate, $sortBy);

  // Disabling/enabling scrolling on body depending on whether a performance is opened
  $: toggleBodyOverflow(openedPerformance);

  // Event handlers
  const setOpenedPerformance = ({ detail }) => (openedPerformance = detail);
  const setShowTooltipPopup = ({ detail }) => (showTooltipPopup = detail);

  // Fetch movies from the API
  async function fetchMovies(cinemaOids, selectedDate, sortBy) {
    if (cinemaOids.length === 0) return { noCinemasSelected: true };

    const urlParams = createUrlParams(cinemaOids, selectedDate, sortBy);
    const getMoviesUrl = `${origin}/api/movies`;

    const res = await fetch(`${getMoviesUrl}?${urlParams.toString()}`);

    if (res.ok) {
      const data = await res.json();
      // console.log(data);
      return data;
    }
  }

  // Create URL parameters
  function createUrlParams(cinemaOids, selectedDate, sortBy) {
    const urlParams = new URLSearchParams();
    cinemaOids.forEach((oid) => urlParams.append("cinemaOids", oid));
    urlParams.append("date", selectedDate);
    urlParams.append("sortBy", sortBy);

    return urlParams;
  }

  // Toggle body overflow
  function toggleBodyOverflow(openedPerformance) {
    document.body.style.overflow = openedPerformance ? "hidden" : "auto";
  }

  // Function to set store values
  function setStoreValues() {
    const localStorageValues = getValuesFromLocalStorage();
    const urlValues = getValuesFromUrl();

    // Merge the two objects, giving priority to urlValues
    const values = { ...localStorageValues, ...urlValues };
    console.log(values);

    // Set the store values (triggers URL update and local storage update)
    if (values.cinemaOids) cinemaOids.set(values.cinemaOids);
    if (values.selectedDate) selectedDate.set(values.selectedDate);
    if (values.sortBy) sortBy.set(values.sortBy);
  }

  // Function to get values from local storage
  function getValuesFromLocalStorage() {
    let values = {};

    if (localStorage.getItem("cinemaOids")) {
      values.cinemaOids = JSON.parse(localStorage.getItem("cinemaOids"));
    }

    if (localStorage.getItem("selectedDate")) {
      // If date is before today, set it to today
      const today = dateToYMDFormat(new Date());
      if (localStorage.getItem("selectedDate") < today) {
        values.selectedDate = today;
      } else {
        values.selectedDate = localStorage.getItem("selectedDate");
      }
    }

    if (localStorage.getItem("sortBy")) {
      values.sortBy = localStorage.getItem("sortBy");
    }

    return values;
  }

  // Function to get values from URL parameters
  function getValuesFromUrl() {
    let values = {};
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("cinemaOids")) {
      values.cinemaOids = urlParams.getAll("cinemaOids");
    }

    if (urlParams.has("date")) {
      values.selectedDate = urlParams.get("date");
    }

    if (urlParams.has("sortBy")) {
      values.sortBy = urlParams.get("sortBy");
    }

    return values;
  }

  // Updating URL parameters whenever store values change
  $: {
    const parameters = createUrlParams($cinemaOids, $selectedDate, $sortBy);

    history.replaceState(null, "", `?${parameters.toString()}`);

    updateLocalStorage($cinemaOids, $selectedDate, $sortBy);
  }

  // Update local storage
  function updateLocalStorage(cinemaOids, selectedDate, sortBy) {
    localStorage.setItem("cinemaOids", JSON.stringify(cinemaOids));
    localStorage.setItem("selectedDate", selectedDate);
    localStorage.setItem("sortBy", sortBy);
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
  <Seating
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

    max-width: 100rem;
    margin: 0 auto;
  }
</style>
