# BrowserBuddy (working name: Glance)

The fastest, most private way to understand what's on your screen right now.

BrowserBuddy is a browser extension focused on the 2-second question, not the 20-minute task: highlight text or hover a form field and get an instant, private, in-context answer (translate, define, explain, simplify) without opening a sidebar, typing a prompt, or waiting on an agentic workflow.

## Core principles

- **Speed**: local-first model routing resolves most requests in under 500ms; only ambiguous requests escalate to a cloud model, visibly.
- **Privacy by default**: sensitive fields (payment, SSN, password, ID) are detected and redacted client-side before any network call is constructed.
- **Trust is verifiable, not promised**: a real-time activity log shows exactly what left the browser, when, and why.
- **Standards-based**: ships as a Manifest V3 extension (Chrome, Edge, Brave, Arc) with a lightweight mobile companion planned.

See [docs/PRD.md](docs/PRD.md) for the full product requirements document, [docs/ROADMAP.md](docs/ROADMAP.md) for the build sequence, and [docs/PRE_LAUNCH_CHECKLIST.md](docs/PRE_LAUNCH_CHECKLIST.md) for what's needed before a public launch.

## Status

Phase 0 (foundation & spikes) in progress — Manifest V3 scaffold with a working content-script/service-worker messaging loop, plus a standalone spike harness for testing Chrome's on-device model (see [spike/gemini-nano/README.md](spike/gemini-nano/README.md)).

## Development

```
npm install
npm run dev     # builds in watch mode to dist/
npm run build   # production build to dist/
npm run lint
```

To load the extension locally:

1. Run `npm run build` (or `npm run dev` for a watch build)
2. Open `chrome://extensions` (or the equivalent in Edge/Brave/Arc)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder
5. Select some text on any page — a small icon should appear near the selection within ~200ms. Open the service worker console from `chrome://extensions` (click "service worker" under the extension) to see the round-trip message log.
