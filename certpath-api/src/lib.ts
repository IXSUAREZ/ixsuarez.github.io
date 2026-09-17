export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PlanInput {
  contact: Contact;
  scenario: unknown;
  plan: unknown;
  calculatorVersion: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const WINDOW_MS = 15 * 60 * 1000;
export const OWNER_IDLE_MS = 15 * 60 * 1000;
export const OWNER_HARD_MS = 8 * 60 * 60 * 1000;

export function jsonError(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export function json(value: unknown, status = 200, headers: HeadersInit = {}): Response {
  const all = new Headers(headers);
  all.set("Content-Type", "application/json; charset=utf-8");
  all.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(value), { status, headers: all });
}

export function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown, max: number, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) throw new Error(`${label} must be 1-${max} characters.`);
  return trimmed;
}

export function parsePlanInput(value: unknown): PlanInput {
  const body = asObject(value);
  const contact = body && asObject(body.contact);
  if (!body || !contact) throw new Error("contact is required.");
  const firstName = text(contact.firstName, 100, "contact.firstName");
  const lastName = text(contact.lastName, 100, "contact.lastName");
  const email = text(contact.email, 254, "contact.email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("contact.email must be valid.");
  const phone = text(contact.phone, 32, "contact.phone");
  if (!/^[0-9+().\-\s]{7,32}$/.test(phone) || phone.replace(/\D/g, "").length < 7) throw new Error("contact.phone must contain at least 7 digits.");
  const scenario = asObject(body.scenario);
  const plan = asObject(body.plan);
  if (!scenario || !plan) throw new Error("scenario and plan must be objects.");
  validateScenario(scenario);
  validatePlan(plan);
  const calculatorVersion = text(body.calculatorVersion, 80, "calculatorVersion");
  const serialized = JSON.stringify({ scenario, plan });
  if (serialized.length > 200_000) throw new Error("scenario and plan exceed the 200 KB limit.");
  return { contact: { firstName, lastName, email, phone }, scenario, plan, calculatorVersion };
}

function boundedStringArray(value: unknown, label: string, min: number, max: number): void {
  if (!Array.isArray(value) || value.length < min || value.length > max || value.some((item) => typeof item !== "string" || item.length < 1 || item.length > 100)) {
    throw new Error(`${label} must contain ${min}-${max} short strings.`);
  }
}

function boundedObject(value: unknown, label: string, maxKeys: number): Record<string, unknown> {
  const object = asObject(value);
  if (!object || Object.keys(object).length > maxKeys) throw new Error(`${label} must be an object with at most ${maxKeys} fields.`);
  return object;
}

function validateScenario(scenario: Record<string, unknown>): void {
  const validCredentials = new Set(RULES.CREDENTIAL_OPTIONS.map((item: { id: string }) => item.id));
  const validTargets = new Set(RULES.TARGET_OPTIONS.map((item: { id: string }) => item.id));
  const validFields = new Set(RULES.FIELD_GROUPS.flatMap((group: { fields: [string][] }) => group.fields.map((field) => field[0])));
  const validEvents = new Set(RULES.EVENT_OPTIONS.map((item: { id: string }) => item.id));
  boundedStringArray(scenario.targets, "scenario.targets", 1, 8);
  if (scenario.credentials !== undefined) boundedStringArray(scenario.credentials, "scenario.credentials", 0, 32);
  if ((scenario.targets as string[]).some((item) => !validTargets.has(item))) throw new Error("scenario.targets contains an unsupported target.");
  if (scenario.credentials !== undefined && (scenario.credentials as string[]).some((item) => !validCredentials.has(item))) throw new Error("scenario.credentials contains an unsupported credential.");
  for (const [name, value] of Object.entries(scenario)) {
    if (!["version", "savedAt", "credentials", "targets", "flags", "rates", "experience", "events", "proficiencyEstimates"].includes(name)) throw new Error(`scenario.${name} is not supported.`);
    if (name === "version" && (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 1000)) throw new Error("scenario.version must be a bounded integer.");
    if (name === "savedAt" && (typeof value !== "string" || value.length > 80)) throw new Error("scenario.savedAt must be a short string.");
    if (["flags", "events"].includes(name) && value !== undefined) {
      const object = boundedObject(value, `scenario.${name}`, 200);
      if (Object.values(object).some((item) => typeof item !== "boolean")) throw new Error(`scenario.${name} values must be boolean.`);
      const allowed = name === "events" ? validEvents : new Set(["militaryExperience", "militaryOnly", "faaCommercialAmel", "priorFaa"]);
      if (Object.keys(object).some((key) => !allowed.has(key))) throw new Error(`scenario.${name} contains an unsupported key.`);
    }
    if (name === "experience" && value !== undefined) {
      const object = boundedObject(value, "scenario.experience", 100);
      if (Object.values(object).some((item) => !(typeof item === "number" && Number.isFinite(item) && item >= 0 && item <= 100_000_000) && !(typeof item === "string" && /^\d{1,8}(\.\d{1,3})?$/.test(item)))) throw new Error("scenario.experience values must be bounded nonnegative numbers.");
      if (Object.keys(object).some((key) => !validFields.has(key))) throw new Error("scenario.experience contains an unsupported field.");
    }
    if (name === "rates" && value !== undefined) {
      const object = boundedObject(value, "scenario.rates", 8);
      if (Object.values(object).some((item) => !(typeof item === "number" && Number.isFinite(item) && item >= 0 && item <= 100_000) && !(typeof item === "string" && /^\d{1,6}(\.\d{1,2})?$/.test(item)))) throw new Error("scenario.rates values must be bounded nonnegative numbers.");
      if (Object.keys(object).some((key) => !["aircraftWet", "instructor"].includes(key))) throw new Error("scenario.rates contains an unsupported rate.");
    }
    if (name === "proficiencyEstimates" && value !== undefined) {
      const object = boundedObject(value, "scenario.proficiencyEstimates", 16);
      if (Object.values(object).some((item) => typeof item !== "number" || !Number.isFinite(item) || item < 1 || item > 100)) throw new Error("scenario.proficiencyEstimates values must be 1-100.");
      if (Object.keys(object).some((key) => !validTargets.has(key))) throw new Error("scenario.proficiencyEstimates contains an unsupported target.");
    }
  }
}

function validatePlan(plan: Record<string, unknown>): void {
  if (!Array.isArray(plan.audits) || plan.audits.length > 10 || plan.audits.some((audit) => !asObject(audit))) throw new Error("plan.audits must be an array of at most 10 objects.");
  if (!asObject(plan.combined)) throw new Error("plan.combined must be an object.");
  if (plan.sourceReviewDate !== undefined && (typeof plan.sourceReviewDate !== "string" || plan.sourceReviewDate.length > 80)) throw new Error("plan.sourceReviewDate must be a short string.");
}

export function parseRevision(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 1) throw new Error("revision must be a positive integer.");
  return value as number;
}

export function parseBearer(request: Request): string | null {
  const value = request.headers.get("Authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(value);
  return match ? match[1] : null;
}

export function allowedOrigin(origin: string | null, development: boolean): string | null {
  if (origin === "https://suarezcfi.com") return origin;
  if (development && origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return null;
}

export function randomToken(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64url(value);
}

export function base64url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64url(new Uint8Array(bytes));
}

export async function tokenHash(token: string, pepper: string): Promise<string> {
  return sha256(`certpath-token-v1:${pepper}:${token}`);
}

export async function pbkdf2(value: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(value), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, material, 256);
  return new Uint8Array(bits);
}

// Format: pbkdf2-sha256$iterations$base64url-salt$base64url-hash
export async function verifyOwnerPin(pin: string, encoded: string): Promise<boolean> {
  const parts = encoded.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
  const iterations = Number(parts[1]);
  if (iterations !== 100_000) return false;
  try {
    const actual = await pbkdf2(pin, fromBase64url(parts[2]), iterations);
    return timingSafeEqual(actual, fromBase64url(parts[3]));
  } catch { return false; }
}

export function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

export async function encrypt(value: string, keyText: string): Promise<string> {
  const raw = fromBase64url(keyText);
  if (raw.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64url.");
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;
}

export async function decrypt(value: string, keyText: string): Promise<string> {
  const [ivText, bodyText] = value.split(".");
  if (!ivText || !bodyText) throw new Error("Invalid encrypted token.");
  const raw = fromBase64url(keyText);
  if (raw.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64url.");
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64url(ivText) }, key, fromBase64url(bodyText));
  return decoder.decode(plain);
}

export function cursorFor(updatedAt: string, id: string): string {
  return base64url(encoder.encode(`${updatedAt}\n${id}`));
}

export function parseCursor(value: string | null): { updatedAt: string; id: string } | null {
  if (!value) return null;
  try {
    const [updatedAt, id] = decoder.decode(fromBase64url(value)).split("\n");
    return updatedAt && id ? { updatedAt, id } : null;
  } catch { return null; }
}
import RULES from "../../simply-endorsed/js/part61-rules-data.js";
