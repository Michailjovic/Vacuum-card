# Contributing

Thank you for your interest in improving Roborock Vacuum Card!

## Development setup

```bash
git clone https://github.com/Michailjovic/Vacuum-card.git
cd Vacuum-card
npm install
npm run watch   # rebuilds on every file change
```

Copy `dist/roborock-vacuum-card.js` to your HA `/config/www/` folder and add it as a Lovelace resource for live testing.

## Project structure

```
src/
  index.ts                  Entry point — registers both custom elements
  roborock-vacuum-card.ts   Main card (LitElement)
  editor.ts                 Config editor (LitElement)
  types.ts                  TypeScript interfaces
  const.ts                  Status map, colour constants, hold duration
```

## Releasing

Releases are fully automated. Push a semver tag and GitHub Actions builds and publishes:

```bash
git tag v0.2.0
git push origin v0.2.0
```

The workflow (`release.yml`) runs `npm run build` and attaches `dist/roborock-vacuum-card.js` to the GitHub Release. Update `CHANGELOG.md` and bump `CARD_VERSION` in `src/const.ts` before tagging.

## Adding a new Roborock status string

All status strings are in `src/const.ts` inside `STATUS_MAP`. Each entry is:

```typescript
"status_string": ["🔤 Human label", "#hexcolor"],
```

## Code style

- TypeScript strict mode — no `any`, no implicit `any`
- Lit reactive properties via `@state()` / `@property()` decorators
- CSS lives in the `static styles` block of each component — no external stylesheets
- Hold-to-activate uses per-instance `_holdTimer`, never `window.*`
