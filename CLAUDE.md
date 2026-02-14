# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Overview

Static site generator (Node.js + `marked`) for a French-language publication on enterprise interoperability and agentic architecture. 11 chapters (I–XI) + annexes + 5 consolidated volumes are converted from Markdown to standalone HTML pages and deployed to GitHub Pages.

All content is in **French**. Commit messages and code comments should be in French.

Live site: https://agbruneau.github.io/InteroperabiliteAgentique/

## Commands

```bash
npm install        # Dependencies (Node.js 18+, single dep: marked v15)
npm run build      # Generate docs/*.html from Chapitres-Volumes/*.md
npx serve docs     # Optional: local HTTP server at localhost:3000
```

No test or lint commands. No CI/CD pipeline — deploy by pushing generated `docs/` to `master`.

## Architecture

**Pipeline:** `Chapitres-Volumes/*.md` + `templates/*.html` + `chapters.json` → `build.js` → `docs/*.html`

- **`build.js`** — Parses Markdown (GFM via `marked`), extracts h2 headings for sidebar TOC, adds anchor IDs, generates prev/next navigation per chapter/volume group, copies `public/` assets to `docs/public/`.
- **`chapters.json`** — Ordered array of 17 entry metadata objects. Must be updated when adding a chapter. Schema per entry:
  - `source`: Markdown filename in `Chapitres-Volumes/`
  - `slug`: URL-safe identifier (used for output filename `{slug}.html`)
  - `roman`: Roman numeral (empty string for annexes)
  - `title`, `shortTitle`: Full and card display titles
  - `category`: `transversal` | `applications` | `donnees` | `evenements` | `volume`
  - `color`: Hex color for the category
  - `badge` (optional): Label shown on cards
  - `type` (optional): `"volume"` for consolidated volumes
- **`templates/index.html`** — Homepage template. Placeholder: `{{CHAPTERS_GRID}}`. Contains hero section, resource links (PDF, podcast), poster sections, interoperability levels, AI tooling section. Google Fonts: DM Serif Display + DM Sans.
- **`templates/chapter.html`** — Content page template. Placeholders: `{{TITLE}}`, `{{SIDEBAR}}`, `{{CONTENT}}`, `{{PREV_LINK}}`, `{{NEXT_LINK}}`. Two-column layout with sticky sidebar TOC.
- **`docs/`** — Generated output, committed to repo for GitHub Pages. Do not edit manually.
- **`public/`** — Source static assets (PDF, podcast M4A, poster PNGs/JPG). Copied to `docs/public/` during build.

**Styling:** Dark theme only, all CSS embedded in templates (no external stylesheets). Responsive breakpoints at 768px (both templates) and 480px (homepage).

**Category colors** (in `chapters.json`): Applications `#2563eb`, Données `#059669`, Événements `#d97706`, Transversal `#eab308`, Volume `#a855f7`, Annexes `#6b7280`.

## Content Workflow

1. Edit Markdown in `Chapitres-Volumes/`
2. New chapter/volume → add entry to `chapters.json` (order matters for navigation)
3. `npm run build` then commit both source and `docs/` changes, push to `master`
