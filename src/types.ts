// ── Home Assistant core types ─────────────────────────────────────────────

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

export interface MapConfig {
  entity: string;
  rotation: number;
  scale: number;
  offset_x: number;
  offset_y: number;
}

export interface RoomThreshold {
  days: number;
  color: string;
}

export interface RoomConfig {
  key: string;
  name: string;
  icon?: string;                     // volitelné v rectangle módu
  icon_anchor?: "none"|"tl"|"t"|"tr"|"l"|"c"|"r"|"bl"|"b"|"br";
  segment_id?: number;
  area_id?: string;
  clean_time_mins?: number;            // odhadovaný čas úklidu (minuty) — fallback when no entity
  clean_time_entity?: string;          // input_number — auto-calibrated rolling average (minutes)
  last_clean_entity?: string;
  map_x: number;
  map_y: number;
  map_w?: number;                    // šířka % → aktivuje rectangle mód
  map_h?: number;                    // výška %
}

// ── Clean action strategies ───────────────────────────────────────────────

export interface NativeCleanAction {
  type: "native";
  repeat?: number;
  suction_level?: string;  // option from vacuum entity's fan_speed_list
  mop_mode_entity?: string;
  mop_mode?: string;
  mop_intensity_entity?: string;
  mop_intensity?: string;
}

export interface ScriptCleanAction {
  type: "script";
  entity_id: string;
  variables?: Record<string, string>;
}

export type CleanAction = NativeCleanAction | ScriptCleanAction;

// ── Global action ─────────────────────────────────────────────────────────

/**
 * A badge that triggers a single action across all vacuums.
 * Typical use-case: "Clean whole flat" button.
 * The badge glows when any of watch_entities is in a cleaning state.
 */
export interface GlobalActionScript {
  type: "script";
  entity_id: string;
  variables?: Record<string, string>;
}

export interface GlobalActionService {
  type: "service";
  /** Format: "domain.service", e.g. "script.turn_on" */
  service: string;
  data?: Record<string, unknown>;
}

export type GlobalActionCall = GlobalActionScript | GlobalActionService;

export interface GlobalAction {
  /** Display name shown in the badge */
  name: string;
  /** Optional image path, e.g. /local/Dashboards/Vacuum/celybyt.png */
  image?: string;
  /** Accent colour. Defaults to "orange". */
  color?: VacuumColor;
  /**
   * Entity IDs to watch. When any is cleaning, the badge shows
   * active glow. When all are idle, the badge is dimmed.
   */
  watch_entities?: string[];
  /** What to trigger on hold-to-activate */
  action: GlobalActionCall;
}

// ── Vacuum & card config ──────────────────────────────────────────────────

export type VacuumColor = "green" | "blue" | "orange";

export interface VacuumConfig {
  entity: string;
  name?: string;
  image?: string;
  color?: VacuumColor;
  status_entity?: string;
  battery_entity?: string;
  last_clean_entity?: string;
  progress_entity?: string;
  map?: MapConfig;
  rooms?: RoomConfig[];
  clean_action?: CleanAction;
  current_room_entity?: string;
  error_entity?: string;
}

export interface RoborockVacuumCardConfig {
  type: string;
  vacuums: VacuumConfig[];
  /** Optional extra badges for whole-flat or cross-vacuum actions */
  global_actions?: GlobalAction[];
  /** Shared room overlay appearance — applies to all vacuums */
  room_border_normal?: number;    // border width when room is not selected, default 2
  room_border_selected?: number;  // border width when room is selected, default 4
  room_thresholds?: RoomThreshold[];
  room_icon_hidden?: boolean;     // hide all room overlay icons globally
}
