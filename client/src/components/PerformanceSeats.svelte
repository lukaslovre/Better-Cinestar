<script>
  import Loading from "./Loading.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let performanceData;

  // Ovo biranje imena se moze drukcije vjv
  const cinemas = [
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

  function formatDate(dateString, time) {
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    };

    const date = new Date(dateString);
    const localeString = date.toLocaleDateString("hr-HR", options);
    const formattedDate = localeString.replace(/\s+/g, "").replace(/,/g, " ");

    return time + ", " + formattedDate;
  }
  function closeSeats() {
    dispatch("setPerformanceData", null);
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
    const seatDistance = (seats.seats[1].x - seats.seats[0].x) * seatLocationMultiplier;
    seatSize = Math.max(6, Math.min(Math.floor(seatDistance * 0.85), 15));

    const seatsHeight = seats.maxY * seatLocationMultiplier;
    seatsContainer.style.setProperty("height", 48 + seatsHeight + seatSize + "px");
  }

  // Api call
  let seatsPromise = getSeats();
  async function getSeats() {
    const origin = window.location.origin; // Za radenje API requesta
    const res = await fetch(
      `${origin}:3000/api/seating?cinemaOid=${performanceData.performance.cinemaOid}&performanceId=${performanceData.performance.id}`
    );
    const data = await res.json();

    if (res.ok) {
      setSeatingLayoutValues(data);
      return data;
    } else {
      throw new Error(data);
    }
  }
  $: {
    // Zove getSeats() svaki put kad se promjeni performanceData
    console.log(performanceData);
    seatsPromise = getSeats();
  }
</script>

<div class="backdrop">
  <div id="card">
    <img
      id="closeSeatsButton"
      src="/images/xIcon.svg"
      alt="close seats icon"
      on:click={closeSeats}
    />

    <div id="seatsContainer">
      {#await seatsPromise}
        <Loading />
      {:then seatsData}
        <img src="/images/cinemaScreen.svg" alt="screen" />
        {#each seatsData.seats as seat}
          <div
            class="seat"
            style:background-color={seat.stat === 4 ? "#80A6FF" : "#373B43"}
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
      <p class="movieTitle">{performanceData.movie.title}</p>
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

    <div id="buyTicketButton">
      <p>Kupi kartu na cinestar.hr</p>
      <img src="images/linkArrow.svg" alt="arrow" />
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
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
    margin: 2.5rem 0;
    display: flex;
    flex-direction: column;
    row-gap: 0.3125rem;
  }
  #performanceInfo > .movieTitle {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
    margin-bottom: 0.125rem;
  }
  #performanceInfo > .performanceInfoRow {
    display: flex;
    column-gap: 0.25rem;
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
