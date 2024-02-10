<script>
  export let movie;
  export let isFullscreened;
</script>

<div class="titleAndStats" class:sticky={isFullscreened}>
  <p class="movieTitle">{movie.title}</p>

  <div class="movieStats">
    <p>{movie.englishCategories ? movie.englishCategories[0] : movie.genres[0]}</p>

    {#if movie.duration}
      <p>·</p>
      <p>{movie.duration}</p>
    {/if}

    {#if movie.imdbRating}
      <p>·</p>
      <div class="ratingIconAndValue">
        <img src="/images/imdbIcon.png" alt="imdb icon" />
        <p>{movie.imdbRating}/10</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* .sticky {
    padding: 1rem 0;
    position: sticky;
    top: 0;
    background-color: #05060b;
  } */
  .movieTitle {
    color: #e6e6e6;
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }
  .movieStats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    justify-items: center;
    align-items: center;
  }
  .movieStats :nth-child(1) {
    justify-self: start;
  }
  .movieStats :nth-child(5) {
    justify-self: end;
  }
  .movieStats p {
    color: #e6e6e6;
    font-size: 0.875rem;
    font-weight: 400;
    text-transform: capitalize;
  }
  .movieStats .ratingIconAndValue {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }
  .movieStats .ratingIconAndValue > img {
    height: 1rem;
  }
</style>
