# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-06-01

### Added

- **Hold animation** — action buttons (START, PAUSE, RESUME) and global-action badges now show a left-to-right fill animation during the 600 ms hold. The animation duration is driven by the same `HOLD_DURATION_MS` constant as the JS timer, so they are always in sync.
- **Global action badges** — new top-level `global_actions` config key. Each entry renders as a pill badge alongside the vacuum badges. The badge glows amber when any of its `watch_entities` is in a cleaning state, and triggers its action on hold. Supports `script` and `service` call types.
- **Room icons in START button** — the idle START button now shows a row of small room icons below the label. Each icon is bright (accent colour) when the room is selected, dimmed when not — matching the behaviour of the original YAML implementation.
- **Global actions editor** — fourth navigation level in the config editor: vacuum list → global action list → global action detail. Supports name, image, colour, watch entities (entity pickers), and action (script entity or service string).

### Changed

- `_holdStart` now takes an `id: string` parameter. The active hold ID is tracked in `@state() _holdId`, which drives the CSS animation class on the correct button — no more single `window._ht` race condition even with multiple vacuums and global badges all in the same view.
- `CARD_VERSION` bumped to `0.3.0`.

---

## [0.2.0] - 2026-05-31

### Added

- **Full GUI config editor** — replaces the YAML-only editor from v0.1.0. Three-level navigation: vacuum list → vacuum detail → room detail. No manual YAML editing required for any field.
- **Entity pickers** — all entity fields use `ha-entity-picker` with domain filtering: vacuum, sensor, image, input\_boolean, input\_number, input\_datetime, select, script.
- **Colour selector** — green / blue / orange accent picker with visual preview.
- **Interactive map calibration panel** — when a map entity is configured, a live preview of the map image is shown alongside rotation, scale, offset X, and offset Y sliders. Changes are reflected in the preview in real time.
- **Click-to-position room buttons** — in the room editor, clicking anywhere on the map preview sets `map_x` / `map_y` for that room. All existing room buttons are shown as overlaid dots for reference.
- **Clean action GUI** — strategy switcher (native / script); native mode exposes repeat count and optional select entity + option value pairs for suction, mop mode, and mop intensity; script mode provides a dynamic key→value variable table with template token hints.
- **Add / delete vacuums and rooms** via buttons; no index management needed.
- **CONTRIBUTING.md** — development setup, release workflow, code style notes.
- Release workflow (`release.yml`) now explicitly sets `prerelease: false` and `make_latest: true`.

### Changed

- `CARD_VERSION` bumped to `0.2.0`.

---

## [0.1.0] - 2026-05-31

### Added

- Initial release of `roborock-vacuum-card`.
- **Multi-vacuum tab badges** — switch between any number of configured vacuums via pill-shaped badges; active and cleaning states reflected in border colour and glow.
- **Map display** — live map image from any HA `image.*` entity with configurable `rotation`, `scale`, `offset_x`, and `offset_y`.
- **Room buttons on map** — toggle `input_boolean` room-selection entities via absolute-positioned buttons; border colour indicates time since last clean (green < 2 days → yellow → orange → red).
- **Status & battery row** — human-readable status label mapped from all known Roborock status strings (S6 / S7 / S8 MaxV Ultra), battery percentage with colour-coded icon.
- **Cleaning progress bar** — shown when `progress_entity` is configured and non-zero.
- **Last clean timestamp** — relative display (Today / Yesterday / dd.mm) next to a history icon.
- **Action buttons with hold-to-activate** — START (600 ms hold), PAUSE (600 ms hold), RESUME (600 ms hold), and DOCK (single tap).  Per-instance hold timer prevents the `window._ht` race condition from multi-card setups.
- **Idle START button** — shows estimated total clean time; disabled and visually dimmed when no rooms are selected.
- **Two clean action strategies**:
  - `native` — calls `vacuum.send_command` with `app_segment_clean`; optionally pre-sets `select.*` entities for mop mode, mop intensity, and suction level before cleaning starts.
  - `script` — calls `script.turn_on` with configurable variable mapping; supports `{{ entity }}`, `{{ selected_segments }}`, `{{ selected_room_keys }}`, and `{{ selected_area_ids }}` template tokens.
- **YAML-based config editor** — backed by HA's built-in `ha-yaml-editor` with inline config reference / example.
- TypeScript source with strict mode; bundled via Rollup into a single ES module.
- GitHub Actions release workflow — builds on `v*.*.*` tag push and attaches `dist/roborock-vacuum-card.js` to the GitHub Release.
- HACS manifest (`hacs.json`).

### Known limitations

- Config editor is YAML-only.  A full GUI editor with entity pickers and interactive map calibration is planned for v0.2.0.
- Room button positions (`map_x` / `map_y`) must be set manually in the config.  A drag-and-drop positioning tool is planned for v0.2.0.
- Map calibration (rotation / scale / offset) requires manual adjustment; an interactive live-preview calibration panel is planned for v0.2.0.
