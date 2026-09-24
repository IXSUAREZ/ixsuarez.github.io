# Local search and contact measurement

September 24, 2026. This release improves student-facing service clarity and contact measurement. It does not claim a ranking increase, Business Profile verification, or verified analytics dashboard receipt.

## Public changes

The homepage introduction names Diego Suarez, flight instruction, Bowman Field and Louisville together. Training and discovery-flight primary inquiries explicitly refer to flying with Diego. The training page explains travel from Oldham County and Southern Indiana without claiming additional locations. The remote page describes choosing a focus, confirming a session and preparing questions, while preserving in-person flight-training boundaries. Existing URLs, prices, tools and credential scope remain unchanged. Metadata changes originate in `config/site-pages.json`.

## Measurement contract

The shared bridge preserves `data-cta-id` values. It sends only static CTA identifiers and the current page pathname as custom properties, never form values, link text, phone/email destinations or prefilled email query strings. Analytics provider failures do not interrupt contact actions.

| Event | Meaning |
| --- | --- |
| `cta_click` | CTA interaction, not a lead |
| `contact_phone_click` | Telephone handoff intent |
| `contact_sms_click` | SMS handoff intent |
| `contact_email_click` | Email link intent |
| `contact_email_handoff` | Completed form attempted to open an email draft |
| `contact_submit_success` | A configured form endpoint accepted a 2xx response |
| `contact_submit_error` | Configured endpoint rejected or failed the request |

The existing `contact-form-success-<context>` hook maps to `contact_submit_success`, not a click. No automatic event represents a qualified inquiry or booking. Confirm those separately from actual business records, using aggregate counts only. The current form has no configured endpoint and remains an explicitly labeled email-draft workflow. Configuring goals and verifying receipt in the existing analytics account remain operational steps.

## Validation

Run `node --test scripts/tests/*.test.cjs`, `python3 -m unittest scripts/tests/test_site_audit.py`, both metadata/chrome synchronization checks, and `python3 scripts/audit-site.py`. Tests cover privacy of outgoing properties, provider failures, email versus accepted form submission, and existing UI behavior. Inspect homepage and service layouts at narrow widths and on desktop before release.

No new city pages, purchased links, paid campaigns, testimonials or business locations are introduced.
