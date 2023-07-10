const changeOrderButton = document.getElementById("changeOrderButton");
const linije = document.querySelectorAll(".icon-line");

changeOrderButton.addEventListener("click", (e) => {
  linije.forEach((linija) => {
    linija.classList.toggle("ascOrder");
  });
});

// Prva razina (samo input)
const movieLocationDropdown = document.getElementById("movieLocationDropdown");
// Druga razina (gradovi)
const movieCityOptions = document.getElementById("movieCityOptions");
// Treca razina (imena kina)
const movieCitySuboptions = document.querySelectorAll(".movieCitySuboptions");
// gradovi koji nisu finalni (ima vise kina u gradu)
const movieCityExpandableOptions = movieCityOptions.querySelectorAll("svg");
//listovi dropdown-ova (gradovi i imena kina)
const dropdownCinemas = getOptionsWithoutChildren();

console.log(dropdownCinemas);
const selectedCinemas = [];

// Otvaranje 1. levela dropdowna
movieLocationDropdown.addEventListener("click", () => {
  const dropdownDisplay = movieCityOptions.style.display;
  if (dropdownDisplay.length == 0 || dropdownDisplay === "none") {
    movieCityOptions.style.display = "flex";
    movieLocationDropdown.classList.add("fadeout-1-input");
  } else {
    movieLocationDropdown.classList.remove("fadeout-1-input");
    movieLocationDropdown.classList.remove("fadeout-2-input");
    movieCityOptions.classList.remove("fadeout-1-input");

    movieCityOptions.style.display = "none";
    movieCitySuboptions.forEach((suboption) => {
      suboption.style.display = "none";
    });
  }
});

// Otvaranje 2. levela dropdowna
movieCityExpandableOptions.forEach((svg) => {
  const option = svg.parentNode;
  option.addEventListener("click", (e) => {
    //const optionValue = e.currentTarget.querySelector("p").textContent;
    const optionIndex = e.currentTarget.dataset.suboptionIndex;

    const dropdownDisplay = movieCitySuboptions[optionIndex].style.display;
    if (dropdownDisplay.length == 0 || dropdownDisplay === "none") {
      movieLocationDropdown.classList.add("fadeout-2-input");
      movieCityOptions.classList.add("fadeout-1-input");
      movieCitySuboptions.forEach((suboption) => {
        suboption.style.display = "none";
      });
      movieCitySuboptions[optionIndex].style.display = "flex";
    } else {
      movieLocationDropdown.classList.remove("fadeout-2-input");
      movieCityOptions.classList.remove("fadeout-1-input");
      movieCitySuboptions[optionIndex].style.display = "none";
    }
  });
});

// Oznacavanje kina
dropdownCinemas.forEach((cinema) => {
  cinema.addEventListener("click", (e) => {
    e.currentTarget.style.color = "#E8C547";
    if (e.currentTarget.classList.contains("option")) {
      selectedCinemas.push(e.currentTarget.querySelector("p").textContent);
    } else {
      selectedCinemas.push(e.currentTarget.textContent);
    }
    console.log(selectedCinemas);
  });
});

function getOptionsWithoutChildren() {
  const allOptions = document.querySelectorAll(".movieCitySuboptions > p, .option");
  const withoutChildren = [];
  for (const node of allOptions) {
    if (node.childElementCount < 2) {
      withoutChildren.push(node);
    }
  }
  return withoutChildren;
}
