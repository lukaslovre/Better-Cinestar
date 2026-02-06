<script lang="ts">
  import Loading from './Loading.svelte';
  import { cinemas } from '../utils/cinemas';
  import { getAverageHorizontalSeatDistance } from '../utils/performanceSeats';
  import { getRelativeDate } from '../utils/utils';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { getSeatColor as getSeatColorUtil } from '../utils/seatingColors';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  interface PerformanceData {
    movie: Movie;
    performance: MoviePerformance;
  }

  let { performanceData, onclose } = $props<{
    performanceData: PerformanceData;
    onclose: () => void;
  }>();

  let seatingAreas: SeatingArea[] = $state([]);
  let invalidskoPostoji = $state(false);

  // Layout state
  let seatLocationMultiplier = 2.5;
  let seatOffsetX = 0;
  let seatSize = 9;
  let seatsContainerHeight = $state('auto');
  let seatsContainerElement: HTMLElement | undefined = $state();

  async function getSeats() {
    const { cinemaOid, id: performanceId } = performanceData.performance;

    const urlParams = new URLSearchParams();
    urlParams.append('cinemaOid', cinemaOid!);
    urlParams.append('performanceId', performanceId);

    const getSeatingUrl = `${PUBLIC_API_URL}/api/seating`;

    const res = await fetch(`${getSeatingUrl}?${urlParams.toString()}`);

    if (!res.ok) {
      let message = `Failed to load seating (${res.status})`;
      try {
        const maybeJson = await res.json();
        if (maybeJson?.message) message = maybeJson.message;
      } catch {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }

    const data: SeatingLayout = await res.json();
    seatingAreas = data.seatingAreas;

    // Check if any seat is "invalidsko" (accessible seating)
    invalidskoPostoji = data.seats.some((seat) => {
      const { invalidskoFound } = getSeatColorUtil(seat as any, seatingAreas, true);
      return invalidskoFound;
    });

    setSeatingLayoutValues(data);
    return data;
  }

  let seatsPromise = $state(getSeats());

  function setSeatingLayoutValues(seats: SeatingLayout) {
    if (!seatsContainerElement) {
      console.error('Seats container not found in Seating.svelte');
      return;
    }

    const containerWidth = seatsContainerElement.clientWidth - 10;

    const furthestSeat = seats.maxX;

    seatLocationMultiplier = (containerWidth * 0.9) / furthestSeat;
    seatOffsetX = containerWidth * 0.05;

    const seatDistance =
      getAverageHorizontalSeatDistance(seats.seats) * seatLocationMultiplier;
    seatSize = Math.max(6, Math.min(Math.floor(seatDistance * 0.85), 18));

    const seatsHeight = seats.maxY * seatLocationMultiplier + seatSize;

    seatsContainerHeight = 64 + seatsHeight + 'px';
  }

  function getSeatColorForSeat(seat: any) {
    const { color } = getSeatColorUtil(seat as Seat, seatingAreas, true);
    return color;
  }

  function formatDate(dateString: string, time: string) {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    };

    const date = new Date(dateString);
    const localeString = date.toLocaleDateString('hr-HR', options);
    const formattedDate = localeString.replace(/\s+/g, '').replace(/,/g, ' ');

    const relativeDate = getRelativeDate(date, time);

    return time + ', ' + formattedDate + ' (' + relativeDate + ')';
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
</script>

<div id="backdrop" onclick={onclose} role="presentation">
  <div
    id="card"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
    in:fly={{
      y: isMobile ? 200 : 20,
      duration: 300,
      easing: cubicOut,
      opacity: 0
    }}
    out:fly={{
      y: isMobile ? 200 : 20,
      duration: 200,
      easing: cubicOut,
      opacity: 0
    }}
  >
    <button id="closeSeatsButton" onclick={onclose}>
      <img src="/images/xIcon.svg" alt="close seats icon" />
    </button>

    <div id="performanceInfo">
      <p class="movieTitle">
        {performanceData.movie.title}
        {#if performanceData.movie.ageRating && performanceData.movie.ageRating !== '0'}
          ({performanceData.movie.ageRating}+)
        {/if}
      </p>
      <div class="performanceInfoRow">
        <img src="/images/clockIcon.svg" alt="clock icon" />
        <p>
          {formatDate(
            performanceData.performance.cinemaDate!,
            performanceData.performance.performanceTime
          )}
        </p>
      </div>
      <div class="performanceInfoRow">
        <img src="/images/locationIcon2.svg" alt="location icon" />
        <p>
          {cinemas.find(
            (cinema) => cinema.cinemaOid === performanceData.performance.cinemaOid
          )?.cinemaName || 'N/A'}
        </p>
      </div>
      <div class="performanceInfoRow">
        <img src="/images/clapperIcon.svg" alt="clapper icon" />
        <p>{performanceData.performance.performanceFeatures?.join(' · ')}</p>
      </div>
    </div>

    <div
      id="seatsContainer"
      bind:this={seatsContainerElement}
      style:height={seatsContainerHeight}
    >
      {#await seatsPromise}
        <Loading />
      {:then seatsData}
        <img src="/images/cinemaScreen.svg" alt="screen" id="screenImage" />
        {#each seatsData.seats as seat}
          <div
            class="seat"
            style:background-color={getSeatColorForSeat(seat)}
            style:left={seatOffsetX + seat.x * seatLocationMultiplier + 'px'}
            style:top={64 + seat.y * seatLocationMultiplier + 'px'}
            style:width={seatSize + 'px'}
            style:height={seatSize + 'px'}
          ></div>
        {/each}
      {:catch error}
        <div class="seatingError">
          <p class="seatingErrorTitle">Seating temporarily unavailable</p>
          <p class="seatingErrorBody">{error?.message ?? 'Please try again.'}</p>
          <button
            class="seatingRetryButton"
            onclick={() => {
              seatsPromise = getSeats();
            }}
          >
            Try again
          </button>
        </div>
      {/await}
    </div>

    <div class="seatsLegend">
      {#each seatingAreas as area}
        <div>
          <div
            class="seat"
            style:background-color={getSeatColorForSeat({
              sar: area.id,
              stat: 4
            })}
          ></div>
          <p>{area.name}</p>
        </div>
      {/each}

      {#if invalidskoPostoji}
        <div>
          <div class="seat" style:background-color="#A1DF9F"></div>
          <p>Invalidsko</p>
        </div>
      {/if}

      <div>
        <div class="seat" style:background-color="#373B43"></div>
        <p>Zauzeto</p>
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
  #backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  #card {
    width: 100%;
    max-width: 32rem;
    max-height: 90dvh;
    background-color: #131a2a;
    border-radius: 1rem;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  #card > * {
    flex-shrink: 0;
  }

  #closeSeatsButton {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;

    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: background 0.2s;
  }
  #closeSeatsButton:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  #performanceInfo {
    margin-bottom: 2.5rem;
    padding-right: 3rem; /* Space for close button */
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  #performanceInfo > .movieTitle {
    color: #ffffff;
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  #performanceInfo > .performanceInfoRow {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
  }
  #performanceInfo > .performanceInfoRow > img {
    width: 1rem;
    height: 1rem;
    opacity: 0.7;
  }
  #performanceInfo > .performanceInfoRow > p {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
  }

  #seatsContainer {
    position: relative;
    display: block;
    margin-bottom: 2rem;
  }

  .seatingError {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem;
    text-align: center;
  }
  .seatingErrorTitle {
    color: #ffffff;
    font-weight: 600;
    font-size: 1rem;
  }
  .seatingErrorBody {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
    max-width: 22rem;
  }
  .seatingRetryButton {
    margin-top: 0.75rem;
    background: #2057df;
    color: #ffffff;
    border: none;
    border-radius: 0.75rem;
    padding: 0.6rem 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
  .seatingRetryButton:hover {
    filter: brightness(1.05);
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
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: center;
    column-gap: 1.5rem;
    row-gap: 0.75rem;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.025);
    box-shadow: 0 0.25rem 1rem 0 rgba(0, 0, 0, 0.1);
    padding: 1rem;
    border-radius: 0.5rem;
  }
  .seatsLegend > div {
    display: flex;
    align-items: center;
    column-gap: 0.35rem;
  }
  .seatsLegend > div > .seat {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .seatsLegend > div > p {
    color: #bfbfbf;
    font-weight: 400;
    font-size: 0.875rem;
  }

  #buyTicketButton {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 1rem;

    padding: 1rem;
    border-radius: 0.5rem;
    background: #e8c547;
    cursor: pointer;
    transition: transform 0.1s;
    margin-top: auto;
  }
  #buyTicketButton:active {
    transform: scale(0.98);
  }
  #buyTicketButton > p {
    color: #131a2a;
    font-weight: 700;
  }
  #buyTicketButton > img {
    filter: brightness(0); /* Make arrow black */
  }

  @media (max-width: 640px) {
    #backdrop {
      padding: 0;
      align-items: flex-end;
    }
    #card {
      max-height: 95dvh;
      border-radius: 1.5rem 1.5rem 0 0;
      padding: 1.5rem 1rem 3rem 1rem;
    }
    #closeSeatsButton {
      top: 1rem;
      right: 1rem;
    }
  }
</style>
