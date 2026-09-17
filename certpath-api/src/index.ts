import {
  OWNER_HARD_MS,
  OWNER_IDLE_MS,
  WINDOW_MS,
  allowedOrigin,
  cursorFor,
  decrypt,
  encrypt,
  json,
  jsonError,
  parseBearer,
  parseCursor,
  parsePlanInput,
  parseRevision,
  randomToken,
  sha256,
  tokenHash,
  verifyOwnerPin,
} from "./lib";
import CORE from "../../simply-endorsed/js/part61-calculator-core.js";

const SERVER_CALCULATOR_VERSION = "part61-core-2026-09-17";

export interface Env {
  DB: D1Database;
  OWNER_PIN_HASH: string;
  TOKEN_PEPPER: string;
  TOKEN_ENCRYPTION_KEY: string;
  ENVIRONMENT?: string;
}

interface PlanRow {
  id: string;
  private_token_hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  scenario_json: string;
  plan_json: string;
  calculator_version: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

interface SessionRow {
  token_hash: string;
  created_at: string;
  last_seen_at: string;
  idle_expires_at: string;
  hard_expires_at: string;
}

const PLAN_COLUMNS = "id, private_token_hash, first_name, last_name, email, phone, scenario_json, plan_json, calculator_version, revision, created_at, updated_at";
const PLAN_SUMMARY_COLUMNS = "id, first_name, last_name, email, phone, scenario_json, calculator_version, revision, created_at, updated_at";
const MAX_CREATE_PER_WINDOW = 10;
const MAX_OWNER_IP_FAILURES = 5;
const MAX_OWNER_GLOBAL_FAILURES = 20;

function now(): string { return new Date().toISOString(); }
function isoAfter(milliseconds: number): string { return new Date(Date.now() + milliseconds).toISOString(); }

function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  const origin = allowedOrigin(request.headers.get("Origin"), env.ENVIRONMENT === "development");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Idempotency-Key");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Vary", "Origin");
  }
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, headers });
}

async function readJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 210_000) throw new Error("Request body exceeds the 200 KB limit.");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > 210_000) throw new Error("Request body exceeds the 200 KB limit.");
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error("Request body must be valid JSON."); }
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0].trim() || "unknown";
}

async function subjectForIp(request: Request, env: Env): Promise<string> {
  return sha256(`certpath-ip-v1:${env.TOKEN_PEPPER}:${clientIp(request)}`);
}

async function countRecent(db: D1Database, bucket: string, subject: string): Promise<number> {
  const cutoff = Date.now() - WINDOW_MS;
  const row = await db.prepare("SELECT COUNT(*) AS count FROM rate_events WHERE bucket = ? AND subject_hash = ? AND occurred_at >= ?")
    .bind(bucket, subject, cutoff).first<{ count: number }>();
  return Number(row?.count || 0);
}

async function rateEvent(db: D1Database, bucket: string, subject: string): Promise<string> {
  const eventId = randomToken(12);
  await db.prepare("INSERT INTO rate_events (event_id, bucket, subject_hash, occurred_at) VALUES (?, ?, ?, ?)")
    .bind(eventId, bucket, subject, Date.now()).run();
  return eventId;
}

async function allowCreate(request: Request, env: Env): Promise<boolean> {
  const subject = await subjectForIp(request, env);
  await rateEvent(env.DB, "create", subject);
  // Reserve before checking. Concurrent requests can therefore create at most
  // the first ten rows; later requests observe their own reservation and fail.
  return (await countRecent(env.DB, "create", subject)) <= MAX_CREATE_PER_WINDOW;
}

async function reserveOwnerAttempt(request: Request, env: Env): Promise<{ ipEventId: string; globalEventId: string } | null> {
  const subject = await subjectForIp(request, env);
  const ipEventId = randomToken(12);
  const globalEventId = randomToken(12);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO rate_events (event_id, bucket, subject_hash, occurred_at) VALUES (?, ?, ?, ?)")
      .bind(ipEventId, "owner-failure", subject, Date.now()),
    env.DB.prepare("INSERT INTO rate_events (event_id, bucket, subject_hash, occurred_at) VALUES (?, ?, ?, ?)")
      .bind(globalEventId, "owner-failure", "global", Date.now()),
  ]);
  const [ipCount, globalCount] = await Promise.all([
    countRecent(env.DB, "owner-failure", subject),
    countRecent(env.DB, "owner-failure", "global"),
  ]);
  if (ipCount <= MAX_OWNER_IP_FAILURES && globalCount <= MAX_OWNER_GLOBAL_FAILURES) return { ipEventId, globalEventId };
  await env.DB.prepare("DELETE FROM rate_events WHERE event_id IN (?, ?)").bind(ipEventId, globalEventId).run();
  return null;
}

async function releaseOwnerReservation(reservation: { ipEventId: string; globalEventId: string }, env: Env): Promise<void> {
  await env.DB.prepare("DELETE FROM rate_events WHERE event_id IN (?, ?)")
    .bind(reservation.ipEventId, reservation.globalEventId).run();
}

async function cleanup(env: Env): Promise<void> {
  const timestamp = now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM owner_sessions WHERE hard_expires_at <= ? OR idle_expires_at <= ?").bind(timestamp, timestamp),
    env.DB.prepare("DELETE FROM idempotency_keys WHERE expires_at <= ?").bind(timestamp),
    env.DB.prepare("DELETE FROM rate_events WHERE occurred_at < ?").bind(Date.now() - WINDOW_MS),
  ]);
}

function recordFromRow(row: PlanRow) {
  return {
    id: row.id,
    contact: { firstName: row.first_name, lastName: row.last_name, email: row.email, phone: row.phone },
    scenario: JSON.parse(row.scenario_json),
    plan: JSON.parse(row.plan_json),
    calculatorVersion: row.calculator_version,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getPlan(id: string, env: Env): Promise<PlanRow | null> {
  return env.DB.prepare(`SELECT ${PLAN_COLUMNS} FROM plans WHERE id = ?`).bind(id).first<PlanRow>();
}

async function studentPlan(request: Request, id: string, env: Env): Promise<PlanRow | null | Response> {
  const token = parseBearer(request);
  if (!token) return jsonError("A private plan token is required.", 401);
  const row = await getPlan(id, env);
  if (!row) return null;
  const hash = await tokenHash(token, env.TOKEN_PEPPER);
  return hash === row.private_token_hash ? row : jsonError("Invalid private plan token.", 401);
}

async function ownerAuthorized(request: Request, env: Env): Promise<boolean> {
  const token = parseBearer(request);
  if (!token) return false;
  const hash = await tokenHash(token, env.TOKEN_PEPPER);
  const row = await env.DB.prepare("SELECT token_hash, created_at, last_seen_at, idle_expires_at, hard_expires_at FROM owner_sessions WHERE token_hash = ?")
    .bind(hash).first<SessionRow>();
  if (!row) return false;
  const current = Date.now();
  if (Date.parse(row.idle_expires_at) <= current || Date.parse(row.hard_expires_at) <= current) {
    await env.DB.prepare("DELETE FROM owner_sessions WHERE token_hash = ?").bind(hash).run();
    return false;
  }
  const idleExpiry = new Date(Math.min(current + OWNER_IDLE_MS, Date.parse(row.hard_expires_at))).toISOString();
  await env.DB.prepare("UPDATE owner_sessions SET last_seen_at = ?, idle_expires_at = ? WHERE token_hash = ?")
    .bind(now(), idleExpiry, hash).run();
  return true;
}

function validId(id: string): boolean { return /^[A-Za-z0-9_-]{16,80}$/.test(id); }

async function createPlan(request: Request, env: Env): Promise<Response> {
  const idempotencyKey = request.headers.get("Idempotency-Key") || "";
  if (!/^[A-Za-z0-9._-]{16,200}$/.test(idempotencyKey)) return jsonError("Idempotency-Key must be 16-200 URL-safe characters.");
  let input;
  try { input = parsePlanInput(await readJson(request)); } catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid plan input."); }
  const requestHash = await sha256(JSON.stringify(input));
  const keyHash = await tokenHash(idempotencyKey, env.TOKEN_PEPPER);
  const existing = await env.DB.prepare("SELECT request_hash, plan_id, token_ciphertext, expires_at, operation, response_revision FROM idempotency_keys WHERE key_hash = ?")
    .bind(keyHash).first<{ request_hash: string; plan_id: string; token_ciphertext: string; expires_at: string; operation: string; response_revision: number }>();
  if (existing) {
    if (existing.operation !== "create" || existing.request_hash !== requestHash) return jsonError("Idempotency-Key was already used for a different request.", 409);
    const row = await getPlan(existing.plan_id, env);
    if (!row || Date.parse(existing.expires_at) <= Date.now()) return jsonError("Idempotency key has expired; submit with a new key.", 409);
    const token = await decrypt(existing.token_ciphertext, env.TOKEN_ENCRYPTION_KEY);
    return json({ ...recordFromRow(row), token, idempotent: true }, 200);
  }
  if (!await allowCreate(request, env)) return jsonError("Too many plan creation attempts. Try again later.", 429);
  const id = randomToken(18);
  const token = randomToken(32);
  const issued = now();
  const plan = CORE.calculateAudit(input.scenario);
  const scenario = input.scenario;
  const tokenCiphertext = await encrypt(token, env.TOKEN_ENCRYPTION_KEY);
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO plans (${PLAN_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, await tokenHash(token, env.TOKEN_PEPPER), input.contact.firstName, input.contact.lastName, input.contact.email, input.contact.phone,
          JSON.stringify(scenario), JSON.stringify(plan), SERVER_CALCULATOR_VERSION, 1, issued, issued),
      env.DB.prepare("INSERT INTO idempotency_keys (key_hash, request_hash, plan_id, token_ciphertext, operation, response_revision, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(keyHash, requestHash, id, tokenCiphertext, "create", 1, issued, isoAfter(24 * 60 * 60 * 1000)),
    ]);
  } catch {
    // A simultaneous identical request can lose the unique-key race after its
    // preflight lookup. Re-read the committed winner and make the retry safe.
    const winner = await env.DB.prepare("SELECT request_hash, plan_id, token_ciphertext, expires_at, operation FROM idempotency_keys WHERE key_hash = ?")
      .bind(keyHash).first<{ request_hash: string; plan_id: string; token_ciphertext: string; expires_at: string; operation: string }>();
    if (winner && winner.operation === "create" && winner.request_hash === requestHash && Date.parse(winner.expires_at) > Date.now()) {
      const winnerPlan = await getPlan(winner.plan_id, env);
      if (winnerPlan) return json({ ...recordFromRow(winnerPlan), token: await decrypt(winner.token_ciphertext, env.TOKEN_ENCRYPTION_KEY), idempotent: true });
    }
    throw new Error("Plan persistence failed.");
  }
  const row = await getPlan(id, env);
  if (!row) return jsonError("Plan persistence failed.", 500);
  return json({ ...recordFromRow(row), token }, 201);
}

async function updatePlan(request: Request, id: string, env: Env): Promise<Response> {
  const authorized = await studentPlan(request, id, env);
  if (authorized instanceof Response) return authorized;
  if (!authorized) return jsonError("Plan not found.", 404);
  let body: Record<string, unknown>;
  let input;
  try {
    body = (await readJson(request)) as Record<string, unknown>;
    input = parsePlanInput(body);
    parseRevision(body.revision);
  } catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid plan input."); }
  const revision = body.revision as number;
  const idempotencyKey = request.headers.get("Idempotency-Key") || "";
  if (!/^[A-Za-z0-9._-]{16,200}$/.test(idempotencyKey)) return jsonError("Idempotency-Key must be 16-200 URL-safe characters.");
  const requestHash = await sha256(JSON.stringify({ id, revision, input }));
  const keyHash = await tokenHash(idempotencyKey, env.TOKEN_PEPPER);
  const prior = await env.DB.prepare("SELECT request_hash, plan_id, operation, response_revision, expires_at FROM idempotency_keys WHERE key_hash = ?")
    .bind(keyHash).first<{ request_hash: string; plan_id: string; operation: string; response_revision: number; expires_at: string }>();
  if (prior) {
    if (prior.operation !== "update" || prior.plan_id !== id || prior.request_hash !== requestHash || Date.parse(prior.expires_at) <= Date.now()) return jsonError("Idempotency-Key was already used for a different request.", 409);
    const current = await getPlan(id, env);
    if (!current || current.revision !== prior.response_revision) return jsonError("Plan has changed since this update. Reload before saving.", 409);
    return json({ ...recordFromRow(current), idempotent: true });
  }
  const updated = now();
  const authoritativePlan = CORE.calculateAudit(input.scenario);
  let result: D1Result[];
  try {
    // D1 batch is transactional. Reserve the idempotency key only if the
    // expected revision still exists, then update within the same commit.
    result = await env.DB.batch([
      env.DB.prepare("INSERT INTO idempotency_keys (key_hash, request_hash, plan_id, token_ciphertext, operation, response_revision, created_at, expires_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM plans WHERE id = ? AND revision = ?)")
        .bind(keyHash, requestHash, id, "", "update", revision + 1, updated, isoAfter(24 * 60 * 60 * 1000), id, revision),
      env.DB.prepare("UPDATE plans SET first_name = ?, last_name = ?, email = ?, phone = ?, scenario_json = ?, plan_json = ?, calculator_version = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?")
        .bind(input.contact.firstName, input.contact.lastName, input.contact.email, input.contact.phone, JSON.stringify(input.scenario), JSON.stringify(authoritativePlan), SERVER_CALCULATOR_VERSION, updated, id, revision),
    ]);
  } catch {
    const winner = await env.DB.prepare("SELECT request_hash, plan_id, operation, response_revision, expires_at FROM idempotency_keys WHERE key_hash = ?")
      .bind(keyHash).first<{ request_hash: string; plan_id: string; operation: string; response_revision: number; expires_at: string }>();
    if (winner && winner.operation === "update" && winner.plan_id === id && winner.request_hash === requestHash && Date.parse(winner.expires_at) > Date.now()) {
      const winnerPlan = await getPlan(id, env);
      if (winnerPlan && winnerPlan.revision === winner.response_revision) return json({ ...recordFromRow(winnerPlan), idempotent: true });
    }
    throw new Error("Plan persistence failed.");
  }
  if (result[0].meta.changes !== 1 || result[1].meta.changes !== 1) return jsonError("Plan changed elsewhere. Reload before saving.", 409);
  const row = await getPlan(id, env);
  return row ? json(recordFromRow(row)) : jsonError("Plan not found.", 404);
}

async function unlockOwner(request: Request, env: Env): Promise<Response> {
  const reservation = await reserveOwnerAttempt(request, env);
  if (!reservation) return jsonError("Too many failed owner unlock attempts. Try again later.", 429);
  let pin: string | undefined;
  try {
    const body = await readJson(request) as Record<string, unknown>;
    pin = typeof body.pin === "string" && body.pin.length <= 256 ? body.pin : undefined;
  } catch { /* use generic failure below */ }
  if (!pin || !await verifyOwnerPin(pin, env.OWNER_PIN_HASH)) {
    return jsonError("Invalid owner PIN.", 401);
  }
  await releaseOwnerReservation(reservation, env);
  const token = randomToken(32);
  const timestamp = now();
  const hardExpiry = isoAfter(OWNER_HARD_MS);
  const idleExpiry = isoAfter(OWNER_IDLE_MS);
  await env.DB.prepare("INSERT INTO owner_sessions (token_hash, created_at, last_seen_at, idle_expires_at, hard_expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(await tokenHash(token, env.TOKEN_PEPPER), timestamp, timestamp, idleExpiry, hardExpiry).run();
  return json({ token, expiresAt: idleExpiry });
}

async function logoutOwner(request: Request, env: Env): Promise<Response> {
  const token = parseBearer(request);
  if (token) await env.DB.prepare("DELETE FROM owner_sessions WHERE token_hash = ?").bind(await tokenHash(token, env.TOKEN_PEPPER)).run();
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

async function ownerPlans(request: Request, env: Env): Promise<Response> {
  if (!await ownerAuthorized(request, env)) return jsonError("Owner authorization required.", 401);
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const cursor = parseCursor(url.searchParams.get("cursor"));
  if (url.searchParams.get("cursor") && !cursor) return jsonError("Invalid cursor.");
  const terms: string[] = [];
  const values: unknown[] = [];
  if (q) { terms.push("(id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR (first_name || ' ' || last_name) LIKE ? OR email LIKE ? OR phone LIKE ?)"); values.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (cursor) { terms.push("(updated_at < ? OR (updated_at = ? AND id < ?))"); values.push(cursor.updatedAt, cursor.updatedAt, cursor.id); }
  const where = terms.length ? `WHERE ${terms.join(" AND ")}` : "";
  const query = `SELECT ${PLAN_SUMMARY_COLUMNS} FROM plans ${where} ORDER BY updated_at DESC, id DESC LIMIT 26`;
  const result = await env.DB.prepare(query).bind(...values).all<PlanRow>();
  const rows = result.results || [];
  const hasNext = rows.length > 25;
  const items = rows.slice(0, 25).map((row) => ({
    id: row.id,
    contact: { firstName: row.first_name, lastName: row.last_name, email: row.email, phone: row.phone },
    scenario: { targets: (JSON.parse(row.scenario_json) as { targets?: unknown }).targets || [] },
    calculatorVersion: row.calculator_version,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  const last = items.at(-1);
  return json({ items, nextCursor: hasNext && last ? cursorFor(last.updatedAt, last.id) : null });
}

async function ownerPlan(request: Request, id: string, env: Env, remove: boolean): Promise<Response> {
  if (!await ownerAuthorized(request, env)) return jsonError("Owner authorization required.", 401);
  const row = await getPlan(id, env);
  if (!row) return jsonError("Plan not found.", 404);
  if (remove) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM idempotency_keys WHERE plan_id = ?").bind(id),
      env.DB.prepare("DELETE FROM plans WHERE id = ?").bind(id),
    ]);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  return json(recordFromRow(row));
}

async function route(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  await cleanup(env);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "GET" && path === "/health") return json({ ok: true, service: "certpath-api" });
  if (request.method === "POST" && path === "/plans") return createPlan(request, env);
  if (request.method === "POST" && path === "/owner/unlock") return unlockOwner(request, env);
  if (request.method === "POST" && path === "/owner/logout") return logoutOwner(request, env);
  if (request.method === "GET" && path === "/owner/plans") return ownerPlans(request, env);
  const ownerMatch = /^\/owner\/plans\/([A-Za-z0-9_-]{16,80})$/.exec(path);
  if (ownerMatch && request.method === "GET") return ownerPlan(request, ownerMatch[1], env, false);
  if (ownerMatch && request.method === "DELETE") return ownerPlan(request, ownerMatch[1], env, true);
  const planMatch = /^\/plans\/([A-Za-z0-9_-]{16,80})$/.exec(path);
  if (planMatch && request.method === "GET") {
    const row = await studentPlan(request, planMatch[1], env);
    return row instanceof Response ? row : row ? json(recordFromRow(row)) : jsonError("Plan not found.", 404);
  }
  if (planMatch && request.method === "PUT") return updatePlan(request, planMatch[1], env);
  return jsonError("Not found.", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return withCors(await route(request, env), request, env); }
    catch { return withCors(jsonError("Unexpected server error.", 500), request, env); }
  },
};
