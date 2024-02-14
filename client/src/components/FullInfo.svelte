<script>
  export let movie;
</script>

<div class="movieExtraInfo">
  <div class="infoContainer">
    <p class="infoLabel">
      {movie.englishDirectors && movie.englishDirectors.length > 1
        ? "Direktori"
        : "Direktor"}
    </p>
    <div class="peopleContainer">
      {#if movie.englishDirectors}
        {#each movie.englishDirectors as director}
          <a href={director.lbUrl} class="person">
            <img src={director.portraitUrl} alt={director.name + "portrait"} />
            <p class="personName">{director.name}</p>
          </a>
        {/each}
      {:else}
        <div class="person">
          <img src="/images/defaultPersonImage.jpg" alt={movie.director + "portrait"} />
          <p class="personName">{movie.director}</p>
        </div>
      {/if}
    </div>
  </div>

  {#if movie.actors}
    <div class="infoContainer">
      <p class="infoLabel">Glumci</p>
      <div class="peopleContainer">
        {#each movie.actors as actor}
          <a href={actor.lbUrl} class="person">
            <img src={actor.portraitUrl} alt={actor.name + " portrait"} />
            <p class="personName">{actor.name}</p>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <div class="infoContainer">
    <p class="infoLabel">Opis</p>
    {#if movie.englishSynopsis}
      <p class="infoText">{movie.englishSynopsis}</p>
    {:else}
      <p class="infoText">{movie.synopsis}</p>
    {/if}
  </div>

  {#if movie.trailerLink}
    <a href={movie.trailerLink} class="trailerButton button">
      <img src="images/trailerPlayIcon.svg" alt="play trailer icon" /> Trailer
    </a>
  {/if}
</div>

<style>
  .movieExtraInfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 1rem;
  }
  .movieExtraInfo .infoContainer {
    width: 100%;
  }
  .movieExtraInfo .peopleContainer {
    display: flex;
    column-gap: 1rem;
    margin-left: 0.75rem;
    overflow-x: scroll;
    padding-bottom: 0.25rem;
  }
  .movieExtraInfo .peopleContainer .person {
    width: 4rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    align-items: center;
  }
  .movieExtraInfo .peopleContainer .person img {
    width: 4rem;
    height: 4rem;
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
    margin-bottom: 0.5rem;
  }
  .movieExtraInfo .infoText {
    color: #bfbfbf;
    font-size: 0.75rem;
    font-weight: 400;
    margin-left: 0.75rem;
    line-height: 140%;
  }
  .movieExtraInfo .trailerButton {
    display: flex;
    align-items: center;
    column-gap: 0.375rem;
    padding: 0.375rem 0.875rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
