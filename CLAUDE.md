# roborock-vacuum-card — projekt kontext pro Claude

## Co je to za projekt
Custom Home Assistant Lovelace karta pro Roborock vysavače.
TypeScript + Lit + Rollup, distribuovaná přes HACS.

## Aktuální stav
- Verze: **zkontroluj `package.json` a `CHANGELOG.md`** (vždy source of truth)
- `src/const.ts` obsahuje `CARD_VERSION` — musí sedět s `package.json`

## Workflow verzování (DŮLEŽITÉ)
1. Veškeré změny se verzují přes **GitHub**
2. Uživatel pushuje přes **GitHub for Windows**
3. Uživatel pak ručně vytvoří **nový release na GitHub webu** — workflow automaticky přiloží `dist/roborock-vacuum-card.js`
4. **`dist/roborock-vacuum-card.js` je commitován přímo do repa** (není v .gitignore)
5. Claude NIKDY nepushuje za uživatele

## Před každým releasem musí Claude:
1. Napsat CHANGELOG entry v **angličtině** (formát: Keep a Changelog + Semantic Versioning)
2. Bumptovat verzi v: `package.json` + `src/const.ts` (CARD_VERSION)
3. Spustit `npm run build` — výstup: `dist/roborock-vacuum-card.js`
4. Na konci dát uživateli CHANGELOG entry v angličtině, aby ji mohl pastovat do GitHub release notes

## Build
```bash
npm run build        # produkční build → dist/roborock-vacuum-card.js
npm run watch        # watch mode pro vývoj
npx tsc --noEmit     # typecheck bez buildu
```

## Struktura zdrojáků
- `src/types.ts` — všechny TypeScript typy a interfacy
- `src/const.ts` — konstanty, STATUS_MAP, CARD_VERSION
- `src/roborock-vacuum-card.ts` — hlavní karta (~1200 řádků)
- `src/editor.ts` — GUI config editor (~1150 řádků)
- `src/index.ts` — entry point

## Důležité technické detaily
- Editor má 3 taby: **Vacuums**, **Maps**, **Global**
- Clean action strategie: `native` (vacuum.send_command), `native-area` (vacuum.clean_area), `script`
- `native-area` — room.key jde přímo jako `cleaning_area_id`, nepotřebuje segment_id
- `dist/` je in repo (ne gitignored) — workflow jen přiloží soubor k release
- Release workflow se spouští při **ručním vytvoření release** na GitHubu (ne při push tagu)

## Historický kontext — legacy skripty (NEOPAKOVAT)
Před kartou existovaly dva HA skripty: `spustit_uklid_dle_vysavace` a `celkový úklid bytu`.
Karta jejich funkci z velké části nahradila. Jsou součástí historického kontextu — **nezastavuj se nad nimi, nepokládej k nim otázky**.
S7 vysavač je v těchto skriptech, v kartě záměrně chybí. Neptej se proč.

## Komunikace s uživatelem
- Uživatel komunikuje **česky** — odpovídej česky
- Changelog a kód píš **anglicky**
- Uživatel je zkušený HA vývojář, nepotřebuje vysvětlovat základy

## Časté problémy při vývoji
- Edit tool má limit velikosti — při velkých změnách používej Python patch skript přes `mcp__workspace__bash`
- Originály vždy zálohovej přes `git show HEAD:src/file.ts > /sessions/.../outputs/file_orig.ts`
- Po každém Python patchi ověř: `npx tsc --noEmit --pretty false`
