<script>
  export let movie;
  export let isFullscreened;
</script>

<div class="titleAndStats" class:sticky={isFullscreened}>
  <p class="movieTitle">
    {movie.title}
    {#if movie.ageRating && movie.ageRating !== '0'}
      <span class="ageRating">
        ({movie.ageRating}+)
      </span>
    {/if}
  </p>

  <div class="movieStats">
    <div class="row">
      <div>
        <p>{movie.englishCategories?.[0] || movie.genres?.[0] || 'N/A'}</p>
      </div>

      <div>
        {#if movie.imdbRating}
          <div class="ratingIconAndValue">
            <img src="/images/imdbIcon.png" alt="imdb icon" />
            <p>{movie.imdbRating}/10</p>
          </div>
        {/if}
      </div>
    </div>
    <div class="row">
      <div>
        {#if movie.duration}
          <p>{movie.duration}</p>
        {/if}
      </div>
      <div>
        {#if movie.letterboxdRating}
          <div class="ratingIconAndValue">
            <img src="/images/letterboxdIcon.png" alt="letterboxd icon" />
            <p>{movie.letterboxdRating}/5</p>
          </div>
        {/if}
      </div>
    </div>
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
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }
  .movieTitle .ageRating {
    color: #b3b3b3;
  }
  .movieStats {
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
  }
  .movieStats .row {
    display: flex;
    justify-content: space-between;
  }
  .movieStats p {
    /* color: #e6e6e6; */
    color: #c1c1c1;
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
