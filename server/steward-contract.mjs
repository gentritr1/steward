/* The contract every Steward answer must satisfy, whoever produced it.
   The local generator, and every provider adapter added later, hands its
   candidate to validateEnvelope before anything reaches a caller. Code owns
   the facts: a generator may propose an action, it may never widen the
   allowlist, invent an evidence ID, or smuggle markup into the message. */

/* reclaim ids are slugs by construction ("app-caches"), never labels or paths */
export const RECLAIM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RECLAIM_ID_MAX_LENGTH = 40;

/* "current" is the lesson the schedule is on; day-N addresses one explicitly */
const LESSON_TARGET_PATTERN = /^(?:current|day-(?:[1-9]|[12][0-9]|30))$/;

export const ENVELOPE_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "StewardEnvelope",
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "speaker",
    "message",
    "epistemicState",
    "evidenceIds",
    "confidence",
    "nextStep",
    "memoryCandidate",
    "presentation",
  ],
  properties: {
    schemaVersion: { type: "string", const: "1" },
    speaker: { type: "string", const: "steward" },
    message: { type: "string", minLength: 1, maxLength: 600 },
    epistemicState: { type: "string", enum: ["measured", "inferred", "unavailable", "simulated"] },
    evidenceIds: {
      type: "array",
      minItems: 0,
      maxItems: 8,
      uniqueItems: true,
      items: { type: "string", minLength: 1, maxLength: 60 },
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    /* nullable, never omitted: an absent key and "no next step" must not be
       the same wire shape, or a dropped field reads as a deliberate silence */
    nextStep: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["actionId", "targetId"],
          properties: {
            actionId: { type: "string", minLength: 1, maxLength: 40 },
            targetId: { type: "string", minLength: 1, maxLength: 60 },
          },
        },
      ],
    },
    memoryCandidate: {
      anyOf: [{ type: "null" }, { type: "string", minLength: 1, maxLength: 200 }],
    },
    presentation: {
      type: "object",
      additionalProperties: false,
      required: ["expression", "panel"],
      properties: {
        expression: { type: "string", enum: ["calm", "pleased", "watchful", "concerned"] },
        panel: { type: "string", enum: ["fact", "teach", "receipt"] },
      },
    },
  },
};

/* four actions, and for each one the only target ids that may accompany it.
   open_reclaim_item resolves against the packet, so an id the evidence never
   mentioned is rejected even though it is a well-formed slug. */
export const ACTION_ALLOWLIST = {
  show_receipt: { targets: ["disk.history", "coverage", "events"] },
  open_channel: { targets: ["today", "storage", "learn", "routines", "timeline", "trust"] },
  open_reclaim_item: { pattern: RECLAIM_ID_PATTERN, maxLength: RECLAIM_ID_MAX_LENGTH, evidenceBound: true },
  show_lesson: { pattern: LESSON_TARGET_PATTERN },
};

export const ACTION_IDS = Object.keys(ACTION_ALLOWLIST);

/* the message is prose that lands in a text node. anything that could be
   markup, a link, or a location on this machine is a contract violation,
   not a formatting preference. */
const MESSAGE_RULES = [
  [/</, "message must not contain markup"],
  [/#/, "message must not contain markdown headings"],
  [/`/, "message must not contain code formatting"],
  [/\]\(/, "message must not contain markdown links"],
  [/\/Users\//, "message must not contain an absolute path"],
  [/~\//, "message must not contain a home-relative path"],
  [/https?:\/\//i, "message must not contain a url"],
  [/:\/\//, "message must not contain a url scheme"],
  [/\bwww\./i, "message must not contain a url"],
  /* prose lands in a text node; control characters never belong in it */
  [/[\u0000-\u001f\u007f]/, "message must not contain control characters"],
];

/* ---------------------------------------------------------------------------
   Numbers in the prose must come from the packet.

   Citing the right evidence id and then printing the wrong digits is the
   fabrication this file did not previously catch: "99 GB free" citing
   disk.availableBytes passed every check while being false. So the message is
   scanned for digit-based claims and each one must match a number the packet
   can actually produce.

   Scope, stated plainly: only DIGIT-based claims are extracted. Word-numbers
   ("one reading", "half the disk", "a couple of lessons") are out of scope and
   are never checked — spelling a number out is a way past this gate, and the
   local generator's "one reading. nothing to compare it to." is exactly such a
   sentence. A bare number with no recognised context ("42") is also not a
   claim; a number is only a claim when it carries a unit or a counted noun.
   --------------------------------------------------------------------------- */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

function stripGrouping(text) {
  return text.replace(/,/g, "");
}

/* one token per (kind, number) pair, so a percent can never satisfy a count
   claim and a byte figure can never satisfy a percentage */
function claimToken(kind, number, unit = "") {
  return `${kind}:${stripGrouping(String(number)).toLowerCase()}${unit}`;
}

/* the dashboard's formatBytes rounding, reimplemented here rather than imported:
   divide by 1024 while the amount allows it, then 0 fraction digits at or above
   100 (and for raw bytes), 1 below it. The acceptable set carries the 0- and
   1-decimal forms of every value, in both the grouped Intl spelling and the
   padded toFixed spelling, because a truthful sentence may legitimately use any
   of them ("4 GB", "4.0 GB", "200 GB"). */
function byteTokens(value) {
  let amount = Math.max(0, value);
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const unit = BYTE_UNITS[unitIndex].toLowerCase();
  const spellings = [
    new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(amount),
    new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(amount),
    amount.toFixed(0),
    amount.toFixed(1),
  ];
  return spellings.map((spelling) => claimToken("bytes", spelling, unit));
}

function percentTokens(value) {
  const spellings = [
    new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value),
    new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value),
    value.toFixed(0),
    value.toFixed(1),
  ];
  return spellings.map((spelling) => claimToken("percent", spelling));
}

function countTokens(value) {
  return [claimToken("count", Math.round(value))];
}

function tokensForUnit(unit, value) {
  if (unit === "bytes") return byteTokens(value);
  if (unit === "percent") return percentTokens(value);
  return countTokens(value);
}

/**
 * Every number a truthful sentence could print, given this packet.
 *
 * Deliberately small. Three sources, and nothing else:
 *   (a) each raw evidence value, in the formats its unit permits;
 *   (b) usedPercent recomputed from disk.usedBytes / disk.capacityBytes, since
 *       that division is arithmetic on two readings the packet already holds;
 *   (c) reclaim.safeBytes + reclaim.reviewBytes, the one total a reply is
 *       allowed to add up.
 * Any other derivation — capacity minus used, per-item sums, a share of a
 * category — is NOT acceptable and its number will be rejected. Widening this
 * set is a deliberate decision, never a fix for a failing sentence.
 *
 * @param {{evidence?: Record<string, {value: number, unit: string}>}} packet
 * @returns {Set<string>} namespaced tokens, e.g. "bytes:200gb", "percent:80", "count:7"
 */
export function buildAcceptableNumbers(packet) {
  const acceptable = new Set();
  const evidence = packet?.evidence ?? {};

  const numberAt = (id) => {
    const entry = evidence[id];
    return entry && typeof entry.value === "number" && Number.isFinite(entry.value) ? entry.value : null;
  };

  for (const [, entry] of Object.entries(evidence)) {
    if (!entry || typeof entry.value !== "number" || !Number.isFinite(entry.value)) continue;
    for (const token of tokensForUnit(entry.unit, entry.value)) acceptable.add(token);
  }

  const usedBytes = numberAt("disk.usedBytes");
  const capacityBytes = numberAt("disk.capacityBytes");
  if (usedBytes !== null && capacityBytes !== null && capacityBytes > 0) {
    for (const token of percentTokens((usedBytes / capacityBytes) * 100)) acceptable.add(token);
  }

  const safeBytes = numberAt("reclaim.safeBytes");
  const reviewBytes = numberAt("reclaim.reviewBytes");
  if (safeBytes !== null && reviewBytes !== null) {
    for (const token of byteTokens(safeBytes + reviewBytes)) acceptable.add(token);
  }

  return acceptable;
}

const NUMBER = "\\d[\\d,]*(?:\\.\\d+)?";

/* order is meaningful: each rule's matches are blanked out of the text before
   the next rule runs, so "8.6 gb of 12 gb" yields two byte claims and not a
   spurious "8.6 of 12" count, and "lesson 7 of 7" yields two counts once. */
const CLAIM_RULES = [
  { kind: "bytes", pattern: new RegExp(`(${NUMBER})\\s*(b|kb|mb|gb|tb)\\b`, "gi"), groups: [1], unitGroup: 2 },
  { kind: "percent", pattern: new RegExp(`(${NUMBER})\\s*(?:%|percent\\b)`, "gi"), groups: [1] },
  { kind: "count", pattern: new RegExp(`(${NUMBER})\\s+of\\s+(${NUMBER})`, "gi"), groups: [1, 2] },
  {
    kind: "count",
    pattern: new RegExp(
      `(${NUMBER})\\s+(?:readings?|copies|copy|items?|lessons?|days?|files?|folders?|projects?|snapshots?)\\b`,
      "gi",
    ),
    groups: [1],
  },
  { kind: "count", pattern: new RegExp(`(${NUMBER})\\s*(?:×|x(?![a-z]))`, "gi"), groups: [1] },
  { kind: "count", pattern: new RegExp(`\\b(?:day|lesson)\\s+(${NUMBER})`, "gi"), groups: [1] },
];

/**
 * Pull the digit-based numeric claims, with their context, out of a message.
 *
 * @param {string} message
 * @returns {{raw: string, kind: "bytes"|"percent"|"count", value: number, token: string}[]}
 *   one entry per distinct claim, deduplicated by kind and value, grouped in
 *   rule order (byte claims first, then percentages, then counts)
 */
export function extractNumericClaims(message) {
  if (typeof message !== "string") return [];

  let remaining = message;
  const claims = [];
  const seen = new Set();

  for (const rule of CLAIM_RULES) {
    const spans = [];
    rule.pattern.lastIndex = 0;
    let match = rule.pattern.exec(remaining);

    while (match !== null) {
      spans.push([match.index, match.index + match[0].length]);
      const unit = rule.unitGroup ? match[rule.unitGroup].toLowerCase() : "";
      for (const group of rule.groups) {
        const raw = match[group];
        const token = claimToken(rule.kind, raw, unit);
        if (!seen.has(token)) {
          seen.add(token);
          claims.push({
            raw: rule.groups.length === 1 ? match[0].trim() : raw,
            kind: rule.kind,
            value: Number(stripGrouping(raw)),
            token,
          });
        }
      }
      match = rule.pattern.exec(remaining);
    }

    /* blank the consumed spans, keeping length so later indices stay honest */
    for (const [start, end] of spans) {
      remaining = remaining.slice(0, start) + " ".repeat(end - start) + remaining.slice(end);
    }
  }

  return claims;
}

function typeName(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/* a deliberately small JSON-Schema subset: exactly the keywords ENVELOPE_SCHEMA
   uses. Walking the schema rather than hand-checking each field keeps the
   published schema and the enforced schema from drifting apart. */
function checkNode(value, schema, path, errors) {
  if (schema.anyOf) {
    const matched = schema.anyOf.some((option) => checkNode(value, option, path, []) === 0);
    if (!matched) errors.push(`${path}: does not match any allowed shape`);
    return errors.length;
  }

  if (schema.type && typeName(value) !== schema.type) {
    errors.push(`${path}: expected ${schema.type}, received ${typeName(value)}`);
    return errors.length;
  }

  if (Object.hasOwn(schema, "const") && value !== schema.const) {
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: must be one of ${schema.enum.join(", ")}`);
  }

  if (schema.type === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      errors.push(`${path}: shorter than ${schema.minLength} characters`);
    }
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
      errors.push(`${path}: longer than ${schema.maxLength} characters`);
    }
  }

  if (schema.type === "array") {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) {
      errors.push(`${path}: fewer than ${schema.minItems} items`);
    }
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
      errors.push(`${path}: more than ${schema.maxItems} items`);
    }
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(`${path}: items must be unique`);
    }
    if (schema.items) {
      value.forEach((item, index) => checkNode(item, schema.items, `${path}[${index}]`, errors));
    }
  }

  if (schema.type === "object") {
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: required`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(schema.properties ?? {}, key)) errors.push(`${path}.${key}: unexpected property`);
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) checkNode(value[key], childSchema, `${path}.${key}`, errors);
    }
  }

  return errors.length;
}

function checkNextStep(nextStep, knownReclaimIds, errors) {
  if (nextStep === null) return;

  const rule = Object.hasOwn(ACTION_ALLOWLIST, nextStep.actionId) ? ACTION_ALLOWLIST[nextStep.actionId] : null;
  if (!rule) {
    errors.push(`nextStep.actionId: "${nextStep.actionId}" is not on the action allowlist`);
    return;
  }

  const target = nextStep.targetId;

  if (rule.targets && !rule.targets.includes(target)) {
    errors.push(`nextStep.targetId: "${target}" is not a target of ${nextStep.actionId}`);
    return;
  }

  if (rule.pattern && !rule.pattern.test(target)) {
    errors.push(`nextStep.targetId: "${target}" is not a legal target of ${nextStep.actionId}`);
    return;
  }

  if (typeof rule.maxLength === "number" && target.length > rule.maxLength) {
    errors.push(`nextStep.targetId: longer than ${rule.maxLength} characters`);
    return;
  }

  /* fails closed: with no reclaim evidence in hand, no reclaim item is openable */
  if (rule.evidenceBound && !knownReclaimIds.includes(target)) {
    errors.push(`nextStep.targetId: "${target}" is not a reclaim item in the evidence packet`);
  }
}

/**
 * Validate one candidate envelope.
 *
 * Supplying `packet` turns on the numeric cross-check: every digit-based claim
 * in the message must be a number the packet can produce. Omitting it leaves
 * behaviour exactly as it was, so existing callers are unaffected — but a
 * caller that has the packet in hand and does not pass it is choosing to let
 * fabricated digits through.
 *
 * @param {unknown} candidate
 * @param {{knownEvidenceIds?: string[], knownReclaimIds?: string[], packet?: object}} [context]
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateEnvelope(candidate, context = {}) {
  const knownEvidenceIds = Array.isArray(context.knownEvidenceIds) ? context.knownEvidenceIds : [];
  const knownReclaimIds = Array.isArray(context.knownReclaimIds) ? context.knownReclaimIds : [];

  const errors = [];
  checkNode(candidate, ENVELOPE_SCHEMA, "envelope", errors);
  /* semantic checks assume the shape held, so a broken shape stops here rather
     than producing a second wave of errors about fields that are not there */
  if (errors.length > 0) return { ok: false, errors };

  for (const id of candidate.evidenceIds) {
    if (!knownEvidenceIds.includes(id)) errors.push(`evidenceIds: "${id}" is not in the evidence packet`);
  }

  /* a measured claim without evidence is the exact failure this contract
     exists to catch; an unavailable one must not cite evidence it did not use */
  if (candidate.epistemicState === "measured" && candidate.evidenceIds.length === 0) {
    errors.push("epistemicState: a measured claim must cite at least one evidence id");
  }
  if (candidate.epistemicState === "unavailable" && candidate.evidenceIds.length > 0) {
    errors.push("epistemicState: an unavailable claim must not cite evidence");
  }

  checkNextStep(candidate.nextStep, knownReclaimIds, errors);

  for (const [pattern, message] of MESSAGE_RULES) {
    if (pattern.test(candidate.message)) errors.push(message);
  }

  if (context.packet) {
    const acceptable = buildAcceptableNumbers(context.packet);
    for (const claim of extractNumericClaims(candidate.message)) {
      if (!acceptable.has(claim.token)) {
        errors.push(`message: the ${claim.kind} claim "${claim.raw}" is not a number in the evidence packet`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
