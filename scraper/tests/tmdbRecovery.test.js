const assert = require("node:assert/strict");
const test = require("node:test");
const {
  matchesAlternativeTitleAndDirector,
} = require("../modules/tmdb/matching.js");
const { createTestEnricher } = require("./helpers/tmdbEnrichment.js");
const { cases } = require("./fixtures/tmdb-recovery.json");

async function enrich(entry, overrides = {}) {
  const calls = { searches: [], identities: [], details: [] };
  const client = {
    async searchMovie({ query, language }) {
      calls.searches.push({ query, language });
      assert.equal(query, entry.source.originalTitle);
      return {
        results: entry.searches.find((search) => search.language === language)
          .results,
      };
    },
    async fetchMovieIdentity({ tmdbId }) {
      calls.identities.push(tmdbId);
      assert.ok(
        entry.identities[tmdbId],
        `Missing identity fixture: ${tmdbId}`,
      );
      return entry.identities[tmdbId];
    },
    async fetchMovieDetails({ tmdbId }) {
      calls.details.push(tmdbId);
      return { ...entry.identities[tmdbId], overview: "Film synopsis" };
    },
    ...overrides,
  };
  const { fillMoviesWithTmdbData, decisions } = createTestEnricher(client);
  const movie = structuredClone(entry.source);
  await fillMoviesWithTmdbData([movie]);
  return { movie, calls, decision: decisions[0] };
}

for (const entry of cases) {
  test(`TMDB enrichment: ${entry.source.title}`, async () => {
    const { movie, calls, decision } = await enrich(entry);
    assert.equal(movie.tmdb_movie_id, entry.expectedTmdbId);
    assert.equal(decision.status, "matched");
    assert.equal(
      decision.reason,
      entry.recovery ? "alternative_title_and_director" : null,
    );
    assert.equal(calls.identities.length, entry.recovery ? 1 : 0);
    assert.equal(calls.details[0], entry.expectedTmdbId);
  });
}

const fellini = cases.find((entry) => entry.expectedTmdbId === 422);

test("alternative title requires the director and a dated candidate within the year window", () => {
  const details = fellini.identities[422];
  const args = {
    movie: fellini.source,
    query: fellini.source.originalTitle,
    details,
    targetYear: 1963,
  };
  assert.equal(matchesAlternativeTitleAndDirector(args), true);
  for (const change of [
    { movie: { director: "Alfred Hitchcock" } },
    { movie: { director: "Federico Fellini Jr" } },
    { movie: {} },
    { query: "Otto e Mezzo sequel" },
    { query: "千と千尋の神隠し" },
    { targetYear: null },
    { targetYear: 2026 },
    { details: { ...details, release_date: null } },
    { details: { ...details, credits: { crew: [] } } },
    { details: { ...details, alternative_titles: { titles: [] } } },
    {
      details: {
        ...details,
        credits: { crew: [{ job: "Writer", name: "Federico Fellini" }] },
      },
    },
  ]) {
    assert.equal(
      matchesAlternativeTitleAndDirector({ ...args, ...change }),
      false,
    );
  }
  assert.equal(
    matchesAlternativeTitleAndDirector({
      ...args,
      movie: { director: "Another Director, Fédérico Fellini" },
    }),
    true,
  );
});

test("recovery skips inputs without a director or candidates without an eligible date", async () => {
  for (const change of [
    { source: { ...fellini.source, director: undefined } },
    { source: { ...fellini.source, productionYear: "1980" } },
    {
      searches: fellini.searches.map((search) => ({
        ...search,
        results: search.results.map((candidate) => ({
          ...candidate,
          release_date: null,
        })),
      })),
    },
  ]) {
    const { movie, calls } = await enrich({ ...fellini, ...change });
    assert.equal(movie.tmdb_movie_id, null);
    assert.equal(calls.identities.length, 0);
  }
});

test("two identities with the same alternative title and director remain unmatched", async () => {
  const otherId = 900000001;
  const other = {
    ...fellini.searches[0].results.find((candidate) => candidate.id === 422),
    id: otherId,
  };
  const entry = {
    ...fellini,
    searches: fellini.searches.map((search) => ({
      ...search,
      results: [...search.results, other],
    })),
    identities: {
      ...fellini.identities,
      [otherId]: { ...fellini.identities[422], id: otherId },
    },
  };
  const { movie, calls } = await enrich(entry);
  assert.equal(movie.tmdb_movie_id, null);
  assert.equal(calls.identities.length, 2);
  assert.equal(new Set(calls.identities).size, 2);

  const incomplete = await enrich(entry, {
    async fetchMovieIdentity({ tmdbId }) {
      if (tmdbId === otherId) throw new Error("Identity unavailable");
      return entry.identities[tmdbId];
    },
  });
  assert.equal(incomplete.movie.tmdb_movie_id, null);
  assert.equal(incomplete.decision.reason, "identity_lookup_incomplete");
});

test("an incomplete search or identity lookup leaves recovery unmatched", async () => {
  for (const overrides of [
    {
      async searchMovie({ language }) {
        if (language === "hr-HR") throw new Error("Search unavailable");
        return { results: fellini.searches[0].results };
      },
    },
    {
      async fetchMovieIdentity() {
        throw new Error("Identity unavailable");
      },
    },
  ]) {
    const { movie, decision } = await enrich(fellini, overrides);
    assert.equal(movie.tmdb_movie_id, null);
    assert.equal(decision.status, "search_error");
  }
});

test("recovery checks at most three distinct candidates per language", async () => {
  const identities = [];
  const searches = ["en-US", "hr-HR"].map((language, index) => ({
    language,
    results: Array.from({ length: 5 }, (_, offset) => ({
      id: 900000010 + index * 5 + offset,
      title: "Unrelated candidate",
      original_title: "Unrelated candidate",
      release_date: "1963-01-01",
    })),
  }));
  const { movie } = await enrich(
    { ...fellini, searches },
    {
      async fetchMovieIdentity({ tmdbId }) {
        identities.push(tmdbId);
        return {
          id: tmdbId,
          release_date: "1963-01-01",
          credits: { crew: [] },
        };
      },
    },
  );
  assert.equal(movie.tmdb_movie_id, null);
  assert.equal(identities.length, 6);
  assert.deepEqual(
    identities,
    [900000010, 900000011, 900000012, 900000015, 900000016, 900000017],
  );
});
