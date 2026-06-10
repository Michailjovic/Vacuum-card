// ── Home Assistant core types ─────────────────────────────────────────────

export interface HassConnection {
  sendMessage(message: Record<string, unknown>): void;
  subscribeEvents(
    callback: (event: { data?: Record<string, unknown> }) => void,
    eventType?: string
  ): Promise<() => void>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  connection: HassConnection;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>
  ): Promise<void>;
  /** Raw WebSocket command (blueprint/save, input_datetime/create, …) */
  callWS<T = unknown>(message: Record<string, unknown>): Promise<T>;
  /** REST API call (config/automation/config/<id>, …) */
  callApi<T = unknown>(method: string, path: string, parameters?: unknown): Promise<T>;
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

/**
 * Uses the newer HA vacuum.clean_area action.
 * room.key is sent directly as cleaning_area_id -- no segment_id needed.
 * Repeat is implemented in software: the card restarts cleaning after each
 * pass (the integration does not accept a times/repeat parameter).
 */
export interface NativeAreaCleanAction {
  type: "native-area";
  repeat?: number;         // software repeat -- card restarts after each pass
  suction_level?: string;
  mop_mode_entity?: string;
  mop_mode?: string;
  mop_intensity_entity?: string;
  mop_intensity?: string;
}

/**
 * Uses roborock.get_maps to dynamically resolve segment IDs, then calls
 * vacuum.send_command with app_segment_clean + repeat (same as native).
 * No segment_id needed per room -- matching is done via area_mappings.
 */
export interface NativeAutoCleanAction {
  type: "native-auto";
  repeat?: number;
  suction_level?: string;
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

export type CleanAction = NativeCleanAction | NativeAreaCleanAction | NativeAutoCleanAction | ScriptCleanAction;

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

export interface NotifyTemplates {
  title?: string;
  message?: string;
}

export interface NotifyConfig {
  /** Ticker category name */
  category: string;
  /** Accent colour for dry cleaning notifications */
  color_dry?: string;
  /** Accent colour for wet cleaning notifications */
  color_wet?: string;
  /** Tag prefix for notification grouping/replacing (default: "roborock") */
  tag_prefix?: string;
  /** Templates fired on cleaning_started */
  on_start?: NotifyTemplates;
  /** Templates fired on cleaning_finished */
  on_finish?: NotifyTemplates;
}

export interface NotifyScriptVars {
  /** Pass vacuum_label to script (default true) */
  vacuum_label?: boolean;
  /** Pass room_labels — comma-separated display names (default true) */
  room_labels?: boolean;
  /** Pass room_keys — comma-separated room keys (default false) */
  room_keys?: boolean;
  /** Pass estimated_mins — total expected clean time (default true) */
  estimated_mins?: boolean;
  /** Pass clean_type — "wet" or "dry" (default true) */
  clean_type?: boolean;
}

export interface NotifyScriptEvents {
  /** Generate on_start notification block in script (default true) */
  on_start?: boolean;
  /** Generate on_finish notification block in script (default true) */
  on_finish?: boolean;
  /** Generate on_error notification block in script (default true) */
  on_error?: boolean;
}

export interface NotifyScriptConfig {
  /** Script entity ID to call when cleaning starts */
  entity: string;
  /** Which variables to pass to the script */
  vars?: NotifyScriptVars;
  /** Which event blocks to include in the generated script YAML */
  gen_events?: NotifyScriptEvents;
}

/**
 * Settings for the server-side tracking blueprint deploy.
 * Stored in the card config so the editor can (re)create the automation.
 */
export interface BackendConfig {
  /** Notify action, e.g. "notify.mobile_app_phone". Empty = no notifications. */
  notify_service?: string;
  notify_on_start?: boolean;   // default true
  notify_on_finish?: boolean;  // default true
  notify_on_error?: boolean;   // default true
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
  /**
   * Global room-key → HA area_id mapping for native-area strategy.
   * Defined once here; all vacuums share it.
   * Per-room area_id overrides this when set.
   */
  area_mappings?: Record<string, string>;
  /** Ticker notification config */
  notify?: NotifyConfig;
  /** Script-based notification config */
  notify_script?: NotifyScriptConfig;
  /**
   * When a run cleaned exactly one room, write the measured duration
   * directly into that room's clean_time_entity (input_number).
   * Applied client-side and passed as a blueprint input on deploy.
   */
  single_room_time?: boolean;
  /** Server-side tracking blueprint deploy settings */
  backend?: BackendConfig;
}
