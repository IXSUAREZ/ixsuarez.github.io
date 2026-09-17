# CertPath API

Cloudflare Worker + D1 persistence for private CertPath plans. This directory is a Worker project, not a static-site asset; deploy it separately to its `workers.dev` hostname.

## Security model

- A student plan receives a random private Bearer token once. D1 stores only its peppered SHA-256 hash in `plans.private_token_hash`.
- `POST /plans` requires an `Idempotency-Key`. To make a lost-response retry return the originally issued private token, the idempotency table stores an AES-GCM encrypted copy for 24 hours. It is never stored in the plan row or logged.
- Owner unlock verifies a configured PBKDF2-SHA-256 encoded PIN. Owner tokens are hashed in D1, expire after 15 minutes of inactivity, and have an eight-hour hard expiry.
- Failed owner unlocks are D1-backed, rolling 15-minute limits: five per privacy-preserving IP hash and 20 globally. Plan creation is limited to 10 per hashed IP per 15 minutes.
- Every response is `Cache-Control: no-store`. CORS permits `https://suarezcfi.com`; localhost/127.0.0.1 is permitted only with `ENVIRONMENT=development`.

Do not send a private plan token in URLs, analytics, or logs.

## Required Worker secrets

Create these in the Cloudflare dashboard or with `wrangler secret put`; do not put values in `wrangler.toml`.

```sh
wrangler secret put OWNER_PIN_HASH
wrangler secret put TOKEN_PEPPER
wrangler secret put TOKEN_ENCRYPTION_KEY
```

`OWNER_PIN_HASH` format is `pbkdf2-sha256$100000$base64url-salt$base64url-hash`; the Worker accepts exactly 100,000 PBKDF2-SHA-256 iterations to stay within Worker CPU limits. Generate the hash from the chosen PIN outside this repository. `TOKEN_PEPPER` is a random high-entropy secret. `TOKEN_ENCRYPTION_KEY` is exactly 32 random bytes encoded as base64url; it encrypts the short-lived idempotency replay token.

Create D1 and replace the placeholder in `wrangler.toml` before deployment:

```sh
wrangler d1 create certpath-plans
wrangler d1 migrations apply certpath-plans --remote
wrangler deploy
```

For local CORS development only, run `wrangler dev --var ENVIRONMENT:development` and apply migrations locally with `wrangler d1 migrations apply certpath-plans --local`.

## API contract

All JSON responses include `Cache-Control: no-store`.

### Student plan

`POST /plans` requires `Idempotency-Key` and this body:

```json
{
  "contact": { "firstName": "Ada", "lastName": "Lovelace", "email": "ada@example.com", "phone": "+1 502 555 0199" },
  "scenario": { "...": "calculator input snapshot" },
  "plan": { "...": "calculated plan snapshot" },
  "calculatorVersion": "2026.09.17"
}
```

It returns `201` with `{id, token, contact, scenario, plan, calculatorVersion, revision, createdAt, updatedAt}`. A retry with the same key and identical request returns the same record and token with `idempotent: true`; reusing a key for another body returns `409`.

`scenario` is allowlisted against the bundled CertPath rules: known credential/target/event IDs, known experience fields, approved flags and rates, and bounded proficiency values. The client may send `plan` for protocol compatibility, but the Worker ignores it, recalculates `plan` from the validated scenario using the bundled Part 61 core, and writes its server-owned calculator version. This keeps untrusted strings out of stored calculated-plan output.

Keep a create `Idempotency-Key` available for at least 24 hours: the Worker retains its encrypted replay token for that window. After expiry, a lost-response retry must use normal plan recovery rather than assuming a duplicate create can be replayed.

`GET /plans/:id` and `PUT /plans/:id` require `Authorization: Bearer <token>`. `PUT` also requires an `Idempotency-Key`; it accepts the same body plus a required positive integer `revision`, updates the sole current record, and increments revision. A retry with the identical update key/body returns the already-saved revision. A stale revision returns `409`.

### Owner

`POST /owner/unlock` accepts `{ "pin": "..." }` and returns `{token, expiresAt}`. Send this owner token as a Bearer token to `POST /owner/logout`, `GET /owner/plans?q=&cursor=`, `GET /owner/plans/:id`, and `DELETE /owner/plans/:id`. The list returns `{items, nextCursor}` with contact, scenario targets, version, timestamps, and revision only; full calculated plans are returned only by the detail route. It uses an opaque cursor.

The API is designed for the Worker `workers.dev` hostname. No route or static-site publication is configured here.

## Validation

```sh
npm install
npm test
npm run typecheck
npm run test:local
```

The tests cover required contact validation, Bearer token grammar and peppered hashes, configured PBKDF2 PIN verification, AES-GCM idempotency-token protection, cursor handling, and CORS allowlisting.
