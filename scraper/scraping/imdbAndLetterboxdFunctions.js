const cheerio = require("cheerio");
const { drawProgressBar } = require("./consoleProgress.js");
const path = require("path");
const fs = require("fs/promises");
const { parseLetterboxdSearchResults } = require("./letterboxdParser.js");

const DEFAULT_PERSON_IMAGE = "/images/defaultPersonImage.jpg";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const BLOCKED_RESOURCE_TYPES = ["image", "stylesheet", "font", "media"];

async function loadHtmlViaBrowser(browser, url, options = {}) {
  const {
    waitUntil = "domcontentloaded",
    timeoutMs = 30_000,
    userAgent = DEFAULT_USER_AGENT,
    blockResources = true,
  } = options;

  if (!browser || typeof browser.newPage !== "function") {
    throw new Error("Browser instance is required");
  }

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(userAgent);

    if (blockResources) {
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (BLOCKED_RESOURCE_TYPES.includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }

    page.setDefaultNavigationTimeout(timeoutMs);
    page.setDefaultTimeout(timeoutMs);

    // If this times out, the DOM might still be usable; caller can decide.
    await page.goto(url, { waitUntil });

    return await page.content();
  } finally {
    try {
      await page.close();
    } catch (_) {
      // ignore
    }
  }
}

async function getCheerioFromUrl(url, options = {}) {
  const { browser, ...browserOptions } = options;

  if (browser) {
    const html = await loadHtmlViaBrowser(browser, url, browserOptions);
    return cheerio.load(html);
  }

  return fetchAndParseHtml(url);
}

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

async function fillMoviesWithLetterboxdData(browser, movies, options = {}) {
  if (!Array.isArray(movies)) movies = [movies];

  for (const movie of movies) {
    drawProgressBar(movies.indexOf(movie) / movies.length);

    // Get the movie's Letterboxd URL if it's not already present
    if (!movie.letterboxdUrl) {
      movie.letterboxdUrl = await getLetterboxdUrlFromName(
        browser,
        movie.originalTitle,
        movie.nationwideStart.slice(0, 4),
        options,
        // movie.director
      );
    }

    // If the movie has a Letterboxd URL, get the data from it
    const letterboxdData = await getLetterboxdDataFromUrl(
      browser,
      movie.letterboxdUrl,
      options,
    );
    Object.assign(movie, letterboxdData);
  }

  return movies;
}

function sanitizeForFilename(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

async function captureLetterboxdSearchForensics({
  forensicsDir,
  page,
  response,
  targetName,
  targetYear,
  searchUrl,
  html,
  resultsCount,
  error,
  onCapture,
}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = `${sanitizeForFilename(targetName)}_${sanitizeForFilename(
    targetYear,
  )}_${timestamp}`;

  const resolvedDir = forensicsDir
    ? path.resolve(forensicsDir)
    : path.resolve(__dirname, "../tests/artifacts");
  await fs.mkdir(resolvedDir, { recursive: true });

  const basePath = path.join(resolvedDir, `letterboxd_search_${slug}`);
  const screenshotPath = `${basePath}.png`;
  const htmlPath = `${basePath}.html`;
  const snippetPath = `${basePath}_results.html`;
  const metaPath = `${basePath}.json`;

  let title = null;
  let finalUrl = null;
  try {
    title = page ? await page.title() : null;
  } catch (_) {
    title = null;
  }
  try {
    finalUrl = page ? page.url() : null;
  } catch (_) {
    finalUrl = null;
  }

  const meta = {
    kind: "letterboxd_search_forensics",
    timestamp: new Date().toISOString(),
    targetName,
    targetYear,
    searchUrl,
    httpStatus: response ? response.status() : null,
    finalUrl,
    title,
    resultsCount: Number.isFinite(resultsCount) ? resultsCount : null,
    error: error ? String(error && error.message ? error.message : error) : null,
    artifacts: {
      screenshotPath,
      htmlPath,
      snippetPath,
      metaPath,
    },
  };

  if (page) {
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (e) {
      meta.artifacts.screenshotError = String(e && e.message ? e.message : e);
    }
  }

  if (html && typeof html === "string") {
    try {
      await fs.writeFile(htmlPath, html, "utf8");
    } catch (e) {
      meta.artifacts.htmlWriteError = String(e && e.message ? e.message : e);
    }

    try {
      const $ = cheerio.load(html);
      const resultsUl = $("ul.results").first();
      const snippet = resultsUl.length ? $.html(resultsUl) : "";
      await fs.writeFile(
        snippetPath,
        snippet || "<!-- ul.results not found -->\n",
        "utf8",
      );
    } catch (e) {
      meta.artifacts.snippetWriteError = String(e && e.message ? e.message : e);
    }
  }

  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  if (typeof onCapture === "function") {
    try {
      onCapture(meta);
    } catch (_) {
      // ignore callback errors
    }
  }
  return meta;
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

async function getLetterboxdUrlFromName(browser, targetName, targetYear, options = {}) {
  const nameToSearchFormat = targetName.replaceAll(" ", "+"); // ex. "The Matrix" -> "The+Matrix"
  const filmSearchUrl = `https://letterboxd.com/search/films/${nameToSearchFormat}/`;
  let page = null;
  let response = null;
  let gotoError = null;

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
    await page.setUserAgent(DEFAULT_USER_AGENT);

    // Navigate to the search URL.
    // NOTE: `networkidle0` is too strict for Letterboxd (ads/analytics can keep the network busy),
    // which can cause a timeout even though results are already present in the DOM.
    try {
      response = await page.goto(filmSearchUrl, {
        waitUntil: "domcontentloaded",
      });
    } catch (e) {
      gotoError = e;
      // If navigation timed out, the DOM may still be usable (we'll attempt parsing below).
      if (!(e && e.name === "TimeoutError")) throw e;
    }

    if (response && !response.ok()) {
      throw new Error(`Navigation failed: ${response.status()}`);
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

    // Wait for results to exist (or time out and attempt best-effort parsing anyway).
    try {
      await page.waitForSelector("ul.results li", { timeout: 7000 });
    } catch (_) {
      // ignore
    }

    const parserMode = options?.letterboxdSearchParser?.mode || "dom"; // 'dom' preserves legacy behavior
    let html = null;
    let results = [];

    if (parserMode === "html") {
      html = await page.content();
      results = parseLetterboxdSearchResults(html);
    } else {
      // Legacy DOM extraction
      results = await page.evaluate(() => {
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
    }

    // Process results
    const match = results.find(
      (item) => item.year && Math.abs(targetYear - item.year) < 3 && item.url,
    );

    console.log(
      `Matched letterboxd movie: ${match ? match.url : "N/A"} (results: ${results.length})`,
    );

    if (!match?.url) {
      const forensics = options?.letterboxdSearchForensics;
      if (forensics?.enabled) {
        if (!html) {
          html = await page.content().catch(() => null);
        }
        await captureLetterboxdSearchForensics({
          forensicsDir: forensics.dir,
          page,
          response,
          targetName,
          targetYear,
          searchUrl: filmSearchUrl,
          html,
          resultsCount: results.length,
          error: gotoError,
          onCapture: forensics.onCapture,
        });
      }
    }

    return match?.url || null;
  } catch (err) {
    console.log(err);
    const forensics = options?.letterboxdSearchForensics;
    if (forensics?.enabled && page) {
      try {
        const html = await page.content().catch(() => null);
        await captureLetterboxdSearchForensics({
          forensicsDir: forensics.dir,
          page,
          response,
          targetName,
          targetYear,
          searchUrl: filmSearchUrl,
          html,
          resultsCount: null,
          error: err,
          onCapture: forensics.onCapture,
        });
      } catch (_) {
        // ignore forensics failures
      }
    }
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

async function getLetterboxdDataFromUrl(browser, url, options = {}) {
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
    // Letterboxd may 403/block plain fetch for some pages.
    // Use the existing Puppeteer browser for consistency and resilience.
    const $ = await getCheerioFromUrl(url, {
      browser,
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
      blockResources: true,
    });

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
        director.portraitUrl = await getPortraitUrlFromActorProfile(
          browser,
          director.lbUrl,
        );
      }

      actors = actors.slice(0, Math.min(8, actors.length)).map(({ name, sameAs }) => {
        return { name, portraitUrl: null, lbUrl: `https://letterboxd.com${sameAs}` };
      });

      for (const actor of actors) {
        actor.portraitUrl = await getPortraitUrlFromActorProfile(browser, actor.lbUrl);
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
          trailer.indexOf("?"),
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

async function getPortraitUrlFromActorProfile(browser, url) {
  try {
    if (!url) {
      throw new Error("No URL provided");
    }

    // Letterboxd person pages can 403 for plain fetch; use Puppeteer.
    const $ = await getCheerioFromUrl(url, {
      browser,
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
      blockResources: true,
    });

    if (!$) {
      throw new Error("Failed to fetch Letterboxd person profile HTML");
    }

    const personTmdbId = $("body").attr("data-tmdb-id");
    if (!personTmdbId) {
      return DEFAULT_PERSON_IMAGE;
    }

    const personTmdbUrl = `https://www.themoviedb.org/person/${personTmdbId}`;

    const $2 = await fetchAndParseHtml(personTmdbUrl);

    if (!$2) {
      throw new Error("Failed to fetch TMDB person page HTML");
    }

    const imageUrl = $2("meta[property='og:image']").attr("content");
    if (!imageUrl) {
      throw new Error("No image found on person's TMDB page");
    }

    const imageId = imageUrl.slice(imageUrl.lastIndexOf("/"));
    return `https://image.tmdb.org/t/p/w138_and_h175_face${imageId}`;
  } catch (err) {
    console.log(err.message);
    return DEFAULT_PERSON_IMAGE;
  }
}

module.exports = {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
};
