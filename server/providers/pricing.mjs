/* What a call is estimated to have cost.

   Every number in this file is a CONFIGURED LIST PRICE, copied from a rate card
   on the date stamped below. None of it is a measurement, and none of it is a
   bill. An estimate built from it is inferred, and every surface that shows one
   is required to carry the `~` mark — never the lime dot that means measured.

   The table is per million tokens, in US dollars, split input/output. A model
   this table does not name has no price, and an unpriced call estimates to null
   rather than to zero: zero is a claim, and "i do not know" is the true one. */

export const PRICING = Object.freeze({
  pricesAsOf: "2026-08-30",
  perMTok: Object.freeze({
    "gpt-5.6-luna": Object.freeze({ in: 0.2, out: 1.2 }),
    "gpt-5.6-terra": Object.freeze({ in: 2, out: 12 }),
    "gpt-5.6-sol": Object.freeze({ in: 4, out: 20 }),
    "claude-haiku-4-5": Object.freeze({ in: 1, out: 5 }),
    "claude-sonnet-5": Object.freeze({ in: 2, out: 10 }),
    "claude-opus-5": Object.freeze({ in: 5, out: 25 }),
  }),
});

const PER_MILLION = 1_000_000;

/* six decimals is a tenth of a cent per thousand — fine enough that a luna turn
   does not round away, coarse enough that float noise does not print */
const CENTS = 1_000_000;

export function priceFor(model) {
  const id = typeof model === "string" ? model.trim() : "";
  return Object.hasOwn(PRICING.perMTok, id) ? PRICING.perMTok[id] : null;
}

function tokenCount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * The estimated dollar cost of one call, from the usage the adapter reported.
 *
 * `usage.cachedTokens` is priced at the ORDINARY INPUT RATE. That is not the
 * real cached rate — both services discount cached input — but neither adapter
 * reads a cached-token count today, and no cached rate is written down in this
 * repo. Pricing cached input as full-price input therefore over-estimates
 * rather than inventing a discount, and the moment an adapter starts reporting
 * cached tokens this is the one line that has to be revisited with a rate card
 * in hand.
 *
 * @param {string} model
 * @param {{inputTokens?: number|null, outputTokens?: number|null, cachedTokens?: number|null}} usage
 * @returns {number|null} dollars, or null when the model is unpriced or no
 *   token count was reported at all
 */
export function estimateCostUsd(model, usage) {
  const price = priceFor(model);
  if (!price) return null;

  const input = tokenCount(usage?.inputTokens);
  const cached = tokenCount(usage?.cachedTokens);
  const output = tokenCount(usage?.outputTokens);
  if (input === null && cached === null && output === null) return null;

  const dollars = (((input ?? 0) + (cached ?? 0)) * price.in + (output ?? 0) * price.out) / PER_MILLION;
  return Math.round(dollars * CENTS) / CENTS;
}
