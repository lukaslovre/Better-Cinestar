const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { drawProgressBar } = require("./consoleProgress.js");

async function fetchAndParseHtml(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log(response);
    }

    const html = await response.text();

    return cheerio.load(html);
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function fillMoviesWithLetterboxdData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
  });

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
  const nameToSearchFormat = targetName.replaceAll(" ", "+"); // ex. "The Matrix" -> "The+Matrix"
  const filmSearchUrl = `https://letterboxd.com/search/films/${nameToSearchFormat}/`;
  let page = null;

  try {
    page = await browser.newPage();

    // Configure page
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Block unnecessary resources
      const blockedResources = ["image", "stylesheet", "font", "media"];
      if (blockedResources.includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    // Navigate to the search URL
    const response = await page.goto(filmSearchUrl, {
      waitUntil: "networkidle0",
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Navigation failed: ${response ? response.status() : "No response"}`
      );
    }

    // Handle cookie consent
    const cookieButtonSelector = ".fc-consent-root .fc-cta-do-not-consent";
    try {
      await page.waitForSelector(cookieButtonSelector, {
        visible: true,
        timeout: 500,
      });
      await page.click(cookieButtonSelector);
    } catch (err) {
      console.log("No cookie button found");
    }

    // Get formatted array of search results
    const results = await page.evaluate(() => {
      const movieLiElements = Array.from(document.querySelectorAll("ul.results li"));

      return movieLiElements.map((itemLi) => {
        const titleElement = itemLi.querySelector(".film-title-wrapper > a");
        const yearElement = itemLi.querySelector(".film-title-wrapper > .metadata");

        return {
          title: titleElement?.innerText?.trim() || "",
          url: titleElement?.href || "",
          year: yearElement ? parseInt(yearElement.innerText.slice(0, 4)) : null,
        };
      });
    });

    // Process results
    const match = results.find(
      (item) => item.year && Math.abs(targetYear - item.year) < 3 && item.url
    );

    console.log(`Matched letterboxd movie: ${match ? match.url : "N/A"}`);

    return match?.url || null;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.error("Error closing page:", error);
      }
    }
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

  // TODO: Add real url validation
  if (!url) {
    return defaultData;
  }

  try {
    const $ = await fetchAndParseHtml(url);

    const scriptTag = $("[type='application/ld+json']").text();

    if (!scriptTag) {
      console.log(`No script tag found for ${url}`);
    }

    if (scriptTag) {
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

      // add fields to defaultData object by overwriting
      defaultData.letterboxdRating = letterboxdRating
        ? parseFloat(letterboxdRating).toFixed(1)
        : null;
      defaultData.englishDirectors = englishDirectors;
      defaultData.actors = actors;
      defaultData.posterUrl = posterUrl;
      defaultData.englishCategories = englishCategories;
    }

    // Get the rest of the data from DOM
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
    const duration = `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`; // fatalna greška, nema veze

    defaultData.imdbUrl = imdbUrl;
    defaultData.englishSynopsis = englishSynopsis;
    defaultData.trailerLink = trailerId;
    defaultData.duration = duration;
    defaultData.durationMins = durationMins;
  } catch (err) {
    console.log(err);
  } finally {
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
  try {
    if (!url) {
      throw new Error("No URL provided");
    }

    const $ = await fetchAndParseHtml(url);

    const personTmdbId = $("body").attr("data-tmdb-id");
    const personTmdbUrl = `http://www.themoviedb.org/person/${personTmdbId}`;

    const $2 = await fetchAndParseHtml(personTmdbUrl);

    const imageUrl = $2("meta[property='og:image']").attr("content");
    if (!imageUrl) {
      throw new Error("No image found on person's TMDB page");
    }

    const imageId = imageUrl.slice(imageUrl.lastIndexOf("/"));
    return `https://image.tmdb.org/t/p/w138_and_h175_face${imageId}`;
  } catch (err) {
    console.log(err.message);
    return "/images/defaultPersonImage.jpg";
  }
}

module.exports = {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
};
