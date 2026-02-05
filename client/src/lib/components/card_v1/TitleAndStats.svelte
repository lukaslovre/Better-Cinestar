<script>
  export let movie;
  export let isFullscreened;

  $: primaryGenre = movie?.tmdb_genres?.[0]?.name || movie?.genres?.[0] || 'N/A';

  $: runtimeText = (() => {
    const mins = movie?.tmdb_runtime ?? movie?.lengthInMinutes ?? null;
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  })();

  $: tmdbRatingText = (() => {
    const r = movie?.tmdb_rating;
    if (r == null) return null;
    if (movie.tmdb_vote_count === 0) return null;
    const rounded = Math.round(r * 10) / 10;
    return `${rounded}/10`;
  })();
</script>

<div class="titleAndStats">
  <p class="movieTitle" class:fullscreened={isFullscreened}>{movie.title}</p>

  <div class="movieStats" class:fullscreened={isFullscreened}>
    <p>{primaryGenre}</p>

    {#if runtimeText}
      <p>·</p>
      <p>{runtimeText}</p>
    {/if}

    {#if tmdbRatingText}
      <p>·</p>
      <div class="ratingIconAndValue">
        <img
          class="tmdbLogo"
          src="/images/tmdb_logo_blue_short.svg"
          alt="TMDB logo"
        />
        <p>{tmdbRatingText}</p>
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

  .movieStats .ratingIconAndValue > img.tmdbLogo {
    height: 0.5rem;
    width: auto;
  }
</style>
