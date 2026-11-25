// Cinestar data is in Croatian wall time, while the containers run in UTC.
// Always derive "today" and "now" in Europe/Zagreb so they match the stored strings.
const zagrebFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Zagreb",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function zagrebParts(date) {
  return Object.fromEntries(
    zagrebFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
}

function dateToYYYYMMDD(date) {
  const { year, month, day } = zagrebParts(date);
  return `${year}-${month}-${day}`;
}

function dateToHHMM(date) {
  const { hour, minute } = zagrebParts(date);
  return `${hour}:${minute}`;
}

function msFromMinutes(minutes) {
  return minutes * 60 * 1000;
}

module.exports = {
  dateToYYYYMMDD,
  dateToHHMM,
  msFromMinutes,
};
