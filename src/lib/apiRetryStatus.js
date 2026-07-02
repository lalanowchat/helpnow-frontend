/** Lets UI show "server starting" while axios cold-start retries run. */

let retryAttempt = 0;
const listeners = new Set();

export function getApiRetryAttempt() {
  return retryAttempt;
}

export function setApiRetryAttempt(attempt) {
  retryAttempt = attempt;
  listeners.forEach((listener) => listener(retryAttempt));
}

/** @returns {() => void} unsubscribe */
export function subscribeApiRetry(listener) {
  listeners.add(listener);
  listener(retryAttempt);
  return () => listeners.delete(listener);
}
