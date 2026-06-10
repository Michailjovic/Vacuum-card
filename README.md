# Roborock Vacuum Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Release](https://img.shields.io/github/v/release/Michailjovic/Vacuum-card)](https://github.com/Michailjovic/Vacuum-card/releases)

A feature-rich [Lovelace](https://www.home-assistant.io/dashboards/) custom card for Roborock vacuum cleaners.

---

## Features

- **Multi-vacuum tabs** — manage S6, S7, S8 (or any number) from a single card; tab state is internal, no helper entities needed
- **Live map** with configurable rotation, scale, and position offset
- **Room buttons** overlaid on the map; colour-coded border shows time since last clean
- **Status + battery** — covers all known Roborock status strings across S6 / S7 / S8 MaxV Ultra
- **Cleaning progress bar** (where supported)
- **Hold-to-activate** actions (START, PAUSE, RESUME) — 600 ms hold prevents accidental triggers
- **Two clean action strategies**
  - `native` — `vacuum.send_command` with segment IDs; optional pre-set of mop mode / intensity / suction
  - `script` — calls any HA script with configurable variable mapping
- **Global action badges** — cross-vacuum "whole flat" buttons with amber glow when any vacuum is running
- **Hold-to-activate animation** — left-to-right fill shows hold progress on START, PAUSE, and RESUME
- **Full GUI editor** — entity pickers, live map calibration, click-to-position room buttons

---

## Installation via HACS

1. Open HACS → **Frontend** → ⋮ → **Custom repositories**
2. Add `https://github.com/Michailjovic/Vacuum-card` as category **Lovelace**
3. Install **Roborock Vacuum Card**
4. Add the resource (HACS does this automatically for most setups)

### Manual installation

1. Download `roborock-vacuum-card.js` from the [latest release](https://github.com/Michailjovic/Vacuum-card/releases/latest)
2. Copy to `/config/www/`
3. Add resource in **Settings → Dashboards → ⋮ → Resources**:
   ```
   URL: /local/roborock-vacuum-card.js
   Type: JavaScript module
   ```

---

## Configuration

```yaml
type: custom:roborock-vacuum-card
vacuums:
  - entity: vacuum.roborock_s8_maxv_ultra
    name: "💧 S8"
    image: /local/Dashboards/Vacuum/S8.webp
    color: blue                   # green | blue | orange
    status_entity: sensor.s8_maxv_ultra_status
    battery_entity: sensor.s8_maxv_ultra_battery
    last_clean_entity: sensor.s8_maxv_ultra_last_clean_end
    progress_entity: sensor.s8_maxv_ultra_cleaning_progress
    map:
      entity: image.s8_maxv_ultra_jirsikova
      rotation: 180               # degrees (0 / 90 / 180 / 270 most common)
      scale: 125                  # image width as % of container
      offset_x: -11               # horizontal shift from centre (%)
      offset_y: 5                 # vertical shift from centre (%)
    rooms:
      - key: bedroom
        name: Bedroom
        icon: mdi:bed
        segment_id: 16            # from roborock.get_maps service response
        toggle_entity: input_boolean.s8_room_bedroom
        clean_time_entity: input_number.clean_time_s8_bedroom
        last_clean_entity: input_datetime.last_wet_clean_bedroom
        map_x: 14                 # button position on map (%)
        map_y: 60
      - key: kitchen
        name: Kitchen
        icon: mdi:silverware-fork-knife
        segment_id: 18
        toggle_entity: input_boolean.s8_room_kitchen
        clean_time_entity: input_number.clean_time_s8_kitchen
        last_clean_entity: input_datetime.last_wet_clean_kitchen
        map_x: 34
        map_y: 60
    clean_action:
      type: native
      repeat: 1
      mop_mode_entity: select.s8_maxv_ultra_mop_mode
      mop_mode: deep
      mop_intensity_entity: select.s8_maxv_ultra_mop_intensity
      mop_intensity: intense
```

---

## Config reference

### Top level

| Key | Required | Description |
|-----|----------|-------------|
| `vacuums` | ✅ | Array of vacuum configurations |
| `global_actions` | | Optional cross-vacuum action badges (e.g. "Whole flat") |

### Global action

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `name` | ✅ | — | Label shown in the badge |
| `image` | | — | Image path |
| `color` | | `orange` | Accent colour: `green` / `blue` / `orange` |
| `watch_entities` | | `[]` | Vacuum entities; any cleaning → badge glows |
| `action.type` | ✅ | — | `script` or `service` |
| `action.entity_id` | if script | — | `script.*` entity to call |
| `action.service` | if service | — | `domain.service` string |

```yaml
global_actions:
  - name: "🏠 Whole flat"
    image: /local/Dashboards/Vacuum/celybyt.png
    color: orange
    watch_entities:
      - vacuum.s6_kitchen
      - vacuum.s7_kitchen
      - vacuum.s8_maxv_ultra
    action:
      type: script
      entity_id: script.celkovy_uklid_bytu
```

### Vacuum

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `entity` | ✅ | — | `vacuum.*` entity |
| `name` | | entity slug | Display name |
| `image` | | — | Path to vacuum model image |
| `color` | | `green` | Accent colour: `green` / `blue` / `orange` |
| `status_entity` | | — | `sensor.*` for detailed status strings |
| `battery_entity` | | — | `sensor.*` for battery % |
| `last_clean_entity` | | — | `sensor.*` for last clean end timestamp |
| `progress_entity` | | — | `sensor.*` for cleaning progress % |
| `map` | | — | Map image config (see below) |
| `rooms` | | `[]` | Room / segment definitions |
| `clean_action` | | — | How to start selective cleaning |

### Map

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `entity` | ✅ | — | `image.*` entity with the live map |
| `rotation` | | `0` | Clockwise rotation in degrees |
| `scale` | | `100` | Image width as % of container width |
| `offset_x` | | `0` | Horizontal shift from centre (%) |
| `offset_y` | | `0` | Vertical shift from centre (%) |

### Room

| Key | Required | Description |
|-----|----------|-------------|
| `key` | ✅ | Unique key within the vacuum |
| `name` | ✅ | Human-readable label |
| `icon` | ✅ | MDI icon, e.g. `mdi:bed` |
| `map_x` | ✅ | Button X position on map (0–100 %) |
| `map_y` | ✅ | Button Y position on map (0–100 %) |
| `segment_id` | | Roborock segment ID (needed for `native` action) |
| `area_id` | | HA area ID (alternative to segment_id) |
| `toggle_entity` | | `input_boolean.*` for room selection |
| `clean_time_entity` | | `input_number.*` — estimated minutes |
| `last_clean_entity` | | `input_datetime.*` — last cleaned time |

### Clean action — native

```yaml
clean_action:
  type: native
  repeat: 1                            # 1–3, default 1
  suction_entity: select.xxx_suction   # optional
  suction_level: balanced
  mop_mode_entity: select.xxx_mop_mode
  mop_mode: deep
  mop_intensity_entity: select.xxx_mop_intensity
  mop_intensity: intense
```

### Clean action — script

```yaml
clean_action:
  type: script
  entity_id: script.my_cleaning_script
  variables:
    vacuum_entity: "{{ entity }}"
    rooms: "{{ selected_segments }}"
```

Available template tokens in variable values:

| Token | Resolves to |
|-------|-------------|
| `{{ entity }}` | `vacuum.*` entity ID |
| `{{ selected_segments }}` | JSON array of `segment_id` numbers |
| `{{ selected_room_keys }}` | JSON array of room `key` strings |
| `{{ selected_area_ids }}` | JSON array of room `area_id` strings |

---

## Finding your segment IDs

Call the `roborock.get_maps` service in **Developer Tools → Actions**:

```yaml
action: roborock.get_maps
target:
  entity_id: vacuum.your_vacuum
```

The response lists room names with their numeric IDs:

```yaml
vacuum.your_vacuum:
  maps:
    - flag: 0
      name: Flat
      rooms:
        "16": Bedroom
        "18": Kitchen
```

Use those numbers as `segment_id` in your room config.

---

## Server-side tracking & notifications (blueprint)

Until 1.0.0 the card tracked running cleanups in the browser: if you closed the
dashboard mid-clean, last-clean timestamps were never written and no finish
notification fired. The blueprint tracker moves all of that server-side.

How it works: the card fires a `roborock_card_event` (action `cleaning_started`)
with the selected rooms **and their helper entity IDs**. A generic blueprint
automation picks it up, waits for the vacuum to dock, writes each room's
`input_datetime`, optionally stores the measured duration for single-room runs
(`single_room_time`), sends start / finish / error notifications and fires
`cleaning_finished` — which open cards use to clear the room selection on every
device.

Setup (admin user, ~1 minute):

1. Open the card editor → **Global** tab → **Backend tracking (blueprint)**.
2. Click **Install blueprint**.
3. Fill in your notify action (e.g. `notify.mobile_app_phone`), pick which
   notifications you want, then click **Create automation**.
4. Optional: use **Create missing helpers for all rooms** in the Vacuums tab to
   auto-create the `input_datetime` / `input_number` helpers.

Non-admin users can copy the blueprint YAML from the same section and import it
manually (Settings → Automations → Blueprints), then create an automation from
it by hand.

Re-deploy the automation from the editor after changing notification settings
or the single-room calibration toggle. After a card update that bumps the
blueprint version, the section shows **update available** — one click updates it.

## Roadmap

| Version | Status | Highlights |
|---------|--------|-----------|
| v0.1.0 | ✅ Released | Core card, YAML editor |
| v0.2.0 | ✅ Released | Full GUI editor, map calibration, click-to-position rooms |
| v0.3.0 | ✅ Released | Hold animation, global action badges, room icons in START button |
| v0.4.0 | Planned | Per-room cleaning history chart; drag-to-reorder rooms; `roborock.get_maps` auto-import |

---

## Development

```bash
npm install
npm run build        # single build → dist/roborock-vacuum-card.js
npm run watch        # rebuild on source changes
npm run typecheck    # TypeScript only, no emit
```

To create a release, push a version tag:

```bash
git tag v0.3.0
git push origin v0.3.0
```

GitHub Actions builds the dist file and attaches it to the release automatically.

---

## License

MIT
