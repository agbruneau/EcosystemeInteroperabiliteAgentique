# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static site generator (Node.js + `marked`) for a French-language publication on enterprise interoperability and agentic architecture. Markdown chapters are converted to standalone HTML pages and deployed to GitHub Pages.

## Commands

```bash
npm install        # Dependencies (Node.js 20+)
npm run build      # Generate docs/*.html from Chapitres/*.md
```

No test or lint commands. To deploy: push to `master` (GitHub Actions auto-builds and publishes).

## Architecture

**Pipeline:** `Chapitres/*.md` + `templates/*.html` + `chapters.json` → `build.js` → `docs/*.html`

- **`build.js`** (~200 lines) — Parses Markdown (GFM), extracts h2 headings for sidebar TOC, adds anchor IDs, generates prev/next navigation per chapter/volume group, copies `public/` assets to `docs/public/`.
- **`chapters.json`** — Metadata for all entries (slug, title, category, color, badge, type). Must be updated when adding a chapter.
- **`templates/`** — `index.html` (homepage with card grids) and `chapter.html` (content page with sidebar). CSS embedded via variables, dark theme only, responsive at 768px.
- **`docs/`** — Generated output (committed for GitHub Pages).
- **`public/`** — Static assets (PDF, podcast M4A, poster PNGs).

**Category colors** (in `chapters.json` and templates): Applications `#2563eb`, Données `#059669`, Événements `#d97706`, Transversal `#6b7280`, Volumes `#7c3aed`.

## Content Workflow

1. Edit Markdown in `Chapitres/`
2. New chapter/volume → add entry to `chapters.json`
3. `npm run build` then push to `master`
