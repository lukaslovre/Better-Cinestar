const puppeteer = require("puppeteer");
const { configuration } = require("../config/environment.js");

/**
 * Simple async semaphore to cap concurrency.
 * We keep this local (no deps) because the server has low traffic.
 */
class Semaphore {
  /**
   * @param {number} max
   */
  constructor(max) {
    // Guard against invalid values (e.g. NaN) which would otherwise deadlock.
    this.max = Number.isFinite(max) && max >= 1 ? max : 1;
    this.active = 0;
    /** @type {Array<() => void>} */
    this.queue = [];
  }

  /**
   * @returns {Promise<() => void>} A release function.
   */
  acquire() {
    if (this.active < this.max) {
      this.active++;
      return Promise.resolve(() => this._release());
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.active++;
        resolve(() => this._release());
      });
    });
  }

  _release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    if (next) next();
  }
}

/**
 * Browser singleton manager.
 *
 * Design goals:
 * - Lazy launch: start Chromium on first request.
 * - Reuse browser process: avoid the expensive cold start for bursts.
 * - New page per request (or per task): isolate state and keep memory stable.
 * - Small concurrency cap: protect RAM/CPU and keep latency predictable.
 * - Idle shutdown: close Chromium after a period of inactivity.
 * - Resilience: restart the browser if it disconnects.
 */
class BrowserManager {
  /**
   * @param {object} options
   * @param {number} options.maxConcurrency
   * @param {number} options.idleTtlMs
   * @param {number} options.navigationTimeoutMs
   * @param {string} options.userAgent
   */
  constructor({ maxConcurrency, idleTtlMs, navigationTimeoutMs, userAgent }) {
    this.maxConcurrency = maxConcurrency;
    this.idleTtlMs = idleTtlMs;
    this.navigationTimeoutMs = navigationTimeoutMs;
    this.userAgent = userAgent;

    this.semaphore = new Semaphore(maxConcurrency);

    /** @type {import('puppeteer').Browser | null} */
    this.browser = null;
    /** @type {Promise<import('puppeteer').Browser> | null} */
    this.launching = null;
    /** @type {Promise<void> | null} */
    this.restarting = null;
    /** @type {NodeJS.Timeout | null} */
    this.idleTimer = null;
    this.lastUsedAt = 0;
    this.isShuttingDown = false;

    this.metrics = {
      launches: 0,
      restarts: 0,
      closes: 0,
      tasks: 0,
      activePermits: 0,
    };
  }

  stats() {
    return {
      hasBrowser: Boolean(this.browser),
      lastUsedAt: this.lastUsedAt,
      metrics: { ...this.metrics },
      maxConcurrency: this.maxConcurrency,
      idleTtlMs: this.idleTtlMs,
      navigationTimeoutMs: this.navigationTimeoutMs,
    };
  }

  async _launchBrowser() {
    if (this.isShuttingDown) {
      throw new Error("BrowserManager is shutting down");
    }

    if (this.browser) return this.browser;
    if (this.launching) return this.launching;

    this.launching = (async () => {
      this.metrics.launches++;
      console.log("[browser] Launching Chromium...");

      const browser = await puppeteer.launch({
        headless: true,
        // Prefer Puppeteer's bundled Chromium. Allow overriding for custom environments.
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      browser.on("disconnected", () => {
        console.warn("[browser] Disconnected; will re-launch on next request");
        this.browser = null;
      });

      this.browser = browser;
      return browser;
    })();

    try {
      return await this.launching;
    } finally {
      this.launching = null;
    }
  }

  _scheduleIdleClose() {
    if (this.idleTimer) clearTimeout(this.idleTimer);

    // Close the browser after the server has been idle for a while.
    this.idleTimer = setTimeout(() => {
      // No await here; we don't want an unhandled rejection to crash the process.
      void this.close("idle");
    }, this.idleTtlMs);

    // Allow Node to exit naturally if this is the only timer.
    if (typeof this.idleTimer.unref === "function") this.idleTimer.unref();
  }

  /**
   * Run a task within a fresh Puppeteer page.
   *
   * The page is always closed afterward.
   * Concurrency is capped by `maxConcurrency`.
   *
   * @template T
   * @param {(page: import('puppeteer').Page) => Promise<T>} fn
   * @returns {Promise<T>}
   */
  async withPage(fn) {
    const release = await this.semaphore.acquire();
    this.metrics.activePermits++;

    // While we are active, don't idle-close.
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    /** @type {import('puppeteer').Page | null} */
    let page = null;

    try {
      this.metrics.tasks++;

      const browser = await this._launchBrowser();
      page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      page.setDefaultNavigationTimeout(this.navigationTimeoutMs);
      page.setDefaultTimeout(this.navigationTimeoutMs);

      return await fn(page);
    } finally {
      this.lastUsedAt = Date.now();

      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Page can already be closed/crashed; ignore.
        }
      }

      this.metrics.activePermits = Math.max(0, this.metrics.activePermits - 1);
      release();

      // If nothing else is running, schedule idle close.
      if (this.metrics.activePermits === 0 && !this.isShuttingDown) {
        this._scheduleIdleClose();
      }
    }
  }

  /**
   * Restart Chromium. This is single-flight: concurrent callers share the same restart.
   */
  async restart(reason = "unknown") {
    if (this.restarting) return this.restarting;

    this.restarting = (async () => {
      this.metrics.restarts++;
      console.warn(`[browser] Restarting Chromium (reason: ${reason})`);
      await this.close("restart");
      await this._launchBrowser();
    })();

    try {
      await this.restarting;
    } finally {
      this.restarting = null;
    }
  }

  /**
   * Close Chromium if it's running.
   * @param {"idle" | "restart" | "shutdown" | string} reason
   */
  async close(reason = "unknown") {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (!this.browser) return;

    const b = this.browser;
    this.browser = null;

    this.metrics.closes++;
    console.log(`[browser] Closing Chromium (reason: ${reason})`);

    try {
      await b.close();
    } catch (e) {
      // Ignore close failures.
    }
  }

  /**
   * Stop accepting new work and shut down Chromium.
   * Used during process shutdown.
   */
  async shutdown() {
    this.isShuttingDown = true;
    await this.close("shutdown");
  }
}

// Singleton instance for the server process.
// You can tune these via env vars without touching code.
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const browserManager = new BrowserManager({
  // Use validated config defaults so unset env vars don't produce NaN and deadlock.
  maxConcurrency: configuration.PUPPETEER_MAX_CONCURRENCY,
  idleTtlMs: configuration.PUPPETEER_IDLE_TTL_MS,
  navigationTimeoutMs: configuration.PUPPETEER_NAV_TIMEOUT_MS,
  userAgent: process.env.PUPPETEER_USER_AGENT || DEFAULT_USER_AGENT,
});

module.exports = { browserManager, BrowserManager };
