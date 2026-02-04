const puppeteer = require("puppeteer");

async function launchBrowser() {
  console.log("[browser] Launching Chromium...");
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

module.exports = { launchBrowser };
