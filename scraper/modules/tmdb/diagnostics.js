function createDecision(movie, now = new Date()) {
  const decision = movie.tmdbDecision;
  return {
    timestamp: now.toISOString(),
    source: {
      id: movie.id ?? null,
      filmNumber: movie.filmNumber ?? null,
      title: movie.title ?? null,
      originalTitle: movie.originalTitle ?? null,
      name: movie.name ?? null,
      nationwideStart: movie.nationwideStart ?? null,
      productionYear: movie.productionYear ?? null,
      releaseDate: movie.releaseDate ?? null,
    },
    targetYear: decision?.targetYear ?? null,
    query: decision?.query ?? null,
    status: decision?.status ?? "unavailable",
    reason: decision?.reason ?? null,
    selectedId: decision?.selectedId ?? null,
    searches: (decision?.searches ?? []).map((search) => ({
      language: search.language,
      status: search.status,
      resultCount: search.resultCount ?? null,
      // Existing ranked candidates after the year-window filter.
      candidates: search.candidates.map((candidate) => ({
        id: candidate.id,
        title: candidate.title,
        originalTitle: candidate.original_title,
        releaseDate: candidate.release_date,
        score: candidate.score,
      })),
    })),
  };
}

function logTmdbDecision(movie, logger = console, now = new Date()) {
  logger.log(`[tmdb-decision] ${JSON.stringify(createDecision(movie, now))}`);
}

module.exports = { createDecision, logTmdbDecision };
