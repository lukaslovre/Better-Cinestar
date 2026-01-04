<script lang="ts">
  import '../app.css'; // Import global styles
  import { PUBLIC_API_URL } from '$env/static/public';

  import Navigation from '$lib/components/Navigation.svelte';
  import Dropdowns from '$lib/components/Dropdowns.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import Seating from '$lib/components/Seating.svelte';
  import NoResultsGif from '$lib/components/NoResultsGif.svelte';
  import PerformanceInfoPopup from '$lib/components/PerformanceInfoPopup.svelte';

  import { cinemaOids, selectedDate, sortBy } from '$lib/stores/userSelection.svelte';
  import { dateToYMDFormat } from '$lib/utils/utils';

  // Define types for your data - adjust these to match your actual data structures
  type MoviesEmptyReason = 'db_empty' | 'no_performances_for_date';

  interface FetchMoviesResult {
    noCinemasSelected?: boolean;
    // Why this exists: previously we returned [] on HTTP errors, which made server faults
    // indistinguishable from a valid "no movies" result.
    fetchError?: boolean;
    fetchErrorStatus?: number;
  }

  // Setting up initial variables
  let showTooltipPopup: boolean = $state(false);
  let openedPerformance: any | null = $state(null);
  // Why not nullable: a null/undefined value would immediately resolve the await block
  // to null, which complicates the template logic.
  let moviesPromise: Promise<FetchMoviesResult | Movie[]> = $state(
    Promise.resolve({ noCinemasSelected: true })
  );

  // Populated from the response header when the server returns an empty list.
  // We keep it outside the movies array to avoid changing the response shape.
  let moviesEmptyReason: MoviesEmptyReason | null = $state(null);

  // Setting store values from URL parameters and local storage on page load
  setStoreValues();

  // Zove fetchMovies() svaki put kad se promjeni neka vrijednost u dropdownu
  $effect(() => {
    moviesPromise = fetchMovies($cinemaOids, $selectedDate, $sortBy);
  });

  // Disabling/enabling scrolling on body depending on whether a performance is opened
  $effect(() => {
    toggleBodyOverflow(openedPerformance);
  });

  // Event handlers
  const setOpenedPerformance = ({ detail }: { detail: any }) =>
    (openedPerformance = detail as any); // Replace 'any' with the actual type
  const setShowTooltipPopup = ({ detail }: { detail: boolean }) =>
    (showTooltipPopup = detail);

  // Fetch movies from the API
  async function fetchMovies(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ): Promise<FetchMoviesResult | Movie[]> {
    if (cinemaOids.length === 0) {
      moviesEmptyReason = null;
      return { noCinemasSelected: true };
    }

    const urlParams = createUrlParams(cinemaOids, selectedDate, sortBy);
    const getMoviesUrl = `${PUBLIC_API_URL}/api/movies`;

    try {
      const res = await fetch(`${getMoviesUrl}?${urlParams.toString()}`);

      if (!res.ok) {
        moviesEmptyReason = null;
        console.error('Error fetching movies:', res.statusText);
        return { fetchError: true, fetchErrorStatus: res.status };
      }

      const data: Movie[] = await res.json();

      // Why we use a header: we want a richer empty state without changing the JSON body.
      // This stays non-breaking for any existing consumers expecting an array.
      const reason = res.headers.get('X-Movies-Empty-Reason') as MoviesEmptyReason | null;
      moviesEmptyReason = data.length === 0 ? reason : null;

      return data;
    } catch (e) {
      moviesEmptyReason = null;
      console.error('Error fetching movies:', e);
      return { fetchError: true };
    }
  }

  // Create URL parameters
  function createUrlParams(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ): URLSearchParams {
    const urlParams = new URLSearchParams();
    cinemaOids.forEach((oid) => urlParams.append('cinemaOids', oid));
    urlParams.append('date', selectedDate);
    urlParams.append('sortBy', sortBy);

    return urlParams;
  }

  // Toggle body overflow
  function toggleBodyOverflow(openedPerformance: any | null) {
    // Replace 'any' with the actual type
    document.body.style.overflow = openedPerformance ? 'hidden' : 'auto';
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
  function getValuesFromLocalStorage(): {
    cinemaOids?: string[];
    selectedDate?: string;
    sortBy?: string;
  } {
    let values: { cinemaOids?: string[]; selectedDate?: string; sortBy?: string } = {};

    if (localStorage.getItem('cinemaOids')) {
      try {
        values.cinemaOids = JSON.parse(localStorage.getItem('cinemaOids') || '[]');
      } catch (e) {
        console.error('Error parsing cinemaOids from localStorage', e);
        values.cinemaOids = [];
      }
    }

    if (localStorage.getItem('selectedDate')) {
      // If date is before today, set it to today
      const today = dateToYMDFormat(new Date());
      const storedDate = localStorage.getItem('selectedDate') || '';
      if (storedDate < today) {
        values.selectedDate = today;
      } else {
        values.selectedDate = storedDate;
      }
    }

    if (localStorage.getItem('sortBy')) {
      values.sortBy = localStorage.getItem('sortBy') || '';
    }

    return values;
  }

  // Function to get values from URL parameters
  function getValuesFromUrl(): {
    cinemaOids?: string[];
    selectedDate?: string;
    sortBy?: string;
  } {
    let values: { cinemaOids?: string[]; selectedDate?: string; sortBy?: string } = {};
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('cinemaOids')) {
      values.cinemaOids = urlParams.getAll('cinemaOids');
    }

    if (urlParams.has('date')) {
      values.selectedDate = urlParams.get('date') || '';
    }

    if (urlParams.has('sortBy')) {
      values.sortBy = urlParams.get('sortBy') || '';
    }

    return values;
  }

  // Updating URL parameters whenever store values change
  $effect(() => {
    const parameters = createUrlParams($cinemaOids, $selectedDate, $sortBy);

    history.replaceState(null, '', `?${parameters.toString()}`);

    updateLocalStorage($cinemaOids, $selectedDate, $sortBy);
  });

  // Update local storage
  function updateLocalStorage(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ) {
    localStorage.setItem('cinemaOids', JSON.stringify(cinemaOids));
    localStorage.setItem('selectedDate', selectedDate);
    localStorage.setItem('sortBy', sortBy);
  }
</script>

<Navigation />

<div id="content">
  <Dropdowns on:showPerformanceInfoPopup={setShowTooltipPopup} />

  {#await moviesPromise}
    <Loading />
  {:then movies}
    {#if !Array.isArray(movies) && movies.noCinemasSelected}
      <NoResultsGif />
    {:else if !Array.isArray(movies) && movies.fetchError}
      <p class="text-red-500">Greška pri dohvaćanju filmova, pokušajte ponovno</p>
    {:else if Array.isArray(movies) && movies.length === 0}
      {#if moviesEmptyReason === 'db_empty'}
        <p class="text-red-500">Nema podataka u bazi (vjerojatni uzrok greška u kodu)</p>
      {:else}
        <p class="text-red-500">Nema filmova na odabrani datum</p>
      {/if}
    {:else if Array.isArray(movies) && movies.length > 0}
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
