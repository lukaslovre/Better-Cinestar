<script>
  // import { onMount } from "svelte";
  import MovieCardV1 from "./card_v1/MovieCardV1.svelte";
  import MovieCardV2 from "./card_v2/MovieCardV2.svelte";

  // import { scrollToMovieId } from "../stores";

  export let movies;

  // onMount(() => {
  //   // wait for 200ms, then scroll to the movie
  //   setTimeout(() => {
  //     const movieCard = document.getElementById(`movieCard-${$scrollToMovieId}`);
  //     if (movieCard) {
  //       window.scrollBy({
  //         top: movieCard.getBoundingClientRect().top - 32,
  //         behavior: "smooth",
  //       });
  //     }
  //   }, 250);
  // });

  const movieCardDesign = localStorage.getItem("movieCardDesign");
  if (!movieCardDesign) {
    localStorage.setItem("movieCardDesign", "v2");
  }

  let fullscreenedMovieNumber = 0;
  let selectedCardSize = {
    normal: 0,
    fullscreen: 0,
  };

  function setFullscreen(event) {
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
  {#each movies.filter((m) => m.performances.length > 0) as movie}
    {#if movieCardDesign === "v1"}
      <MovieCardV1
        {movie}
        {fullscreenedMovieNumber}
        on:setFullscreen={setFullscreen}
        on:selectedPerformance
      />
    {:else}
      <MovieCardV2
        {movie}
        {fullscreenedMovieNumber}
        on:setFullscreen={setFullscreen}
        on:selectedPerformance
      />
    {/if}
  {/each}
</div>

<style>
  /* #movieCardsContainer {
    display: flex;
    flex-wrap: wrap;

    column-gap: 2rem;
    row-gap: 4rem;
  } */

  #movieCardsContainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));

    row-gap: 2rem;
    column-gap: 2rem;
  }

  @media (max-width: 22rem) {
    #movieCardsContainer {
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    }
  }
</style>
