// DOM elementi
// Lokacija kina dropdown
const locationDropdownElement = document.getElementById("movieLocationDropdown");
const locationDropdownOptions = document.getElementById("movieLocationOptions");
const locationDropdownSuboptions = locationDropdownElement
  .closest(".input-container")
  .querySelectorAll(".dropdown-suboptions");
const expandableOptions = locationDropdownOptions.querySelectorAll("svg");
const nonExpandableOptions = getOptionsWithoutChildren();
// Datum prikazivanja dropdown
const dateDropdownElement = document.getElementById("dateDropdown");
const dateDropdownOptions = dateDropdownElement
  .closest(".input-container")
  .querySelector(".dropdown-options");
// Sortiranje dropdown
const changeOrderButton = document.getElementById("changeOrderButton");
const linije = changeOrderButton.querySelectorAll(".icon-line");
// Cards
const movieCardsContainer = document.getElementById("movieCardsContainer");

// Globalne varijable
const urlParameters = loadParamsFromUrl();
let parametersChanged = false;

// Event listeneri
// Otvaranje 1. levela lokacije
locationDropdownElement.addEventListener("click", () => {
  const dropdownDisplay = locationDropdownOptions.style.display;
  if (dropdownDisplay.length == 0 || dropdownDisplay === "none") {
    locationDropdownOptions.style.display = "flex";
    locationDropdownElement.classList.add("fadeout-1-input");
  } else {
    locationDropdownElement.classList.remove("fadeout-1-input");
    locationDropdownElement.classList.remove("fadeout-2-input");
    locationDropdownOptions.classList.remove("fadeout-1-input");

    locationDropdownOptions.style.display = "none";
    locationDropdownSuboptions.forEach((suboption) => {
      suboption.style.display = "none";
    });

    // Redirect
    if (parametersChanged) redirectWithParams();
  }
});
// Otvaranje 2. levela lokacije
expandableOptions.forEach((svg) => {
  const option = svg.parentNode;
  option.addEventListener("click", (e) => {
    const optionValue = e.currentTarget.querySelector("p").textContent;
    const correspondingDropdown = getSuboptionsFor(optionValue);

    const dropdownDisplay = correspondingDropdown.style.display;
    if (dropdownDisplay.length == 0 || dropdownDisplay === "none") {
      locationDropdownElement.classList.add("fadeout-2-input");
      locationDropdownOptions.classList.add("fadeout-1-input");
      locationDropdownSuboptions.forEach((suboption) => {
        suboption.style.display = "none";
      });
      correspondingDropdown.style.display = "flex";
    } else {
      locationDropdownElement.classList.remove("fadeout-2-input");
      locationDropdownOptions.classList.remove("fadeout-1-input");
      correspondingDropdown.style.display = "none";
    }
  });
});
// Oznacavanje kina
nonExpandableOptions.forEach((cinema) => {
  cinema.addEventListener("click", (e) => {
    const selectedCinemaOid = e.currentTarget.querySelector("p").dataset.cinemaOid;
    if (urlParameters.cinemaOids.includes(selectedCinemaOid)) {
      e.currentTarget.style.color = "";
      urlParameters.cinemaOids = urlParameters.cinemaOids.filter(
        (oid) => oid !== selectedCinemaOid
      );
    } else {
      e.currentTarget.style.color = "#E8C547";
      urlParameters.cinemaOids.push(selectedCinemaOid);
    }
    parametersChanged = true;
    console.log(urlParameters.cinemaOids);
  });
});
// Otvaranje 1. levela datuma
dateDropdownElement.addEventListener("click", () => {
  const dropdownDisplay = dateDropdownOptions.style.display;
  if (dropdownDisplay.length == 0 || dropdownDisplay === "none") {
    dateDropdownOptions.style.display = "flex";
  } else {
    dateDropdownOptions.style.display = "none";

    // Redirect
    if (parametersChanged) redirectWithParams();
  }
});
// Odabir datuma prikaza
for (const dateOption of dateDropdownOptions.children) {
  dateOption.addEventListener("click", setSelectedDate);
}
// prosirivanje carda na klik
for (const card of movieCardsContainer.children) {
  card.addEventListener("click", expandCard);
}
// animiranje order buttona
changeOrderButton.addEventListener("click", (e) => {
  linije.forEach((linija) => {
    linija.classList.toggle("ascOrder");
  });
});

// Funkcije
function getSuboptionsFor(city) {
  for (const suboptions of locationDropdownSuboptions) {
    if (suboptions.dataset.city === city) return suboptions;
  }
}
function getOptionsWithoutChildren() {
  const allOptions = document
    .querySelector(".dropdown-options-container")
    .querySelectorAll(".option");
  const withoutChildren = [];
  for (const node of allOptions) {
    if (node.childElementCount < 2) {
      withoutChildren.push(node);
    }
  }
  return withoutChildren;
}
function setSelectedDate(e) {
  const optionValue = e.currentTarget.dataset.date;
  for (const dateOption of dateDropdownOptions.children) {
    dateOption.style.color = "";
  }
  e.currentTarget.style.color = "#E8C547";
  if (optionValue === "all") {
    urlParameters.date = "all";
  } else {
    urlParameters.date = optionValue;
  }
  parametersChanged = true;
}
function expandCard(e) {
  const movieCard = e.currentTarget;
  const backgroundImageUrl = movieCard.dataset.backgroundImage;
  const movieCardInfo = movieCard.querySelector(".movieCardInfo");
  const currentStyle = movieCardInfo.style.display;
  if (currentStyle == "" || currentStyle == "none") {
    movieCard.style.backgroundImage = `linear-gradient(0deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url("${backgroundImageUrl}")`;
    movieCardInfo.style.display = "flex";
  } else {
    movieCard.style.backgroundImage = `linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${backgroundImageUrl}")`;

    movieCardInfo.style.display = "none";
  }
}
function loadParamsFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.size === 0) {
    return {
      cinemaOids: [],
      date: "",
      sortBy: "",
    };
  }

  const cinema = urlParams.getAll("cinema");
  const cinemaOids = cinema[0] === "" ? [] : cinema;

  const date = urlParams.get("date");
  const sort = urlParams.get("sortBy");
  console.log(cinemaOids, date, sort);

  return {
    cinemaOids: cinemaOids,
    date: date,
    sortBy: sort,
  };
}
function redirectWithParams() {
  const cinemaOidsString =
    urlParameters.cinemaOids.length === 0
      ? "cinema="
      : urlParameters.cinemaOids.map((oid) => "cinema=" + oid).join("&");
  const dateString = "&date=" + urlParameters.date;
  const sortString = "&sortBy=" + urlParameters.sortBy;

  window.location.href = "/movies?" + cinemaOidsString + dateString + sortString;
}
function styleDomBasedOnParams() {
  const selectedCinemas = nonExpandableOptions
    .filter((option) =>
      urlParameters.cinemaOids.includes(option.querySelector("p").dataset.cinemaOid)
    )
    .forEach((option) => {
      option.style.color = "#E8C547";
    });

  for (const dateOption of dateDropdownOptions.children) {
    console.log(dateOption);
    if (dateOption.dataset.date === urlParameters.date) {
      dateOption.style.color = "#E8C547";
      break;
    }
  }
}
styleDomBasedOnParams();
