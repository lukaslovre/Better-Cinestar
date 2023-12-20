<script>
  import MovieCard from "./MovieCard.svelte";

  export let movies;

  let fullscreenedMovieNumber = 0;
  let screenPositionOnMovieCardClick = 0;
  let selectedCardSize = {
    normal: 0,
    fullscreen: 0,
  };

  $: {
    console.log(selectedCardSize);
  }

  function setFullscreen(event) {
    const filmNumber = event.detail.filmNumber;
    const selectedMovieCard = event.detail.movieCard;

    if (filmNumber === fullscreenedMovieNumber) {
      // scroll up the difference between normal and fullscreen card size
      selectedCardSize.fullscreen = selectedMovieCard.offsetHeight;
      const difference = selectedCardSize.fullscreen - selectedCardSize.normal;
      window.scrollBy(0, -difference);

      fullscreenedMovieNumber = 0;
    } else {
      if (fullscreenedMovieNumber !== 0) {
        const previousFullscreenedMovieCard = document.getElementById(
          `movieCard-${fullscreenedMovieNumber}`
        );

        const prevY = previousFullscreenedMovieCard.getBoundingClientRect().y;
        const currentY = selectedMovieCard.getBoundingClientRect().y;
        // if the previous card is higher that the current one
        if (prevY < currentY) {
          const prefFullscreenHeight = previousFullscreenedMovieCard.offsetHeight;
          const prefDiff = prefFullscreenHeight - selectedCardSize.normal;

          window.scrollBy(0, -prefDiff);
        }
      }

      selectedCardSize.normal = selectedMovieCard.offsetHeight;

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
