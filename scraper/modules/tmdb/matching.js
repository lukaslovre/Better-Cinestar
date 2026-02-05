const { normalizeTitle, tokenize, jaccard, parseYearFromDate } = require("./utils.js");

function scoreCandidate({ movie, tmdbItem, targetYear }) {
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

        // Prefer exact token match on first token for sequels etc.
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

  return bestTitleScore + yearScore + popularityScore + posterBonus;
}

function pickBestMatch({ movie, results, targetYear }) {
  if (!Array.isArray(results) || results.length === 0) return null;

  // Validate year window first (±2), if we have a year.
  const filtered = targetYear
    ? results.filter((r) => {
        const y = parseYearFromDate(r?.release_date);
        return y ? Math.abs(targetYear - y) <= 2 : true;
      })
    : results;

  let best = null;
  let bestScore = -Infinity;

  for (const item of filtered) {
    const score = scoreCandidate({ movie, tmdbItem: item, targetYear });
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  // Threshold prevents wild mismatches on generic titles.
  if (!best || bestScore < 45) return null;
  return best;
}

module.exports = {
  pickBestMatch,
};
