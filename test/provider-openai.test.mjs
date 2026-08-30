import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MODEL,
  ECONOMY_MODEL,
  WIRE_SCHEMA,
  buildRequestBody,
  generateStructured,
} from "../server/providers/openai.mjs";
import { ProviderError } from "../server/providers/provider-error.mjs";
import { STEWARD_DEVELOPER_PROMPT } from "../server/steward-prompt.mjs";
import { schemaKeywords } from "../server/providers/wire-schema.mjs";

const API_KEY = "test-key-not-a-real-credential";

const MODEL_REQUEST = {
  prompt: STEWARD_DEVELOPER_PROMPT,
  profile: {},
  conversationSummary: "",
  evidence: { evidence: { "disk.usedPercent": { value: 80, unit: "percent" } }, evidenceIds: ["disk.usedPercent"] },
  message: "how much free space do i have?",
  userIdHash: "0123456789abcdef0123456789abcdef",
};

const VALID_ENVELOPE = {
  schemaVersion: "1",
  speaker: "steward",
  message: "the disk is 80% used.",
  epistemicState: "measured",
  evidenceIds: ["disk.usedPercent"],
  confidence: "high",
  nextStep: null,
  memoryCandidate: null,
  presentation: { expression: "calm", panel: "fact" },
};

function mockTransport(reply) {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return typeof reply === "function" ? reply(calls.length) : reply;
  };
  transport.calls = calls;
  return transport;
}

function jsonResponse(status, payload, headers = {}) {
  return {
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => payload,
  };
}

function completedResponse(envelope) {
  return jsonResponse(200, {
    id: "resp_test",
    status: "completed",
    output: [
      { type: "reasoning", summary: [] },
      { type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(envelope) }] },
    ],
    usage: { input_tokens: 1200, output_tokens: 90 },
  }, { "x-request-id": "req_test" });
}

test("the request targets the responses endpoint with bearer auth", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const [call] = transport.calls;
  assert.equal(call.url, "https://api.openai.com/v1/responses");
  assert.equal(call.init.method, "POST");
  assert.equal(call.init.headers.authorization, `Bearer ${API_KEY}`);
  assert.equal(call.init.headers["content-type"], "application/json");
  assert.ok(call.init.signal, "the request must be bound to an abort signal");
});

test("the prompt is instructions, and the payload is the user input item", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.equal(body.instructions, STEWARD_DEVELOPER_PROMPT);
  assert.equal(body.model, DEFAULT_MODEL);
  assert.equal(body.max_output_tokens, 1000);
  assert.equal(body.input.length, 1);
  assert.equal(body.input[0].role, "user");

  const payload = JSON.parse(body.input[0].content[0].text);
  assert.equal(body.input[0].content[0].type, "input_text");
  assert.deepEqual(Object.keys(payload).sort(), ["conversationSummary", "evidence", "message", "profile"]);
  assert.equal(payload.message, MODEL_REQUEST.message);
  assert.deepEqual(payload.evidence, MODEL_REQUEST.evidence);
});

test("reasoning effort is low, the response is not stored, and the identifier is the hash", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.deepEqual(body.reasoning, { effort: "low" });
  assert.equal(body.store, false);
  assert.equal(body.safety_identifier, MODEL_REQUEST.userIdHash);
  /* the deprecated `user` field is never sent alongside it */
  assert.equal(Object.hasOwn(body, "user"), false);
  /* and the identifier is the hash, never a hostname or an address */
  assert.match(body.safety_identifier, /^[0-9a-f]+$/);
});

test("structured output uses text.format, not the deprecated response_format", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.equal(Object.hasOwn(body, "response_format"), false);
  assert.equal(body.text.format.type, "json_schema");
  assert.equal(body.text.format.name, "steward_envelope");
  assert.equal(body.text.format.strict, true);
  assert.equal(body.text.format.schema.additionalProperties, false);
});

test("the wire schema drops every keyword strict mode rejects, and stays a schema", () => {
  const keywords = schemaKeywords(WIRE_SCHEMA);

  for (const banned of [
    "minLength", "maxLength", "pattern", "format",
    "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
    "minItems", "maxItems", "uniqueItems",
    "minProperties", "maxProperties", "patternProperties", "propertyNames", "$schema",
  ]) {
    assert.equal(keywords.has(banned), false, `the wire schema still carries ${banned}`);
  }

  assert.ok(keywords.has("type"));
  assert.ok(keywords.has("enum"));
  assert.ok(keywords.has("required"));
  assert.ok(keywords.has("additionalProperties"));

  /* strict mode requires every property to be required and every object closed */
  const assertClosed = (node, path) => {
    if (node?.type === "object" || (Array.isArray(node?.type) && node.type.includes("object"))) {
      assert.equal(node.additionalProperties, false, `${path} must be closed`);
      assert.deepEqual(
        Object.keys(node.properties ?? {}).sort(),
        [...(node.required ?? [])].sort(),
        `${path}: every property must be required`,
      );
      for (const [name, child] of Object.entries(node.properties ?? {})) assertClosed(child, `${path}.${name}`);
    }
    for (const arm of node?.anyOf ?? []) assertClosed(arm, `${path}|`);
    if (node?.items) assertClosed(node.items, `${path}[]`);
  };
  assertClosed(WIRE_SCHEMA, "envelope");

  /* nullables are spelled as a type union here, not as an anyOf arm */
  assert.deepEqual(WIRE_SCHEMA.properties.memoryCandidate.type, ["string", "null"]);
  assert.deepEqual(WIRE_SCHEMA.properties.nextStep.type, ["object", "null"]);
  assert.equal(Object.hasOwn(WIRE_SCHEMA.properties.nextStep, "anyOf"), false);
  assert.deepEqual(WIRE_SCHEMA.properties.nextStep.required.sort(), ["actionId", "targetId"]);
  assert.deepEqual(WIRE_SCHEMA.properties.schemaVersion.enum, ["1"], "const becomes a one-value enum");
});

test("a completed response parses into the candidate, with usage and a receipt", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  const result = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  assert.deepEqual(result.candidate, VALID_ENVELOPE);
  assert.equal(result.finish, "stop");
  assert.deepEqual(result.usage, { inputTokens: 1200, outputTokens: 90 });
  assert.deepEqual(result.receipt, { provider: "openai", model: DEFAULT_MODEL, requestId: "req_test" });
});

test("a refusal content part is a refusal, never an outage and never an empty answer", async () => {
  const transport = mockTransport(jsonResponse(200, {
    id: "resp_test",
    status: "completed",
    output: [{ type: "message", role: "assistant", content: [{ type: "refusal", refusal: "I can't help with that." }] }],
  }));

  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
    .then(() => null, (thrown) => thrown);

  assert.ok(error instanceof ProviderError);
  assert.equal(error.kind, "refusal");
  /* the provider's own wording is not carried forward */
  assert.equal(error.message.includes("I can't help"), false);
});

test("truncation normalises to length, and a truncated body yields no candidate", async () => {
  const transport = mockTransport(jsonResponse(200, {
    id: "resp_test",
    status: "incomplete",
    incomplete_details: { reason: "max_output_tokens" },
    output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: '{"schemaVersion":"1","spe' }] }],
    usage: { input_tokens: 1200, output_tokens: 1000 },
  }));

  const result = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });
  assert.equal(result.finish, "length");
  assert.equal(result.candidate, null);
});

test("429 and 5xx are outages; 401 and 403 are configuration; a failed run is an outage", async () => {
  for (const status of [429, 500, 503]) {
    const transport = mockTransport(jsonResponse(status, { error: { type: "rate_limit_exceeded" } }));
    const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
      .then(() => null, (thrown) => thrown);
    assert.equal(error.kind, "outage", `${status} must be an outage`);
  }

  for (const status of [401, 403]) {
    const transport = mockTransport(jsonResponse(status, { error: { type: "invalid_api_key" } }));
    const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
      .then(() => null, (thrown) => thrown);
    assert.equal(error.kind, "config", `${status} must be a configuration error`);
  }

  const failed = mockTransport(jsonResponse(200, { id: "resp_test", status: "failed", error: { code: "server_error" } }));
  const error = await generateStructured(MODEL_REQUEST, { transport: failed, apiKey: API_KEY })
    .then(() => null, (thrown) => thrown);
  assert.equal(error.kind, "outage");
});

test("a network failure is an outage and never carries the provider's own text", async () => {
  const transport = async () => { throw new TypeError("fetch failed: ECONNREFUSED 1.2.3.4:443"); };
  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
    .then(() => null, (thrown) => thrown);

  assert.equal(error.kind, "outage");
  assert.equal(error.message, "provider unreachable");
  assert.equal(error.message.includes("ECONNREFUSED"), false);
});

test("the deadline aborts the request and reports an outage", async () => {
  let sawAbort = false;
  const transport = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener("abort", () => {
      sawAbort = true;
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    }, { once: true });
  });

  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY, timeoutMs: 10 })
    .then(() => null, (thrown) => thrown);

  assert.equal(sawAbort, true);
  assert.equal(error.kind, "outage");
  assert.equal(error.message, "provider timed out");
});

test("STEWARD_OPENAI_MODEL overrides the default model", async () => {
  const previous = process.env.STEWARD_OPENAI_MODEL;
  process.env.STEWARD_OPENAI_MODEL = ECONOMY_MODEL;
  try {
    const transport = mockTransport(completedResponse(VALID_ENVELOPE));
    const result = await generateStructured({ ...MODEL_REQUEST, model: undefined }, { transport, apiKey: API_KEY });
    assert.equal(transport.calls[0].body.model, ECONOMY_MODEL);
    assert.equal(result.receipt.model, ECONOMY_MODEL);
  } finally {
    if (previous === undefined) delete process.env.STEWARD_OPENAI_MODEL;
    else process.env.STEWARD_OPENAI_MODEL = previous;
  }
});

test("no credential is a configuration error, and the request is never sent", async () => {
  const transport = mockTransport(completedResponse(VALID_ENVELOPE));
  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: "" })
    .then(() => null, (thrown) => thrown);

  assert.equal(error.kind, "config");
  assert.equal(transport.calls.length, 0, "a keyless call must not reach the wire");
});
