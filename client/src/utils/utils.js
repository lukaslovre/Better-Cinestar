function getFormattedPerformanceDateLabel(performanceDate) {
  const today = new Date();
  const dateDiff = performanceDate.getDate() - today.getDate();

  if (dateDiff < 0) {
    return "Prošlost";
  }
  if (dateDiff === 0) {
    return "Danas";
  }
  if (dateDiff === 1) {
    return "Sutra";
  }

  return performanceDate.toLocaleDateString("hr-HR", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getRelativeDate(date, time) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffInDays < -1) {
    return `prije ${Math.abs(diffInDays)} dana`;
  } else if (diffInDays === -1) {
    return "jučer";
  } else if (diffInDays === 0) {
    // if today, show how much hours and minutes is left from now
    const correctNow = new Date();
    const currentHours = correctNow.getHours();
    const currentMinutes = correctNow.getMinutes();

    console.log("Current time: ", currentHours, ":", currentMinutes);

    const [hours, minutes] = time.split(":").map((x) => parseInt(x));

    console.log("Performance time: ", hours, ":", minutes);

    const diffInHours = (hours * 60 + minutes - currentHours * 60 - currentMinutes) / 60;
    const diffInMinutes =
      (hours * 60 + minutes - currentHours * 60 - currentMinutes) % 60;

    const diffInHoursString = Math.floor(diffInHours);
    const diffInMinutesString = diffInMinutes.toString().padStart(2, "0");

    return `za ${diffInHoursString}h ${diffInMinutesString}m`;
  } else if (diffInDays === 1) {
    return "sutra";
  } else {
    return `za ${diffInDays} dana`;
  }
}

function dateToYMDFormat(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countSelectedFilters(filters) {
  return Object.values(filters)
    .flat()
    .filter((item) => item !== "00:00" && item !== "24:00").length;
}

function filterPerformances(performances, filters) {
  return performances.filter((performance) => {
    const isInTimeRange =
      filters.timeFrom === undefined ||
      filters.timeTo === undefined ||
      (performance.performanceTime >= filters.timeFrom &&
        performance.performanceTime <= filters.timeTo);

    const isVideoFeatureSelected =
      filters.videoFeatures === undefined ||
      filters.videoFeatures.length === 0 ||
      filters.videoFeatures.some((selectedFeature) =>
        performance.performanceFeatures.includes(selectedFeature)
      );

    // if roomFeatures equals "BASIC", then check that the performanceFeatures doesn't contain "4DX" or "IMAX" or "GOLD",
    // if roomFeatures equals something else, then the performanceFeatures must contain that value
    const isRoomFeatureSelected =
      filters.roomFeatures === undefined ||
      filters.roomFeatures.length === 0 ||
      filters.roomFeatures.some((selectedFeature) => {
        if (selectedFeature === "BASIC") {
          return (
            !performance.performanceFeatures.includes("4DX") &&
            !performance.performanceFeatures.includes("IMAX") &&
            !performance.performanceFeatures.includes("GOLD") &&
            !performance.performanceFeatures.includes("KIDS") &&
            !performance.performanceFeatures.includes("SCREENX")
          );
        } else {
          return performance.performanceFeatures.includes(selectedFeature);
        }
      });

    const isAudioFeatureSelected =
      filters.audioFeatures === undefined ||
      filters.audioFeatures.length === 0 ||
      filters.audioFeatures.some((selectedFeature) =>
        performance.performanceFeatures.includes(selectedFeature)
      );

    return (
      isInTimeRange &&
      isVideoFeatureSelected &&
      isRoomFeatureSelected &&
      isAudioFeatureSelected
    );
  });
}

// performance filter card

/**
 * Returns an array of unique performance features from an array of performances.
 * Each performance is an object that includes a `performanceFeatures` property,
 * which is an array of strings. If a performance does not include "IMAX", "4DX",
 * "GOLD", "KIDS" or "SCREENX" in its features, "BASIC" is added to its features.
 *
 * @param {Object[]} performances - The performances to extract features from.
 * @param {string[]} performances[].performanceFeatures - The features of each performance.
 *
 * @returns {string[]} An array of unique performance features.
 */
function getUniquePerformanceFeaturesFrom(performances) {
  return (
    performances
      .map((performance) => performance.performanceFeatures)
      // check for every performanceFeatures array if it contains IMAX, 4DX or GOLD or KIDS or SCREENX, if not push BASIC to the array
      .map((performanceFeatures) => {
        if (
          !performanceFeatures.includes("IMAX") &&
          !performanceFeatures.includes("4DX") &&
          !performanceFeatures.includes("GOLD") &&
          !performanceFeatures.includes("KIDS") &&
          !performanceFeatures.includes("SCREENX")
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
        feature === "BASIC" ||
        feature === "KIDS" ||
        feature === "SCREENX"
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

function getPossibleFeaturesWithAppliedFilters(performances, filters) {
  const possibleFeatures = {
    videoFeatures: [],
    roomFeatures: [],
    audioFeatures: [],
  };

  for (const columnName of Object.keys(possibleFeatures)) {
    const filtersWithoutOneColumn = JSON.parse(JSON.stringify(filters));

    filtersWithoutOneColumn[columnName] = [];

    const filteredPerformances = filterPerformances(
      performances,
      filtersWithoutOneColumn
    );

    possibleFeatures[columnName] =
      getGroupedPerformanceFeaturesFrom(filteredPerformances)[columnName];
  }

  return possibleFeatures;
}

// function that for each feature counts the number of performances that contain it
function countFeatureOccurences(performances, feature) {
  let count = 0;

  for (const performance of performances) {
    if (feature === "BASIC") {
      if (
        !performance.performanceFeatures?.includes("4DX") &&
        !performance.performanceFeatures?.includes("IMAX") &&
        !performance.performanceFeatures?.includes("GOLD") &&
        !performance.performanceFeatures?.includes("KIDS") &&
        !performance.performanceFeatures?.includes("SCREENX")
      ) {
        count++;
      }
    } else if (performance.performanceFeatures?.includes(feature)) {
      count++;
    }
  }

  return count;
}

// export all functions
export {
  getFormattedPerformanceDateLabel,
  filterPerformances,
  countSelectedFilters,
  getGroupedPerformanceFeaturesFrom,
  getPossibleFeaturesWithAppliedFilters,
  countFeatureOccurences,
  dateToYMDFormat,
};
