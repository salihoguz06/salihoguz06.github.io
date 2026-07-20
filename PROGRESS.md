# PROGRESS — "Us" memory website

> Running engineering log. Newest entries at the top of each section.
> This is my working memory across the long campaign (see `SPEC.md`).

---

## PHASE 0 — AUDIT (2026-07-20)

### Stack & environment
- **No framework / no build step.** Plain `index.html` + vanilla CSS (`css/style.css`)
  + vanilla JS split into `js/{config,supabase,auth,dialog,gallery,upload,app}.js`.
- Deployed on **GitHub Pages** at `salihoguz06.github.io`
  (repo: `github.com/salihoguz06/salihoguz06.github.io`).
- Package manager / node: **none**. Runs as static files. "Build/lint/typecheck" from
  the SPEC don't literally apply; verification = load in a browser + check the console.
- Supabase JS loaded from CDN; keys in `js/config.js` (anon key — client-safe under RLS).

### What the site currently does (feature inventory)
- **Login gate** (`auth.js`) — email+password; locks the whole page until sign-in.
- **Hero** — time-of-day greeting, typewriter reveal on scroll, custom heart cursor.
- **"Days together" counter** — live, updates every second from `2025-04-26`.
- **"I love you because…"** — tap a card, reveals a shuffled random reason.
- **Dynamic gallery** (`gallery.js`) — albums + photos from Supabase, private bucket via
  signed URLs; lightbox with keyboard arrows + touch swipe; love-notes per photo;
  locked/"future" albums with an unlock date; full edit mode (edit album, caption,
  set cover, delete photo/album).
- **Photo upload** (`upload.js`) — pick album or create one, per-file caption, XHR
  progress bar, type/size validation.
- **Delight extras** — wish balloons (emails the wish via web3forms), floating mini-hearts,
  scratch card with a hearts "confetti" celebration, "stalk me" radar gag, vinyl music
  player with a story box per song.

### Current design language
- **Dark, romantic, glassy.** Near-black background photo with a vignette; frosted-glass
  cards (`--glass`), blur backdrops.
- **Palette:** `--primary-red #ff4d4d`, `--soft-pink #f8c8dc`, `--bg-dark #070707`.
  Only 4 tokens; most colors are inline `rgba()` literals scattered through the CSS.
- **Type:** Playfair Display (display) + Raleway (body) from Google Fonts.
- **Motion:** lots of infinite animations (pulsing heart, bouncing arrow, spawning
  mini-hearts every 800ms, vinyl pulse, radar scan).

### Problems found
- **Accessibility:** nav "buttons" are `<div onclick>`; lightbox close/arrows are
  `<span onclick>` — not keyboard-focusable, no button semantics. No `:focus-visible`
  styles. Modals lack `role="dialog"`/`aria-modal`. `cursor: none` on desktop.
- **No `prefers-reduced-motion` support** at all — a hard requirement in SPEC Phase 5,
  and the constant animation is a battery/comfort cost on her phone.
- **No favicon / no meta description / no OpenGraph** — a shared link looks bare, and the
  browser tab has no icon.
- **Design tokens are thin** — 4 CSS variables; spacing, radii, shadows, motion are all
  ad-hoc literals. Fine for now; not worth a risky refactor mid-campaign.

### Opportunities (SPEC Phase 4 "wow", await CHECKPOINT B)
- Anniversary countdown + celebration, "on this day", animated timeline, map of places,
  message wall, shared bucket list, memory reel, easter egg. **All need new tables** →
  gated behind CHECKPOINT B (no destructive/DDL migration without approval).

### Backend / Supabase status
- Configured and live: `albums`, `photos`, `photo_notes`, `profiles` tables; RLS on;
  private `photos` storage bucket; 38 existing photos migrated. See `supabase/`.

### Constraint for this autonomous session
- Site is behind the login gate and I have **no credentials** (entering a password is
  disallowed), so I can't exercise gated features in-browser. I verify via: page loads,
  **console is clean**, login screen renders, and DOM/structure checks. Gated code paths
  are changed conservatively (same classes, same handlers) and reviewed by hand.

### Plan for this session (all non-destructive, front-end only)
1. Create `PROGRESS.md`, `BACKLOG.md`, `DECISIONS.md`. ✅
2. Meta + favicon + OpenGraph in `<head>`.
3. `prefers-reduced-motion` support (CSS + JS guards).
4. Accessibility & semantics: real `<button>`s, `:focus-visible`, dialog roles.
5. Loading skeletons + verify.
6. Draft (do NOT run) SQL for Phase 4 tables for review at CHECKPOINT B.

---

## CHANGELOG
- **2026-07-20** — Phase 0 audit written; state files created. Re-added `origin` remote
  (filter-repo had stripped it); force-push pending on the user.
