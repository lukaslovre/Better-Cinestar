<script lang="ts">
  import '../app.css';
  import { goto, pushState } from '$app/navigation';
  import { navigating, page } from '$app/state';
  import { resolve } from '$app/paths';
  import { onMount, untrack } from 'svelte';

  import Navigation from '$lib/components/Navigation.svelte';
  import Dropdowns from '$lib/components/Dropdowns.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import Seating from '$lib/components/Seating.svelte';
  import NoResultsGif from '$lib/components/NoResultsGif.svelte';
  import PerformanceInfoPopup from '$lib/components/PerformanceInfoPopup.svelte';

  import { createUserSelection } from '$lib/stores/userSelection.svelte';
  import {
    hasSelectionParams,
    legacyParamsToQuery,
    selectionsEqual,
    serializeSelection,
    type Selection
  } from '$lib/selection';
  import type { PageProps } from './$types';

  type OpenedPerformance = { movie: Movie; performance: MoviePerformance };

  let { data }: PageProps = $props();

  const { cinemaOids, selectedDate, sortBy } = createUserSelection(
    untrack(() => data.selection)
  );

  let showPerformanceInfoPopup = $state(false);
  let openedPerformance = $derived(page.state.openedPerformance ?? null);
  let result = $derived(data.moviesResult);

  const handlePerformanceOpen = ({ detail }: { detail: OpenedPerformance }) => {
    pushState('', { ...page.state, openedPerformance: detail });
  };

  const handlePerformanceClose = () => {
    history.back(); // SvelteKit restores the previous page.state and closes the popup.
  };

  const handlePerformanceInfoPopup = ({ detail }: { detail: boolean }) =>
    (showPerformanceInfoPopup = detail);

  function toggleBodyOverflow(openedPerformance: OpenedPerformance | null) {
    document.body.style.overflow = openedPerformance ? 'hidden' : 'auto';
  }

  function showSelection(query: string) {
    goto(resolve(`/?${query}`), { replaceState: true, noScroll: true, keepFocus: true });
  }

  // Before SSR the selection was saved in localStorage. Carry it over once for
  // returning visitors who have no cookie yet, then drop the old keys.
  function migrateLocalStorageSelection() {
    try {
      const storedCinemaOids = localStorage.getItem('cinemaOids');
      const storedDate = localStorage.getItem('selectedDate');
      const storedSortBy = localStorage.getItem('sortBy');
      ['cinemaOids', 'selectedDate', 'sortBy'].forEach((key) =>
        localStorage.removeItem(key)
      );

      if (data.fromSavedPreferences || hasSelectionParams(page.url.searchParams)) return;
      if (!storedCinemaOids) return;

      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Local builder; only its completed values are consumed.
      const legacy = new URLSearchParams();
      (JSON.parse(storedCinemaOids) as string[]).forEach((oid) =>
        legacy.append('cinemaOids', oid)
      );
      if (storedDate) legacy.set('date', storedDate);
      if (storedSortBy) legacy.set('sortBy', storedSortBy);

      showSelection(legacyParamsToQuery(legacy));
    } catch (e) {
      console.error('Could not migrate the saved selection from localStorage', e);
    }
  }

  onMount(migrateLocalStorageSelection);

  // After each navigation the server's resolved selection is the source of truth.
  $effect(() => {
    const { cinemaOids: oids, date, sortBy: sort } = data.selection;
    untrack(() => {
      cinemaOids.set(oids);
      selectedDate.set(date);
      sortBy.set(sort);
    });
  });

  // A changed filter becomes a new URL; the server load then renders the new movies.
  $effect(() => {
    const current: Selection = {
      cinemaOids: $cinemaOids,
      date: $selectedDate,
      sortBy: $sortBy
    };
    if (untrack(() => selectionsEqual(current, data.selection))) return;
    showSelection(serializeSelection(current));
  });

  // Disabling/enabling scrolling on body depending on whether a performance is opened
  $effect(() => {
    toggleBodyOverflow(openedPerformance);
  });
</script>

<Navigation />

<main id="content">
  <Dropdowns on:showPerformanceInfoPopup={handlePerformanceInfoPopup} />

  {#if navigating.to}
    <Loading />
  {:else if result.status === 'no_cinemas'}
    <NoResultsGif />
  {:else if result.status === 'error'}
    <p class="text-red-500" role="status">
      Greška pri dohvaćanju filmova, pokušajte ponovno
    </p>
  {:else if result.movies.length === 0}
    {#if result.emptyReason === 'db_empty'}
      <p class="text-red-500" role="status">
        Nema podataka u bazi (vjerojatni uzrok greška u kodu)
      </p>
    {:else}
      <p class="text-red-500" role="status">Nema filmova na odabrani datum</p>
    {/if}
  {:else}
    <MovieList movies={result.movies} on:selectedPerformance={handlePerformanceOpen} />
  {/if}
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
