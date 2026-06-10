import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import type {
  HomeAssistant,
  RoborockVacuumCardConfig,
  VacuumConfig,
  RoomConfig,
  MapConfig,
  CleanAction,
  NativeCleanAction,
  NativeAreaCleanAction,
  NativeAutoCleanAction,
  ScriptCleanAction,
  VacuumColor,
  GlobalAction,
  GlobalActionCall,
  RoomThreshold,
  NotifyConfig,
  NotifyTemplates,
  NotifyScriptConfig,
  NotifyScriptVars,
  NotifyScriptEvents,
  BackendConfig,
} from "./types";
import {
  EDITOR_NAME,
  CARD_VERSION,
  COLOR_HEX,
  BLUEPRINT_PATH,
  BLUEPRINT_VERSION,
  TRACKER_AUTOMATION_ID,
} from "./const";
import { BLUEPRINT_YAML } from "./blueprint";

// ── Tab type ─────────────────────────────────────────────────────────────────

type ActiveTab = "vacuums" | "maps" | "global";

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_VACUUM: VacuumConfig = {
  entity: "", name: "", color: "green", rooms: [],
  clean_action: { type: "native" },
};

const DEFAULT_ROOM: RoomConfig = {
  key: "", name: "", icon: "mdi:square", map_x: 50, map_y: 50,
};

const DEFAULT_MAP: MapConfig = {
  entity: "", rotation: 0, scale: 100, offset_x: 0, offset_y: 0,
};

const DEFAULT_GLOBAL: GlobalAction = {
  name: "Whole flat", color: "orange",
  watch_entities: [],
  action: { type: "script", entity_id: "" },
};

/** Must match the card's built-in defaults in _roomBorderColor() */
const DEFAULT_THRESHOLDS: RoomThreshold[] = [
  { days: 2, color: "#2ecc71" },
  { days: 5, color: "#faad14" },
  { days: 10, color: "#ff9800" },
];

// ── Editor ───────────────────────────────────────────────────────────────────

@customElement(EDITOR_NAME)
export class RoborockVacuumCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: RoborockVacuumCardConfig;

  // ── Navigation state ──────────────────────────────────────────────────────
  @state() private _tab: ActiveTab = "vacuums";

  // Accordion open state — always create new instances to trigger Lit reactivity
  @state() private _openVac     = new Set<number>();
  @state() private _openSensors = new Set<number>();
  @state() private _openAction  = new Set<number>();
  @state() private _openGlobal  = new Set<number>();
  // Per-vacuum: which roomIdx is open (null = none)
  @state() private _openRoom = new Map<number, number | null>();

  // Script preview state
  @state() private _scriptPreviewOpen = false;

  // Maps tab state
  @state() private _mapVac  = 0;
  @state() private _mapRoom: number | null = null;

  // Backend (blueprint) deploy state
  @state() private _bpStatus: "unknown" | "missing" | "outdated" | "current" = "unknown";
  @state() private _bpBusy: string | null = null;
  @state() private _bpMsg: string | null = null;
  @state() private _bpYamlOpen = false;

  private _initialized = false;

  setConfig(config: RoborockVacuumCardConfig): void {
    this._config = config;
    if (!this._initialized) {
      this._initialized = true;
      this._openVac = new Set((config.vacuums ?? []).map((_, i) => i));
    }
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass) {
      const dl = this.shadowRoot?.getElementById("ha-entities") as HTMLDataListElement | null;
      if (dl && !dl.options.length) {
        dl.innerHTML = Object.keys(this.hass.states).sort()
          .map(id => "<option value=\"" + id + "\">")
          .join("");
      }
    }
    // Lazy blueprint status fetch when the Global tab is visible
    if (this.hass && this._tab === "global" && this._bpStatus === "unknown") {
      this._refreshBlueprintStatus();
    }
  }

  // ── Config helpers ────────────────────────────────────────────────────────

  private _logCleanNow(entityId: string): void {
    const dt = new Date().toISOString().replace("T", " ").slice(0, 19);
    this.hass.callService("input_datetime", "set_datetime", {
      entity_id: entityId,
      datetime: dt,
    }).catch((e: unknown) => console.error("[editor] log clean now failed:", e));
  }

  private _fire(config: RoborockVacuumCardConfig): void {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config }, bubbles: true, composed: true,
    }));
  }

  private _setConfig(updates: Partial<RoborockVacuumCardConfig>): void {
    const next = { ...this._config, ...updates };
    this._config = next; this._fire(next);
  }

  private _setVacuum(idx: number, updates: Partial<VacuumConfig>): void {
    const vacuums = [...this._config.vacuums];
    vacuums[idx] = { ...vacuums[idx], ...updates };
    const next = { ...this._config, vacuums };
    this._config = next; this._fire(next);
  }

  private _setMap(vacIdx: number, updates: Partial<MapConfig>): void {
    const existing = this._config.vacuums[vacIdx].map ?? { ...DEFAULT_MAP };
    this._setVacuum(vacIdx, { map: { ...existing, ...updates } });
  }

  private _setRoom(vacIdx: number, roomIdx: number, updates: Partial<RoomConfig>): void {
    const rooms = [...(this._config.vacuums[vacIdx].rooms ?? [])];
    rooms[roomIdx] = { ...rooms[roomIdx], ...updates };
    this._setVacuum(vacIdx, { rooms });
  }

  private _setCleanAction(vacIdx: number, updates: Partial<CleanAction>): void {
    const existing = this._config.vacuums[vacIdx].clean_action ?? { type: "native" };
    this._setVacuum(vacIdx, { clean_action: { ...existing, ...updates } as CleanAction });
  }

  private _setGlobal(idx: number, updates: Partial<GlobalAction>): void {
    const global_actions = [...(this._config.global_actions ?? [])];
    global_actions[idx] = { ...global_actions[idx], ...updates };
    const next = { ...this._config, global_actions };
    this._config = next; this._fire(next);
  }

  private _setGlobalAction(idx: number, updates: Partial<GlobalActionCall>): void {
    const existing = this._config.global_actions?.[idx]?.action ?? { type: "script", entity_id: "" };
    this._setGlobal(idx, { action: { ...existing, ...updates } as GlobalActionCall });
  }

  private _setNotify(updates: Partial<NotifyConfig>): void {
    const existing = this._config.notify ?? { category: "Cleaning" };
    const next = { ...existing, ...updates };
    this._setConfig({ notify: next });
  }

  private _setNotifyTemplate(event: "on_start" | "on_finish", updates: Partial<NotifyTemplates>): void {
    const existing = this._config.notify?.[event] ?? {};
    this._setNotify({ [event]: { ...existing, ...updates } });
  }


  private _setNotifyScript(updates: Partial<NotifyScriptConfig>): void {
    const existing = this._config.notify_script ?? { entity: "" };
    this._setConfig({ notify_script: { ...existing, ...updates } });
  }

  private _setBackend(updates: Partial<BackendConfig>): void {
    const existing = this._config.backend ?? {};
    this._setConfig({ backend: { ...existing, ...updates } });
  }

  // ── Backend (blueprint) deploy ────────────────────────────────────────────

  /** Entity ID of the deployed tracker automation, or null */
  private _trackerAutomation(): string | null {
    for (const [id, st] of Object.entries(this.hass?.states ?? {})) {
      if (id.startsWith("automation.") && st.attributes["id"] === TRACKER_AUTOMATION_ID) {
        return id;
      }
    }
    return null;
  }

  private _bpFetching = false;

  private async _refreshBlueprintStatus(): Promise<void> {
    if (this._bpFetching) return;
    this._bpFetching = true;
    try {
      const res = await this.hass.callWS<Record<string, any>>({
        type: "blueprint/list", domain: "automation",
      });
      const bp = res?.[BLUEPRINT_PATH];
      if (!bp) { this._bpStatus = "missing"; return; }
      const name: string = bp?.metadata?.name ?? bp?.name ?? "";
      this._bpStatus = name.includes("v" + BLUEPRINT_VERSION) ? "current" : "outdated";
    } catch (err) {
      console.error("[editor] blueprint/list failed:", err);
      this._bpStatus = "missing";
    } finally {
      this._bpFetching = false;
    }
  }

  private async _installBlueprint(): Promise<void> {
    this._bpBusy = "blueprint"; this._bpMsg = null;
    try {
      await this.hass.callWS({
        type: "blueprint/save",
        domain: "automation",
        path: BLUEPRINT_PATH,
        yaml: BLUEPRINT_YAML,
        allow_override: true,
      });
      this._bpStatus = "current";
      this._bpMsg = "✅ Blueprint installed (v" + BLUEPRINT_VERSION + ")";
    } catch (err: any) {
      console.error("[editor] blueprint/save failed:", err);
      this._bpMsg = "❌ Blueprint install failed (admin required?): " + (err?.message ?? err);
    } finally {
      this._bpBusy = null;
    }
  }

  private async _deployAutomation(): Promise<void> {
    this._bpBusy = "automation"; this._bpMsg = null;
    const b: BackendConfig = this._config.backend ?? {};
    const automation = {
      alias: "Roborock Vacuum Card — Cleaning Tracker",
      description: "Managed by roborock-vacuum-card v" + CARD_VERSION + ". Recreate from the card editor (Global tab) after changes.",
      use_blueprint: {
        path: BLUEPRINT_PATH,
        input: {
          notify_service:   b.notify_service ?? "",
          notify_on_start:  b.notify_on_start  !== false,
          notify_on_finish: b.notify_on_finish !== false,
          notify_on_error:  b.notify_on_error  !== false,
          single_room_time: this._config.single_room_time === true,
        },
      },
    };
    try {
      await this.hass.callApi("post", "config/automation/config/" + TRACKER_AUTOMATION_ID, automation);
      this._bpMsg = "✅ Automation deployed";
    } catch (err: any) {
      console.error("[editor] automation deploy failed:", err);
      this._bpMsg = "❌ Automation deploy failed (admin required?): " + (err?.message ?? err);
    } finally {
      this._bpBusy = null;
    }
  }

  // ── Helper auto-creation ──────────────────────────────────────────────────

  private async _createHelper(
    vacIdx: number, roomIdx: number, kind: "last_clean" | "clean_time"
  ): Promise<void> {
    const vac = this._config.vacuums[vacIdx];
    const room = vac?.rooms?.[roomIdx];
    if (!vac || !room) return;
    const vacLabel = vac.name || vac.entity.split(".")[1] || "vacuum";
    const roomLabel = room.name || room.key || "room " + (roomIdx + 1);
    try {
      if (kind === "last_clean") {
        const res = await this.hass.callWS<{ id: string }>({
          type: "input_datetime/create",
          name: vacLabel + " " + roomLabel + " last clean",
          has_date: true,
          has_time: true,
          icon: "mdi:broom",
        });
        this._setRoom(vacIdx, roomIdx, { last_clean_entity: "input_datetime." + res.id });
      } else {
        const res = await this.hass.callWS<{ id: string }>({
          type: "input_number/create",
          name: vacLabel + " " + roomLabel + " clean time",
          min: 0, max: 180, step: 1,
          unit_of_measurement: "min",
          mode: "box",
          icon: "mdi:timer-outline",
        });
        this._setRoom(vacIdx, roomIdx, { clean_time_entity: "input_number." + res.id });
      }
    } catch (err: any) {
      console.error("[editor] helper create failed:", err);
      this._bpMsg = "❌ Helper creation failed (admin required?): " + (err?.message ?? err);
    }
  }

  private async _createMissingHelpers(vacIdx: number): Promise<void> {
    const count = this._config.vacuums[vacIdx]?.rooms?.length ?? 0;
    for (let i = 0; i < count; i++) {
      // re-read on every pass — _setRoom replaces the rooms array
      let r = this._config.vacuums[vacIdx]?.rooms?.[i];
      if (r && !r.last_clean_entity) await this._createHelper(vacIdx, i, "last_clean");
      r = this._config.vacuums[vacIdx]?.rooms?.[i];
      if (r && !r.clean_time_entity) await this._createHelper(vacIdx, i, "clean_time");
    }
  }

  // ── List mutations ────────────────────────────────────────────────────────

  private _moveVacuum(idx: number, dir: -1 | 1): void {
    const target = idx + dir;
    const vacuums = [...this._config.vacuums];
    if (target < 0 || target >= vacuums.length) return;
    [vacuums[idx], vacuums[target]] = [vacuums[target], vacuums[idx]];
    const next = { ...this._config, vacuums };
    this._config = next; this._fire(next);
  }

  private _addVacuum(): void {
    const vacuums = [...this._config.vacuums, { ...DEFAULT_VACUUM }];
    const next = { ...this._config, vacuums };
    this._config = next; this._fire(next);
    const newIdx = vacuums.length - 1;
    this._openVac = new Set([...this._openVac, newIdx]);
  }

  private _deleteVacuum(idx: number): void {
    const vacuums = this._config.vacuums.filter((_, i) => i !== idx);
    const next = { ...this._config, vacuums };
    this._config = next; this._fire(next);
    const s = new Set(this._openVac); s.delete(idx);
    this._openVac = s;
  }

  private _addRoom(vacIdx: number): void {
    const rooms = [...(this._config.vacuums[vacIdx].rooms ?? []), { ...DEFAULT_ROOM }];
    this._setVacuum(vacIdx, { rooms });
    const m = new Map(this._openRoom);
    m.set(vacIdx, rooms.length - 1);
    this._openRoom = m;
  }

  private _deleteRoom(vacIdx: number, roomIdx: number): void {
    const rooms = (this._config.vacuums[vacIdx].rooms ?? []).filter((_, i) => i !== roomIdx);
    this._setVacuum(vacIdx, { rooms });
    const openIdx = this._openRoom.get(vacIdx);
    if (openIdx === roomIdx) {
      const m = new Map(this._openRoom); m.set(vacIdx, null);
      this._openRoom = m;
    }
    if (this._mapRoom === roomIdx) this._mapRoom = null;
  }

  private _addGlobal(): void {
    const global_actions = [...(this._config.global_actions ?? []), { ...DEFAULT_GLOBAL }];
    const next = { ...this._config, global_actions };
    this._config = next; this._fire(next);
    const newIdx = global_actions.length - 1;
    this._openGlobal = new Set([...this._openGlobal, newIdx]);
  }

  private _deleteGlobal(idx: number): void {
    const global_actions = (this._config.global_actions ?? []).filter((_, i) => i !== idx);
    const next = { ...this._config, global_actions };
    this._config = next; this._fire(next);
    const s = new Set(this._openGlobal); s.delete(idx);
    this._openGlobal = s;
  }

  // ── Accordion toggle helpers ──────────────────────────────────────────────

  private _toggleVac(idx: number): void {
    const s = new Set(this._openVac);
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    this._openVac = s;
  }

  private _toggleRoom(vacIdx: number, roomIdx: number): void {
    const m = new Map(this._openRoom);
    const cur = m.get(vacIdx) ?? null;
    m.set(vacIdx, cur === roomIdx ? null : roomIdx);
    this._openRoom = m;
  }

  private _toggleSensors(vacIdx: number): void {
    const s = new Set(this._openSensors);
    if (s.has(vacIdx)) s.delete(vacIdx); else s.add(vacIdx);
    this._openSensors = s;
  }

  private _toggleAction(vacIdx: number): void {
    const s = new Set(this._openAction);
    if (s.has(vacIdx)) s.delete(vacIdx); else s.add(vacIdx);
    this._openAction = s;
  }

  private _toggleGlobal(idx: number): void {
    const s = new Set(this._openGlobal);
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    this._openGlobal = s;
  }

  // ── Shared field helpers ──────────────────────────────────────────────────

  private _entityPicker(label: string, value: string | undefined, domains: string[],
    onChange: (v: string) => void, required = false) {
    const ph = domains.length ? domains.join(" / ") : "entity_id";
    const isSingle = domains.length === 1;
    const listId = isSingle ? "ha-ents-" + domains[0] : "ha-entities";
    const filtered = isSingle
      ? Object.keys(this.hass?.states ?? {}).filter(id => id.startsWith(domains[0] + ".")).sort()
      : null;
    return html`
      ${filtered ? html`<datalist id=${listId}>${filtered.map(id => html`<option value=${id}>`)}</datalist>` : nothing}
      <div class="field">
        <label>${label}${required ? html`<span class="required"> *</span>` : nothing}</label>
        <input class="text-input" type="text" list=${listId}
          .value=${value ?? ""} placeholder=${ph}
          @input=${(e: Event) => { const v = (e.target as HTMLInputElement).value;
            if (v === "" || this.hass.states[v]) onChange(v); }}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)} />
      </div>`;
  }

  private _textField(label: string, value: string | undefined, onChange: (v: string) => void, placeholder = "") {
    return html`
      <div class="field">
        <label>${label}</label>
        <input class="text-input" type="text" .value=${value ?? ""} placeholder=${placeholder}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)} />
      </div>`;
  }

  private _numberSlider(label: string, value: number | undefined, min: number, max: number, step: number,
    onChange: (v: number) => void, suffix = "") {
    const cur = value ?? 0;
    return html`
      <div class="field field--row">
        <label>${label}</label>
        <div class="slider-wrap">
          <input type="range" class="slider" min=${min} max=${max} step=${step} .value=${String(cur)}
            @input=${(e: Event) => onChange(Number((e.target as HTMLInputElement).value))} />
          <span class="slider-val">${cur}${suffix}</span>
        </div>
      </div>`;
  }

  private _selectField<T extends string>(label: string, value: T,
    options: Array<{ value: T; label: string }>, onChange: (v: T) => void) {
    return html`
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input" @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value as T)}>
          ${options.map(o => html`<option value=${o.value} ?selected=${o.value === value}>${o.label}</option>`)}
        </select>
      </div>`;
  }

  private _optionSelectFromList(label: string, opts: string[], value: string | undefined,
    onChange: (v: string) => void) {
    return html`
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input"
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="">— none —</option>
          ${opts.map(o => html`<option value=${o} ?selected=${o === value}>${o}</option>`)}
        </select>
      </div>`;
  }

  private _optionSelect(label: string, entity: string | undefined,
    value: string | undefined, onChange: (v: string) => void) {
    const opts: string[] = entity
      ? ((this.hass.states[entity]?.attributes["options"] as string[]) ?? [])
      : [];
    if (!opts.length) return this._textField(label, value, onChange, "e.g. balanced");
    return html`
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input"
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="">— none —</option>
          ${opts.map(o => html`<option value=${o} ?selected=${o === value}>${o}</option>`)}
        </select>
      </div>`;
  }

  private _iconPickerField(value: string | undefined, onChange: (v: string) => void) {
    return html`
      <div class="field">
        <label>Icon</label>
        <ha-icon-picker .value=${value ?? "mdi:square"}
          @value-changed=${(e: CustomEvent) => onChange(e.detail.value)}
        ></ha-icon-picker>
      </div>`;
  }


  private _areaPicker(label: string, value: string | undefined, onChange: (v: string) => void) {
    const areas = Object.values((this.hass as any)?.areas ?? {}) as Array<{area_id: string; name: string}>;
    if (!areas.length) return this._textField(label, value, onChange, "e.g. living_room");
    return html`
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input"
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="">— not mapped —</option>
          ${[...areas].sort((a, b) => a.name.localeCompare(b.name)).map(a =>
            html`<option value=${a.area_id} ?selected=${a.area_id === value}>${a.name}</option>`)}
        </select>
      </div>`;
  }

  // ── Tab: Vacuums ──────────────────────────────────────────────────────────

  private _renderVacuumsTab() {
    return html`
      <div class="tab-body">
        ${this._config.vacuums.length === 0
          ? html`<p class="hint">No vacuums yet. Add one below.</p>`
          : this._config.vacuums.map((vac, i) => this._renderVacuumAccordion(vac, i))}
        <button class="btn btn--add" @click=${() => this._addVacuum()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add vacuum
        </button>
      </div>`;
  }

  private _renderVacuumAccordion(vac: VacuumConfig, idx: number) {
    const color = COLOR_HEX[vac.color ?? "green"];
    const isOpen = this._openVac.has(idx);
    return html`
      <div class="acc-row" style=${styleMap({ borderLeft: "3px solid " + color })}>
        <div class="acc-header" @click=${() => this._toggleVac(idx)}>
          ${vac.image
            ? html`<img class="acc-img" src=${vac.image} alt=${vac.name ?? ""} />`
            : html`<ha-icon icon="mdi:robot-vacuum" style=${styleMap({ color, width: "36px", height: "36px" })}></ha-icon>`}
          <div class="acc-info">
            <span class="acc-name">${vac.name || vac.entity || "Unnamed vacuum"}</span>
            <span class="acc-sub">${vac.entity}</span>
          </div>
          <button class="icon-btn" ?disabled=${idx === 0}
            @click=${(e: Event) => { e.stopPropagation(); this._moveVacuum(idx, -1); }}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button class="icon-btn" ?disabled=${idx === this._config.vacuums.length - 1}
            @click=${(e: Event) => { e.stopPropagation(); this._moveVacuum(idx, 1); }}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button class="icon-btn icon-btn--danger"
            @click=${(e: Event) => { e.stopPropagation(); this._deleteVacuum(idx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>

        ${isOpen ? html`
          <div class="acc-body">

            <div class="section-title">Basic</div>
            ${this._entityPicker("Vacuum entity", vac.entity, ["vacuum"],
              v => this._setVacuum(idx, { entity: v }), true)}
            ${this._textField("Display name", vac.name,
              v => this._setVacuum(idx, { name: v }), "e.g. S8")}
            ${this._textField("Image path", vac.image,
              v => this._setVacuum(idx, { image: v }), "/local/...")}
            ${this._selectField<VacuumColor>("Accent colour", vac.color ?? "green",
              [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }],
              v => this._setVacuum(idx, { color: v }))}

            ${this._renderSensorsSection(idx, vac)}
            ${this._renderCleanActionSection(idx, vac)}

            <div class="section-title">Rooms (${(vac.rooms ?? []).length})</div>
            ${(vac.rooms ?? []).map((r, ri) => this._renderRoomAccordion(r, idx, ri))}
            <button class="btn btn--add" @click=${() => this._addRoom(idx)}>
              <ha-icon icon="mdi:plus"></ha-icon> Add room
            </button>
            ${(vac.rooms ?? []).some(r => !r.last_clean_entity || !r.clean_time_entity) ? html`
              <button class="btn btn--sm" style="align-self:flex-start"
                @click=${() => this._createMissingHelpers(idx)}>
                <ha-icon icon="mdi:auto-fix"></ha-icon> Create missing helpers for all rooms
              </button>
            ` : nothing}

          </div>
        ` : nothing}
      </div>`;
  }

  private _renderSensorsSection(vacIdx: number, vac: VacuumConfig) {
    const isOpen = this._openSensors.has(vacIdx);
    const configured = [vac.status_entity, vac.battery_entity, vac.last_clean_entity,
      vac.progress_entity, vac.current_room_entity, vac.error_entity].filter(Boolean).length;
    return html`
      <div class="collapsible">
        <div class="collapsible-header" @click=${() => this._toggleSensors(vacIdx)}>
          <span class="collapsible-title">Sensors</span>
          ${configured ? html`<span class="badge">${configured} configured</span>` : nothing}
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? html`
          <div class="collapsible-body">
            ${this._entityPicker("Status", vac.status_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { status_entity: v || undefined }))}
            ${this._entityPicker("Battery", vac.battery_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { battery_entity: v || undefined }))}
            ${this._entityPicker("Last clean end", vac.last_clean_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { last_clean_entity: v || undefined }))}
            ${this._entityPicker("Progress", vac.progress_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { progress_entity: v || undefined }))}
            ${this._entityPicker("Current room", vac.current_room_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { current_room_entity: v || undefined }))}
            ${this._entityPicker("Error", vac.error_entity, ["sensor"],
              v => this._setVacuum(vacIdx, { error_entity: v || undefined }))}
          </div>
        ` : nothing}
      </div>`;
  }

  private _renderCleanActionSection(vacIdx: number, vac: VacuumConfig) {
    const isOpen = this._openAction.has(vacIdx);
    const action = vac.clean_action ?? { type: "native" as const };
    return html`
      <div class="collapsible">
        <div class="collapsible-header" @click=${() => this._toggleAction(vacIdx)}>
          <span class="collapsible-title">Clean action</span>
          <span class="badge">${action.type}</span>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? html`
          <div class="collapsible-body">
            ${this._renderCleanActionEditor(vacIdx, vac)}
          </div>
        ` : nothing}
      </div>`;
  }

  private _renderCleanActionEditor(vacIdx: number, vac: VacuumConfig) {
    const action = vac.clean_action ?? { type: "native" as const };
    return html`
      ${this._selectField<"native" | "native-area" | "native-auto" | "script">("Strategy", action.type,
        [{ value: "native",      label: "Native (vacuum.send_command + segment IDs)" },
         { value: "native-auto", label: "Native auto (auto-resolve IDs from roborock.get_maps)" },
         { value: "native-area", label: "Native area (vacuum.clean_area)" },
         { value: "script",      label: "Custom script" }],
        v => {
          if (v === "script") {
            this._setVacuum(vacIdx, { clean_action: { type: "script", entity_id: "" } });
            return;
          }
          // Carry shared settings over when switching between native variants
          const prev = this._config.vacuums[vacIdx]?.clean_action;
          const carry: Record<string, unknown> = {};
          if (prev && prev.type !== "script") {
            for (const k of ["repeat", "suction_level", "mop_mode_entity", "mop_mode",
              "mop_intensity_entity", "mop_intensity"] as const) {
              const val = (prev as unknown as Record<string, unknown>)[k];
              if (val !== undefined) carry[k] = val;
            }
          }
          this._setVacuum(vacIdx, { clean_action: { type: v, ...carry } as CleanAction });
        })}
      ${action.type === "script"
        ? this._renderScriptAction(vacIdx, action as ScriptCleanAction)
        : this._renderNativeOptions(vacIdx,
            action as NativeCleanAction | NativeAutoCleanAction | NativeAreaCleanAction)}`;
  }

  /** Shared editor for all three native strategies — only the hint differs */
  private _renderNativeOptions(
    vacIdx: number,
    action: NativeCleanAction | NativeAutoCleanAction | NativeAreaCleanAction
  ) {
    const hint =
      action.type === "native-area"
        ? html`<p class="hint">Calls <code>vacuum.clean_area</code>. Repeat is implemented in software — the card restarts cleaning after each pass (robot docks between passes).</p>`
        : action.type === "native-auto"
          ? html`<p class="hint">Calls <code>roborock.get_maps</code> at clean time, matches rooms via Area mappings (Global tab), then sends <code>vacuum.send_command</code> with <code>app_segment_clean</code>. Supports native repeat. Falls back to <code>segment_id</code> if auto-resolve fails.</p>`
          : nothing;
    return html`
      <div class="sub-section">
        ${hint}
        ${this._numberSlider("Repeat passes", action.repeat ?? 1, 1, 3, 1,
          v => this._setCleanAction(vacIdx, { repeat: v }))}
        <div class="sub-title">Suction level (optional)</div>
        ${(() => {
          const speeds: string[] = (this.hass.states[this._config.vacuums[vacIdx]?.entity]
            ?.attributes["fan_speed_list"] as string[]) ?? [];
          return speeds.length
            ? this._optionSelectFromList("Suction option", speeds, action.suction_level,
                v => this._setCleanAction(vacIdx, { suction_level: v || undefined }))
            : this._textField("Suction option", action.suction_level,
                v => this._setCleanAction(vacIdx, { suction_level: v || undefined }), "e.g. balanced");
        })()}
        <div class="sub-title">Mop mode (optional)</div>
        ${this._entityPicker("Mop mode entity", action.mop_mode_entity, ["select"],
          v => this._setCleanAction(vacIdx, { mop_mode_entity: v || undefined }))}
        ${action.mop_mode_entity ? this._optionSelect("Mop mode option", action.mop_mode_entity, action.mop_mode,
          v => this._setCleanAction(vacIdx, { mop_mode: v || undefined })) : nothing}
        <div class="sub-title">Mop intensity (optional)</div>
        ${this._entityPicker("Mop intensity entity", action.mop_intensity_entity, ["select"],
          v => this._setCleanAction(vacIdx, { mop_intensity_entity: v || undefined }))}
        ${action.mop_intensity_entity ? this._optionSelect("Mop intensity option", action.mop_intensity_entity, action.mop_intensity,
          v => this._setCleanAction(vacIdx, { mop_intensity: v || undefined })) : nothing}
      </div>`;
  }

  private _renderScriptAction(vacIdx: number, action: ScriptCleanAction) {
    const vars = action.variables ?? {};
    const entries = Object.entries(vars);
    return html`
      <div class="sub-section">
        ${this._entityPicker("Script entity", action.entity_id, ["script"],
          v => this._setCleanAction(vacIdx, { entity_id: v }))}
        <p class="hint">Tokens: {{ entity }}, {{ selected_segments }}, {{ selected_room_keys }}, {{ selected_area_ids }}</p>
        ${entries.map(([key, val], vi) => html`
          <div class="var-row">
            <input class="text-input text-input--half" .value=${key} placeholder="name"
              @change=${(e: Event) => {
                const newKey = (e.target as HTMLInputElement).value;
                const newVars = Object.fromEntries(entries.map(([k, v], i) => [i === vi ? newKey : k, v]));
                this._setCleanAction(vacIdx, { variables: newVars });
              }} />
            <span class="var-sep">&#8594;</span>
            <input class="text-input text-input--half" .value=${val} placeholder="{{ entity }}"
              @change=${(e: Event) => {
                const newVars = { ...vars, [key]: (e.target as HTMLInputElement).value };
                this._setCleanAction(vacIdx, { variables: newVars });
              }} />
            <button class="icon-btn icon-btn--danger icon-btn--sm"
              @click=${() => {
                const newVars = Object.fromEntries(entries.filter((_, i) => i !== vi));
                this._setCleanAction(vacIdx, { variables: newVars });
              }}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>`)}
        <button class="btn btn--add btn--sm"
          @click=${() => this._setCleanAction(vacIdx, { variables: { ...vars, "": "" } })}>
          <ha-icon icon="mdi:plus"></ha-icon> Add variable
        </button>
      </div>`;
  }

  private _renderRoomAccordion(room: RoomConfig, vacIdx: number, roomIdx: number) {
    const isOpen = (this._openRoom.get(vacIdx) ?? null) === roomIdx;
    return html`
      <div class="room-acc">
        <div class="room-acc-header" @click=${() => this._toggleRoom(vacIdx, roomIdx)}>
          <ha-icon class="room-acc-icon" icon=${room.icon || "mdi:square"}></ha-icon>
          <div class="room-acc-info">
            <span class="room-acc-name">${room.name || room.key || "Unnamed room"}</span>
            ${room.segment_id !== undefined
              ? html`<span class="room-acc-meta">seg ${room.segment_id}</span>` : nothing}
          </div>
          <button class="icon-btn icon-btn--danger icon-btn--sm"
            @click=${(e: Event) => { e.stopPropagation(); this._deleteRoom(vacIdx, roomIdx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? html`
          <div class="room-acc-body">
            ${this._textField("Key (unique ID)", room.key,
              v => this._setRoom(vacIdx, roomIdx, { key: v }), "e.g. bedroom")}
            ${this._textField("Display name", room.name,
              v => this._setRoom(vacIdx, roomIdx, { name: v }), "e.g. Bedroom")}
            ${(this._config.vacuums[vacIdx]?.clean_action?.type === "native-area" ||
               this._config.vacuums[vacIdx]?.clean_action?.type === "native-auto")
              ? html`
                <div class="field field--row">
                  <label>Effective area</label>
                  <strong style="font-size:13px">${
                    /* must mirror the card's resolution order */
                    room.area_id ?? this._config.area_mappings?.[room.key] ?? room.key
                  }</strong>
                </div>
                <p class="hint map-hint" @click=${() => { this._tab = "global"; }}>
                  Set in <strong>Global tab → Area mappings</strong> →
                </p>`
              : html`
                <div class="field field--row">
                  <label>Segment ID</label>
                  <input class="text-input text-input--sm" type="number"
                    .value=${String(room.segment_id ?? "")} placeholder="e.g. 16"
                    @change=${(e: Event) => {
                      const v = parseInt((e.target as HTMLInputElement).value);
                      this._setRoom(vacIdx, roomIdx, { segment_id: isNaN(v) ? undefined : v });
                    }} />
                </div>
                <p class="hint">Find IDs: Developer Tools → Actions → roborock.get_maps</p>`}
            ${this._numberSlider("Est. clean time (fallback)", room.clean_time_mins ?? 0, 0, 120, 1,
              v => this._setRoom(vacIdx, roomIdx, { clean_time_mins: v > 0 ? v : undefined }), " min")}
            ${this._entityPicker("Auto-calibration (input_number)", room.clean_time_entity, ["input_number"],
              v => this._setRoom(vacIdx, roomIdx, { clean_time_entity: v || undefined }))}
            ${room.clean_time_entity ? html`
              <p class="hint">Card measures actual room time and writes rolling average here automatically.</p>
            ` : html`
              <button class="btn btn--add btn--sm" style="align-self:flex-start"
                @click=${() => this._createHelper(vacIdx, roomIdx, "clean_time")}>
                <ha-icon icon="mdi:plus"></ha-icon> Create input_number helper
              </button>
            `}
            ${this._entityPicker("Last clean (input_datetime)", room.last_clean_entity, ["input_datetime"],
              v => this._setRoom(vacIdx, roomIdx, { last_clean_entity: v || undefined }))}
            ${!room.last_clean_entity ? html`
              <button class="btn btn--add btn--sm" style="align-self:flex-start"
                @click=${() => this._createHelper(vacIdx, roomIdx, "last_clean")}>
                <ha-icon icon="mdi:plus"></ha-icon> Create input_datetime helper
              </button>
            ` : nothing}
            ${room.last_clean_entity ? html`
              <button class="btn btn--sm" style="align-self:flex-start"
                @click=${() => this._logCleanNow(room.last_clean_entity!)}>
                ✓ Log clean now
              </button>
            ` : nothing}
            <p class="hint map-hint" @click=${() => { this._tab = "maps"; this._mapVac = vacIdx; this._mapRoom = roomIdx; }}>
              📍 Set position &amp; icon in the <strong>Maps tab</strong> →
            </p>
          </div>
        ` : nothing}
      </div>`;
  }

  // ── Tab: Maps ─────────────────────────────────────────────────────────────

  private _renderMapsTab() {
    const vacuums = this._config.vacuums;
    if (!vacuums.length) {
      return html`<div class="tab-body"><p class="hint">No vacuums configured. Add one in the Vacuums tab.</p></div>`;
    }
    const mapVac = Math.min(this._mapVac, vacuums.length - 1);
    const vac = vacuums[mapVac];
    const map = vac.map ?? { ...DEFAULT_MAP };
    const mapUrl = map.entity
      ? ((this.hass.states[map.entity]?.attributes["entity_picture"] as string) ?? "") : "";
    const rooms = vac.rooms ?? [];

    return html`
      <div class="tab-body">

        ${vacuums.length > 1 ? html`
          <div class="pill-row">
            ${vacuums.map((v, i) => html`
              <button class="vac-pill ${i === mapVac ? "vac-pill--active" : ""}"
                @click=${() => { this._mapVac = i; this._mapRoom = null; }}>
                ${v.name || v.entity || "Vacuum " + (i + 1)}
              </button>`)}
          </div>
        ` : nothing}

        ${this._entityPicker("Map image entity", map.entity, ["image"],
          v => this._setMap(mapVac, { entity: v }))}

        ${mapUrl ? html`
          <div class="map-pos-container ${this._mapRoom !== null ? "map-pos-container--active" : ""}"
            @click=${(e: MouseEvent) => {
              if (this._mapRoom === null) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              this._setRoom(mapVac, this._mapRoom, { map_x: x, map_y: y });
            }}>
            <div class="map-preview-wrap">
              <img class="map-preview-img" src=${mapUrl} alt="Map preview"
                style=${styleMap({
                  left:      (50 + (map.offset_x ?? 0)) + "%",
                  top:       (50 + (map.offset_y ?? 0)) + "%",
                  width:     (map.scale ?? 100) + "%",
                  transform: "translate(-50%,-50%) rotate(" + (map.rotation ?? 0) + "deg)",
                })} />
              ${rooms.map((r, ri) => html`
                <div class="pos-dot ${ri === this._mapRoom ? "pos-dot--active" : ""}"
                  style=${styleMap({ left: r.map_x + "%", top: r.map_y + "%" })}
                  @click=${(e: Event) => { e.stopPropagation(); this._mapRoom = ri === this._mapRoom ? null : ri; }}>
                  <ha-icon icon=${r.icon || "mdi:square"} style="--mdc-icon-size:14px"></ha-icon>
                </div>`)}
            </div>
          </div>

          <div class="section-title">Calibration</div>
          ${this._numberSlider("Rotation",  map.rotation  ?? 0,    0, 360, 90, v => this._setMap(mapVac, { rotation:  v }), "°")}
          ${this._numberSlider("Scale",     map.scale     ?? 100, 50, 200,  5, v => this._setMap(mapVac, { scale:     v }), "%")}
          ${this._numberSlider("Offset X",  map.offset_x  ?? 0,  -50,  50,  1, v => this._setMap(mapVac, { offset_x:  v }), "%")}
          ${this._numberSlider("Offset Y",  map.offset_y  ?? 0,  -50,  50,  1, v => this._setMap(mapVac, { offset_y:  v }), "%")}

          ${rooms.length ? html`
            <div class="section-title">Room positions</div>
            <p class="hint">${this._mapRoom !== null
              ? "Click the map to move the selected room. Click the dot to deselect."
              : "Select a room below, then click the map to set its position."}</p>
            <div class="pill-row">
              ${rooms.map((r, ri) => html`
                <button class="room-pill ${ri === this._mapRoom ? "room-pill--active" : ""}"
                  @click=${() => { this._mapRoom = ri === this._mapRoom ? null : ri; }}>
                  <ha-icon icon=${r.icon || "mdi:square"} style="--mdc-icon-size:13px"></ha-icon>
                  ${r.name || r.key || "Room " + (ri + 1)}
                </button>`)}
            </div>

            ${this._mapRoom !== null ? html`
              <div class="section-title" style="margin-top:4px">Position</div>
              ${this._numberSlider("X", rooms[this._mapRoom]?.map_x ?? 50, 0, 100, 1,
                v => this._setRoom(mapVac, this._mapRoom!, { map_x: v }), "%")}
              ${this._numberSlider("Y", rooms[this._mapRoom]?.map_y ?? 50, 0, 100, 1,
                v => this._setRoom(mapVac, this._mapRoom!, { map_y: v }), "%")}

              <div class="section-title" style="margin-top:4px">Overlay mode</div>
              ${(() => {
                const room = rooms[this._mapRoom!];
                return room?.map_w !== undefined ? html`
                  ${this._numberSlider("Width",  room.map_w,        1, 100, 1, v => this._setRoom(mapVac, this._mapRoom!, { map_w: v }), "%")}
                  ${this._numberSlider("Height", room.map_h ?? 15,  1, 100, 1, v => this._setRoom(mapVac, this._mapRoom!, { map_h: v }), "%")}
                  <button class="btn btn--sm" style="align-self:flex-start"
                    @click=${() => this._setRoom(mapVac, this._mapRoom!, { map_w: undefined, map_h: undefined })}>
                    Switch to point mode
                  </button>
                ` : html`
                  <button class="btn btn--add btn--sm" style="align-self:flex-start"
                    @click=${() => this._setRoom(mapVac, this._mapRoom!, { map_w: 20, map_h: 15 })}>
                    <ha-icon icon="mdi:rectangle-outline"></ha-icon> Enable rectangle overlay
                  </button>
                `;
              })()}

              <div class="section-title" style="margin-top:4px">Icon</div>
              ${this._iconPickerField(
                rooms[this._mapRoom!]?.icon,
                v => this._setRoom(mapVac, this._mapRoom!, { icon: v }))}
              ${rooms[this._mapRoom!]?.icon ? html`
                <div class="field">
                  <label>Icon position</label>
                  <div class="anchor-picker">
                    ${(["tl","t","tr","l","c","r","bl","b","br"] as const).map(pos => {
                      const lbl: Record<string,string> = {tl:"↖",t:"↑",tr:"↗",l:"←",c:"·",r:"→",bl:"↙",b:"↓",br:"↘"};
                      return html`<button
                        class="anchor-cell ${(rooms[this._mapRoom!]?.icon_anchor ?? "c") === pos ? "anchor-cell--active" : ""}"
                        title=${pos}
                        @click=${() => this._setRoom(mapVac, this._mapRoom!, { icon_anchor: pos })}>
                        ${lbl[pos]}
                      </button>`;
                    })}
                  </div>
                  <button class="btn btn--sm" style="margin-top:4px;align-self:flex-start"
                    @click=${() => this._setRoom(mapVac, this._mapRoom!, { icon_anchor: "none" as any })}>
                    Hide icon in overlay
                  </button>
                </div>
              ` : nothing}
            ` : nothing}
          ` : html`<p class="hint">Add rooms in the Vacuums tab to position them here.</p>`}
        ` : html`<p class="hint">Select a map entity above to enable the calibration preview.</p>`}

      </div>`;
  }

  // ── Script YAML generator ───────────────────────────────────────────────────

  private _generateNotifyScriptYaml(): string {
    const cfg = this._config.notify_script;
    if (!cfg?.entity) return "";
    const v: NotifyScriptVars   = cfg.vars       ?? {};
    const e: NotifyScriptEvents = cfg.gen_events ?? {};

    const hasStart  = e.on_start  !== false;
    const hasFinish = e.on_finish !== false;
    const hasError  = e.on_error  !== false;
    const inclLabel = v.vacuum_label   !== false;
    const inclRooms = v.room_labels    !== false;
    const inclKeys  = v.room_keys      === true;
    const inclMins  = v.estimated_mins !== false;
    const inclType  = v.clean_type     !== false;

    const lines: string[] = [];
    const L = (s: string) => lines.push(s);
    const scriptName = cfg.entity.startsWith("script.") ? cfg.entity.slice(7) : cfg.entity;

    L(`alias: ${scriptName}`);
    L(`description: Generováno z roborock-vacuum-card`);
    L(`mode: parallel`);
    L(`max: 3`);
    L(`fields:`);
    L(`  vacuum_entity:`);
    L(`    required: true`);
    L(`    description: "Vysavač entity ID"`);
    if (inclLabel) { L(`  vacuum_label:`);   L(`    required: true`); }
    if (inclRooms) { L(`  room_labels:`);    L(`    required: true`); }
    if (inclKeys)  { L(`  room_keys:`);      L(`    required: false`); }
    if (inclMins)  { L(`  estimated_mins:`); L(`    required: true`); }
    if (inclType)  { L(`  clean_type:`);     L(`    required: true`); }

    L(`sequence:`);
    L(`  - variables:`);
    L(`      vac_id: "{{ vacuum_entity.split('.')[1] }}"`);
    if (inclType) {
      L(`      is_wet: "{{ clean_type == 'wet' }}"`);
      L(`      emoji: "{{ '\u{1FAE7}' if is_wet else '\u{1F9F9}' }}"`);
      L(`      clean_word: "{{ 'mopování' if is_wet else 'úklid' }}"`);
    }

    if (hasStart) {
      const title = (inclType ? "{{ emoji }} " : "") +
                    (inclLabel ? "{{ vacuum_label }}" : "Vysavač") +
                    (inclType ? " – {{ clean_word }} zahájen" : " – úklid zahájen");
      const msgParts = [
        ...(inclRooms ? ["{{ room_labels }}"] : []),
        ...(inclMins  ? ["(~{{ estimated_mins }} min)"] : []),
      ];
      L(``);
      L(`  # --- Zahájení ---`);
      L(`  - action: notify.notify  # TODO: nahraď svým notify service`);
      L(`    data:`);
      L(`      title: "${title}"`);
      L(`      message: "${msgParts.join(" ")}"`);
    }

    if (hasFinish || hasError) {
      L(``);
      L(`  # --- Čekání na výsledek ---`);
      L(`  - wait_for_trigger:`);
      if (hasFinish) {
        L(`      - trigger: state`);
        L(`        entity_id: "{{ vacuum_entity }}"`);
        L(`        to:`);
        L(`          - docked`);
        L(`          - charging`);
        L(`        for:`);
        L(`          minutes: 1`);
      }
      if (hasError) {
        L(`      - trigger: state`);
        L(`        entity_id: "{{ vacuum_entity }}"`);
        L(`        to: error`);
      }
      L(`    timeout:`);
      L(`      hours: 4`);
      L(`    continue_on_timeout: false`);
      L(``);
      L(`  - variables:`);
      L(`      final_state: "{{ wait.trigger.to_state.state if wait.trigger is not none else 'timeout' }}"`);
      if (hasFinish) {
        L(`      begin_ts: "{{ states('sensor.' ~ vac_id ~ '_last_clean_begin') }}"`);
        L(`      end_ts: "{{ states('sensor.' ~ vac_id ~ '_last_clean_end') }}"`);
        L(`      actual_minutes: >-`);
        L(`        {% if begin_ts not in ['unknown','unavailable'] and end_ts not in ['unknown','unavailable'] %}`);
        L(`          {{ (((end_ts | as_datetime) - (begin_ts | as_datetime)).total_seconds() / 60) | round(0) }}`);
        L(`        {% else %}`);
        L(`          0`);
        L(`        {% endif %}`);
      }

      const labelPart   = inclLabel ? "{{ vacuum_label }}" : "Vysavač";
      const finishTitle = (inclType ? "{{ emoji }} " : "") + labelPart +
                          (inclType ? " – {{ clean_word }} dokončen" : " – úklid dokončen");
      const finishMsg   = [
        ...(inclRooms ? ["{{ room_labels }}"] : []),
        "Trvalo to {{ actual_minutes }} min.",
      ].join(" ");

      if (hasFinish && hasError) {
        L(``);
        L(`  - choose:`);
        L(`      - conditions:`);
        L(`          - condition: template`);
        L(`            value_template: "{{ final_state == 'error' }}"`);
        L(`        sequence:`);
        L(`          - variables:`);
        L(`              current_room: "{{ states('sensor.' ~ vac_id ~ '_current_room') }}"`);
        L(`          - action: notify.notify  # TODO`);
        L(`            data:`);
        L(`              title: "⚠️ ${labelPart} – problém"`);
        L(`              message: "Místnost: {{ current_room }}. Zkontroluj vysavač."`);
        L(`      - conditions:`);
        L(`          - condition: template`);
        L(`            value_template: "{{ final_state in ['docked', 'charging'] }}"`);
        L(`        sequence:`);
        L(`          - action: notify.notify  # TODO`);
        L(`            data:`);
        L(`              title: "${finishTitle}"`);
        L(`              message: "${finishMsg}"`);
      } else if (hasError) {
        L(``);
        L(`  - condition: template`);
        L(`    value_template: "{{ final_state == 'error' }}"`);
        L(`  - variables:`);
        L(`      current_room: "{{ states('sensor.' ~ vac_id ~ '_current_room') }}"`);
        L(`  - action: notify.notify  # TODO`);
        L(`    data:`);
        L(`      title: "⚠️ ${labelPart} – problém"`);
        L(`      message: "Místnost: {{ current_room }}. Zkontroluj vysavač."`);
      } else if (hasFinish) {
        L(``);
        L(`  - condition: template`);
        L(`    value_template: "{{ final_state in ['docked', 'charging'] }}"`);
        L(`  - action: notify.notify  # TODO`);
        L(`    data:`);
        L(`      title: "${finishTitle}"`);
        L(`      message: "${finishMsg}"`);
      }
    }

    return lines.join("\n");
  }


  // ── Tab: Global ───────────────────────────────────────────────────────────

  private _renderGlobalTab() {
    const globals = this._config.global_actions ?? [];
    const ths = this._config.room_thresholds ?? DEFAULT_THRESHOLDS;
    return html`
      <div class="tab-body">

        <div class="section-title">Global actions</div>
        <p class="hint">Badges that trigger a script across all vacuums (e.g. "Clean whole flat").</p>
        ${globals.length === 0
          ? html`<p class="hint">None configured.</p>`
          : globals.map((ga, i) => this._renderGlobalAccordion(ga, i))}
        <button class="btn btn--add" @click=${() => this._addGlobal()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add global action
        </button>

        <div class="section-title" style="margin-top:4px">Room appearance</div>
        <p class="hint">Applies to all vacuums.</p>
        <div class="field field--row">
          <label>Hide room icons</label>
          <label class="toggle-wrap">
            <input type="checkbox" class="toggle-input"
              .checked=${this._config.room_icon_hidden ?? false}
              @change=${(e: Event) => this._setConfig({ room_icon_hidden: (e.target as HTMLInputElement).checked || undefined })} />
            <span class="toggle-track"></span>
          </label>
        </div>
        ${this._numberSlider("Border (idle)",     this._config.room_border_normal   ?? 2, 0, 12, 1,
          v => this._setConfig({ room_border_normal: v }), "px")}
        ${this._numberSlider("Border (selected)", this._config.room_border_selected ?? 4, 0, 12, 1,
          v => this._setConfig({ room_border_selected: v }), "px")}

        <div class="section-title" style="margin-top:4px">Thresholds (border colour by last clean age)</div>
        <p class="hint">Rules ascending — first match wins. Beyond the last = red.</p>
        ${ths.map((th, ti) => html`
          <div class="var-row threshold-row">
            <span class="threshold-label">≤</span>
            <input type="number" class="text-input text-input--sm threshold-days"
              min="0" max="365" .value=${String(th.days)}
              @change=${(e: Event) => {
                const days = parseInt((e.target as HTMLInputElement).value);
                const next = ths.map((t, i) => i === ti ? { ...t, days: isNaN(days) ? t.days : days } : t);
                this._setConfig({ room_thresholds: next });
              }} />
            <span class="threshold-label">days</span>
            <input type="color" class="threshold-color" .value=${th.color}
              @input=${(e: Event) => {
                const color = (e.target as HTMLInputElement).value;
                const next = ths.map((t, i) => i === ti ? { ...t, color } : t);
                this._setConfig({ room_thresholds: next });
              }} />
            <button class="icon-btn icon-btn--danger icon-btn--sm"
              @click=${() => {
                const next = ths.filter((_, i) => i !== ti);
                this._setConfig({ room_thresholds: next.length ? next : undefined });
              }}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>`)}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn--add btn--sm" @click=${() =>
            this._setConfig({ room_thresholds: [...ths, { days: 14, color: "#ff4d4f" }] })}>
            <ha-icon icon="mdi:plus"></ha-icon> Add threshold
          </button>
          ${this._config.room_thresholds ? html`
            <button class="btn btn--sm" @click=${() => this._setConfig({ room_thresholds: undefined })}>
              Reset to defaults
            </button>
          ` : nothing}
        </div>

        ${(() => {
          const notify = this._config.notify;
          const notifyOpen = !!notify;
          const START_TOKENS = '{{ vacuum_label }}, {{ room_labels }}, {{ room_keys }}, {{ estimated_mins }}, {{ clean_type }}';
          const FINISH_TOKENS = START_TOKENS + ', {{ actual_mins }}, {{ success }}';
          return html`
            <div class="section-title" style="margin-top:4px">Notifications (Ticker) — legacy</div>
            <p class="hint">Browser-side; consider the blueprint tracker below instead.</p>
            <div class="field field--row">
              <label>Enable</label>
              <label class="toggle-wrap">
                <input type="checkbox" class="toggle-input"
                  .checked=${!!notify}
                  @change=${(e: Event) => {
                    if ((e.target as HTMLInputElement).checked) {
                      this._setConfig({ notify: { category: 'Cleaning' } });
                    } else {
                      this._setConfig({ notify: undefined });
                    }
                  }} />
                <span class="toggle-track"></span>
              </label>
            </div>
            ${notify ? html`
              ${this._textField('Category', notify.category,
                v => this._setNotify({ category: v }), 'e.g. Cleaning')}
              <div class="field field--row">
                <label>Color (dry)</label>
                <input type="color" class="threshold-color" .value=${notify.color_dry ?? '#4CAF50'}
                  @input=${(e: Event) => this._setNotify({ color_dry: (e.target as HTMLInputElement).value })} />
              </div>
              <div class="field field--row">
                <label>Color (wet)</label>
                <input type="color" class="threshold-color" .value=${notify.color_wet ?? '#2196F3'}
                  @input=${(e: Event) => this._setNotify({ color_wet: (e.target as HTMLInputElement).value })} />
              </div>
              ${this._textField('Tag prefix', notify.tag_prefix,
                v => this._setNotify({ tag_prefix: v || undefined }), 'e.g. roborock')}
              <div class="sub-title">On clean start</div>
              ${this._textField('Title', notify.on_start?.title,
                v => this._setNotifyTemplate('on_start', { title: v || undefined }), '🧹 {{ vacuum_label }}')}
              ${this._textField('Message', notify.on_start?.message,
                v => this._setNotifyTemplate('on_start', { message: v || undefined }), '{{ room_labels }} · ~{{ estimated_mins }} min')}
              <p class="hint">Tokens: ${START_TOKENS}</p>
              <div class="sub-title">On clean finish</div>
              ${this._textField('Title', notify.on_finish?.title,
                v => this._setNotifyTemplate('on_finish', { title: v || undefined }), '✅ {{ vacuum_label }} hotovo')}
              ${this._textField('Message', notify.on_finish?.message,
                v => this._setNotifyTemplate('on_finish', { message: v || undefined }), '{{ room_labels }} · {{ actual_mins }} min')}
              <p class="hint">Tokens: ${FINISH_TOKENS}</p>
            ` : nothing}
          `;
        })()}

        ${(() => {
          const nsCfg  = this._config.notify_script;
          const nsVars: NotifyScriptVars   = nsCfg?.vars       ?? {};
          const nsEvts: NotifyScriptEvents = nsCfg?.gen_events ?? {};
          type VarKey = keyof NotifyScriptVars;
          type EvtKey = keyof NotifyScriptEvents;
          const VAR_DEFS: Array<[VarKey, string, boolean]> = [
            ["vacuum_label",   "Název vysavače",       true],
            ["room_labels",    "Místnosti (text)",      true],
            ["room_keys",      "Místnosti (klíče)",     false],
            ["estimated_mins", "Odhadovaný čas",        true],
            ["clean_type",     "Typ úklidu (wet/dry)",  true],
          ];
          const EVT_DEFS: Array<[EvtKey, string]> = [
            ["on_start",  "Zahájení úklidu"],
            ["on_finish", "Dokončení úklidu"],
            ["on_error",  "Chyba / problém"],
          ];
          return html`
            <div class="section-title" style="margin-top:4px">Script notifikací</div>
            <p class="hint">
              Karta při startu úklidu zavolá HA skript a předá mu vybraný kontext.
              Skript pak běží server-side &mdash; nezávisle na otevřeném dashboardu.
            </p>
            <div class="field field--row">
              <label>Povolit</label>
              <label class="toggle-wrap">
                <input type="checkbox" class="toggle-input"
                  .checked=${!!nsCfg}
                  @change=${(e: Event) => {
                    if ((e.target as HTMLInputElement).checked) {
                      this._setConfig({ notify_script: { entity: "script.vakuum_notifikace_uklid" } });
                    } else {
                      this._setConfig({ notify_script: undefined });
                      this._scriptPreviewOpen = false;
                    }
                  }} />
                <span class="toggle-track"></span>
              </label>
            </div>
            ${nsCfg ? html`
              ${this._textField("Script entity", nsCfg.entity,
                v => this._setNotifyScript({ entity: v }), "script.vakuum_notifikace_uklid")}

              <div class="sub-title">Události v generovaném skriptu</div>
              ${EVT_DEFS.map(([key, label]) => {
                const checked = nsEvts[key] !== false;
                return html`
                  <div class="field field--row">
                    <label>${label}</label>
                    <label class="toggle-wrap">
                      <input type="checkbox" class="toggle-input"
                        .checked=${checked}
                        @change=${(e: Event) => {
                          const val = (e.target as HTMLInputElement).checked;
                          this._setNotifyScript({ gen_events: { ...nsEvts, [key]: val } });
                        }} />
                      <span class="toggle-track"></span>
                    </label>
                  </div>`;
              })}

              <div class="sub-title">Proměnné předávané skriptu</div>
              ${VAR_DEFS.map(([key, label, defaultOn]) => {
                const checked = defaultOn ? nsVars[key] !== false : nsVars[key] === true;
                return html`
                  <div class="field field--row">
                    <label>${label} <code style="font-size:10px">${key}</code></label>
                    <label class="toggle-wrap">
                      <input type="checkbox" class="toggle-input"
                        .checked=${checked}
                        @change=${(e: Event) => {
                          const val = (e.target as HTMLInputElement).checked;
                          this._setNotifyScript({ vars: { ...nsVars, [key]: val } });
                        }} />
                      <span class="toggle-track"></span>
                    </label>
                  </div>`;
              })}

              <button class="btn btn--sm" style="align-self:flex-start"
                @click=${() => { this._scriptPreviewOpen = !this._scriptPreviewOpen; }}>
                <ha-icon icon=${this._scriptPreviewOpen ? "mdi:code-tags-check" : "mdi:code-tags"}></ha-icon>
                ${this._scriptPreviewOpen ? "Skrýt generovaný skript" : "Zobrazit generovaný skript"}
              </button>
              ${this._scriptPreviewOpen ? html`
                <div style="position:relative">
                  <pre class="yaml-preview">${this._generateNotifyScriptYaml()}</pre>
                  <button class="btn btn--sm" style="position:absolute;top:6px;right:6px"
                    @click=${async () => {
                      try { await navigator.clipboard.writeText(this._generateNotifyScriptYaml()); }
                      catch { /* clipboard unavailable */ }
                    }}>
                    <ha-icon icon="mdi:content-copy"></ha-icon> Kopírovat
                  </button>
                </div>
              ` : nothing}
            ` : nothing}
          `;
        })()}

        ${this._renderBackendSection()}

        ${(() => {
          const usesAreaMappings = this._config.vacuums.some(v =>
            v.clean_action?.type === "native-area" || v.clean_action?.type === "native-auto");
          if (!usesAreaMappings) return nothing;
          const allKeys = [...new Set(
            this._config.vacuums.flatMap(v => (v.rooms ?? []).map(r => r.key)).filter(Boolean)
          )].sort();
          const mappings = this._config.area_mappings ?? {};
          return html`
            <div class="section-title" style="margin-top:4px">Area mappings</div>
            <p class="hint">Maps room keys to HA areas for the <strong>native-area</strong> and <strong>native-auto</strong> strategies. Set once here — applies to all vacuums.</p>
            ${allKeys.length === 0
              ? html`<p class="hint">No rooms configured yet.</p>`
              : allKeys.map(key => this._areaPicker(key, mappings[key], v => {
                  const next = { ...mappings };
                  if (v) next[key] = v; else delete next[key];
                  this._setConfig({ area_mappings: Object.keys(next).length ? next : undefined });
                }))}
          `;
        })()}

      </div>`;
  }

  // ── Backend tracking section ──────────────────────────────────────────────

  private _renderBackendSection() {
    const b: BackendConfig = this._config.backend ?? {};
    const automationEntity = this._trackerAutomation();
    const bpLabel =
      this._bpStatus === "unknown"  ? "⏳ checking…" :
      this._bpStatus === "current"  ? "✅ installed (v" + BLUEPRINT_VERSION + ")" :
      this._bpStatus === "outdated" ? "⚠️ installed — update available (v" + BLUEPRINT_VERSION + ")" :
                                      "❌ not installed";
    return html`
      <div class="section-title" style="margin-top:4px">Backend tracking (blueprint)</div>
      <p class="hint">
        Server-side cleaning tracker: a blueprint automation listens for the card's
        <code>cleaning_started</code> event, waits for the vacuum to dock, writes per-room
        last-clean timestamps and sends notifications — it works even when no dashboard
        is open. Recommended over the Ticker/script notifications above.
      </p>

      <div class="field field--row">
        <label>Blueprint</label>
        <span style="font-size:13px">${bpLabel}</span>
      </div>
      <div class="field field--row">
        <label>Automation</label>
        <span style="font-size:13px">${automationEntity
          ? html`✅ <code>${automationEntity}</code>`
          : "❌ not created"}</span>
      </div>

      ${this._textField("Notify action", b.notify_service,
        v => this._setBackend({ notify_service: v || undefined }), "notify.mobile_app_phone")}
      ${([
        ["notify_on_start",  "Notify on start"],
        ["notify_on_finish", "Notify on finish"],
        ["notify_on_error",  "Notify on error"],
      ] as Array<[keyof BackendConfig, string]>).map(([key, label]) => html`
        <div class="field field--row">
          <label>${label}</label>
          <label class="toggle-wrap">
            <input type="checkbox" class="toggle-input"
              .checked=${b[key] !== false}
              @change=${(e: Event) =>
                this._setBackend({ [key]: (e.target as HTMLInputElement).checked })} />
            <span class="toggle-track"></span>
          </label>
        </div>`)}
      <div class="field field--row">
        <label>Single-room calibration</label>
        <label class="toggle-wrap">
          <input type="checkbox" class="toggle-input"
            .checked=${this._config.single_room_time ?? false}
            @change=${(e: Event) => this._setConfig({
              single_room_time: (e.target as HTMLInputElement).checked || undefined })} />
          <span class="toggle-track"></span>
        </label>
      </div>
      <p class="hint">
        Single-room calibration: when a run cleaned exactly one room, the measured duration
        is written into that room's clean-time helper. Applied by the card and by the
        blueprint (re-deploy the automation after changing).
      </p>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn--add btn--sm" ?disabled=${this._bpBusy !== null}
          @click=${() => this._installBlueprint()}>
          <ha-icon icon="mdi:download"></ha-icon>
          ${this._bpBusy === "blueprint" ? "Installing…"
            : this._bpStatus === "current" ? "Reinstall blueprint"
            : this._bpStatus === "outdated" ? "Update blueprint"
            : "Install blueprint"}
        </button>
        <button class="btn btn--add btn--sm"
          ?disabled=${this._bpBusy !== null || this._bpStatus === "missing"}
          @click=${() => this._deployAutomation()}>
          <ha-icon icon="mdi:robot"></ha-icon>
          ${this._bpBusy === "automation" ? "Deploying…"
            : automationEntity ? "Update automation" : "Create automation"}
        </button>
        <button class="btn btn--sm" ?disabled=${this._bpBusy !== null}
          @click=${() => { this._bpStatus = "unknown"; this._bpMsg = null; }}>
          <ha-icon icon="mdi:refresh"></ha-icon> Refresh
        </button>
      </div>
      ${this._bpMsg ? html`<p class="hint">${this._bpMsg}</p>` : nothing}

      <button class="btn btn--sm" style="align-self:flex-start"
        @click=${() => { this._bpYamlOpen = !this._bpYamlOpen; }}>
        <ha-icon icon=${this._bpYamlOpen ? "mdi:code-tags-check" : "mdi:code-tags"}></ha-icon>
        ${this._bpYamlOpen ? "Hide blueprint YAML" : "Show blueprint YAML (manual install)"}
      </button>
      ${this._bpYamlOpen ? html`
        <div style="position:relative">
          <pre class="yaml-preview">${BLUEPRINT_YAML}</pre>
          <button class="btn btn--sm" style="position:absolute;top:6px;right:6px"
            @click=${async () => {
              try { await navigator.clipboard.writeText(BLUEPRINT_YAML); }
              catch { /* clipboard unavailable */ }
            }}>
            <ha-icon icon="mdi:content-copy"></ha-icon> Copy
          </button>
        </div>
      ` : nothing}
    `;
  }

  private _renderGlobalAccordion(ga: GlobalAction, idx: number) {
    const color = COLOR_HEX[ga.color ?? "orange"];
    const isOpen = this._openGlobal.has(idx);
    const action = ga.action;
    const watches = ga.watch_entities ?? [];
    return html`
      <div class="acc-row" style=${styleMap({ borderLeft: "3px solid " + color })}>
        <div class="acc-header" @click=${() => this._toggleGlobal(idx)}>
          ${ga.image
            ? html`<img class="acc-img" src=${ga.image} alt=${ga.name} />`
            : html`<ha-icon icon="mdi:home-floor-a" style=${styleMap({ color, width: "36px", height: "36px" })}></ha-icon>`}
          <div class="acc-info">
            <span class="acc-name">${ga.name || "Unnamed action"}</span>
            <span class="acc-sub">${action.type === "script" ? action.entity_id : (action as any).service}</span>
          </div>
          <button class="icon-btn icon-btn--danger"
            @click=${(e: Event) => { e.stopPropagation(); this._deleteGlobal(idx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? html`
          <div class="acc-body">
            ${this._textField("Display name", ga.name,
              v => this._setGlobal(idx, { name: v }), "e.g. Whole flat")}
            ${this._textField("Image path", ga.image,
              v => this._setGlobal(idx, { image: v || undefined }), "/local/...")}
            ${this._selectField<VacuumColor>("Accent colour", ga.color ?? "orange",
              [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }],
              v => this._setGlobal(idx, { color: v }))}

            <div class="sub-title">Watch entities (badge glows when any is cleaning)</div>
            ${watches.map((e, wi) => html`
              <div class="var-row">
                <ha-entity-picker .hass=${this.hass} .value=${e} .includeDomains=${["vacuum"]}
                  allow-custom-entity style="flex:1"
                  @value-changed=${(ev: CustomEvent) => {
                    const updated = [...watches];
                    updated[wi] = ev.detail.value;
                    this._setGlobal(idx, { watch_entities: updated.filter(Boolean) });
                  }}></ha-entity-picker>
                <button class="icon-btn icon-btn--danger icon-btn--sm"
                  @click=${() => this._setGlobal(idx, { watch_entities: watches.filter((_, i) => i !== wi) })}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </div>`)}
            <button class="btn btn--add btn--sm"
              @click=${() => this._setGlobal(idx, { watch_entities: [...watches, ""] })}>
              <ha-icon icon="mdi:plus"></ha-icon> Add entity
            </button>

            <div class="sub-title">Action (hold-to-activate)</div>
            ${this._selectField<"script" | "service">("Type", action.type,
              [{ value: "script", label: "Script" }, { value: "service", label: "Service call" }],
              v => this._setGlobal(idx, { action: v === "script"
                ? { type: "script", entity_id: "" }
                : { type: "service", service: "" } }))}
            ${action.type === "script"
              ? this._entityPicker("Script entity", action.entity_id, ["script"],
                  v => this._setGlobalAction(idx, { entity_id: v }))
              : this._textField("Service", (action as any).service,
                  v => this._setGlobalAction(idx, { service: v }), "e.g. script.celkovy_uklid_bytu")}
          </div>
        ` : nothing}
      </div>`;
  }

  // ── Main render ───────────────────────────────────────────────────────────

  render() {
    if (!this._config) return nothing;
    return html`
      <datalist id="ha-entities"></datalist>
      <div class="editor-root">
        <div class="tabs-bar">
          ${(["vacuums", "maps", "global"] as const).map(t => html`
            <button class="tab-btn ${this._tab === t ? "tab-btn--active" : ""}"
              @click=${() => { this._tab = t; }}>
              ${{ vacuums: "🤖 Vacuums", maps: "🗺 Maps", global: "⚙ Global" }[t]}
            </button>`)}
        </div>
        ${this._tab === "vacuums" ? this._renderVacuumsTab()
          : this._tab === "maps"    ? this._renderMapsTab()
          : this._renderGlobalTab()}
        <div class="editor-footer">roborock-vacuum-card v${CARD_VERSION}</div>
      </div>`;
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  static styles = css`
    .editor-root { display:flex; flex-direction:column; }

    /* ── Tabs ── */
    .tabs-bar {
      display:flex;
      border-bottom:1px solid var(--divider-color,rgba(0,0,0,.12));
      margin-bottom:2px;
    }
    .tab-btn {
      flex:1; padding:10px 4px; background:none; border:none; cursor:pointer;
      font-size:12px; font-weight:600; font-family:inherit;
      color:var(--secondary-text-color);
      border-bottom:2px solid transparent;
      transition:color .15s, border-color .15s;
    }
    .tab-btn--active { color:var(--primary-color); border-bottom-color:var(--primary-color); }

    /* ── Tab body ── */
    .tab-body { display:flex; flex-direction:column; gap:8px; padding:10px 0 4px; }

    /* ── YAML preview ── */
    .yaml-preview {
      background:var(--code-editor-background-color,#1e1e1e);
      color:var(--code-editor-foreground-color,#d4d4d4);
      padding:12px;
      border-radius:6px;
      font-size:11px;
      line-height:1.6;
      overflow-x:auto;
      white-space:pre;
      margin:0;
      font-family:monospace;
    }

    /* ── Vacuum accordion ── */
    .acc-row {
      border-radius:10px;
      border:1px solid var(--divider-color,rgba(0,0,0,.12));
      background:var(--secondary-background-color);
      overflow:hidden;
    }
    .acc-header {
      display:flex; align-items:center; gap:8px;
      padding:10px 10px 10px 12px; cursor:pointer;
    }
    .acc-header:hover { background:rgba(0,0,0,.03); }
    .acc-img  { width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; }
    .acc-info { flex:1; display:flex; flex-direction:column; min-width:0; }
    .acc-name { font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .acc-sub  { font-size:11px; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .acc-chevron { color:var(--secondary-text-color); flex-shrink:0; }
    .acc-body {
      padding:12px; display:flex; flex-direction:column; gap:8px;
      border-top:1px solid var(--divider-color,rgba(0,0,0,.12));
    }

    /* ── Collapsible (sensors / clean action) ── */
    .collapsible {
      border-radius:6px; border:1px solid var(--divider-color,rgba(0,0,0,.1)); overflow:hidden;
    }
    .collapsible-header {
      display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer;
      background:rgba(0,0,0,.02);
    }
    .collapsible-header:hover { background:rgba(0,0,0,.05); }
    .collapsible-title {
      flex:1; font-size:11px; font-weight:700; letter-spacing:.7px;
      text-transform:uppercase; color:var(--primary-color);
    }
    .collapsible-body { padding:10px; display:flex; flex-direction:column; gap:8px; }

    .badge {
      font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px;
      background:rgba(0,0,0,.07); color:var(--secondary-text-color);
    }

    /* ── Room accordion ── */
    .room-acc {
      border-radius:6px; border:1px solid var(--divider-color,rgba(0,0,0,.1));
      background:rgba(0,0,0,.015); overflow:hidden;
    }
    .room-acc-header { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer; }
    .room-acc-header:hover { background:rgba(0,0,0,.04); }
    .room-acc-icon { flex-shrink:0; }
    .room-acc-info { flex:1; display:flex; flex-direction:column; }
    .room-acc-name { font-weight:600; font-size:13px; }
    .room-acc-meta { font-size:11px; color:var(--secondary-text-color); }
    .room-acc-body {
      padding:10px; display:flex; flex-direction:column; gap:8px;
      border-top:1px solid var(--divider-color,rgba(0,0,0,.1));
    }

    /* ── Toggle switch ── */
    .toggle-wrap { position:relative; display:inline-flex; align-items:center; cursor:pointer; }
    .toggle-input { position:absolute; opacity:0; width:0; height:0; }
    .toggle-track {
      width:36px; height:20px; border-radius:10px;
      background:var(--divider-color,rgba(0,0,0,.2)); transition:background .2s; position:relative;
    }
    .toggle-track::after {
      content:""; position:absolute; top:2px; left:2px;
      width:16px; height:16px; border-radius:50%; background:white; transition:transform .2s;
    }
    .toggle-input:checked + .toggle-track { background:var(--primary-color); }
    .toggle-input:checked + .toggle-track::after { transform:translateX(16px); }

    /* ── Map hint link ── */
    .map-hint {
      cursor:pointer; color:var(--primary-color) !important;
      text-decoration:underline; text-underline-offset:2px;
    }
    .map-hint:hover { opacity:.8; }

    /* ── Pill rows (Maps tab vacuum/room selectors) ── */
    .pill-row { display:flex; gap:6px; flex-wrap:wrap; }
    .vac-pill {
      padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer;
      border:1px solid var(--divider-color,rgba(0,0,0,.15));
      background:var(--secondary-background-color); color:var(--secondary-text-color);
      font-family:inherit;
    }
    .vac-pill--active { background:var(--primary-color); color:white; border-color:var(--primary-color); }
    .room-pill {
      display:flex; align-items:center; gap:4px;
      padding:4px 10px; border-radius:16px; font-size:12px; font-weight:500; cursor:pointer;
      border:1px solid var(--divider-color,rgba(0,0,0,.15));
      background:var(--secondary-background-color); color:var(--secondary-text-color);
      font-family:inherit;
    }
    .room-pill--active { background:rgba(33,150,243,.12); color:var(--primary-color); border-color:var(--primary-color); }

    /* ── Map preview ── */
    .map-pos-container { border-radius:8px; overflow:hidden; }
    .map-pos-container--active { cursor:crosshair; }
    .map-preview-wrap {
      position:relative; width:100%; padding-top:27.5%;
      overflow:hidden; border-radius:8px; background:rgba(0,0,0,.06);
    }
    .map-preview-img { position:absolute; transform-origin:center center; object-fit:cover; }

    .pos-dot {
      position:absolute; transform:translate(-50%,-50%);
      width:26px; height:26px; border-radius:6px;
      background:rgba(0,0,0,.55); border:2px solid rgba(255,255,255,.4);
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,.7); cursor:pointer;
    }
    .pos-dot--active { background:rgba(33,150,243,.75); border-color:#2196F3; color:white; }

    .two-col { display:flex; gap:8px; }
    .two-col > * { flex:1; min-width:0; }

    /* ── Section title ── */
    .section-title {
      font-size:12px; font-weight:700; letter-spacing:.8px;
      text-transform:uppercase; color:var(--primary-color);
      border-bottom:1px solid var(--divider-color,rgba(0,0,0,.12));
      padding-bottom:4px; margin-bottom:2px;
    }
    .sub-section {
      display:flex; flex-direction:column; gap:8px;
      padding-left:8px; border-left:3px solid var(--divider-color,rgba(0,0,0,.1));
    }
    .sub-title { font-size:11px; font-weight:600; color:var(--secondary-text-color); margin-top:4px; }

    /* ── Fields ── */
    .field { display:flex; flex-direction:column; gap:4px; }
    .field--row { flex-direction:row; align-items:center; }
    .field--row label { width:130px; flex-shrink:0; }
    label { font-size:13px; color:var(--secondary-text-color); }
    .required { color:var(--error-color,#f44336); }

    .text-input {
      width:100%; box-sizing:border-box; padding:8px 10px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2)); border-radius:6px;
      background:var(--card-background-color); color:var(--primary-text-color);
      font-size:13px; font-family:inherit;
    }
    .text-input--sm   { width:auto; flex:1; }
    .text-input--half { flex:1; min-width:0; }

    .select-input {
      flex:1; padding:6px 8px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2)); border-radius:6px;
      background:var(--card-background-color); color:var(--primary-text-color);
      font-size:13px; font-family:inherit; cursor:pointer;
    }

    .slider-wrap { display:flex; align-items:center; gap:8px; flex:1; }
    .slider { flex:1; accent-color:var(--primary-color); }
    .slider-val { width:52px; text-align:right; font-size:13px; font-weight:600; color:var(--primary-color); flex-shrink:0; }

    /* ── Buttons ── */
    .btn {
      display:flex; align-items:center; gap:6px;
      padding:8px 14px; border-radius:8px;
      cursor:pointer; font-size:13px; font-weight:600; font-family:inherit; border:none;
    }
    .btn--add {
      background:rgba(33,150,243,.1); color:var(--primary-color);
      border:1px dashed var(--primary-color) !important;
    }
    .btn--sm { padding:4px 10px; font-size:12px; }

    .icon-btn {
      display:flex; align-items:center; justify-content:center;
      width:32px; height:32px; border-radius:6px;
      cursor:pointer; background:transparent; border:none; color:var(--secondary-text-color);
      flex-shrink:0;
    }
    .icon-btn:hover { background:rgba(0,0,0,.08); }
    .icon-btn:disabled { opacity:.35; cursor:default; }
    .icon-btn--danger { color:var(--error-color,#f44336); }
    .icon-btn--sm { width:24px; height:24px; }

    /* ── Misc ── */
    .hint { font-size:12px; color:var(--secondary-text-color); margin:0; }

    .editor-footer {
      margin-top:8px; padding-top:6px;
      border-top:1px solid var(--divider-color,rgba(0,0,0,.12));
      font-size:11px; text-align:right;
      color:var(--secondary-text-color); opacity:.7;
    }

    .var-row { display:flex; align-items:center; gap:6px; }
    .var-sep { color:var(--secondary-text-color); flex-shrink:0; }

    .anchor-picker { display:grid; grid-template-columns:repeat(3, 32px); gap:3px; }
    .anchor-cell {
      width:32px; height:32px; border-radius:6px; cursor:pointer;
      background:var(--secondary-background-color);
      border:1px solid var(--divider-color,rgba(0,0,0,.2));
      font-size:15px; display:flex; align-items:center; justify-content:center;
    }
    .anchor-cell--active { background:var(--primary-color); color:white; border-color:var(--primary-color); }

    .threshold-row { align-items:center; gap:6px; }
    .threshold-label { font-size:12px; color:var(--secondary-text-color); flex-shrink:0; }
    .threshold-days { width:56px !important; flex:none; padding:6px 8px; }
    .threshold-color {
      width:36px; height:28px; padding:2px; border-radius:6px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2));
      background:var(--card-background-color); cursor:pointer;
    }
  `;
}
