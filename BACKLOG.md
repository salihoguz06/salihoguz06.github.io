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
- [ ] Extend schema for Phase 4 features — **gated: CHECKPOINT B**

## P3 — Core interactivity
- [x] Album grid, lightbox (keyboard + swipe + captions)
- [x] Photo notes
- [x] Warm empty states (gallery)
- [x] Skeleton loading for the album grid _(audit)_
- [ ] Pinch-zoom in lightbox _(nice-to-have)_

## P4 — Signature "wow" (mostly gated on CHECKPOINT B / new tables)
- [x] "Days together" animated counter
- [x] "Reasons I love you" random-reveal card
- [ ] Anniversary countdown + celebration animation
- [ ] "On this day" memories
- [ ] Animated "our story" timeline
- [ ] Map of places
- [ ] Message wall / guestbook
- [ ] Shared bucket list
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
