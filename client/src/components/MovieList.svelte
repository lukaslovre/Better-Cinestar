<script>
  import MovieCard from "./MovieCard.svelte";

  export let movies;
  let fullscreenedMovieNumber = 0;

  function setFullscreen(event) {
    const filmNumber = event.detail;
    if (filmNumber === fullscreenedMovieNumber) {
      fullscreenedMovieNumber = 0;
    } else {
      fullscreenedMovieNumber = filmNumber;
    }
  }
</script>

<div id="movieCardsContainer">
  {#each movies as movie}
    <MovieCard
      {movie}
      {fullscreenedMovieNumber}
      on:setFullscreen={setFullscreen}
      on:setPerformanceData
    />
  {/each}
</div>

<style>
  #movieCardsContainer {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
  }
</style>
