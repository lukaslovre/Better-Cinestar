export function getAverageSeatDistance(seats) {
  let distances = [];
  for (let i = 0; i < 5; i++) {
    distances.push(seats.seats[i + 1].x - seats.seats[i].x);
  }

  return distances.sort((a, b) => b - a).slice(1, -1)[2];
}
