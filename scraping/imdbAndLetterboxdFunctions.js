const cheerio = require("cheerio");
const { drawProgressBar } = require("./consoleProgress.js");

async function fetchAndParseHtml(url) {
  const response = await fetch(url);
  const html = await response.text();
  return cheerio.load(html);
}

async function fillMoviesWithLetterboxdData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  for (const movie of movies) {
    drawProgressBar(movies.indexOf(movie) / movies.length);

    // Get the movie's Letterboxd URL if it's not already present
    if (!movie.letterboxdUrl) {
      movie.letterboxdUrl = await getLetterboxdUrlFromName(
        movie.originalTitle,
        movie.nationwideStart.slice(0, 4),
        movie.director
      );
    }

    // If the movie has a Letterboxd URL, get the data from it
    const letterboxdData = await getLetterboxdDataFromUrl(movie.letterboxdUrl);
    Object.assign(movie, letterboxdData);
  }

  return movies;
}

async function fillMoviesWithImdbData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  for (const movie of movies) {
    drawProgressBar(movies.indexOf(movie) / movies.length);

    if (!movie.imdbUrl) continue;

    movie.imdbRating = await getImdbDataFromUrl(movie.imdbUrl);
  }

  return movies;
}

async function getLetterboxdUrlFromName(targetName, targetYear) {
  try {
    const filmSearchUrl = `https://letterboxd.com/search/films/${targetName.replaceAll(
      " ",
      "+"
    )}/`;

    const $ = await fetchAndParseHtml(filmSearchUrl);
    const filmSearchResults = $("ul.results .film-detail-content");

    let moviePageUrl = null;

    filmSearchResults.each((i, el) => {
      const title = $(el).find(".film-title-wrapper > a").first().text();
      const linkToMovie = $(el).find(".film-title-wrapper > a").first().attr("href");
      const releaseYear = $(el).find(".film-title-wrapper > .metadata").first().text();

      if (targetYear - releaseYear < 3 && moviePageUrl == null) {
        moviePageUrl = `https://letterboxd.com${linkToMovie}`;
      }
    });

    return moviePageUrl;
  } catch (err) {
    console.log(err);
    return null;
  }
}

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
    const $ = await fetchAndParseHtml(url);

    const scriptTag = $("[type='application/ld+json']").text();
    const startingIndex = scriptTag.indexOf("{");
    const endingIndex = -10;
    const data = JSON.parse(scriptTag.slice(startingIndex, endingIndex));

    let { aggregateRating, genre, image, director, actors } = data;

    let letterboxdRating = aggregateRating ? aggregateRating.ratingValue : null;
    const englishCategories = genre;
    const posterUrl = image;

    const englishDirectors = director.map(({ name, sameAs }) => {
      return { name, portraitUrl: null, lbUrl: `https://letterboxd.com${sameAs}` };
    });

    for (const director of englishDirectors) {
      director.portraitUrl = await getPortraitUrlFromActorProfile(director.lbUrl);
    }

    actors = actors.slice(0, Math.min(8, actors.length)).map(({ name, sameAs }) => {
      return { name, portraitUrl: null, lbUrl: `https://letterboxd.com${sameAs}` };
    });

    for (const actor of actors) {
      actor.portraitUrl = await getPortraitUrlFromActorProfile(actor.lbUrl);
    }

    const englishSynopsis = $(".truncate > *").prop("innerText");
    const imdbUrl = $('[data-track-action="IMDb"]').attr("href");
    const trailer = $('[data-track-category="Trailer"]').attr("href");
    const trailerId = `https://www.youtube.com/watch?v=${trailer.slice(
      trailer.indexOf("embed/") + 6,
      trailer.indexOf("?")
    )}`;
    let durationMins = $(".text-footer").prop("innerText");
    const indexOfMins = durationMins.indexOf("mins");
    durationMins = parseInt(durationMins.slice(indexOfMins - 4, indexOfMins - 1));
    const duration = `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`;

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

async function getImdbDataFromUrl(url) {
  if (!url) {
    return null;
  }
  try {
    const $ = await fetchAndParseHtml(url);

    const scriptTag = $('[type="application/ld+json"]').text();

    if (!scriptTag) return null;

    const imdbData = JSON.parse(scriptTag);
    if (!imdbData.aggregateRating) return null;
    return imdbData.aggregateRating.ratingValue;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getPortraitUrlFromActorProfile(url) {
  const $ = await fetchAndParseHtml(url);

  const personTmdbId = $("body").attr("data-tmdb-id");
  const personTmdbUrl = `http://www.themoviedb.org/person/${personTmdbId}`;
  const $2 = await fetchAndParseHtml(personTmdbUrl);

  const imageUrl = $2("meta[property='og:image']").attr("content");
  if (!imageUrl) {
    return "/images/defaultPersonImage.jpg";
  }

  const imageId = imageUrl.slice(imageUrl.lastIndexOf("/"));
  return `https://image.tmdb.org/t/p/w138_and_h175_face${imageId}`;
}

module.exports = {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
};
