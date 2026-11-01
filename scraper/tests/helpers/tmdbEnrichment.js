const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { createDecision } = require("../../modules/tmdb/diagnostics.js");

const directory = path.resolve(__dirname, "../../modules/tmdb");

function loadModule(name, overrides) {
  const filename = path.join(directory, name);
  const localRequire = createRequire(filename);
  const context = {
    module: { exports: {} },
    require: (request) => overrides[request] || localRequire(request),
    console: { log() {} },
  };
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), context, { filename });
  return context.module.exports;
}

function createTestEnricher(client) {
  const config = {
    configuration: {
      TMDB_API_KEY: "fixture",
      TMDB_LANGUAGE_PRIMARY: "hr-HR",
      TMDB_LANGUAGE_FALLBACK: "en-US",
      TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/",
      TMDB_POSTER_SIZE: "w500",
      TMDB_PROFILE_SIZE: "w185",
    },
  };
  const decisions = [];
  const { fillMoviesWithTmdbData } = loadModule("enrichment.js", {
    "../../config/environment.js": config,
    "./tmdbClient.js": client,
    "./mappers.js": loadModule("mappers.js", {
      "../../config/environment.js": config,
    }),
    "./diagnostics.js": {
      logTmdbDecision: (movie) => decisions.push(createDecision(movie)),
    },
  });
  return { fillMoviesWithTmdbData, decisions };
}

module.exports = { createTestEnricher };
