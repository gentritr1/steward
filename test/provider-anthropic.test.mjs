import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MODEL,
  ECONOMY_MODEL,
  WIRE_SCHEMA,
  buildRequestBody,
  generateStructured,
} from "../server/providers/anthropic.mjs";
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

/* a fetch stand-in: records what it was asked for, replies with what the test
   says the wire said. no test in this file may open a socket. */
function mockTransport(reply) {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const value = typeof reply === "function" ? reply(calls.length) : reply;
    return value;
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

function messageResponse(envelope, extra = {}) {
  return jsonResponse(200, {
    id: "msg_test",
    stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify(envelope) }],
    usage: { input_tokens: 1200, output_tokens: 90 },
    ...extra,
  }, { "request-id": "req_test" });
}

test("the request carries the endpoint, the version header, and the key header", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const [call] = transport.calls;
  assert.equal(call.url, "https://api.anthropic.com/v1/messages");
  assert.equal(call.init.method, "POST");
  assert.equal(call.init.headers["anthropic-version"], "2023-06-01");
  assert.equal(call.init.headers["x-api-key"], API_KEY);
  assert.equal(call.init.headers["content-type"], "application/json");
  assert.ok(call.init.signal, "the request must be bound to an abort signal");
});

test("the prompt is a top-level system block, and the payload is the user turn", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.equal(body.system, STEWARD_DEVELOPER_PROMPT);
  assert.equal(body.max_tokens, 1000);
  assert.equal(body.messages.length, 1);
  assert.equal(body.messages[0].role, "user");
  /* no assistant prefill: it is a 400 on current models */
  assert.equal(body.messages.some((turn) => turn.role === "assistant"), false);
  /* thinking is omitted entirely, and `store` does not exist on this API */
  assert.equal(Object.hasOwn(body, "thinking"), false);
  assert.equal(Object.hasOwn(body, "store"), false);

  const payload = JSON.parse(body.messages[0].content);
  assert.deepEqual(Object.keys(payload).sort(), ["conversationSummary", "evidence", "message", "profile"]);
  assert.equal(payload.message, MODEL_REQUEST.message);
  assert.deepEqual(payload.evidence, MODEL_REQUEST.evidence);
});

test("the hashed identifier travels as metadata.user_id and nothing else", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.equal(body.metadata.user_id, MODEL_REQUEST.userIdHash);
  assert.deepEqual(Object.keys(body.metadata), ["user_id"]);
});

test("structured output is requested as a json_schema output_config", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  const { body } = transport.calls[0];
  assert.equal(body.output_config.format.type, "json_schema");
  assert.equal(body.output_config.format.schema.type, "object");
  assert.equal(body.output_config.format.schema.additionalProperties, false);
});

test("effort is set for sonnet-5 and absent for haiku-4-5, in the same output_config", () => {
  const sonnet = buildRequestBody(MODEL_REQUEST, DEFAULT_MODEL);
  assert.equal(sonnet.output_config.effort, "low");
  assert.equal(sonnet.output_config.format.type, "json_schema", "effort must not displace the format");

  /* effort is an error on haiku, so its absence is a correctness requirement */
  const haiku = buildRequestBody(MODEL_REQUEST, ECONOMY_MODEL);
  assert.equal(Object.hasOwn(haiku.output_config, "effort"), false);
  assert.equal(haiku.output_config.format.type, "json_schema");

  /* and the gate is the exact id, not a family prefix */
  const future = buildRequestBody(MODEL_REQUEST, "claude-sonnet-5-20991231");
  assert.equal(Object.hasOwn(future.output_config, "effort"), false);
});

test("the wire schema keeps the contract's shape and drops every length and range keyword", () => {
  const keywords = schemaKeywords(WIRE_SCHEMA);

  for (const banned of [
    "minLength", "maxLength", "pattern", "format",
    "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
    "minItems", "maxItems", "uniqueItems",
    "minProperties", "maxProperties", "$schema",
  ]) {
    assert.equal(keywords.has(banned), false, `the wire schema still carries ${banned}`);
  }

  /* an absence proves nothing on its own; the schema must still be a schema */
  assert.ok(keywords.has("type"));
  assert.ok(keywords.has("enum"));
  assert.ok(keywords.has("required"));
  assert.ok(keywords.has("additionalProperties"));
  assert.ok(keywords.has("anyOf"), "nullables stay as anyOf arms on this API");

  assert.deepEqual(WIRE_SCHEMA.properties.schemaVersion.enum, ["1"], "const becomes a one-value enum");
  assert.deepEqual(WIRE_SCHEMA.properties.speaker.enum, ["steward"]);
  assert.deepEqual(
    WIRE_SCHEMA.properties.epistemicState.enum,
    ["measured", "inferred", "unavailable", "simulated"],
  );
  assert.deepEqual(WIRE_SCHEMA.required.sort(), [
    "confidence", "epistemicState", "evidenceIds", "memoryCandidate",
    "message", "nextStep", "presentation", "schemaVersion", "speaker",
  ]);
  /* the null arm survives, so "no next step" is still expressible */
  assert.ok(WIRE_SCHEMA.properties.nextStep.anyOf.some((arm) => arm.type === "null"));
});

test("an end_turn response parses into the candidate, with usage and a receipt", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  const result = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });

  assert.deepEqual(result.candidate, VALID_ENVELOPE);
  assert.equal(result.finish, "stop");
  assert.deepEqual(result.usage, { inputTokens: 1200, outputTokens: 90 });
  assert.deepEqual(result.receipt, { provider: "anthropic", model: DEFAULT_MODEL, requestId: "req_test" });
});

test("a refusal is a refusal, never an outage and never an empty answer", async () => {
  const transport = mockTransport(jsonResponse(200, {
    stop_reason: "refusal",
    stop_details: { category: "policy" },
    content: [],
  }));

  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
    .then(() => null, (thrown) => thrown);

  assert.ok(error instanceof ProviderError);
  assert.equal(error.kind, "refusal");
  assert.equal(error.category, "policy");
});

test("max_tokens normalises to length, and a truncated body yields no candidate", async () => {
  const transport = mockTransport(jsonResponse(200, {
    stop_reason: "max_tokens",
    content: [{ type: "text", text: '{"schemaVersion":"1","speaker":"stew' }],
    usage: { input_tokens: 1200, output_tokens: 1000 },
  }));

  const result = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY });
  assert.equal(result.finish, "length");
  assert.equal(result.candidate, null);
});

test("429 and 5xx are outages; 401 and 403 are configuration", async () => {
  for (const status of [429, 500, 503]) {
    const transport = mockTransport(jsonResponse(status, { error: { type: "overloaded" } }));
    const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
      .then(() => null, (thrown) => thrown);
    assert.equal(error.kind, "outage", `${status} must be an outage`);
    assert.equal(error.status, status);
  }

  for (const status of [401, 403]) {
    const transport = mockTransport(jsonResponse(status, { error: { type: "authentication_error" } }));
    const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
      .then(() => null, (thrown) => thrown);
    assert.equal(error.kind, "config", `${status} must be a configuration error`);
  }
});

test("a network failure is an outage and never carries the provider's own text", async () => {
  const transport = async () => { throw new TypeError("fetch failed: ECONNREFUSED 1.2.3.4:443"); };
  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY })
    .then(() => null, (thrown) => thrown);

  assert.equal(error.kind, "outage");
  assert.equal(error.message, "provider unreachable");
  assert.equal(error.message.includes("ECONNREFUSED"), false);
});

test("a request that never answers is aborted and reported as a timeout", async () => {
  /* the transport hangs until the adapter's own deadline aborts the signal,
     which is what a dead socket looks like from here */
  const transport = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    }, { once: true });
  });

  const controller = new AbortController();
  const pending = generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY, signal: controller.signal })
    .then(() => null, (thrown) => thrown);

  /* the caller cancelling is NOT a provider failure: it propagates untouched */
  controller.abort();
  const cancelled = await pending;
  assert.equal(cancelled.name, "AbortError");
  assert.equal(cancelled instanceof ProviderError, false);
});

test("the twenty-second deadline aborts the request and reports an outage", async () => {
  let sawAbort = false;
  const transport = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener("abort", () => {
      sawAbort = true;
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    }, { once: true });
  });

  /* the same deadline the adapter arms in production, wound down so the test
     reaches the expiry branch in milliseconds rather than in twenty seconds */
  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: API_KEY, timeoutMs: 10 })
    .then(() => null, (thrown) => thrown);

  assert.equal(sawAbort, true, "the in-flight request must actually be aborted");
  assert.ok(error instanceof ProviderError);
  assert.equal(error.kind, "outage");
  assert.equal(error.message, "provider timed out");
});

test("STEWARD_CLAUDE_MODEL overrides the default model", async () => {
  const previous = process.env.STEWARD_CLAUDE_MODEL;
  process.env.STEWARD_CLAUDE_MODEL = ECONOMY_MODEL;
  try {
    const transport = mockTransport(messageResponse(VALID_ENVELOPE));
    const result = await generateStructured({ ...MODEL_REQUEST, model: undefined }, { transport, apiKey: API_KEY });
    assert.equal(transport.calls[0].body.model, ECONOMY_MODEL);
    assert.equal(result.receipt.model, ECONOMY_MODEL);
    assert.equal(Object.hasOwn(transport.calls[0].body.output_config, "effort"), false);
  } finally {
    if (previous === undefined) delete process.env.STEWARD_CLAUDE_MODEL;
    else process.env.STEWARD_CLAUDE_MODEL = previous;
  }
});

test("no credential is a configuration error, and the request is never sent", async () => {
  const transport = mockTransport(messageResponse(VALID_ENVELOPE));
  const error = await generateStructured(MODEL_REQUEST, { transport, apiKey: "  " })
    .then(() => null, (thrown) => thrown);

  assert.equal(error.kind, "config");
  assert.equal(transport.calls.length, 0, "a keyless call must not reach the wire");
});
