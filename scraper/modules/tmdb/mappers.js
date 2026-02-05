const { configuration } = require("../../config/environment.js");

function buildImageUrl(filePath, size) {
  if (!filePath) return null;
  const base = configuration.TMDB_IMAGE_BASE_URL.replace(/\/+$/, "");
  const s = String(size || "w500").replace(/^\/+|\/+$/g, "");
  const p = String(filePath).startsWith("/") ? String(filePath) : `/${filePath}`;
  return `${base}/${s}${p}`;
}

function tmdbPersonUrl(personId) {
  if (!personId) return null;
  return `https://www.themoviedb.org/person/${personId}`;
}

function tmdbMovieUrl(movieId) {
  if (!movieId) return null;
  return `https://www.themoviedb.org/movie/${movieId}`;
}

function pickBestTrailerUrl(videos, preferredLanguage) {
  const list = Array.isArray(videos?.results) ? videos.results : [];
  if (!list.length) return null;

  const preferredIso639_1 = preferredLanguage ? preferredLanguage.slice(0, 2) : null;

  const isYouTube = (v) => String(v?.site || "").toLowerCase() === "youtube";
  const isTrailer = (v) => String(v?.type || "").toLowerCase() === "trailer";

  const candidates = list
    .filter((v) => isYouTube(v) && v?.key)
    .map((v) => ({
      ...v,
      score:
        (isTrailer(v) ? 20 : 0) +
        (v?.official ? 5 : 0) +
        (preferredIso639_1 && v?.iso_639_1 === preferredIso639_1 ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const top = candidates[0];
  if (!top) return null;
  return `https://www.youtube.com/watch?v=${top.key}`;
}

function mapCredits(credits) {
  const cast = Array.isArray(credits?.cast) ? credits.cast : [];
  const crew = Array.isArray(credits?.crew) ? credits.crew : [];

  // Keep the UI payload reasonably small.
  const tmdb_cast = cast.slice(0, 15).map((c) => ({
    id: c.id ?? null,
    name: c.name ?? null,
    character: c.character ?? null,
    order: c.order ?? null,
    profile_path: c.profile_path ?? null,
    profile_url: tmdbPersonUrl(c.id),
    profile_image_url: buildImageUrl(c.profile_path, configuration.TMDB_PROFILE_SIZE),
  }));

  const directors = crew
    .filter((p) => String(p?.job || "").toLowerCase() === "director")
    .map((d) => ({
      id: d.id ?? null,
      name: d.name ?? null,
      job: d.job ?? null,
      department: d.department ?? null,
      profile_path: d.profile_path ?? null,
      profile_url: tmdbPersonUrl(d.id),
      profile_image_url: buildImageUrl(d.profile_path, configuration.TMDB_PROFILE_SIZE),
    }));

  return {
    tmdb_cast,
    tmdb_directors: directors,
  };
}

module.exports = {
  buildImageUrl,
  tmdbPersonUrl,
  tmdbMovieUrl,
  pickBestTrailerUrl,
  mapCredits,
};
