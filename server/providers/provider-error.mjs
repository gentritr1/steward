/* The four things that can go wrong on the way to a provider, named once.

   The router branches on `kind` and on nothing else, so an adapter never gets
   to decide what a failure means for the product — only what class of failure
   it observed. The distinction that matters most is refusal: a model declining
   a request is a decision, not an outage, and it must never be routed around by
   retrying, by asking a different provider, or by quietly answering locally as
   if the decline had not happened.

   Messages are fixed strings written here. A provider's own error body is never
   carried into one: it can echo request content, and on some services it can
   echo a prefix of the credential that was rejected. */

export const PROVIDER_ERROR_KINDS = Object.freeze(["config", "outage", "refusal", "malformed"]);

export class ProviderError extends Error {
  /**
   * @param {"config"|"outage"|"refusal"|"malformed"} kind
   *   config   — the credential or the request shape is wrong; retrying cannot help
   *   outage   — timeout, rate limit, 5xx, or an unreachable host; retryable, falls back
   *   refusal  — the model declined; never retried, never routed around
   *   malformed — a 2xx whose body was not the envelope we asked for
   * @param {string} message a fixed string, never provider-supplied text
   * @param {{provider?: string, status?: number|null, category?: string|null}} [details]
   */
  constructor(kind, message, details = {}) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.provider = details.provider ?? null;
    this.status = details.status ?? null;
    /* a refusal category, when the provider names one. an enum-ish token, never prose. */
    this.category = details.category ?? null;
  }
}

/**
 * Map an HTTP status onto a failure kind.
 * 401/403 is the credential; 408/409/429 and 5xx are weather; every other
 * non-2xx means this code sent something the API would not take.
 */
export function kindForStatus(status) {
  if (status === 401 || status === 403) return "config";
  if (status === 408 || status === 409 || status === 429 || status >= 500) return "outage";
  return "config";
}
