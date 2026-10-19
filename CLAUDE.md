# Carousel Maker: how to build carousels

This folder is a carousel factory. A carousel is one YAML file in `posts/<handle>/`; the engine
renders it into 1080×1350 PNGs. Read `docs/DESIGN-SYSTEM.md` (rules) and `docs/SLIDE-LIBRARY.md`
(every slide type and cover style as a paste-ready YAML block) before writing posts.

## Two ways the user asks

**A. From the plan:** "build Day 5", "build these 10", "do this week for Company".
**B. From a brief:** "make a Company carousel, format F03, about X: <notes>", or several at once
("three posts: …"). A brief can be loose; you pick the slides. Format optional: pick it with the
"How to pick a format" list in `Carousel_Design_Formats.xlsx` → Summary (or DESIGN-SYSTEM §9).

Several posts = several files. Do them one after another, then export and check them in one go.

## Steps

1. **Find the post** (plan mode): `../contentplan.xlsx` (sheets Founder / Company / AgentBro: day →
   title) and `../Carousel_Design_Formats.xlsx` → *Calendar Mapping* (handle, day, title → format ID).
   Read them with openpyxl (`python`), UTF-8 output. Skip "🎬 Video" slots. ★ = collab: one post in
   the Founder brand, mention the company.
2. **Pick the format** (F01–F12). Read `formats/F<id>-*.yaml`: its structure, rules and scaffold.
3. **Create the post** `posts/<founder|company|agentbro>/<fid>-<slug>.yaml`: start from the format
   scaffold (everything after `# ---- scaffold ----`), then swap slides for better-fitting ones from
   `docs/SLIDE-LIBRARY.md`. Set `brand`, `format`, `title`, `series`, `caption`.
   Brand ids: `thedouble-founder`, `thedouble-company`, `agentbro`.
4. **Pick the cover style** (slide 1, `layout: cover`, `style:`). Vary covers across a batch:
   - Company: `split` · `vs` · `scatter` · `pair` · `number` · `object` · `scene` (felt imagery only).
   - Founder: `person` · `banner` · `count` · `guide` · `pair` · `number` (his cut-out).
   - Agent Bro: `pair` · `guide` · `banner` · `count` · `type` · `number` (his photo).
   A count ("5 AI agents…") is `style: number` or `count` with `number: "5"`, number dropped from the headline.
   Each account has a fixed identity (don't restyle per post; the brand files do it):
   - Company + Founder follow The Double design system (DESIGN-SYSTEM §15, `engine/double.css`): Funnel Display +
     one Newsreader italic phrase, capability colours (`cap:` per slide or `rhythm: capabilities`), cobalt CTA.
   - Company: linen, centred, pigment washes on capability slides. Editorial slides + felt world.
   - Founder: left-aligned notebook, flat capability tints + one bold block with his face sticker (`face:`),
     cobalt covers. Use `face: false` when the post is about someone else (persona clones).
   - Agent Bro: "the lab" (grid, red square wordmark, mono `// labels`, hairline cards). `mode: light`
     (default, what we usually post) or `mode: dark` at the post level.
5. **Write the copy** to DESIGN-SYSTEM §6:
   - Cover: a promise in 3–8 words, one `*emphasis*`. Sell the wish, then the how.
   - Slide 2: standalone (a second cover), ≤ 12 words: proof, item #1 or a choice. No intro.
   - Middle: verb-first titles, one idea per slide, ≤ ~45 words, real specifics. Repeat one slide type
     for the parallel middle (all `step`, all `item` …); editorial slides (`lanes`, `index`, `ledger`,
     `brief`, `pipeline`, `tree`, `notebook`) break up long Company posts.
   - Penultimate: payoff. Last: one light ask (`cta` style `comment` · `question` · `save` · `ring` · `photo`).
   - 7–9 slides. No hype words, no "!!", no invented statistics presented as fact. Mark example
     numbers as examples ("example numbers" in a kicker or label) until the user supplies real ones.
6. **Images, per handle (hard rules):**
   - Founder: his cut-out on the cover (`image-assets/character.png` until real photos land in
     `assets/people/founder/`). Felt agents may appear inside agent-build posts (`mascot`, `says`, roster).
   - Company: **no humans.** Felt agents (`assets/agents/*.png`: cobalt, tangerine, bubblegum, sky, grape,
     green, yellow, red, ink, snow), felt scenes (`image-assets/`), 3D icons (`assets/icons`, `assets/logos`).
   - Agent Bro: **only his photos** (`assets/people/agentbro/*.png`). No mascots, no felt characters.
     If none exist, leave `image` out; the slot shows a silhouette to fill in the studio.
   - Prefer coded UI kits (`chat`, `claude`, `double`, `n8n`, `gmail`, `sheet`, `notify`, `hub`) over
     screenshots. Real screenshots go in `image` with `frame: browser`.
7. **Check, export, look:**
   ```
   npm run check -- posts/<handle>/<file>.yaml [more…]   # swipe rules + clipped / off-slide text
   npm run export -- posts/<handle>/<file>.yaml [more…]  # PNGs → out/<handle>/<file>/
   ```
   Fix everything `check` reports (it exits 1 until clean). Then look at the PNGs (a contact sheet
   is fastest) and fix anything that reads small, crowds, or leaves a slide mostly empty.
8. **Report**: list the files, the cover style and format of each, anything marked as example copy,
   and the studio link: `npm run studio` → http://localhost:4321/?post=posts/...

## Don't

- Don't edit a post the user is working on in the studio without asking (the studio autosaves; check
  the file's modified time).
- Don't hard-code colours or fonts in a post. Use `theme:` (preset name or `{ accent: "#hex" }`).
- Don't add a logo to covers (research: early brand appearance lowers engagement).
- Don't hand-place elements with `move:` unless asked; it's for the studio's drag tools.

## Map of the code

| Path | What |
|---|---|
| `server.mjs` | local server: studio, post read/write, upload, export, zip |
| `studio/` | the editor (`index.html`, `studio.js`, `studio.css`) and `render.html` (used for export) |
| `engine/engine.js` | brand loading, post → slides, text fitting, `move:` placement, theme, swipe checklist |
| `engine/layouts.js` | core slide layouts + cover styles (`coverV2`) |
| `engine/layouts-editorial.js` | lanes · index · ledger · brief · pipeline · tree · notebook · cta ring/photo |
| `engine/library.js` | the slide library (templates for the studio + `npm run docs`) |
| `engine/visuals.js` | visuals + UI kits |
| `engine/slides.css`, `kits.css` | base styles; `engine/skins/{bold,calm,quest}.css` = design languages |
| `engine/system.css`, `covers.css`, `editorial.css` | shared layers loaded last (rhythm, cover styles, editorial slides) |
| `brands/<id>/brand.yaml` | tokens, fonts, colour presets, imagery rules |
| `brands/_shared/thedouble/` | generated shared tokens for Company + Founder (`npm run sync:tokens`, see `docs/DESIGN-TOKENS.md`) |
| `formats/F*.yaml` | format recipes + scaffolds |
| `scripts/export.mjs`, `check.mjs`, `library-doc.mjs` | `npm run export` · `npm run check` · `npm run docs` |
| `scripts/sync-design-tokens.mjs` | sync shared design tokens · `npm run sync:tokens` · `npm run check:tokens` |
