function dateToYYYYMMDD(date) {
  return date.toISOString().split("T")[0];
}

function dateToHHMM(date) {
  return (
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0")
  );
}

function msFromMinutes(minutes) {
  return minutes * 60 * 1000;
}

module.exports = {
  dateToYYYYMMDD,
  dateToHHMM,
  msFromMinutes,
};
