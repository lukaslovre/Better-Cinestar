<script>
  import { createEventDispatcher } from "svelte";

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
  <img
    class="moviePoster"
    src={movie.posterUrl || movie.imageUrl}
    alt="{movie.originalTitle} poster"
  />

  <div class="rightSide">
    <div class="movieData">
      <TitleAndStats {movie} {isFullscreened} />

      {#if isFullscreened}
        <FullInfo {movie} />
      {/if}

      <Performances {movie} {isFullscreened} on:selectedPerformance />
    </div>

    <MovieCardBottomButtons {movie} {isFullscreened} on:setFullscreen />
  </div>
</div>

<style>
  .movieCard {
    display: flex;
    background-color: #05060b;
    border: 1px solid #05060b;
    border-radius: 0.5rem;
    box-shadow: 0.375rem 0.375rem 0.25rem rgba(0, 0, 0, 0.25);
  }
  .fullScreenMovieCard {
    border: 1px solid #2e406b;
  }

  .movieCard > .moviePoster {
    cursor: pointer;
    width: 50%;
    border-radius: 0.5rem;
    aspect-ratio: 2/3;
    object-fit: cover;

    transition: width 250ms ease-out;
  }
  .fullScreenMovieCard > .moviePoster {
    width: 0%;
  }
  .movieCard > .rightSide {
    width: 50%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  .movieCard .movieData {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 1rem;
  }
  .fullScreenMovieCard .rightSide {
    width: 100%;
    padding: 1.5rem 0.75rem;
  }
  .fullScreenMovieCard .movieData {
    row-gap: 1rem;
  }
</style>
