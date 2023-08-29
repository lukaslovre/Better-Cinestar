//   sg 190 - regular i VIP ?
//   sg 521 - left love
//   sg 252 - right love
//   sg 171 - left lovebox
//   sg 172 - right lovebox

//   stat 2 - not available
//   stat 4 - not taken
//   stat 16 - taken

const options = {
  weekday: "short", // Short weekday name (e.g., Thu)
  day: "2-digit", // Day of the month as two digits (e.g., 24)
  month: "2-digit", // Month as two digits (e.g., 06)
};

const date = new Date("2023-08-30"); // Replace with your date object
const time = "15:30";

const formattedDate = date.toLocaleDateString("hr-HR", options);
console.log(formattedDate); // Output: "sri, 30. 08."

const dayMonth = formattedDate.replace(/\s+/g, "").replace(/,/g, " ");

const finalFormat = `${time}, ${dayMonth}`;
console.log(finalFormat); // Output: "17:00, Thu 24.06."
