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
  ScriptCleanAction,
  VacuumColor,
  GlobalAction,
  GlobalActionCall,
} from "./types";
import { EDITOR_NAME, COLOR_HEX } from "./const";

// ── Navigation state ─────────────────────────────────────────────────────────

type EditorView =
  | { type: "vacuums" }
  | { type: "vacuum"; idx: number }
  | { type: "room"; vacuumIdx: number; roomIdx: number }
  | { type: "global"; idx: number };

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

// ── Editor ───────────────────────────────────────────────────────────────────

@customElement(EDITOR_NAME)
export class RoborockVacuumCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: RoborockVacuumCardConfig;
  @state() private _view: EditorView = { type: "vacuums" };

  setConfig(config: RoborockVacuumCardConfig): void {
    this._config = config;
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
  }

  // ── Config helpers ───────────────────────────────────────────────────────

  private _fire(config: RoborockVacuumCardConfig): void {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config }, bubbles: true, composed: true,
    }));
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
    this._view = { type: "vacuum", idx: vacuums.length - 1 };
  }

  private _deleteVacuum(idx: number): void {
    const vacuums = this._config.vacuums.filter((_, i) => i !== idx);
    const next = { ...this._config, vacuums };
    this._config = next; this._fire(next);
    this._view = { type: "vacuums" };
  }

  private _addRoom(vacIdx: number): void {
    const rooms = [...(this._config.vacuums[vacIdx].rooms ?? []), { ...DEFAULT_ROOM }];
    this._setVacuum(vacIdx, { rooms });
    this._view = { type: "room", vacuumIdx: vacIdx, roomIdx: rooms.length - 1 };
  }

  private _deleteRoom(vacIdx: number, roomIdx: number): void {
    const rooms = (this._config.vacuums[vacIdx].rooms ?? []).filter((_, i) => i !== roomIdx);
    this._setVacuum(vacIdx, { rooms });
    this._view = { type: "vacuum", idx: vacIdx };
  }

  private _addGlobal(): void {
    const global_actions = [...(this._config.global_actions ?? []), { ...DEFAULT_GLOBAL }];
    const next = { ...this._config, global_actions };
    this._config = next; this._fire(next);
    this._view = { type: "global", idx: global_actions.length - 1 };
  }

  private _deleteGlobal(idx: number): void {
    const global_actions = (this._config.global_actions ?? []).filter((_, i) => i !== idx);
    const next = { ...this._config, global_actions };
    this._config = next; this._fire(next);
    this._view = { type: "vacuums" };
  }

  // ── Shared field helpers ─────────────────────────────────────────────────

  private _entityPicker(label: string, value: string | undefined, domains: string[],
    onChange: (v: string) => void, required = false) {
    const ph = domains.length ? domains.join(" / ") : "entity_id";
    // Pro jednu doménu filtrujeme, jinak globální datalist
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
            if (v === "" || this.hass.states[v]) onChange(v); }} />
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
    if (!opts.length) {
      return this._textField(label, value, onChange, "e.g. balanced");
    }
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

  // ── View: vacuum list (main screen) ─────────────────────────────────────

  private _renderVacuumList() {
    const globals = this._config.global_actions ?? [];
    return html`
      <div class="view">
        <div class="view-header"><span class="view-title">Roborock Vacuum Card</span></div>

        <div class="section-title">Vacuums</div>
        ${this._config.vacuums.length === 0
          ? html`<p class="hint">No vacuums configured yet.</p>`
          : this._config.vacuums.map((vac, i) => this._renderVacuumRow(vac, i))}
        <button class="btn btn--add" @click=${() => this._addVacuum()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add vacuum
        </button>

        <div class="section-title" style="margin-top:12px">Global actions</div>
        <p class="hint">Badges that trigger a script across all vacuums (e.g. "Clean whole flat").</p>
        ${globals.length === 0
          ? html`<p class="hint">None configured.</p>`
          : globals.map((ga, i) => this._renderGlobalRow(ga, i))}
        <button class="btn btn--add" @click=${() => this._addGlobal()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add global action
        </button>
      </div>`;
  }

  private _renderVacuumRow(vac: VacuumConfig, idx: number) {
    const color = COLOR_HEX[vac.color ?? "green"];
    const name = vac.name || vac.entity || "Unnamed vacuum";
    return html`
      <div class="vac-row" style=${styleMap({ borderLeft: "4px solid " + color })}>
        ${vac.image
          ? html`<img class="vac-row__img" src=${vac.image} alt=${name} />`
          : html`<ha-icon class="vac-row__icon" icon="mdi:robot-vacuum" style=${styleMap({ color })}></ha-icon>`}
        <div class="vac-row__info">
          <span class="vac-row__name">${name}</span>
          <span class="vac-row__entity">${vac.entity}</span>
        </div>
        <div class="vac-row__actions">
          <button class="icon-btn" ?disabled=${idx === 0}
            @click=${() => this._moveVacuum(idx, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button class="icon-btn" ?disabled=${idx === this._config.vacuums.length - 1}
            @click=${() => this._moveVacuum(idx, 1)}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button class="icon-btn" @click=${() => { this._view = { type: "vacuum", idx }; }}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="icon-btn icon-btn--danger" @click=${() => this._deleteVacuum(idx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>`;
  }

  private _renderGlobalRow(ga: GlobalAction, idx: number) {
    const color = COLOR_HEX[ga.color ?? "orange"];
    return html`
      <div class="vac-row" style=${styleMap({ borderLeft: "4px solid " + color })}>
        ${ga.image
          ? html`<img class="vac-row__img" src=${ga.image} alt=${ga.name} />`
          : html`<ha-icon class="vac-row__icon" icon="mdi:home-floor-a" style=${styleMap({ color })}></ha-icon>`}
        <div class="vac-row__info">
          <span class="vac-row__name">${ga.name || "Unnamed action"}</span>
          <span class="vac-row__entity">${ga.action.type === "script" ? ga.action.entity_id : ga.action.service}</span>
        </div>
        <div class="vac-row__actions">
          <button class="icon-btn" @click=${() => { this._view = { type: "global", idx }; }}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="icon-btn icon-btn--danger" @click=${() => this._deleteGlobal(idx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>`;
  }

  // ── View: vacuum editor ──────────────────────────────────────────────────

  private _renderVacuumEditor(idx: number) {
    const vac = this._config.vacuums[idx];
    const rooms = vac.rooms ?? [];
    return html`
      <div class="view">
        <div class="view-header">
          <button class="back-btn" @click=${() => { this._view = { type: "vacuums" }; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span class="view-title">${vac.name || vac.entity || "Vacuum"}</span>
          <button class="icon-btn icon-btn--danger" @click=${() => this._deleteVacuum(idx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>

        <div class="section"><div class="section-title">Basic</div>
          ${this._entityPicker("Vacuum entity", vac.entity, ["vacuum"],
            v => this._setVacuum(idx, { entity: v }), true)}
          ${this._textField("Display name", vac.name,
            v => this._setVacuum(idx, { name: v }), "e.g. S8")}
          ${this._textField("Image path", vac.image,
            v => this._setVacuum(idx, { image: v }), "/local/...")}
          ${this._selectField<VacuumColor>("Accent colour", vac.color ?? "green",
            [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }],
            v => this._setVacuum(idx, { color: v }))}
        </div>

        <div class="section"><div class="section-title">Sensors</div>
          ${this._entityPicker("Status sensor", vac.status_entity, ["sensor"],
            v => this._setVacuum(idx, { status_entity: v || undefined }))}
          ${this._entityPicker("Battery sensor", vac.battery_entity, ["sensor"],
            v => this._setVacuum(idx, { battery_entity: v || undefined }))}
          ${this._entityPicker("Last clean end sensor", vac.last_clean_entity, ["sensor"],
            v => this._setVacuum(idx, { last_clean_entity: v || undefined }))}
          ${this._entityPicker("Cleaning progress sensor", vac.progress_entity, ["sensor"],
            v => this._setVacuum(idx, { progress_entity: v || undefined }))}
          ${this._entityPicker("Current room sensor", vac.current_room_entity, ["sensor"],
            v => this._setVacuum(idx, { current_room_entity: v || undefined }))}
          ${this._entityPicker("Vacuum error sensor", vac.error_entity, ["sensor"],
            v => this._setVacuum(idx, { error_entity: v || undefined }))}
        </div>

        <div class="section"><div class="section-title">Map</div>
          ${this._renderMapEditor(idx, vac)}
        </div>

        <div class="section"><div class="section-title">Clean action</div>
          ${this._renderCleanActionEditor(idx, vac)}
        </div>

        <div class="section"><div class="section-title">Rooms (${rooms.length})</div>
          ${rooms.map((r, ri) => this._renderRoomRow(r, idx, ri))}
          <button class="btn btn--add" @click=${() => this._addRoom(idx)}>
            <ha-icon icon="mdi:plus"></ha-icon> Add room
          </button>
        </div>
      </div>`;
  }

  // ── Map editor ───────────────────────────────────────────────────────────

  private _renderMapEditor(vacIdx: number, vac: VacuumConfig) {
    const map = vac.map ?? { ...DEFAULT_MAP };
    const mapUrl = map.entity
      ? ((this.hass.states[map.entity]?.attributes["entity_picture"] as string) ?? "")
      : "";
    return html`
      ${this._entityPicker("Map image entity", map.entity, ["image"],
        v => this._setMap(vacIdx, { entity: v }))}
      ${mapUrl ? html`
        <div class="map-calibration">
          <div class="map-preview-wrap">
            <img class="map-preview-img" src=${mapUrl} alt="Map preview"
              style=${styleMap({
                left:      (50 + (map.offset_x ?? 0)) + "%",
                top:       (50 + (map.offset_y ?? 0)) + "%",
                width:     (map.scale ?? 100) + "%",
                transform: "translate(-50%,-50%) rotate(" + (map.rotation ?? 0) + "deg)",
              })} />
          </div>
          ${this._numberSlider("Rotation",  map.rotation  ?? 0,    0, 360, 90, v => this._setMap(vacIdx, { rotation:  v }), "deg")}
          ${this._numberSlider("Scale",     map.scale     ?? 100, 50, 200,  5, v => this._setMap(vacIdx, { scale:     v }), "%")}
          ${this._numberSlider("Offset X",  map.offset_x  ?? 0,  -50, 50,  1, v => this._setMap(vacIdx, { offset_x:  v }), "%")}
          ${this._numberSlider("Offset Y",  map.offset_y  ?? 0,  -50, 50,  1, v => this._setMap(vacIdx, { offset_y:  v }), "%")}
        </div>
      ` : html`<p class="hint">Select a map entity above to enable calibration preview.</p>`}`;
  }

  // ── Clean action editor ──────────────────────────────────────────────────

  private _renderCleanActionEditor(vacIdx: number, vac: VacuumConfig) {
    const action = vac.clean_action ?? { type: "native" as const };
    return html`
      ${this._selectField<"native" | "script">("Strategy", action.type,
        [{ value: "native", label: "Native Roborock (vacuum.send_command)" },
         { value: "script", label: "Custom script" }],
        v => this._setVacuum(vacIdx, { clean_action: v === "native"
          ? { type: "native" } : { type: "script", entity_id: "" } }))}
      ${action.type === "native"
        ? this._renderNativeAction(vacIdx, action as NativeCleanAction)
        : this._renderScriptAction(vacIdx, action as ScriptCleanAction)}`;
  }

  private _renderNativeAction(vacIdx: number, action: NativeCleanAction) {
    return html`
      <div class="sub-section">
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
        <p class="hint">Tokens: {{ entity }}, {{ selected_segments }}, {{ selected_room_keys }}</p>
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

  // ── Room row ─────────────────────────────────────────────────────────────

  private _renderRoomRow(room: RoomConfig, vacIdx: number, roomIdx: number) {
    return html`
      <div class="room-row">
        <ha-icon class="room-row__icon" icon=${room.icon || "mdi:square"}></ha-icon>
        <div class="room-row__info">
          <span class="room-row__name">${room.name || room.key || "Unnamed room"}</span>
          ${room.segment_id !== undefined
            ? html`<span class="room-row__meta">segment ${room.segment_id}</span>` : nothing}
        </div>
        <div class="room-row__actions">
          <button class="icon-btn"
            @click=${() => { this._view = { type: "room", vacuumIdx: vacIdx, roomIdx }; }}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="icon-btn icon-btn--danger"
            @click=${() => this._deleteRoom(vacIdx, roomIdx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>`;
  }

  // ── View: room editor ────────────────────────────────────────────────────

  private _renderRoomEditor(vacIdx: number, roomIdx: number) {
    const vac = this._config.vacuums[vacIdx];
    const room = (vac.rooms ?? [])[roomIdx];
    if (!room) return nothing;
    const map = vac.map ?? DEFAULT_MAP;
    const mapUrl = map.entity
      ? ((this.hass.states[map.entity]?.attributes["entity_picture"] as string) ?? "") : "";

    return html`
      <div class="view">
        <div class="view-header">
          <button class="back-btn" @click=${() => { this._view = { type: "vacuum", idx: vacIdx }; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span class="view-title">${room.name || room.key || "Room"}</span>
          <button class="icon-btn icon-btn--danger" @click=${() => this._deleteRoom(vacIdx, roomIdx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>

        <div class="section"><div class="section-title">Identity</div>
          ${this._textField("Key (unique ID)", room.key,
            v => this._setRoom(vacIdx, roomIdx, { key: v }), "e.g. bedroom")}
          ${this._textField("Display name", room.name,
            v => this._setRoom(vacIdx, roomIdx, { name: v }), "e.g. Bedroom")}
          ${this._iconPickerField(room.icon, v => this._setRoom(vacIdx, roomIdx, { icon: v }))}
          ${room.icon ? html`
            <div class="field">
              <label>Icon position</label>
              <div class="anchor-picker">
                ${(["tl","t","tr","l","c","r","bl","b","br"] as const).map(pos => {
                  const labels: Record<string,string> = {tl:"↖",t:"↑",tr:"↗",l:"←",c:"·",r:"→",bl:"↙",b:"↓",br:"↘"};
                  return html`<button
                    class="anchor-cell ${(room.icon_anchor ?? "c") === pos ? "anchor-cell--active" : ""}"
                    title=${pos}
                    @click=${() => this._setRoom(vacIdx, roomIdx, { icon_anchor: pos })}>
                    ${labels[pos]}
                  </button>`;
                })}
              </div>
              <button class="btn btn--sm" style="margin-top:4px"
                @click=${() => this._setRoom(vacIdx, roomIdx, { icon_anchor: "none" as any })}>
                Hide icon in overlay
              </button>
            </div>
          ` : nothing}
        </div>

        <div class="section"><div class="section-title">Cleaning</div>
          <div class="field field--row">
            <label>Segment ID</label>
            <input class="text-input text-input--sm" type="number"
              .value=${String(room.segment_id ?? "")} placeholder="e.g. 16"
              @change=${(e: Event) => {
                const v = parseInt((e.target as HTMLInputElement).value);
                this._setRoom(vacIdx, roomIdx, { segment_id: isNaN(v) ? undefined : v });
              }} />
          </div>
          <p class="hint">Find IDs via Developer Tools > Actions > roborock.get_maps</p>
          ${this._entityPicker("Toggle entity (input_boolean)", room.toggle_entity, ["input_boolean"],
            v => this._setRoom(vacIdx, roomIdx, { toggle_entity: v || undefined }))}
          ${this._entityPicker("Clean time entity (input_number)", room.clean_time_entity, ["input_number"],
            v => this._setRoom(vacIdx, roomIdx, { clean_time_entity: v || undefined }))}
          ${this._entityPicker("Last clean entity (input_datetime)", room.last_clean_entity, ["input_datetime"],
            v => this._setRoom(vacIdx, roomIdx, { last_clean_entity: v || undefined }))}
        </div>

        <div class="section"><div class="section-title">Position on map</div>
          ${mapUrl ? html`
            <p class="hint">Click the map to set position, or use the sliders.</p>
            <div class="map-pos-container"
              @click=${(e: MouseEvent) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                this._setRoom(vacIdx, roomIdx, { map_x: x, map_y: y });
              }}>
              <div class="map-preview-wrap">
                <img class="map-preview-img" src=${mapUrl} alt="Map"
                  style=${styleMap({
                    left:      (50 + (map.offset_x ?? 0)) + "%",
                    top:       (50 + (map.offset_y ?? 0)) + "%",
                    width:     (map.scale ?? 100) + "%",
                    transform: "translate(-50%,-50%) rotate(" + (map.rotation ?? 0) + "deg)",
                  })} />
                ${(vac.rooms ?? []).map((r, ri) => html`
                  <div class="pos-dot ${ri === roomIdx ? "pos-dot--active" : ""}"
                    style=${styleMap({ left: r.map_x + "%", top: r.map_y + "%" })}>
                    <ha-icon icon=${r.icon || "mdi:square"} style="--mdc-icon-size:14px"></ha-icon>
                  </div>`)}
              </div>
            </div>
          ` : html`<p class="hint">Set a map entity in the vacuum config to enable visual positioning.</p>`}
          ${this._numberSlider("X position", room.map_x ?? 50, 0, 100, 1,
            v => this._setRoom(vacIdx, roomIdx, { map_x: v }), "%")}
          ${this._numberSlider("Y position", room.map_y ?? 50, 0, 100, 1,
            v => this._setRoom(vacIdx, roomIdx, { map_y: v }), "%")}
          <div class="sub-title" style="margin-top:8px">Rectangle mód (volitelné)</div>
          <p class="hint">Pokud nastavíš šířku a výšku, místnost se zobrazí jako obdélník.<br>
            map_x/y = střed obdélníku. Bez nastavení = klasické tlačítko.</p>
          ${this._numberSlider("Šířka (map_w)", room.map_w ?? 0, 0, 80, 1,
            v => this._setRoom(vacIdx, roomIdx, { map_w: v > 0 ? v : undefined }), "%")}
          ${this._numberSlider("Výška (map_h)", room.map_h ?? 0, 0, 80, 1,
            v => this._setRoom(vacIdx, roomIdx, { map_h: v > 0 ? v : undefined }), "%")}
        </div>
      </div>`;
  }

  // ── View: global action editor ───────────────────────────────────────────

  private _renderGlobalEditor(idx: number) {
    const ga = (this._config.global_actions ?? [])[idx];
    if (!ga) return nothing;
    const action = ga.action;
    const watches = ga.watch_entities ?? [];

    return html`
      <div class="view">
        <div class="view-header">
          <button class="back-btn" @click=${() => { this._view = { type: "vacuums" }; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span class="view-title">${ga.name || "Global action"}</span>
          <button class="icon-btn icon-btn--danger" @click=${() => this._deleteGlobal(idx)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>

        <div class="section"><div class="section-title">Appearance</div>
          ${this._textField("Display name", ga.name,
            v => this._setGlobal(idx, { name: v }), "e.g. Whole flat")}
          ${this._textField("Image path", ga.image,
            v => this._setGlobal(idx, { image: v || undefined }), "/local/...")}
          ${this._selectField<VacuumColor>("Accent colour", ga.color ?? "orange",
            [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }],
            v => this._setGlobal(idx, { color: v }))}
        </div>

        <div class="section"><div class="section-title">Watch entities</div>
          <p class="hint">Badge glows when any of these is cleaning.</p>
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
        </div>

        <div class="section"><div class="section-title">Action (hold-to-activate)</div>
          ${this._selectField<"script" | "service">("Type", action.type,
            [{ value: "script", label: "Script" }, { value: "service", label: "Service call" }],
            v => this._setGlobal(idx, { action: v === "script"
              ? { type: "script", entity_id: "" }
              : { type: "service", service: "" } }))}
          ${action.type === "script" ? html`
            ${this._entityPicker("Script entity", action.entity_id, ["script"],
              v => this._setGlobalAction(idx, { entity_id: v }))}
          ` : html`
            ${this._textField("Service", (action as any).service,
              v => this._setGlobalAction(idx, { service: v }), "e.g. script.celkovy_uklid_bytu")}
          `}
        </div>
      </div>`;
  }

  // ── Main render ──────────────────────────────────────────────────────────

  render() {
    if (!this._config) return nothing;
    const v = this._view;
    let view;
    if (v.type === "vacuums")     view = this._renderVacuumList();
    else if (v.type === "vacuum") view = this._renderVacuumEditor(v.idx);
    else if (v.type === "room")   view = this._renderRoomEditor(v.vacuumIdx, v.roomIdx);
    else if (v.type === "global") view = this._renderGlobalEditor(v.idx);
    else return nothing;
    return html`<datalist id="ha-entities"></datalist>${view}`;
  }

  // ── Styles ───────────────────────────────────────────────────────────────

  static styles = css`
    .view { display:flex; flex-direction:column; gap:12px; padding:4px 0; }
    .view-header { display:flex; align-items:center; gap:8px; }
    .view-title  { flex:1; font-size:15px; font-weight:600; }

    .back-btn {
      display:flex; align-items:center; justify-content:center;
      width:32px; height:32px; border-radius:50%;
      background:rgba(0,0,0,0.08); cursor:pointer; border:none; flex-shrink:0;
    }

    .section { display:flex; flex-direction:column; gap:8px; }
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

    .vac-row {
      display:flex; align-items:center; gap:10px;
      padding:10px 10px 10px 12px; border-radius:10px;
      background:var(--secondary-background-color);
    }
    .vac-row__img  { width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0; }
    .vac-row__icon { width:40px; height:40px; flex-shrink:0; }
    .vac-row__info { flex:1; display:flex; flex-direction:column; }
    .vac-row__name   { font-weight:600; font-size:14px; }
    .vac-row__entity { font-size:11px; color:var(--secondary-text-color); }
    .vac-row__actions { display:flex; gap:4px; }

    .room-row {
      display:flex; align-items:center; gap:10px;
      padding:8px 10px; border-radius:8px;
      background:var(--secondary-background-color);
    }
    .room-row__icon { flex-shrink:0; }
    .room-row__info { flex:1; display:flex; flex-direction:column; }
    .room-row__name { font-weight:600; font-size:13px; }
    .room-row__meta { font-size:11px; color:var(--secondary-text-color); }
    .room-row__actions { display:flex; gap:4px; }

    .var-row { display:flex; align-items:center; gap:6px; }
    .var-sep { color:var(--secondary-text-color); flex-shrink:0; }

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
    }
    .icon-btn:hover { background:rgba(0,0,0,.08); }
    .icon-btn--danger { color:var(--error-color,#f44336); }
    .icon-btn--sm { width:24px; height:24px; }

    .map-preview-wrap {
      position:relative; width:100%; padding-top:27.5%;
      overflow:hidden; border-radius:8px; background:rgba(0,0,0,.06);
    }
    .map-preview-img { position:absolute; transform-origin:center center; object-fit:cover; }
    .map-calibration { display:flex; flex-direction:column; gap:8px; }
    .map-pos-container { cursor:crosshair; }

    .pos-dot {
      position:absolute; transform:translate(-50%,-50%);
      width:26px; height:26px; border-radius:6px;
      background:rgba(0,0,0,.55); border:2px solid rgba(255,255,255,.4);
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,.7); pointer-events:none;
    }
    .pos-dot--active { background:rgba(33,150,243,.75); border-color:#2196F3; color:white; }

    .hint { font-size:12px; color:var(--secondary-text-color); margin:0; }

    .anchor-picker {
      display:grid; grid-template-columns:repeat(3, 32px); gap:3px;
    }
    .anchor-cell {
      width:32px; height:32px; border-radius:6px; cursor:pointer;
      background:var(--secondary-background-color);
      border:1px solid var(--divider-color,rgba(0,0,0,.2));
      font-size:15px; display:flex; align-items:center; justify-content:center;
    }
    .anchor-cell--active {
      background:var(--primary-color); color:white;
      border-color:var(--primary-color);
    }
  `;
}
