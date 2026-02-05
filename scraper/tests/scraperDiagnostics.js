require("dotenv").config();
const { launchBrowser } = require("../modules/browser/browser.js");
const { configuration } = require("../config/environment.js");
const { getCinemas } = require("../utils/cinemasList.js");
const axios = require("axios");
const {
  runTmdbDiagnostics,
  DEFAULT_TMDB_DIAGNOSTIC_MOVIES,
} = require("./tmdbDiagnostics.js");

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
    tmdb: false,
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

    // 2. Check TMDB (via real enrichment code paths)
    console.log("\n[2/3] Checking TMDB via scraper enrichment...");
    try {
      const sampleMovie = DEFAULT_TMDB_DIAGNOSTIC_MOVIES[0];
      const tmdbResult = await runTmdbDiagnostics({
        sampleMovies: [sampleMovie],
        requireAllMatch: true,
        printHeader: false,
        printPerMovie: false,
      });

      if (tmdbResult.ok) {
        const matchedMovie = tmdbResult.movies.find((m) => m.tmdb_movie_id);
        console.log(
          `✅ TMDB: Matched movie id: ${matchedMovie?.tmdb_movie_id || "(unknown)"}`,
        );
        results.tmdb = true;
      } else {
        console.log(`❌ TMDB: ${tmdbResult.reason || "No match returned."}`);
      }
    } catch (e) {
      console.log(`❌ TMDB: Enrichment path failed: ${e.message}`);
    }

    // 3. Check Server API
    console.log("\n[3/3] Checking Local Server API...");
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
    console.log(`TMDB:         ${results.tmdb ? "OK" : "FAILED"}`);
    console.log(`Server API:   ${results.serverApi ? "OK" : "FAILED"}`);

    if (Object.values(results).every((v) => v)) {
      console.log("\n🎉 All systems go! The scraper should work perfectly.");
    } else {
      console.log("\n⚠️ Some checks failed. Please investigate the errors above.");
    }
  }
}

runDiagnostics();
