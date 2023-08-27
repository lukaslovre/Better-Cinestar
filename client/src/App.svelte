<script>
  import Navigation from "./components/Navigation.svelte";
  import LocationDropdown from "./components/LocationDropdown.svelte";
  import DateDropdown from "./components/DateDropdown.svelte";
  import SortDropdown from "./components/SortDropdown.svelte";
  import MovieCard from "./components/MovieCard.svelte";

  import { cinemaOids, selectedDate, sortBy } from "./stores";
  $: console.log($cinemaOids, $selectedDate, $sortBy);
</script>

<Navigation />

<LocationDropdown />

<div id="dateAndSortContainer">
  <DateDropdown />
  <SortDropdown />
</div>

<div id="movieCardsContainer">
  <MovieCard />
</div>

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
