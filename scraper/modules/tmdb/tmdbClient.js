const { configuration } = require("../../config/environment.js");
const { sleep } = require("./utils.js");

async function safeReadText(res) {
  try {
    const text = await res.text();
    return text?.slice(0, 4000) || "";
  } catch {
    return "";
  }
}

// Minimal TMDB v3 client using native fetch().
// We retry on 429 (rate limit) with exponential backoff + jitter.
async function tmdbFetchJson(path, params = {}, options = {}) {
  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch() is not available. Please run the scraper on Node.js 18+",
    );
  }

  const apiKey = configuration.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TMDB_API_KEY is not set. Set it in scraper/.env (or container env).",
    );
  }

  const url = new URL(configuration.TMDB_API_BASE_URL.replace(/\/+$/, "") + path);
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    ),
  });
  url.search = searchParams.toString();

  const {
    maxRetries = 5,
    initialBackoffMs = 500,
    maxBackoffMs = 30_000,
  } = options;

  let attempt = 0;
  let backoffMs = initialBackoffMs;

  while (true) {
    let res;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      const jitter = Math.floor(Math.random() * 250);
      await sleep(Math.min(maxBackoffMs, backoffMs + jitter));
      backoffMs *= 2;
      continue;
    }

    if (res.status === 429) {
      attempt++;
      if (attempt > maxRetries) {
        const msg = await safeReadText(res);
        const error = new Error(
          `TMDB rate limited (429). Retries exhausted. Response: ${msg}`,
        );
        error.status = 429;
        throw error;
      }

      const retryAfterHeader = res.headers.get("retry-after");
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      const retryAfterMs = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : null;

      const jitter = Math.floor(Math.random() * 250);
      const waitMs = Math.min(maxBackoffMs, (retryAfterMs ?? backoffMs) + jitter);

      console.warn(`[tmdb] 429 rate limit. Waiting ${waitMs}ms before retry...`);
      await sleep(waitMs);
      backoffMs *= 2;
      continue;
    }

    if (!res.ok) {
      const body = await safeReadText(res);
      const error = new Error(`TMDB request failed: ${res.status} ${body}`);
      error.status = res.status;

      // Retry only for 5xx
      if (res.status >= 500 && res.status <= 599) {
        attempt++;
        if (attempt > maxRetries) throw error;
        const jitter = Math.floor(Math.random() * 250);
        await sleep(Math.min(maxBackoffMs, backoffMs + jitter));
        backoffMs *= 2;
        continue;
      }

      throw error;
    }

    return res.json();
  }
}

async function searchMovie({ query, year, language }) {
  return tmdbFetchJson("/search/movie", {
    query,
    include_adult: "false", //Why?
    language,
    primary_release_year: year ? String(year) : undefined,
    page: "1",
  });
}

async function fetchMovieDetails({ tmdbId, language }) {
  return tmdbFetchJson(`/movie/${tmdbId}`, {
    language,
    append_to_response: "credits,videos",
  });
}

module.exports = {
  tmdbFetchJson,
  searchMovie,
  fetchMovieDetails,
};
