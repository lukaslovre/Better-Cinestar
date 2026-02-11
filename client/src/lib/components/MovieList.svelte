<script lang="ts">
  import MovieCardV2 from './card_v2/MovieCardV2.svelte';

  interface MovieListProps {
    movies: Movie[];
  }

  let { movies }: MovieListProps = $props();

  let fullscreenedMovieNumber: number = $state(0);
  let selectedCardSize = $state({
    normal: 0,
    fullscreen: 0
  });

  function setFullscreen(event: CustomEvent) {
    const filmNumber = event.detail.filmNumber;
    const selectedMovieCard = event.detail.movieCard;

    // If the user has clicked on a card that is already in fullscreen mode
    if (filmNumber === fullscreenedMovieNumber) {
      // Scroll up the difference between normal and fullscreen card size
      // to make the bottom of the card appear to stay in the same place
      selectedCardSize.fullscreen = selectedMovieCard.offsetHeight;
      const difference = selectedCardSize.fullscreen - selectedCardSize.normal;
      window.scrollBy(0, -difference);

      fullscreenedMovieNumber = 0;
    } else if (filmNumber !== fullscreenedMovieNumber) {
      /*
       *
       *  izgleda da ovo ne treba, ali ostavljam kod ako
       *  nadem neku gresku
       *
       */

      // // If the user has clicked on a different card while one is already in fullscreen mode
      // if (fullscreenedMovieNumber !== 0) {
      //   const previousFullscreenedMovieCard = document.getElementById(
      //     `movieCard-${fullscreenedMovieNumber}`
      //   );

      //   const previousFullscreenedY =
      //     previousFullscreenedMovieCard.getBoundingClientRect().y;
      //   const currentY = selectedMovieCard.getBoundingClientRect().y;

      //   // if the previous card is higher that the current one
      //   if (previousFullscreenedY < currentY) {
      //     const prefFullscreenHeight = previousFullscreenedMovieCard.offsetHeight;
      //     const prefDiff = prefFullscreenHeight - selectedCardSize.normal;

      //     window.scrollBy(0, -prefDiff);
      //   }
      // }

      selectedCardSize.normal = selectedMovieCard.offsetHeight;

      fullscreenedMovieNumber = filmNumber;
    }
  }
</script>

<div id="movieCardsContainer">
  {#each movies.filter((m) => m.performances && m.performances.length > 0) as movie (movie.id)}
    <MovieCardV2
      {movie}
      {fullscreenedMovieNumber}
      on:setFullscreen={setFullscreen}
      on:selectedPerformance
    />
  {/each}
</div>

<style>
  #movieCardsContainer {
    display: flex;
    flex-direction: column;

    row-gap: 2rem;
    column-gap: 2rem;
  }

  @media (min-width: 456px) {
    #movieCardsContainer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));

      row-gap: 2rem;
      column-gap: 2rem;
    }
  }
</style>
