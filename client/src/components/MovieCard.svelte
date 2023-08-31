<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let movie;
  export let fullscreenedMovieNumber;

  function dispatchFullscreenSelection(filmNumber) {
    dispatch("setFullscreen", filmNumber);
  }
  function dispatchPerformanceData(movie, performance) {
    dispatch("setPerformanceData", { movie, performance });
  }

  function getPerformancesLabel(perfDateTime) {
    const performanceDate = new Date(perfDateTime);
    const today = new Date();
    const dateDiff = performanceDate.getDate() - today.getDate();
    if (dateDiff === 0) {
      return "danas";
    }
    if (dateDiff === 1) {
      return "sutra";
    }

    return performanceDate.toLocaleDateString("hr-HR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  function groupPerformancesByCinema(performances) {
    const groupedPerformances = new Map();
    for (const e of performances) {
      const cinemaName = cinemasData.find(
        (cinema) => cinema.cinemaOid === e.cinemaOid
      ).cinemaName;
      if (!groupedPerformances.has(cinemaName)) {
        groupedPerformances.set(cinemaName, []);
      }
      groupedPerformances.get(cinemaName).push(e);
    }

    return groupedPerformances;
  }

  // Ovo negdje drugdje?
  const cinemasData = [
    {
      cinemaOid: "10000000014OCPXCOG",
      cinemaName: "Branimir mingle mall",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "20000000014FEPADHG",
      cinemaName: "Avenue mall",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "37000000014FEPADHG",
      cinemaName: "Arena centar",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "B7000000014FEPADHG",
      cinemaName: "Z centar",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "87000000014FEPADHG",
      cinemaName: "Kaptol boutique",
      cinemaCity: "Zagreb",
    },
    {
      cinemaOid: "57000000014FEPADHG",
      cinemaName: "Dvori lapad",
      cinemaCity: "Dubrovnik",
    },
    {
      cinemaOid: "27000000014FEPADHG",
      cinemaName: "Portanova centar",
      cinemaCity: "Osijek",
    },
    {
      cinemaOid: "A7000000014FEPADHG",
      cinemaName: "Max city",
      cinemaCity: "Pula",
    },
    {
      cinemaOid: "40000000014FEPADHG",
      cinemaName: "Tower centar",
      cinemaCity: "Rijeka",
    },
    {
      cinemaOid: "67000000014FEPADHG",
      cinemaName: "City colosseum",
      cinemaCity: "Slavonski Brod",
    },
    {
      cinemaOid: "17000000014FEPADHG",
      cinemaName: "Joker centar",
      cinemaCity: "Split",
    },
    {
      cinemaOid: "97000000014FEPADHG",
      cinemaName: "Mall of split",
      cinemaCity: "Split",
    },
    {
      cinemaOid: "47000000014FEPADHG",
      cinemaName: "Lumini centar",
      cinemaCity: "Varaždin",
    },
    {
      cinemaOid: "77000000014FEPADHG",
      cinemaName: "K centar golubica",
      cinemaCity: "Vukovar",
    },
    {
      cinemaOid: "D4000000014FEPADHG",
      cinemaName: "City galleria",
      cinemaCity: "Zadar",
    },
    {
      cinemaOid: "07000000014FEPADHG",
      cinemaName: "Dalmare centar",
      cinemaCity: "Šibenik",
    },
  ];
</script>

<div class="movieCard">
  <img
    class="moviePoster"
    src={movie.posterUrl || movie.imageUrl}
    alt="{movie.originalTitle} poster"
    style:width={movie.filmNumber === fullscreenedMovieNumber ? "0%" : "50%"}
  />

  <div
    class="movieData"
    style:width={movie.filmNumber === fullscreenedMovieNumber ? "100%" : "50%"}
  >
    <div class="titleAndStats">
      <p class="movieTitle">{movie.title}</p>
      <div class="movieStats">
        {#if movie.englishCategories}
          <p>{movie.englishCategories[0]}</p>
        {:else}
          <p>{movie.genres[0]}</p>
        {/if}

        <p>·</p>

        <p>{movie.duration}</p>

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

    <div
      class="movieExtraInfo"
      style:display={movie.filmNumber === fullscreenedMovieNumber ? "flex" : "none"}
    >
      <div class="infoContainer">
        <p class="infoLabel">Direktori</p>
        {#if movie.englishDirectors}
          <p class="infoText">{movie.englishDirectors.join(", ")}</p>
        {:else}
          <p class="infoText">{movie.director}</p>
        {/if}
      </div>
      <div class="infoContainer">
        <p class="infoLabel">Opis</p>
        {#if movie.englishSynopsis}
          <p class="infoText">{movie.englishSynopsis}</p>
        {:else}
          <p class="infoText">{movie.synopsis}</p>
        {/if}
      </div>

      {#if movie.trailerLink}
        <a href={movie.trailerLink} class="trailerButton"> Trailer </a>
      {/if}
    </div>

    <div class="performanceAndFullscreenContainer">
      <!-- Performances minimizirano -->
      <div
        class="performanceContainer"
        style:display={movie.filmNumber === fullscreenedMovieNumber ? "none" : "flex"}
      >
        <div class="performanceslabel">
          {getPerformancesLabel(movie.performances[0].performanceDateTime)}
        </div>
        <div class="performanceList">
          {#each movie.performances as performance}
            <div
              class="performanceCard"
              on:click={() => {
                dispatchPerformanceData(movie, performance);
              }}
            >
              <p class="performanceTime">{performance.performanceTime}</p>
              <div class="performanceFeature">
                {#each performance.performanceFeatures as feature}
                  <p>{feature}</p>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Performances fullscreen (odvojena kina) -->
      <div
        class="performanceContainer"
        style:display={movie.filmNumber === fullscreenedMovieNumber ? "flex" : "none"}
      >
        {#each [...groupPerformancesByCinema(movie.performances)] as [key, value]}
          <div class="performanceslabel">
            {key}
          </div>
          <div class="performanceList">
            {#each value as performance}
              <div
                class="performanceCard"
                on:click={() => {
                  dispatchPerformanceData(movie, performance);
                }}
              >
                <p class="performanceTime">{performance.performanceTime}</p>
                <div class="performanceFeature">
                  {#each performance.performanceFeatures as feature}
                    <p>{feature}</p>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
      <img
        src="/images/fullscreen.svg"
        alt="fullscreen"
        on:click={() => {
          dispatchFullscreenSelection(movie.filmNumber);
        }}
      />
    </div>
  </div>
</div>

<style>
  .movieCard {
    display: flex;
    background-color: #05060b;
    border-radius: 0.5rem;
    box-shadow: 0.375rem 0.375rem 0.25rem rgba(0, 0, 0, 0.25);
  }

  .movieCard > .moviePoster {
    width: 50%;
    border-radius: 0.5rem;
    aspect-ratio: 2/3;
    object-fit: cover;

    transition: width 250ms ease-out;
  }
  .movieCard > .movieData {
    width: 50%;
    padding: 1.25rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 3rem;

    transition: width 250ms ease-out;
  }

  .movieCard > .movieData .movieTitle {
    /* mozda ovo limitirat height */
    color: #e6e6e6;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.4375rem;
  }
  .movieCard > .movieData .movieStats {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.375rem;
    row-gap: 0.25rem;
    color: #bfbfbf;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .movieCard > .movieData .movieStats .ratingIconAndValue {
    display: flex;
    align-items: center;
    column-gap: 0.1875rem;
  }
  .movieCard > .movieData .movieStats .ratingIconAndValue > img {
    height: 1rem;
  }

  .movieCard > .movieData .movieExtraInfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 1rem;
  }
  .movieCard > .movieData .movieExtraInfo .infoLabel {
    color: #e6e6e6;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
  .movieCard > .movieData .movieExtraInfo .infoText {
    color: #bfbfbf;
    font-size: 0.75rem;
    font-weight: 400;
    margin-left: 0.75rem;
  }
  .movieCard > .movieData .movieExtraInfo .trailerButton {
    text-decoration: none;
    padding: 0.375rem 0.875rem;
    border-radius: 0.25rem;
    background-color: #19284d;
    color: #b8c4e0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .movieCard > .movieData .performanceAndFullscreenContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.625rem;
  }
  .movieCard > .movieData .performanceAndFullscreenContainer > img {
    cursor: pointer;
    align-self: flex-end;
  }

  .movieCard > .movieData .performanceContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.3125rem;
  }
  .movieCard > .movieData .performanceContainer .performanceslabel {
    color: #999999;
    font-weight: 400;
    font-size: 0.625rem;
    text-transform: capitalize;
  }
  .movieCard > .movieData .performanceContainer .performanceList {
    display: flex;
    column-gap: 0.375rem;
    overflow-x: scroll;
  }
  .movieCard > .movieData .performanceContainer .performanceList .performanceCard {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 0.5px solid #14171f;
    background: #0e131f;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;
  }

  .movieCard > .movieData .performanceCard .performanceTime {
    color: #bfbfbf;
    font-size: 0.75rem;
  }

  .movieCard > .movieData .performanceCard .performanceFeature {
    text-align: center;
    color: #999999;
    font-size: 0.625rem;
    font-weight: 400;
  }
</style>
