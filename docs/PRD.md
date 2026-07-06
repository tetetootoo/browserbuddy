# Product Requirements Document: Glance (BrowserBuddy)

**Status:** Draft v2
**Owner:** TBD
**Last updated:** 2026-07-06

## 1. Summary

Glance (working name; shipping name BrowserBuddy) is a browser extension that gives users instant, private, in-context help while browsing — translating a phrase, defining a term, explaining a form field, simplifying text — without opening a chat window, typing a prompt, or waiting on a full agentic workflow. It solves the 2-second question, not the 20-minute task.

## 2. Problem statement

Current AI browser tools (Claude in Chrome, ChatGPT Atlas, Gemini in Chrome, Perplexity Comet) are built around agentic task execution: clicking, filling forms, multi-tab workflows. This is powerful but heavyweight, and it leaves a large, underserved category unaddressed: quick, low-stakes moments where a user just wants to understand something on screen right now. Nobody has optimized for speed, privacy, and minimal friction on these micro-interactions.

## 3. Goals

- Deliver an answer to a simple question (translate, define, explain a field) in under 500ms for the majority of requests
- Keep sensitive data (payment fields, IDs, passwords) off the network by default
- Work across browsers and, eventually, mobile, not just Chromium
- Build user trust through visible, auditable behavior rather than a privacy policy nobody reads

## 4. Non-goals (v1)

- No form filling, clicking, or multi-step task automation
- No enterprise admin console or org-wide deployment controls
- No custom agent scripting or workflow recording

## 5. Target user

Individual knowledge workers who browse across multiple languages and contexts — freelancers, consultants, small business owners handling invoices, contracts, or admin tasks in more than one language. Someone who wants quick clarity, not a co-pilot that takes over the browser.

## 6. Core features (v1)

### 6.1 Glance trigger

Highlighting text or hovering a form field surfaces a small floating icon within 200ms. Clicking it returns an inline answer without opening a full chat interface.

### 6.2 Local-first model routing

A small on-device model (quantized, WebGPU accelerated where available) handles simple requests: translation, definitions, explaining a field's purpose. A lightweight classifier decides whether a request needs escalation to a larger cloud model. Target: 70–80% of everyday requests resolved locally.

### 6.3 Sensitive field protection

Fields are checked against ARIA attributes, label text, and value patterns (card numbers, IBANs, SSNs) before anything is sent anywhere. Flagged fields are redacted client-side before any network call is constructed. Default behavior on uncertainty is to redact, not to send.

### 6.4 Visible activity log

Every interaction that leaves the device is logged locally and shown to the user in plain language: what was sent, to which model, and why. This is a primary trust mechanism, not a policy document.

### 6.5 Accessible field detection

Field purpose is resolved through a tiered pipeline: ARIA labels first, computed accessible name algorithm second, spatial label proximity third, local model inference as a last resort. Each tier carries a confidence level, and low-confidence answers are visually marked as uncertain rather than presented as fact.

**Detection pipeline:**

```
Field gains focus or hover
        |
        v
Attempt 1: Read ARIA label / aria-describedby
        | (if missing)
        v
Attempt 2: Computed accessible name algorithm
        | (if still ambiguous)
        v
Attempt 3: Nearest visible label text (spatial proximity)
        | (if still ambiguous)
        v
Attempt 4: Ask local model to infer field purpose from
           surrounding page context (last resort, slower)
```

Each fallback only triggers if the previous one fails, so the fast path stays fast on well-built sites, and the cost of local model inference is only paid on the messy minority of sites.

**Shadow DOM and iframes:** many modern sites (payment forms especially, e.g. Stripe Elements) render fields inside iframes or shadow DOM for security isolation. The content script needs explicit iframe traversal and shadow-root piercing (where permitted) to see these fields at all — this is also exactly where the sensitive field detector needs to be most careful, since payment iframes are deliberately isolated for security reasons.

**Testing approach:** build a benchmark set across three tiers of site quality — well-built (accessible, semantic HTML), average (typical SaaS forms, mixed quality), and poor (legacy government forms, custom widget-heavy sites). Track detection accuracy and confidence calibration separately per tier, since a single blended accuracy number hides whether the tool works great on modern sites but badly on the legacy ones users actually need help with most.

### 6.6 Portable preferences

A small local profile stores preferred tone, units, and languages. Synced across devices via encrypted storage that the backend cannot read in plaintext.

## 7. Out of scope for v1, considered for v2

- Task-specific distilled models per use case (translation vs. field explanation)
- Mobile share-sheet extension for iOS and Android accessibility service
- Team or org-level permission management
- Workflow recording for repetitive tasks

## 8. Security architecture

This section covers the permission model, redaction proxy, and activity log as a single unified system, not three independent safeguards. The product's core value depends on these layers staying consistent with each other, so this is core architecture, not an appendix.

### 8.1 Design principle

Trust is treated as primary architecture, with capability layered on top only where the trust boundary allows it. This is the inverse of how existing agentic browser tools are built, where capability comes first and trust controls are added afterward. That ordering is the actual product differentiation.

### 8.2 The chain of custody

```
Permission Model (what CAN be seen)
        |
        v
Detection Layer (what IS sensitive on this page)
        |
        v
Redaction Proxy (what actually LEAVES the device)
        |
        v
Activity Log (what the user CAN VERIFY happened)
```

Each layer only matters if the one before it is airtight. Broad permissions with perfect redaction still fails if a user cannot verify the model is right every time. Tight permissions with no visible log still fails because the user has no way to confirm the promise is real. These four layers must work as one accountable system.

### 8.3 Permission model

Permissions are tiered rather than all-or-nothing, and default to the narrowest possible scope.

**Tier 1: Passive read (default, no prompt needed)**
Reading visible, non-sensitive text for translation and definition requests. Uses `activeTab`, which Chrome grants temporarily on interaction — no persistent host permission required. Covers most everyday use without ever surfacing a permission dialog.

**Tier 2: Field awareness (first use per site, one-time prompt)**
Reading form field labels and structure to explain what a field expects. Requires deeper DOM and accessibility tree access on that domain. Prompted once per domain, remembered afterward, revocable anytime.

**Tier 3: Sensitive field unlock (explicit, per session, per field)**
Required if a user wants help with a field the detector flagged as sensitive. Single field, single session, expires automatically, never silently re-enabled.

**Site-level controls** include an allowlist and blocklist, and a "trusted sites" list where Tier 2 is pre-granted for domains the user works in daily.

Permission scope is enforced at the content-script injection level, not the UI level. If Tier 2 has not been granted on a domain, the code path to read field labels there does not exist in the injected script — an architectural guarantee, not a setting that a toggle merely hides, because a UI restriction can be bypassed by a bug while an architectural restriction cannot.

### 8.4 Detection and redaction proxy

Detection runs in three passes before a request is ever constructed:

1. Semantic field attributes (`autocomplete`, `type="password"`, name/id patterns for card, SSN, IBAN, CVV)
2. Label text matching, checked against a maintained multilingual term list
3. Value pattern matching (Luhn check for card numbers, IBAN format, SSN format) as a backstop for unlabeled fields

Flagged fields are replaced with typed placeholders (`[REDACTED_CARD]`) client-side, before the payload is built, so redaction happens before the network call exists rather than being stripped afterward. Non-sensitive fields pass through normally so the assistant stays useful.

On any uncertainty, the default is to redact, not to send. A false positive costs one extra click; a false negative on a payment field is a real breach — this asymmetry is a hard-coded default, not something the routing logic optimizes probabilistically.

The redaction proxy is the layer where Tier 2 and Tier 3 permissions actually get enforced against real data. A field read under Tier 2 permission still passes through full detection before anything is sent — permission to read is not permission to transmit.

### 8.5 Activity log

Every interaction that leaves the device, and every permission event, is written to a single, real-time, user-visible log:

```
14:32 - Tier 2 granted for invoice-tool.com
14:33 - Blocked: card number field on checkout.stripe.com
14:34 - Sent: email field context to Claude for autofill suggestion
14:40 - Tier 3 unlock expired for checkout.stripe.com
```

Permission events and redaction decisions appear on the same timeline so they are traceable to each other, rather than living in two disconnected records. Tier 3 unlocks get the most prominent treatment, shown with a live countdown while active, since this is the highest-risk moment in the system.

### 8.6 Unified trust panel

Rather than three separate settings screens, this surfaces as one panel with three synchronized views:

- Current permissions, by domain, with one-click revoke
- Live activity feed, updated in real time
- Session unlocks, with visible countdown to expiry

A user should be able to open this panel at any moment and get a complete, honest picture of what Glance can see, what it decided was sensitive, and what actually left the browser, without cross-referencing separate systems.

### 8.7 Failure mode this design prevents

The dangerous version of this product has broad permissions, probabilistic redaction, and logging added late as a compliance afterthought. That combination lets a single detection miss become a silent breach with no trace. Tying permission, detection, redaction, and logging to the same enforcement path means a failure at any layer is immediately visible: either the permission was too broad, the redaction missed something and shows as an anomaly in the log, or nothing was recorded — which is itself treated as an integrity failure worth alerting on.

## 9. Success metrics

- Median time to answer for locally resolved requests under 500ms
- Percentage of requests resolved without cloud escalation, target 70–80%
- Zero incidents of flagged sensitive field data reaching the network in testing
- User retention at 4 weeks, since the value proposition depends on habitual, low-friction use rather than occasional heavy tasks
- Zero divergence incidents between permission scope and redaction scope in audit testing

## 10. Risks

- **Detection accuracy on legacy or poorly built sites.** Government forms and older SaaS tools may lack semantic markup, degrading confidence and requiring the slower model-inference fallback.
- **Model size vs. device constraints.** A 1–2GB local model download may deter users on limited bandwidth or storage; needs clear consent and possibly a lighter tier.
- **Trust erosion from false negatives.** A single missed sensitive field is more damaging to the product's core promise than many missed simple answers; treated as a severity-one bug class, not a quality metric.
- **Platform fragmentation.** Chromium-only tools dominate the space; Safari and Firefox support will require separate technical approaches and may lag the core Chromium build.
- **Permission and redaction drift.** If the two systems are ever implemented as separate code paths rather than one shared enforcement layer, they can silently diverge over time as the codebase changes.

## 11. Open questions

- Which local model (Gemma 2B, Phi 3 Mini, or a distilled task-specific alternative) offers the best quality-to-size tradeoff for the target languages (Danish, German, English at minimum)?
- Should redaction default to full field blocking or partial masking (last four digits) for fields like card numbers, where partial context might still help the user?
- What is the right monetization split between free (local only) and paid (cloud escalation, sync), given that the core trust pitch depends on the free tier feeling genuinely complete, not crippled?

## 12. Monetization

- **Free tier:** on-device model only, unlimited micro-asks
- **Paid tier ($4–$8/month):** cloud escalation for harder asks, cross-device sync, unlimited field-level history
- No enterprise play initially — the individual, privacy-conscious knowledge worker is the wedge; enterprise trust and procurement cycles are a distraction for v1.
