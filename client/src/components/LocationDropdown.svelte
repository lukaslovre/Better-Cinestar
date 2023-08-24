<script>
  const cinemaCities = [
    {
      city: "Zagreb",
      cinemas: [
        { cinemaOid: "10000000014OCPXCOG", cinemaName: "Branimir mingle mall" },
        { cinemaOid: "20000000014FEPADHG", cinemaName: "Avenue mall" },
        { cinemaOid: "37000000014FEPADHG", cinemaName: "Arena centar" },
        { cinemaOid: "B7000000014FEPADHG", cinemaName: "Z centar" },
        { cinemaOid: "87000000014FEPADHG", cinemaName: "Kaptol boutique" },
      ],
    },
    {
      city: "Split",
      cinemas: [
        { cinemaOid: "17000000014FEPADHG", cinemaName: "Joker centar" },
        { cinemaOid: "97000000014FEPADHG", cinemaName: "Mall of split" },
      ],
    },
    {
      city: "Dubrovnik",
      cinemas: [{ cinemaOid: "57000000014FEPADHG", cinemaName: "Dvori lapad" }],
    },
    {
      city: "Osijek",
      cinemas: [{ cinemaOid: "27000000014FEPADHG", cinemaName: "Portanova centar" }],
    },
    {
      city: "Pula",
      cinemas: [{ cinemaOid: "A7000000014FEPADHG", cinemaName: "Max city" }],
    },
    {
      city: "Rijeka",
      cinemas: [{ cinemaOid: "40000000014FEPADHG", cinemaName: "Tower centar" }],
    },
    {
      city: "Slavnoski Brod",
      cinemas: [{ cinemaOid: "67000000014FEPADHG", cinemaName: "City colosseum" }],
    },
    {
      city: "Varaždin",
      cinemas: [{ cinemaOid: "47000000014FEPADHG", cinemaName: "Lumini centar" }],
    },
    {
      city: "Vukovar",
      cinemas: [{ cinemaOid: "77000000014FEPADHG", cinemaName: "K centar golubica" }],
    },
    {
      city: "Zadar",
      cinemas: [{ cinemaOid: "D4000000014FEPADHG", cinemaName: "City galleria" }],
    },
    {
      city: "Šibenik",
      cinemas: [{ cinemaOid: "07000000014FEPADHG", cinemaName: "Dalmare centar" }],
    },
  ];

  let dropdownLevelOpen = 0;
  let dropdownLevelTwoOpen = null;
  let selectedCinemas = [];

  function toggleDropdownLevelOne() {
    if (dropdownLevelOpen === 0) {
      dropdownLevelOpen = 1;
    } else {
      dropdownLevelOpen = 0;
    }
  }

  function toggleDropdownLevelTwo(city) {
    if (
      dropdownLevelOpen === 1 ||
      (dropdownLevelOpen === 2 && dropdownLevelTwoOpen !== city)
    ) {
      dropdownLevelOpen = 2;
      dropdownLevelTwoOpen = city;
    } else {
      dropdownLevelOpen = 1;
    }
  }

  function toggleCinemaSelection(cinemaOid) {
    if (selectedCinemas.includes(cinemaOid)) {
      selectedCinemas = selectedCinemas.filter((cinema) => cinema !== cinemaOid);
    } else {
      selectedCinemas = [...selectedCinemas, cinemaOid];
    }
  }
</script>

<div class="input-container">
  <!-- Label -->
  <div class="label">
    <img class="label-icon" src="/images/locationIcon.svg" alt="location icon" />
    <p class="label-text">Lokacija kina</p>
  </div>

  <!-- Dropdown element -->
  <div
    class="dropdown-element primary-color-scheme"
    class:fadeout-1-input={dropdownLevelOpen === 1}
    class:fadeout-2-input={dropdownLevelOpen === 2}
    on:click={toggleDropdownLevelOne}
  >
    <p class="selectedValue">Zagreb</p>
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
  </div>

  <!-- Dropdown options -->
  <div class="dropdown-options-container">
    <div
      class="dropdown-options primary-color-scheme"
      class:fadeout-1-input={dropdownLevelOpen === 2}
      style:display={dropdownLevelOpen >= 1 ? "flex" : "none"}
    >
      {#each cinemaCities as city}
        {#if city.cinemas.length > 1}
          <div
            class="option"
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
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
        {:else}
          <div
            class="option"
            class:selected-option={selectedCinemas.includes(city.cinemas[0].cinemaOid)}
            on:click={() => {
              toggleCinemaSelection(city.cinemas[0].cinemaOid);
            }}
          >
            <p>{city.city}</p>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Dropdown sub-options -->
    {#each cinemaCities as city}
      {#if city.cinemas.length > 1}
        <div
          class="dropdown-options primary-color-scheme dropdown-suboptions"
          style:display={dropdownLevelOpen >= 2 && dropdownLevelTwoOpen === city.city
            ? "flex"
            : "none"}
        >
          {#each city.cinemas as cinema}
            <div
              class="option"
              class:selected-option={selectedCinemas.includes(cinema.cinemaOid)}
              on:click={() => {
                toggleCinemaSelection(cinema.cinemaOid);
              }}
            >
              <p>{cinema.cinemaName}</p>
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
</style>
