const assert = require("node:assert/strict");
const test = require("node:test");
const { pickBestMatch } = require("../modules/tmdb/matching.js");
const { getTargetYearFromMovie } = require("../modules/tmdb/utils.js");

test("matching year prefers production year and falls back to source dates", () => {
  assert.equal(
    getTargetYearFromMovie({ productionYear: "2010", nationwideStart: "2026-11-30" }),
    2010,
  );
  assert.equal(getTargetYearFromMovie({ productionYear: 2021 }), 2021);
  assert.equal(getTargetYearFromMovie({ nationwideStart: "1999-03-31" }), 1999);
  for (const productionYear of [undefined, null, "", "unknown", "2026.5", 0, 1800]) {
    assert.equal(
      getTargetYearFromMovie({ productionYear, nationwideStart: "2026-11-30" }),
      2026,
    );
  }
  assert.equal(getTargetYearFromMovie({ releaseDate: "2001-06-06" }), 2001);
  assert.equal(getTargetYearFromMovie({}), null);
});

test("exact Matrix title and year beat a sequel", () => {
  const movie = {
    originalTitle: "The Matrix",
    title: "Matrix",
    nationwideStart: "1999-03-31",
  };
  const results = [
    {
      id: 604,
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
  assert.equal(
    pickBestMatch({ movie, results, targetYear: getTargetYearFromMovie(movie) })?.id,
    603,
  );
});

test("year window distinguishes Dune adaptations", () => {
  const movie = {
    originalTitle: "Dune",
    title: "Dune",
    nationwideStart: "2021-09-03",
  };
  const results = [
    {
      id: 841,
      title: "Dune",
      original_title: "Dune",
      release_date: "1984-12-14",
      popularity: 30,
      poster_path: "/a.jpg",
    },
    {
      id: 438631,
      title: "Dune",
      original_title: "Dune",
      release_date: "2021-09-15",
      popularity: 300,
      poster_path: "/b.jpg",
    },
  ];
  assert.equal(
    pickBestMatch({ movie, results, targetYear: getTargetYearFromMovie(movie) })?.id,
    438631,
  );
});
