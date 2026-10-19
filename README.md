# Carousel Maker

Write a carousel as a YAML file in `posts/<handle>/`; the engine renders it into 1080×1350 Instagram PNGs.
Three accounts: Founder (`thedouble-founder`), Company (`thedouble-company`), Agent Bro (`agentbro`).

## For an AI agent (Claude Code, Codex, Cursor, Gemini …): run this project

Prerequisites: Node.js 18+ and internet access (brand fonts load from Google Fonts).

```bash
git clone https://github.com/mazorvion/carouselMaker.git
cd carouselMaker
npm install
npx playwright install chromium     # required for check + export
npm run studio                      # editor → http://localhost:4321  (set PORT=xxxx to change)
```

`npm run studio` is a long-running server: start it in the background, then open http://localhost:4321.
If the page loads and lists posts, the project is running.

Then read, in order: **`CLAUDE.md`** (how to build carousels, the full workflow) →
`docs/DESIGN-SYSTEM.md` (rules) → `docs/SLIDE-LIBRARY.md` (every slide type as paste-ready YAML).
`AGENTS.md` points to the same files.

### Commands

```bash
npm run check  -- posts/<handle>/<file>.yaml    # swipe rules + clipped/off-slide text; must exit 0
npm run export -- posts/<handle>/<file>.yaml    # PNGs → out/<handle>/<file>/
npm run docs                                    # regenerate docs/SLIDE-LIBRARY.md
npm run sync:tokens                             # pull The Double tokens from the shared design system
npm run check:tokens                            # fail if the vendored shared tokens are stale
```

### Shared design system

Company and Founder consume tokens from
[`cardtree-bulkbeings/shared-design-system`](https://github.com/cardtree-bulkbeings/shared-design-system)
through a generated, scoped `--ds-*` layer. The snapshot is committed, so normal rendering needs no
network. To update it, run `npm run sync:tokens`; see `docs/DESIGN-TOKENS.md` for details, overrides and
what is intentionally not synced.

### Make a carousel

A post is one file: `posts/<founder|company|agentbro>/<format>-<slug>.yaml`. Start from a format scaffold in
`formats/F*.yaml`, set `brand`, `format`, `title`, `series`, `caption`, write 7–9 slides, then run `check`
until clean, `export`, and look at the PNGs.

## For a human

Run the same install steps, then `npm run studio` and open http://localhost:4321 to edit visually.
Or open the folder in Claude Code / Codex and say "run this project" or "build a Company carousel about X".

## Layout

`posts/` post YAMLs · `brands/` per-account tokens + skins · `brands/_shared/` generated shared tokens ·
`formats/` format recipes · `engine/` renderer · `studio/` editor · `assets/`, `image-assets/` imagery ·
`scripts/` check/export/sync · `out/` generated PNGs (git-ignored).
