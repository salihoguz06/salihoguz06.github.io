# 🔎 CRITIQUE PASS: "Us" — Be a Demanding, Fair Real User

> Paste this as a message to Claude Code, or save as `CRITIQUE_PROMPT.md` in the repo root
> and say: *"Read CRITIQUE_PROMPT.md and begin the critique."*
> This is an **evaluation pass — do NOT fix anything yet.** Your job is to *use* the site
> like a real person and report what's genuinely wrong. Fixes come in a later session.

---

## YOUR ROLE
Drop the "helpful builder" hat. For this session you are a **critical, discerning real user**
of this private couples' memory website — not the person who built it. You have no loyalty to
the code. You care only about one thing: **is this actually good to use, and does it deliver
the feeling it promises?**

Adopt two lenses and evaluate through both:
1. **The girlfriend** — first-time visitor, mostly on her phone, emotionally-driven, low
   patience for friction. Judges on first impression, delight, warmth, and "does it just work."
2. **The skeptical power user** — pokes edge cases, weird inputs, slow networks, privacy,
   what happens when things fail. Tries to break it on purpose.

---

## THE ONE RULE THAT MATTERS MOST: NO CHEAP CRITICISM
Do **not** manufacture problems to look thorough. Every single issue you raise must pass this
gate before it goes in the report:

> **"Would a real user actually notice this and actually be bothered by it?"**

- If it's a personal style preference, a hypothetical nobody hits, or "technically suboptimal
  but nobody cares" — **cut it.** Do not report it.
- No pad-the-list nitpicks. No "you could also consider…" filler. No inventing bugs you didn't
  reproduce. A short report of 8 real problems beats 40 imaginary ones.
- You must also **call out what genuinely works well** — a credible critic is calibrated, not
  performatively harsh. If the site is good somewhere, say so plainly.
- Every issue needs **evidence**: what you did, what you expected, what actually happened.
  No evidence = not a real finding = don't include it.

---

## STEP 1 — ACTUALLY USE THE SITE (don't just read the code)
Get it running and interact with it for real. In order:
1. Start the app (find the run command; note if it fails to start — that itself is a finding).
2. If a browser-automation tool (Playwright / Puppeteer / a browser MCP) is available, **use
   it to click through the site for real** at both **mobile (375px) and desktop** widths. If
   no browser tool is available, say so explicitly, then do the deepest possible evaluation:
   read the rendered output, trace the code paths for each journey, and reason precisely about
   what the user would experience — but be honest about what you could and couldn't verify live.
3. Take screenshots / capture state at key moments if you can, and reference them in findings.

**Run these real user journeys end-to-end** (adapt to what the site actually has):
- Land on the homepage cold. First 5 seconds: is it clear what this is? Does it feel special?
- Sign in / authenticate. Is the gate obvious? What happens on wrong credentials?
- Browse albums → open an album → open a photo in the lightbox. Keyboard + swipe + zoom.
- Upload a photo into an album. Watch progress, success, and — deliberately — failure
  (huge file, wrong type, no network).
- Leave a reaction / note on a photo. Does it persist? Reload — is it still there?
- Exercise every "wow" feature (counter, countdown, timeline, map, message wall, bucket list,
  reel, etc.): does each actually work, or is it a pretty shell?
- Hit empty states (an album with no photos), loading states, and error states on purpose.
- Try to break it: refresh mid-action, double-click submit, paste weird input, go offline,
  navigate with the back button, deep-link into a page directly.

---

## STEP 2 — EVALUATE ACROSS THESE DIMENSIONS
Score/inspect each; only report where there's a *real* problem:
- **Does it work** — broken features, dead buttons, console errors, failed requests, data that
  doesn't persist or doesn't load.
- **Mobile experience** — the primary device. Tap targets, safe areas, overflow, layout breaks
  at 375px, awkward scrolling, anything that feels bad under a thumb.
- **First impression & emotion** — does it actually feel warm, personal, "wow," or does it feel
  like a template? Be blunt but specific about *why*.
- **UX friction** — confusing flows, unclear labels, too many steps, no feedback after actions,
  unclear where you are.
- **Error & edge handling** — what happens when things go wrong. Ugly crashes vs graceful
  recovery. Does a failed upload lose the user's work?
- **Performance** — slow first load, janky animations, images not optimized, layout shift.
  Give real numbers if you can (load time, Lighthouse).
- **Privacy & security** — CRITICAL for a private couples' site: can an unauthenticated user
  reach photos, notes, or messages? Are Storage URLs guessable/public? Any secret leaked to
  the client bundle? RLS actually enforced? This is the most important category — probe it hard.
- **Accessibility** — genuinely blocking issues only (no alt text, keyboard traps, unreadable
  contrast), not checklist theater.
- **Consistency** — spacing, type, color, motion that visibly disagree with themselves.

---

## STEP 3 — WRITE THE REPORT (`CRITIQUE.md` in the repo root)
Structure it exactly like this:

```
# Critique — <date>
## Verdict (3–5 sentences)
Honest overall take. Would the girlfriend be enchanted, satisfied, or let down? Why?

## What genuinely works well
- (short, specific, sincere — no filler)

## Issues (only real ones, ranked by severity)
For EACH issue:
- **[BLOCKER | MAJOR | MINOR]  Short title**
  - Where: page / component / flow
  - What I did → what I expected → what actually happened (the evidence)
  - Who it hurts: girlfriend / power user / both
  - Why it matters (impact on the actual experience)
  - Suggested direction to fix (one line — not a full implementation)

## Top 3 things to fix first
The highest-leverage fixes, in order.
```

**Severity definitions:**
- **BLOCKER** — broken, data-losing, privacy-leaking, or so bad a real user would bounce.
- **MAJOR** — works but clearly hurts the experience; a real user would be frustrated.
- **MINOR** — small real friction worth fixing, but not urgent. (If it's below "minor," cut it.)

---

## COMMUNICATION
- Write the **verdict and explanations in Turkish** (this is for me), keep code references,
  file paths, and technical terms in English.
- Be direct and honest — I want the truth, not encouragement. But stay evidence-based and fair.
- **Do not fix anything this session.** Report only. We'll triage together and fix next.

## ▶️ START
Get the site running, actually use it through the journeys above (mobile + desktop), probe
privacy hard, then write `CRITIQUE.md`. Remember the one rule: **only real problems a real
user would actually feel.**
