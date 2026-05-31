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

## Roadmap

| Version | Planned |
|---------|---------|
| v0.2.0 | Full GUI editor with entity pickers; interactive map calibration tool; drag-and-drop room button positioning |
| v0.3.0 | Animated hold-to-activate progress indicator; per-room cleaning stats chart |

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
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions builds the dist file and attaches it to the release automatically.

---

## License

MIT
