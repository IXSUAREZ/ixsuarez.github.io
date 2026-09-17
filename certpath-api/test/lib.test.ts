import assert from "node:assert/strict";
import test from "node:test";
import {
  allowedOrigin,
  base64url,
  cursorFor,
  decrypt,
  encrypt,
  fromBase64url,
  parseBearer,
  parseCursor,
  parsePlanInput,
  pbkdf2,
  randomToken,
  tokenHash,
  verifyOwnerPin,
} from "../src/lib";

const encoder = new TextEncoder();

test("plan input requires contact and validates bounded calculator snapshots", () => {
  const input = parsePlanInput({
    contact: { firstName: " Diego ", lastName: "Suarez", email: "DIEGO@example.com", phone: "+1 (502) 555-0199" },
    scenario: { targets: ["private-asel"], credentials: [], events: {} },
    plan: { audits: [], combined: {} },
    calculatorVersion: "2026.09.17",
  });
  assert.deepEqual(input.contact, { firstName: "Diego", lastName: "Suarez", email: "diego@example.com", phone: "+1 (502) 555-0199" });
  assert.throws(() => parsePlanInput({ contact: { firstName: "A", lastName: "B", email: "bad", phone: "123" }, scenario: {}, plan: {}, calculatorVersion: "v1" }));
  assert.throws(() => parsePlanInput({ contact: { firstName: "A", lastName: "B", email: "a@b.com" }, scenario: {}, plan: {}, calculatorVersion: "v1" }));
  assert.throws(() => parsePlanInput({ contact: { firstName: "A", lastName: "B", email: "a@b.com", phone: "-------" }, scenario: { targets: ["x"] }, plan: { audits: [], combined: {} }, calculatorVersion: "v1" }));
  assert.throws(() => parsePlanInput({ contact: { firstName: "A", lastName: "B", email: "a@b.com", phone: "5025550199" }, scenario: null, plan: { audits: [], combined: {} }, calculatorVersion: "v1" }));
  assert.throws(() => parsePlanInput({ contact: { firstName: "A", lastName: "B", email: "a@b.com", phone: "5025550199" }, scenario: { targets: ["x"] }, plan: { audits: [] }, calculatorVersion: "v1" }));
});

test("private bearer tokens are high-entropy, hashable, and parser-restricted", async () => {
  const token = randomToken();
  assert.match(token, /^[A-Za-z0-9_-]{40,}$/);
  assert.equal(parseBearer(new Request("https://example.test", { headers: { Authorization: `Bearer ${token}` } })), token);
  assert.equal(parseBearer(new Request("https://example.test", { headers: { Authorization: "Bearer short" } })), null);
  assert.notEqual(await tokenHash(token, "pepper-a"), await tokenHash(token, "pepper-b"));
});

test("PBKDF2 owner-PIN format verifies only the matching configured PIN", async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2("correct horse battery staple", salt, 100_000);
  const encoded = `pbkdf2-sha256$100000$${base64url(salt)}$${base64url(hash)}`;
  assert.equal(await verifyOwnerPin("correct horse battery staple", encoded), true);
  assert.equal(await verifyOwnerPin("wrong pin", encoded), false);
  assert.equal(await verifyOwnerPin("correct horse battery staple", "pbkdf2-sha256$1$x$y"), false);
});

test("idempotency token encryption is reversible only with its configured 256-bit key", async () => {
  const key = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const token = randomToken();
  const ciphertext = await encrypt(token, key);
  assert.notEqual(ciphertext, token);
  assert.equal(await decrypt(ciphertext, key), token);
  await assert.rejects(() => decrypt(ciphertext, base64url(crypto.getRandomValues(new Uint8Array(32)))));
});

test("owner cursors round-trip and CORS never reflects an arbitrary origin", () => {
  const cursor = cursorFor("2026-09-17T12:00:00.000Z", "plan_abc");
  assert.deepEqual(parseCursor(cursor), { updatedAt: "2026-09-17T12:00:00.000Z", id: "plan_abc" });
  assert.equal(parseCursor(base64url(encoder.encode("bad"))), null);
  assert.equal(allowedOrigin("https://suarezcfi.com", false), "https://suarezcfi.com");
  assert.equal(allowedOrigin("http://localhost:8787", true), "http://localhost:8787");
  assert.equal(allowedOrigin("http://localhost:8787", false), null);
  assert.equal(allowedOrigin("https://attacker.example", true), null);
  assert.deepEqual(fromBase64url(base64url(encoder.encode("safe"))), encoder.encode("safe"));
});
