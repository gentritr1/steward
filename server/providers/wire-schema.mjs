/* One envelope schema, two wire dialects.

   ENVELOPE_SCHEMA is the contract this project enforces. It is NOT what a
   provider's structured-output decoder will accept: constrained decoding is
   implemented over a deliberately small JSON-Schema subset, and a length or a
   range keyword is rejected outright rather than ignored. So the schema that
   goes on the wire is derived here, by removing exactly the keywords the
   decoders cannot express — never by maintaining a second hand-written copy,
   which would drift from the enforced contract the first time either changed.

   Nothing is lost by stripping them. validateEnvelope still runs over the
   parsed candidate after the round trip, with every length, range, and
   uniqueness rule intact; the wire schema only has to shape the generation. */

/* keywords a structured-output decoder rejects (strings, numbers, arrays,
   objects), plus the meta keys that describe the schema rather than constrain
   it. Anything not on this list survives the transform untouched. */
const STRIPPED_KEYWORDS = new Set([
  "$schema",
  /* strings */
  "minLength", "maxLength", "pattern", "format",
  /* numbers */
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
  /* arrays */
  "minItems", "maxItems", "uniqueItems", "contains", "minContains", "maxContains", "unevaluatedItems",
  /* objects */
  "minProperties", "maxProperties", "patternProperties", "propertyNames",
  "unevaluatedProperties", "dependentRequired",
]);

/* subschemas live under these keys and must be transformed, not copied */
const SUBSCHEMA_LISTS = new Set(["anyOf", "oneOf", "allOf"]);
const SUBSCHEMA_VALUES = new Set(["items", "not", "additionalItems"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/* `{"type": "null"}` and nothing else: the null arm of a nullable anyOf */
function isNullArm(node) {
  return isPlainObject(node) && node.type === "null" && Object.keys(node).length === 1;
}

/* Some decoders accept `anyOf: [{type:"null"}, X]`; others want the union
   spelled on the type itself. Both mean the same thing, so the caller picks
   the dialect and the enforced contract is unaffected either way. */
function collapseNullable(node) {
  const arms = node.anyOf;
  if (!Array.isArray(arms) || arms.length !== 2) return node;

  const nullIndex = arms.findIndex(isNullArm);
  if (nullIndex === -1) return node;

  const other = arms[1 - nullIndex];
  /* only a single, named type can be widened into a union; a bare `{}` or an
     arm that is itself a union stays as an anyOf rather than being guessed at */
  if (!isPlainObject(other) || typeof other.type !== "string") return node;

  const rest = { ...node };
  delete rest.anyOf;
  return { ...other, ...rest, type: [other.type, "null"] };
}

/**
 * Derive a provider-safe schema from a contract schema.
 *
 * @param {object} schema
 * @param {{nullableAsTypeUnion?: boolean}} [options]
 *   nullableAsTypeUnion rewrites `anyOf: [{type:"null"}, X]` as X with a
 *   `["<type>", "null"]` type union. Off by default.
 * @returns {object} a new schema; the input is never mutated
 */
export function toWireSchema(schema, options = {}) {
  if (Array.isArray(schema)) return schema.map((entry) => toWireSchema(entry, options));
  if (!isPlainObject(schema)) return schema;

  const out = {};

  for (const [key, value] of Object.entries(schema)) {
    if (STRIPPED_KEYWORDS.has(key)) continue;

    /* `const` is not part of every decoder's supported subset, and a one-value
       enum says exactly the same thing in a keyword all of them accept */
    if (key === "const") {
      out.enum = [value];
      continue;
    }

    if (key === "properties" || key === "$defs" || key === "definitions") {
      out[key] = Object.fromEntries(
        Object.entries(value).map(([name, child]) => [name, toWireSchema(child, options)]),
      );
      continue;
    }

    if (SUBSCHEMA_LISTS.has(key) && Array.isArray(value)) {
      out[key] = value.map((child) => toWireSchema(child, options));
      continue;
    }

    if (SUBSCHEMA_VALUES.has(key)) {
      out[key] = toWireSchema(value, options);
      continue;
    }

    out[key] = value;
  }

  return options.nullableAsTypeUnion ? collapseNullable(out) : out;
}

/**
 * Every schema keyword used anywhere in a schema tree. Exists so a test can
 * assert an absence over the whole tree rather than over the keys it thought
 * to look at.
 *
 * @param {object} schema
 * @returns {Set<string>}
 */
export function schemaKeywords(schema) {
  const found = new Set();

  const walk = (node) => {
    if (Array.isArray(node)) {
      for (const entry of node) walk(entry);
      return;
    }
    if (!isPlainObject(node)) return;

    for (const [key, value] of Object.entries(node)) {
      found.add(key);
      /* property NAMES are data, not keywords, so only their values are walked */
      if (key === "properties" || key === "$defs" || key === "definitions") {
        for (const child of Object.values(value ?? {})) walk(child);
        continue;
      }
      if (key === "required" || key === "enum") continue;
      walk(value);
    }
  };

  walk(schema);
  return found;
}
