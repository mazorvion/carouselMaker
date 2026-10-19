// Sync the Double design tokens from the shared design-system repository.
//
//   npm run sync:tokens                 fetch main and regenerate the local bridge
//   npm run sync:tokens -- --ref <ref>  sync a branch or tag
//   npm run sync:tokens -- --check      fail if the vendored copy is out of date
//   npm run sync:tokens -- --offline    regenerate from the vendored tokens.json
//
// The shared repo is private, so this uses git (and your existing credentials) instead of raw HTTP.
// Set SHARED_DESIGN_SYSTEM_DIR to an existing clone to skip cloning, or
// SHARED_DESIGN_SYSTEM_REPO / SHARED_DESIGN_SYSTEM_REF to override the defaults.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'brands', '_shared', 'thedouble');
const SOURCE_FILE = path.join(OUT_DIR, 'tokens.json');
const CSS_FILE = path.join(OUT_DIR, 'design-tokens.css');
const META_FILE = path.join(OUT_DIR, 'design-tokens.meta.json');

const SOURCE_URL = 'https://github.com/cardtree-bulkbeings/shared-design-system';
const REPO_URL = process.env.SHARED_DESIGN_SYSTEM_REPO || `${SOURCE_URL}.git`;
const DEFAULT_REF = process.env.SHARED_DESIGN_SYSTEM_REF || 'main';
const UPSTREAM_FILE = 'project/tokens.json';

const args = process.argv.slice(2);
const check = args.includes('--check');
const offline = args.includes('--offline');
const ref = option('--ref') || DEFAULT_REF;

function option(name) {
  const i = args.indexOf(name);
  if (i >= 0) return args[i + 1];
  const inline = args.find((a) => a.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
}

const sha = (text) => createHash('sha256').update(text).digest('hex');
const canonical = (text) => JSON.stringify(JSON.parse(text));
const digest = (text) => sha(canonical(text));
const withNewline = (text) => (text.endsWith('\n') ? text : `${text}\n`);

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

async function read(file) {
  try { return await fs.readFile(file, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}

async function readUpstream() {
  const local = process.env.SHARED_DESIGN_SYSTEM_DIR;
  if (local) {
    const text = await fs.readFile(path.join(local, UPSTREAM_FILE), 'utf8');
    let commit = 'local';
    try { commit = git(['rev-parse', 'HEAD'], local); } catch { /* a plain exported folder has no git metadata */ }
    return { text, commit };
  }
  if (offline) {
    const text = await read(SOURCE_FILE);
    if (!text) throw new Error(`No vendored ${path.relative(ROOT, SOURCE_FILE)}. Run npm run sync:tokens once with access to the shared repo.`);
    const meta = await readJson(META_FILE);
    return { text, commit: meta?.commit || 'offline' };
  }
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'carousel-shared-ds-'));
  try {
    git(['clone', '--quiet', '--depth', '1', '--branch', ref, REPO_URL, tmp]);
    const text = await fs.readFile(path.join(tmp, UPSTREAM_FILE), 'utf8');
    return { text, commit: git(['rev-parse', 'HEAD'], tmp) };
  } catch (e) {
    const detail = String(e.stderr || e.message || e).trim();
    throw new Error(`Could not read ${SOURCE_URL} at "${ref}".\n${detail}\nSet SHARED_DESIGN_SYSTEM_DIR to an existing clone if the repo is not reachable.`);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

async function readJson(file) {
  const text = await read(file);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

/** Resolve {grape} references and pick the light value when a token has themes. */
function makeResolver(colorTokens) {
  const byName = new Map(colorTokens.map((t) => [t.name, t]));
  const resolve = (value) => {
    if (typeof value === 'string') {
      return value.replace(/\{([^}]+)\}/g, (_, name) => {
        const token = byName.get(name);
        if (!token) throw new Error(`Unknown token reference {${name}}`);
        return resolve(token.value);
      });
    }
    if (value && typeof value === 'object') {
      if (typeof value.light === 'string') return value.light;
      if (typeof value.dark === 'string') return value.dark;
      throw new Error(`Unsupported token value: ${JSON.stringify(value)}`);
    }
    throw new Error(`Unsupported token value: ${JSON.stringify(value)}`);
  };
  return resolve;
}

function generateCss(tokens, { commit, sourceDigest }) {
  if (!tokens.color?.tokens || !tokens.spacing?.tokens || !tokens.radius?.tokens) {
    throw new Error('Unexpected tokens.json shape: expected color, spacing and radius token lists.');
  }
  const resolve = makeResolver(tokens.color.tokens);
  const groups = [
    ['Color (light theme)', tokens.color.tokens],
    ['Spacing (4px grid)', tokens.spacing.tokens],
    ['Radius', tokens.radius.tokens],
    ['Shadow', tokens.shadow?.tokens || []],
  ];
  const lines = [];
  for (const [label, list] of groups) {
    if (!list.length) continue;
    lines.push(`  /* ${label} */`);
    for (const token of list) lines.push(`  --ds-${token.name}: ${resolve(token.value)};`);
    lines.push('');
  }
  const families = tokens.type?.families || {};
  if (Object.keys(families).length) {
    lines.push('  /* Type families (fonts stay loaded from Google Fonts in the brand YAML) */');
    for (const [name, value] of Object.entries(families)) lines.push(`  --ds-font-${name}: ${value};`);
    lines.push('');
  }
  return `/* ==========================================================================
   GENERATED FILE - do not edit by hand.
   Source: ${SOURCE_URL}
   Ref: ${ref} @ ${commit}
   Source file: ${UPSTREAM_FILE}
   Source sha256 (canonical JSON): ${sourceDigest}
   Regenerate: npm run sync:tokens
   Consumed by: engine/double.css for .b-thedouble-company and .b-thedouble-founder
   ========================================================================== */

:is(.b-thedouble-company, .b-thedouble-founder) {
${lines.join('\n').replace(/\n+$/, '')}
}
`;
}

function makeMeta({ commit, sourceDigest }) {
  return {
    source: SOURCE_URL,
    repo: REPO_URL,
    ref,
    commit,
    sourceFile: UPSTREAM_FILE,
    tokensSha256: sourceDigest,
    generator: 'scripts/sync-design-tokens.mjs',
    outputs: [
      'brands/_shared/thedouble/tokens.json',
      'brands/_shared/thedouble/design-tokens.css',
    ],
    note: 'Generated by npm run sync:tokens. Do not edit these files by hand.',
  };
}

async function main() {
  const upstream = await readUpstream();
  const tokens = JSON.parse(upstream.text);
  const sourceDigest = digest(upstream.text);
  const css = generateCss(tokens, { commit: upstream.commit, sourceDigest });
  const meta = `${JSON.stringify(makeMeta({ commit: upstream.commit, sourceDigest }), null, 2)}\n`;
  const source = withNewline(upstream.text);

  if (check) {
    const [localSource, localCss, localMeta] = await Promise.all([read(SOURCE_FILE), read(CSS_FILE), read(META_FILE)]);
    const stale = [];
    if (!localSource || digest(localSource) !== sourceDigest) stale.push(path.relative(ROOT, SOURCE_FILE));
    if (localCss !== css) stale.push(path.relative(ROOT, CSS_FILE));
    if (localMeta !== meta) stale.push(path.relative(ROOT, META_FILE));
    if (stale.length) {
      console.error(`Shared design tokens are out of date (${stale.join(', ')}).`);
      console.error(`Run: npm run sync:tokens${ref !== DEFAULT_REF ? ` -- --ref ${ref}` : ''}`);
      process.exit(1);
    }
    console.log(`Shared design tokens are up to date (${ref} @ ${upstream.commit}).`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const previous = await read(CSS_FILE);
  await Promise.all([
    fs.writeFile(SOURCE_FILE, source, 'utf8'),
    fs.writeFile(CSS_FILE, css, 'utf8'),
    fs.writeFile(META_FILE, meta, 'utf8'),
  ]);
  console.log(`Synced ${SOURCE_URL} (${ref} @ ${upstream.commit})`);
  console.log(`  ${tokens.color.tokens.length} color, ${tokens.spacing.tokens.length} spacing, ${tokens.radius.tokens.length} radius tokens`);
  console.log(`  -> ${path.relative(ROOT, CSS_FILE)}`);
  if (previous === css) console.log('  No CSS changes.');
}

main().catch((e) => {
  console.error(`sync-design-tokens: ${e.message}`);
  process.exit(1);
});
