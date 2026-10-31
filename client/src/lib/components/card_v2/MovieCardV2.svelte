<script lang="ts">
  import TitleAndStats from './TitleAndStats.svelte';
  import FullInfo from '../FullInfo.svelte';
  import Performances from '../Performances.svelte';
  import MovieCardBottomButtons from '../MovieCardBottomButtons.svelte';

  interface MovieCardProps {
    movie: Movie;
    fullscreenedMovieNumber: number;
    eagerPoster?: boolean;
  }

  let { movie, fullscreenedMovieNumber, eagerPoster = false }: MovieCardProps = $props();

  const isFullscreened = $derived(movie.filmNumber === fullscreenedMovieNumber);
  const posterUrl = $derived(movie.tmdb_poster_url || movie.imageUrl);
  let loadedPosterUrl = $state<string>();
</script>

<div
  class="movieCard"
  id="movieCard-{movie.filmNumber}"
  class:fullScreenMovieCard={isFullscreened}
>
  <!-- Wait for the lazy image before applying its background, which would fetch eagerly. -->
  <div
    class="posterContainer"
    style:background-image={eagerPoster || loadedPosterUrl === posterUrl
      ? `url(${posterUrl})`
      : undefined}
  >
    <div class="overlay"></div>
    <img
      class="moviePoster"
      src={posterUrl}
      alt="{movie.originalTitle} poster"
      loading={eagerPoster ? 'eager' : 'lazy'}
      width="500"
      height="750"
      onload={() => (loadedPosterUrl = posterUrl)}
    />
  </div>

  <div class="card-body">
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

  .card-body {
    padding: 1rem;
  }
</style>
