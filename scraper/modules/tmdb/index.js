// Public entrypoint for TMDB metadata enrichment.
//
// Exports a single function to keep integration points minimal.
const { fillMoviesWithTmdbData } = require("./enrichment.js");

module.exports = {
  fillMoviesWithTmdbData,
};
