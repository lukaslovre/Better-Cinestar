const { configuration } = require("../config/environment.js");
const { browserManager } = require("../scraping/browserManager.js");
const { TtlCache } = require("../utils/ttlCache.js");

const seatingCache = new TtlCache({
  ttlMs: configuration.SEATING_CACHE_TTL_MS,
  maxEntries: configuration.SEATING_CACHE_MAX_ENTRIES,
});

function getSeatingCacheStats() {
  return seatingCache.stats();
}

function isRetryableCinestarError(error) {
  if (!error) return true;

  // Puppeteer timeout
  if (error.name === "TimeoutError") return true;

  // Network-ish / transient errors
  if (typeof error.message === "string") {
    const m = error.message.toLowerCase();
    if (m.includes("navigation") && m.includes("timeout")) return true;
    if (m.includes("net::")) return true;
    if (m.includes("socket")) return true;
    if (m.includes("disconnected")) return true;
  }

  // Don't retry on common non-transient 4xx
  if (typeof error.status === "number" && [401, 403, 404].includes(error.status)) {
    return false;
  }

  // Retry on 5xx
  if (typeof error.status === "number" && error.status >= 500) return true;

  // Default to retryable once.
  return true;
}

/**
 * Minimal retry helper: we only need a single retry for seating.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {object} options
 * @param {number} options.retries
 * @param {(err: any) => boolean} options.shouldRetry
 */
async function withRetry(fn, { retries, shouldRetry }) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= retries || !shouldRetry(err)) break;
    }
  }

  throw lastError;
}

/**
 * Fetch Cinestar API JSON via a real Chromium session (Puppeteer).
 * This avoids edge/bot protections that block plain `fetch`.
 *
 * @param {string} endpoint
 * @param {string} cinemaOid
 */
async function cinestarApiViaBrowser(endpoint, cinemaOid) {
  const url = `${configuration.CINESTAR_API_URL}${endpoint}`;

  const startedAt = Date.now();
  const data = await browserManager.withPage(async (page) => {
    await page.setExtraHTTPHeaders({
      "CENTER-OID": cinemaOid,
    });

    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response) {
      const error = new Error("No response returned from page.goto()");
      error.status = 0;
      throw error;
    }

    if (!response.ok()) {
      const error = new Error(`Cinestar API request failed with status ${response.status()}`);
      error.status = response.status();
      throw error;
    }

    // The API response is rendered as plain text in the document body.
    const content = await page.evaluate(() => document.body.innerText);
    return JSON.parse(content);
  });

  const durationMs = Date.now() - startedAt;
  console.log(`[seating] Cinestar API OK (${durationMs}ms) ${endpoint}`);

  return data;
}

/**
 * Fetch and format the seating plan.
 *
 * Throws on failure; the route maps this to HTTP 502.
 *
 * @param {string} cinemaOid
 * @param {string} performanceId
 */
async function fetchSeating(cinemaOid, performanceId) {
  const cacheKey = `${cinemaOid}:${performanceId}`;
  const cached = seatingCache.get(cacheKey);
  if (cached) {
    console.log(`[seating] Cache hit ${cacheKey}`);
    return cached;
  }

  console.log(`[seating] Cache miss ${cacheKey} (fetching via browser)`);

  const data = await withRetry(
    async () => {
      try {
        return await cinestarApiViaBrowser(
          `/performances/${performanceId}/seatingplan`,
          cinemaOid
        );
      } catch (error) {
        // If the browser crashed/disconnected, restart once and retry.
        if (String(error?.message || "").toLowerCase().includes("disconnected")) {
          await browserManager.restart("disconnected");
        }
        throw error;
      }
    },
    {
      retries: 1,
      shouldRetry: isRetryableCinestarError,
    }
  );

  const formattedSeating = formatSeating(data);
  seatingCache.set(cacheKey, formattedSeating);
  return formattedSeating;
}

function formatSeating(data) {
  const seatGroups = data.seatGroups.map((group) => group.seats);

  return {
    height: data.height,
    width: data.width,
    seatingAreas: data.seatingAreas,
    maxX: findLargestX(seatGroups),
    maxY: findLargestY(seatGroups),
    seats: seatGroups.flat().map(formatSeat),
  };
}

function formatSeat(seat) {
  return {
    x: seat.x,
    y: seat.y,
    sg: seat.sg,
    stat: seat.stat,
    sar: seat.sar,
  };
}
function findLargestX(seatGroups) {
  return seatGroups.reduce((max, group) => Math.max(max, group[group.length - 1].x), 0);
}

function findLargestY(seatGroups) {
  return seatGroups.reduce((max, group) => Math.max(max, group[0].y), 0);
}

module.exports = {
  fetchSeating,
  getSeatingCacheStats,
  // Exported for internal diagnostics/testing.
  cinestarApiViaBrowser,
};
