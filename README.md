# BrowserBuddy (working name: Glance)

The fastest, most private way to understand what's on your screen right now.

BrowserBuddy is a browser extension focused on the 2-second question, not the 20-minute task: highlight text or hover a form field and get an instant, private, in-context answer (translate, define, explain, simplify) without opening a sidebar, typing a prompt, or waiting on an agentic workflow.

## Core principles

- **Speed**: local-first model routing resolves most requests in under 500ms; only ambiguous requests escalate to a cloud model, visibly.
- **Privacy by default**: sensitive fields (payment, SSN, password, ID) are detected and redacted client-side before any network call is constructed.
- **Trust is verifiable, not promised**: a real-time activity log shows exactly what left the browser, when, and why.
- **Standards-based**: ships as a Manifest V3 extension (Chrome, Edge, Brave, Arc) with a lightweight mobile companion planned.

See [docs/PRD.md](docs/PRD.md) for the full product requirements document.

## Status

Early-stage / pre-implementation. This repo currently holds product specs and planning docs.
