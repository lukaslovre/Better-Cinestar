<script lang="ts">
  interface TitleAndStatsProps {
    movie: Movie;
    isFullscreened: boolean;
  }

  let { movie, isFullscreened }: TitleAndStatsProps = $props();

  let primaryGenre = $derived(
    movie.tmdb_genres?.[0]?.name || movie.genres?.[0] || 'N/A'
  );

  let runtimeText = $derived.by(() => {
    const mins = movie.tmdb_runtime ?? movie.lengthInMinutes ?? null;
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  });

  let tmdbRatingText = $derived.by(() => {
    const r = movie.tmdb_rating;
    if (r == null) return null;
    const rounded = Math.round(r * 10) / 10;
    return `${rounded}/10`;
  });
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
        <p>{primaryGenre}</p>
      </div>

      <div>
        {#if tmdbRatingText}
          <div class="ratingIconAndValue">
            <p>TMDB</p>
            <p>{tmdbRatingText}</p>
          </div>
        {/if}
      </div>
    </div>
    <div class="row">
      <div>
        {#if runtimeText}
          <p>{runtimeText}</p>
        {/if}
      </div>
      <div>
        <!-- reserved for future stats -->
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
</style>
