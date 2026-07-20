# 💞 PROJECT: "Us" — Couples' Memory Website — Full Overhaul & Feature Campaign

> Paste this whole file as your first message to Claude Code, or keep it in the repo
> root as `SPEC.md` and tell Claude Code: *"Read SPEC.md and begin."*

---

## 0. ROLE & STAKES

You are my **senior web designer + full-stack engineering partner** for this project.
Think like a **designer first** (layout, typography, motion, emotional tone, restraint)
and an **engineer second** (clean, typed, maintainable, secure code).

This is a **private website I built for my girlfriend and me** — a living archive of our
memories. The bar is not "functional." The bar is: **she opens it on her phone and is
genuinely enchanted.** Craft, warmth, and delight matter as much as correctness. Every
pixel and every interaction is felt by the two most important people this project will
ever have. Treat it that way.

---

## 1. PRIME DIRECTIVE — HOW YOU OPERATE (read carefully)

This is a **long, autonomous engineering campaign**, not a single task. You are expected
to work **continuously through many phases and dozens of items** with minimal hand-holding.

Your operating loop for EVERY item is:

```
PICK next item from BACKLOG  →  explain the concept (if new) briefly in Turkish  →
implement  →  run the app / build / lint / typecheck  →  verify it works  →
fix anything you broke  →  commit with a clear message  →  update PROGRESS.md  →
CONTINUE to the next item WITHOUT waiting for me
```

**Do NOT stop after each small change to ask "should I continue?"** Keep going. You only
pause at the explicit **🚧 CHECKPOINT** gates defined below (there are only a few). Between
checkpoints, you are trusted to make reasonable decisions, and if two options are close,
**pick the better-crafted one and note it in PROGRESS.md** rather than blocking on me.

**Only stop and ask me when:**
- You hit a real blocker you cannot resolve (missing credentials, an ambiguous product
  decision that materially changes the site, a destructive/irreversible action).
- You reach a 🚧 CHECKPOINT.
- The entire backlog is genuinely complete and verified.

If you ever feel "done," re-read the BACKLOG and PHASE list — there is almost always a
polish, accessibility, performance, or delight item still open. Push the quality bar higher.

---

## 2. GROUND RULES (never violate)

1. **Never break working features.** If a change risks regression, guard it, test it, and
   verify the old behavior still works before committing.
2. **Security is non-negotiable.** Our photos and notes are private. Enforce Supabase
   **Row Level Security (RLS)** so nothing is publicly readable/writable. Never hardcode
   secrets — use environment variables and tell me exactly which keys are client-safe
   (anon) vs server-only (service role).
3. **Incremental, reviewable commits.** One logical change per commit. Conventional-style
   messages (`feat:`, `fix:`, `refactor:`, `style:`, `perf:`, `docs:`, `chore:`).
4. **Respect the existing codebase.** Match its conventions; don't rewrite gratuitously.
   Refactor only when it clearly pays for itself, and say why.
5. **Verify before you move on.** Run the dev server / `build` / `lint` / typecheck after
   each feature. A feature isn't done until it runs clean and you've actually exercised it.
6. **Explain new concepts in Turkish, briefly, before the code** (RLS policies, Storage
   buckets, optimistic UI, etc.). I'm an intermediate/beginner dev who learns by
   *understanding*, not memorizing. Keep code, identifiers, and commit messages in English.
7. **No secrets, tokens, or private data in commits, logs, or client bundles.** Ever.
8. **Ask one focused question when truly ambiguous** — don't guess on things that are hard
   to reverse.

---

## 3. STATE MANAGEMENT — your memory across the long run

Because this run is long, you must externalize your state so you never lose the thread:

- **Create `PROGRESS.md`** at the repo root. Maintain a running log: what you audited, what
  you changed, decisions + rationale, what's next. Update it after every item.
- **Create `BACKLOG.md`** from Section 6 below (plus anything you discover in the audit).
  Use checkboxes `- [ ]` / `- [x]`. This is your source of truth for "what's left."
- **Create `DECISIONS.md`** for any non-obvious product/design/architecture choice, so I can
  review your reasoning later.

Re-read these three files whenever you resume or feel lost. They are your working memory.

---

## 4. THE PHASES (work top to bottom; don't skip)

### 🚧 PHASE 0 — DEEP AUDIT (report before big changes)
Before writing feature code:
1. Explore the full repo. Identify: framework (Next.js / React+Vite / plain HTML / other),
   language (TS/JS), styling approach (Tailwind / CSS modules / vanilla), routing, state,
   any existing backend or data layer, deployment target, package manager, node version.
2. Run the app locally. Note how to start it, and whether it currently builds & lints clean.
3. Read every page and component. Produce in `PROGRESS.md`:
   - **What the site currently does** (feature inventory).
   - **Current design language** — colors, fonts, spacing, motion, overall tone.
   - **Problems** — bugs, dead code, accessibility gaps, security issues, perf red flags,
     hardcoded content that should be dynamic.
   - **Opportunities** — where the "wow" is missing.
4. Confirm whether Supabase is already set up (project, keys in env, any existing tables).
5. Produce a concrete **execution plan** mapping the backlog onto phases.

**🚧 CHECKPOINT A — Report your audit + plan and WAIT for my go-ahead** before Phase 2's
schema work or any large/destructive change. Small, obviously-safe fixes you may do now.

### PHASE 1 — FOUNDATION & DESIGN SYSTEM
- Fix the bugs and dead code found in the audit.
- Establish a real **design system**: a documented color palette (warm, romantic, refined —
  not a default template look), a typographic scale, a spacing scale, radii, shadows, and
  motion tokens. Centralize them (Tailwind config / CSS variables / theme file).
- Set up consistent, reusable primitives (Button, Card, Modal/Lightbox, Input, Toast, etc.).
- Ensure a coherent light theme, and add a tasteful **dark / "night" theme** if it fits.

### PHASE 2 — SUPABASE BACKEND (data, auth, storage, security)
Explain each concept in Turkish first, then implement.
- **Auth:** private access so only the two of us can enter (email magic-link or
  email+password — recommend the simpler-for-us option and explain the trade-off).
- **Database schema** (extend as needed, keep it clean and indexed):
  - `albums` (id, title, description, cover_photo_id, created_at)
  - `photos` (id, album_id FK, storage_path, caption, uploaded_by, taken_at, created_at)
  - `reactions` (id, photo_id FK, author, emoji, created_at)
  - `notes` (id, photo_id FK, author, body, created_at)
  - `milestones` (id, title, date, kind, note)  — for anniversaries / "days together"
  - `guestbook` / `messages` (id, author, body, created_at)  — the love-message wall
  - `bucket_list` (id, title, done, done_at, note)
  - `places` (id, title, lat, lng, visited_on, photo_id)  — for the map feature
- **Storage:** a private bucket for photos. Upload from the site directly into a chosen
  album: upload to Storage, write the metadata row, show **upload progress**, validate file
  type/size, handle errors gracefully, and generate/optimize thumbnails where sensible.
- **RLS everywhere.** Write and explain the policies. Verify that an unauthenticated request
  cannot read our photos, notes, or messages. This is the single most important security item.
- Wire ALL content to be **fetched dynamically** from Supabase — nothing hardcoded.
- Keep env keys correct: anon key client-side, service role server-only, never in the bundle.

**🚧 CHECKPOINT B — Before running any destructive migration or deleting existing data,**
show me the exact SQL/plan and wait.

### PHASE 3 — CORE INTERACTIVITY (the site must feel alive)
- Album grid with elegant transitions, hover/press states, and skeleton loading.
- **Lightbox / gallery viewer**: keyboard arrows on desktop, swipe on mobile, pinch-zoom,
  captions, and a smooth open/close animation.
- **Reactions** (emoji / little hearts) and **love-notes** we can leave on individual photos,
  persisted to Supabase, with **optimistic UI** (explain what that is).
- Drag-and-drop or tap-to-upload with a clean progress state and success/error toasts.
- Empty states that feel warm, not blank ("No memories here yet — add your first ✨").

### PHASE 4 — SIGNATURE "WOW" FEATURES (this is where you enchant her)
Implement as many of these as time allows; propose your own too. Prioritize emotional impact
and polish over quantity — a few flawless features beat many mediocre ones.
- **"Days together" counter** — a live, animated count since our start date, on the hero.
- **Anniversary / special-date countdowns** with a subtle celebration (tasteful confetti or
  a gentle animation) when a date arrives.
- **"On this day" memories** — surface photos/notes from the same date in past years.
- **Our timeline / "our story"** — a scrollable, animated vertical timeline of milestones.
- **Map of us** — pins for places we've been together, each opening its photos.
- **Message wall / guestbook** — sweet notes we leave each other, live-updating.
- **Shared bucket list** — dreams & plans with satisfying check-off animations.
- **"Reasons I love you"** — a tappable card that reveals a random one each time.
- **A memory "reel"** — an auto-playing slideshow of favorite photos with soft transitions
  (optionally a song — make audio opt-in and respect autoplay rules).
- **A hidden easter egg** — a small, delightful surprise she can discover (your call).

### PHASE 5 — POLISH (make it feel expensive)
- **Motion:** consistent, physics-y micro-animations (fade/scale on load, parallax on hero,
  spring transitions). Respect `prefers-reduced-motion`.
- **Mobile-first, always.** We live on our phones — every screen must be flawless at 375px
  wide, with proper safe-area handling and thumb-reachable controls.
- **Performance:** lazy-load images, responsive `srcset`, code-split, lighthouse pass. Target
  fast loads on mobile data. Report before/after Lighthouse scores.
- **Accessibility:** semantic HTML, alt text (auto-suggest from captions), focus states,
  keyboard nav, sufficient contrast.
- **Robust states:** loading skeletons, error boundaries, offline/failed-upload recovery,
  and friendly error copy.
- **Meta / share:** favicon, title, OpenGraph image so a shared link looks lovely.

### PHASE 6 — HARDENING & HANDOFF
- Sensible tests for the critical paths (auth gate, upload, RLS behavior).
- A final **security sweep** — confirm no private data is publicly reachable, no secret in
  the client bundle, RLS verified with an unauthenticated client.
- Update `README.md`: how to run, env vars needed, Supabase setup steps, deploy notes.
- Clean up: remove dead code, console logs, unused deps.
- Summarize everything shipped in `PROGRESS.md`, with a short "what I'd do next" list.

---

## 5. DEFINITION OF DONE (apply to every feature)
A feature is done only when ALL of these are true:
- [ ] It works on mobile (375px) **and** desktop.
- [ ] Loading, empty, and error states are handled.
- [ ] It's wired to Supabase where relevant (no hardcoded data) with RLS enforced.
- [ ] The app builds, lints, and typechecks clean.
- [ ] You actually exercised it (not just wrote it) and it behaves correctly.
- [ ] It's committed with a clear message and logged in `PROGRESS.md`.
- [ ] It matches the design system and feels polished, not placeholder.

---

## 6. INITIAL BACKLOG (seed `BACKLOG.md` from this; add audit findings)
```
[ ] P0  Audit repo, run app, document current state, produce plan
[ ] P1  Establish design tokens (color/type/spacing/motion) + theme file
[ ] P1  Build reusable UI primitives (Button, Card, Modal, Input, Toast)
[ ] P1  Fix all bugs / dead code found in audit
[ ] P1  Add dark "night" theme
[ ] P2  Supabase auth (private, two-user access)
[ ] P2  Schema + migrations (albums, photos, reactions, notes, milestones, messages,
        bucket_list, places)
[ ] P2  Private Storage bucket + upload flow with progress + validation
[ ] P2  RLS policies on every table + verify with unauthenticated client
[ ] P2  Replace all hardcoded content with dynamic Supabase fetches
[ ] P3  Album grid with transitions + skeletons
[ ] P3  Lightbox (keyboard + swipe + zoom + captions)
[ ] P3  Photo reactions + notes with optimistic UI
[ ] P3  Warm empty states everywhere
[ ] P4  "Days together" animated counter
[ ] P4  Anniversary countdowns + celebration animation
[ ] P4  "On this day" memories
[ ] P4  Animated "our story" timeline
[ ] P4  Map of places we've visited together
[ ] P4  Message wall / guestbook (live-updating)
[ ] P4  Shared bucket list with check-off animation
[ ] P4  "Reasons I love you" random-reveal card
[ ] P4  Memory reel slideshow (opt-in audio)
[ ] P4  Hidden easter egg
[ ] P5  Motion polish + prefers-reduced-motion
[ ] P5  Mobile-first pass at 375px, safe areas
[ ] P5  Performance: lazy images, srcset, code-split, Lighthouse
[ ] P5  Accessibility pass
[ ] P5  Robust loading/error/offline states
[ ] P5  Meta / favicon / OpenGraph share image
[ ] P6  Tests for auth, upload, RLS
[ ] P6  Final security sweep
[ ] P6  README + deploy notes
[ ] P6  Cleanup + final PROGRESS.md summary
```

---

## 7. DESIGN LANGUAGE (your north star)
- **Emotion:** warm, intimate, refined — romantic without being kitschy. Think "quiet luxury
  love letter," not "Valentine's clip-art."
- **Type:** an expressive display face for headings + a clean readable body face; a real
  hierarchy, generous line-height, comfortable measure.
- **Color:** a restrained, warm palette (soft neutrals + one or two romantic accents). Define
  it once; use it consistently. Ensure contrast passes AA.
- **Motion:** purposeful and soft — easing that feels human, nothing that flashes or jitters.
- **Restraint:** when in doubt, remove. Whitespace and calm beat clutter. Every element earns
  its place.

---

## 8. COMMUNICATION STYLE
- Explain **new concepts and your plan in Turkish**, briefly, before implementing.
- Keep **code, identifiers, commit messages, and file docs in English.**
- After each phase, give me a short Turkish recap of what changed and what's next — then
  keep going. Don't wait for applause.

---

## ▶️ START NOW
Begin with **PHASE 0 (the audit)**. Create `PROGRESS.md`, `BACKLOG.md`, and `DECISIONS.md`,
report your findings and plan (🚧 CHECKPOINT A), and once I confirm, run the campaign
end-to-end — pausing only at the checkpoints or on a real blocker. Push the quality bar as
high as it goes. Make her fall in love with it. 💞
