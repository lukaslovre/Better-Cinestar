const { configuration } = require("../../config/environment.js");
const { getTargetYearFromMovie, parseYearFromDate } = require("./utils.js");
const { logTmdbDecision } = require("./diagnostics.js");
const {
  searchMovie,
  fetchMovieDetails,
  fetchMovieIdentity,
} = require("./tmdbClient.js");
const {
  pickBestMatch,
  computeCandidates,
  matchesAlternativeTitleAndDirector,
} = require("./matching.js");
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
    tmdb_backdrop_urls: [],
    tmdb_cast: null,
    tmdb_directors: null,
    tmdb_trailer_url: null,
  };
}
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
  const decision = {
    targetYear,
    query: query || null,
    searches: [],
    selectedId: null,
    status: "missing_query",
  };
  // Internal diagnostics must not become part of the server or dry-run payload.
  Object.defineProperty(movie, "tmdbDecision", {
    value: decision,
    configurable: true,
  });

  if (!query) return nullEnrichment();

  if (!configuration.TMDB_API_KEY) {
    decision.status = "missing_api_key";
    return nullEnrichment();
  }

  const primaryLang = configuration.TMDB_LANGUAGE_PRIMARY;
  const fallbackLang = configuration.TMDB_LANGUAGE_FALLBACK;

  let search = null;
  const firstSearch = {
    language: fallbackLang,
    status: "search_error",
    candidates: [],
  };
  decision.searches.push(firstSearch);
  try {
    search = await searchMovie({ query, year: targetYear, language: fallbackLang });
  } catch {
    decision.status = "search_error";
    return nullEnrichment();
  }

  const results = Array.isArray(search?.results) ? search.results : [];
  // Keep legacy candidate payload names; diagnostic searches use the actual language.
  const primaryCandidates = computeCandidates({ movie, results, targetYear });
  Object.assign(firstSearch, {
    status: "ok",
    resultCount: results.length,
    candidates: primaryCandidates,
  });
  let match = pickBestMatch({ movie, results, targetYear });

  let fallbackCandidates = null;
  if (!match && primaryLang !== fallbackLang) {
    const secondSearch = {
      language: primaryLang,
      status: "search_error",
      candidates: [],
    };
    decision.searches.push(secondSearch);
    try {
      const searchFallback = await searchMovie({
        query,
        year: targetYear,
        language: primaryLang,
      });
      const resultsFallback = Array.isArray(searchFallback?.results)
        ? searchFallback.results
        : [];
      fallbackCandidates = computeCandidates({
        movie,
        results: resultsFallback,
        targetYear,
      });
      Object.assign(secondSearch, {
        status: "ok",
        resultCount: resultsFallback.length,
        candidates: fallbackCandidates,
      });
      match = pickBestMatch({ movie, results: resultsFallback, targetYear });
    } catch {
      // ignore
    }
  }

  let identityLookupFailed = false;
  if (
    !match &&
    movie.director &&
    targetYear &&
    decision.searches.every((search) => search.status === "ok")
  ) {
    const shortlist = new Map();
    for (const candidates of [primaryCandidates, fallbackCandidates]) {
      for (const candidate of (candidates || [])
        .filter((candidate) => parseYearFromDate(candidate.release_date))
        .slice(0, 3)) {
        shortlist.set(candidate.id, candidate);
      }
    }
    const recovered = [];
    for (const candidate of shortlist.values()) {
      try {
        const details = await fetchMovieIdentity({
          tmdbId: candidate.id,
          language: fallbackLang,
        });
        if (
          matchesAlternativeTitleAndDirector({
            movie,
            query,
            details,
            targetYear,
          })
        ) {
          recovered.push(candidate);
        }
      } catch {
        identityLookupFailed = true;
      }
    }
    if (!identityLookupFailed && recovered.length === 1) {
      match = recovered[0];
      decision.reason = "alternative_title_and_director";
    }
  }

  // Attach diagnostics to the movie for inclusion in dry-run artifacts / payload
  try {
    Object.defineProperty(movie, "tmdb_search_candidates", {
      value: { primary: primaryCandidates, fallback: fallbackCandidates },
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } catch {
    // ignore if movie object cannot be extended
  }

  if (!match?.id) {
    if (identityLookupFailed) {
      decision.status = "search_error";
      decision.reason = "identity_lookup_incomplete";
    } else if (decision.searches.some((s) => s.status === "search_error")) {
      decision.status = "search_error";
      decision.reason = "search_incomplete";
    } else {
      decision.status = "no_match";
      if (decision.searches.every((s) => s.resultCount === 0)) {
        decision.reason = "no_results";
      } else if (decision.searches.every((s) => s.candidates.length === 0)) {
        decision.reason = "outside_year_window";
      } else {
        decision.reason = "below_threshold";
      }
    }
    return nullEnrichment();
  }

  decision.selectedId = match.id;
  // If details throw, the caller keeps the source film and this selected ID.
  decision.status = "details_error";
  const { details } = await fetchMovieDetailsWithFallback(match.id);

  const posterPath = details?.poster_path ?? match?.poster_path ?? null;
  const rating = details?.vote_average ?? match?.vote_average ?? null;
  const voteCount = details?.vote_count ?? match?.vote_count ?? null;

  const genres = Array.isArray(details?.genres)
    ? details.genres.map((g) => ({ id: g.id ?? null, name: g.name ?? null }))
    : null;

  const { tmdb_cast, tmdb_directors } = mapCredits(details?.credits);
  const backdropPaths = Array.isArray(details?.images?.backdrops)
    ? details.images.backdrops.map((image) => image?.file_path).filter(Boolean)
    : [];
  const tmdb_backdrop_urls = [...new Set(backdropPaths)]
    .slice(0, 6)
    .map((path) => buildImageUrl(path, "w780"));

  const tmdb_trailer_url = pickBestTrailerUrl(
    details?.videos,
    configuration.TMDB_LANGUAGE_PRIMARY,
  );

  decision.status = "matched";
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
    tmdb_backdrop_urls,
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

    try {
      const enrichment = await enrichMovieWithTmdb(movie);
      Object.assign(movie, enrichment);
    } catch {
      Object.assign(movie, nullEnrichment());
    }
    logTmdbDecision(movie);
  }

  return movies;
}

module.exports = {
  fillMoviesWithTmdbData,
};
