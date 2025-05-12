/**
 * Formats a performance date into a user-friendly string.
 * Returns relative terms like 'Danas' (Today) or 'Sutra' (Tomorrow) for dates close to the current date,
 * 'Prošlost' (Past) for past dates, or a formatted date string (e.g., "Uto, 6. Svi") for future dates.
 *
 * @param {Date} performanceDate - The date of the performance.
 * @returns {string} A formatted string representing the performance date.
 */
function getFormattedPerformanceDateLabel(performanceDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the difference between the performance date and today
  const dateDiffMilliseconds = performanceDate.getTime() - today.getTime();
  const millisecondsInADay = 1000 * 60 * 60 * 24;
  const dateDiffDays = Math.floor(dateDiffMilliseconds / millisecondsInADay);

  if (dateDiffDays < 0) {
    return 'Prošlost';
  }
  if (dateDiffDays === 0) {
    return 'Danas';
  }
  if (dateDiffDays === 1) {
    return 'Sutra';
  }

  // For dates further in the future, format them
  return performanceDate.toLocaleDateString('hr-HR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculates a relative date/time string compared to the current moment.
 * Examples: "prije 2 dana", "jučer", "za 1h 30m", "sutra", "za 5 dana".
 * For today's date, it shows the remaining hours and minutes until the given time.
 *
 * @param {Date} date - The date of the event.
 * @param {string} time - The time of the event in "HH:MM" format.
 * @returns {string} A relative date/time string.
 */
export function getRelativeDate(date: Date, time: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today to the beginning of the day for day comparison

  const performanceDay = new Date(date); // Create a new date object to avoid modifying the original
  performanceDay.setHours(0, 0, 0, 0);

  const dayDiffMilliseconds = performanceDay.getTime() - today.getTime();
  const millisecondsInADay = 1000 * 60 * 60 * 24;
  const dayDiffDays = Math.floor(dayDiffMilliseconds / millisecondsInADay);

  if (dayDiffDays < -1) {
    return `prije ${Math.abs(dayDiffDays)} dana`;
  }
  if (dayDiffDays === -1) {
    return 'jučer';
  }
  if (dayDiffDays === 0) {
    // It's today, calculate the time difference from now
    const now = new Date();
    const [hours, minutes] = time.split(':').map((x) => parseInt(x));

    const performanceDateTime = new Date(date);
    performanceDateTime.setHours(hours, minutes, 0, 0);

    const timeDiffMilliseconds = performanceDateTime.getTime() - now.getTime();

    if (timeDiffMilliseconds < 0) {
      return 'Prošlo';
    }

    const timeDiffMinutes = Math.floor(timeDiffMilliseconds / (1000 * 60));
    const timeDiffHours = Math.floor(timeDiffMinutes / 60);
    const timeDiffMinutesRemaining = timeDiffMinutes % 60;

    const hoursString = timeDiffHours.toString().padStart(2, '0');
    const monitesString = timeDiffMinutesRemaining.toString().padStart(2, '0');

    if (timeDiffHours > 0) {
      return `za ${hoursString}h ${monitesString}m`;
    }
    if (timeDiffMinutesRemaining > 0) {
      return `za ${monitesString}m`;
    }
    return 'Upravo počinje'; // Less than a minute away
  }
  if (dayDiffDays === 1) {
    return 'sutra';
  }
  return `za ${dayDiffDays} dana`;
}

function dateToYMDFormat(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countSelectedPerformanceFilters(filters: PerformanceFilters): number {
  const nonDefaultFilters = Object.values(filters)
    .flat() // eg. ["BASIC", "00:00", "24:00"]
    .filter((item) => item !== '00:00' && item !== '24:00'); // Filter out default time values

  return nonDefaultFilters.length;
}

function filterPerformances(
  performances: MoviePerformance[],
  filters: PerformanceFilters
): MoviePerformance[] {
  return performances.filter((performance) => {
    const isInTimeRange =
      filters.timeFrom === undefined ||
      filters.timeTo === undefined ||
      (performance.performanceTime >= filters.timeFrom &&
        performance.performanceTime <= filters.timeTo);

    const isVideoFeatureSelected =
      filters.videoFeatures === undefined ||
      filters.videoFeatures.length === 0 ||
      filters.videoFeatures.some((selectedFeature) => {
        return performance.performanceFeatures
          ? performance.performanceFeatures.includes(selectedFeature)
          : false;
      });

    // if roomFeatures equals "BASIC", then check that the performanceFeatures doesn't contain "4DX" or "IMAX" or "GOLD",
    // if roomFeatures equals something else, then the performanceFeatures must contain that value
    const isRoomFeatureSelected =
      filters.roomFeatures === undefined ||
      filters.roomFeatures.length === 0 ||
      filters.roomFeatures.some((selectedFeature) => {
        if (!performance.performanceFeatures) return false;

        if (selectedFeature === 'BASIC') {
          return (
            !performance.performanceFeatures.includes('4DX') &&
            !performance.performanceFeatures.includes('IMAX') &&
            !performance.performanceFeatures.includes('GOLD') &&
            !performance.performanceFeatures.includes('KIDS') &&
            !performance.performanceFeatures.includes('SCREENX')
          );
        } else {
          return performance.performanceFeatures.includes(selectedFeature);
        }
      });

    const isAudioFeatureSelected =
      filters.audioFeatures === undefined ||
      filters.audioFeatures.length === 0 ||
      filters.audioFeatures.some((selectedFeature) =>
        performance.performanceFeatures
          ? performance.performanceFeatures.includes(selectedFeature)
          : false
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
 * @param {MoviePerformance[]} performances - The performances to extract features from.
 *
 * @returns {string[]} An array of unique performance features.
 */
function getUniquePerformanceFeaturesFrom(performances: MoviePerformance[]): string[] {
  return (
    performances
      .map((performance) => performance.performanceFeatures)
      // check for every performanceFeatures array if it contains IMAX, 4DX or GOLD or KIDS or SCREENX, if not push BASIC to the array
      .map((performanceFeatures) => {
        if (!performanceFeatures) return [];

        if (
          !performanceFeatures.includes('IMAX') &&
          !performanceFeatures.includes('4DX') &&
          !performanceFeatures.includes('GOLD') &&
          !performanceFeatures.includes('KIDS') &&
          !performanceFeatures.includes('SCREENX')
        ) {
          return [...performanceFeatures, 'BASIC'];
        } else {
          return performanceFeatures;
        }
      })
      .flat()
      .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates
  );
}

function getGroupedPerformanceFeaturesFrom(performances: MoviePerformance[]) {
  const uniquePerformanceFeatures = getUniquePerformanceFeaturesFrom(performances);

  const groupedPerformanceFeatures = {
    videoFeatures: uniquePerformanceFeatures.filter(
      (feature) => feature === '2D' || feature === '3D'
    ),
    roomFeatures: uniquePerformanceFeatures.filter(
      (feature) =>
        feature === '4DX' ||
        feature === 'IMAX' ||
        feature === 'GOLD' ||
        feature === 'BASIC' ||
        feature === 'KIDS' ||
        feature === 'SCREENX'
    ),
    audioFeatures: uniquePerformanceFeatures.filter(
      (feature) => feature === 'TITL' || feature === 'SINK' || feature === 'OV'
    )
  };

  // sort the features alphabetically
  // TODO: check if I can do 'Object.values()'
  Object.keys(groupedPerformanceFeatures).forEach((featureType) => {
    const key = featureType as keyof typeof groupedPerformanceFeatures; // Typescript fix
    groupedPerformanceFeatures[key].sort((a, b) => a.localeCompare(b));
  });

  return groupedPerformanceFeatures;
}

function getPossibleFeaturesWithAppliedFilters(
  performances: MoviePerformance[],
  filters: PerformanceFilters
) {
  const possibleFeatures = {
    videoFeatures: [],
    roomFeatures: [],
    audioFeatures: []
  };

  for (const columnName of Object.keys(possibleFeatures)) {
    const filtersWithoutOneColumn = JSON.parse(JSON.stringify(filters));

    filtersWithoutOneColumn[columnName] = [];

    const filteredPerformances = filterPerformances(
      performances,
      filtersWithoutOneColumn
    );

    // @ts-ignore
    possibleFeatures[columnName] =
      // @ts-ignore
      getGroupedPerformanceFeaturesFrom(filteredPerformances)[columnName];
  }

  return possibleFeatures;
}

/**
 * Counts the occurrences of a specified feature within an array of movie performances.
 *
 * For the special case when the feature is "BASIC", it counts performances that do not include any of the
 * non-basic features: '4DX', 'IMAX', 'GOLD', etc.
 *
 * @param performances - The array of movie performances to evaluate.
 * @param feature - The feature to count.
 * @returns The number of performances that include the specified feature.
 */
function countFeatureOccurences(
  performances: MoviePerformance[],
  feature: string
): number {
  let count = 0;

  for (const performance of performances) {
    // performances don't explicitly contain "BASIC" in their features,
    // it's basic if they don't contain any other features
    // TODO: Maybe all possible features should be in a config somewhere
    if (feature === 'BASIC') {
      if (
        !performance.performanceFeatures?.includes('4DX') &&
        !performance.performanceFeatures?.includes('IMAX') &&
        !performance.performanceFeatures?.includes('GOLD') &&
        !performance.performanceFeatures?.includes('KIDS') &&
        !performance.performanceFeatures?.includes('SCREENX')
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
  countSelectedPerformanceFilters,
  getGroupedPerformanceFeaturesFrom,
  getPossibleFeaturesWithAppliedFilters,
  countFeatureOccurences,
  dateToYMDFormat
};
