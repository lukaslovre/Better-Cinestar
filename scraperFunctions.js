const cheerio = require("cheerio");
//const cors = require("cors");
const fs = require("fs");

//app.use(cors());

/*   
  cors({
    origin: "http://yourapp.com",
  })
*/

let cinestarData;
let currentlyScraping = 0;

// Ucitavanje iz datoteke
/*
if (fs.existsSync("cinestarData.json")) {
  cinestarData = fs.readFileSync("cinestarData.json");

  if (cinestarData) {
    console.log("Datoteka 'cinestarData.json' uspjesno ucitana.");
    cinestarData = JSON.parse(cinestarData);
  }
} else {
  console.log("Datoteka 'cinestarData.json' ne postoji.");
  createCinestarDataJson();
}
*/
// radi (valjda)
async function fillMoviesWithLetterboxdData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  for (const movie of movies) {
    if (!movie.letterboxdUrl) {
      movie.letterboxdUrl = await getLetterboxdUrlFromName(
        movie.originalTitle,
        movie.nationwideStart.slice(0, 4),
        movie.director
      );
    }
    // sad bi trebao imat url
    const letterboxdData = await getLetterboxdDataFromUrl(movie.letterboxdUrl);
    Object.assign(movie, letterboxdData);
  }

  return movies;
}

async function fillCinestarDataWithImdb(cinestarData) {
  if (!Array.isArray(cinestarData)) cinestarData = [cinestarData];

  for (const movie of cinestarData) {
    // ako je proslo vise od 1.5h od zadnjeg update-a ratinga
    if (Date.now() < movie.imdbLastEdited + 5400000) continue;

    if (!movie.imdbUrl) continue;

    const imdbOcjena = await getImdbDataFromUrl(movie.imdbUrl);
    if (imdbOcjena) movie.imdbRating = imdbOcjena;
    movie.imdbLastEdited = Date.now();
  }

  return cinestarData;
}

//radi (moze se jos poboljsati)
async function getLetterboxdUrlFromName(targetName, targetYear, targetDirectors) {
  try {
    const filmSearchUrl =
      "https://letterboxd.com/search/films/" + targetName.replaceAll(" ", "+") + "/";

    const filmSearchResponse = await fetch(filmSearchUrl);
    const filmSearchHtml = await filmSearchResponse.text();
    const $ = cheerio.load(filmSearchHtml);
    const filmSearchResults = $("ul.results .film-detail-content");

    console.log("\nTraženje filma: " + targetName + " pod " + filmSearchUrl);

    let moviePageUrl = null; // finalni URL koji se returna

    filmSearchResults.each((i, el) => {
      const title = $(el).find(".film-title-wrapper > a").first().text();
      const linkToMovie = $(el).find(".film-title-wrapper > a").first().attr("href");
      const releaseYear = $(el).find(".film-title-wrapper > .metadata").first().text();
      //const director = $(el).find("p.film-metadata > a").first().text();
      //console.log("Direktor sa LB: " + director);
      // ako je godina na letterboxdu jednaka na cinestaru +-1
      // mogo bi sve iz ove kategorije stavit u listu i onda u listi provjeravat jel ima
      // neki sa tocnom godinom ili tocnim imenom?
      if (targetYear - releaseYear < 3 && moviePageUrl == null) {
        console.log(
          "    ->\t" +
            releaseYear +
            "\n    ->\t" +
            title +
            "\n    ->\t" +
            linkToMovie +
            "\n"
        );
        moviePageUrl = "https://letterboxd.com" + linkToMovie;
      } else {
        console.log("\t" + releaseYear + "\n\t" + title + "\n\t" + linkToMovie + "\n");
      }
    });

    return moviePageUrl;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// radi (valjda)
async function getLetterboxdDataFromUrl(url) {
  const defaultData = {
    letterboxdRating: null,
    imdbUrl: null,
    englishDirectors: null,
    backgroundImage: null,
    englishSynopsis: null,
    englishCategories: null,
    trailerLink: null,
    duration: null,
  };
  if (!url) {
    return defaultData;
  }

  try {
    const movieDataResponse = await fetch(url);
    const movieDataHtml = await movieDataResponse.text();
    const $ = cheerio.load(movieDataHtml);

    const letterboxdRating = $('[name="twitter:data2"]').attr("content");
    const imdbUrl = $('[data-track-action="IMDb"]').attr("href");
    const englishDirectors = $('[name="twitter:data1"]').attr("content").split(",");
    const backgroundImage = $('[name="twitter:image"]').attr("content");
    const englishSynopsis = $(".truncate > *").prop("innerText");
    const englishCategories = $("#tab-genres .text-slug").prop("innerText");
    const trailer = $('[data-track-category="Trailer"]').attr("href");
    const trailerId = trailer.slice(trailer.indexOf("embed/") + 6, trailer.indexOf("?"));
    let duration = $(".text-footer").prop("innerText");
    const indexOfMins = duration.indexOf("mins");
    duration = duration.slice(indexOfMins - 4, indexOfMins - 1);

    return {
      letterboxdRating: letterboxdRating ? parseFloat(letterboxdRating).toFixed(1) : null,
      imdbUrl,
      englishDirectors,
      backgroundImage,
      englishSynopsis,
      englishCategories,
      trailerLink: trailerId,
      duration,
    };
  } catch (err) {
    console.log(err);
    return defaultData;
  }
}

async function getImdbDataFromUrl(url) {
  if (!url) {
    return null;
  }
  try {
    console.log("Traženje na: " + url);
    const movieDataResponse = await fetch(url);
    const movieDataHtml = await movieDataResponse.text();
    const $ = cheerio.load(movieDataHtml);

    const ocjena = $(".ipc-btn__text #iconContext-star")
      .first()
      .parent()
      .next()
      .find("span")
      .first()
      .text();

    if (ocjena) {
      return ocjena;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = {
  fillMoviesWithLetterboxdData,
};
