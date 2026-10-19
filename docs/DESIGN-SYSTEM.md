# Carousel design system

The rules every carousel follows, for all 3 handles and all 12 formats. Built from two sources:
the **Human Motivation Instagram study** (Consensus, 31 pp.) and **21 reference posts** from 8 accounts
(`refrences/`, analysed in `docs/CAROUSEL-BRIEF.md`).

How the pieces fit:

```
brand kit (brands/<id>/brand.yaml)     → tokens, fonts, colours, imagery rules, colour presets
  └─ design language (engine/skins/*)  → bold · calm · quest  (how a brand *looks*)
system layer (engine/system.css)       → spacing, reading sizes, fill rules for every handle (loaded last)
layouts (engine/layouts.js)            → 20 slide types (cover, step, item, quiz, cta …)
visuals (engine/visuals.js)            → the picture half: UI kits, screenshots, rows, flows …
formats (formats/F01–F12.yaml)         → a recipe: which layouts, in which order, with which rules
post (posts/<handle>/*.yaml)           → one carousel = brand + format + copy + images
```

---

## 1. Research → rules (and where each rule lives)

| Research finding | Rule | Built into |
|---|---|---|
| People scroll to escape boredom/stress; they want **quick reward**, not information alone | Every post does one job: **help me · show me · let me signal who I am** | format `job:` |
| Information + affect (personality, story) beats information alone | A face, a character or a real moment in every post | imagery rules per handle |
| Stop triggers: **face with direct gaze, high contrast, clear early text**, product salience | Cover = 3–8 word promise on clean ground + face/avatar + the product | cover layout, checklist |
| Large central text over busy images *lowers* engagement | Cover text never sits on the photo; photo sits below/behind | cover layout |
| **Early brand appearance lowers engagement** | No logo on the cover; brand shows in the chrome from slide 2 and in the CTA | engine (cover has no mark) |
| Carousel's native action is the **next swipe**: curiosity + control + low load | Counter on every slide, "Next: …" teaser, one idea per slide | chrome, `next` teaser |
| Slide 1 = a **promise** (claim, contrast, checklist, mistake/result), not a topic label | Cover headline formula (§6) | checklist |
| Each slide reveals **part** of the answer; connected narrative units | Middle slides repeat one template; steps/items numbered | layouts |
| **5–8 slides** safest; longer only if every slide pays | Target 7–9 (refs run 9–11) | checklist |
| Visual informativeness helps; cognitive burden hurts | Real UI (chat, Claude, n8n, Sheets) over decoration; ≤ ~45 words per slide | UI kits, checklist |
| Positive high-arousal (awe, excitement, amusement) spreads; overload backfires | One accent colour, one emphasis per headline, no hype words | skins, checklist |
| Story needs **surprise, plot, characters** | Felt agents as recurring characters (Company, Founder agent posts) | `mascot` + `says` |
| End with a **light CTA**: question, save cue or keyword; hard sell lowers likes | CTA styles: comment · question · save | `cta` layout |
| New creators: like/save asks often beat comment asks | Use `style: save` on early posts; comment keyword when there's a real gift | `cta` layout |
| Familiarity: followed creators get more engagement; be distinct **in a stable way** | Each handle keeps one look forever (purple cow) | brand kit + skin |
| Perceived effort builds trust; slop repels | Handwritten notes, real screenshots, specific numbers | `note`, visuals |
| Later-20s/30s want evidence and logical consequences | A proof or numbers slide in most formats | `stat`, `scorecard` |

---

## 2. What the references taught

Ranked by likes: algowinner *7 AI businesses* 10.1K · meghanify *tool stack* 6.1K · wellbeing 3.1K ·
algowinner *69 prompts* 3.0K · meghanify *AI agency* 2.8K · aiagently *WhatsApp agent* 2.3K ·
theaiagents 2.2K / 1.8K · aiagently *Hormozi clone* 1.2K + **2.6K comments** · … ·
theonlyworkshop 90–781 (most refined, least liked).

1. **Sell a wish, then the how.** Money, free, forever, "your own team". Pure tool tutorials ranked last.
2. **Cover:** headline in the top 30–40%, 2–6 words, one coloured word, a small-caps stakes line, then
   one face or one object filling the lower 55–65%.
3. **No intro slide.** Slide 2 is already a payoff: item #1, the result, or a choice.
4. **The middle repeats one template:** same title spot, same badge, same visual zone. Progress visible.
5. **One visual per slide**, ~50–60% of the height, plus 2–5 short lines. Titles are verb-first.
6. **Second-to-last = payoff** ("Here's the full system", "Final score", "The takeaway").
7. **Last = one ask:** "Want the complete guide?" → **COMMENT "WORD"** → "I'll send it to you".
8. **Two colours max.** Light ground, black type, one accent used only for the keyword/label/CTA.
9. **A recurring character** on every slide (face badge, blob, avatar).
10. **Participation** ("How many can you relate to?", A/B/C) drives comments.
11. **Hand-drawn arrows/notes** point the eye and read as human.

Measured on the 1080 px slide: headlines **85–100 px**, sub-lines **30–38 px**, labels **20–26 px**,
side margins **72–88 px**, card radius **24–32 px**. Weights 600 (calm) → 900 (heavy).

---

## 3. The three handles

| | **Founder** | **Company (The Double)** | **Agent Bro** |
|---|---|---|---|
| Who | The Double's founder, first person ("I built…") | The product's voice ("Your Double…") | The AI-agent guy. **Not** The Double |
| Design language | `bold`, after aiagently | `calm`, after theonlyworkshop + Wellbeing | `quest`, after theaiagents |
| Ground | White + soft accent glows in two corners | Off-white `#F7F6F3` | Light grey with a soft top light |
| Type | Poppins 700–800, centred; Inter body | Inter Tight 600, very tight, centred; DM Mono labels | Satoshi 900, left-aligned; Inter body |
| Accent (default) | Cobalt `#2F43F2` (title gradient → ink) | Ink + **lime marker underline** `#D4F53C` | Hot pink `#F0325A` |
| Emphasis `*word*` | accent colour | lime underline | accent colour |
| Signature | "STEP 1" tinted pill · gradient title · "Next →" pill | mono series label · "Next: … →" mono footer · captions under UI | pink gradient pill · grey caps subtitle · BUILD STACK cards · red handwriting |
| **Cover image** | **The founder's real photo** (cut-out, direct gaze) | **Felt avatar or felt scene. Never a human.** | **His real photo** (cut-out) |
| Characters inside | Felt agents allowed on agent-build posts (`mascot`, `says`, roster avatars) | Felt agents everywhere: mascot, avatars, scenes | **None.** Only his photos + tool logos |
| Colour presets | cobalt · green · red · orange · violet · ink | lime · yellow · cobalt · pink · orange (marker) | pink · green · yellow · blue · violet · orange |

Change any colour per post: `theme: green` (a preset) or `theme: { accent: "#12B76A" }`
(Company: `theme: { highlight: "#FFD60A" }`). The studio's colour dots do this for you.

---

## 4. Type scale (px on the 1080×1350 slide)

Instagram shows a slide at ~360 px wide (a third of export size). Anything under 22 px here is unreadable
on a phone, so **22 px is the floor** and body copy sits at 34–38 px. The rules live in `engine/system.css`.

| Role | Founder (bold) | Company (calm) | Agent Bro (quest) |
|---|---|---|---|
| Giant cover number (`style: number`) | 660 / accent shine | 660 / ink or `color:` | 660 / red shine |
| Cover headline | 128 / 800 (112 beside a number) | 118 / 600 | 136 / 900 (120 beside a number) |
| Slide headline (`h-xl`) | 96 / 700 | 104 / 600 | 98 / 900 |
| Step / item title (`h-lg`) | 90 / 700 gradient | 92 / 600 | 90 / 900 |
| Lede / sub | 35 | 36 | 34 |
| Label / kicker | 24 bold caps | 23 mono, tracked .26em | 24 red caps |
| Body in cards / rows / quiz | 30–44 | 30–44 | 30–44 |
| Prompt text | 44 | 44 | 42 |
| Chrome (counter, next, handle) | 22 | 22 | 22–24 |
| Notes (handwriting) | Caveat 44 | Instrument Serif italic 40 | Caveat 48, red |

Headlines auto-shrink to fit (never below 45%). Write shorter rather than relying on it.

### Fill rules (v2, from the references)

1. **Fill the frame.** In every reference the mockup spans ~85–92% of the slide width and nothing floats
   in dead space. The engine **zooms each visual to fill its area** (`zoomToFill` in `engine/engine.js`): it
   lays the mockup out narrower and scales it up, so a 2-row card grows its text instead of sitting small.
   Per visual cap: single-column kits 1.4×, multi-column grids ~1.1×. Override per slide: `visual: { grow: 1.2, … }`.
2. **Read at phone size.** See the type scale above. 22 px floor.
3. **One rhythm.** label → 14 → headline → 22 → sub → 44 → visual. Same positions on every slide of a post.
4. **Numbers are the loudest thing.** A count on a cover ("5 AI agents…", "50+ skills") is a giant numeral:
   `style: number`, `number: "5"`, and drop the number from the headline. The checklist flags covers that
   start with a number but don't use it. The character / person stands beside the number and bleeds off
   the bottom edge.
5. **One label per slide.** "STAFF 01" or "HABIT 01" only. No "01 + tool logo + label" row. The tool mark
   shows as the picture only when the slide has no visual.
6. **Lists and CTAs hold the slide.** Recap = one full-width row per item with a big number. Three-way
   versus = three full-width rows (not narrow columns). Question CTA sits in the optical centre with big
   answer chips; the follow line pins to the bottom.

## 5. Slide anatomy

```
┌──────────────────────────────────────────────┐
│ logo (not on cover)   SERIES LABEL     02/08 │  chrome-top
│                                              │
│ STEP 1  ← pill / kicker                      │
│ Verb-first title with *one* emphasis         │  ≤ 2 lines
│ One line of lede.                            │  ≤ 2 lines
│ ┌──────────────────────────────────────────┐ │
│ │  ONE visual: UI kit / screenshot / rows  │ │  50–60% of height
│ └──────────────────────────────────────────┘ │
│                         ↙ handwritten note   │
│ @handle   [→ Next: Step 2 · Give it a voice] │  chrome-bottom
└──────────────────────────────────────────────┘
```

- **Counter** on every slide but the cover (perceived control).
- **Next teaser** is automatic before step / item / prompt / roster / Q&A slides; override with `next:`.
- **Swipe** pill on the cover; small arrow on middle slides; nothing on the last.
- **Mascot** (`mascot:` at post level, `says:` per slide): Company and Founder agent posts only.

---

## 6. Copy rules

**Cover (slide 1): a promise, not a label.** 3–8 words, one `*emphasis*`, plus a stakes `tagline`.

| Frame | Example |
|---|---|
| Result | AI receptionist for *dentists* · BOOKS PATIENTS 24/7 |
| Contrast | Chatbot vs agent vs *clone* |
| Checklist / number | 5 AI agents every startup *needs* |
| Mistake | You're using *ChatGPT* wrong |
| Identity | I turned *Chanakya* into my AI advisor |
| Question | Still think AI sounds *robotic?* |

**Slide 2: a second cover** (Instagram can re-serve the post opening on it). ≤ 12 words, standalone.
Patterns: **proof first** ("11:47 PM. A patient asks for Saturday. *Booked.*") · **pick your lane** ·
**you already have it** · **what if** · **play first** (quiz) · **stakes** · **item #1 straight away**.
Never "In this post…" / "Here's what you'll learn".

**Middle:** verb-first titles ("Connect *WhatsApp*…"), one idea per slide, ≤ ~45 words, real numbers.
**Penultimate:** payoff (the whole system, the numbers, the score, the takeaway).
**CTA:** one ask. `keyword` when you have a real gift to DM. `question` for comments. `save` for new accounts.
**Never:** revolutionary, unleash, game-changer, insane, "you won't believe", "!!".

---

## 7. Layouts (slide types)

| Layout | Use for | Key fields |
|---|---|---|
| `cover` | slide 1 | `style: person · scene · object · number · type`, kicker, headline, tagline, sub, image, logos, tag, badge, note, chips |
| `statement` | slide 2, context, proof, takeaway | kicker, headline, body, visual, note, info, `size: xl`, `align: center` |
| `step` | F02 steps | title, kicker, body, visual, note, info (auto-numbered, dots) |
| `item` | F03 list items | label, kicker, name, what, tool/icon, visual, example, tags |
| `qa` | F01 question → answer | q, persona, avatar, a |
| `prompt` | F09 prompts | label, kicker, title, tool, prompt (with `{vars}`), preview, tip |
| `versus` | F07 rounds | criterion, headline, `sides: [{label, text, verdict: good/bad/meh}]` |
| `scorecard` | F07 summary | cols, rows (true/false/text), winner, verdict |
| `quiz` | F08 guess / reveal | options [{text, is: AI/Human, why}], `reveal: true`, prompt |
| `flow` | F05 stages, F04 handoff | stage, headline, nodes [{kind: trigger/agent/action, title, sub, tool/icon}], result |
| `roster` | F04 team member | role, name, avatar, handles, tools, kpi |
| `org` | F04 team chart | top {name, image}, members [{name, role, image}] |
| `grid` | F10 mega grid | category, headline, items [{name, use, tool/icon, pick}] |
| `quote` | F01 best line | quote, by, role |
| `stat` | proof, the maths | stats [{value, label}] (last one is highlighted) |
| `recap` | save slide | items [{name, tool/icon}], flag |
| `news` | F12 | masthead, date, breaking, source, headline, tldr, visual |
| `list` | honest limits, rules | items [{title, text}] |
| `exchange` | F01 "try to break it" / attack rounds | kicker, headline, messages [{who, text, side}], verdict. Pair with `bg: cobalt` |
| `cta` | last slide | `style: comment` (keyword) · `question` (answers) · `save` |

Text markup in any field: `*emphasis*` · `**bold**` · `~~strike~~` · `{variable}` · `[[handwritten]]`.

## 8. Visuals (the picture half of a slide)

`image` (frame: plain · browser · phone · felt · bleed) · `chat` (whatsapp · imessage · instagram · call) ·
`claude` (Claude desktop) · `double` (The Double dashboard) · `n8n` (workflow canvas) · `gmail` · `sheet` ·
`notify` (lock-screen) · `rows` (icon list) · `code` (terminal) · `tools` (logo row) · `table` · `flow` ·
`cards` · `checklist` · `doc` (guide mockup) · `hub` (tool tiles → mockup → features, theaiagents style).
Any visual can take `caption:`. Tool logos come from Simple Icons by name (`claude`, `whatsapp`, `n8n`,
`gmail`, `googlesheets`, `notion` …); drop custom logos in `assets/logos/<name>.png`.

---

## 9. The 12 formats

| ID | Format | Handles | Job | Slides | Slide 2 | Ends with |
|---|---|---|---|---|---|---|
| F01 | Persona Clone | Founder, Company | show me | 8 | the best answer, first | comment CLONE |
| F02 | Step-by-Step Build | all | help me | 8 | the result working | comment keyword |
| F03 | Numbered List | all | help me | 7–8 | item #1 | recap → question (pick a number) |
| F04 | Team Roster | Founder | show me | 8 | org chart | comment TEAM |
| F05 | Automation Flow | Founder | show me | 8 | the stakes (old way) | comment SYSTEM |
| F06 | Use-Case Scenario | Company | show me | 8 | the moment (a time) | comment DOUBLE |
| F07 | Versus | Company, Agent Bro | signal | 7 | one-line definitions | question |
| F08 | Spot the AI | Company | play | 8 | round 1, unlabelled | question: your score |
| F09 | Prompt Pack | Agent Bro | help me | 7 | prompt #1 | comment PROMPTS |
| F10 | Mega Resource Grid | Agent Bro | help me | 6 | first category grid | comment keyword |
| F11 | Hot Take | Agent Bro | signal | 8 | what everyone believes | question: agree? |
| F12 | News Drop | Agent Bro | show me | 7 | TL;DR | question / follow |

Each `formats/F*.yaml` file holds the full slide-by-slide structure, rules, and a working scaffold.

---

## 10. Working

- **Studio:** `npm run studio` → http://localhost:4321. Pick a post, edit text in place (double-click),
  drag/zoom/replace images, pick a colour, read the checklist, **⬇ Download all** for a zip.
- **CLI export:** `npm run export -- posts/founder/x.yaml` or `npm run export -- --all` → `out/…/01.png`.
- **With Claude:** see `CLAUDE.md`. "Build Day 3 for all handles" → Claude reads the plan, picks formats,
  writes the YAML, exports and reviews.
- **Images to make:** `docs/ASSETS.md`.

## 11. Icons, characters and surfaces (v2)

- **3D clay icons** live in `assets/logos/<slug>.png` (brand logos, 45) and `assets/icons/` (chat, email,
  phone, globe, browser, database, cloud, pdf, video, contact, website, planner). They are used only where the
  icon **is the picture**: hero tiles on item slides, recap rows, tool rows and tiles, the mega grid, cover orbit.
- **Inside UI kits** (WhatsApp, Claude, n8n, Gmail, Sheets, notifications, code) logos stay flat (Simple Icons)
  and glyphs stay Phosphor, like the real apps. Generic `icon:` names in rows, cards and flows stay Phosphor.
- **Felt characters**: `assets/agents/` cobalt, tangerine, bubblegum, sky, grape, green, yellow, red, ink, snow.
  Company palette has matching `green`, `yellow`, `red`, `snow`. As chat or call avatars they sit whole in a
  tinted circle (`avatar: assets/agents/green.png`).
- **Company ground** is `#F8F8F8`. Extra marker presets: `mint`, `sky`.
- **`bg: cobalt`** on any slide: full-bleed #3452F0, white type, pink `#FF9BC8` emphasis (5:1 and 11:1 contrast).
  Built for the F01 attack exchange (`posts/company/f01-i-turned-myself-into-an-ai-agent.yaml`).
- **No clipped glyphs**: gradient headlines carry extra room above and below (engine/system.css). Tracking
  stays at or above −0.04em so letters never touch.
- **Available, not in use**: `engine/skins/folio.css`, the Codex look made font-agnostic (`font-emph`, tinted
  cards). Switch a brand with `design: folio` + a display font. The archive codex posts keep `codex.css`.

## 12. Free placement (studio)

Click any element on a slide (text, image, mockup, logo, mascot) to select it. Drag to move, drag a corner
or scroll to resize, **↑ / ↓ / Front / Back** to change layers, arrow keys nudge (Shift = 10 px), Alt-click
picks the parent, **Crop** pans/zooms a picture inside its frame, **Reset** returns it to the layout.
Saved per slide as `move: { headline: { x, y, s, z }, image: {…} }` and applied on export too.
Cut-out images are never cropped by their box.

## 13. Cover styles v2 (`layout: cover`, `style: …`)

See them all in `posts/lab/covers-{company,founder,agentbro}.yaml` and copy a slide as a post's cover.

| style | After | Best for | Fields |
|---|---|---|---|
| `split` | wellbeing "7 biomarkers" | Company | headline (`*rest*` = light serif italic), sub, image (bleeds right; `side: left`), corner labels `label` `label_r` `foot` `foot_r` |
| `vs` | wellbeing "boosters vs killers" | Company F07/F08 | `a: {text, image, color}`, `b: {…}`, `joiner`, corner labels |
| `scatter` | wellbeing "B12 menu" | Company F03 | headline, sub, `items: [{image or tool, label, x, y, size, rot}]` (defaults ring the edge) |
| `pair` | theonlyworkshop · aiwithanushka | all (F02 "Give X a Y") | kicker, headline, sub, `pair: [tool or image, …]`, `joiner: "×" or "→"`, `labels: true`, optional `visual` |
| `banner` | aiagently "WHATSAPP AI AGENT" | Founder, Agent Bro | kicker (handwritten), `tool` (inline tile), headline (caps), tagline, image (person), logos, `color` |
| `count` | aiagently "4 AI Agents" | Founder, Agent Bro F03 | number, kicker (line 1), headline (line 2), image, logos (3D, floating) |
| `guide` | theaiagents "best Guide" | Agent Bro, Founder | `tool` + `tool_label`, headline (`*big words*`), image, `chips: [tools]`, `checklist`, `tag` |

Company covers never use a person: use felt agents and scenes. A missing photo shows a soft silhouette.

## 14. Account identities (v3)

| | Company | Founder | Agent Bro |
|---|---|---|---|
| Look | off-white, centred, editorial | white, left-aligned "founder's notebook" | "the lab": engineering grid, mono `// labels` |
| Type | Inter Tight 600 + DM Mono | Poppins 700 + DM Mono labels | Satoshi 900 + JetBrains Mono |
| Colour | ink + lime marker (+ `bg: cobalt` slides) | cobalt shine; lime only on the keyword | red emphasis; `mode: light` (default) or `mode: dark` |
| Signature | felt agents, editorial slides | visuals on a cobalt-tint panel, giant outlined step number, quote + CTA on full cobalt | red square wordmark, red quest tag, hairline cards, white/ink next pill |
| Files | `engine/skins/calm.css` | `skins/bold.css` + `brands/thedouble-founder/skin.css` | `skins/quest.css` + `brands/agentbro/skin.css` |

Safety: every save keeps the previous version in `.history/`; the studio has Undo (Ctrl+Z), Redo and History.
Switching a cover's style never drops the cover's own words or image.

## 15. The Double design system (Company + Founder)

Source: `DoubleDesignSystem.html` (+ `_files/`). Assets sorted into `assets/brand/` (logos, washes, textures,
stages, objects, scenes, characters). Shared layer: `engine/double.css`. Agent Bro is not The Double; it keeps "the lab".
Values in that layer come from the shared repo via `npm run sync:tokens` (`brands/_shared/thedouble/`); see
`docs/DESIGN-TOKENS.md` for the update workflow and what stays local.

- **Type:** Funnel Display 700 (−3.5%) headlines · ONE Newsreader italic phrase per headline (`*phrase*`) ·
  Geist body · Geist Mono labels (+10%) · Silkscreen status chips (`tag:`).
- **Italic colour:** cobalt on light · lime on cobalt · `#A9B6FF` on deep (automatic).
- **Capability colours** = what a slide is about, in setup order: knowledge grape `#6A2CF5` · personality
  bubblegum `#FF4FAE` · voice sky `#16B0FA` · channels cobalt `#2F43F2` · actions tangerine `#FF7417`.
  Per slide: `cap: voice` (or `cap: none`). Whole post: `rhythm: capabilities` (inner slides cycle in order).
  A slide with an agent `color:` (roster, badge) uses that capability.
- **Grounds:** linen `#F6F4EF` (default) · capability (Company = pigment **wash**; Founder = flat **soft tint**
  plus ONE full-strength block holding the visual) · `bg: cobalt` (covers, CTAs, attack slides) · `bg: deep` (Night:
  `#151B55` + 18px grid). CTAs on Double handles are automatically cobalt with a lime "KEYWORD →" button.
- **Lime means live:** squares, chips, the CTA button. Never a ground. No green, no yellow, no lavender.
- **Founder's own taste:** left-aligned, first person, big solid step numbers, cobalt covers with the face in a
  stage light, his face as a sticker on each slide's bold block (`face:` in brand.yaml; `face: false` per post or
  slide, e.g. a persona clone like Chanakya). `bg: paper` keeps a cover light when the photo has its own background.

### Colour budget per carousel (v2, applies to Company + Founder)
- Cobalt only for the cover (optional), quotes and the final CTA. Never several cobalt slides in a row.
- `rhythm: capabilities` colours the **parallel middle only** (step, item, prompt, roster, flow); other slides stay linen.
- A wash/tint marks one idea; calm linen between them. Night (`bg: deep`) once per post at most, for an AI/night moment.
- Small type on a wash sits on a white panel. Emphasis inside body text is always the readable cobalt italic.
