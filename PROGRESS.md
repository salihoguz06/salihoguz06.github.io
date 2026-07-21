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

## PHASE 5 — POLISH (2026-07-20, autonomous session)

Shipped, each committed and browser-verified where the login gate allowed:

1. **Accessibility & semantics** — every click target that was a `<div>`/`<span>`
   (nav buttons, lightbox close + arrows, modal close buttons, stalk-close) is now a
   real `<button>`: keyboard-focusable and announced correctly. Added `aria-label`s,
   `role="dialog"`/`aria-modal` on the gallery/upload/album modals, a `:focus-visible`
   keyboard focus ring, and a `.visually-hidden` helper. Verified: all nav elements now
   report `BUTTON`, and the nav bar looks pixel-identical to before.
2. **prefers-reduced-motion** — a CSS reset that near-freezes infinite/large animations
   and hides the constantly-spawning mini-hearts/balloons, plus JS guards so those spawn
   loops don't even start under reduced motion. Content stays put; nothing is lost.
3. **Meta / favicon / OpenGraph** — inline-SVG heart favicon (no extra request, CSP-safe),
   meta description, theme-color, `noindex`, and OG/Twitter tags so a shared link previews
   nicely. `viewport-fit=cover` for phone safe areas. Verified favicon + og:image present.
4. **Skeleton loading** — the album grid shows shimmering placeholder cards while it
   fetches, instead of a bare "Loading…" line. Visually verified.
5. **Mobile nav** — small-screen (`≤540px`) treatment so the long "Tap to Stalk Me…"
   button shrinks/wraps instead of clipping. ⚠️ Could not preview true 375px here
   (desktop Chrome has a ~500px min window width) — **please confirm on your phone.**
6. **Phase 4 SQL draft** — `supabase/schema3.sql` with milestones / messages / bucket_list
   / places / reactions tables + RLS, idempotent. **NOT executed** — awaits CHECKPOINT B.

Cache version bumped to `?v=7`. All work is front-end / additive; no DB migration was run.

### 🚧 Waiting on you (CHECKPOINT B)
To unlock the Phase 4 "wow" features (anniversary countdown, message wall, map, bucket
list, reactions), review `supabase/schema3.sql` and, if it looks good, run it once in the
Supabase SQL Editor. Then I can build those features against real tables.

## PHASE 4 — SIGNATURE "WOW" (2026-07-21, CHECKPOINT B cleared)

`schema3.sql` was reviewed and run in Supabase → the five new tables are live.
Built five features against them, each its own IIFE module and its own commit,
each matching the existing dark/glass aesthetic and graceful-degrade pattern
(if a table is missing the section quietly hides). All English UI, Turkish
code comments. Verified end-to-end in Chrome against the real session (a saved
login persisted in the browser) — every section renders and the Leaflet map
tiles load. No test rows were written to the real database.

1. **💌 Message wall** (`messages`) — persistent love notes between the two of
   you. Read all, post, delete your own (RLS-enforced); your notes are pink-
   accented. `js/messages.js`, section between gallery and wishes.
2. **✅ Shared bucket list** (`bucket_list`) — dreams to chase together; check
   one off and a little hearts burst fires. Undone items float to top; a
   "N of M done together" progress line. `js/bucket.js`.
3. **💞 Photo reactions** (`reactions`) — emoji reactions inside the lightbox;
   tap to react, tap again to undo; per-emoji counts. Decoupled from
   `gallery.js` via a `sa:photo` CustomEvent. `js/reactions.js`.
4. **📖 "Our Story" timeline** (`milestones`) — a vertical, dated timeline with
   a flowing line; add/remove moments. Plus an **"On this day"** banner that
   appears when today matches a milestone's month/day ("N years ago today").
   `js/timeline.js`, placed before Memories as a narrative lead-in.
5. **🗺️ "Places We've Been" map** (`places`) — Leaflet + OpenStreetMap, heart
   pins with title/date/note popups. Arm "Add a Place", tap the map, name it,
   drop the pin. Auto-fits to all pins; dark-themed tiles/popups; degrades if
   Leaflet is unavailable. `js/places.js`; Leaflet loaded from CDN (GitHub
   Pages, not CSP-restricted like an artifact).

Cache version bumped `?v=8` → `?v=9` (style.css and gallery.js content changed
under the same tag, so a bump is required for phones to refetch).

Still open in P4: memory reel slideshow, hidden easter egg.

## CHANGELOG
- **2026-07-21** — Phase 4 shipped: message wall, bucket list, photo reactions,
  "Our Story" timeline + "on this day", places map (Leaflet). schema3.sql run.
  Cache bumped to `?v=9`. Verified in-browser against the live session.
- **2026-07-20** — Anniversary countdown shipped (P4, no DB); README added (P6).
- **2026-07-20** — Phase 5 polish shipped (a11y, reduced-motion, meta/favicon, skeletons,
  mobile nav); Phase 4 schema drafted (not run). Commits after `04db3eb`.
- **2026-07-20** — Phase 0 audit written; state files created. Re-added `origin` remote
  (filter-repo had stripped it); force-push pending on the user.
