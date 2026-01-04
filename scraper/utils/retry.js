/**
 * Retries a function with exponential backoff.
 *
 * @param {Function} fn - The async function to retry.
 * @param {Object} options - Retry options.
 * @param {number} [options.retries=3] - Maximum number of retries.
 * @param {number} [options.delay=1000] - Initial delay in milliseconds.
 * @param {number} [options.backoff=2] - Multiplier for the delay after each retry.
 * @param {Function} [options.shouldRetry] - Predicate function (error) => boolean. Returns true if we should retry.
 * @returns {Promise<any>} - The result of the function.
 */
async function withRetry(fn, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2, shouldRetry = () => true } = options;

  let attempt = 0;
  let currentDelay = delay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }

      console.warn(
        `[Retry] Attempt ${attempt}/${retries} failed. Retrying in ${currentDelay}ms... Error: ${error.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }
}

module.exports = { withRetry };
