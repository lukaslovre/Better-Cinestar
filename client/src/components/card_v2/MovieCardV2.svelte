<script>
  import TitleAndStats from "./TitleAndStats.svelte";
  import FullInfo from "../FullInfo.svelte";
  import Performances from "../Performances.svelte";
  import MovieCardBottomButtons from "../MovieCardBottomButtons.svelte";

  export let movie;
  export let fullscreenedMovieNumber;

  $: isFullscreened = movie.filmNumber === fullscreenedMovieNumber;
</script>

<div
  class="movieCard"
  id="movieCard-{movie.filmNumber}"
  class:fullScreenMovieCard={isFullscreened}
>
  <div
    class="posterContainer"
    style="background-image: url({movie.posterUrl || movie.imageUrl});"
  >
    <div class="overlay"></div>
    <img
      class="moviePoster"
      src={movie.posterUrl || movie.imageUrl}
      alt="{movie.originalTitle} poster"
    />
  </div>

  <div class="movieData">
    <TitleAndStats {movie} {isFullscreened} />

    {#if isFullscreened}
      <FullInfo {movie} />
    {/if}

    <Performances {movie} {isFullscreened} on:selectedPerformance />

    <MovieCardBottomButtons {movie} {isFullscreened} on:setFullscreen />
  </div>
</div>

<style>
  .movieCard {
    display: flex;
    flex-direction: column;
    background-color: #05060b;
    border-radius: 0.5rem;
    box-shadow: 0.375rem 0.375rem 0.25rem rgba(0, 0, 0, 0.25);
  }

  .posterContainer {
    width: 100%;
    display: flex;
    justify-content: center;
    position: relative;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  .posterContainer > .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0.5rem 0.5rem 0 0;
    background: rgba(19, 26, 42, 0.66);
    backdrop-filter: blur(21.5px);
  }
  .posterContainer > .moviePoster {
    width: 55%;
    border-radius: 0.5rem;
    z-index: 1;
  }

  .movieData {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 2.5rem;
  }
</style>
