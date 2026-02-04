require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const cheerio = require("cheerio");
const { launchBrowser } = require("../scraping/browser.js");
const { configuration } = require("../config/environment.js");
const { getCinemas } = require("../utils/cinemasList.js");
const axios = require("axios");
const {
  fillMoviesWithLetterboxdData,
  fillMoviesWithImdbData,
} = require("../scraping/imdbAndLetterboxdFunctions.js");

/**
 * Scraper Diagnostics Tool
 *
 * This script checks all external dependencies and internal connectivity
 * to ensure the scraper can function correctly.
 */

async function runDiagnostics() {
  console.log("=== BetterCinestar Scraper Diagnostics ===\n");

  const browser = await launchBrowser();
  const cinemas = getCinemas();
  const results = {
    cinestarApi: false,
    letterboxd: false,
    imdb: false,
    serverApi: false,
  };

  try {
    // 1. Check CineStar API (via Puppeteer)
    console.log("[1/4] Checking CineStar API connectivity...");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    const cinemaOid = cinemas[0]?.cinemaOid; // Use the first cinema for testing
    console.log(`Using Cinema: ${cinemas[0]?.cinemaName} (OID: ${cinemaOid})`);
    await page.setExtraHTTPHeaders({ "CENTER-OID": cinemaOid });

    const csResponse = await page.goto(`${configuration.CINESTAR_API_URL}/films`, {
      waitUntil: "networkidle2",
    });
    if (csResponse.ok()) {
      const content = await page.evaluate(() => document.body.innerText);
      try {
        JSON.parse(content);
        console.log("✅ CineStar API: Accessible and returning JSON.");
        results.cinestarApi = true;
      } catch (e) {
        console.log(
          "❌ CineStar API: Accessible but NOT returning JSON (likely Cloudflare block).",
        );
      }
    } else {
      console.log(`❌ CineStar API: Failed with status ${csResponse.status()}`);
    }
    await page.close();

    // 2. Check Letterboxd (via real scraper code paths)
    console.log("\n[2/4] Checking Letterboxd via scraper enrichment...");
    const knownMovie = {
      originalTitle: "The Matrix",
      nationwideStart: "1999-03-31",
      letterboxdUrl: null,
      imdbUrl: null,
      imdbRating: null,
    };

    let forensicsMeta = null;
    try {
      const [enriched] = await fillMoviesWithLetterboxdData(browser, [knownMovie], {
        letterboxdSearchForensics: {
          enabled: true,
          dir: path.resolve(__dirname, "artifacts"),
          onCapture: (meta) => {
            forensicsMeta = meta;
          },
        },
      });

      if (enriched?.letterboxdUrl) {
        console.log(`✅ Letterboxd: Found URL: ${enriched.letterboxdUrl}`);
        results.letterboxd = true;
      } else {
        console.log("❌ Letterboxd: No URL matched from search results.");
        if (forensicsMeta) {
          console.log(
            `Debug: status=${forensicsMeta.httpStatus}, finalUrl=${forensicsMeta.finalUrl}, title=${forensicsMeta.title}, resultsCount=${forensicsMeta.resultsCount}`,
          );
          console.log(`Artifacts: ${forensicsMeta.artifacts.metaPath}`);
        } else {
          console.log("Debug: No forensics metadata captured.");
        }
      }
    } catch (e) {
      console.log("❌ Letterboxd: Enrichment path failed.");
    }

    // 3. Check IMDb (only if we got an IMDb URL from Letterboxd)
    console.log("\n[3/4] Checking IMDb via scraper enrichment...");
    try {
      if (knownMovie.imdbUrl) {
        console.log(`Using IMDb URL: ${knownMovie.imdbUrl}`);
        const [imdbEnriched] = await fillMoviesWithImdbData([knownMovie]);
        if (imdbEnriched?.imdbRating) {
          console.log(`✅ IMDb: Rating fetched: ${imdbEnriched.imdbRating}`);
          results.imdb = true;
        } else {
          console.log("❌ IMDb: Rating not returned (blocked or page changed).");

          // Capture forensics (fetch-based; no Puppeteer) to see what HTML was returned.
          try {
            const artifactsDir = path.resolve(__dirname, "artifacts");
            const meta = await captureImdbForensics({
              artifactsDir,
              imdbUrl: knownMovie.imdbUrl,
            });
            console.log(
              `Debug: status=${meta.httpStatus}, finalUrl=${meta.finalUrl}, title=${meta.title}, ldJsonCount=${meta.ldJsonCount}, hasAggregateRating=${meta.hasAggregateRating}`,
            );
            console.log(`Artifacts: ${meta.artifacts.metaPath}`);
          } catch (_) {
            console.log("Debug: IMDb forensics capture failed.");
          }
        }
      } else {
        console.log(
          "❌ IMDb: No IMDb URL found from Letterboxd data; skipping rating fetch.",
        );
      }
    } catch (e) {
      console.log("❌ IMDb: Enrichment path failed.");
    }

    // 4. Check Server API
    console.log("\n[4/4] Checking Local Server API...");
    try {
      const serverResponse = await axios.get(
        configuration.SERVER_API_URL.replace("/scrape-results", "/health"),
      );
      if (serverResponse.status === 200) {
        console.log("✅ Server API: Up and healthy.");
        results.serverApi = true;
      } else {
        console.log(`❌ Server API: Responded with status ${serverResponse.status}`);
      }
    } catch (e) {
      console.log(
        `❌ Server API: Unreachable at ${configuration.SERVER_API_URL}. Is the server running?`,
      );
    }
  } catch (error) {
    console.error("\nCritical error during diagnostics:", error.message);
  } finally {
    await browser.close();
    console.log("\n=== Diagnostics Summary ===");
    console.log(`CineStar API: ${results.cinestarApi ? "OK" : "FAILED"}`);
    console.log(`Letterboxd:   ${results.letterboxd ? "OK" : "FAILED"}`);
    console.log(`IMDb:         ${results.imdb ? "OK" : "FAILED"}`);
    console.log(`Server API:   ${results.serverApi ? "OK" : "FAILED"}`);

    if (Object.values(results).every((v) => v)) {
      console.log("\n🎉 All systems go! The scraper should work perfectly.");
    } else {
      console.log("\n⚠️ Some checks failed. Please investigate the errors above.");
    }
  }
}

function sanitizeForFilename(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

function detectImdbBlockMarkers(html) {
  if (!html || typeof html !== "string") return [];
  const lower = html.toLowerCase();
  const markers = [
    "captcha",
    "verify you are human",
    "robot",
    "automated access",
    "access denied",
    "consent",
    "privacy choices",
    "unusual traffic",
  ];
  return markers.filter((m) => lower.includes(m));
}

function extractHtmlTitle($) {
  try {
    const t = $("title").first().text().trim();
    return t || null;
  } catch {
    return null;
  }
}

function analyzeImdbHtml(html) {
  const $ = cheerio.load(html || "");
  const scripts = $("script[type='application/ld+json']");
  let hasAggregateRating = false;

  scripts.each((_, el) => {
    if (hasAggregateRating) return;
    const raw = $(el).text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        if (c && c.aggregateRating && c.aggregateRating.ratingValue != null) {
          hasAggregateRating = true;
          break;
        }
      }
    } catch {
      // ignore individual script parse failures
    }
  });

  return {
    title: extractHtmlTitle($),
    ldJsonCount: scripts.length,
    hasAggregateRating,
    blockMarkers: detectImdbBlockMarkers(html),
  };
}

async function captureImdbForensics({ artifactsDir, imdbUrl }) {
  await fs.mkdir(artifactsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = `${sanitizeForFilename(imdbUrl)}_${timestamp}`;
  const basePath = path.join(artifactsDir, `imdb_${slug}`);
  const htmlPath = `${basePath}.html`;
  const metaPath = `${basePath}.json`;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  let response = null;
  let html = "";
  let error = null;

  try {
    response = await fetch(imdbUrl, { headers });
    html = await response.text();
  } catch (e) {
    error = e;
  }

  const analysis = analyzeImdbHtml(html);
  const meta = {
    kind: "imdb_forensics",
    timestamp: new Date().toISOString(),
    imdbUrl,
    httpStatus: response ? response.status : null,
    finalUrl: response ? response.url : null,
    contentType: response ? response.headers.get("content-type") : null,
    htmlLength: html ? html.length : 0,
    title: analysis.title,
    ldJsonCount: analysis.ldJsonCount,
    hasAggregateRating: analysis.hasAggregateRating,
    blockMarkers: analysis.blockMarkers,
    error: error ? String(error && error.message ? error.message : error) : null,
    artifacts: {
      htmlPath,
      metaPath,
    },
  };

  try {
    await fs.writeFile(htmlPath, html || "", "utf8");
  } catch (e) {
    meta.artifacts.htmlWriteError = String(e && e.message ? e.message : e);
  }

  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

runDiagnostics();
