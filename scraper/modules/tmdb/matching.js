const { normalizeTitle, tokenize, jaccard, parseYearFromDate } = require("./utils.js");

function scoreCandidateBreakdown({ movie, tmdbItem, targetYear }) {
  const cineTitles = [movie?.originalTitle, movie?.title, movie?.name].filter(Boolean);
  const tmdbTitles = [tmdbItem?.original_title, tmdbItem?.title].filter(Boolean);

  const bestTitleScore = (() => {
    let best = 0;
    for (const a of cineTitles) {
      for (const b of tmdbTitles) {
        const na = normalizeTitle(a);
        const nb = normalizeTitle(b);
        if (!na || !nb) continue;
        if (na === nb) return 100;

        const tokA = tokenize(a);
        const tokB = tokenize(b);
        const jac = jaccard(tokA, tokB);
        let s = jac * 60;

        if (na.includes(nb) || nb.includes(na)) s += 20;

        if (tokA[0] && tokB[0] && tokA[0] === tokB[0]) s += 5;

        if (s > best) best = s;
      }
    }
    return best;
  })();

  const candidateYear = parseYearFromDate(tmdbItem?.release_date);
  let yearScore = 0;
  if (targetYear && candidateYear) {
    const diff = Math.abs(targetYear - candidateYear);
    if (diff === 0) yearScore = 12;
    else if (diff === 1) yearScore = 8;
    else if (diff === 2) yearScore = 4;
    else yearScore = -20;
  }

  const popularity = Number(tmdbItem?.popularity || 0);
  const popularityScore = Number.isFinite(popularity)
    ? Math.min(10, Math.log10(popularity + 1) * 5)
    : 0;

  const posterBonus = tmdbItem?.poster_path ? 2 : 0;

  const total = bestTitleScore + yearScore + popularityScore + posterBonus;
  return {
    titleScore: bestTitleScore,
    yearScore,
    popularityScore,
    posterBonus,
    totalScore: total,
  };
}

function computeCandidates({ movie, results, targetYear }) {
  if (!Array.isArray(results) || results.length === 0) return [];

  // Apply the same year-window filtering used by pickBestMatch (±2 years)
  const filtered = targetYear
    ? results.filter((r) => {
        const y = parseYearFromDate(r?.release_date);
        return y ? Math.abs(targetYear - y) <= 2 : true;
      })
    : results;

  const candidates = filtered.map((item) => {
    const breakdown = scoreCandidateBreakdown({ movie, tmdbItem: item, targetYear });
    return {
      id: item?.id ?? null,
      title: item?.title ?? null,
      original_title: item?.original_title ?? null,
      release_date: item?.release_date ?? null,
      poster_path: item?.poster_path ?? null,
      popularity: item?.popularity ?? null,
      score: breakdown.totalScore,
      breakdown,
    };
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function pickBestMatch({ movie, results, targetYear }) {
  const candidates = computeCandidates({ movie, results, targetYear });
  if (candidates.length === 0) return null;
  const best = candidates[0];
  if (!best || best.score < 45) return null;
  // convert back to a TMDB-like item shape minimal
  return {
    id: best.id,
    title: best.title,
    original_title: best.original_title,
    release_date: best.release_date,
    poster_path: best.poster_path,
    popularity: best.popularity,
  };
}

module.exports = {
  pickBestMatch,
  computeCandidates,
};
