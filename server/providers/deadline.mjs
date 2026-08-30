/* One deadline, two ways to reach it.

   Every provider call is bounded at 20 seconds, and a caller may also hand in
   its own signal. Both have to abort the same request, and afterwards the
   adapter has to know WHICH one fired: our own timeout is an outage the router
   falls back from, while a caller's cancellation is not a provider failure at
   all and must not be reported as one. AbortSignal.any would merge them and
   lose that distinction, so the two are wired by hand. */

/**
 * @param {AbortSignal|undefined|null} outer a caller's signal, or nothing
 * @param {number} ms the deadline
 * @returns {{signal: AbortSignal, expired: () => boolean, cancelled: () => boolean, release: () => void}}
 */
export function deadline(outer, ms) {
  const controller = new AbortController();
  let expired = false;
  let cancelled = false;

  /* deliberately NOT unref'd. An unref'd deadline is only as reliable as the
     rest of the event loop: with nothing else pending it never fires at all,
     and a request would hang instead of timing out. release() clears it the
     moment the call settles, so it holds the process open for exactly as long
     as a request is genuinely in flight. */
  const timer = setTimeout(() => {
    expired = true;
    controller.abort(new Error("provider deadline exceeded"));
  }, ms);

  const onOuterAbort = () => {
    cancelled = true;
    controller.abort(outer.reason);
  };

  if (outer) {
    if (outer.aborted) onOuterAbort();
    else outer.addEventListener("abort", onOuterAbort, { once: true });
  }

  return {
    signal: controller.signal,
    expired: () => expired,
    cancelled: () => cancelled,
    release() {
      clearTimeout(timer);
      outer?.removeEventListener("abort", onOuterAbort);
    },
  };
}

export const PROVIDER_TIMEOUT_MS = 20_000;
