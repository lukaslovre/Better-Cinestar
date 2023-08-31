<script>
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
    console.log(date);
    const localeString = date.toLocaleDateString("hr-HR", options);
    console.log(localeString);
    const formattedDate = localeString.replace(/\s+/g, "").replace(/,/g, " ");

    return time + ", " + formattedDate;
  }

  function closeSeats() {
    dispatch("setPerformanceData", null);
  }

  // Api call
  let seatsPromise = getSeats();
  async function getSeats() {
    const hostname = window.location.hostname; // Za radenje API requesta
    const res = await fetch(
      `http://${hostname}:3000/api/seating?cinemaOid=${performanceData.performance.cinemaOid}&performanceId=${performanceData.performance.id}`
    );
    const data = await res.json();

    if (res.ok) {
      console.log(data);
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
        <p>Waiting...</p>
      {:then seatsData}
        <img src="/images/cinemaScreen.svg" alt="screen" />
        {#each seatsData.seats as seat}
          <div
            class="seat"
            style:background-color={seat.stat === 4 ? "#80A6FF" : "#373B43"}
            style:left={seat.x * 2.5 + "px"}
            style:top={48 + seat.y * 2.5 + "px"}
          />
        {/each}
      {/await}
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

    padding: 2rem;
    border-radius: 0.5rem;
    background: #131a2a;
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.75);

    display: flex;
    flex-direction: column;
    row-gap: 2.25rem;
  }

  #closeSeatsButton {
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
    width: 9px;
    height: 9px;
    border-radius: 1rem;
  }

  #performanceInfo {
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
