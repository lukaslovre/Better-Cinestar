<script>
  export let movie;
  export let isFullscreened;
</script>

<div class="titleAndStats">
  <p class="movieTitle" class:fullscreened={isFullscreened}>{movie.title}</p>

  <div class="movieStats" class:fullscreened={isFullscreened}>
    {#if movie.englishCategories}
      <p>{movie.englishCategories[0]}</p>
    {:else}
      <p>{movie.genres[0]}</p>
    {/if}

    {#if movie.duration}
      <p>·</p>
      <p>{movie.duration}</p>
    {/if}

    {#if movie.letterboxdRating}
      <p>·</p>
      <div class="ratingIconAndValue">
        <img src="/images/letterboxdIcon.png" alt="letterboxd icon" />
        <p>{movie.letterboxdRating}/5</p>
      </div>
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
  .movieTitle {
    color: #e6e6e6;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .movieTitle.fullscreened {
    font-size: 1.125rem;
  }
  .movieStats {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.375rem;
    row-gap: 0.25rem;

    color: #e6e6e6;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .movieStats.fullscreened {
    justify-content: space-between;
  }
  .movieStats .ratingIconAndValue {
    display: flex;
    align-items: center;
    column-gap: 0.1875rem;
  }
  .movieStats .ratingIconAndValue > img {
    height: 1rem;
  }
</style>
