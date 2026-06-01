export const CARD_NAME = "roborock-vacuum-card";
export const EDITOR_NAME = "roborock-vacuum-card-editor";
export const CARD_VERSION = "0.7.0.2";

/** Hold duration in ms required to trigger START / PAUSE actions */
export const HOLD_DURATION_MS = 600;

/**
 * Maps Roborock status strings to [human-readable label, accent colour].
 * This unified map covers S6 / S7 / S8 MaxV Ultra.
 */
export const STATUS_MAP: Readonly<Record<string, readonly [string, string]>> = {
  // ── Dry cleaning ──────────────────────────────────────────────────────
  cleaning:                         ["🧹 Cleaning",              "#52c41a"],
  segment_cleaning:                 ["🧹 Cleaning rooms",        "#52c41a"],
  zoned_cleaning:                   ["🧹 Zone cleaning",         "#52c41a"],
  spot_cleaning:                    ["🎯 Spot cleaning",         "#52c41a"],
  starting:                         ["▶️ Starting",              "#52c41a"],
  // ── Wet / mop ────────────────────────────────────────────────────────
  segment_mopping:                  ["🫧 Mopping rooms",         "#40a9ff"],
  zoned_mopping:                    ["🫧 Zone mopping",          "#40a9ff"],
  robot_status_mopping:             ["🫧 Mopping",               "#40a9ff"],
  // ── Combined dry + wet ───────────────────────────────────────────────
  clean_mop_cleaning:               ["🧹🫧 Vacuuming+mopping",  "#52c41a"],
  clean_mop_mopping:                ["🧹🫧 Vacuuming+mopping",  "#52c41a"],
  segment_clean_mop_cleaning:       ["🧹🫧 Rooms (vac)",        "#52c41a"],
  segment_clean_mop_mopping:        ["🧹🫧 Rooms (mop)",        "#52c41a"],
  zoned_clean_mop_cleaning:         ["🧹🫧 Zones (vac)",        "#52c41a"],
  zoned_clean_mop_mopping:          ["🧹🫧 Zones (mop)",        "#52c41a"],
  // ── Mop washing ──────────────────────────────────────────────────────
  washing_the_mop:                  ["🚿 Washing mop",           "#9254de"],
  washing_the_mop_2:                ["🚿 Washing mop",           "#9254de"],
  going_to_wash_the_mop:            ["🚿 Going to wash mop",    "#9254de"],
  air_drying_stopping:              ["💨 Drying mop",            "#9254de"],
  back_to_dock_washing_duster:      ["🏠 Dock + washing",       "#faad14"],
  // ── Navigation ───────────────────────────────────────────────────────
  returning_home:                   ["🏠 Returning home",        "#faad14"],
  docking:                          ["🏠 Docking",               "#faad14"],
  going_to_target:                  ["🎯 Going to target",       "#40a9ff"],
  // ── Docked / idle ────────────────────────────────────────────────────
  charging:                         ["⚡ Charging",              "rgba(255,255,255,0.75)"],
  charging_complete:                ["✅ Fully charged",          "#52c41a"],
  docked:                           ["✅ Docked",                "rgba(255,255,255,0.75)"],
  charger_disconnected:             ["🔌 Charger disconnected",  "#faad14"],
  emptying_the_bin:                 ["🗑️ Emptying bin",          "#faad14"],
  idle:                             ["💤 Idle",                  "rgba(255,255,255,0.45)"],
  paused:                           ["⏸️ Paused",                "#faad14"],
  // ── Special ──────────────────────────────────────────────────────────
  mapping:                          ["🗺️ Mapping",               "#40a9ff"],
  remote_control_active:            ["🕹️ Remote control",       "#40a9ff"],
  manual_mode:                      ["🕹️ Manual mode",          "#40a9ff"],
  updating:                         ["⬆️ Updating",              "#faad14"],
  in_call:                          ["📞 In call",               "#faad14"],
  shutting_down:                    ["⏹️ Shutting down",        "rgba(255,255,255,0.4)"],
  // ── Error states ─────────────────────────────────────────────────────
  error:                            ["❌ Error",                 "#ff4d4f"],
  charging_problem:                 ["⚠️ Charging problem",     "#ff4d4f"],
  locked:                           ["🔒 Locked",                "#ff4d4f"],
  device_offline:                   ["📴 Offline",               "#ff4d4f"],
};

/** Colour hex values for VacuumColor variants */
export const COLOR_HEX: Record<string, string> = {
  green:  "#52c41a",
  blue:   "#2196F3",
  orange: "#faad14",
};

/** rgba versions with reduced opacity for backgrounds */
export const COLOR_BG: Record<string, string> = {
  green:  "rgba(46,204,113,0.18)",
  blue:   "rgba(33,150,243,0.18)",
  orange: "rgba(250,173,20,0.18)",
};

export const COLOR_BG_ACTIVE: Record<string, string> = {
  green:  "rgba(46,204,113,0.30)",
  blue:   "rgba(33,150,243,0.30)",
  orange: "rgba(250,173,20,0.30)",
};

/** Vacuum entity states that count as "actively cleaning" */
export const CLEANING_STATES = new Set([
  "cleaning",
  "segment_cleaning",
  "zoned_cleaning",
  "spot_cleaning",
  "segment_mopping",
  "zoned_mopping",
  "robot_status_mopping",
  "clean_mop_cleaning",
  "clean_mop_mopping",
  "segment_clean_mop_cleaning",
  "segment_clean_mop_mopping",
  "zoned_clean_mop_cleaning",
  "zoned_clean_mop_mopping",
]);
