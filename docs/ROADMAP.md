# Roadmap: Glance (BrowserBuddy)

**Status:** Draft v1
**Last updated:** 2026-07-07

This roadmap sequences the PRD (`docs/PRD.md`) into buildable phases. It assumes the planning decisions below, which should be revisited if any change:

- **Local model:** Chrome built-in AI (Gemini Nano via the Prompt API) for v1; a portable WebLLM/Transformers.js runtime is a planned fast-follow, not part of v1 scope
- **Cloud escalation:** multi-vendor routing (Claude, OpenAI, etc., user-pinnable per task) built from day one
- **Sync:** deferred entirely for v1 — single device only
- **UX:** design-in-code, no separate mockup phase
- **Security validation:** internal benchmark testing only for v1, no external pentest
- **Launch motion:** public (Product Hunt / HN / X), no hard deadline

Flagged risks and the full entity/legal/publish sequencing are tracked separately in `docs/PRE_LAUNCH_CHECKLIST.md` — that's the "what's left to fully publish this" list, revisited once the product is functionally working. This roadmap covers what gets built; that checklist covers what makes it safe and legal to ship publicly.

---

## Phase 0 — Foundation & Spikes

Goal: de-risk the two biggest technical unknowns before committing engineering time to the full build.

- Spike: validate Chrome Prompt API (Gemini Nano) real-world latency, output quality, and language coverage for Danish/German/English — this is the load-bearing assumption behind the "under 500ms" and "multilingual" goals
- Spike: confirm Manifest V3 content-script/service-worker architecture for the trigger + messaging pattern needed later (selection detection, floating UI injection)
- Scaffold repo: extension build tooling, linting, CI, basic Manifest V3 skeleton with a "hello world" content script
- Kick off legal/business track in parallel (see Phase 8) — entity formation and initial ToS/privacy policy drafting take real calendar time and should start now, not when engineering is "done"

**Exit criteria:** confirmed latency/quality numbers for Gemini Nano on target languages; empty extension loads in Chrome, Edge, Brave, Arc.

---

## Phase 1 — Core Trigger + Local Answer Loop

Goal: prove the thinnest possible version of the core "glance" loop before adding any detection/security complexity.

- Text selection detection → floating icon appears within 200ms
- Click icon → inline answer UI (no sidebar, no chat window)
- Wire answer generation to Chrome built-in AI for translate / define / explain / simplify
- No field detection yet, no redaction yet, no permission tiers yet — plain text selection only

**Exit criteria:** selecting text on any page and clicking the icon reliably returns a correct, fast answer for all four actions (translate/define/explain/simplify).

---

## Phase 2 — Accessible Field Detection Pipeline

Goal: build the tiered field-purpose detection described in the PRD, since this is what makes form-field help work on real, messy sites rather than just clean demos.

- Tier 1: ARIA label / `aria-describedby` reading
- Tier 2: computed accessible name algorithm as fallback
- Tier 3: spatial label-proximity matching as fallback
- Tier 4: local model inference as last resort, with visible low-confidence UI treatment
- Shadow DOM piercing and iframe traversal (needed for Stripe-style embedded forms)
- Stand up the three-tier benchmark site set (well-built / average / poor) — this becomes the ongoing regression suite, not a one-time test

**Exit criteria:** detection accuracy and confidence calibration measured separately across all three benchmark tiers; hover-triggered tooltip appears within the target latency on Tier 1/2 sites.

---

## Phase 3 — Sensitive Field Protection (Redaction Proxy)

Goal: implement the safeguard that makes form-field help safe to ship at all.

- Semantic attribute detection (`autocomplete`, `type="password"`, name/id patterns for card/SSN/IBAN/CVV)
- Multilingual label term-list matching
- Value pattern matching (Luhn check, IBAN format, SSN format) as backstop
- Default-to-redact behavior on any uncertainty, hard-coded, not tunable by the routing logic
- Redaction happens client-side before any network payload is constructed (not stripped after)

**Exit criteria:** zero sensitive-field leaks across the full benchmark site set, including payment iframes; false-positive rate (over-redaction) measured and acceptable.

---

## Phase 4 — Permission Model + Activity Log + Trust Panel

Goal: implement the trust architecture as one unified system, per the PRD's chain-of-custody design — this is core product differentiation, not a settings screen.

- Tier 1 (`activeTab`, no prompt) / Tier 2 (per-domain field access, one-time prompt) / Tier 3 (per-field session unlock) permission scopes
- Enforcement at content-script injection level (architectural, not a UI toggle)
- Allowlist/blocklist and trusted-sites list
- Real-time activity log (permission events + redaction decisions on one timeline)
- Unified trust panel: current permissions, live activity feed, session unlocks with countdown

**Exit criteria:** a user can open the trust panel at any time and get a complete, accurate picture of what's been read, redacted, and sent — verified by manually auditing the log against actual network traffic during testing.

---

## Phase 5 — Cloud Escalation + Multi-Vendor Routing

Goal: build the "harder asks" path, since local-only would cap the product's usefulness.

- Escalation classifier: decide when a request is ambiguous/complex enough to leave the device
- Multi-vendor routing layer with per-task-type model pinning (translate with X, explain with Y)
- Visible "thinking harder" state so escalation doesn't feel like a silent trust violation
- Cost tracking per vendor call (needed later for unit economics on the paid tier)

**Exit criteria:** escalation only fires on genuinely ambiguous requests (target 70–80% resolved locally, per PRD success metric); user can successfully pin a specific vendor per task type.

---

## Phase 6 — Portable Preferences (Local Only)

Goal: ship the "portable memory" feature without its sync complexity, since sync is deferred.

- Local profile: preferred tone, units, languages, common corrections
- Persisted locally (e.g. `chrome.storage.local`), no encryption-at-rest-for-sync work needed yet since nothing leaves the device

**Exit criteria:** preferences persist across sessions and visibly affect answer style/units/language.

---

## Phase 7 — Cross-Browser Packaging

Goal: validate the "standards-based, ships day one" claim across the Chromium family.

- Confirm Manifest V3 build runs correctly on Chrome, Edge, Brave, Arc (Gemini Nano availability may vary by browser — needs explicit fallback behavior where it's unavailable)
- Store listing assets: icons, screenshots, description copy per store
- Define fallback UX for browsers without Chrome's built-in AI (likely: escalate more aggressively to cloud, with a visible notice)

**Exit criteria:** installable, functioning build in each target browser; documented behavior for browsers lacking Gemini Nano.

---

## Phase 8 — Legal/Business Close-Out (parallel track, converges here)

Goal: close out everything that blocks a public, monetized launch. This should have been running since Phase 0, not started here.

Full checklist tracked in `docs/PRE_LAUNCH_CHECKLIST.md`.

**Exit criteria:** entity exists, legal docs are published and linked from the extension, payments work end-to-end in test mode.

---

## Phase 9 — Hardening & Internal QA

Goal: final quality bar before exposing this publicly.

- Full run of the three-tier benchmark suite, tracked separately per tier (not blended)
- Performance validation against the two hard latency targets (200ms icon appearance, 500ms local answer)
- Any sensitive-field detection miss treated as a blocking severity-one bug, not a backlog item
- Internal dogfooding pass across the team before any external eyes

**Exit criteria:** zero known sensitive-field leaks; latency targets met on the "average" and "poor" site tiers, not just "well-built."

---

## Phase 10 — Public Launch

Goal: ship it.

Full checklist (store submissions, incident response, launch coordination) tracked in `docs/PRE_LAUNCH_CHECKLIST.md`.

**Exit criteria:** live in at least one extension store, launch posts published, incident-response process staffed and ready.

---

## Sequencing notes

- Phases 0–7 are engineering-sequential; Phase 8 (legal/business) should run in parallel starting at Phase 0, since store review and legal drafting both have external timelines you don't control
- Phase 9 (hardening) is a gate, not a phase to skip under launch pressure — this is where the "internal review only" security decision does its real work; if that internal bar isn't rigorous, the security risk flagged in `docs/PRE_LAUNCH_CHECKLIST.md` becomes live
- Nothing here has hard dates since none currently exist for the project; if a target date gets set later, Phase 8 (legal) and the store review buffer in Phase 10 are the two items most likely to become the critical path
