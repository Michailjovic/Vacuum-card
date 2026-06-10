import { BLUEPRINT_VERSION } from "./const";

/**
 * Server-side cleaning tracker blueprint.
 *
 * The card fires `roborock_card_event` (action: cleaning_started) with the
 * full context — including the helper entity IDs of the selected rooms — so
 * this blueprint is fully generic: one static blueprint works for every
 * configuration, no per-user YAML generation needed.
 *
 * Flow:
 *  1. (optional) start notification
 *  2. wait until the vacuum leaves the dock (guards against the race where
 *     the event arrives while the state still reads docked/charging)
 *  3. wait until it returns to docked/charging (1-min debounce so brief dock
 *     visits between software-repeat passes don't end the session) or errors
 *  4. write per-room last-clean timestamps (input_datetime)
 *  5. (optional) single-room time calibration (input_number)
 *  6. (optional) finish notification
 *  7. fire cleaning_finished event (source: blueprint) — open cards listen
 *     for it and clear their room selection on every device
 */
export const BLUEPRINT_YAML = `blueprint:
  name: "Roborock Vacuum Card — Cleaning Tracker (v${BLUEPRINT_VERSION})"
  description: >-
    Companion automation for roborock-vacuum-card. Triggered by the
    cleaning_started event fired by the card; waits for the vacuum to finish,
    writes per-room last-clean timestamps, optionally calibrates single-room
    clean times and sends notifications. Runs server-side, so it works even
    when no dashboard is open. Managed by the card editor (Global tab).
  domain: automation
  source_url: https://github.com/Michailjovic/Vacuum-card
  input:
    notify_service:
      name: Notify action
      description: "e.g. notify.mobile_app_phone — leave empty to disable notifications"
      default: ""
      selector:
        text: {}
    notify_on_start:
      name: Notify on start
      default: true
      selector:
        boolean: {}
    notify_on_finish:
      name: Notify on finish
      default: true
      selector:
        boolean: {}
    notify_on_error:
      name: Notify on error
      default: true
      selector:
        boolean: {}
    single_room_time:
      name: Single-room time calibration
      description: >-
        When a run cleaned exactly one room, store the measured duration into
        that room's clean-time helper (input_number).
      default: false
      selector:
        boolean: {}
mode: parallel
max: 5
triggers:
  - trigger: event
    event_type: roborock_card_event
    event_data:
      action: cleaning_started
variables:
  notify_service: !input notify_service
  notify_on_start: !input notify_on_start
  notify_on_finish: !input notify_on_finish
  notify_on_error: !input notify_on_error
  single_room_time: !input single_room_time
  vacuum_entity: "{{ trigger.event.data.vacuum_entity }}"
  vacuum_label: "{{ trigger.event.data.vacuum_label | default(vacuum_entity) }}"
  room_keys: "{{ trigger.event.data.rooms | default([]) }}"
  room_labels: "{{ trigger.event.data.room_labels | default('') }}"
  estimated_mins: "{{ trigger.event.data.estimated_mins | default(0) }}"
  clean_type: "{{ trigger.event.data.clean_type | default('dry') }}"
  last_clean_entities: "{{ trigger.event.data.last_clean_entities | default([]) }}"
  clean_time_entities: "{{ trigger.event.data.clean_time_entities | default([]) }}"
  emoji: "{{ '\u{1FAE7}' if clean_type == 'wet' else '\u{1F9F9}' }}"
  started_ts: "{{ now().timestamp() }}"
actions:
  - if:
      - condition: template
        value_template: "{{ notify_on_start and notify_service != '' }}"
    then:
      - action: "{{ notify_service }}"
        continue_on_error: true
        data:
          title: "{{ emoji }} {{ vacuum_label }} — cleaning started"
          message: "{{ room_labels }} (~{{ estimated_mins }} min)"
  # Wait until the vacuum actually leaves the dock (max 3 min)
  - wait_template: "{{ states(vacuum_entity) not in ['docked', 'charging'] }}"
    timeout: "00:03:00"
    continue_on_timeout: false
  # Wait for the vacuum to return; 1-min debounce covers dock visits
  # between software-repeat passes (native-area strategy)
  - repeat:
      sequence:
        - wait_template: "{{ states(vacuum_entity) in ['docked', 'charging', 'error'] }}"
          timeout: "04:00:00"
          continue_on_timeout: false
        - if:
            - condition: template
              value_template: "{{ states(vacuum_entity) == 'error' }}"
          then:
            - if:
                - condition: template
                  value_template: "{{ notify_on_error and notify_service != '' }}"
              then:
                - action: "{{ notify_service }}"
                  continue_on_error: true
                  data:
                    title: "⚠️ {{ vacuum_label }} — problem"
                    message: "The vacuum reported an error. Please check it."
            - stop: "Vacuum reported an error"
        - delay: "00:01:00"
      until:
        - condition: template
          value_template: "{{ states(vacuum_entity) in ['docked', 'charging'] }}"
  - variables:
      actual_mins: "{{ ((now().timestamp() - started_ts) / 60) | round(0) | int }}"
  - repeat:
      for_each: "{{ last_clean_entities }}"
      sequence:
        - action: input_datetime.set_datetime
          continue_on_error: true
          target:
            entity_id: "{{ repeat.item }}"
          data:
            datetime: "{{ now().strftime('%Y-%m-%d %H:%M:%S') }}"
  - if:
      - condition: template
        value_template: >-
          {{ single_room_time and room_keys | length == 1
             and clean_time_entities | length == 1
             and actual_mins | int >= 1 }}
    then:
      - action: input_number.set_value
        continue_on_error: true
        target:
          entity_id: "{{ clean_time_entities[0] }}"
        data:
          value: "{{ [actual_mins | int, 180] | min }}"
  - if:
      - condition: template
        value_template: "{{ notify_on_finish and notify_service != '' }}"
    then:
      - action: "{{ notify_service }}"
        continue_on_error: true
        data:
          title: "{{ emoji }} {{ vacuum_label }} — cleaning finished"
          message: "{{ room_labels }} · took {{ actual_mins }} min"
  - event: roborock_card_event
    event_data:
      action: cleaning_finished
      source: blueprint
      vacuum_entity: "{{ vacuum_entity }}"
      vacuum_label: "{{ vacuum_label }}"
      rooms: "{{ room_keys }}"
      room_labels: "{{ room_labels }}"
      clean_type: "{{ clean_type }}"
      estimated_mins: "{{ estimated_mins }}"
      actual_mins: "{{ actual_mins }}"
      success: true
`;
