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
  export let filteredPerformances; // array of performances

  // Initial values
  let selectedPerformanceFilters = {
    videoFeatures: [],
    audioFeatures: [],
    roomFeatures: [],
    timeFrom: "00:00",
    timeTo: "24:00",
  };

  let columns = [
    {
      id: "videoFeatures",
      label: "Slika",
      data: [],
    },
    {
      id: "roomFeatures",
      label: "Dvorana",
      data: [],
    },
    {
      id: "audioFeatures",
      label: "Zvuk",
      data: [],
    },
    {
      id: "time",
      label: "Vrijeme",
      data: [],
    },
  ];

  $: whenPerformancesUpdate(performances);

  $: whenFilteredPerformancesUpdate(filteredPerformances);

  $: dispatch("performanceFilterChange", selectedPerformanceFilters);

  function whenPerformancesUpdate(perf) {
    setInitialColumnDataValues(perf);
  }

  function whenFilteredPerformancesUpdate(filteredPerf) {
    setColumnDataValuesOnFilterChange(filteredPerf);
  }

  // Functions

  function setInitialColumnDataValues(perf) {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].id === "time") continue;

      const possibleFeatures = getGroupedPerformanceFeaturesFrom(perf)[columns[i].id];

      columns[i].data = possibleFeatures.map((feature) => {
        return {
          name: feature,
          state: selectedPerformanceFilters[columns[i].id].includes(feature)
            ? "selected"
            : "possible",
        };
      });
    }
  }

  function setColumnDataValuesOnFilterChange(filteredPerf) {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].id === "time") continue;

      const possibleFeatures = getPossibleFeaturesWithAppliedFilters(
        performances,
        selectedPerformanceFilters
      )[columns[i].id];

      columns[i].data = columns[i].data.map((feature) => {
        if (!possibleFeatures.includes(feature.name)) {
          feature.state = "notPossible";
        } else {
          if (feature.state !== "selected") {
            feature.state = "possible";
          }
        }

        return feature;
      });
    }
  }

  function updateSelectedFilters() {
    for (let i = 0; i < columns.length; i++) {
      const selectedFeatures = columns[i].data
        .filter((feature) => feature.state === "selected")
        .map((feature) => feature.name);

      selectedPerformanceFilters[columns[i].id] = selectedFeatures;
    }
  }

  function toggleOption(featureName, featureCategory) {
    const categoryIndex = columns.findIndex((column) => column.id === featureCategory);
    const featureIndex = columns[categoryIndex].data.findIndex(
      (feature) => feature.name === featureName
    );

    const featureState = columns[categoryIndex]["data"][featureIndex].state;

    if (featureState === "notPossible") return;

    if (featureState === "selected") {
      columns[categoryIndex]["data"][featureIndex].state = "possible";
    } else {
      columns[categoryIndex]["data"][featureIndex].state = "selected";
    }

    updateSelectedFilters();
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

      // dispatchPerformanceFilterChange();

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

    // dispatchPerformanceFilterChange();
  }
  function unfocusInput(event) {
    if (event.key === "Enter") {
      const input = event.target;
      input.blur();
    }
  }
</script>

<div id="performanceFilterCard" style:display={displayComponent}>
  {#each columns as column}
    {#if column.id !== "time"}
      <div class="column" id={column.id}>
        <div class="label">{column.label}</div>
        <div class="checkboxesColumn">
          {#each column.data as feature}
            <button
              class="option"
              class:selected={feature.state === "selected"}
              class:disabled={feature.state === "notPossible"}
              type="button"
              on:click={() => {
                toggleOption(feature.name, column.id);
              }}
            >
              {feature.name} ({column.data.some((f) => f.state === "selected")
                ? countFeatureOccurences(
                    filterPerformances(performances, {
                      ...selectedPerformanceFilters,
                      [column.id]: [],
                    }),
                    feature.name
                  )
                : countFeatureOccurences(filteredPerformances, feature.name)})
            </button>
          {/each}
        </div>
      </div>
    {:else if column.id === "time"}
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
    {/if}
  {/each}
</div>

<style>
  #performanceFilterCard {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    column-gap: 2rem;
    row-gap: 3rem;
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

    background-color: transparent;
    color: #b9bdc6;
    font-size: 1rem;
    font-weight: 500;

    cursor: pointer;
  }
  #performanceFilterCard .column .checkboxesColumn .option.selected {
    color: #ffcc00;
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
    border-color: #ffcc00;
    background:
      url(/images/check.svg) no-repeat center / contain,
      #ffcc00;
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
