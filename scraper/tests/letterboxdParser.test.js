const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { parseLetterboxdSearchResults } = require("../scraping/letterboxdParser.js");

function readFixture(name) {
  const filePath = path.join(__dirname, "fixtures", name);
  return fs.readFileSync(filePath, "utf8");
}

(function test_parseLetterboxdSearchResults_basic() {
  const html = readFixture("letterboxd-search.html");
  const results = parseLetterboxdSearchResults(html);

  assert.ok(Array.isArray(results));
  assert.strictEqual(results.length, 3);

  assert.deepStrictEqual(results[0], {
    title: "The Matrix",
    year: 1999,
    url: "https://letterboxd.com/film/the-matrix/",
  });

  assert.deepStrictEqual(results[1], {
    title: "The Matrix Reloaded",
    year: 2003,
    url: "https://letterboxd.com/film/the-matrix-reloaded/",
  });

  assert.deepStrictEqual(results[2], {
    title: "Matrix",
    year: 1993,
    url: "https://letterboxd.com/film/matrix/",
  });

  console.log("OK: parseLetterboxdSearchResults parses fixture HTML");
})();
