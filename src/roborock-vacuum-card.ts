import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import type {
  HomeAssistant,
  VacuumConfig,
  RoborockVacuumCardConfig,
  RoomConfig,
  RoomThreshold,
  NativeCleanAction,
  NativeAreaCleanAction,
  NativeAutoCleanAction,
  ScriptCleanAction,
  GlobalAction,
  GlobalActionCall,
  NotifyTemplates,
} from "./types";
import {
  CARD_NAME,
  EDITOR_NAME,
  CARD_VERSION,
  HOLD_DURATION_MS,
  STATUS_MAP,
  COLOR_HEX,
  COLOR_BG,
  COLOR_BG_ACTIVE,
  CLEANING_STATES,
} from "./const";

console.info(
  `%c ROBOROCK-VACUUM-CARD %c v${CARD_VERSION} `,
  "background:#2196F3;color:#fff;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px",
  "background:#1a1a1a;color:#fff;font-weight:400;padding:2px 4px;border-radius:0 3px 3px 0"
);

type InFlightCleaning = {
  rooms: Array<{
    key: string;
    name: string;
    last_clean_entity?: string;
    clean_time_entity?: string;
  }>;
  expectedMs: number;
  startTime: number;
  /** Timestamp of the very first pass — used for total time in notifications */
  originalStartTime: number;
  vacLabel: string;
  cleanType: "wet" | "dry";
  /** Passes remaining after the current one (native-area software repeat) */
  repeatRemaining: number;
  /** Resolved area IDs — stored for restarting repeat passes */
  areaIds?: string[];
};

@customElement(CARD_NAME)
export class RoborockVacuumCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** Set by Lovelace when the dashboard is in edit mode */
  @property({ attribute: false }) editMode = false;
  @state() private _config!: RoborockVacuumCardConfig;
  @state() private _shownSet = new Set<number>([0]);
  /** ID of the button currently being held — drives the fill animation */
  @state() private _holdId: string | null = null;
  /** Výběr místností — drží se lokálně v kartě (bez potřeby input_boolean helper entity) */
  @state() private _localRoomSel = new Map<string, boolean>();
  /** Aktivní úklidy — sledování průběhu pro vyhodnocení úspěchu */
  private _inFlight = new Map<string, InFlightCleaning>();
  private _prevVacStates = new Map<string, string>();
  private _prevRoomStates = new Map<string, string>();
  /** Auto-calibration: timestamp when vacuum entered each room (key = vacEntity:roomName) */
  private _roomEnterTimes = new Map<string, number>();

  private _holdTimer: ReturnType<typeof setTimeout> | null = null;
  private _initialized = false;
  /** Entities whose state changes should trigger a re-render */
  private _watched: Set<string> | null = null;
  /** roborock_card_event subscription (blueprint → card sync) */
  private _unsubEvents: Promise<() => void> | null = null;

  // ── Lovelace card API ───────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_NAME);
  }

  static getStubConfig(): RoborockVacuumCardConfig {
    return {
      type: `custom:${CARD_NAME}`,
      vacuums: [
        {
          entity: "vacuum.my_roborock",
          name: "Roborock",
          color: "green",
          rooms: [],
          clean_action: { type: "native" },
        },
      ],
    };
  }

  setConfig(config: RoborockVacuumCardConfig): void {
    if (!config.vacuums || !Array.isArray(config.vacuums) || config.vacuums.length === 0) {
      throw new Error("[roborock-vacuum-card] 'vacuums' must be a non-empty array");
    }
    this._config = config;
    this._watched = null;
    if (!this._initialized) {
      this._initialized = true;
      this._shownSet = this._loadShown();
      this._localRoomSel = this._loadRoomSel();
    } else {
      const valid = new Set<number>();
      for (const i of this._shownSet) { if (i < config.vacuums.length) valid.add(i); }
      this._shownSet = valid.size > 0 ? valid : new Set(config.vacuums.map((_, i) => i));
    }
  }

  getCardSize(): number {
    return 6;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    super.connectedCallback();
    this.style.setProperty("--hold-ms", HOLD_DURATION_MS + "ms");
    this._ensureSubscribed();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelHold();
    if (this._unsubEvents) {
      this._unsubEvents.then((unsub) => unsub()).catch(() => { /* connection gone */ });
      this._unsubEvents = null;
    }
  }

  /**
   * Re-render only when a relevant entity changed — the hass object is
   * replaced on every state change anywhere in HA.
   */
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!changed.has("hass") || changed.size > 1) return true;
    const old = changed.get("hass") as HomeAssistant | undefined;
    if (!old || !this._config) return true;
    for (const id of this._watchedEntities()) {
      if (old.states[id] !== this.hass.states[id]) return true;
    }
    return false;
  }

  private _watchedEntities(): Set<string> {
    if (this._watched) return this._watched;
    const s = new Set<string>();
    for (const vac of this._config?.vacuums ?? []) {
      for (const id of [vac.entity, vac.status_entity, vac.battery_entity,
        vac.last_clean_entity, vac.progress_entity, vac.current_room_entity,
        vac.error_entity, vac.map?.entity]) {
        if (id) s.add(id);
      }
      for (const r of vac.rooms ?? []) {
        if (r.last_clean_entity) s.add(r.last_clean_entity);
        if (r.clean_time_entity) s.add(r.clean_time_entity);
      }
    }
    for (const ga of this._config?.global_actions ?? []) {
      for (const e of ga.watch_entities ?? []) if (e) s.add(e);
    }
    this._watched = s;
    return s;
  }

  private _ensureSubscribed(): void {
    if (this._unsubEvents || !this.hass?.connection?.subscribeEvents) return;
    try {
      this._unsubEvents = this.hass.connection.subscribeEvents(
        (ev) => this._onCardEvent(ev.data ?? {}),
        "roborock_card_event"
      );
    } catch {
      this._unsubEvents = null;
    }
  }

  /**
   * Blueprint fired cleaning_finished — clear the room selection for that
   * vacuum on every device with an open dashboard, and drop any stale
   * in-flight record (e.g. when this tab missed the docked transition).
   */
  private _onCardEvent(data: Record<string, unknown>): void {
    if (data["action"] !== "cleaning_finished" || data["source"] !== "blueprint") return;
    const vacEntity = String(data["vacuum_entity"] ?? "");
    if (!this._config?.vacuums.some((v) => v.entity === vacEntity)) return;
    this._inFlight.delete(vacEntity);
    const keys = Array.isArray(data["rooms"]) ? (data["rooms"] as unknown[]).map(String) : [];
    if (!keys.length) return;
    const next = new Map(this._localRoomSel);
    for (const k of keys) next.delete(vacEntity + ":" + k);
    this._localRoomSel = next;
    this._saveRoomSel(vacEntity);
  }

  protected updated(changed: PropertyValues): void {
    this._ensureSubscribed();
    if (!changed.has("hass") || !this.hass || !this._config) return;
    for (const vac of this._config.vacuums) {
      const newState = this.hass.states[vac.entity]?.state ?? "";
      const prevState = this._prevVacStates.get(vac.entity) ?? newState;
      // Přechod do docked/charging při aktivním úklidu → vyhodnoť
      if (prevState !== newState &&
          (newState === "docked" || newState === "charging") &&
          this._inFlight.has(vac.entity)) {
        const flight = this._inFlight.get(vac.entity)!;
        this._inFlight.delete(vac.entity);
        this._evalCleaningComplete(vac.entity, flight);
      }
      this._prevVacStates.set(vac.entity, newState);
      // room_entered event + auto-calibration tracking
      if (vac.current_room_entity && this._inFlight.has(vac.entity)) {
        const newRoom = this.hass.states[vac.current_room_entity]?.state ?? "";
        const prevRoom = this._prevRoomStates.get(vac.entity) ?? "";
        if (newRoom && newRoom !== prevRoom &&
            newRoom !== "unknown" && newRoom !== "unavailable") {
          if (prevRoom) {
            const enterKey = vac.entity + ":" + prevRoom;
            const enterTime = this._roomEnterTimes.get(enterKey);
            if (enterTime) {
              const elapsedMins = (Date.now() - enterTime) / 60_000;
              this._updateRoomCleanTime(vac, prevRoom, elapsedMins);
              this._roomEnterTimes.delete(enterKey);
            }
          }
          this._roomEnterTimes.set(vac.entity + ":" + newRoom, Date.now());
          this._fireHAEvent({
            action: "room_entered",
            vacuum_entity: vac.entity,
            vacuum_label: vac.name ?? vac.entity,
            clean_type: this._deriveCleanType(vac),
            room_name: newRoom,
          });
        }
        this._prevRoomStates.set(vac.entity, newRoom);
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private _color(vac: VacuumConfig): string {
    return COLOR_HEX[vac.color ?? "green"] ?? COLOR_HEX["green"];
  }

  private _colorKey(vac: VacuumConfig): string {
    return vac.color ?? "green";
  }

  private _statusInfo(vac: VacuumConfig): readonly [string, string] {
    const raw = vac.status_entity
      ? (this.hass.states[vac.status_entity]?.state ?? "unknown")
      : (this.hass.states[vac.entity]?.state ?? "unknown");
    return STATUS_MAP[raw] ?? [raw, "rgba(255,255,255,0.5)"];
  }

  private _isCleaning(vac: VacuumConfig): boolean {
    return CLEANING_STATES.has(this.hass.states[vac.entity]?.state ?? "");
  }

  private _isPaused(vac: VacuumConfig): boolean {
    return this.hass.states[vac.entity]?.state === "paused";
  }

  private _battery(vac: VacuumConfig): number | null {
    if (!vac.battery_entity) return null;
    const n = parseInt(this.hass.states[vac.battery_entity]?.state ?? "");
    return isNaN(n) ? null : n;
  }

  private _lastCleanStr(vac: VacuumConfig): string {
    const raw = vac.last_clean_entity
      ? this.hass.states[vac.last_clean_entity]?.state
      : undefined;
    if (!raw || raw === "unavailable" || raw === "unknown") return "—";
    const d = new Date(raw);
    const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff === 0) return "Today · " + t;
    if (diff === 1) return "Yesterday · " + t;
    return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" }) + " · " + t;
  }

  private _progress(vac: VacuumConfig): number | null {
    if (!vac.progress_entity) return null;
    const n = parseInt(this.hass.states[vac.progress_entity]?.state ?? "");
    return isNaN(n) || n === 0 ? null : n;
  }

  private _isRoomSelected(room: RoomConfig, vac: VacuumConfig): boolean {
    return this._localRoomSel.get(vac.entity + ":" + room.key) ?? false;
  }

  private _hasSelectedRooms(vac: VacuumConfig): boolean {
    return (vac.rooms ?? []).some((r) => this._isRoomSelected(r, vac));
  }

  private _roomCleanMins(room: RoomConfig): number {
    if (room.clean_time_entity) {
      const val = parseFloat(this.hass.states[room.clean_time_entity]?.state ?? "");
      if (!isNaN(val) && val > 0) return val;
    }
    return room.clean_time_mins ?? 0;
  }

  private _totalCleanMins(vac: VacuumConfig): number {
    return (vac.rooms ?? []).reduce((sum, r) => {
      if (!this._isRoomSelected(r, vac)) return sum;
      return sum + this._roomCleanMins(r);
    }, 0);
  }

  private _roomAgeDays(room: RoomConfig): number | null {
    if (!room.last_clean_entity) return null;
    const raw = this.hass.states[room.last_clean_entity]?.state;
    if (!raw || raw === "unavailable" || raw === "unknown") return null;
    return (Date.now() - new Date(raw).getTime()) / 86_400_000;
  }

  private _roomBorderColor(room: RoomConfig, vac: VacuumConfig): string {
    const d = this._roomAgeDays(room);
    if (d === null) return "rgba(255,77,77,0.85)";
    const ths: RoomThreshold[] = this._config.room_thresholds ?? [
      { days: 2, color: "rgba(46,204,113,0.85)" },
      { days: 5, color: "rgba(250,173,20,0.85)" },
      { days: 10, color: "rgba(255,152,0,0.85)" },
    ];
    const sorted = [...ths].sort((a, b) => a.days - b.days);
    for (const th of sorted) { if (d <= th.days) return th.color; }
    return "rgba(255,77,77,0.85)";
  }

  private _batIcon(pct: number): string {
    if (pct > 80) return "mdi:battery";
    if (pct > 50) return "mdi:battery-60";
    if (pct > 20) return "mdi:battery-30";
    return "mdi:battery-10";
  }

  private _batColor(pct: number): string {
    if (pct > 50) return "#52c41a";
    if (pct > 20) return "#faad14";
    return "#ff4d4f";
  }

  private _mapUrl(entity: string): string {
    const state = this.hass.states[entity];
    if (!state) return "";
    const pic = state.attributes["entity_picture"] as string;
    if (!pic) return "";
    const ts = new Date(state.last_updated).getTime();
    const sep = pic.includes("?") ? "&" : "?";
    return this.hass.hassUrl(pic + sep + "_t=" + ts);
  }

  private _timeStr(mins: number): string {
    const total = Math.round(mins);
    if (total <= 0) return "";
    if (total >= 60) {
      const h = Math.floor(total / 60);
      const m = total % 60;
      return m > 0 ? "~" + h + " h " + m + " min" : "~" + h + " h";
    }
    return "~" + total + " min";
  }

  // ── Global action helpers ───────────────────────────────────────────────

  /** True if any watched entity is in a cleaning state */
  private _isGlobalActive(ga: GlobalAction): boolean {
    return (ga.watch_entities ?? []).some((e) =>
      CLEANING_STATES.has(this.hass.states[e]?.state ?? "")
    );
  }

  private async _triggerGlobal(ga: GlobalAction): Promise<void> {
    const action = ga.action;
    try {
      if (action.type === "script") {
        await this.hass.callService("script", "turn_on", {
          entity_id: action.entity_id,
          variables: action.variables ?? {},
        });
      } else {
        const [domain, svc] = action.service.split(".");
        await this.hass.callService(domain, svc, action.data ?? {});
      }
    } catch (err) {
      console.error("[roborock-vacuum-card] global action failed:", err);
    }
  }

  // ── Hold-action helpers ─────────────────────────────────────────────────

  private _cancelHold(): void {
    if (this._holdTimer !== null) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    this._holdId = null;
  }

  /**
   * Returns a pointerdown handler that:
   *  1. Sets _holdId to `id` (triggers fill animation)
   *  2. Fires `action` after HOLD_DURATION_MS
   */
  private _holdStart(id: string, action: () => void) {
    return (e: PointerEvent): void => {
      e.preventDefault();
      this._cancelHold();
      this._holdId = id;
      this._holdTimer = setTimeout(() => {
        this._holdTimer = null;
        this._holdId = null;
        action();
      }, HOLD_DURATION_MS);
    };
  }

  private _holdEnd = (): void => {
    this._cancelHold();
  };

  private _toggleShown(index: number): void {
    const next = new Set(this._shownSet);
    if (next.has(index)) { if (next.size > 1) next.delete(index); }
    else { next.add(index); }
    this._shownSet = next;
    this._saveShown();
  }

  // ── Service calls ───────────────────────────────────────────────────────

  private async _call(domain: string, service: string, data: Record<string, unknown>): Promise<void> {
    try {
      await this.hass.callService(domain, service, data);
    } catch (err) {
      console.error("[roborock-vacuum-card] " + domain + "." + service + " failed:", err);
    }
  }

  private _fireMoreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  private _deriveCleanType(vac: VacuumConfig): "wet" | "dry" {
    if (vac.clean_action?.type === "native" ||
        vac.clean_action?.type === "native-area" ||
        vac.clean_action?.type === "native-auto") {
      const na = vac.clean_action as NativeCleanAction | NativeAreaCleanAction | NativeAutoCleanAction;
      if (na.mop_mode_entity || na.mop_intensity_entity) return "wet";
    }
    return "dry";
  }

  private _fireHAEvent(data: Record<string, unknown>): void {
    try {
      this.hass.connection.sendMessage({
        type: "fire_event",
        event_type: "roborock_card_event",
        event_data: data,
      });
    } catch (err) {
      console.error("[roborock-vacuum-card] fire_event failed:", err);
    }
  }

  private async _updateRoomCleanTime(
    vac: VacuumConfig, roomName: string, elapsedMins: number
  ): Promise<void> {
    if (elapsedMins < 0.5 || elapsedMins > 120) return;
    const room = (vac.rooms ?? []).find(
      r => r.name === roomName || r.key === roomName
    );
    if (!room?.clean_time_entity) return;
    const currentVal = parseFloat(this.hass.states[room.clean_time_entity]?.state ?? "0");
    const newAvg = currentVal > 0
      ? Math.round(0.7 * currentVal + 0.3 * elapsedMins)
      : Math.round(elapsedMins);
    await this._call("input_number", "set_value", {
      entity_id: room.clean_time_entity,
      value: newAvg,
    });
  }

  private async _evalCleaningComplete(
    vacEntity: string, flight: InFlightCleaning
  ): Promise<void> {
    const actualMs = Date.now() - flight.startTime;
    const actualMins = Math.round(actualMs / 60_000);
    const success = flight.expectedMs === 0 || actualMs >= flight.expectedMs * 0.5;

    // Software repeat — restart if more passes remaining
    if (success && flight.repeatRemaining > 0 && flight.areaIds) {
      try {
        await this.hass.callService(
          "vacuum", "clean_area",
          { cleaning_area_id: flight.areaIds },
          { entity_id: vacEntity },
        );
      } catch (err) {
        console.error("[roborock-vacuum-card] repeat restart failed:", err);
        return;
      }
      this._inFlight.set(vacEntity, {
        ...flight,
        startTime: Date.now(),
        repeatRemaining: flight.repeatRemaining - 1,
      });
      return; // timestamps + notification fire only after last pass
    }

    // Auto-calibration: handle last room (no room_entered transition at session end)
    const lastRoom = this._prevRoomStates.get(vacEntity) ?? "";
    if (lastRoom) {
      const enterKey = vacEntity + ":" + lastRoom;
      const enterTime = this._roomEnterTimes.get(enterKey);
      if (enterTime) {
        const vacConf = this._config.vacuums.find(v => v.entity === vacEntity);
        if (vacConf) {
          const elapsedMins = (Date.now() - enterTime) / 60_000;
          await this._updateRoomCleanTime(vacConf, lastRoom, elapsedMins);
        }
        this._roomEnterTimes.delete(enterKey);
      }
    }

    const totalActualMins = Math.round((Date.now() - flight.originalStartTime) / 60_000);

    if (success) {
      const dt = new Date().toISOString().replace("T", " ").slice(0, 19);
      for (const room of flight.rooms) {
        if (room.last_clean_entity) {
          await this._call("input_datetime", "set_datetime", {
            entity_id: room.last_clean_entity,
            datetime: dt,
          });
        }
      }
      // Single-room time calibration: a run with exactly one room measures
      // that room's real total duration (incl. repeat passes) — store it
      // directly as the new estimate when the option is enabled.
      if (this._config.single_room_time && flight.rooms.length === 1) {
        const only = flight.rooms[0];
        if (only.clean_time_entity && totalActualMins >= 1 && totalActualMins <= 180) {
          await this._call("input_number", "set_value", {
            entity_id: only.clean_time_entity,
            value: totalActualMins,
          });
        }
      }
      // Clear room selection for this vacuum after successful clean
      const nextSel = new Map(this._localRoomSel);
      for (const room of flight.rooms) nextSel.delete(vacEntity + ":" + room.key);
      this._localRoomSel = nextSel;
      this._saveRoomSel(vacEntity);
    }
    this._fireHAEvent({
      action: "cleaning_finished",
      vacuum_entity: vacEntity,
      vacuum_label: flight.vacLabel,
      clean_type: flight.cleanType,
      rooms: flight.rooms.map(r => r.key),
      room_labels: flight.rooms.map(r => r.name).join(", "),
      estimated_mins: Math.round(flight.expectedMs / 60_000),
      actual_mins: totalActualMins,
      success,
    });
    await this._sendNotify(this._config.notify?.on_finish, {
      vacuum_label: flight.vacLabel,
      vacuum_entity: vacEntity,
      room_labels: flight.rooms.map(r => r.name).join(", "),
      room_keys: flight.rooms.map(r => r.key).join(", "),
      estimated_mins: Math.round(flight.expectedMs / 60_000),
      actual_mins: totalActualMins,
      clean_type: flight.cleanType,
      success: String(success),
    });
  }

  // ── localStorage persistence ──────────────────────────────────────────────

  private _saveShown(): void {
    try {
      const ids = [...this._shownSet].map(i => this._config.vacuums[i]?.entity).filter(Boolean);
      localStorage.setItem("roborock-card:shown", JSON.stringify(ids));
    } catch { /* storage unavailable */ }
  }

  private _loadShown(): Set<number> {
    try {
      const raw = localStorage.getItem("roborock-card:shown");
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const indices = ids
          .map(id => this._config.vacuums.findIndex(v => v.entity === id))
          .filter(i => i >= 0);
        if (indices.length > 0) return new Set(indices);
      }
    } catch { /* ignore */ }
    return new Set(this._config.vacuums.map((_, i) => i));
  }

  private _saveRoomSel(vacEntity: string): void {
    try {
      const prefix = vacEntity + ":";
      const sel: Record<string, boolean> = {};
      for (const [k, v] of this._localRoomSel.entries()) {
        if (k.startsWith(prefix)) sel[k.slice(prefix.length)] = v;
      }
      localStorage.setItem("roborock-card:sel:" + vacEntity, JSON.stringify(sel));
    } catch { /* ignore */ }
  }

  private _loadRoomSel(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    try {
      for (const vac of this._config.vacuums) {
        const raw = localStorage.getItem("roborock-card:sel:" + vac.entity);
        if (raw) {
          const sel: Record<string, boolean> = JSON.parse(raw);
          for (const [k, v] of Object.entries(sel)) {
            if (v) map.set(vac.entity + ":" + k, true);
          }
        }
      }
    } catch { /* ignore */ }
    return map;
  }

  // ── Notifications ──────────────────────────────────────────────────────

  private _resolveTemplate(tmpl: string, tokens: Record<string, string | number>): string {
    return tmpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(tokens[k] ?? ""));
  }

  private async _sendNotify(
    template: NotifyTemplates | undefined,
    tokens: Record<string, string | number>
  ): Promise<void> {
    const cfg = this._config.notify;
    if (!cfg || !template) return;
    const isWet = tokens["clean_type"] === "wet";
    const color = isWet ? (cfg.color_wet ?? "#2196F3") : (cfg.color_dry ?? "#4CAF50");
    const icon  = isWet ? "mdi:mop" : "mdi:robot-vacuum";
    const tag   = (cfg.tag_prefix ?? "roborock") + "-" + String(tokens["vacuum_entity"] ?? "");
    try {
      await this.hass.callService("ticker", "notify", {
        category: cfg.category,
        title:    template.title   ? this._resolveTemplate(template.title,   tokens) : undefined,
        message:  template.message ? this._resolveTemplate(template.message, tokens) : undefined,
        data: { data: { notification_icon: icon, color, priority: "high", tag } },
      });
    } catch (err) {
      console.error("[roborock-vacuum-card] notify failed:", err);
    }
  }

  private _pause(vac: VacuumConfig): void {
    this._call("vacuum", "pause", { entity_id: vac.entity });
  }

  private _resume(vac: VacuumConfig): void {
    this._call("vacuum", "start", { entity_id: vac.entity });
  }

  private _dock(vac: VacuumConfig): void {
    // Manual dock = user cancelled — never restart remaining software-repeat passes
    const flight = this._inFlight.get(vac.entity);
    if (flight && flight.repeatRemaining > 0) {
      this._inFlight.set(vac.entity, { ...flight, repeatRemaining: 0 });
    }
    this._call("vacuum", "return_to_base", { entity_id: vac.entity });
  }

  private _toggleRoom(room: RoomConfig, vac: VacuumConfig): void {
    const k = vac.entity + ":" + room.key;
    const next = new Map(this._localRoomSel);
    next.set(k, !(next.get(k) ?? false));
    this._localRoomSel = next;
    this._saveRoomSel(vac.entity);
  }

  private _selectAll(vac: VacuumConfig): void {
    const next = new Map(this._localRoomSel);
    for (const r of vac.rooms ?? []) next.set(vac.entity + ":" + r.key, true);
    this._localRoomSel = next;
    this._saveRoomSel(vac.entity);
  }

  private _deselectAll(vac: VacuumConfig): void {
    const next = new Map(this._localRoomSel);
    for (const r of vac.rooms ?? []) next.delete(vac.entity + ":" + r.key);
    this._localRoomSel = next;
    this._saveRoomSel(vac.entity);
  }

  private async _startClean(vac: VacuumConfig): Promise<void> {
    if (!vac.clean_action) return;

    const selected = (vac.rooms ?? []).filter((r) => this._isRoomSelected(r, vac));
    if (selected.length === 0) return;

    // Script strategy -- no in-flight tracking
    if (vac.clean_action.type === "script") {
      const action = vac.clean_action as ScriptCleanAction;
      const variables: Record<string, unknown> = {};
      for (const [key, template] of Object.entries(action.variables ?? {})) {
        variables[key] = template
          .replace("{{ entity }}", vac.entity)
          .replace("{{ selected_segments }}", JSON.stringify(selected.map((r) => r.segment_id).filter(Boolean)))
          .replace("{{ selected_room_keys }}", JSON.stringify(selected.map((r) => r.key)))
          .replace("{{ selected_area_ids }}", JSON.stringify(selected.map((r) => r.area_id).filter(Boolean)));
      }
      await this._call("script", "turn_on", { entity_id: action.entity_id, variables });
      return;
    }

    // Native variants: pre-set fan / mop, then call vacuum
    const nativeAction = vac.clean_action as NativeCleanAction | NativeAreaCleanAction | NativeAutoCleanAction;
    if (nativeAction.mop_mode_entity && nativeAction.mop_mode) {
      await this._call("select", "select_option", { entity_id: nativeAction.mop_mode_entity, option: nativeAction.mop_mode });
    }
    if (nativeAction.mop_intensity_entity && nativeAction.mop_intensity) {
      await this._call("select", "select_option", { entity_id: nativeAction.mop_intensity_entity, option: nativeAction.mop_intensity });
    }
    if (nativeAction.suction_level) {
      await this._call("vacuum", "set_fan_speed", { entity_id: vac.entity, fan_speed: nativeAction.suction_level });
    }

    if (vac.clean_action.type === "native-area") {
      // Uses HA vacuum.clean_area — area_id resolved via area_mappings
      try {
        await this.hass.callService(
          "vacuum", "clean_area",
          { cleaning_area_id: selected.map((r) =>
              r.area_id ?? this._config.area_mappings?.[r.key] ?? r.key) },
          { entity_id: vac.entity },
        );
      } catch (err) {
        console.error("[roborock-vacuum-card] vacuum.clean_area failed:", err);
        return; // don't register in-flight for a clean that never started
      }
    } else if (vac.clean_action.type === "native-auto") {
      // Dynamically resolve segment IDs from roborock.get_maps, then send_command
      const autoAction = vac.clean_action as NativeAutoCleanAction;
      let autoSegments: number[] = [];
      try {
        const mapResult = await (this.hass as any).callService(
          "roborock", "get_maps", {}, { entity_id: vac.entity }, false, true
        ) as { response?: Record<string, any> } | void;
        const maps = (mapResult as any)?.response?.[vac.entity]?.maps as
          Array<{ rooms?: Record<string, string> }> | undefined;
        const roomsMap: Record<string, string> = {};
        if (maps) {
          for (const m of maps) {
            if (m.rooms && Object.keys(m.rooms).length > 0) { Object.assign(roomsMap, m.rooms); break; }
          }
        }
        const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        const slugMap: Record<string, number> = {};
        for (const [sid, name] of Object.entries(roomsMap)) slugMap[slugify(name)] = Number(sid);
        for (const room of selected) {
          const areaId = room.area_id ?? this._config.area_mappings?.[room.key] ?? room.key;
          const sid = slugMap[areaId];
          if (sid !== undefined) {
            autoSegments.push(sid);
          } else if (room.segment_id !== undefined) {
            autoSegments.push(room.segment_id); // fallback to manual segment_id
          } else {
            console.warn("[roborock-vacuum-card] no segment for", room.key, "(area:", areaId + ")");
          }
        }
      } catch (err) {
        console.error("[roborock-vacuum-card] get_maps failed:", err);
        autoSegments = selected.map(r => r.segment_id).filter((id): id is number => id !== undefined);
      }
      if (autoSegments.length === 0) {
        console.error("[roborock-vacuum-card] native-auto: no segments resolved, aborting");
        return;
      }
      await this._call("vacuum", "send_command", {
        entity_id: vac.entity,
        command: "app_segment_clean",
        params: [{ segments: autoSegments, repeat: autoAction.repeat ?? 1 }],
      });
    } else {
      // type === "native" — segment IDs from room config
      const action = vac.clean_action as NativeCleanAction;
      const segments = selected.map((r) => r.segment_id).filter((id): id is number => id !== undefined);
      await this._call("vacuum", "send_command", {
        entity_id: vac.entity,
        command: "app_segment_clean",
        params: [{ segments, repeat: action.repeat ?? 1 }],
      });
    }
    // Register in-flight + fire event (shared for both native variants)
    const totalMins = this._totalCleanMins(vac);
    const vacLabel = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;
    const isNativeArea = vac.clean_action.type === "native-area";
    const nativeAreaAct = isNativeArea ? vac.clean_action as NativeAreaCleanAction : null;
    const areaIds = isNativeArea
      ? selected.map(r => r.area_id ?? this._config.area_mappings?.[r.key] ?? r.key)
      : undefined;
    const repeatRemaining = (nativeAreaAct?.repeat ?? 1) > 1
      ? (nativeAreaAct!.repeat!) - 1
      : 0;
    const now = Date.now();
    this._inFlight.set(vac.entity, {
      rooms: selected.map(r => ({ key: r.key, name: r.name, last_clean_entity: r.last_clean_entity, clean_time_entity: r.clean_time_entity })),
      expectedMs: totalMins * 60_000,
      startTime: now,
      originalStartTime: now,
      vacLabel,
      cleanType: this._deriveCleanType(vac),
      repeatRemaining,
      areaIds,
    });
    // Call notify_script if configured
    const nsCfg = this._config.notify_script;
    if (nsCfg?.entity) {
      const nsv = nsCfg.vars ?? {};
      const scriptVars: Record<string, string | number> = { vacuum_entity: vac.entity };
      if (nsv.vacuum_label   !== false) scriptVars.vacuum_label   = vacLabel;
      if (nsv.room_labels    !== false) scriptVars.room_labels    = selected.map(r => r.name).join(", ");
      if (nsv.room_keys      === true ) scriptVars.room_keys      = selected.map(r => r.key).join(", ");
      if (nsv.estimated_mins !== false) scriptVars.estimated_mins = Math.round(totalMins);
      if (nsv.clean_type     !== false) scriptVars.clean_type     = this._deriveCleanType(vac);
      await this._call("script", "turn_on", { entity_id: nsCfg.entity, variables: scriptVars });
    }
    this._fireHAEvent({
      action: "cleaning_started",
      vacuum_entity: vac.entity,
      vacuum_label: vacLabel,
      clean_type: this._deriveCleanType(vac),
      rooms: selected.map(r => r.key),
      room_labels: selected.map(r => r.name).join(", "),
      estimated_mins: Math.round(totalMins),
      // Helper entity IDs — consumed by the cleaning-tracker blueprint
      last_clean_entities: selected.map(r => r.last_clean_entity).filter((e): e is string => !!e),
      clean_time_entities: selected.map(r => r.clean_time_entity).filter((e): e is string => !!e),
    });
    await this._sendNotify(this._config.notify?.on_start, {
      vacuum_label: vacLabel,
      vacuum_entity: vac.entity,
      room_labels: selected.map(r => r.name).join(", "),
      room_keys: selected.map(r => r.key).join(", "),
      estimated_mins: Math.round(totalMins),
      clean_type: this._deriveCleanType(vac),
    });
  }

  // ── Render: badges ──────────────────────────────────────────────────────

  private _renderBadge(vac: VacuumConfig, index: number) {
    const active = this._shownSet.has(index);
    const cleaning = this._isCleaning(vac);
    const color = this._color(vac);
    const ck = this._colorKey(vac);
    const name = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;
    const holding = this._holdId === "badge-" + index;

    const bg = cleaning ? COLOR_BG_ACTIVE[ck] : active ? COLOR_BG[ck] : "rgba(30,30,30,0.85)";
    const border = cleaning
      ? "3px solid " + color
      : active
      ? "2px solid " + color + "80"
      : "2px solid rgba(255,255,255,0.18)";
    const shadow = cleaning
      ? "0 0 18px " + color + "B0"
      : active
      ? "0 0 8px " + color + "50"
      : "none";

    return html`
      <button
        class="badge ${holding ? "badge--holding" : ""}"
        style=${styleMap({ background: bg, border, boxShadow: shadow })}
        @pointerdown=${(e: PointerEvent) => {
          e.preventDefault();
          this._cancelHold();
          this._holdId = "badge-" + index;
          this._holdTimer = setTimeout(() => {
            this._holdTimer = null;
            this._holdId = null;
            this._toggleShown(index);
          }, HOLD_DURATION_MS);
        }}
        @pointerup=${() => {
          if (this._holdTimer !== null) {
            this._cancelHold();
            this._shownSet = new Set([index]);
            this._saveShown();
          } else {
            this._holdId = null;
          }
        }}
        @pointerleave=${this._holdEnd}
        @pointercancel=${this._holdEnd}
        aria-pressed=${active ? "true" : "false"}
        aria-label=${name}
      >
        <div class="hold-ring"></div>
        ${vac.image
          ? html`<img class="badge-img" src=${vac.image} alt=${name} />`
          : html`<ha-icon class="badge-icon" icon="mdi:robot-vacuum" style=${styleMap({ color })}></ha-icon>`}
        <span class="badge-name" style=${styleMap({ color: active ? "white" : "rgba(255,255,255,0.55)" })}>
          ${name}
        </span>
      </button>
    `;
  }

  private _renderGlobalBadge(ga: GlobalAction, idx: number) {
    const active = this._isGlobalActive(ga);
    const color = COLOR_HEX[ga.color ?? "orange"];
    const ck = ga.color ?? "orange";
    const holdId = "global-" + idx;
    const holding = this._holdId === holdId;

    const bg = active ? COLOR_BG_ACTIVE[ck] : "rgba(30,30,30,0.85)";
    const border = active ? "3px solid " + color : "2px solid rgba(255,255,255,0.18)";
    const shadow = active ? "0 0 18px " + color + "B0" : "none";

    return html`
      <button
        class="badge badge--global ${holding ? "badge--holding" : ""}"
        style=${styleMap({ background: bg, border, boxShadow: shadow })}
        @pointerdown=${this._holdStart(holdId, () => this._triggerGlobal(ga))}
        @pointerup=${this._holdEnd}
        @pointerleave=${this._holdEnd}
        @pointercancel=${this._holdEnd}
        aria-label=${ga.name}
        title=${"Hold to trigger: " + ga.name}
      >
        <div class="hold-ring"></div>
        ${ga.image
          ? html`<img class="badge-img" src=${ga.image} alt=${ga.name} />`
          : html`<ha-icon class="badge-icon" icon="mdi:home-floor-a" style=${styleMap({ color })}></ha-icon>`}
        <span class="badge-name" style=${styleMap({ color: active ? "white" : "rgba(255,255,255,0.55)" })}>
          ${ga.name}
        </span>
      </button>
    `;
  }

  // ── Render: map ─────────────────────────────────────────────────────────

  private _renderMap(vac: VacuumConfig) {
    if (!vac.map) return nothing;
    const { entity, rotation = 0, scale = 100, offset_x = 0, offset_y = 0 } = vac.map;
    const url = this._mapUrl(entity);
    if (!url) return nothing;

    return html`
      <div class="map-wrap">
        <img
          class="map-img"
          src=${url}
          alt="Vacuum map"
          style=${styleMap({
            left: (50 + offset_x) + "%",
            top:  (50 + offset_y) + "%",
            width: scale + "%",
            transform: "translate(-50%,-50%) rotate(" + rotation + "deg)",
          })}
        />
        ${(vac.rooms ?? []).map((r) => this._renderRoomOverlay(r, vac))}
      </div>
    `;
  }

  private _renderRoomOverlay(room: RoomConfig, vac: VacuumConfig) {
    const selected = this._isRoomSelected(room, vac);
    const color = this._color(vac);
    const ageColor = this._roomBorderColor(room, vac);
    const anchor = room.icon_anchor ?? "c";

    if (room.map_w !== undefined && room.map_h !== undefined) {
      // ── Rectangle mód ──────────────────────────────────────────
      const ANCHOR: Record<string, [string, string]> = {
        tl: ["flex-start","flex-start"], t:  ["center","flex-start"], tr: ["flex-end","flex-start"],
        l:  ["flex-start","center"],     c:  ["center","center"],     r:  ["flex-end","center"],
        bl: ["flex-start","flex-end"],   b:  ["center","flex-end"],   br: ["flex-end","flex-end"],
      };
      const [jc, ai] = ANCHOR[anchor] ?? ["center", "center"];
      const borderW = (selected
        ? (this._config.room_border_selected ?? 4)
        : (this._config.room_border_normal ?? 2)) + "px";
      const borderC = selected ? color + "E0" : ageColor;
      const bg = selected ? color + "44" : "rgba(0,0,0,0.06)";
      const shadow = selected ? "0 0 18px " + color + "60" : "none";
      return html`
        <button
          class="room-overlay"
          style=${styleMap({
            left: room.map_x + "%", top: room.map_y + "%",
            width: room.map_w + "%", height: room.map_h + "%",
            border: borderW + " solid " + borderC,
            background: bg, boxShadow: shadow,
            justifyContent: jc, alignItems: ai,
          })}
          @click=${() => this._toggleRoom(room, vac)}
          title=${room.name} aria-label=${room.name}
          aria-pressed=${selected ? "true" : "false"}
        >
          ${!this._config.room_icon_hidden && anchor !== "none" && room.icon ? html`
            <ha-icon icon=${room.icon}
              style=${styleMap({ color: selected ? "white" : ageColor, "--mdc-icon-size": "16px" })}>
            </ha-icon>
          ` : nothing}
        </button>
      `;
    }

    // ── Point mód (legacy) ──────────────────────────────────────
    const bg = selected ? color + "A8" : "rgba(0,0,0,0.55)";
    const shadow = selected ? "0 0 12px " + color + "80" : "none";
    return html`
      <button
        class="room-btn"
        style=${styleMap({
          left: room.map_x + "%", top: room.map_y + "%",
          background: bg,
          border: "4px solid " + ageColor,
          boxShadow: shadow,
        })}
        @click=${() => this._toggleRoom(room, vac)}
        title=${room.name} aria-label=${room.name}
        aria-pressed=${selected ? "true" : "false"}
      >
        ${!this._config.room_icon_hidden ? html`
          <ha-icon icon=${room.icon || "mdi:square"}
            style=${styleMap({ color: selected ? "white" : "rgba(255,255,255,0.5)" })}>
          </ha-icon>
        ` : nothing}
      </button>
    `;
  }

  // ── Render: status card ─────────────────────────────────────────────────

  private _renderStatusRow(vac: VacuumConfig) {
    const [label, labelColor] = this._statusInfo(vac);
    const bat = this._battery(vac);
    const lastClean = this._lastCleanStr(vac);

    // Current room
    const roomState = vac.current_room_entity
      ? this.hass.states[vac.current_room_entity]?.state
      : null;
    const currentRoom = roomState && roomState !== "unknown" && roomState !== "unavailable"
      ? roomState : null;

    // Error
    const errState = vac.error_entity
      ? this.hass.states[vac.error_entity]?.state
      : null;
    const hasError = errState && errState !== "none" && errState !== "unknown" && errState !== "unavailable";

    return html`
      ${hasError ? html`
        <div class="error-row">
          <ha-icon icon="mdi:alert-circle" style="color:#ff4d4f"></ha-icon>
          <span style="color:#ff4d4f;font-size:12px;font-weight:600">${errState}</span>
        </div>
      ` : nothing}
      <div class="status-row">
        <div class="status-main">
          <span class="status-label" style=${styleMap({ color: labelColor })}>${label}</span>
          ${currentRoom ? html`
            <span class="current-room">
              <ha-icon icon="mdi:map-marker" style="--mdc-icon-size:13px;color:rgba(255,255,255,0.4)"></ha-icon>
              ${currentRoom}
            </span>
          ` : nothing}
        </div>
        <div class="status-meta">
          ${bat !== null ? html`
            <div class="battery">
              <span style=${styleMap({ color: this._batColor(bat) })}>${bat}&thinsp;%</span>
              <ha-icon icon=${this._batIcon(bat)} style=${styleMap({ color: this._batColor(bat) })}></ha-icon>
            </div>
          ` : nothing}
          <div class="last-clean">
            <span>${lastClean}</span>
            <ha-icon icon="mdi:history"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  private _renderProgress(vac: VacuumConfig) {
    const prog = this._progress(vac);
    if (prog === null) return nothing;
    const color = this._color(vac);
    return html`
      <div class="progress">
        <div class="progress-track">
          <div class="progress-fill" style=${styleMap({ width: prog + "%", background: color })}></div>
        </div>
        <span class="progress-label" style=${styleMap({ color })}>${prog}&thinsp;%</span>
      </div>
    `;
  }

  private _renderActions(vac: VacuumConfig, vacIdx: number) {
    const cleaning = this._isCleaning(vac);
    const paused = this._isPaused(vac);
    const hasRooms = this._hasSelectedRooms(vac);
    const color = this._color(vac);
    const ck = this._colorKey(vac);
    const mins = this._totalCleanMins(vac);
    const timeStr = this._timeStr(mins);


    if (paused) {
      const hId = "resume-" + vacIdx;
      return html`
        <div class="actions">
          <button
            class="action-btn ${this._holdId === hId ? "action-btn--holding" : ""}"
            style=${styleMap({ background: COLOR_BG[ck], border: "1px solid " + color + "80" })}
            @pointerdown=${this._holdStart(hId, () => this._resume(vac))}
            @pointerup=${this._holdEnd}
            @pointerleave=${this._holdEnd}
            @pointercancel=${this._holdEnd}
          >
            <div class="hold-ring"></div>
            <ha-icon icon="mdi:play" style=${styleMap({ color })}></ha-icon>
            <span>Resume</span>
          </button>
          <button
            class="action-btn action-btn--secondary"
            @click=${() => this._dock(vac)}
          >
            <ha-icon icon="mdi:home" style="color:rgba(64,169,255,0.6)"></ha-icon>
            <span>Dock</span>
          </button>
        </div>
      `;
    }

    if (cleaning) {
      const hId = "pause-" + vacIdx;
      return html`
        <div class="actions">
          <button
            class="action-btn action-btn--warn ${this._holdId === hId ? "action-btn--holding" : ""}"
            @pointerdown=${this._holdStart(hId, () => this._pause(vac))}
            @pointerup=${this._holdEnd}
            @pointerleave=${this._holdEnd}
            @pointercancel=${this._holdEnd}
          >
            <div class="hold-ring"></div>
            <ha-icon icon="mdi:pause" style="color:#faad14"></ha-icon>
            <span>Pause</span>
          </button>
        </div>
      `;
    }

    const hId = "start-" + vacIdx;
    const startBg = hasRooms ? COLOR_BG[ck] : "rgba(60,60,60,0.4)";
    const startBorder = hasRooms ? "1px solid " + color + "80" : "1px solid rgba(255,255,255,0.1)";
    const startIconColor = hasRooms ? color : "rgba(255,255,255,0.2)";
    const startTextColor = hasRooms ? "white" : "rgba(255,255,255,0.25)";

    return html`
      <div class="actions">
        <button
          class="action-btn ${hasRooms && this._holdId === hId ? "action-btn--holding" : ""}"
          style=${styleMap({ background: startBg, border: startBorder })}
          ?disabled=${!hasRooms}
          @pointerdown=${hasRooms ? this._holdStart(hId, () => this._startClean(vac)) : nothing}
          @pointerup=${this._holdEnd}
          @pointerleave=${this._holdEnd}
          @pointercancel=${this._holdEnd}
        >
          <div class="hold-ring"></div>
          <ha-icon icon="mdi:rocket-launch" style=${styleMap({ color: startIconColor })}></ha-icon>
          <div class="start-body">
            <span style=${styleMap({ color: startTextColor })}>START</span>
            ${(vac.rooms ?? []).length > 0 ? html`
              <div class="room-icons">
                ${(vac.rooms ?? []).map(r => html`
                  <ha-icon
                    icon=${r.icon || "mdi:square"}
                    style=${styleMap({ color: this._isRoomSelected(r, vac) ? color : "rgba(255,255,255,0.15)" })}
                  ></ha-icon>
                `)}
              </div>
            ` : nothing}
            ${timeStr ? html`<small style="color:rgba(255,255,255,0.4)">${timeStr}</small>` : nothing}
            ${(vac.rooms ?? []).length > 1 ? html`
              <div class="sel-all-row">
                <button class="sel-link" @click=${(e: Event) => { e.stopPropagation(); this._selectAll(vac); }}>all</button>
                <span style="color:rgba(255,255,255,0.2)">·</span>
                <button class="sel-link" @click=${(e: Event) => { e.stopPropagation(); this._deselectAll(vac); }}>none</button>
              </div>
            ` : nothing}
          </div>
        </button>
      </div>
    `;
  }

  private _renderStatusCard(vac: VacuumConfig, vacIdx: number) {
    const cleaning = this._isCleaning(vac);
    const color = this._color(vac);
    const name = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;

    const cardBorder = cleaning ? "2px solid " + color : "1px solid rgba(255,255,255,0.08)";
    const cardShadow = cleaning ? "0 0 22px " + color + "40" : "none";
    const imgFilter = cleaning
      ? "drop-shadow(0 0 20px " + color + "D8)"
      : "drop-shadow(0 4px 12px " + color + "33)";

    return html`
      <div class="status-card" style=${styleMap({ border: cardBorder, boxShadow: cardShadow })}>
        <div class="status-left" style="cursor:pointer"
          @click=${() => this._fireMoreInfo(vac.entity)}
          title="Open ${name} info">
          <div class="model-label">${name}</div>
          ${vac.image ? html`
            <img class="vac-img" src=${vac.image} alt=${name}
              style=${styleMap({ opacity: cleaning ? "0.9" : "0.6", filter: imgFilter })}
            />
          ` : html`
            <ha-icon icon="mdi:robot-vacuum"
              style=${styleMap({ color, fontSize: "80px", opacity: cleaning ? "0.9" : "0.5" })}
            ></ha-icon>
          `}
        </div>
        <div class="status-right">
          ${this._renderStatusRow(vac)}
          ${this._renderProgress(vac)}
          ${this._renderActions(vac, vacIdx)}
        </div>
      </div>
    `;
  }

  // ── Main render ─────────────────────────────────────────────────────────

  render() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <ha-card>
        ${this.editMode ? html`<div class="version-chip">v${CARD_VERSION}</div>` : nothing}
        <div class="badges-row">
          ${this._config.vacuums.map((v, i) => this._renderBadge(v, i))}
          ${(this._config.global_actions ?? []).map((ga, i) => this._renderGlobalBadge(ga, i))}
        </div>
        ${[...this._shownSet]
          .filter(i => i < this._config.vacuums.length)
          .map(i => html`
            ${this._renderMap(this._config.vacuums[i])}
            ${this._renderStatusCard(this._config.vacuums[i], i)}
          `)}
      </ha-card>
    `;
  }

  // ── Styles ──────────────────────────────────────────────────────────────

  static styles = css`
    ha-card {
      position: relative;
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .version-chip {
      position: absolute;
      top: 0;
      right: 8px;
      font-size: 10px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.35);
      pointer-events: none;
      z-index: 2;
    }

    /* ── Badges ──────────────────────────────────────────────────────── */
    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .badge {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 18px 6px 6px;
      border-radius: 99px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: background 0.3s, border 0.3s, box-shadow 0.3s;
    }

    .badge-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .badge-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .badge-name {
      font-size: 15px;
      font-weight: 700;
      white-space: nowrap;
      transition: color 0.3s;
      position: relative;
      z-index: 1;
    }

    /* ── Hold ring (shared by badges and action buttons) ─────────────── */
    .hold-ring {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgba(255, 255, 255, 0.18);
      transform: scaleX(0);
      transform-origin: left;
      pointer-events: none;
      z-index: 0;
    }

    .action-btn--holding .hold-ring,
    .badge--holding .hold-ring {
      animation: hold-fill var(--hold-ms) linear forwards;
    }

    @keyframes hold-fill {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    /* ── Map ─────────────────────────────────────────────────────────── */
    .map-wrap {
      position: relative;
      width: 100%;
      padding-top: 27.5%;
      overflow: hidden;
      border-radius: 12px;
    }

    .map-img {
      position: absolute;
      transform-origin: center center;
      object-fit: cover;
    }

    /* ── Room buttons ────────────────────────────────────────────────── */
    .room-btn {
      position: absolute;
      width: 46px;
      height: 46px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      transition: background 0.2s, box-shadow 0.2s;
    }

    .room-btn ha-icon {
      --mdc-icon-size: 22px;
    }

    .room-overlay {
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      padding: 3px;
      transition: background 0.2s, border 0.3s, box-shadow 0.3s;
    }

    /* ── Status card ─────────────────────────────────────────────────── */
    .status-card {
      display: grid;
      grid-template-columns: 150px 1fr;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      overflow: hidden;
      transition: border 0.4s, box-shadow 0.4s;
    }

    .status-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 4px 0 0;
    }

    .model-label {
      font-size: 10px;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.3);
      text-transform: uppercase;
      text-align: center;
      margin-bottom: -10px;
    }

    .vac-img {
      width: 110%;
      margin-bottom: -15px;
      object-fit: contain;
      display: block;
      transition: opacity 0.5s, filter 0.5s;
    }

    .status-right {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ── Status row ──────────────────────────────────────────────────── */
    .status-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 12px 4px 16px;
    }

    .error-row {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px 0 16px; animation: pulse-error 2s ease-in-out infinite;
    }
    @keyframes pulse-error { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

    .status-main { display: flex; flex-direction: column; gap: 2px; }
    .status-label { font-size: 20px; font-weight: 700; }
    .current-room { display: flex; align-items: center; gap: 3px; font-size: 11px; color: rgba(255,255,255,0.45); }

    .status-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
      flex-shrink: 0;
    }

    .battery { display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; }
    .battery ha-icon { --mdc-icon-size: 15px; }

    .last-clean {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: rgba(255, 255, 255, 0.45);
    }
    .last-clean ha-icon { --mdc-icon-size: 12px; color: rgba(255, 255, 255, 0.25); }

    /* ── Progress bar ────────────────────────────────────────────────── */
    .progress { display: flex; align-items: center; gap: 8px; padding: 0 16px 4px; }
    .progress-track {
      flex: 1; height: 3px;
      background: rgba(255, 255, 255, 0.08); border-radius: 2px; overflow: hidden;
    }
    .progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
    .progress-label { font-size: 11px; font-weight: 600; flex-shrink: 0; }

    /* ── Action buttons ──────────────────────────────────────────────── */
    .actions { display: flex; gap: 8px; padding: 0 12px 14px; }

    .action-btn {
      position: relative;
      overflow: hidden;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
      font-family: inherit;
    }

    .action-btn:disabled { cursor: default; opacity: 0.7; }

    .action-btn ha-icon { --mdc-icon-size: 22px; flex-shrink: 0; position: relative; z-index: 1; }
    .action-btn span { font-size: 14px; font-weight: 700; color: white; position: relative; z-index: 1; }

    .action-btn--secondary {
      background: rgba(64, 169, 255, 0.08);
      border: 1px solid rgba(64, 169, 255, 0.2) !important;
    }

    .action-btn--warn {
      background: rgba(250, 173, 20, 0.18);
      border: 1px solid rgba(250, 173, 20, 0.5) !important;
    }

    /* ── Start button body ───────────────────────────────────────────── */
    .start-body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      position: relative;
      z-index: 1;
    }

    .start-body small { font-size: 10px; }

    .sel-all-row {
      display: flex; align-items: center; gap: 4px; margin-top: 1px;
    }
    .sel-link {
      background: none; border: none; cursor: pointer; padding: 0;
      font-size: 10px; font-family: inherit;
      color: rgba(255,255,255,0.3); transition: color .15s;
    }
    .sel-link:hover { color: rgba(255,255,255,0.7); }

    .room-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 1px;
    }

    .room-icons ha-icon { --mdc-icon-size: 14px; }
  `;
}

const customCards =
  ((window as Window & { customCards?: Array<Record<string, unknown>> }).customCards ??= []);
if (!customCards.some((c) => c["type"] === CARD_NAME)) {
  customCards.push({
    type: CARD_NAME,
    name: "Roborock Vacuum Card",
    description: "Feature-rich card for Roborock vacuums — map, room selection, multi-vacuum tabs, global actions.",
    preview: false,
    documentationURL: "https://github.com/Michailjovic/Vacuum-card",
  });
}
