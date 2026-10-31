<script lang="ts">
  import TitleAndStats from './TitleAndStats.svelte';
  import MovieImageGallery from './MovieImageGallery.svelte';
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
</script>

<div
  class="movieCard"
  id="movieCard-{movie.filmNumber}"
  class:fullScreenMovieCard={isFullscreened}
>
  <MovieImageGallery {movie} {eagerPoster} />

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

  .card-body {
    padding: 1rem;
  }
</style>
