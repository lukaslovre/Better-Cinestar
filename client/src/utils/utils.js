function getFormattedPerformanceDateLabel(performance) {
  const performanceDate = new Date(performance.performanceDateTime);
  const today = new Date();
  const dateDiff = performanceDate.getDate() - today.getDate();
  if (dateDiff === 0) {
    return "danas";
  }
  if (dateDiff === 1) {
    return "sutra";
  }

  return performanceDate.toLocaleDateString("hr-HR", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
      performance.performanceTime >= filters.timeFrom &&
      performance.performanceTime <= filters.timeTo;

    const isVideoFeatureSelected =
      filters.videoFeatures.length === 0 ||
      filters.videoFeatures.some((selectedFeature) =>
        performance.performanceFeatures.includes(selectedFeature)
      );

    // if roomFeatures equals "BASIC", then check that the performanceFeatures doesn't contain "4DX" or "IMAX" or "GOLD",
    // if roomFeatures equals something else, then the performanceFeatures must contain that value
    const isRoomFeatureSelected =
      filters.roomFeatures.length === 0 ||
      filters.roomFeatures.some((selectedFeature) => {
        if (selectedFeature === "BASIC") {
          return (
            !performance.performanceFeatures.includes("4DX") &&
            !performance.performanceFeatures.includes("IMAX") &&
            !performance.performanceFeatures.includes("GOLD")
          );
        } else {
          return performance.performanceFeatures.includes(selectedFeature);
        }
      });

    const isAudioFeatureSelected =
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

function getPossibleFeaturesWithAppliedFilters(performances, filters) {
  const columnNames = ["videoFeatures", "roomFeatures", "audioFeatures"];

  const possibleFeatures = {
    videoFeatures: [],
    roomFeatures: [],
    audioFeatures: [],
  };

  for (const columnName of columnNames) {
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
        !performance.performanceFeatures.includes("4DX") &&
        !performance.performanceFeatures.includes("IMAX") &&
        !performance.performanceFeatures.includes("GOLD")
      ) {
        count++;
      }
    } else if (performance.performanceFeatures.includes(feature)) {
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
