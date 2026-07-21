# BACKLOG — "Us" memory website

Source of truth for "what's left." `- [x]` done · `- [ ]` open · `- [~]` in progress.
Grouped by SPEC phase. Items discovered in the audit are marked _(audit)_.

## P0 — Audit
- [x] Audit repo, document current state, produce plan (`PROGRESS.md`)

## P1 — Foundation & design system
- [x] Supabase auth (private, two-user access)
- [x] Reusable dialog primitive (`showLoveDialog`/`showLoveConfirm`)
- [ ] Centralize design tokens (spacing/radii/shadow/motion) — _deferred, low ROI now_
- [x] Site already ships a coherent dark "night" theme

## P2 — Supabase backend
- [x] Schema + RLS (albums, photos, photo_notes, profiles)
- [x] Private Storage bucket + upload flow with progress + validation
- [x] Dynamic fetches (no hardcoded gallery)
- [x] Extend schema for Phase 4 features — **schema3.sql run (CHECKPOINT B cleared)**

## P3 — Core interactivity
- [x] Album grid, lightbox (keyboard + swipe + captions)
- [x] Photo notes
- [x] Warm empty states (gallery)
- [x] Skeleton loading for the album grid _(audit)_
- [ ] Pinch-zoom in lightbox _(nice-to-have)_

## P4 — Signature "wow" (mostly gated on CHECKPOINT B / new tables)
- [x] "Days together" animated counter
- [x] "Reasons I love you" random-reveal card
- [x] Anniversary countdown (computed from start date; celebrates on the day) —
      no DB needed. Celebration on the actual day still unpreviewable here.
- [x] "On this day" memories — banner in the timeline when today matches a milestone
- [x] Animated "our story" timeline — milestones table, add/remove, flowing line
- [x] Map of places — Leaflet + OSM, heart pins, tap-to-add, popups (places table)
- [x] Message wall / guestbook — messages table, own-note delete, pink accent
- [x] Shared bucket list — bucket_list table, check off + hearts celebration
- [x] Photo reactions in the lightbox — reactions table, emoji toggle + counts
- [ ] Memory reel slideshow
- [ ] Hidden easter egg

## P5 — Polish (this session's focus — safe, front-end only)
- [x] `prefers-reduced-motion` support (CSS + JS guards) _(audit)_
- [x] Accessibility pass: real buttons, `:focus-visible`, dialog roles, aria _(audit)_
- [x] Meta / favicon / OpenGraph _(audit)_
- [~] Mobile pass — added a small-screen nav treatment (needs on-device confirm);
      viewport-fit=cover in place. Full 375px sweep still open.
- [ ] Performance: lazy images / decoding hints
- [ ] Loading / error states polish

## P6 — Hardening & handoff
- [ ] Security sweep (RLS with an anon client)
- [ ] README + deploy notes
- [ ] Cleanup: stray console logs, dead code
