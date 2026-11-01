const assert = require("node:assert/strict");
const test = require("node:test");
const { pickBestMatch } = require("../modules/tmdb/matching.js");
const { getTargetYearFromMovie } = require("../modules/tmdb/utils.js");
const { cases } = require("./fixtures/tmdb-regressions.json");

for (const { name, source, results, expectedTmdbId } of cases) {
  test(`TMDB regression: ${source.title} — ${name}`, () => {
    const match = pickBestMatch({
      movie: source,
      results,
      targetYear: getTargetYearFromMovie(source),
    });
    assert.equal(match?.id, expectedTmdbId);
  });
}

test("RBO work-title alias is scoped to opera/ballet and preserves the full title", () => {
  const { source, results, expectedTmdbId } = cases.find(
    (entry) => entry.source.filmNumber === 6152,
  );
  const args = {
    movie: source,
    results,
    targetYear: getTargetYearFromMovie(source),
  };
  const match = pickBestMatch(args);
  assert.equal(match?.id, expectedTmdbId);
  assert.equal(match.title, "Royal Ballet & Opera 2025/26: Giselle");
  for (const genres of [undefined, "Balet", ["Drama"]]) {
    assert.equal(pickBestMatch({ ...args, movie: { ...source, genres } }), null);
  }
});
