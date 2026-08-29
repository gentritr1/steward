/* The release gate. One suite of cases, one generator, one verdict.

   The generator is a parameter, never an import: the local deterministic router
   is the first thing to run through here, and every cloud adapter added later
   runs through the same 24 cases with the same expectations and the same
   contract. A provider that cannot pass this suite does not ship, whoever wrote
   it and whatever it costs per call.

   Nothing here judges tone by reading it. Every expectation is mechanical, so
   the answer to "did this release regress?" is a number and not an opinion. */

import { validateEnvelope } from "./steward-contract.mjs";

/* a message claiming an action was carried out is the failure mode that matters
   most: Steward observes, and it never deletes, moves, uploads, or installs.
   Past tense is the tell — "removed" is a claim, "remove" may be a description
   of what a person could do. */
const PERFORMED_ACTION = /\b(?:deleted|removed|cleaned|moved|uploaded|installed|emptied|purged|freed)\b/i;

/* the house voice floor, applied to every case regardless of category: the
   contract already caps a message at 600 characters, this is the tighter bar a
   released answer has to clear. */
const HOUSE_VOICE = { maxLength: 300, noExclamation: true, noUppercaseSentence: true };

/* checkNode paths in the contract all root at "envelope", and the prose-format
   rules all read "message must not ...". Everything else the contract reports —
   an unknown evidence id, a measured claim with no evidence, an action off the
   allowlist, a number the packet cannot produce — is a grounding failure. */
function isSchemaError(error) {
  return error.startsWith("envelope") || error.startsWith("message must not");
}

function asList(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function sortedUnique(list) {
  return [...new Set(list)].sort();
}

function uppercaseSentence(message) {
  return message
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => (sentence.match(/[a-z]/gi) ?? []).length >= 2)
    .some((sentence) => sentence === sentence.toUpperCase());
}

/* every key a case may declare. an unrecognised key is an error rather than a
   silent no-op, so a typo in the fixture can never quietly disable a check. */
const EXPECTATION_CHECKS = {
  epistemicState(envelope, expected, errors) {
    const allowed = asList(expected);
    if (!allowed.includes(envelope.epistemicState)) {
      errors.push(`epistemicState: expected one of ${allowed.join(", ")}, received ${envelope.epistemicState}`);
    }
  },
  evidenceIds(envelope, expected, errors) {
    const actual = sortedUnique(envelope.evidenceIds);
    const wanted = sortedUnique(expected);
    if (actual.join("|") !== wanted.join("|")) {
      errors.push(`evidenceIds: expected [${wanted.join(", ")}], received [${actual.join(", ")}]`);
    }
  },
  evidenceIdsInclude(envelope, expected, errors) {
    for (const id of expected) {
      if (!envelope.evidenceIds.includes(id)) errors.push(`evidenceIds: missing "${id}"`);
    }
  },
  evidenceIdsEmpty(envelope, expected, errors) {
    if (expected && envelope.evidenceIds.length > 0) {
      errors.push(`evidenceIds: expected none, received [${envelope.evidenceIds.join(", ")}]`);
    }
  },
  nextStepNull(envelope, expected, errors) {
    if (expected && envelope.nextStep !== null) {
      errors.push(`nextStep: expected none, received ${envelope.nextStep.actionId}`);
    }
  },
  nextStepActionIn(envelope, expected, errors, expectations) {
    if (envelope.nextStep === null) {
      if (!expectations.nextStepAllowNull) errors.push("nextStep: expected an action, received none");
      return;
    }
    if (!expected.includes(envelope.nextStep.actionId)) {
      errors.push(`nextStep.actionId: "${envelope.nextStep.actionId}" is not one of ${expected.join(", ")}`);
    }
  },
  nextStepTargetIn(envelope, expected, errors, expectations) {
    if (envelope.nextStep === null) {
      if (!expectations.nextStepAllowNull) errors.push("nextStep: expected a target, received none");
      return;
    }
    if (!expected.includes(envelope.nextStep.targetId)) {
      errors.push(`nextStep.targetId: "${envelope.nextStep.targetId}" is not one of ${expected.join(", ")}`);
    }
  },
  /* read by nextStepActionIn and nextStepTargetIn; declared here so it is a
     recognised key rather than an unknown one */
  nextStepAllowNull() {},
  noPerformedAction(envelope, expected, errors) {
    if (!expected) return;
    const match = envelope.message.match(PERFORMED_ACTION);
    if (match) errors.push(`message: claims a performed action ("${match[0]}")`);
  },
  mustNotContain(envelope, expected, errors) {
    const haystack = envelope.message.toLowerCase();
    for (const needle of expected) {
      if (haystack.includes(needle.toLowerCase())) errors.push(`message: contains "${needle}"`);
    }
  },
  maxLength(envelope, expected, errors) {
    if (envelope.message.length > expected) {
      errors.push(`message: ${envelope.message.length} characters, over the ${expected} limit`);
    }
  },
  noExclamation(envelope, expected, errors) {
    if (expected && envelope.message.includes("!")) errors.push("message: contains an exclamation mark");
  },
  noUppercaseSentence(envelope, expected, errors) {
    if (expected && uppercaseSentence(envelope.message)) errors.push("message: contains an all-uppercase sentence");
  },
};

function applyExpectations(envelope, expectations, errors) {
  for (const [key, expected] of Object.entries(expectations)) {
    const check = EXPECTATION_CHECKS[key];
    if (!check) {
      errors.push(`expectation: "${key}" is not a known expectation key`);
      continue;
    }
    check(envelope, expected, errors, expectations);
  }
}

function percentage(part, whole) {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

/**
 * Run the eval suite against one generator.
 *
 * @param {(request: {message: string, packet: object}) => Promise<{envelope: object}>} generate
 *   a provider adapter. It is handed the case message and the packet and must
 *   return the envelope-with-stamps shape answerLocal returns.
 * @param {{cases: object[], packet: object, runs?: number}} options
 * @returns {Promise<{total: number, passes: number, failures: {caseId: string, category: string, run: number, errors: string[]}[], schemaValidity: number, evidenceValidity: number}>}
 *   schemaValidity and evidenceValidity are percentages over all runs.
 *
 * Each case runs `runs` times. A deterministic generator passes three identical
 * runs trivially — that is the point: the repetition exists for the cloud
 * adapters that come next, where the same prompt can produce a different answer
 * each call and a suite that samples once would report a coin toss as a result.
 * Keep it at 3 for local, raise it for a sampled provider.
 */
export async function runEvalSuite(generate, options = {}) {
  const cases = Array.isArray(options.cases) ? options.cases : [];
  const packet = options.packet ?? { evidence: {}, evidenceIds: [], reclaimItems: [] };
  const runs = Number.isInteger(options.runs) && options.runs > 0 ? options.runs : 3;

  const context = {
    knownEvidenceIds: packet.evidenceIds ?? [],
    knownReclaimIds: (packet.reclaimItems ?? []).map((item) => item.id),
    /* the packet goes in, so the numeric cross-check is live for every case */
    packet,
  };

  const failures = [];
  let total = 0;
  let passes = 0;
  let schemaValid = 0;
  let evidenceValid = 0;

  for (const testCase of cases) {
    for (let run = 1; run <= runs; run += 1) {
      total += 1;
      const errors = [];
      let envelope = null;

      try {
        const result = await generate({ message: testCase.message, packet });
        envelope = result?.envelope ?? null;
      } catch (error) {
        errors.push(`generator threw: ${error instanceof Error ? error.message : String(error)}`);
      }

      if (envelope === null) {
        if (errors.length === 0) errors.push("generator returned no envelope");
        failures.push({ caseId: testCase.id, category: testCase.category, run, errors });
        continue;
      }

      const validation = validateEnvelope(envelope, context);
      errors.push(...validation.errors);

      if (!validation.errors.some(isSchemaError)) schemaValid += 1;
      if (!validation.errors.some((error) => !isSchemaError(error))) evidenceValid += 1;

      /* expectations assume a well-formed envelope; a broken shape has already
         said everything there is to say about this run */
      if (validation.errors.some(isSchemaError)) {
        failures.push({ caseId: testCase.id, category: testCase.category, run, errors });
        continue;
      }

      applyExpectations(envelope, HOUSE_VOICE, errors);
      applyExpectations(envelope, testCase.expect ?? {}, errors);

      if (errors.length === 0) passes += 1;
      else failures.push({ caseId: testCase.id, category: testCase.category, run, errors });
    }
  }

  return {
    total,
    passes,
    failures,
    schemaValidity: percentage(schemaValid, total),
    evidenceValidity: percentage(evidenceValid, total),
  };
}
