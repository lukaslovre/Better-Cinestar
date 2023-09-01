//   sg 190 - regular i VIP ?
//   sg 521 - left love
//   sg 252 - right love
//   sg 171 - left lovebox
//   sg 172 - right lovebox

//   stat 2 - not available
//   stat 4 - not taken
//   stat 16 - taken

// findLargestX(data.seatGroups.map((group) => group.seats))
const seatGroups = data.seatGroups.map((group) => group.seats);

const largest = findLargestX(seatGroups);
console.log(largest);

function findLargestX(seatGroups) {
  if (seatGroups.length === 0) {
    return undefined;
  }

  let largest = seatGroups[0][seatGroups[0].length - 1].x;

  for (let i = 1; i < seatGroups.length; i++) {
    if (seatGroups[i][seatGroups[i].length - 1].x > largest) {
      largest = seatGroups[i][seatGroups[i].length - 1].x; // Update largest if a larger element is found
      console.log(largest);
    }
  }

  return largest;
}
