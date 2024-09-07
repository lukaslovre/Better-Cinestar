const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { drawProgressBar } = require("./consoleProgress.js");

async function fetchAndParseHtml(url) {
  const response = await fetch(url);

  if (!response.ok) {
    console.log(response);
  }

  const html = await response.text();

  return cheerio.load(html);
}

async function fillMoviesWithLetterboxdData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  const browser = await puppeteer.launch();

  for (const movie of movies) {
    drawProgressBar(movies.indexOf(movie) / movies.length);

    // Get the movie's Letterboxd URL if it's not already present
    if (!movie.letterboxdUrl) {
      movie.letterboxdUrl = await getLetterboxdUrlFromName(
        browser,
        movie.originalTitle,
        movie.nationwideStart.slice(0, 4)
        // movie.director
      );
    }

    // If the movie has a Letterboxd URL, get the data from it
    const letterboxdData = await getLetterboxdDataFromUrl(movie.letterboxdUrl);
    Object.assign(movie, letterboxdData);
  }

  // Close the browser after all movies have been processed
  await browser.close();

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

async function getLetterboxdUrlFromName(browser, targetName, targetYear) {
  const filmSearchUrl = `https://letterboxd.com/search/films/${targetName.replaceAll(
    " ",
    "+"
  )}/`;

  try {
    // Update to use puppeteer
    const page = await browser.newPage();
    await page.goto(filmSearchUrl);

    // Achieve the same functionality as the commented code below using puppeteer
    const element = await page.waitForSelector("ul.results");

    // Go thru every element `li` child of `ul.results` and check if the title matches the target
    const elements = await element.$$("li");

    for (const el of elements) {
      const { title, url } = await el.$eval(".film-title-wrapper > a", (el) => {
        return {
          title: el.innerText || "",
          url: el.href || "",
        };
      });

      const year = await el.$eval(".film-title-wrapper > .metadata", (el) =>
        el.innerText ? parseInt(el.innerText.slice(0, 4)) : null
      );

      if (targetYear - year < 3 && url) {
        return url;
      }
    }

    return null;
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

    if (!scriptTag) {
      console.log(`No script tag found for ${url}. Skipping...`);
      return defaultData;
    }

    const startingIndex = scriptTag.indexOf("{");
    const endingIndex = -10; // ovo je broj dobiven rucnim gledanjem kako izgleda script tag
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
    const trailerId = trailer
      ? `https://www.youtube.com/watch?v=${trailer.slice(
          trailer.indexOf("embed/") + 6,
          trailer.indexOf("?")
        )}`
      : null;

    const durationText = $(".text-footer").prop("innerText"); // ex. "... 90 mins ..."
    const hasDuration = durationText.includes("mins");
    let durationMins = hasDuration
      ? parseInt(durationText.slice(0, durationText.indexOf("mins")))
      : null;
    durationMins = isNaN(durationMins) ? null : durationMins;
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
