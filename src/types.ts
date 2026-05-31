// ── Home Assistant core types (minimal, sufficient for card usage) ────────

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>
  ): Promise<void>;
  hassUrl(path?: string): string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

// ── Card config types ─────────────────────────────────────────────────────

/**
 * How the map image should be positioned and transformed inside the map
 * container. All numeric values are in the same unit as their property
 * description below.
 */
export interface MapConfig {
  /** image.* entity that provides the live map */
  entity: string;
  /** Clockwise rotation in degrees (0 / 90 / 180 / 270 are most common) */
  rotation: number;
  /** Width of the image as a percentage of the container width (e.g. 90) */
  scale: number;
  /**
   * Horizontal shift from the container centre, expressed as percentage
   * of container width.  Positive = right, negative = left.
   * Default 0.
   */
  offset_x: number;
  /**
   * Vertical shift from the container centre, expressed as percentage
   * of container height.  Positive = down, negative = up.
   * Default 0.
   */
  offset_y: number;
}

/** A single room / segment the user can select for cleaning */
export interface RoomConfig {
  /** Internal key, must be unique within a vacuum */
  key: string;
  /** Human-readable label shown in tooltips */
  name: string;
  /** MDI icon name, e.g. "mdi:bed" */
  icon: string;
  /**
   * Roborock segment ID (integer).
   * Required when clean_action.type === 'native'.
   */
  segment_id?: number;
  /**
   * Home Assistant area ID for vacuum.clean_area.
   * Alternative to segment_id for integrations that support it.
   */
  area_id?: string;
  /**
   * input_boolean entity used to track whether this room is selected.
   * When omitted the card manages selection state internally.
   */
  toggle_entity?: string;
  /**
   * input_number entity that holds the estimated cleaning time for this
   * room in minutes.  Used to show a total time estimate.
   */
  clean_time_entity?: string;
  /**
   * input_datetime entity that records when this room was last cleaned.
   * Drives the colour-coded border on the room button.
   */
  last_clean_entity?: string;
  /** Horizontal position of the room button on the map, 0-100 (%) */
  map_x: number;
  /** Vertical position of the room button on the map, 0-100 (%) */
  map_y: number;
}

// ── Clean action strategies ───────────────────────────────────────────────

/**
 * Native Roborock strategy.
 * Calls `vacuum.send_command` with `app_segment_clean`.
 * Optionally pre-sets select entities for mop / suction parameters.
 */
export interface NativeCleanAction {
  type: "native";
  /** How many times to clean each segment (1–3). Default 1. */
  repeat?: number;
  /** select.* entity for suction level */
  suction_entity?: string;
  /** Option value to set on suction_entity before cleaning */
  suction_level?: string;
  /** select.* entity for mop mode */
  mop_mode_entity?: string;
  /** Option value to set on mop_mode_entity before cleaning */
  mop_mode?: string;
  /** select.* entity for mop intensity */
  mop_intensity_entity?: string;
  /** Option value to set on mop_intensity_entity before cleaning */
  mop_intensity?: string;
}

/**
 * Script strategy.
 * Calls `script.turn_on` with a configurable set of variables.
 * Template tokens available:
 *   {{ entity }}               — vacuum entity_id
 *   {{ selected_segments }}    — JSON array of segment_id numbers
 *   {{ selected_room_keys }}   — JSON array of room key strings
 *   {{ selected_area_ids }}    — JSON array of area_id strings
 */
export interface ScriptCleanAction {
  type: "script";
  /** script.* entity to call */
  entity_id: string;
  /**
   * Variables passed to the script via `script.turn_on`.
   * Values may contain the template tokens listed above.
   */
  variables?: Record<string, string>;
}

export type CleanAction = NativeCleanAction | ScriptCleanAction;

// ── Vacuum & card config ──────────────────────────────────────────────────

export type VacuumColor = "green" | "blue" | "orange";

export interface VacuumConfig {
  /** vacuum.* entity */
  entity: string;
  /** Display name override. Defaults to entity_id slug. */
  name?: string;
  /** Path to vacuum model image, e.g. /local/Dashboards/Vacuum/S8.webp */
  image?: string;
  /** Accent colour for borders, glows and buttons. Default "green". */
  color?: VacuumColor;
  /**
   * sensor.* entity for detailed status strings
   * (e.g. sensor.s8_maxv_ultra_status).
   * When omitted the card uses the vacuum entity state directly.
   */
  status_entity?: string;
  /** sensor.* entity for battery percentage */
  battery_entity?: string;
  /** sensor.* entity for last clean end timestamp */
  last_clean_entity?: string;
  /** sensor.* entity for cleaning progress percentage */
  progress_entity?: string;
  /** Map image configuration */
  map?: MapConfig;
  /** Room / segment definitions */
  rooms?: RoomConfig[];
  /** How to start a selective clean */
  clean_action?: CleanAction;
}

export interface RoborockVacuumCardConfig {
  type: string;
  vacuums: VacuumConfig[];
}
