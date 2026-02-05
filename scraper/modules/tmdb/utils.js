function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Normalize titles for fuzzy matching.
// - lower-case
// - remove diacritics
// - keep only a-z0-9 and spaces
function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const norm = normalizeTitle(value);
  if (!norm) return [];
  return norm.split(" ").filter(Boolean);
}

// Compute Jaccard similarity between two token arrays.
function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

function parseYearFromDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = dateStr.match(/^(\d{4})-/);
  if (!m) return null;
  const year = Number(m[1]);
  return Number.isFinite(year) ? year : null;
}

// Best-effort extraction of a year to use for matching.
function getTargetYearFromMovie(movie) {
  // CineStar payload often has `nationwideStart` like YYYY-MM-DD
  const yearFromNationwideStart = parseYearFromDate(movie?.nationwideStart);
  if (yearFromNationwideStart) return yearFromNationwideStart;

  const yearFromProductionYear = Number(movie?.productionYear);
  if (Number.isFinite(yearFromProductionYear) && yearFromProductionYear > 1800) {
    return yearFromProductionYear;
  }

  const yearFromReleaseDate = parseYearFromDate(movie?.releaseDate);
  if (yearFromReleaseDate) return yearFromReleaseDate;

  return null;
}

module.exports = {
  sleep,
  normalizeTitle,
  tokenize,
  jaccard,
  parseYearFromDate,
  getTargetYearFromMovie,
};
