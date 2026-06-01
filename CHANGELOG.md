# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-06-01

### Added

- **`native-area` clean strategy** — new `type: "native-area"` option in `clean_action`. Uses the HA `vacuum.clean_area` action introduced in the Roborock integration (≈ May 2026). The room `key` is sent directly as `cleaning_area_id`, so no `segment_id` is needed. Fan speed, mop mode and mop intensity are still pre-set before the action as usual. Repeat passes are not supported by `vacuum.clean_area` and are omitted for this strategy.

### Changed

- **Room accordion — visual fields moved to Maps tab** — `icon` and `icon_anchor` are no longer editable in the room accordion under the Vacuums tab. They are now part of the per-room detail in the Maps tab (below the position/overlay controls), keeping all map-related room settings in one place.
- **Room accordion — Segment ID hidden for `native-area`** — when the vacuum's strategy is `native-area`, the Segment ID field and its hint are replaced by a note explaining that the room key is used directly.
- **Maps tab room detail — section headers** — the room detail area now groups controls under explicit headers: *Position*, *Overlay mode*, and *Icon*.
- **Maps tab hint text** — the clickable link in the room accordion now reads "Set position & icon in the Maps tab".
- `CARD_VERSION` bumped to `0.9.0`.

---

## [0.8.0] - 2026-06-01

### Added

- **Auto-calibration of room clean time** — add an `input_number` helper to any room via the new *Auto-calibration (input_number)* field. After each cleaning session the card measures actual time spent in each room (tracked via `current_room_entity`) and writes a rolling average (70 % old, 30 % new) back to the entity. The static `clean_time_mins` field becomes a fallback when no entity is set.
- **Manual "Log clean now" button** — each room with a `last_clean_entity` configured now shows a *✓ Log clean now* button in the editor. Clicking it writes the current timestamp to the `input_datetime` entity immediately.
- **Global "Hide room icons" toggle** — new toggle in the Global tab under Room appearance. Hides all room overlay icons across all vacuums without touching per-room config.
- **All vacuums expanded by default** — on first load the editor opens all vacuum accordions automatically.

### Fixed

- Maps tab: Offset X and Offset Y sliders are now on separate rows — they no longer overlap in the narrow editor panel.

---

## [0.7.0.3] - 2026-06-01

### Fixed

- `dist/roborock-vacuum-card.js` is now committed directly to the repository (removed from `.gitignore`). The release workflow no longer builds in CI — it only attaches the already-built file to the GitHub release. This eliminates all CI build failures.

---

## [0.7.0.2] - 2026-06-01

### Fixed

- Release workflow (`release.yml`) now triggers on **manual release creation** instead of tag push. Pushing tags no longer fires the workflow or sends failure email notifications. When you create a release on GitHub, the workflow builds and attaches `roborock-vacuum-card.js` automatically.

---

## [0.7.0.1] - 2026-06-01

### Fixed

- Synced `package-lock.json` with `package.json` — `npm ci` in GitHub Actions was failing because the lockfile still declared version `0.1.0`.

---

## [0.7.0] - 2026-06-01

### Added

- **Three-tab config editor** — the GUI editor is now organised into three always-visible tabs: **Vacuums**, **Maps**, and **Global**. No more deep page-based navigation.
- **Inline room accordion** — rooms expand and collapse directly inside the vacuum panel. Editing a room requires one click instead of navigating through three levels.
- **Collapsible Sensors section** — the six sensor entity pickers collapse under a header showing how many are configured (e.g. "4 configured"). Only expanded when needed.
- **Collapsible Clean action section** — strategy and options collapse under a header badge showing the current type (`native` / `script`).
- **Maps tab** — dedicated tab for map calibration (rotation, scale, offset X/Y) and room positioning. Select a room pill, then click the map to drop its button. Dots for all rooms are shown as overlaid reference points. Rectangle overlay (width/height) is also editable here.
- **Global tab** — consolidates global actions and shared room appearance settings. Room border widths and last-clean-age thresholds are configured once here and apply to all vacuums.
- **"Set position in Maps tab" shortcut** — tapping the hint in a room's expanded form switches directly to the Maps tab with that room pre-selected.

### Changed

- **`room_border_normal`, `room_border_selected`, `room_thresholds` moved to top-level config** — previously per-vacuum fields; now defined once under `RoborockVacuumCardConfig` and shared across all vacuums. Existing per-vacuum values will need to be moved to the card's top level.
- `CARD_VERSION` bumped to `0.7.0`.

---

## [0.6.1] - 2026-06-01

### Added

- **Room border width controls** — per-vacuum `room_border_normal` (default 2 px) and `room_border_selected` (default 4 px) fields; editable in the GUI editor under "Vzhled místností".
- **Shared room thresholds per vacuum** — `room_thresholds` moved from per-room to per-vacuum; the threshold list applies to all rooms of that vacuum.

### Fixed

- Editor race condition when switching between vacuum panels with unsaved changes.

---

## [0.6.0] - 2026-06-01

### Added

- **In-flight cleaning tracker** — the card now detects when a cleaning session starts and ends. On completion (vacuum transitions to `docked` / `charging`), it writes the current timestamp to each cleaned room's `last_clean_entity` (`input_datetime`), eliminating the need for a separate automation.
- **Estimated total time display** — the idle START button sums `clean_time_mins` of all selected rooms and shows the total estimated duration.
- **`current_room_entity` support** — when set, the card listens for `room_entered` events during an in-flight session and updates last-clean timestamps incrementally as the vacuum moves between rooms.

---

## [0.5.2] - 2026-06-01

### Changed

- Removed `toggle_entity` from `RoomConfig` — room selection is now always local state inside the card; no `input_boolean` helper entities required.
- Simplified room rendering: rectangle and point modes unified into a single `_renderRoomOverlay` method.

---

## [0.5.1] - 2026-06-01

### Added

- **`clean_time_mins`** — optional per-room estimated cleaning duration (minutes). Used to calculate total time shown in the idle START button.
- **`last_clean_entity` per room** — `input_datetime` entity written by the in-flight tracker when that room's clean completes.
- **Icon anchor picker in editor** — 3×3 grid to choose where the room icon appears within the rectangle overlay (`tl` / `t` / … / `br` / `none`).
- **Rectangle overlay controls in editor** — toggle between point mode and rectangle mode (width + height sliders) directly in the room editor.

---

## [0.5.0] - 2026-06-01

### Added

- **Local room selection** — room selected/deselected state is kept inside the card (`_localRoomSel`). No `input_boolean` helper entities needed.
- **Rectangle overlay mode** — setting `map_w` + `map_h` on a room renders a clickable rectangle instead of a point button. The rectangle uses the same selection, border, and glow styling as point buttons.
- **Icon anchor** — `icon_anchor` field (`tl` / `t` / `tr` / `l` / `c` / `r` / `bl` / `b` / `br` / `none`) controls where the icon is pinned within the rectangle overlay.
- **Room border colour by last-clean age** — `room_thresholds` (per room) defines day-count → colour mappings; the room overlay border reflects how long ago that room was last cleaned.
- **`current_room_entity`** — sensor that reports which room the vacuum is currently cleaning.
- **`error_entity`** — sensor surfaced in the status row when the vacuum reports an error.
- **More-info on tap** — tapping the vacuum image or status badge opens the HA more-info dialog for the vacuum entity.

### Changed

- `RoomConfig.icon` is now optional (rectangle mode does not require an icon).

---

## [0.4.2] - 2026-06-01

### Added

- **Mop mode and mop intensity** — native clean action supports optional `mop_mode_entity` / `mop_mode` and `mop_intensity_entity` / `mop_intensity` select fields.
- **`suction_level`** — replaces the old `suction_entity`; value is read from the vacuum entity's `fan_speed_list` attribute and passed directly to `vacuum.send_command`.
- **Room overlay rendering** — `_renderRoomOverlay` extracted as a dedicated method; holds the border, background, glow, and icon layout for both selected and idle states.

---

## [0.4.0] - 2026-06-01

### Added

- **Short-tap / hold-tap badge switching** — short tap on a vacuum badge switches focus to that vacuum only; hold (600 ms) adds or removes it from the active set, enabling side-by-side multi-vacuum view.
- **Dedicated action and status-card renderers** — `_renderActions` and `_renderStatusCard` extracted from the main render for cleaner per-vacuum layout.

---

## [0.3.2] - 2026-06-01

### Fixed

- Entity pickers in the editor now correctly filter by domain when a single domain is specified, using a per-domain `<datalist>` element instead of the global list.
- Global action editor: watch-entity picker rows now update correctly when a value is cleared.

---

## [0.3.1] - 2026-06-01

### Fixed

- Editor: entity picker `@input` handler no longer resets the input field when a partial entity ID is typed that does not yet exist in `hass.states`.
- Editor: vacuum row reorder buttons (↑ / ↓) are now correctly disabled at list boundaries.

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
