<script>
  import Loading from "./Loading.svelte";
  import { createEventDispatcher } from "svelte";
  import { cinemas } from "../utils/cinemas";
  import { getAverageSeatDistance } from "../utils/performanceSeats";
  import { getRelativeDate } from "../utils/utils";

  export let performanceData;
  const dispatch = createEventDispatcher();
  const origin = window.location.origin; // Za radenje API requesta

  function formatDate(dateString, time) {
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    };

    const date = new Date(dateString);
    const localeString = date.toLocaleDateString("hr-HR", options);
    const formattedDate = localeString.replace(/\s+/g, "").replace(/,/g, " ");

    const relativeDate = getRelativeDate(date, time);

    return time + ", " + formattedDate + " (" + relativeDate + ")";
  }
  function closeSeats() {
    dispatch("selectedPerformance", null);
  }

  let seatsPromise = getSeats();

  async function getSeats() {
    const { cinemaOid, id: performanceId } = performanceData.performance;

    // create a URL parameter from the arguments
    const urlParams = new URLSearchParams();
    urlParams.append("cinemaOid", cinemaOid);
    urlParams.append("performanceId", performanceId);

    const getSeatingUrl = `${origin}/api/seating`;

    const res = await fetch(`${getSeatingUrl}?${urlParams.toString()}`);

    if (res.ok) {
      const data = await res.json();
      // console.log(data);
      setSeatingLayoutValues(data);
      return data;
    }
  }

  let seatLocationMultiplier = 2.5;
  let seatOffsetX = 0;
  let seatSize = 9;

  function setSeatingLayoutValues(seats) {
    const seatsContainer = document.getElementById("seatsContainer");
    const containerWidth = seatsContainer.clientWidth - 10;
    const furthestSeat = seats.maxX;
    seatLocationMultiplier = (containerWidth * 0.85) / furthestSeat;
    seatOffsetX = containerWidth * 0.075;
    const seatDistance = getAverageSeatDistance(seats) * seatLocationMultiplier;
    seatSize = Math.max(6, Math.min(Math.floor(seatDistance * 0.85), 18));

    const seatsHeight = seats.maxY * seatLocationMultiplier;
    seatsContainer.style.setProperty("height", 48 + seatsHeight + seatSize + "px");
  }

  function getSeatColor(seat) {
    // Ako je slobodno
    if ([4, 256, 260].includes(seat.stat)) {
      if ([161, 162, 171, 172].includes(seat.sg)) {
        // Ako je ljubavno
        return "#EA80FF";
      } else if ([160, 180, 250].includes(seat.sg)) {
        // Ako je VIP / BOUTIQUE
        return "#EFEF8F";
      } else if ([163, 193].includes(seat.sg)) {
        // Ako je invalidsko
        return "#A1DF9F";
      } else {
        return "#80A6FF";
      }
    } else {
      // Ako je zauzeto
      return "#373B43";
    }
  }

  // Cini mi se da radi bez ovog, ne sjecam se zasto postoji
  // $: {
  //   // Zove getSeats() svaki put kad se promjeni performanceData
  //   console.log(performanceData);
  //   seatsPromise = getSeats();
  // }
</script>

<div class="backdrop">
  <div id="card">
    <button id="closeSeatsButton" on:click={closeSeats}>
      <img src="/images/xIcon.svg" alt="close seats icon" />
    </button>

    <div id="seatsContainer">
      {#await seatsPromise}
        <Loading />
      {:then seatsData}
        <img src="/images/cinemaScreen.svg" alt="screen" />
        {#each seatsData.seats as seat}
          <div
            class="seat"
            style:background-color={getSeatColor(seat)}
            style:left={seatOffsetX + seat.x * seatLocationMultiplier + "px"}
            style:top={48 + seat.y * seatLocationMultiplier + "px"}
            style:width={seatSize + "px"}
            style:height={seatSize + "px"}
          />
        {/each}
      {/await}
    </div>

    <div id="seatsLegend">
      <div>
        <div class="seat" style:background-color="#80A6FF" />
        <p>Slobodno</p>
      </div>

      <div>
        <div class="seat" style:background-color="#373B43" />
        <p>Zauzeto</p>
      </div>
    </div>

    <div id="performanceInfo">
      <p class="movieTitle">
        {performanceData.movie.title}
        {#if performanceData.movie.ageRating && performanceData.movie.ageRating !== "0"}
          ({performanceData.movie.ageRating}+)
        {/if}
      </p>
      <div class="performanceInfoRow">
        <img src="/images/clockIcon.svg" alt="clock icon" />
        <p>
          {formatDate(
            performanceData.performance.cinemaDate,
            performanceData.performance.performanceTime
          )}
        </p>
      </div>
      <div class="performanceInfoRow">
        <img src="/images/locationIcon2.svg" alt="location icon" />
        <p>
          {cinemas.find(
            (cinema) => cinema.cinemaOid === performanceData.performance.cinemaOid
          ).cinemaName}
        </p>
      </div>
      <div class="performanceInfoRow">
        <img src="/images/clapperIcon.svg" alt="clapper icon" />
        <p>{performanceData.performance.performanceFeatures.join(" · ")}</p>
      </div>
    </div>

    <a
      id="buyTicketButton"
      target="_blank"
      href={`https://shop.cinestarcinemas.hr/landingpage?center=${performanceData.performance.cinemaOid}&page=seatingplan&performance=${performanceData.performance.id}`}
    >
      <p>Kupi kartu na cinestar.hr</p>
      <img src="images/linkArrow.svg" alt="arrow" />
    </a>
  </div>
</div>

<style>
  .backdrop {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(3px);
  }
  #card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: calc(100% - 2rem);
    max-width: 30rem;
    padding: 2rem;
    border-radius: 0.5rem;
    background: #131a2a;
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.75);

    display: flex;
    flex-direction: column;
  }

  #closeSeatsButton {
    margin-bottom: 1rem;
    align-self: flex-end;
    cursor: pointer;
    background: none;
    border: none;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  #seatsContainer {
    height: 300px;
    position: relative;
    display: block;
  }
  #seatsContainer > img {
    width: 100%;
  }
  #seatsContainer > .seat {
    position: absolute;
    border-radius: 1rem;
  }

  #seatsLegend {
    margin-top: 1.25rem;
    display: flex;
    justify-content: center;
    column-gap: 2rem;
  }
  #seatsLegend > div {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }
  #seatsLegend > div > .seat {
    width: 10px;
    height: 10px;
    border-radius: 1rem;
  }
  #seatsLegend > div > p {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
  }

  #performanceInfo {
    margin-top: 2.5rem;
    margin-bottom: 4rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.625rem;
  }
  #performanceInfo > .movieTitle {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  #performanceInfo > .performanceInfoRow {
    display: flex;
    column-gap: 0.5rem;
  }
  #performanceInfo > .performanceInfoRow > p {
    color: #e6e6e6;
    font-weight: 400;
    font-size: 0.875rem;
  }

  #buyTicketButton {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 0.5rem;

    padding: 0.625rem;
    border-radius: 0.375rem;
    background: rgba(232, 197, 71, 0.2);
    cursor: pointer;
  }
  #buyTicketButton > p {
    color: #e8c547;
  }
</style>
