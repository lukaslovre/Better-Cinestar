const { configuration } = require("../../config/environment.js");
const { getTargetYearFromMovie } = require("./utils.js");
const { searchMovie, fetchMovieDetails } = require("./tmdbClient.js");
const { pickBestMatch } = require("./matching.js");
const {
  buildImageUrl,
  tmdbMovieUrl,
  pickBestTrailerUrl,
  mapCredits,
} = require("./mappers.js");

function nullEnrichment() {
  return {
    tmdb_movie_id: null,
    tmdb_url: null,
    tmdb_rating: null,
    tmdb_vote_count: null,
    tmdb_synopsis: null,
    tmdb_genres: null,
    tmdb_runtime: null,
    tmdb_poster_path: null,
    tmdb_poster_url: null,
    tmdb_cast: null,
    tmdb_directors: null,
    tmdb_trailer_url: null,
  };
}
// TODO: UNderstand this
async function fetchMovieDetailsWithFallback(tmdbId) {
  const primary = configuration.TMDB_LANGUAGE_PRIMARY;
  const fallback = configuration.TMDB_LANGUAGE_FALLBACK;

  const detailsPrimary = await fetchMovieDetails({ tmdbId, language: primary });

  const overviewPrimary = String(detailsPrimary?.overview || "").trim();
  if (overviewPrimary) {
    return { details: detailsPrimary, usedLanguage: primary };
  }

  const detailsFallback = await fetchMovieDetails({ tmdbId, language: fallback });

  // Merge fallback overview/tagline into primary details.
  const merged = {
    ...detailsPrimary,
    overview: detailsFallback?.overview || detailsPrimary?.overview,
    tagline: detailsFallback?.tagline || detailsPrimary?.tagline,
  };

  return { details: merged, usedLanguage: fallback };
}

async function enrichMovieWithTmdb(movie) {
  const targetYear = getTargetYearFromMovie(movie);
  const query = movie?.originalTitle || movie?.title || movie?.name;

  if (!query) return nullEnrichment();

  const primaryLang = configuration.TMDB_LANGUAGE_PRIMARY;
  const fallbackLang = configuration.TMDB_LANGUAGE_FALLBACK;

  let search = null;
  try {
    search = await searchMovie({ query, year: targetYear, language: primaryLang });
  } catch (e) {
    console.warn(`[tmdb] Search failed for "${query}": ${e.message}`);
    return nullEnrichment();
  }

  const results = Array.isArray(search?.results) ? search.results : [];
  let match = pickBestMatch({ movie, results, targetYear });

  if (!match && primaryLang !== fallbackLang) {
    try {
      const searchFallback = await searchMovie({
        query,
        year: targetYear,
        language: fallbackLang,
      });
      const resultsFallback = Array.isArray(searchFallback?.results)
        ? searchFallback.results
        : [];
      match = pickBestMatch({ movie, results: resultsFallback, targetYear });
    } catch (_) {
      // ignore
    }
  }

  if (!match?.id) return nullEnrichment();

  const { details } = await fetchMovieDetailsWithFallback(match.id);
  console.log(details);

  const posterPath = details?.poster_path ?? match?.poster_path ?? null;
  const rating = details?.vote_average ?? match?.vote_average ?? null;
  const voteCount = details?.vote_count ?? match?.vote_count ?? null;

  const genres = Array.isArray(details?.genres)
    ? details.genres.map((g) => ({ id: g.id ?? null, name: g.name ?? null }))
    : null;

  const { tmdb_cast, tmdb_directors } = mapCredits(details?.credits);

  const tmdb_trailer_url = pickBestTrailerUrl(
    details?.videos,
    configuration.TMDB_LANGUAGE_PRIMARY,
  );

  return {
    tmdb_movie_id: match.id,
    tmdb_url: tmdbMovieUrl(match.id),
    tmdb_rating: typeof rating === "number" ? rating : null,
    tmdb_vote_count: typeof voteCount === "number" ? voteCount : null,
    tmdb_synopsis: details?.overview ? String(details.overview).trim() : null,
    tmdb_genres: genres,
    tmdb_runtime: typeof details?.runtime === "number" ? details.runtime : null,
    tmdb_poster_path: posterPath,
    tmdb_poster_url: buildImageUrl(posterPath, configuration.TMDB_POSTER_SIZE),
    tmdb_cast,
    tmdb_directors,
    tmdb_trailer_url,
  };
}

async function fillMoviesWithTmdbData(movies) {
  if (!Array.isArray(movies)) movies = [movies];

  console.log(
    `[tmdb] Enriching ${movies.length} movies (lang=${configuration.TMDB_LANGUAGE_PRIMARY}, fallback=${configuration.TMDB_LANGUAGE_FALLBACK})`,
  );

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const name = movie?.originalTitle || movie?.title || movie?.name || "(unknown)";
    const year = getTargetYearFromMovie(movie);

    try {
      const enrichment = await enrichMovieWithTmdb(movie);
      Object.assign(movie, enrichment);
      console.log(
        `[tmdb] ${i + 1}/${movies.length} ${name}${year ? ` (${year})` : ""} -> ${
          movie.tmdb_movie_id ? `matched ${movie.tmdb_movie_id}` : "no match"
        }`,
      );
    } catch (e) {
      console.warn(
        `[tmdb] ${i + 1}/${movies.length} ${name}: enrichment failed: ${e.message}`,
      );
      Object.assign(movie, nullEnrichment());
    }
  }

  return movies;
}

module.exports = {
  fillMoviesWithTmdbData,
};
