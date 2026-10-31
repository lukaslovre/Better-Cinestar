<script lang="ts">
  import '../app.css';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { afterNavigate, pushState, replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { untrack } from 'svelte';

  import Navigation from '$lib/components/Navigation.svelte';
  import Dropdowns from '$lib/components/Dropdowns.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import Seating from '$lib/components/Seating.svelte';
  import NoResultsGif from '$lib/components/NoResultsGif.svelte';
  import PerformanceInfoPopup from '$lib/components/PerformanceInfoPopup.svelte';

  import { cinemaOids, selectedDate, sortBy } from '$lib/stores/userSelection.svelte';
  import { dateToYMDFormat } from '$lib/utils/utils';

  type MoviesEmptyReason = 'db_empty' | 'no_performances_for_date';
  type OpenedPerformance = { movie: Movie; performance: MoviePerformance };
  type UserSelection = {
    cinemaOids: string[];
    selectedDate: string;
    sortBy: string;
  };
  type MoviesResult =
    | { status: 'no_cinemas' }
    | { status: 'error'; httpStatus?: number }
    | { status: 'success'; movies: Movie[]; emptyReason: MoviesEmptyReason | null };

  let showPerformanceInfoPopup = $state(false);
  let routerReady = $state(false);
  let openedPerformance = $derived(page.state.openedPerformance ?? null);

  // The await block always receives a promise, including before the first fetch.
  // eslint-disable-next-line svelte/prefer-writable-derived -- The effect owns the fetch lifecycle; deriving would change when network side effects run.
  let moviesPromise: Promise<MoviesResult> = $state(
    Promise.resolve({ status: 'no_cinemas' })
  );

  afterNavigate(() => {
    routerReady = true;
  });

  const handlePerformanceOpen = ({ detail }: { detail: OpenedPerformance }) => {
    pushState('', { ...page.state, openedPerformance: detail });
  };

  const handlePerformanceClose = () => {
    history.back(); // SvelteKit restores the previous page.state and closes the popup.
  };

  const handlePerformanceInfoPopup = ({ detail }: { detail: boolean }) =>
    (showPerformanceInfoPopup = detail);

  function sanitizeSelectedDate(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    if (value === 'any') return 'any';

    const today = dateToYMDFormat(new Date());

    const isYmd = /^\d{4}-\d{2}-\d{2}$/.test(value);

    // If the value is malformed, fall back to today to avoid “Invalid Date” UI.
    if (!isYmd) return today;

    // YYYY-MM-DD compares lexicographically.
    return value < today ? today : value;
  }

  function createUrlParams(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ): URLSearchParams {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Local builder; only its completed values are consumed.
    const urlParams = new URLSearchParams();
    cinemaOids.forEach((oid) => urlParams.append('cinemaOids', oid));
    urlParams.append('date', selectedDate);
    urlParams.append('sortBy', sortBy);

    return urlParams;
  }

  function updateLocalStorage(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ) {
    localStorage.setItem('cinemaOids', JSON.stringify(cinemaOids));
    localStorage.setItem('selectedDate', selectedDate);
    localStorage.setItem('sortBy', sortBy);
  }

  function readStoredSelection(): Partial<UserSelection> {
    const values: Partial<UserSelection> = {};

    const storedCinemaOids = localStorage.getItem('cinemaOids');
    const storedDate = localStorage.getItem('selectedDate');
    const storedSortBy = localStorage.getItem('sortBy');

    if (storedCinemaOids) {
      try {
        values.cinemaOids = JSON.parse(storedCinemaOids);
      } catch (e) {
        console.error('Error parsing cinemaOids from localStorage', e);
        values.cinemaOids = [];
      }
    }

    if (storedDate) {
      const sanitizedDate = sanitizeSelectedDate(storedDate);
      if (sanitizedDate) values.selectedDate = sanitizedDate;
    }

    if (storedSortBy) {
      values.sortBy = storedSortBy;
    }

    return values;
  }

  function readUrlSelection(): Partial<UserSelection> {
    const values: Partial<UserSelection> = {};
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('cinemaOids')) {
      values.cinemaOids = urlParams.getAll('cinemaOids');
    }

    if (urlParams.has('date')) {
      const urlDate = urlParams.get('date');
      const sanitizedDate = sanitizeSelectedDate(urlDate);
      if (sanitizedDate) values.selectedDate = sanitizedDate;
    }

    if (urlParams.has('sortBy')) {
      values.sortBy = urlParams.get('sortBy') || '';
    }

    return values;
  }

  function restoreSelection() {
    const localStorageValues = readStoredSelection();
    const urlValues = readUrlSelection();

    // Merge the two objects, giving priority to urlValues
    const values = { ...localStorageValues, ...urlValues };

    // Ensure URL/localStorage can’t override with a past/invalid date.
    // This also lets the existing URL-sync $effect rewrite the URL.
    const sanitizedDate = sanitizeSelectedDate(values.selectedDate);
    if (sanitizedDate) values.selectedDate = sanitizedDate;

    if (values.cinemaOids) cinemaOids.set(values.cinemaOids);
    if (values.selectedDate) selectedDate.set(values.selectedDate);
    if (values.sortBy) sortBy.set(values.sortBy);
  }

  function toggleBodyOverflow(openedPerformance: OpenedPerformance | null) {
    document.body.style.overflow = openedPerformance ? 'hidden' : 'auto';
  }

  async function fetchMovies(
    cinemaOids: string[],
    selectedDate: string,
    sortBy: string
  ): Promise<MoviesResult> {
    if (cinemaOids.length === 0) {
      return { status: 'no_cinemas' };
    }

    const urlParams = createUrlParams(cinemaOids, selectedDate, sortBy);
    const getMoviesUrl = `${PUBLIC_API_URL}/api/movies`;

    try {
      const response = await fetch(`${getMoviesUrl}?${urlParams.toString()}`);

      if (!response.ok) {
        console.error('Error fetching movies:', response.statusText);
        return { status: 'error', httpStatus: response.status };
      }

      const movies: Movie[] = await response.json();

      // Why we use a header: we want a richer empty state without changing the JSON body.
      // This stays non-breaking for any existing consumers expecting an array.
      const reason = response.headers.get(
        'X-Movies-Empty-Reason'
      ) as MoviesEmptyReason | null;
      return {
        status: 'success',
        movies,
        emptyReason: movies.length === 0 ? reason : null
      };
    } catch (e) {
      console.error('Error fetching movies:', e);
      return { status: 'error' };
    }
  }

  restoreSelection();

  // Fetch again whenever the selected cinemas, date, or sorting changes.
  $effect(() => {
    moviesPromise = fetchMovies($cinemaOids, $selectedDate, $sortBy);
  });

  // Disabling/enabling scrolling on body depending on whether a performance is opened
  $effect(() => {
    toggleBodyOverflow(openedPerformance);
  });

  // Updating URL parameters whenever store values change
  $effect(() => {
    if (!routerReady) return;
    const parameters = createUrlParams($cinemaOids, $selectedDate, $sortBy);

    // Preserve popup state without making history updates a dependency of this effect.
    untrack(() => replaceState(resolve(`/?${parameters.toString()}`), page.state));

    updateLocalStorage($cinemaOids, $selectedDate, $sortBy);
  });
</script>

<Navigation />

<main id="content">
  <Dropdowns on:showPerformanceInfoPopup={handlePerformanceInfoPopup} />

  {#await moviesPromise}
    <Loading />
  {:then result}
    {#if result.status === 'no_cinemas'}
      <NoResultsGif />
    {:else if result.status === 'error'}
      <p class="text-red-500">Greška pri dohvaćanju filmova, pokušajte ponovno</p>
    {:else if result.movies.length === 0}
      {#if result.emptyReason === 'db_empty'}
        <p class="text-red-500">Nema podataka u bazi (vjerojatni uzrok greška u kodu)</p>
      {:else}
        <p class="text-red-500">Nema filmova na odabrani datum</p>
      {/if}
    {:else}
      <MovieList movies={result.movies} on:selectedPerformance={handlePerformanceOpen} />
    {/if}
  {/await}
</main>

{#if openedPerformance}
  <Seating performanceData={openedPerformance} onclose={handlePerformanceClose} />
{/if}

{#if showPerformanceInfoPopup}
  <PerformanceInfoPopup on:showPerformanceInfoPopup={handlePerformanceInfoPopup} />
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
