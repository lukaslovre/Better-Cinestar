<script>
  import Loading from "./Loading.svelte";
  import { createEventDispatcher } from "svelte";
  import { cinemas } from "../utils/cinemas";
  import { getAverageSeatDistance } from "../utils/performanceSeats";
  import { getRelativeDate } from "../utils/utils";

  export let performanceData;

  const dispatch = createEventDispatcher();
  const origin = window.location.origin; // Za radenje API requesta

  let showSeatTypes = true;
  let seatsPromise = getSeats();
  let seatingAreas = [];
  let invalidskoPostoji = false;

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
      console.log(data);
      seatingAreas = data.seatingAreas;

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

    seatLocationMultiplier = (containerWidth * 0.9) / furthestSeat;
    seatOffsetX = containerWidth * 0.05;

    const seatDistance = getAverageSeatDistance(seats) * seatLocationMultiplier;
    seatSize = Math.max(6, Math.min(Math.floor(seatDistance * 0.85), 18));

    const seatsHeight = seats.maxY * seatLocationMultiplier + seatSize;

    seatsContainer.style.setProperty("height", 64 + seatsHeight + "px");
  }

  function getSeatColor(seat, useColors) {
    // Ako je slobodno (128 je u splitu slobodno??? nez)
    if ([4, 256, 260, 128].includes(seat.stat)) {
      // Ako se ne koriste boje, sve su plave
      if (useColors === false || useColors === undefined) return "#80A6FF";

      // Ako se koriste boje, onda se gleda tip sjedala
      const name = seatingAreas.find((area) => area.id === seat.sar).name;

      if (["Boutique", "VIP Relax", "VIP"].includes(name)) return "#DFDF9F";
      else if (name === "Royal bed") return "#EA80FF";
      else if (name === "Lovebox") return "#FF8080";
      else if (name === "Regular") {
        // Ako je invalidsko
        if ([163, 193].includes(seat.sg)) {
          if (invalidskoPostoji === false) invalidskoPostoji = true;
          return "#A1DF9F";
        } else return "#80A6FF";
      }
    } else {
      // Ako je zauzeto
      return "#373B43";
    }
  }

  // Utils
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
</script>

<div id="card">
  <button
    id="closeSeatsButton"
    on:click={() => {
      dispatch("selectedPerformance", null);
    }}
  >
    <img src="/images/xIcon.svg" alt="close seats icon" />
  </button>

  <div id="seatsContainer">
    {#await seatsPromise}
      <Loading />
    {:then seatsData}
      <img src="/images/cinemaScreen.svg" alt="screen" id="screenImage" />
      {#each seatsData.seats as seat}
        <div
          class="seat"
          style:background-color={getSeatColor(seat, showSeatTypes)}
          style:left={seatOffsetX + seat.x * seatLocationMultiplier + "px"}
          style:top={64 + seat.y * seatLocationMultiplier + "px"}
          style:width={seatSize + "px"}
          style:height={seatSize + "px"}
        />
      {/each}
    {/await}
  </div>

  <div class="seatsLegend">
    {#if showSeatTypes === false}
      <div>
        <div class="seat" style:background-color="#80A6FF" />
        <p>Slobodno</p>
      </div>

      <div>
        <div class="seat" style:background-color="#373B43" />
        <p>Zauzeto</p>
      </div>
    {:else}
      {#each seatingAreas as area}
        <div>
          <div
            class="seat"
            style:background-color={getSeatColor(
              { sar: area.id, stat: 4 },
              showSeatTypes
            )}
          />
          <p>{area.name}</p>
        </div>
      {/each}

      {#if invalidskoPostoji}
        <div>
          <div
            class="seat"
            style:background-color={showSeatTypes ? "#A1DF9F" : "#80A6FF"}
          />
          <p>Invalidsko</p>
        </div>
      {/if}

      <div>
        <div class="seat" style:background-color="#373B43" />
        <p>Zauzeto</p>
      </div>
    {/if}
  </div>

  <!-- {#if showSeatTypes}
    <div class="seatsLegend typesLegend">
      {#each seatingAreas as area}
        <div>
          <div
            class="seat"
            style:background-color={getSeatColor(
              { sar: area.id, stat: 4 },
              showSeatTypes
            )}
          />
          <p>{area.name}</p>
        </div>
      {/each}

      {#if invalidskoPostoji}
        <div>
          <div
            class="seat"
            style:background-color={showSeatTypes ? "#A1DF9F" : "#80A6FF"}
          />
          <p>Invalidsko</p>
        </div>
      {/if}
    </div>
  {/if} -->

  <div class="seatTypesSwitchContainer">
    <label for="seatTypesSwitch">Prikaži vrste sjedala</label>
    <input type="checkbox" id="seatTypesSwitch" bind:checked={showSeatTypes} />
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

<style>
  #card {
    position: fixed;
    top: 0;
    width: 100%;
    max-width: 30rem;
    height: 100%;
    overflow-y: auto;
    background-color: #131a2a;
    z-index: 5;

    padding: 2rem 1rem;
    background: #131a2a;

    display: flex;
    flex-direction: column;
  }
  #card > * {
    flex-shrink: 0;
  }

  #closeSeatsButton {
    margin-bottom: 3rem;
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

    transition: background-color 0.2s;
  }

  .seatsLegend {
    margin-top: 2.5rem;
    display: flex;
    justify-content: center;
    column-gap: 2rem;
    row-gap: 0.5rem;
    flex-wrap: wrap;
  }
  .seatsLegend.typesLegend {
    margin-top: 1.5rem;
  }
  .seatsLegend > div {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }
  .seatsLegend > div > .seat {
    width: 10px;
    height: 10px;
    border-radius: 1rem;
    flex-shrink: 0;
  }
  .seatsLegend > div > p {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
  }

  .seatTypesSwitchContainer {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .seatTypesSwitchContainer label {
    color: #bfbfbf;
    font-weight: 500;
    font-size: 0.875rem;
  }
  .seatTypesSwitchContainer input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    width: 4rem;
    height: 2rem;
    background: #60729f;
    border-radius: 2rem;
    position: relative;

    transition: background-color 0.2s;

    outline: none;
    cursor: pointer;
  }
  .seatTypesSwitchContainer input:checked {
    background: #2057df;
  }

  .seatTypesSwitchContainer input::before {
    content: "";
    position: absolute;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background-color: #e9eefc;
    border: 1px solid rgba(0, 0, 0, 0.2);
    top: 50%;
    left: 0.25rem; /* (2rem - 1.5rem) / 2 */
    transform: translateY(-50%);

    transition: left 0.2s ease-out;
  }
  .seatTypesSwitchContainer input:checked::before {
    left: calc(100% - 1.75rem);
  }

  #performanceInfo {
    margin-top: 5rem;
    margin-bottom: 5rem;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  #performanceInfo > .movieTitle {
    color: #ffffff;
    font-weight: 400;
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  #performanceInfo > .performanceInfoRow {
    display: flex;
    column-gap: 0.75rem;
  }
  #performanceInfo > .performanceInfoRow > p {
    color: #e6e6e6;
    font-weight: 400;
    font-size: 1rem;
  }

  #buyTicketButton {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 1rem;

    padding: 0.75rem;
    border-radius: 0.375rem;
    background: rgba(232, 197, 71, 0.1);
    cursor: pointer;
  }
  #buyTicketButton > p {
    color: #e8c547;
  }
  #buyTicketButton:hover > p {
    text-decoration: underline;
  }
</style>
