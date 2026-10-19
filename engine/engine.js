// Carousel engine: brand loading, post → slides HTML, text fitting, and the swipe checklist.
import YAML from '/node_modules/yaml/browser/index.js';
import { md, esc, words, initLibraries } from './core.js';
import { visual } from './visuals.js';
import { LAYOUTS } from './layouts.js';

export { YAML };

const brandCache = {};

/** Load brands/<id>/brand.yaml, inject its fonts, tokens and skin. Returns the brand object. */
export async function loadBrand(id) {
  if (brandCache[id]) return brandCache[id];
  const brand = YAML.parse(await (await fetch(`/brands/${id}/brand.yaml`)).text());
  brand.id = id;
  // Wait for each font stylesheet, otherwise the first slides can be captured before their fonts exist.
  await Promise.all((brand.fonts || []).map((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return null;
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    const loaded = new Promise((r) => { link.onload = link.onerror = r; });
    document.head.appendChild(link);
    return loaded;
  }));
  const vars = Object.entries(brand.tokens || {}).map(([k, v]) => `--${k}:${v};`).join('');
  document.head.insertAdjacentHTML('beforeend', `<style data-brand="${id}">.b-${id}{${vars}}</style>`);
  // Design language (engine/skins/<design>.css) + optional brand-specific skin.css on top.
  for (const href of [brand.design && `/engine/skins/${brand.design}.css`].filter(Boolean)) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    const loaded = new Promise((r) => { link.onload = link.onerror = r; });
    document.head.appendChild(link);
    await loaded;
  }
  // Optional shared design-system tokens (`shared:` in brand.yaml). Generated from the shared repo by
  // scripts/sync-design-tokens.mjs; it defines the --ds-* variables consumed by engine/double.css.
  for (const href of [].concat(brand.shared || []).filter(Boolean)) {
    const url = href.startsWith('/') ? href : `/${href}`;
    if (document.querySelector(`link[href="${url}"]`)) continue;
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url });
    const loaded = new Promise((r) => { link.onload = link.onerror = r; });
    document.head.appendChild(link);
    await loaded;
  }
  // The design-system layer (engine/system.css) always loads after every skin so its rhythm rules win.
  for (const href of ['/engine/system.css', '/engine/covers.css', '/engine/editorial.css', '/engine/double.css']) {
    let sys = document.querySelector(`link[data-system="${href}"]`);
    if (!sys) {
      sys = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      sys.dataset.system = href;
      const loaded = new Promise((r) => { sys.onload = sys.onerror = r; });
      document.head.appendChild(sys);
      await loaded;
    } else document.head.appendChild(sys);
  }
  // The brand's own skin comes last, so a handle's identity (brands/<id>/skin.css) wins over shared layers.
  if (brand.skin && !document.querySelector(`link[href="/${brand.skin}"]`)) {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `/${brand.skin}` });
    const loaded = new Promise((r) => { link.onload = link.onerror = r; });
    document.head.appendChild(link); await loaded;
  }
  await initLibraries();
  return (brandCache[id] = brand);
}

function brandMark(brand) {
  return brand.logo ? `<img class="brand-mark" src="/${esc(brand.logo)}" alt="">` : `<span class="brand-mark text">${esc(brand.name)}</span>`;
}

/**
 * Per-post colour override. `theme: { accent: "#16A34A", highlight: "#FFD60A" }` in a post (or a
 * named preset from brand.accents) re-tints every shade that derives from it.
 */
export function themeStyle(post, brand) {
  let t = post.theme;
  if (typeof t === 'string') t = brand.accents?.[t] || { accent: t };
  if (!t) return '';
  const v = [];
  if (t.accent) {
    const a = t.accent;
    v.push(`--accent:${a}`, `--accent-deep:color-mix(in srgb, ${a} 45%, #0B0B10)`, `--glow:color-mix(in srgb, ${a} 17%, transparent)`, `--note:${a}`,
      `--chip:color-mix(in srgb, ${a} 9%, white)`, `--accent-ink:${t.accent_ink || '#FFFFFF'}`);
    if (brand.emphasis !== 'underline') v.push(`--hi:${a}`, `--hi-soft:color-mix(in srgb, ${a} 13%, white)`);
  }
  if (t.highlight) v.push(`--hi:${t.highlight}`, `--hi-soft:color-mix(in srgb, ${t.highlight} 30%, white)`);
  if (t.ground) v.push(`--ground:${t.ground}`);
  if (t.ink) v.push(`--ink:${t.ink}`);
  return v.join(';');
}

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = (n) => ROMAN.reduce((out, [v, r]) => { while (n >= v) { out += r; n -= v; } return out; }, '');

// The Double's five capabilities, in setup order (DoubleDesignSystem › Color). A slide's capability sets its
// colour job: --cap (full strength), --cap-soft (tint ground), --cap-ink (text on the full colour).
export const CAPS = {
  knowledge: ['#6A2CF5', '#E9E1FF', '#FFFFFF', 'grape'],
  personality: ['#FF4FAE', '#FFDDEF', '#15172B', 'bubblegum'],
  voice: ['#16B0FA', '#D5EEFB', '#15172B', 'sky'],
  channels: ['#2F43F2', '#DEE2FF', '#FFFFFF', 'cobalt'],
  actions: ['#FF7417', '#FFE4D1', '#15172B', 'tangerine'],
};
const CAP_ORDER = Object.keys(CAPS);
// The rhythm colours the parallel middle (the steps / items), not every slide: one wash per idea, calm ground between.
const RHYTHM_LAYOUTS = new Set(['step', 'item', 'prompt', 'law', 'roster', 'flow']);
const CAP_ALIAS = { grape: 'knowledge', bubblegum: 'personality', sky: 'voice', cobalt: 'channels', tangerine: 'actions' };

/** Render a parsed post. Returns an HTML string of <section class="slide"> elements. */
export function renderPost(post, brand) {
  const slides = post.slides || [];
  const n = slides.length;
  const stepTotal = slides.filter((s) => s.layout === 'step').length;
  let stepNo = 0, itemNo = 0;
  const theme = themeStyle(post, brand);
  const rules = brand.rules || {};
  // Capability rhythm (`rhythm: capabilities` on the post or brand): inner slides take the five capability
  // colours in setup order; a slide's own `cap:` wins, `cap: none` opts out. Cover and the final CTA keep theirs.
  const rhythm = (post.rhythm ?? brand.rhythm) === 'capabilities';
  let capI = 0;
  const face = post.face ?? brand.face;
  return slides.map((s, i) => {
    const layout = LAYOUTS[s.layout] ? s.layout : 'statement';
    const isInner = i > 0 && !(i === n - 1 && layout === 'cta');
    // a slide that already carries a capability colour (a roster agent, a badge) keeps it as its ground
    const own = isInner ? CAP_ALIAS[s.color] || (CAPS[s.color] ? s.color : null) : null;
    let cap = s.cap === 'none' ? null : CAP_ALIAS[s.cap] || s.cap || own || (rhythm && isInner && !s.bg && RHYTHM_LAYOUTS.has(layout) ? CAP_ORDER[capI++ % 5] : null);
    if (cap && !CAPS[cap]) cap = null;
    const capVars = cap ? `--cap:${CAPS[cap][0]};--cap-soft:${CAPS[cap][1]};--cap-ink:${CAPS[cap][2]};` : '';
    const faceVar = face && s.face !== false ? `--face:url(/${esc(s.face || face)});` : '';
    if (layout === 'step') stepNo++;
    if (['item', 'prompt', 'roster', 'law'].includes(layout)) itemNo++;
    const k = `slides.${i}`;
    const c = {
      brand, post, i, n, k, stepNo, stepTotal, itemNo, brandMark: brandMark(brand),
      // World vocabulary + numbering: brand.yaml `lexicon: { step: Folio, item: Law, prompt: Loot }`, `numerals: roman`.
      lex: (key, fallback) => post.lexicon?.[key] ?? brand.lexicon?.[key] ?? fallback,
      num: (x) => (brand.numerals === 'roman' && Number.isFinite(Number(x)) ? roman(Number(x)) : String(x).padStart(2, '0')),
      T: (field, cls = '', tag = 'div') => (s[field] == null || s[field] === '' ? '' : `<${tag} class="${cls}" data-k="${k}.${field}">${md(s[field])}</${tag}>`),
      V: (v, field = 'visual') => visual(v, c, `${k}.${field}`),
    };
    let inner;
    try { inner = LAYOUTS[layout](s, c); } catch (e) { inner = `<div class="render-error">Slide ${i + 1} (${esc(layout)}): ${esc(e.message)}</div>`; }
    const isCover = layout === 'cover';
    const counter = brand.numerals === "roman" ? `${roman(i + 1)} · ${roman(n)}` : `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
    const series = isCover ? null : (s.series ?? post.series);
    // Research: early brand appearance lowers engagement, so the cover carries no logo.
    const top = `<header class="chrome-top">${isCover ? '<span></span>' : c.brandMark}${series ? `<span class="series">${md(series)}</span>` : ''}${isCover ? '<span></span>' : `<span class="counter">${counter}</span>`}</header>`;
    const arrow = '<i class="ic" style="--src:url(/node_modules/@phosphor-icons/core/assets/bold/arrow-right-bold.svg)"></i>';
    const swipe = i < n - 1 ? (isCover ? `<span class="swipe">${esc(s.swipe || post.swipe || 'Swipe')}${arrow}</span>` : `<span class="swipe mini">${arrow}</span>`) : '';
    // "Next: …" teaser: an open loop at the bottom of every middle slide (aiagently pattern).
    const nx = slides[i + 1];
    let next = s.next;
    if (next === undefined && post.auto_next !== false && nx && !isCover && i > 0 && ['step', 'item', 'prompt', 'roster', 'qa'].includes(nx.layout)) {
      const label = nx.layout === 'step' ? `${nx.label || c.lex('step', 'Step')} ${c.num(stepNo + 1).replace(/^0/, '')}` : nx.layout === 'qa' ? c.lex('next_qa', 'Next question') : c.lex('next', 'Next');
      const t = String(nx.title || nx.name || nx.q || '').replace(/[*~{}[\]]/g, '');
      // Cut at a word boundary so the teaser never ends mid-word ("smarter th…").
      const short = t.length > 34 ? t.slice(0, 34).replace(/\s+\S*$/, '').replace(/[\s,:;·-]+$/, '') + '…' : t;
      next = t ? `${label}: ${short}` : null;
    }
    const nextHtml = next ? `<span class="next-teaser"><span class="nt-ic">${arrow}</span><span data-k="${k}.next">${md(next)}</span></span>` : '';
    // Recurring character: post-level `mascot:` image shows on middle slides; a slide's `says:` gives it a line.
    const m = s.mascot === false || rules.mascot === false ? null : (s.mascot || post.mascot);
    const showMascot = m && (s.says || (!isCover && layout !== 'cta'));
    const left = showMascot
      ? `<span class="mascot" data-el="${k}.mascot"><img src="/${esc(m.image || m)}" alt="">${s.says ? `<span class="bubble" data-k="${k}.says">${md(s.says)}</span>` : ''}</span>`
      : `<span class="handle">${esc(brand.handle || '')}</span>`;
    const bottom = `<footer class="chrome-bottom">${left}${nextHtml}<span class="foot-right"><span class="counter-b">${isCover ? '' : counter}</span>${swipe}</span></footer>`;
    const bg = s.bg ? `bg-${s.bg}` : '';
    const bgImg = s.background ? `<img class="slide-bg" src="/${esc(s.background)}" alt="">` : '';
    // A stamp / seal / badge pressed onto the slide (world artifact): `stamp: "Sealed"`.
    const stamp = s.stamp ? `<span class="stamp" data-k="${k}.stamp">${md(s.stamp)}</span>` : '';
    // Free placement from the studio: `move: { headline: {x, y, s, z}, image: {…} }` (see applyMoves).
    const moves = s.move ? ` data-move="${esc(JSON.stringify(s.move))}"` : '';
    return `<section class="slide b-${brand.id} sk-${brand.design || 'base'} L-${layout} mode-${s.mode || post.mode || brand.mode || 'light'} ${cap ? `has-cap cap-${cap}` : ''} ${faceVar ? 'has-face' : ''} ${bg} ${next ? 'has-next' : ''} ${showMascot ? 'has-mascot' : ''} emph-${brand.emphasis || 'serif'}" data-i="${i}"${moves} style="${theme}${theme ? ';' : ''}${capVars}${faceVar}">${bgImg}${top}<div class="body">${inner}</div>${stamp}${bottom}</section>`;
  }).join('');
}

/** Load every font face the slides actually use, so text is never captured before its font. */
async function loadFonts(root) {
  const specs = new Set();
  for (const el of root.querySelectorAll('.slide *')) {
    if (!el.firstChild || el.firstChild.nodeType !== 3) continue;
    const cs = getComputedStyle(el);
    specs.add(`${cs.fontStyle} ${cs.fontWeight} 40px ${cs.fontFamily}`);
  }
  await Promise.all([...specs].map((f) => document.fonts.load(f).catch(() => null)));
  await document.fonts.ready;
}

/** Height of an element's in-flow children (ignores the box's own padding / flex growth). */
function contentHeight(box) {
  const kids = [...box.children].filter((k) => getComputedStyle(k).position !== 'absolute');
  if (!kids.length) return 0;
  return kids.at(-1).offsetTop + kids.at(-1).offsetHeight - kids[0].offsetTop;
}

/** True when the slide's in-flow content is taller than its body. Uses layout boxes, so rotated notes don't count. */
function stackOverflows(body) {
  const st = body.firstElementChild;
  if (!st) return false;
  let bottom = 0;
  for (const ch of st.children) if (getComputedStyle(ch).position !== 'absolute') bottom = Math.max(bottom, ch.offsetTop + ch.offsetHeight);
  return bottom > st.clientHeight + 1;
}

/** Shrink every .fit element until its slide stops overflowing, then scale visuals into their area. */
export async function fitText(root) {
  await loadFonts(root);
  const areas = [...root.querySelectorAll('.vis-area, .preview')];
  areas.forEach((a) => { a.style.overflow = 'hidden'; const v = a.querySelector(':scope > .visual'); if (v) v.style.transform = ''; });
  for (const el of root.querySelectorAll('.giant')) {
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize), guard = 40;
    // a giant cover number shrinks to fit both the width and the space left under the headline
    const slide = el.closest('.slide'), sb = () => slide.getBoundingClientRect(), k = sb().height / slide.offsetHeight || 1;
    const tooLow = () => (sb().bottom - el.getBoundingClientRect().bottom) / k < 56;
    while ((el.scrollWidth > el.clientWidth + 1 || tooLow()) && guard--) { size *= 0.94; el.style.fontSize = `${size}px`; }
  }
  for (const el of root.querySelectorAll('.fit')) {
    el.style.fontSize = '';
    const slide = el.closest('.slide'); const body = slide.querySelector('.body');
    const coverText = el.closest('.cv-text');
    let size = parseFloat(getComputedStyle(el).fontSize); const min = size * 0.45;
    const clips = getComputedStyle(el).overflow !== 'visible'; // only boxes that clip (answer cards, prompt bodies)
    const over = coverText
      ? () => contentHeight(coverText) > slide.offsetHeight * (coverText.closest('.cv-type') ? 0.62 : 0.4) || el.scrollWidth > el.clientWidth + 1
      : () => stackOverflows(body) || el.scrollWidth > el.clientWidth + 1 || (clips && el.scrollHeight > el.clientHeight + 2);
    let guard = 40;
    while (over() && size > min && guard--) { size *= 0.95; el.style.fontSize = `${size}px`; }
  }
  // Visuals with intrinsic height (chats, rows, tables) zoom to fill their area: the visual is laid out
  // narrower (width ÷ s) and scaled up by s, so a small card grows its text instead of floating in empty
  // space (references: the mockup spans ~90% of the slide). Dense visuals shrink the same way.
  for (const area of areas) {
    const v = area.querySelector(':scope > .visual');
    if (v && !v.classList.contains('vk-image')) { zoomToFill(v, area); hugPanel(v, area); }
    area.style.overflow = '';
  }
  applyMoves(root);
}

/** The element a slide-relative key ("headline", "image", "logos.0", "visual") points at. */
export function movable(section, key) {
  const k = `slides.${section.dataset.i}.${key}`;
  return section.querySelector(`[data-el="${k}"], [data-img="${k}"], [data-k="${k}"]`);
}

/**
 * Apply studio placement on top of the layout. Uses the individual `translate` / `scale` properties so it
 * composes with any transform the design already has (rotated stickers, zoomed visuals). z sets the layer.
 */
export function applyMoves(root) {
  for (const sec of root.querySelectorAll('.slide[data-move]')) {
    let moves; try { moves = JSON.parse(sec.dataset.move); } catch { continue; }
    for (const [key, m] of Object.entries(moves || {})) {
      const el = movable(sec, key); if (!el || !m) continue;
      el.style.translate = m.x || m.y ? `${m.x || 0}px ${m.y || 0}px` : '';
      el.style.scale = m.s && m.s !== 1 ? String(m.s) : '';
      if (m.z != null) { el.style.zIndex = m.z; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; }
    }
  }
}

/** A visual area drawn as a panel (it has a background) shrinks to wrap its mockup, so it never shows
    a big empty tinted box around a small card. */
function hugPanel(v, area) {
  area.style.height = ''; area.style.removeProperty('flex');
  const cs = getComputedStyle(area);
  if (!area.classList.contains('vis-area') || cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent') return;
  const k = area.getBoundingClientRect().height / area.offsetHeight || 1;
  const h = v.getBoundingClientRect().height / k + (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  if (h < area.offsetHeight - 24) { area.style.setProperty('flex', 'none', 'important'); area.style.height = `${Math.ceil(h)}px`; }
}

/** Largest scale s (≤ max) at which the visual, laid out at areaWidth / s, fits its area. */
function zoomToFill(v, area) {
  v.style.width = ''; v.style.transform = ''; v.style.maxWidth = 'none'; v.style.flex = 'none';
  // .vis-area centres its visual (scale from the centre); .preview stacks it under a label (scale from the top).
  const centred = area.classList.contains('vis-area');
  v.style.marginInline = 'auto'; v.style.transformOrigin = centred ? 'center center' : 'top center';
  // measure the area's content box: a panel with padding (Founder) must keep the mockup inside it
  const cs = getComputedStyle(area), px = (n) => parseFloat(cs[n]) || 0;
  const W = area.clientWidth - px('paddingLeft') - px('paddingRight');
  const r = area.getBoundingClientRect(), k = r.height / area.offsetHeight || 1; // the studio shows slides scaled
  const H = (centred ? area.clientHeight - px('paddingTop') - px('paddingBottom') : (r.bottom - v.getBoundingClientRect().top) / k) - 8;
  const max = v.dataset.grow === 'false' ? 1 : Number(v.dataset.grow) || 1.45;
  const fits = (s) => {
    v.style.width = `${W / s}px`;
    const w = Math.max(1, v.scrollWidth, ...[...v.children].map((ch) => ch.scrollWidth));
    return v.scrollHeight * s <= H && w * s <= W + 1;
  };
  let lo = 0.35, hi = max;
  if (fits(hi)) lo = hi;
  else for (let i = 0; i < 9; i++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
  if (Math.abs(lo - 1) < 0.02) { v.style.width = ''; return; }
  fits(lo);
  v.style.transform = `scale(${lo})`;
}

export async function waitImages(root) {
  await Promise.all([...root.querySelectorAll('img')].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
}

// ------------------------------------------------------------------ swipe checklist
// Rules from the Instagram motivation study (docs/CAROUSEL-BRIEF.md §2). level: bad | warn | tip | ok
const HYPE = /\b(revolutionary|unleash|game[- ]?changer|insane|mind[- ]?blowing|you won'?t believe|shocking|secret they|!!)/i;
const LABEL_HOOK = /^(how to|tips for|guide to|all about|introduction|intro to)\b/i;

export function lint(post, brand = {}) {
  const out = [];
  const add = (level, msg, slide) => out.push({ level, msg, slide });
  const slides = post.slides || [];
  const n = slides.length;
  if (!n) return [{ level: 'bad', msg: 'No slides yet.' }];

  // Length: 5–8 is the safest range; longer only if every slide earns the swipe.
  if (n < 5) add('warn', `${n} slides. 5–8 is the research sweet spot. Too short and there's no reveal.`);
  else if (n <= 8) add('ok', `${n} slides, inside the 5–8 sweet spot.`);
  else if (n <= 10) add('tip', `${n} slides. Fine if every slide pays off; cut any slide that only repeats.`);
  else add('warn', `${n} slides. Above 10, drop-off climbs. Split into two posts or merge slides.`);

  // Cover: a concrete promise, readable at thumbnail size, with a face or object.
  const cv = slides[0];
  if (cv.layout !== 'cover') add('warn', 'Slide 1 is not a cover layout.', 0);
  const hw = words(cv.headline);
  if (hw > 10) add('warn', `Cover headline is ${hw} words. Aim for ≤ 8 so it reads as a thumbnail.`, 0);
  else if (hw) add('ok', `Cover headline: ${hw} words.`, 0);
  if (LABEL_HOOK.test(String(cv.headline || ''))) add('tip', 'Cover reads like a topic label. Promise a result, contrast or mistake instead.', 0);
  if (!/\*/.test(String(cv.headline || ''))) add('tip', 'Mark one word or phrase with *stars* on the cover for a single emphasis point.', 0);
  if (cv.layout === 'cover' && !cv.image && !['type', 'number', 'pair', 'scatter', 'vs'].includes(cv.style)) add('tip', 'Faces with direct gaze stop the scroll. Add a cut-out or object.', 0);
  // A count is the strongest hook on a cover ("5 AI agents…"): show it as a giant numeral, not inline text.
  const lead = String(cv.headline || '').replace(/[*~]/g, '').match(/^\s*(\d[\d,.]*\+?)\s/);
  if (cv.layout === 'cover' && lead && cv.style !== 'number') add('tip', `Cover starts with "${lead[1]}". Use style: number with number: "${lead[1]}" and drop it from the headline. The count reads big.`, 0);

  // Slide 2 is a second cover: Instagram may re-serve the post opening on it.
  const s2 = slides[1];
  if (s2) {
    const h2 = s2.headline || s2.title || s2.name || s2.q || '';
    const w2 = words(h2);
    if (!h2) add('warn', 'Slide 2 has no headline. It gets re-served as a cover, so it must stand alone.', 1);
    else if (w2 > 14) add('warn', `Slide 2 headline is ${w2} words. Keep it ≤ 12. It doubles as a cover.`, 1);
    else add('ok', 'Slide 2 has a standalone headline.', 1);
    if (/^(in this (post|carousel)|here'?s what|let'?s (dive|start)|before we (start|begin))/i.test(String(h2))) add('warn', 'Slide 2 opens with setup. Lead with proof, a choice, or a question instead.', 1);
  }

  // Cognitive load: one idea per slide.
  slides.forEach((s, i) => {
    const text = JSON.stringify(s).replace(/"(layout|image|avatar|src|tool|icon|color|style|frame|bg|background|kind|from|time|label|tools|chips|logos)":"[^"]*"/g, '');
    const w = words(text.replace(/[{}[\]",:]/g, ' ').replace(/\b(headline|title|body|text|kicker|sub|note|visual|rows|name|what|example|q|a|prompt|tip|items|value)\b/g, ''));
    if (w > 80) add('warn', `Slide ${i + 1} has ~${w} words. Dense slides kill the swipe. Split it or cut it.`, i);
  });

  // Ending: a light CTA. A question, a save cue or a keyword. No hard sell.
  const last = slides[n - 1];
  if (last.layout !== 'cta' && last.layout !== 'recap') add('tip', 'End on a CTA: a question, a save cue, or a comment keyword.', n - 1);
  else if (last.layout === 'cta') add('ok', last.keyword ? `CTA: comment "${last.keyword}".` : 'CTA asks a question.', n - 1);
  if (!slides.some((s) => s.layout === 'recap') && slides.filter((s) => ['item', 'step', 'prompt'].includes(s.layout)).length >= 4) add('tip', 'Add a recap slide before the CTA. It\'s the screenshot-and-save slide.');

  // Imagery rules per handle (brand.yaml → rules).
  const rules = brand.rules || {};
  if (rules.cover === 'person' && cv.layout === 'cover' && !cv.image) add('warn', `Cover needs the real ${brand.name === 'Founder' ? "founder's" : "creator's"} cut-out photo, looking at the camera.`, 0);
  if (rules.cover === 'person' && cv.image && /assets\/agents|image-assets\//.test(cv.image)) add('tip', 'Cover uses a stand-in image. Swap in the real photo before posting.', 0);
  if (rules.mascot === false && (post.mascot || slides.some((s) => s.mascot))) add('warn', `${brand.name} posts don't use mascots or felt characters. Only his own photos.`);
  if (rules.people === false && slides.some((s) => /assets\/people\//.test(JSON.stringify(s)))) add('warn', 'Company posts use felt agents, never real people.');
  if (brand.name && new RegExp(brand.name, 'i').test(String(cv.headline || '') + String(cv.kicker || ''))) add('tip', 'Brand name on the cover: research says early brand appearance lowers engagement. Save it for the CTA.', 0);

  // Tone: hype and clickbait lower reactions after the click.
  // (quoted messages from someone else, e.g. the attacker in an exchange, are allowed to shout)
  slides.forEach((s, i) => { const own = s.layout === 'exchange' ? { ...s, messages: (s.messages || []).filter((m) => m.side === 'left') } : s; const m = JSON.stringify(own).match(HYPE); if (m) add('warn', `Slide ${i + 1}: "${m[0]}" reads as hype or clickbait.`, i); });

  return out;
}

/** Parse YAML text safely. */
export function parsePost(text) {
  const doc = YAML.parseDocument(text);
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  return { doc, post: doc.toJS() || {} };
}
