<script lang="ts">
  let { movie }: { movie: Movie } = $props();

  let directorsLabel = $derived(
    movie.tmdb_directors && movie.tmdb_directors.length > 1 ? 'Redatelji' : 'Redatelj'
  );

  let synopsisText = $derived(movie.tmdb_synopsis || movie.synopsis || '');

  function compareTitlesWithoutFormatting(
    a: string | null | undefined,
    b: string | null | undefined
  ): boolean {
    if (a == null || b == null) {
      return a === b;
    }

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const lowerA = normalize(a);
    const lowerB = normalize(b);

    return lowerA === lowerB;
  }
</script>

<div class="movieExtraInfo">
  {#if movie.originalTitle && !compareTitlesWithoutFormatting(movie.originalTitle, movie.title)}
    <div class="infoContainer">
      <p class="infoLabel">Originalni naziv</p>
      <p class="infoText">{movie.originalTitle}</p>
    </div>
  {/if}

  <div class="infoContainer">
    <p class="infoLabel">{directorsLabel}</p>
    <div class="peopleContainer">
      {#if movie.tmdb_directors && movie.tmdb_directors.length}
        {#each movie.tmdb_directors as director}
          {#if director?.profile_url}
            <a href={director.profile_url} class="person" target="_blank" rel="noopener">
              <img
                src={director.profile_image_url || '/images/defaultPersonImage.jpg'}
                alt={(director.name || 'Director') + ' portrait'}
              />
              <p class="personName">{director.name}</p>
            </a>
          {:else}
            <div class="person">
              <img
                src={director?.profile_image_url || '/images/defaultPersonImage.jpg'}
                alt={(director?.name || 'Director') + ' portrait'}
              />
              <p class="personName">{director?.name}</p>
            </div>
          {/if}
        {/each}
      {:else}
        <div class="person">
          <img src="/images/defaultPersonImage.jpg" alt={movie.director + 'portrait'} />
          <p class="personName">{movie.director}</p>
        </div>
      {/if}
    </div>
  </div>

  {#if movie.tmdb_cast && movie.tmdb_cast.length}
    <div class="infoContainer">
      <p class="infoLabel">Glumci</p>
      <div class="peopleContainer">
        {#each movie.tmdb_cast as actor}
          {#if actor?.profile_url}
            <a href={actor.profile_url} class="person" target="_blank" rel="noopener">
              <img
                src={actor.profile_image_url || '/images/defaultPersonImage.jpg'}
                alt={(actor.name || 'Actor') + ' portrait'}
              />
              <p class="personName">{actor.name}</p>
            </a>
          {:else}
            <div class="person">
              <img
                src={actor?.profile_image_url || '/images/defaultPersonImage.jpg'}
                alt={(actor?.name || 'Actor') + ' portrait'}
              />
              <p class="personName">{actor?.name}</p>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <div class="infoContainer">
    <p class="infoLabel">Opis</p>
    <p class="infoText">{synopsisText}</p>
  </div>

  {#if movie.tmdb_trailer_url}
    <a
      href={movie.tmdb_trailer_url}
      class="trailerButton"
      target="_blank"
      rel="noopener"
      aria-label={`Watch trailer for ${movie.originalTitle}`}
    >
      <img src="images/trailerPlayIcon.svg" alt="play trailer icon" />
      <span>Trailer</span>
      <span class="secondary">(youtube.com)</span>
    </a>
  {/if}
</div>

<style>
  .movieExtraInfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 1.5rem;
  }
  .movieExtraInfo .infoContainer {
    width: 100%;
  }
  .movieExtraInfo .peopleContainer {
    display: flex;
    column-gap: 1rem;
    margin-left: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
  .movieExtraInfo .peopleContainer .person {
    flex-shrink: 0;
    width: 5rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    align-items: center;

    &:hover p {
      text-decoration: underline;
    }
  }
  .movieExtraInfo .peopleContainer .person img {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
    border-radius: 50%;
  }
  .movieExtraInfo .peopleContainer .person p {
    width: 100%;
    color: #bfbfbf;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .movieExtraInfo .infoLabel {
    color: #e6e6e6;
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  .movieExtraInfo .infoText {
    color: #bfbfbf;
    font-size: 0.75rem;
    font-weight: 400;
    margin-left: 0rem;
    line-height: 140%;
  }
  .movieExtraInfo .trailerButton {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;

    background-color: rgba(255, 255, 255, 0.05);
    color: hsl(223, 100%, 60%);

    margin-top: 0.5rem;
  }
  .movieExtraInfo .trailerButton .secondary {
    color: hsla(223, 100%, 60%, 0.75);
    font-weight: 400;
  }
</style>
