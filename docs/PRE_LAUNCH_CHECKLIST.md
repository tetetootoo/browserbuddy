# Pre-Launch Checklist & Flagged Risks

**Status:** Draft v1
**Last updated:** 2026-07-07

This is not part of the build roadmap (`docs/ROADMAP.md`). It's the punch list to come back to once the product is functionally working, before making it public — the "what's left to fully publish this" list, not the "what's left to build" list.

Nothing here blocks the engineering phases (Roadmap Phases 0–7). This becomes active once the product works end-to-end and you're deciding whether it's ready for the outside world.

---

## Flagged risks to revisit

These were raised during planning and consciously deferred rather than resolved. Revisit them here, not silently at launch time.

1. **Internal-only security review + public launch + a "your sensitive data never leaves the device" claim.** This is the highest-risk combination in the current plan: no external validation on the exact claim the whole trust thesis depends on, going straight to a public launch (Product Hunt/HN/X) rather than a private beta. Worth re-deciding once there's a working build and real usage data — is internal benchmark testing still sufficient, or does a public trust claim need external validation before broad exposure?
2. **Entity/legal sequencing was flagged as a hard blocker, not a parallel nice-to-have.** If this checklist is being read and the entity/legal items below aren't done, launch should not proceed regardless of how ready the product itself is — payments and public trust/privacy claims can't be made without them.

---

## Entity & legal sequencing

- [ ] Form business entity (LLC or equivalent)
- [ ] Draft and publish privacy policy
- [ ] Draft and publish Terms of Service
- [ ] Draft EULA
- [ ] GDPR-specific compliance review — Danish and German users are explicitly named as target market in the PRD, not a hypothetical edge case
- [ ] Payment processor integration (Stripe or similar) for the paid tier, verified end-to-end in test mode before going live

## Security/trust validation before public claims

- [ ] Re-decide: is internal-only testing still the right call now that there's a real build to test, or is it time for an external pentest/audit before the redaction-proxy trust claim goes public?
- [ ] Full run of the three-tier benchmark suite (well-built / average / poor sites), tracked separately per tier
- [ ] Confirmed zero known sensitive-field leaks across that benchmark set, including payment iframes / shadow DOM cases

## Store submission prep

- [ ] Chrome Web Store developer account + listing assets (icons, screenshots, description copy)
- [ ] Edge Add-ons developer account + listing
- [ ] Review-time buffer scheduled — store review timelines are outside your control, submit well before any target public launch date
- [ ] Documented fallback behavior for browsers without Chrome's built-in AI (Gemini Nano), per Roadmap Phase 7

## Incident response readiness

- [ ] Defined process for handling a severity-one report (sensitive-field data leak) — who gets paged, what the rollback/mitigation path is, how affected users are notified
- [ ] Support channel set up and staffed for the launch window (not improvised after the first bug report comes in)

## Launch coordination

- [ ] Product Hunt / Hacker News / X posts drafted and coordinated
- [ ] Support channel and monitoring live before the launch window opens, not started reactively
