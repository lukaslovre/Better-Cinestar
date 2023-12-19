<script>
  import { createEventDispatcher } from "svelte";
  import PerformanceFilterCard from "./performanceFilterCard.svelte";
  const dispatch = createEventDispatcher();

  export let movie;
  export let fullscreenedMovieNumber;

  let filteredPerformances = movie.performances;
  let filterCardVisible = false;
  // events
  function dispatchFullscreenSelection(filmNumber) {
    dispatch("setFullscreen", filmNumber);
  }
  function dispatchPerformanceData(movie, performance) {
    dispatch("setPerformanceData", { movie, performance });
  }

  // event listener
  function filterPerformances(event) {
    const selectedPerformanceFilters = event.detail;

    filteredPerformances = movie.performances.filter((performance) => {
      const isInTimeRange =
        performance.performanceTime >= selectedPerformanceFilters.timeFrom &&
        performance.performanceTime <= selectedPerformanceFilters.timeTo;

      const isVideoFeatureSelected =
        selectedPerformanceFilters.videoFeatures.length === 0 ||
        selectedPerformanceFilters.videoFeatures.some((selectedFeature) =>
          performance.performanceFeatures.includes(selectedFeature)
        );

      // if roomFeatures equals "BASIC", then check that the performanceFeatures doesn't contain "4DX" or "IMAX" or "GOLD",
      // if roomFeatures equals something else, then the performanceFeatures must contain that value
      const isRoomFeatureSelected =
        selectedPerformanceFilters.roomFeatures.length === 0 ||
        selectedPerformanceFilters.roomFeatures.some((selectedFeature) => {
          if (selectedFeature === "BASIC") {
            return (
              !performance.performanceFeatures.includes("4DX") &&
              !performance.performanceFeatures.includes("IMAX") &&
              !performance.performanceFeatures.includes("GOLD")
            );
          } else {
            return performance.performanceFeatures.includes(selectedFeature);
          }
        });

      const isAudioFeatureSelected =
        selectedPerformanceFilters.audioFeatures.length === 0 ||
        selectedPerformanceFilters.audioFeatures.some((selectedFeature) =>
          performance.performanceFeatures.includes(selectedFeature)
        );

      return (
        isInTimeRange &&
        isVideoFeatureSelected &&
        isRoomFeatureSelected &&
        isAudioFeatureSelected
      );
    });
  }

  // functions
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
      const cinema = cinemasData.find((cinema) => cinema.cinemaOid === e.cinemaOid);
      const cinemaName = cinema.cinemaName + " (" + cinema.cinemaCity + ")";
      if (!groupedPerformances.has(cinemaName)) {
        groupedPerformances.set(cinemaName, []);
      }
      groupedPerformances.get(cinemaName).push(e);
    }

    return groupedPerformances;
  }
  function displayFilterCard() {
    filterCardVisible = !filterCardVisible;
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

<div
  class="movieCard"
  class:fullScreenMovieCard={movie.filmNumber === fullscreenedMovieNumber}
>
  <img
    class="moviePoster"
    src={movie.posterUrl || movie.imageUrl}
    alt="{movie.originalTitle} poster"
  />

  <div class="movieData">
    <div class="titleAndStats">
      <p class="movieTitle">{movie.title}</p>

      <div class="movieStats">
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

    <div
      class="movieExtraInfo"
      style:display={movie.filmNumber === fullscreenedMovieNumber ? "flex" : "none"}
    >
      <div class="infoContainer">
        <p class="infoLabel">Direktori</p>
        <div class="peopleContainer">
          {#if movie.englishDirectors}
            {#each movie.englishDirectors as director}
              <div class="person">
                <img src={director.portraitUrl} alt={director.name + "portrait"} />
                <p class="personName">{director.name}</p>
              </div>
            {/each}
          {:else}
            <div class="person">
              <img src="/images/clockIcon.svg" alt={movie.director + "portrait"} />
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
              <div class="person">
                <img src={actor.portraitUrl} alt={actor.name + " portrait"} />
                <p class="personName">{actor.name}</p>
              </div>
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
        <a href={movie.trailerLink} class="trailerButton">
          <img src="images/trailerPlayIcon.svg" alt="play trailer icon" /> Trailer
        </a>
      {/if}
    </div>

    <!-- Donja polovica detalja -->

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

      <div
        class="performanceManipulationContainer"
        style:display={movie.filmNumber === fullscreenedMovieNumber ? "flex" : "none"}
      >
        <div class="performanceFilter" on:click={displayFilterCard}>
          <img src="/images/filterPerfomanceIcon.svg" alt="filter icon" />
        </div>
        <div class="performanceDatePicker">
          <div class="arrowCircle">
            <img src="images/leftArrow.svg" alt="left arrow" />
          </div>
          {getPerformancesLabel(movie.performances[0].performanceDateTime)}
          <div class="arrowCircle">
            <img src="images/rightArrow.svg" alt="right arrow" />
          </div>
        </div>
      </div>

      <PerformanceFilterCard
        on:setSelectedPerformanceFilters={filterPerformances}
        performances={movie.performances}
        displayComponent={movie.filmNumber === fullscreenedMovieNumber &&
        filterCardVisible
          ? "flex"
          : "none"}
      />

      <!-- Performances fullscreen (odvojena kina) -->
      <div
        class="performanceContainer"
        style:display={movie.filmNumber === fullscreenedMovieNumber ? "flex" : "none"}
      >
        {#each [...groupPerformancesByCinema(filteredPerformances)] as [key, value]}
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
    border: 1px solid #05060b;
    border-radius: 0.5rem;
    box-shadow: 0.375rem 0.375rem 0.25rem rgba(0, 0, 0, 0.25);
  }
  .fullScreenMovieCard {
    border: 1px solid #2e406b;
  }

  .movieCard > .moviePoster {
    width: 50%;
    border-radius: 0.5rem;
    aspect-ratio: 2/3;
    object-fit: cover;

    transition: width 250ms ease-out;
  }
  .fullScreenMovieCard > .moviePoster {
    width: 0%;
  }
  .movieCard > .movieData {
    width: 50%;
    padding: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 2rem;

    transition: width 250ms ease-out;
  }
  .fullScreenMovieCard > .movieData {
    width: 100%;
    row-gap: 1rem;
    padding: 1.5rem 0.75rem;
  }

  /* mozda ovo limitirat height */
  .movieCard > .movieData .movieTitle {
    color: #e6e6e6;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .fullScreenMovieCard > .movieData .movieTitle {
    font-size: 1.125rem;
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
  .fullScreenMovieCard > .movieData .movieStats {
    justify-content: space-between;
  }
  .movieCard > .movieData .movieStats .ratingIconAndValue {
    display: flex;
    align-items: center;
    column-gap: 0.1875rem;
  }
  .movieCard > .movieData .movieStats .ratingIconAndValue > img {
    height: 1rem;
  }

  /* Podaci koji se vide tek kad je fullscreen */
  .movieCard > .movieData .movieExtraInfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 1rem;
  }
  .movieCard > .movieData .movieExtraInfo .infoContainer {
    width: 100%;
  }
  .movieCard > .movieData .movieExtraInfo .peopleContainer {
    display: flex;
    column-gap: 1rem;
    margin-left: 0.75rem;
    overflow-x: scroll;
  }
  .movieCard > .movieData .movieExtraInfo .peopleContainer .person {
    width: 4rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    align-items: center;
  }
  .movieCard > .movieData .movieExtraInfo .peopleContainer .person img {
    width: 4rem;
    height: 4rem;
    object-fit: cover;
    border-radius: 50%;
  }
  .movieCard > .movieData .movieExtraInfo .peopleContainer .person p {
    width: 100%;
    color: #bfbfbf;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .movieCard > .movieData .movieExtraInfo .infoLabel {
    color: #e6e6e6;
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
  }
  .movieCard > .movieData .movieExtraInfo .infoText {
    color: #bfbfbf;
    font-size: 0.75rem;
    font-weight: 400;
    margin-left: 0.75rem;
    line-height: 140%;
  }
  .movieCard > .movieData .movieExtraInfo .trailerButton {
    display: flex;
    align-items: center;
    column-gap: 0.375rem;
    padding: 0.375rem 0.875rem;
    border-radius: 0.25rem;
    background-color: #263d73;
    color: #dbe1f0;
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

  .movieCard > .movieData .performanceManipulationContainer {
    /* Linija koja odvaja info i performance je ovdje gornji border */
    margin-top: 2rem; /* + 1rem row-gap */
    border-top: 2px solid #808080;
    padding-top: 3rem;

    display: flex;
    justify-content: space-between;
    column-gap: 1.5rem;
    margin-bottom: 0.5rem;

    color: #e6e6e6;
    font-size: 1rem;
  }
  .movieCard > .movieData .performanceManipulationContainer > .performanceFilter {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: #202b46;
    cursor: pointer;
  }
  .movieCard > .movieData .performanceManipulationContainer > .performanceDatePicker {
    padding: 0.125rem;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 1.5rem;
    background: #101623;
    text-transform: capitalize;
  }
  .movieCard > .movieData .performanceDatePicker > .arrowCircle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: #202b46;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .movieCard > .movieData .performanceContainer {
    display: flex;
    flex-direction: column;
    row-gap: 0.3125rem;
  }
  .movieCard > .movieData .performanceContainer .performanceslabel {
    color: #bfbfbf;
    font-weight: 500;
    font-size: 0.625rem;
    text-transform: capitalize;
  }
  .movieCard > .movieData .performanceContainer .performanceList {
    display: flex;
    column-gap: 0.375rem;
    overflow-x: scroll;
    margin-bottom: 0.5rem;
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
    color: #e6e6e6;
    font-size: 0.75rem;
  }
  .movieCard > .movieData .performanceCard .performanceFeature {
    text-align: center;
    color: #bfbfbf;
    font-size: 0.625rem;
    font-weight: 400;
  }
</style>
