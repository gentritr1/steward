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
 * @param {unknown} candidate
 * @param {{knownEvidenceIds?: string[], knownReclaimIds?: string[]}} [context]
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

  return { ok: errors.length === 0, errors };
}
