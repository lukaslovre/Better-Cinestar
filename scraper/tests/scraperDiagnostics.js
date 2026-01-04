require("dotenv").config();
const { launchBrowser } = require("../scraping/browser.js");
const { configuration } = require("../config/environment.js");
const { getCinemas } = require("../utils/cinemasList.js");
const axios = require("axios");

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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
          "❌ CineStar API: Accessible but NOT returning JSON (likely Cloudflare block)."
        );
      }
    } else {
      console.log(`❌ CineStar API: Failed with status ${csResponse.status()}`);
    }
    await page.close();

    // 2. Check Letterboxd
    console.log("\n[2/4] Checking Letterboxd connectivity...");
    try {
      const lbResponse = await fetch("https://letterboxd.com/film/the-matrix/", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (lbResponse.ok) {
        console.log("✅ Letterboxd: Accessible.");
        results.letterboxd = true;
      } else {
        console.log(`❌ Letterboxd: Blocked or down (Status ${lbResponse.status}).`);
      }
    } catch (e) {
      console.log("❌ Letterboxd: Request failed.");
    }

    // 3. Check IMDb
    console.log("\n[3/4] Checking IMDb connectivity...");
    try {
      const imdbResponse = await fetch("https://www.imdb.com/title/tt0133093/", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (imdbResponse.ok) {
        console.log("✅ IMDb: Accessible.");
        results.imdb = true;
      } else {
        console.log(`❌ IMDb: Blocked or down (Status ${imdbResponse.status}).`);
      }
    } catch (e) {
      console.log("❌ IMDb: Request failed.");
    }

    // 4. Check Server API
    console.log("\n[4/4] Checking Local Server API...");
    try {
      const serverResponse = await axios.get(
        configuration.SERVER_API_URL.replace("/scrape-results", "/health")
      );
      if (serverResponse.status === 200) {
        console.log("✅ Server API: Up and healthy.");
        results.serverApi = true;
      } else {
        console.log(`❌ Server API: Responded with status ${serverResponse.status}`);
      }
    } catch (e) {
      console.log(
        `❌ Server API: Unreachable at ${configuration.SERVER_API_URL}. Is the server running?`
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

runDiagnostics();
