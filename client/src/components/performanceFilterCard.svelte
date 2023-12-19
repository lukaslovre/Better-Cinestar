<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let displayComponent;
  export let performances;

  const selectedPerformanceFilters = {
    videoFeatures: [],
    audioFeatures: [],
    roomFeatures: [],
    timeFrom: "00:00",
    timeTo: "24:00",
  };

  const unfilteredAvailablePerformanceFeatures =
    getGroupedPerformanceFeaturesFrom(performances);

  $: availablePerformanceFeatures = getFilteredPerformanceFeaturesForDisplay(
    performances,
    selectedPerformanceFilters
  );

  function getUniquePerformanceFeaturesFrom(performances) {
    return (
      performances
        .map((performance) => performance.performanceFeatures)
        // check for every performanceFeatures array if it contains IMAX, 4DX or GOLD, if not push BASIC to the array
        .map((performanceFeatures) => {
          if (
            !performanceFeatures.includes("IMAX") &&
            !performanceFeatures.includes("4DX") &&
            !performanceFeatures.includes("GOLD")
          ) {
            return [...performanceFeatures, "BASIC"];
          } else {
            return performanceFeatures;
          }
        })
        .flat()
        .filter((value, index, self) => self.indexOf(value) === index)
    );
  }

  function getGroupedPerformanceFeaturesFrom(performances) {
    const uniquePerformanceFeatures = getUniquePerformanceFeaturesFrom(performances);

    const groupedPerformanceFeatures = {
      videoFeatures: uniquePerformanceFeatures.filter(
        (feature) => feature === "2D" || feature === "3D"
      ),
      roomFeatures: uniquePerformanceFeatures.filter(
        (feature) =>
          feature === "4DX" ||
          feature === "IMAX" ||
          feature === "GOLD" ||
          feature === "BASIC"
      ),
      audioFeatures: uniquePerformanceFeatures.filter(
        (feature) => feature === "TITL" || feature === "SINK" || feature === "OV"
      ),
    };

    // sort the features alphabetically
    Object.keys(groupedPerformanceFeatures).forEach((featureType) => {
      groupedPerformanceFeatures[featureType].sort((a, b) => a.localeCompare(b));
    });

    return groupedPerformanceFeatures;
  }

  function getFilteredPerformanceFeaturesForDisplay(
    performances,
    selectedPerformanceFilters
  ) {
    const groupedPerformanceFeatures = getGroupedPerformanceFeaturesFrom(performances);

    if (!selectedPerformanceFilters) return groupedPerformanceFeatures;

    // Ako je odabran neki stupac, onda se prikazuju svi checkboxovi iz tog stupca
    // ( Da se moze vise odjednom odabrati )
    Object.keys(groupedPerformanceFeatures).forEach((featureType) => {
      if (selectedPerformanceFilters[featureType].length > 0) {
        groupedPerformanceFeatures[featureType] = [
          ...unfilteredAvailablePerformanceFeatures[featureType],
        ];
      }
    });

    return groupedPerformanceFeatures;
  }

  // gets triggered on checkbox click
  function toggleOption(event) {
    const option = event.target.closest(".option");
    if (!option) return;

    if (option.classList.contains("disabled")) return;

    const optionText = option.innerText;
    const featureType = option.closest(".column").id;

    if (option.classList.contains("selected")) {
      option.classList.remove("selected");
      selectedPerformanceFilters[featureType] = selectedPerformanceFilters[
        featureType
      ].filter((item) => item !== optionText);
    } else {
      option.classList.add("selected");
      selectedPerformanceFilters[featureType].push(optionText);
    }

    dispatch("setSelectedPerformanceFilters", selectedPerformanceFilters);
  }

  // time input functions
  function selectInputValue(event) {
    const input = event.target;
    input.select();
  }
  function parseInputWhileTyping(event) {
    const input = event.target;
    const inputValue = input.value;

    // check if the user is using the backspace key
    if (event.inputType === "deleteContentBackward") {
      return;
    }

    // remove all non-numeric characters from the input value, except for the colon
    const cleanedInputValue = inputValue.replace(/[^\d:]/g, "");
    if (cleanedInputValue !== inputValue) {
      input.value = cleanedInputValue;
      return;
    }

    if (inputValue.length === 2) {
      // if the current input value is larger than 24, add a colon after the first digit
      if (inputValue > 24) {
        input.value = `${inputValue[0]}:${inputValue[1]}`;
      } else {
        input.value = `${inputValue}:`;
      }
    }

    // allow only 2 digits before/after the colon
    if (
      inputValue.includes(":") &&
      (inputValue.split(":")[1].length > 2 || inputValue.split(":")[0].length > 2)
    ) {
      const hoursMaxTwoDigits = inputValue.split(":")[0].slice(0, 2);
      const minutesMaxTwoDigits = inputValue.split(":")[1].slice(0, 2);

      input.value = `${hoursMaxTwoDigits}:${minutesMaxTwoDigits}`;
    }
  }
  function checkIfValidTime(event) {
    const input = event.target;
    const defaultValue = input.id === "performanceTimeFromInput" ? "00:00" : "24:00";

    const previousValue =
      selectedPerformanceFilters[
        input.id === "performanceTimeFromInput" ? "timeFrom" : "timeTo"
      ];

    // if the input value is empty, set it to default
    if (input.value === "") {
      input.value = defaultValue;

      selectedPerformanceFilters[
        input.id === "performanceTimeFromInput" ? "timeFrom" : "timeTo"
      ] = input.value;

      dispatch("setSelectedPerformanceFilters", selectedPerformanceFilters);

      return;
    }

    // pad the input value with zeros if it's missing any digits
    if (input.value.length === 1) {
      input.value = `0${input.value}:00`;
    } else if (input.value.length >= 3) {
      const hours = input.value.split(":")[0];
      const minutes = input.value.split(":")[1];
      input.value = `${hours.padStart(2, "0")}:${minutes.padEnd(2, "0")}`;
    }

    // if the first two digits are larger than 23 or the last two digits are larger than 59,
    // set the input value to previous
    if (input.value.split(":")[0] > 23 || input.value.split(":")[1] > 59) {
      console.log("greška", input.value);
      input.value = previousValue;
      return;
    }

    selectedPerformanceFilters[
      input.id === "performanceTimeFromInput" ? "timeFrom" : "timeTo"
    ] = input.value;

    dispatch("setSelectedPerformanceFilters", selectedPerformanceFilters);
  }

  function unfocusInput(event) {
    if (event.key === "Enter") {
      const input = event.target;
      input.blur();
    }
  }
</script>

<div id="performanceFilterCard" on:click={toggleOption} style:display={displayComponent}>
  <div class="column" id="videoFeatures">
    <div class="label">Slika</div>
    <div class="checkboxesColumn">
      {#each unfilteredAvailablePerformanceFeatures.videoFeatures as videoFeature}
        {#if availablePerformanceFeatures.videoFeatures.includes(videoFeature)}
          <div class="option">{videoFeature}</div>
        {:else}
          <div class="option disabled">{videoFeature}</div>
        {/if}
      {/each}
      <div class="option selected" style="display: none;"></div>
    </div>
  </div>

  <div class="column" id="roomFeatures">
    <div class="label">Dvorana</div>
    <div class="checkboxesColumn">
      {#each unfilteredAvailablePerformanceFeatures.roomFeatures as roomFeature}
        {#if availablePerformanceFeatures.roomFeatures.includes(roomFeature)}
          <div class="option">{roomFeature}</div>
        {:else}
          <div class="option disabled">{roomFeature}</div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="column" id="audioFeatures">
    <div class="label">Zvuk</div>
    <div class="checkboxesColumn">
      {#each unfilteredAvailablePerformanceFeatures.audioFeatures as audioFeature}
        {#if availablePerformanceFeatures.audioFeatures.includes(audioFeature)}
          <div class="option">{audioFeature}</div>
        {:else}
          <div class="option disabled">{audioFeature}</div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="column">
    <div class="label">Vrijeme</div>
    <div class="inputsColumn">
      <div class="inputContainer">
        od
        <input
          type="text"
          id="performanceTimeFromInput"
          on:focus={selectInputValue}
          on:input={parseInputWhileTyping}
          on:keydown={unfocusInput}
          on:blur={checkIfValidTime}
          value="00:00"
          inputmode="numeric"
        />
      </div>
      <div class="inputContainer">
        do
        <input
          type="text"
          id="performanceTimeToInput"
          on:focus={selectInputValue}
          on:input={parseInputWhileTyping}
          on:keydown={unfocusInput}
          on:blur={checkIfValidTime}
          value="24:00"
          inputmode="numeric"
        />
      </div>
    </div>
  </div>
</div>

<style>
  #performanceFilterCard {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 0.25rem;
    background: #202b46;

    margin-bottom: 1rem;
  }
  #performanceFilterCard .column {
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
  }
  #performanceFilterCard .column .label {
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
  }
  #performanceFilterCard .column .checkboxesColumn,
  #performanceFilterCard .column .inputsColumn {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 0.5rem;
  }

  #performanceFilterCard .column .checkboxesColumn .option {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 0.75rem;

    color: #b9bdc6;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  #performanceFilterCard .column .checkboxesColumn .option.selected {
    color: #e8c547;
  }
  #performanceFilterCard .column .checkboxesColumn .option.disabled {
    color: hsl(222, 10%, 40%);
  }

  #performanceFilterCard .column .checkboxesColumn .option::before {
    content: "";
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.125rem solid;
    border-radius: 0.125rem;
  }
  #performanceFilterCard .column .checkboxesColumn .option.selected::before {
    border-color: #e8c547;
    background:
      url(/images/check.svg) no-repeat center / contain,
      #e8c547;
  }
  #performanceFilterCard .column .inputsColumn .inputContainer {
    display: flex;
    flex-direction: row;
    align-items: flex-end;

    padding: 0.5rem 0.75rem;
    background-color: #1d2435;
    color: #767d8f;
    font-size: 0.6875rem;
    font-weight: 500;
  }

  #performanceFilterCard .column .inputsColumn input {
    max-width: 3.5rem;
    padding-left: 0.375rem;
    background-color: #1d2435;
    border: none;
    outline: none;

    color: #b9bdc6;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
</style>
