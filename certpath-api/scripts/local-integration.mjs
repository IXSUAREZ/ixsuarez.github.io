/* Run against `wrangler dev --local --var ENVIRONMENT:development`. */
const base = process.env.API_BASE || "http://127.0.0.1:8790";
const origin = "http://localhost:5173";
const suffix = Math.floor(Math.random() * 200) + 20;
const studentIp = `198.51.100.${suffix}`;
const ownerIp = `203.0.113.${suffix}`;
const successOwnerIp = `203.0.113.${Math.min(254, suffix + 1)}`;
const input = {
  contact: { firstName: "Local", lastName: "Tester", email: "local@example.test", phone: "+1 502 555 0199" },
  scenario: { targets: ["private-asel"], experience: { totalTime: "0" } },
  plan: { audits: [{ title: "<img src=x onerror=alert(1)>" }], combined: { injected: "<script>alert(1)</script>" }, sourceReviewDate: "2026-09-17" },
  calculatorVersion: "local-integration-v1",
};

function assert(condition, message) { if (!condition) throw new Error(message); }
async function call(path, init = {}) {
  const response = await fetch(`${base}${path}`, { ...init, headers: { Origin: origin, ...(init.headers || {}) } });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

const idempotencyKey = `local-test-${crypto.randomUUID()}`;
const create = await call("/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, "CF-Connecting-IP": studentIp },
  body: JSON.stringify(input),
});
assert(create.response.status === 201, `create expected 201, got ${create.response.status}`);
assert(create.response.headers.get("cache-control") === "no-store", "create must be no-store");
assert(create.response.headers.get("access-control-allow-origin") === origin, "development CORS must allow localhost");
assert(create.body.token && create.body.id && create.body.revision === 1, "create response missing private record fields");
assert(!JSON.stringify(create.body.plan).includes("<script>alert(1)</script>"), "server must discard untrusted calculated-plan input");

const replay = await call("/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, "CF-Connecting-IP": studentIp },
  body: JSON.stringify(input),
});
assert(replay.response.status === 200 && replay.body.idempotent === true, "idempotent replay failed");
assert(replay.body.id === create.body.id && replay.body.token === create.body.token, "idempotent replay changed plan credentials");

const raceKey = `local-race-${crypto.randomUUID()}`;
const sameKey = await Promise.all([0, 1].map(() => call("/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": raceKey, "CF-Connecting-IP": studentIp },
  body: JSON.stringify(input),
})));
assert(sameKey.every(({ response }) => response.status === 201 || response.status === 200), "same-key create race must not return 500");
assert(sameKey[0].body.id === sameKey[1].body.id && sameKey[0].body.token === sameKey[1].body.token, "same-key create race must converge on one private record");

const concurrent = await Promise.all(Array.from({ length: 12 }, (_, index) => call("/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": `local-burst-${crypto.randomUUID()}-${index}`, "CF-Connecting-IP": studentIp },
  body: JSON.stringify(input),
})));
const createdInBurst = concurrent.filter(({ response }) => response.status === 201).length;
assert(createdInBurst <= 9 && concurrent.every(({ response }) => response.status === 201 || response.status === 429), "concurrent create requests bypassed the IP reservation limit");

const oversizedPayload = JSON.stringify({ ...input, plan: { audits: [], combined: {}, padding: "x".repeat(220_000) } });
const oversized = await fetch(`${base}/plans`, {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": `local-large-${crypto.randomUUID()}`, "CF-Connecting-IP": `198.51.100.${Math.min(254, suffix + 2)}` },
  body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(oversizedPayload)); controller.close(); } }),
  duplex: "half",
});
assert(oversized.status === 400, "chunked/unknown-length oversized body must be rejected from actual bytes");

const auth = { Authorization: `Bearer ${create.body.token}` };
const noToken = await call(`/plans/${create.body.id}`);
assert(noToken.response.status === 401, "private plan read must require a token");
const wrongToken = await call(`/plans/${create.body.id}`, { headers: { Authorization: `Bearer ${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}` } });
assert(wrongToken.response.status === 401, "wrong private token must be denied");
const otherPlan = await call("/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": `local-other-${crypto.randomUUID()}`, "CF-Connecting-IP": `198.51.100.${Math.min(254, suffix + 3)}` },
  body: JSON.stringify(input),
});
assert(otherPlan.response.status === 201, "second private plan create failed");
const crossToken = await call(`/plans/${create.body.id}`, { headers: { Authorization: `Bearer ${otherPlan.body.token}` } });
assert(crossToken.response.status === 401, "a private token must not read another plan");
const get = await call(`/plans/${create.body.id}`, { headers: auth });
assert(get.response.status === 200 && get.body.contact.email === input.contact.email, "private plan read failed");
const updateKey = `local-update-${crypto.randomUUID()}`;
const update = await call(`/plans/${create.body.id}`, { method: "PUT", headers: { ...auth, "Content-Type": "application/json", "Idempotency-Key": updateKey }, body: JSON.stringify({ ...input, revision: 1 }) });
assert(update.response.status === 200 && update.body.revision === 2, "optimistic update failed");
const updateReplay = await call(`/plans/${create.body.id}`, { method: "PUT", headers: { ...auth, "Content-Type": "application/json", "Idempotency-Key": updateKey }, body: JSON.stringify({ ...input, revision: 1 }) });
assert(updateReplay.response.status === 200 && updateReplay.body.idempotent === true && updateReplay.body.revision === 2, "lost update response replay failed");
const parallelUpdateKey = `local-update-race-${crypto.randomUUID()}`;
const sameUpdate = await Promise.all([0, 1].map(() => call(`/plans/${create.body.id}`, { method: "PUT", headers: { ...auth, "Content-Type": "application/json", "Idempotency-Key": parallelUpdateKey }, body: JSON.stringify({ ...input, revision: 2 }) })));
assert(sameUpdate.every(({ response }) => response.status === 200), "same-key update race must not return 500 or 409");
assert(sameUpdate[0].body.revision === 3 && sameUpdate[1].body.revision === 3, "same-key update race must converge on one revision");
const stale = await call(`/plans/${create.body.id}`, { method: "PUT", headers: { ...auth, "Content-Type": "application/json", "Idempotency-Key": `local-stale-${crypto.randomUUID()}` }, body: JSON.stringify({ ...input, revision: 1 }) });
assert(stale.response.status === 409, "stale revision must conflict");

for (let index = 0; index < 5; index += 1) {
  const failed = await call("/owner/unlock", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": ownerIp }, body: JSON.stringify({ pin: "wrong" }) });
  assert(failed.response.status === 401, `failed owner attempt ${index + 1} must be 401`);
}
const blocked = await call("/owner/unlock", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": ownerIp }, body: JSON.stringify({ pin: "wrong" }) });
assert(blocked.response.status === 429, "sixth failed owner attempt must be rate limited");
const unlocked = await call("/owner/unlock", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": successOwnerIp }, body: JSON.stringify({ pin: "123456" }) });
assert(unlocked.response.status === 200 && unlocked.body.token, "owner unlock failed");
const ownerAuth = { Authorization: `Bearer ${unlocked.body.token}` };
const unauthOwnerList = await call("/owner/plans");
const unauthOwnerDetail = await call(`/owner/plans/${create.body.id}`);
const unauthOwnerDelete = await call(`/owner/plans/${create.body.id}`, { method: "DELETE" });
assert(unauthOwnerList.response.status === 401 && unauthOwnerDetail.response.status === 401 && unauthOwnerDelete.response.status === 401, "owner routes must require an owner session");
const list = await call("/owner/plans?q=Local%20Tester", { headers: ownerAuth });
assert(list.response.status === 200 && list.body.items.some((item) => item.id === create.body.id), "owner list failed");
assert(list.body.items.every((item) => !("plan" in item) && Array.isArray(item.scenario.targets)), "owner list must return only summary records");
const removed = await call(`/owner/plans/${create.body.id}`, { method: "DELETE", headers: ownerAuth });
assert(removed.response.status === 204, "owner delete failed");
const deletedPrivate = await call(`/plans/${create.body.id}`, { headers: auth });
assert(deletedPrivate.response.status === 404, "deleted private plan link must return 404");
const logout = await call("/owner/logout", { method: "POST", headers: ownerAuth });
assert(logout.response.status === 204, "owner logout failed");
const afterLogout = await call("/owner/plans", { headers: ownerAuth });
assert(afterLogout.response.status === 401, "logged-out owner session must be denied");

console.log("Local D1 integration passed: private/owner auth, create/replay/read/update/conflict/atomic-rate-limit/body-limit/search/delete/logout.");
