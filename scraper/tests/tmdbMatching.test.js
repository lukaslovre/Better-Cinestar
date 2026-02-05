const assert = require("assert");

const { pickBestMatch } = require("../modules/tmdb/matching.js");
const { getTargetYearFromMovie } = require("../modules/tmdb/utils.js");

(function test_getTargetYearFromMovie() {
  assert.strictEqual(
    getTargetYearFromMovie({ nationwideStart: "1999-03-31" }),
    1999,
  );
  assert.strictEqual(getTargetYearFromMovie({ productionYear: "2021" }), 2021);
  assert.strictEqual(getTargetYearFromMovie({}), null);

  console.log("OK: getTargetYearFromMovie extracts years");
})();

(function test_pickBestMatch_prefers_exact_title_and_year() {
  const movie = {
    originalTitle: "The Matrix",
    title: "Matrix",
    nationwideStart: "1999-03-31",
  };

  const targetYear = getTargetYearFromMovie(movie);

  const results = [
    {
      id: 1,
      title: "The Matrix Reloaded",
      original_title: "The Matrix Reloaded",
      release_date: "2003-05-15",
      popularity: 80,
      poster_path: "/x.jpg",
    },
    {
      id: 603,
      title: "The Matrix",
      original_title: "The Matrix",
      release_date: "1999-03-30",
      popularity: 200,
      poster_path: "/y.jpg",
    },
  ];

  const match = pickBestMatch({ movie, results, targetYear });
  assert.ok(match);
  assert.strictEqual(match.id, 603);

  console.log("OK: pickBestMatch selects expected TMDB result");
})();

(function test_pickBestMatch_respects_year_window() {
  const movie = {
    originalTitle: "Dune",
    title: "Dune",
    nationwideStart: "2021-09-03",
  };

  const targetYear = getTargetYearFromMovie(movie);

  const results = [
    {
      id: 111,
      title: "Dune",
      original_title: "Dune",
      release_date: "1984-12-14",
      popularity: 30,
      poster_path: "/a.jpg",
    },
    {
      id: 222,
      title: "Dune",
      original_title: "Dune",
      release_date: "2021-09-15",
      popularity: 300,
      poster_path: "/b.jpg",
    },
  ];

  const match = pickBestMatch({ movie, results, targetYear });
  assert.ok(match);
  assert.strictEqual(match.id, 222);

  console.log("OK: pickBestMatch prefers within ±2-year window");
})();
