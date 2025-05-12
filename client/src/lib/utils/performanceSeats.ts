/**
 * Estimate a typical horizontal gap between adjacent seats by sampling
 * a small, fixed number of pairs and discarding outliers.
 *
 * We:
 * 1. Take the first 6 seats, compute the 5 successive x‑axis distances.
 * 2. Sort those distances descending (largest→smallest).
 * 3. Remove the single largest and single smallest to exclude extreme cases.
 * 4. From the remaining 3 “middle” values, pick the smallest, which
 *    corresponds to the 4th‑largest of the original 5.
 *
 * This isn’t a true arithmetic mean, but a conservative, outlier‑resistant
 * estimate of seat spacing in typical layouts.
 *
 * @param seats  Array of Seat objects, assumed sorted row by row.
 * @returns      A representative horizontal distance, or 0 if <4 seats.
 */
export function getAverageHorizontalSeatDistance(seats: Seat[]): number {
  if (seats.length < 4) {
    return 0; // Not enough seats to calculate distance
  }

  // Number of gaps we'll sample (must be at least 1 less than total number of seats).
  // We pick 5 as a heuristic sample size to balance performance and robustness.
  // Actually it has to be all in the same row, so 5 is a safe number, more could include multiple rows which resets the horizontal distance.1
  const SAMPLE_GAPS = 5;
  const distances: number[] = [];

  // Compute up to SAMPLE_GAPS adjacent x‐intervals.
  // If seats.length < SAMPLE_GAPS + 1, this will naturally stop at seats.length - 1.
  for (let i = 0; i < Math.min(SAMPLE_GAPS, seats.length - 1); i++) {
    const [seat, seatNext] = [seats[i], seats[i + 1]];
    distances.push(seatNext.x - seat.x);
  }

  // Sort descending to identify extremes easily (largest first).
  const sortedDesc = distances.sort((a, b) => b - a);

  // Discard the largest and smallest to remove potential outliers
  // For N sampled distances, this yields N-2 middle values.
  const middlevalues = sortedDesc.slice(1, -1); // Should be at least 1 value

  // Pick the smallest of the middle values (the N-1 th largest overall),
  // giving us a lower‑bound “typical” gap.
  const representativeDistance =
    middlevalues.length > 0 ? middlevalues[middlevalues.length - 1] : sortedDesc[0];

  return representativeDistance;
}
