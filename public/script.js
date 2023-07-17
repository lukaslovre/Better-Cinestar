// DOM elementi
// Lokacija kina dropdown
const locationDropdownElement = document.getElementById("movieLocationDropdown");
const locationDropdownOptions = document.getElementById("movieLocationOptions");
const locationDropdownSuboptions = locationDropdownElement
  .closest(".input-container")
  .querySelectorAll(".dropdown-suboptions");
const expandableOptions = locationDropdownOptions.querySelectorAll("svg");
const nonExpandableOptions = getOptionsWithoutChildren();
// Sortiranje dropdown
const changeOrderButton = document.getElementById("changeOrderButton");
const linije = changeOrderButton.querySelectorAll(".icon-line");

// Cards
const movieCardsContainer = document.getElementById("movieCardsContainer");

// Globalne varijable
let selectedCinemas = [];

// Event listeneri
// Otvaranje 1. levela dropdowna
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
    if (selectedCinemas.length > 0) {
      window.location.href = "/cinemas/" + selectedCinemas.join("-");
    } else {
      window.location.href = "/";
    }
  }
});
// Otvaranje 2. levela dropdowna
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
    console.log(selectedCinemas.includes(selectedCinemaOid));
    if (selectedCinemas.includes(selectedCinemaOid)) {
      e.currentTarget.style.color = "";
      selectedCinemas = selectedCinemas.filter((oid) => oid !== selectedCinemaOid);
    } else {
      e.currentTarget.style.color = "#E8C547";
      selectedCinemas.push(selectedCinemaOid);
    }

    console.log(selectedCinemas);
  });
});
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
  const allOptions = document.querySelectorAll(".option");
  const withoutChildren = [];
  for (const node of allOptions) {
    if (node.childElementCount < 2) {
      withoutChildren.push(node);
    }
  }
  return withoutChildren;
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
