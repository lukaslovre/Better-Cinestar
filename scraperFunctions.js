const cheerio = require("cheerio");

let cinestarData;
let currentlyScraping = 0;

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

async function fillMoviesWithImdbData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  for (const movie of movies) {
    if (!movie.imdbUrl) continue;

    const imdbOcjena = await getImdbDataFromUrl(movie.imdbUrl);
    movie.imdbRating = imdbOcjena;
  }

  return movies;
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
    actors: null,
    posterUrl: null,
    englishSynopsis: null,
    englishCategories: null,
    trailerLink: null,
    duration: null,
    durationMins: null,
  };
  if (!url) {
    return defaultData;
  }

  try {
    const movieDataResponse = await fetch(url);
    const movieDataHtml = await movieDataResponse.text();
    const $ = cheerio.load(movieDataHtml);

    const scriptTag = $("[type='application/ld+json']").text();
    const startingIndex = scriptTag.indexOf("{");
    const endingIndex = -10;
    const data = JSON.parse(scriptTag.slice(startingIndex, endingIndex));

    // Extractanje podataka
    let letterboxdRating = null;
    if (data.aggregateRating) letterboxdRating = data.aggregateRating.ratingValue;
    const englishCategories = data.genre;
    const posterUrl = data.image;
    const englishDirectors = data.director.map(({ name, sameAs }) => {
      return { name, portraitUrl: null, lbUrl: "https://letterboxd.com" + sameAs };
    });
    englishDirectors.forEach(async (director) => {
      director.portraitUrl = await getPortraitUrlFromActorProfile(director.lbUrl);
    });
    const actors = data.actors
      .slice(0, Math.min(8, data.actors.length))
      .map(({ name, sameAs }) => {
        return { name, portraitUrl: null, lbUrl: "https://letterboxd.com" + sameAs };
      });
    actors.forEach(async (actor) => {
      actor.portraitUrl = await getPortraitUrlFromActorProfile(actor.lbUrl);
    });
    const englishSynopsis = $(".truncate > *").prop("innerText");
    const imdbUrl = $('[data-track-action="IMDb"]').attr("href");
    const trailer = $('[data-track-category="Trailer"]').attr("href");
    const trailerId =
      "https://www.youtube.com/watch?v=" +
      trailer.slice(trailer.indexOf("embed/") + 6, trailer.indexOf("?"));
    let durationMins = $(".text-footer").prop("innerText");
    const indexOfMins = durationMins.indexOf("mins");
    durationMins = parseInt(durationMins.slice(indexOfMins - 4, indexOfMins - 1));
    const duration = Math.floor(durationMins / 60) + "h " + (durationMins % 60) + "m";

    return {
      letterboxdRating: letterboxdRating ? parseFloat(letterboxdRating).toFixed(1) : null,
      imdbUrl,
      englishDirectors,
      actors,
      posterUrl,
      englishSynopsis,
      englishCategories,
      trailerLink: trailerId,
      duration,
      durationMins,
    };
  } catch (err) {
    console.log(err);
    return defaultData;
  }
}
// radi (valjda)
async function getImdbDataFromUrl(url) {
  if (!url) {
    return null;
  }
  try {
    console.log("Traženje na: " + url);
    const movieDataResponse = await fetch(url);
    const movieDataHtml = await movieDataResponse.text();
    const $ = cheerio.load(movieDataHtml);

    const imdbData = JSON.parse($('[type="application/ld+json"]').text());
    if (!imdbData.aggregateRating) return null;
    const ocjena = imdbData.aggregateRating.ratingValue;
    /*
    const ocjena = $(".ipc-btn__text #iconContext-star")
      .first()
      .parent()
      .next()
      .find("span")
      .first()
      .text();
*/

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

async function getPortraitUrlFromActorProfile(url) {
  const letterboxdDataResponse = await fetch(url);
  const letterboxdDataHtml = await letterboxdDataResponse.text();
  const $ = cheerio.load(letterboxdDataHtml);

  const personTmdbId = $("body").attr("data-tmdb-id");
  const personTmdbUrl = "http://www.themoviedb.org/person/" + personTmdbId;
  const tmdbDataResponse = await fetch(personTmdbUrl);
  const tmdbDataHtml = await tmdbDataResponse.text();
  const $2 = cheerio.load(tmdbDataHtml);

  const imageUrl = $2("meta[property='og:image']").attr("content");
  if (!imageUrl) {
    console.log(personTmdbUrl);
    console.log(imageUrl);
    return "/images/clockIcon.svg";
  }

  const imageId = imageUrl.slice(imageUrl.lastIndexOf("/"));
  const smallImageUrl = "http://image.tmdb.org/t/p/w138_and_h175_face" + imageId;

  return smallImageUrl;
}

module.exports = {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
  getPortraitUrlFromActorProfile,
};
