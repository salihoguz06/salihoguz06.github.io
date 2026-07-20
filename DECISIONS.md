# DECISIONS — non-obvious choices, so you can review my reasoning

## 2026-07-20 — Autonomous Phase 5 polish session

### D1 — I will not run any database migration while you're away
SPEC's **CHECKPOINT B** forbids destructive/DDL migrations without your sign-off, and I
have no way to ask you mid-run. So every Phase 4 "wow" feature that needs a new table
(message wall, map, bucket list, countdowns-with-data, on-this-day) is **deferred**. I'll
prepare reviewable SQL and show it when you're back. This session touches front-end only.

### D2 — Scope limited to safe, reversible, front-end work
Because the site is a beloved, working thing and I can't fully exercise it (login gate,
no credentials — entering a password is disallowed), I deliberately picked changes that
are additive and low-risk: meta/favicon, reduced-motion, button semantics, focus styles.
No gratuitous refactor of the CSS/JS structure.

### D3 — Favicon as an inline SVG data URI (no new file, CSP-safe)
A tiny heart `<link rel="icon" href="data:image/svg+xml,...">`. Works on GitHub Pages with
no extra asset request and no external host, so it can't be blocked by any CSP.

### D4 — Keep `onclick=` handlers when converting `<div>`/`<span>` to `<button>`
The existing inline handlers call global functions (`checkWarsawFlight()`, `nextSlide()`…).
Converting the elements to real `<button>`s gives keyboard + screen-reader support with the
smallest possible diff — I keep the same class names and the same handler, just fix the tag
and add a reset so they look identical. Lower regression risk than rewiring to
`addEventListener`.

### D5 — Design tokens left mostly as-is
SPEC Phase 1 wants a centralized token system. The site only defines 4 CSS vars and uses
inline `rgba()` everywhere. A full tokenization is a large, regression-prone refactor with
little visible payoff for two users. Deferred; noted in BACKLOG. Not doing it unsupervised.
