<script>
  import { createEventDispatcher } from "svelte";

  export let movie;
  export let isFullscreened;

  const dispatch = createEventDispatcher();

  function fullscreenCurrentMovie(e) {
    dispatch("setFullscreen", {
      filmNumber: movie.filmNumber,
      movieCard: e.target.closest(".movieCard"),
    });
  }

  //   function addMovieToUrl() {
  //     const params = new URLSearchParams(window.location.search);
  //     params.set("goToMovie", movie.filmNumber);
  //     window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  //   }
</script>

<div class="buttonsContainer">
  <!-- <button class="imageButton secondaryButton" on:click={addMovieToUrl}>
    <img class="" src="/images/share.svg" alt="Share link to movie" />
  </button> -->

  <button class="imageButton button" on:click={fullscreenCurrentMovie}>
    <img
      class=""
      src={isFullscreened ? "/images/fullscreen-exit.svg" : "/images/fullscreen.svg"}
      alt="Toggle fullscreen mode"
    />
    <span class="label">{isFullscreened ? "Manje informacija" : "Više informacija"}</span>
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

  .secondaryButton {
    background-color: #0c1a40;
  }
</style>
