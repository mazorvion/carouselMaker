# Shared design tokens

Company and Founder use The Double design system from
[`cardtree-bulkbeings/shared-design-system`](https://github.com/cardtree-bulkbeings/shared-design-system).
Carousel Maker does not load the shared repository at runtime. Instead, `npm run sync:tokens` vendors a
snapshot of its token source and compiles a small, scoped CSS bridge for the two Double brands.

Upstream source of truth: `project/tokens.json` (the shared repo generates its own `tokens.css` from it).
The local bridge is generated — never edit it by hand.

## Files

| Path | What |
|---|---|
| `brands/_shared/thedouble/tokens.json` | Vendored snapshot of the shared `project/tokens.json`. Do not hand-edit. |
| `brands/_shared/thedouble/design-tokens.css` | Generated `--ds-*` variables, scoped to `.b-thedouble-company` and `.b-thedouble-founder`. |
| `brands/_shared/thedouble/design-tokens.meta.json` | Upstream repo, ref, commit and source hash for the last sync. |
| `brands/thedouble-{company,founder}/brand.yaml` | `shared:` loads the bridge; `tokens:` maps exact matches to `var(--ds-*)` and keeps brand overrides. |
| `engine/double.css` | Consumes `--ds-*`. It no longer re-declares shared colour/radius constants. |

## Update the shared tokens

Access to the private shared repo is required through your normal git credentials.

```bash
npm run sync:tokens                     # sync main, then regenerate the CSS bridge
npm run sync:tokens -- --ref main       # explicit branch or tag
npm run check:tokens                    # CI: fail if the vendored copy is stale
```

If the repo is not reachable through git, point the script at an existing clone:

```powershell
$env:SHARED_DESIGN_SYSTEM_DIR = "C:\path\to\shared-design-system"
npm run sync:tokens
```

Optional environment overrides: `SHARED_DESIGN_SYSTEM_REPO`, `SHARED_DESIGN_SYSTEM_REF`.
`npm run sync:tokens -- --offline` regenerates `design-tokens.css` from the vendored `tokens.json`
without network access.

After syncing, run `npm run check -- <posts…>` and inspect at least one Company and one Founder post.
Shared token changes can alter contrast or spacing; the rendered slides are the final review.

## How consumption works

1. `engine/engine.js` loads the file named by `shared:` after the design skin and before the shared
   system layers. It is a normal stylesheet link, so the studio and exporter use it too.
2. The generated CSS defines `--ds-*` variables (colours, spacing, radii, shadow, font families) only for
   the two Double brands. Other brands and Agent Bro are untouched.
3. `engine/double.css` uses `--ds-*` for the shared Double rules.
4. In each Double `brand.yaml`, values that exactly match a shared token are written as `var(--ds-*)`.
   Brand-specific values stay literal: Founder's white ground and radii, Company's wash-specific tints,
   font stacks, shadows and palette arrays, for example.
5. Per-post `theme:` and per-slide `cap:` values still override inline, as before.

## What is deliberately not synced

- **Assets:** logos, washes, characters, objects, scenes, stages and textures stay in the local
  `assets/` and `image-assets/` folders. Do not bulk-copy the shared repo's asset library.
- **Fonts:** brands keep loading Funnel Display, Newsreader, Geist, Geist Mono and Silkscreen from
  Google Fonts. The shared font files are not vendored.
- **Components, layouts and formats:** the shared repo's component cards and previews do not replace
  Carousel Maker's `engine/layouts.js`, `formats/` or skins.
- **Dark theme:** the Carousel uses Night (`bg: deep`) via its own rules; the bridge uses the shared
  light-theme values.

## Notes

- The generated CSS header records the upstream ref, commit and `tokens.json` hash.
- `npm run check:tokens` compares the upstream `tokens.json` and regenerated CSS with the vendored
  files. It exits non-zero when a sync is needed.
- Updating tokens does not deploy or publish anything; deployment remains a separate step.
