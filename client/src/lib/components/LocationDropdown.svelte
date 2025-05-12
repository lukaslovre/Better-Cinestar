<script>
  import { cinemaOids } from '$lib/stores/userSelection.svelte';
  import { createEventDispatcher } from 'svelte';
  import { cinemas as cinemasData } from '$lib/utils/cinemas';

  const dispatch = createEventDispatcher();

  const cinemaCities = [
    {
      city: 'Zagreb',
      cinemas: [
        { cinemaOid: '10000000014OCPXCOG', cinemaName: 'Branimir mingle mall' },
        { cinemaOid: '20000000014FEPADHG', cinemaName: 'Avenue mall' },
        { cinemaOid: '37000000014FEPADHG', cinemaName: 'Arena centar' },
        { cinemaOid: 'B7000000014FEPADHG', cinemaName: 'Z centar' },
        { cinemaOid: '87000000014FEPADHG', cinemaName: 'Kaptol boutique' }
      ]
    },
    {
      city: 'Split',
      cinemas: [
        { cinemaOid: '17000000014FEPADHG', cinemaName: 'Joker centar' },
        { cinemaOid: '97000000014FEPADHG', cinemaName: 'Mall of split' }
      ]
    },
    {
      city: 'Dubrovnik',
      cinemas: [{ cinemaOid: '57000000014FEPADHG', cinemaName: 'Dvori lapad' }]
    },
    {
      city: 'Osijek',
      cinemas: [{ cinemaOid: '27000000014FEPADHG', cinemaName: 'Portanova centar' }]
    },
    {
      city: 'Pula',
      cinemas: [{ cinemaOid: 'A7000000014FEPADHG', cinemaName: 'Max city' }]
    },
    {
      city: 'Rijeka',
      cinemas: [{ cinemaOid: '40000000014FEPADHG', cinemaName: 'Tower centar' }]
    },
    {
      city: 'Slavonski Brod',
      cinemas: [{ cinemaOid: '67000000014FEPADHG', cinemaName: 'City colosseum' }]
    },
    {
      city: 'Varaždin',
      cinemas: [{ cinemaOid: '47000000014FEPADHG', cinemaName: 'Lumini centar' }]
    },
    {
      city: 'Vukovar',
      cinemas: [{ cinemaOid: '77000000014FEPADHG', cinemaName: 'K centar golubica' }]
    },
    {
      city: 'Zadar',
      cinemas: [{ cinemaOid: 'D4000000014FEPADHG', cinemaName: 'City galleria' }]
    },
    {
      city: 'Šibenik',
      cinemas: [{ cinemaOid: '07000000014FEPADHG', cinemaName: 'Dalmare centar' }]
    }
  ];

  export let locationDropdownOpen;

  $: selectedCinemasForDisplay = $cinemaOids.map(
    (cinemaOid) =>
      cinemasData
        .find((cinema) => cinema.cinemaOid === cinemaOid)
        .cinemaName.split(' ')[0]
  );

  // Kad se zatvori dropdown, ako je odabrano vise kina i prvi put su na stranici, pokazati help popup
  $: {
    if (locationDropdownOpen.level === 0) {
      if ($cinemaOids.length > 1 && !localStorage.getItem('visitedWebsiteBefore')) {
        dispatch('showPerformanceInfoPopup', true);
      }
    }
  }

  function toggleDropdownLevelOne() {
    locationDropdownOpen.level = locationDropdownOpen.level === 0 ? 1 : 0;
  }
  function toggleDropdownLevelTwo(city) {
    const shouldOpen =
      locationDropdownOpen.level === 1 || locationDropdownOpen.selectedCity !== city;

    locationDropdownOpen.level = shouldOpen ? 2 : 1;

    if (shouldOpen) {
      locationDropdownOpen.selectedCity = city;
    }
  }
  function toggleCinemaSelection(cinemaOid) {
    const cinemaAlreadySelected = $cinemaOids.includes(cinemaOid);

    $cinemaOids = cinemaAlreadySelected
      ? $cinemaOids.filter((cinema) => cinema !== cinemaOid)
      : [...$cinemaOids, cinemaOid];
  }
  function checkIfSuboptionSelected(city, selectedOids) {
    return city.cinemas.some((cinema) => selectedOids.includes(cinema.cinemaOid));
  }
</script>

<div class="input-container">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/locationIcon.svg" alt="location icon" />
    <p class="label-text">Lokacija kina</p>
  </div>

  <!-- Dropdown element -->
  <button
    type="button"
    class="dropdown-element primary-color-scheme"
    class:fadeout-1-input={locationDropdownOpen.level === 1}
    class:fadeout-2-input={locationDropdownOpen.level === 2}
    on:click={toggleDropdownLevelOne}
  >
    <p class="selectedValue">{selectedCinemasForDisplay.join(', ') || 'Odaberi kino'}</p>
    <svg
      class="fill"
      width="10"
      height="9"
      viewBox="0 0 10 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.64952 7.875C5.36084 8.375 4.63916 8.375 4.35048 7.875L0.453368 1.125C0.164693 0.624999 0.525536 -9.15707e-07 1.10289 -8.65233e-07L8.89712 -1.8384e-07C9.47447 -1.33367e-07 9.83531 0.625 9.54663 1.125L5.64952 7.875Z"
        fill="#8F95A3"
      />
    </svg>
  </button>

  <!-- Dropdown options -->
  <div class="dropdown-options-container">
    <div
      class="dropdown-options primary-color-scheme"
      class:fadeout-1-input={locationDropdownOpen.level === 2}
      style:display={locationDropdownOpen.level >= 1 ? 'flex' : 'none'}
    >
      {#each cinemaCities as city}
        {#if city.cinemas.length > 1}
          <button
            type="button"
            class="expandable-option"
            on:click={() => {
              toggleDropdownLevelTwo(city.city);
            }}
          >
            <p>{city.city}</p>
            <svg
              class="stroke"
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5.38848 5.82733C5.73523 6.20875 5.73523 6.79125 5.38848 7.17267L1 12"
                stroke="#454954"
                style:stroke={checkIfSuboptionSelected(city, $cinemaOids)
                  ? '#FFCC00'
                  : ''}
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        {:else}
          <button
            type="button"
            class="option"
            class:selected={$cinemaOids.includes(city.cinemas[0].cinemaOid)}
            on:click={() => {
              toggleCinemaSelection(city.cinemas[0].cinemaOid);
            }}
          >
            <div class="checkbox">
              <img
                src={locationDropdownOpen.level === 2
                  ? 'images/check-fadeout1.svg'
                  : 'images/check.svg'}
                alt="check icon"
              />
            </div>
            <p>{city.city}</p>
          </button>
        {/if}
      {/each}
    </div>

    <!-- Dropdown sub-options -->
    {#each cinemaCities as city}
      {#if city.cinemas.length > 1}
        <div
          class="dropdown-options primary-color-scheme dropdown-suboptions"
          style:display={locationDropdownOpen.level == 2 &&
          locationDropdownOpen.selectedCity === city.city
            ? 'flex'
            : 'none'}
        >
          {#each city.cinemas as cinema}
            <button
              type="button"
              class="option"
              class:selected={$cinemaOids.includes(cinema.cinemaOid)}
              on:click={() => {
                toggleCinemaSelection(cinema.cinemaOid);
              }}
            >
              <div class="checkbox">
                <img src="images/check.svg" alt="check icon" />
              </div>
              <p>{cinema.cinemaName}</p>
            </button>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .input-container {
    max-width: 100%;
  }
  .dropdown-element {
    max-width: 75%;
    width: auto;
  }
  .dropdown-element > .selectedValue {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
