const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Exercise the real formatter with controlled ORM boundaries, without app/database init.
function loadFormatter({ movies, performances, dateRows }) {
  const apiPath = require.resolve('../api');
  const cached = new Map();
  const calls = [];
  function stub(relative, exports) {
    const filename = require.resolve(path.resolve(__dirname, relative));
    cached.set(filename, require.cache[filename]);
    require.cache[filename] = { id: filename, filename, loaded: true, exports };
  }
  delete require.cache[apiPath];
  stub('../api/performances', {
    getPerformancesFiltered: async () => performances,
    groupPerformancesByFilmid: (items) => movies.map((m) => ({
      filmId: m.id, performances: items.filter((p) => p.filmId === m.id),
    })),
    filterPerformancesByEarliestDate: () => {},
  });
  stub('../api/movies', {
    getMoviesByIds: async () => structuredClone(movies),
    sortMovies: (items) => items.sort((a, b) => b.tmdb_rating - a.tmdb_rating),
  });
  stub('../db/db', {
    getPerformanceDatesForMovies: async (...args) => {
      calls.push(args);
      return dateRows;
    },
  });
  const fn = require(apiPath).getFormattedMovies;
  for (const [filename, entry] of cached) {
    if (entry) require.cache[filename] = entry;
    else delete require.cache[filename];
  }
  delete require.cache[apiPath];
  return { fn, calls };
}

for (const date of ['any', '2999-01-02']) {
  test(`union across selected cinemas, sorted and deduplicated (${date})`, async () => {
    const movies = [{ id: '7', name: 'Film', tmdb_rating: 8 }, { id: '8', tmdb_rating: 9 }];
    const performances = [{ filmId: '7', cinemaOid: 'a', id: 'performance' }];
    const { fn, calls } = loadFormatter({ movies, performances, dateRows: [
      { filmId: 7, date: ['2999-01-03', '2000-01-01', '2999-01-02'] },
      { filmId: '7', date: ['2999-01-04', '2999-01-02', null] },
      { filmId: '8', date: null },
    ] });
    const result = await fn(['a', 'b'], date, 'tmdb_rating');
    assert.deepEqual(result, [
      { ...movies[1], performances: [], availableDates: [] },
      { ...movies[0], performances, availableDates: ['2999-01-02', '2999-01-03', '2999-01-04'] },
    ]);
    assert.deepEqual(calls, [[['a', 'b'], ['7', '8']]]);
  });
}

test('single cinema and missing date rows preserve fields and return empty dates', async () => {
  const { fn } = loadFormatter({ movies: [{ id: 'x', extra: null }], performances: [], dateRows: [] });
  assert.deepEqual(await fn(['a'], 'any'), [{ id: 'x', extra: null, performances: [], availableDates: [] }]);
});

test('empty selection / no movies returns an empty result', async () => {
  const { fn } = loadFormatter({ movies: [], performances: [], dateRows: [] });
  assert.deepEqual(await fn([], 'any'), []);
});
