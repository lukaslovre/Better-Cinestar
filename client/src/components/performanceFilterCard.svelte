<script>
  import { createEventDispatcher } from "svelte";

  import {
    filterPerformances,
    getGroupedPerformanceFeaturesFrom,
    getPossibleFeaturesWithAppliedFilters,
    countFeatureOccurences,
  } from "../utils/utils.js";

  const dispatch = createEventDispatcher();

  export let displayComponent; // flex/none
  export let performances; // array of performances

  const selectedPerformanceFilters = {
    videoFeatures: [],
    audioFeatures: [],
    roomFeatures: [],
    timeFrom: "00:00",
    timeTo: "24:00",
  };

  const availableFeatures = getGroupedPerformanceFeaturesFrom(performances);

  let possibleFeatures = getGroupedPerformanceFeaturesFrom(performances);
  let featureOccurenceCounts = getAllFeatureOccurenceCounts();

  function dispatchPerformanceFilterChange() {
    possibleFeatures = getPossibleFeaturesWithAppliedFilters(
      performances,
      selectedPerformanceFilters
    );

    featureOccurenceCounts = getAllFeatureOccurenceCounts();

    console.log(possibleFeatures, selectedPerformanceFilters);

    dispatch("performanceFilterChange", selectedPerformanceFilters);
  }

  function getAllFeatureOccurenceCounts() {
    const featureOccurenceCounts = {};

    const filteredPerformances = filterPerformances(
      performances,
      selectedPerformanceFilters
    );

    Object.values(possibleFeatures)
      .flat()
      .forEach((feature) => {
        featureOccurenceCounts[feature] = countFeatureOccurences(
          filteredPerformances,
          feature
        );
      });

    return featureOccurenceCounts;
  }

  // gets triggered on checkbox click
  function toggleOption(event) {
    const option = event.target.closest(".option");
    if (!option) return;

    if (option.classList.contains("disabled")) return;

    const optionText = option.innerText.split("(")[0].trim();
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

    dispatchPerformanceFilterChange();
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

      dispatchPerformanceFilterChange();

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

    dispatchPerformanceFilterChange();
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
      {#each availableFeatures.videoFeatures as videoFeature}
        {#if possibleFeatures.videoFeatures.includes(videoFeature)}
          <div class="option">
            {videoFeature} ({featureOccurenceCounts[videoFeature]})
          </div>
        {:else}
          <div class="option disabled">{videoFeature} (0)</div>
        {/if}
      {/each}
      <div class="option selected" style="display: none;"></div>
    </div>
  </div>

  <div class="column" id="roomFeatures">
    <div class="label">Dvorana</div>
    <div class="checkboxesColumn">
      {#each availableFeatures.roomFeatures as roomFeature}
        {#if possibleFeatures.roomFeatures.includes(roomFeature)}
          <div class="option">{roomFeature} ({featureOccurenceCounts[roomFeature]})</div>
        {:else}
          <div class="option disabled">{roomFeature} (0)</div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="column" id="audioFeatures">
    <div class="label">Zvuk</div>
    <div class="checkboxesColumn">
      {#each availableFeatures.audioFeatures as audioFeature}
        {#if possibleFeatures.audioFeatures.includes(audioFeature)}
          <div class="option">
            {audioFeature} ({featureOccurenceCounts[audioFeature]})
          </div>
        {:else}
          <div class="option disabled">{audioFeature} (0)</div>
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
