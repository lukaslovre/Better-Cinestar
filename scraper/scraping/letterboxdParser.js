const cheerio = require("cheerio");

function parseYearFromMetadata(text) {
  if (!text) return null;
  const match = String(text).match(/\b(\d{4})\b/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  return Number.isFinite(year) ? year : null;
}

function normalizeLetterboxdUrl(href) {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/")) return `https://letterboxd.com${href}`;
  return href;
}

/**
 * Pure parser for the Letterboxd film search HTML.
 *
 * @param {string} html
 * @returns {{title: string, year: (number|null), url: string}[]}
 */
function parseLetterboxdSearchResults(html) {
  if (!html || typeof html !== "string") return [];

  const $ = cheerio.load(html);
  const results = [];

  $("ul.results li").each((_, element) => {
    const titleElement = $(element).find(".film-title-wrapper > a").first();
    const yearElement = $(element).find(".film-title-wrapper > .metadata").first();

    const title = titleElement.text().trim();
    const url = normalizeLetterboxdUrl(titleElement.attr("href") || "");
    const year = parseYearFromMetadata(yearElement.text());

    results.push({
      title,
      year,
      url,
    });
  });

  return results;
}

module.exports = {
  parseLetterboxdSearchResults,
};
