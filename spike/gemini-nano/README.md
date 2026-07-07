# Phase 0 Spike: Gemini Nano (Chrome built-in AI) latency/quality/language check

This validates the load-bearing assumption behind the roadmap's Phase 0 exit criteria: that Chrome's built-in on-device model (Gemini Nano, via the Prompt API) can hit the PRD's <500ms latency target and produce usable output in English, Danish, and German.

This can't be tested headlessly — it requires a real Chrome install with the on-device model downloaded, so these are manual steps.

## Setup

1. Use **Chrome 131+** (Canary or stable, recent version). Check `chrome://version`.
2. Enable the required flags:
   - Go to `chrome://flags/#optimization-guide-on-device-model`, set to **Enabled BypassPerfRequirement**
   - Go to `chrome://flags/#prompt-api-for-gemini-nano`, set to **Enabled**
   - Relaunch Chrome when prompted
3. Force the model to download:
   - Go to `chrome://components`
   - Find **Optimization Guide On Device Model**
   - Click **Check for update** — this triggers the (~1-2GB) download. Wait for it to finish (version number will update from `0.0.0.0`).
4. Open `spike/gemini-nano/index.html` directly in Chrome (`open spike/gemini-nano/index.html` from the repo root, or drag it into a Chrome tab).

## Running the test

1. The page auto-detects the API and shows availability status.
2. Click **Run test matrix**. First run may be slow if it triggers additional download/warm-up — re-run afterward to get steady-state numbers.
3. Each row shows task, language, latency, and PASS/FAIL against the 500ms target.

## What to record back

For the Phase 0 exit criteria, capture:

- Does the API detect as available at all on your machine? (Some hardware doesn't meet Gemini Nano's requirements — storage, GPU, OS.)
- Steady-state latency per task/language, and whether they clear 500ms
- Subjective output quality for Danish and German specifically — Gemini Nano's multilingual coverage is the biggest open question in the PRD (section 11), and this is the first real signal on it, not just a spec assumption

If Danish/German quality or latency is poor, that's a real finding for Phase 0 — it may mean the "hybrid: Chrome AI now, portable runtime later" decision needs revisiting sooner than planned, or that non-English requests should route to cloud escalation by default rather than local.
