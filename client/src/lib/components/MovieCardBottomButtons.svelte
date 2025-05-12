<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface MovieCardBottomButtonsProps {
    movie: Movie;
    isFullscreened: boolean;
  }

  let { movie, isFullscreened }: MovieCardBottomButtonsProps = $props();

  const dispatch = createEventDispatcher();

  function fullscreenCurrentMovie(e: MouseEvent) {
    const movieCard = (e.target as HTMLElement)?.closest('.movieCard');
    if (!movieCard) {
      console.error("Didn't find movie card (.movieCard) when trying to fullscreen");
    }

    dispatch('setFullscreen', {
      filmNumber: movie.filmNumber,
      movieCard: movieCard
    });
  }
</script>

<div class="buttonsContainer">
  <button
    type="button"
    class="imageButton button"
    onclick={fullscreenCurrentMovie}
    aria-label="Toggle movie details display"
  >
    <img
      src={isFullscreened ? '/images/fullscreen-exit.svg' : '/images/fullscreen.svg'}
      alt="Toggle fullscreen mode"
    />
    <span class="label">{isFullscreened ? 'Manje informacija' : 'Više informacija'}</span>
  </button>
</div>

<style>
  .buttonsContainer {
    display: flex;
    justify-content: flex-end;
    column-gap: 1.25rem;

    margin-top: auto;
  }

  .imageButton {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .imageButton .label {
    font-weight: 500;
    color: white;
    font-size: 1rem;
  }
</style>
