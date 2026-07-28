/*
========================================
GameAssist - Roll20 API Script
Version: 1.8.0
Last Updated: 2026-07-28 (America/New_York)
Development line: branded module migration and three-part project versioning.
Author: Mord Eagle
License: MIT for original GameAssist code; see LICENSE and ATTRIBUTIONS.md
Homepage: https://github.com/Mord-Eagle/GameAssist

DESCRIPTION
GameAssist is a modular D&D 5E (2014 and 2024) automation suite with an explicit opt-in
task queue, state/configuration helpers, consistent logging, and a core marker
service. Normal event handlers execute directly unless a module deliberately
calls GameAssist.enqueue(). This package ships with eleven configurable modules:
- ConfigUI 0.2.2 - GM-only chat controls for toggling modules and common options.
- CritAssist 0.2.5.1 - Detects natural-1 attacks and offers fumble/confirm menus.
- ConditionAssist 1.0.3 - Provides condition wording, artwork, announcements, and marker controls.
- TokenAssist 1.0.3 - Provides general token controls through !token-assist and !ta commands.
- InitiativeAssist 1.0.4 - Uses Roll20's native Turn Tracker for mixed-sheet initiative workflows and compact topic guidance.
- CombatAssist 1.0.5 - Tracks encounters, native round counters, guarded turns, optional timers, private-safe pings, and recoverable tracker changes.
- WelcomeAssist 0.1.4 - Optionally greets the table after a healthy GameAssist startup through short !Welcome commands.
- ConcentrationAssist 0.2.2 - Runs concentration checks and manages its configured marker.
- NPCAssist 1.3.2 - Tracks NPC death markers, history, reports, audits, repair previews, and Arc rosters.
- HPAssist 0.1.1.2 - Rolls npc_hpformula and writes the result to token bar 1.
- DebugTools 0.2.2 - Optional dry-run-first GM diagnostics.

INSTALL / USAGE
- One-Click: install GameAssist.
- Manual (Pro): paste this entire file into the Mod (API) Scripts editor and save.
- MarkerService is enabled by default and can be disabled without turning off
  GameAssist modules that do not use marker behavior.

CORE COMMANDS (GM)
- !ga-config list
- !ga-config modules
- !ga-config set <ModuleOrService> key=value
- !ga-config get <ModuleOrService> key
- !ga-config ui / !ga-config-ui
- !ga-enable <ModuleOrService> / !ga-disable <ModuleOrService>
- !ga-status [--details]
- !ga-timezone [set <IANA timezone>|clear]
- !ga-debug <action>

MODULE COMMANDS
- Each established module prefix accepts compact Guide/Help, Menu/GM/DM, Status,
  Info, Audit, and Manual navigation where applicable. Unknown commands provide
  an Open Guide recovery path. Substantial modules update one stable
  "GameAssist Guide - <Module>" handout; brief modules keep guidance in chat.
- CritAssist: !critfail, !crit, !critfumble help, !critfumble menu,
  !critfumble-<melee|ranged|thrown|spell|natural>,
  !confirm-crit-martial, !confirm-crit-magic
- ConditionAssist: !condition, !condition status, !cond-<condition>, !condition announce, !c-a, !cond-!, !condition help, !condition config,
  !condition add|remove|toggle <condition...>
- TokenAssist: !token-assist, !ta, !ta-<action>, !token-assist help|about|config;
  older supported !token-mod macros remain compatibility aliases during the v1.x line.
- InitiativeAssist: !Init-Menu, !Init-Help, !Init-Go, !Init-Go!, !Init-Roll,
  !Init-GM, !Init-DM, !Init-Roll-Selected, !Init-Options, !Init-Start, !Init-NPC-Rolls,
  !Init-RR, !Init-RR-Menu, !Init-Group, !Init-Audit
- CombatAssist: !Combat-Menu, !Combat-Help, !Combat-Start, !Combat-Next,
  !Combat-Prev, !Combat-End-Turn, !Combat-Adopt, !Combat-Restore,
  !Combat-Pause, !Combat-Resume, !Combat-Status, !Combat-End,
  !Combat-Announce, !Combat-Confirm, !Combat-Timer, !Combat-Cue
- WelcomeAssist: !Welcome, !Welcome-Help, !Welcome-Status, !Welcome-Preview,
  !Welcome-Announce, !Welcome-Mode, !Welcome-Delay, !Welcome-Header,
  !Welcome-Default, !Welcome-Custom; legacy !welcome-assist remains accepted.
- ConcentrationAssist: !Con, !Concentration, !ConcentrationAssist, !concentration-<command>, !con-<command>, !cc, !ga-conc-status
- NPCAssist: !NPC, !NPCAssist, !npc-<command>, !npc-death-<command>, !npcmanager-<command>,
  including !npc-death-help, !npc-death-report, !npc-death-buckets,
  !npc-death-clear, !npc-death-write, !npc-wr, !npc-death-audit, !npc-death-repair,
  !npc-death-arc
- HPAssist: !HP, !npc-hp-selected, !npc-hp-all
- DebugTools: !ga-debug damage|marker|save

V1.8.0 FOUNDATION
- [GAMEASSIST:CORE:MARKERSERVICE] is the single GameAssist authority for marker
  resolution, reads, writes, toggles, duplicate handling, and change observation.
- Built-in ids, custom display names, exact stored tags, numbered markers, and
  unrelated marker entries are preserved through a structured mutation contract.
- NPCAssist, ConcentrationAssist, and DebugTools use GameAssist.MarkerService.
- Marker-dependent GameAssist modules no longer depend on standalone TokenMod.
- ConditionAssist uses MarkerService for condition reads, writes, and change observation.
- TokenAssist uses MarkerService for every status-marker command.
- Disabling MarkerService also disables ConditionAssist, TokenAssist, NPCAssist,
  ConcentrationAssist, and DebugTools while CritAssist, ConfigUI,
  InitiativeAssist, CombatAssist, WelcomeAssist, and HPAssist remain available.
- Human-facing times and automatic Session date rollover use the DM's validated
  IANA timezone when configured; stored event timestamps remain absolute.
- [GAMEASSIST:CORE:TURNTRACKERSERVICE] is the only GameAssist authority for
  Roll20 turn-order snapshots, guarded writes, and tracker observations.
- InitiativeAssist supports official 2014 and 2024 Roll20 sheet initiative data;
  2024 Beacon access requires Roll20's supported asynchronous Mod API functions.
- CombatAssist starts disabled, observes exact tracker rotations, advances rounds
  from either a recognized native round-counter row or a complete unambiguous
  forward cycle, preserves the current round across valid native tracker edits,
  and writes only for an explicit next, previous, authorized End My Turn, or
  confirmed saved-tracker restoration. Optional stale-safe timers and native
  current-turn pings never advance initiative or alter token properties.
- WelcomeAssist is disabled by default and can post one delayed public greeting
  after a healthy GameAssist bootstrap when deliberately configured and enabled.
- Queue timeouts release the queue but cannot terminate Roll20 operations.
- Configuration snapshots contain configuration only, never runtime caches.

COMPATIBILITY / FOOTPRINT
- Namespaced under global GameAssist only.
- Does not override Roll20 global on/off handlers.
- Writes only to Roll20 objects documented in script.json.
- Standalone scripts that also change the same markers may still compete for
  ownership even though TokenMod is no longer required by GameAssist.

SUPPORT
Use !ga-status for system health and !ga-config list for a configuration snapshot.
For bug reports, include the relevant GameAssist chat output and sandbox console error.
========================================
*/

// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST"
//   project_version: "v1.8.0"
//   purpose: "Roll20 API modular kernel and bundled modules with MECHSUITS v1.5.2 contracts, branded module identities with migration-safe legacy aliases, explicit opt-in queue execution, state self-healing, dependency diagnostics, toggleable marker and Turn Tracker authorities, integrated condition guidance, general token controls, mixed 2014/2024 initiative workflows, preservation-first encounter flow, optional health-gated table greetings, and validated campaign time. Non-goals: fallback dispatch to standalone TokenMod/StatusInfo, implicit event queueing, automatic turn advancement, or automatic condition-duration management."
//   order: ["policy","app.utils","core.queue","core.compat","core.state","core.markerservice","core.turntrackerservice","core.object","interfaces.events","interfaces.commands","modules.configui","modules.critassist","modules.conditionassist","modules.tokenassist","modules.initiativeassist","modules.combatassist","modules.welcomeassist","modules.npcassist","modules.concentrationassist","modules.hpassist","modules.debugtools","bootstrap"]
//   env:
//     required: []
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Do not emit secrets or player data outside the Roll20 sandbox."
//     - "Do not override Roll20 global on/off handlers."
//   observability:
//     logs: "roll20_whisper_to_gm"
//     metrics: [{ name: "gameassist.queue.task_duration_ms", unit: "ms" }]
//     spans: ["[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:TURNTRACKERSERVICE]","[GAMEASSIST:MODULES:INITIATIVEASSIST]","[GAMEASSIST:MODULES:COMBATASSIST]","[GAMEASSIST:MODULES:WELCOMEASSIST]"]
//   performance: { notes: "No current benchmark claim; validate in the target Roll20 campaign sandbox." }
//   concurrency: { model: "Direct event handlers plus explicit opt-in serialized task queue", idempotency: "N/A (event-driven)" }
//   compatibility: { accepts: ["Roll20 API sandbox; current campaign smoke test required"], emits: "Roll20 chat whispers/logs" }
//   policy: { notes_ref: "[GAMEASSIST:POLICY]" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   transport_map:
//     chat: "Errors are whispered to GM; status/info are whispered as structured text"
//   canonical_tree: |
//     [GAMEASSIST]/
//     â”œâ”€ [GAMEASSIST:POLICY]
//     â”œâ”€ [GAMEASSIST:APP]
//     â”‚  â””â”€ [GAMEASSIST:APP:UTILS]
//     â”œâ”€ [GAMEASSIST:CORE]
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:QUEUE]
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:COMPAT]
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:STATE]
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:MARKERSERVICE]
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:TURNTRACKERSERVICE]
//     â”‚  â””â”€ [GAMEASSIST:CORE:OBJECT]
//     â”œâ”€ [GAMEASSIST:INTERFACES]
//     â”‚  â”œâ”€ [GAMEASSIST:INTERFACES:EVENTS]
//     â”‚  â””â”€ [GAMEASSIST:INTERFACES:COMMANDS]
//     â”œâ”€ [GAMEASSIST:MODULES]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:CONFIGUI]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:CRITASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:CONDITIONASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:TOKENASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:INITIATIVEASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:COMBATASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:WELCOMEASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:NPCASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:CONCENTRATIONASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:HPASSIST]
//     â”‚  â””â”€ [GAMEASSIST:MODULES:DEBUGTOOLS]
//     â””â”€ [GAMEASSIST:BOOTSTRAP]
// --- prose banner ---
// Guarantee: GameAssist v1.8.0 runs policy, utilities, guarded core services including MarkerService and TurnTrackerService, interfaces, independently lifecycle-managed condition/token/initiative/combat/welcome/gameplay modules, then bootstrap in the declared order. Branded module names own current state and controls while documented legacy names resolve through explicit compatibility aliases. Human-facing times use the validated campaign timezone while stored instants remain absolute. Secrets required: none. It refuses to emit player data outside Roll20 or override Roll20 global on/off handlers.

// =============================
// === GameAssist v1.8.0 ===
// === Author: Mord Eagle ===
// =============================
// Released under the MIT License (see https://opensource.org/licenses/MIT)
//
// Copyright (c) 2025 Mord Eagle
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(() => {
    'use strict';

    const R20_ON = (typeof on === 'function') ? on : (typeof globalThis?.on === 'function' ? globalThis.on : null);
    if (!R20_ON) throw new Error('Roll20 "on" is unavailable.');

    // =============================================================================
    // [GAMEASSIST:POLICY] BEGIN
    // Section Title: Tunables and operational policy
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "POLICY", title: "Tunables",
    //   guarantees: ["Shared behavioral knobs and snapshot identifiers have one owner; NPC initialization, timezone input, condition, initiative, combat, and welcome limits remain explicit"],
    //   provides: ["POLICY"], last_updated_version: "v0.1.7.0", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // POLICY owns shared timeouts, cache limits, UI defaults, snapshot identifiers,
    // and declared metric names.
    // Values preserve v0.1.4 behavior; callers reference POLICY so future
    // changes have one explicit review and rollback point.
    // -------------------------------------------------------------------------
    const POLICY = Object.freeze({
        queue: Object.freeze({
            defaultTimeoutMs: 30000,
            watchdogIntervalMs: 15000,
            watchdogMultiplier: 2
        }),
        metrics: Object.freeze({
            historyLimit: 50,
            durationLimit: 20,
            queueDurationName: 'gameassist.queue.task_duration_ms'
        }),
        runtime: Object.freeze({
            activePlayerLimit: 50,
            deathLogLimit: 100,
            npcAuditDetailLimit: 8,
            deathReportSummaryLimit: 5,
            deathReportDetailLimit: 10,
            npcHpInitializationGraceMs: 2000,
            lastDamageLimit: 50
        }),
        timestamps: Object.freeze({
            maxFutureMs: 1000 * 60 * 60 * 24 * 7,
            maxTimeZoneLength: 100,
            formatterCacheLimit: 32,
            locale: 'en-US',
            commonTimeZones: Object.freeze([
     Ûµã‹h‘éì¶»§q«^uÉ•Ğ€ôôô€½¹™¥œœñğ‘¥É•Ğ€ôôô€Í•ÑÑ¥¹Ìœ¤É•ÑÕÉ¸Í¡½İ½¹•¹ÑÉ…Ñ¥½¹M•ÑÑ¥¹Ì¡Á±…å•È¤ì(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ (€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•Éôˆ€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍÑõôíí9••‘ÌÑÑ•¹Ñ¥½¸õQ¡…Ğ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ½µµ…¹İ…Ì¹½ĞÉ•½¹¥é•¹õôíí9•áĞMÑ•Àô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ =Á•¸Õ¥‘”œ°€œ…½¹•¹ÑÉ…Ñ¥½¸¡•±Àœ¥õõõ€(€€€€€€€€€€€€¤ì(€€€€€€€ô((€€€€€€€½¹ÍĞÁ…ÉÑÌ€ô¹½Éµ…±¥é•‘I…Ü¹Ñ½1½İ•É…Í” ¤¹ÍÁ±¥Ğ ½qÌ¬´´¼¤ì(€€€€€€€Á…ÉÑÌ¹Í¡¥™Ğ ¤ì(4(€€€€€€€€¼¼€Ì¤½¹™¥œ‰É…¹ 4(€€€€€€€¥˜€¡Á…ÉÑÍlÁtü¹ÍÑ…ÉÑÍ]¥Ñ  ½¹™¥œ€œ¤¤ì4(€€€€€€€€€€€½¹ÍĞl°­•ä°Ù…±t€ôÁ…ÉÑÍlÁt¹ÍÁ±¥Ğ ½qÌ¬¼¤ì4(€€€€€€€€€€€¥˜€¡­•ä€ôôô€É…¹‘½µ¥é”œ¤ì4(€€€€€€€€€€€€€€€µ½‘MÑ…Ñ”¹½¹™¥œ¹É…¹‘½µ¥é”€ô€¡Ù…°€ôôô€½¸œñğÙ…°€ôôô€ÑÉÕ”œ¤ì4(€€€€€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•ÉôˆƒŠrI…¹‘½µ¥é”€ô€‘íµ½‘MÑ…Ñ”¹½¹™¥œ¹É…¹‘½µ¥é•õ€4(€€€€€€€€€€€€€€€€¤ì4(€€€€€€€€€€€ô4(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•ÉôˆƒŠv0U¹­¹½İ¸½¹™¥œ€‘í­•åõ€4(€€€€€€€€€€€€¤ì4(€€€€€€€ô4(4(€€€€€€€€¼¼€Ğ¤A…ÉÍ”™±…Ì4(€€€€€€€±•Ğ‘…µ…”€ô€À°µ½‘”€ô€¹½Éµ…°œì(€€€€€€€™½È€¡±•ĞÀ½˜Á…ÉÑÌ¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€¡•±ÀœñğÀ€ôôô€Õ¥‘”œ¤É•ÑÕÉ¸Í¡½İ!•±À¡Á±…å•È¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€ÍÑ…ÑÕÌœ¤É•ÑÕÉ¸Í¡½İMÑ…ÑÕÌ¡Á±…å•È¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€…Õ‘¥Ğœ¤€É•ÑÕÉ¸Í¡½İMÑ…ÑÕÌ¡Á±…å•È°ì…Õ‘¥ĞèÑÉÕ”ô¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€¥¹™¼œ¤€€É•ÑÕÉ¸Í¡½İ½¹•¹ÑÉ…Ñ¥½¹%¹™¼¡Á±…å•È¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€µ…¹Õ…°œ¤É•ÑÕÉ¸İÉ¥Ñ•½¹•¹ÑÉ…Ñ¥½¹5…¹Õ…°¡µÍœ°Á±…å•È¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€±…ÍĞœ¤€€É•ÑÕÉ¸¡…¹‘±•1…ÍĞ¡µÍœ¤ì(€€€€€€€€€€€¥˜€¡À€ôôô€½™˜œ¤€€€É•ÑÕÉ¸¡…¹‘±•±•…È¡µÍœ¤ì(€€€€€€€€€€€¥˜€¡À¹ÍÑ…ÉÑÍ]¥Ñ  ‘…µ…”€œ¤¤ì(€€€€€€€€€€€€€€€‘…µ…”€ôÁ…ÉÍ•%¹Ğ¡À¹ÍÁ±¥Ğ œ€œ¥lÅt°€ÄÀ¤ì(€€€€€€€€€€€€€€€¥˜€¡‘…µ…”€ø€À¤½¹Ñ¥¹Õ”ì(€€€€€€€€€€€ô(€€€€€€€€€€€¥˜€¡À¹ÍÑ…ÉÑÍ]¥Ñ  µ½‘”€œ¤¤ì(€€€€€€€€€€€€€€€µ½‘”€ôÀ¹ÍÁ±¥Ğ œ€œ¥lÅtì(€€€€€€€€€€€€€€€¥˜€¡l¹½Éµ…°œ°€…‘Øœ°€‘¥Ìt¹¥¹±Õ‘•Ì¡µ½‘”¤¤½¹Ñ¥¹Õ”ì(€€€€€€€€€€€ô(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ (€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•Éôˆ€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍÑõôíí9••‘ÌÑÑ•¹Ñ¥½¸õQ¡…Ğ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ½ÁÑ¥½¸İ…Ì¹½ĞÉ•½¹¥é•¹õôíí9•áĞMÑ•Àô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ =Á•¸Õ¥‘”œ°€œ…½¹•¹ÑÉ…Ñ¥½¸¡•±Àœ¥õõõ€(€€€€€€€€€€€€¤ì(€€€€€€€ô(4(€€€€€€€€¼¼€Ô¤á•ÕÑ”4(€€€€€€€¥˜€¡‘…µ…”€ø€À¤ì4(€€€€€€€€€€€¡…¹‘±•I½±°¡µÍœ°‘…µ…”°µ½‘”¤ì4(€€€€€€€ô•±Í”ì4(€€€€€€€€€€€Á½ÍÑ	ÕÑÑ½¹Ì¡Á±…å•È¤ì4(€€€€€€€ô4(€€€ô4(4(€€€€¼¼ƒŠRŠRŠR ]¥É”%ĞUÀƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR 4(€€€…µ•ÍÍ¥ÍĞ¹½¹½µµ…¹ œ…„µ½¹ŒµÍÑ…ÑÕÌœ°€ ¤€ôøì4(€€€€€€€½¹ÍĞÑÁ°€ô‰Õ¥±‘MÑ…ÑÕÍQ•µÁ±…Ñ” ¤ì4(€€€€€€€¥˜€ …ÑÁ°¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€9¼½¹•¹ÑÉ…Ñ¥½¸…Ñ¥Ù¥ÑäÉ•½É‘•å•Ğ¸œ¤ì(€€€€€€€€€€€É•ÑÕÉ¸ì4(€€€€€€€ô4(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü´€‘íÑÁ±õ€¤ì(€€€ô°€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°ìµ=¹±äèÑÉÕ”ô¤ì(4(€€€…µ•ÍÍ¥ÍĞ¹½¹Ù•¹Ğ ¡…Ğéµ•ÍÍ…”œ°¡…¹‘±•È°€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ¤ì(€€€…µ•ÍÍ¥ÍĞ¹±½œ 4(€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€I•…‘äè€‘íl¸¸¹5L°€œ…„µ½¹ŒµÍÑ…ÑÕÌt¹©½¥¸ œ€˜€œ¥õ€°4(€€€€€€€€%9<œ°4(€€€€€€€ìÍÑ…ÉÑÕÀèÑÉÕ”ô4(€€€€¤ì4)ô°ì4(€€€•¹…‰±•è€ÑÉÕ”°4(€€€•Ù•¹ÑÌèl¡…Ğéµ•ÍÍ…”t°4(€€€ÁÉ•™¥á•Ìèlœ…½¸œ°œ…½¹•¹ÑÉ…Ñ¥½¸œ°œ…½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°œ…½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ´œ°œ…½¹•¹ÑÉ…Ñ¥½¸œ°œ…½¹•¹ÑÉ…Ñ¥½¸´œ°œ…½¸´œ°œ…Œœ°œ…„µ½¹ŒµÍÑ…ÑÕÌt°(€€€‘•Á•¹‘Í=¸èl5…É­•ÉM•ÉÙ¥”t°4(€€€Ñ•…É‘½İ¸è€ ¤€ôøì4(€€€€€€€½¹ÍĞÁ…”€ô…µÁ…¥¸ ¤¹•Ğ Á±…å•ÉÁ…•¥œ¤ì4(€€€€€€€½¹ÍĞµ…É­•È€ô€¡…µ•ÍÍ¥ÍĞ¹•ÑMÑ…Ñ” ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ¤ü¹½¹™¥œü¹µ…É­•È¤ñğ€½¹•¹ÑÉ…Ñ¥¹œœì(€€€€€€€½¹ÍĞÉ•Í½±ÕÑ¥½¸€ô…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹É•Í½±Ù”¡µ…É­•È¤ì4(€€€€€€€¥˜€ …É•Í½±ÕÑ¥½¸¹½¬¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 4(€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€Q•…É‘½İ¸½Õ±¹½ĞÉ•Í½±Ù”½¹™¥ÕÉ•µ…É­•È€ˆ‘íµ…É­•Éôˆì¹¼µ…É­•ÉÌİ•É”É•µ½Ù•¹€°4(€€€€€€€€€€€€€€€€]I8œ4(€€€€€€€€€€€€¤ì4(€€€€€€€€€€€É•ÑÕÉ¸ì4(€€€€€€€ô4(€€€€€€€½¹ÍĞÑ…É•ÑÌ€ô™¥¹‘=‰©Ì¡ì}ÑåÁ”è€É…Á¡¥Œœ°}Á…•¥èÁ…”°±…å•Èè€½‰©•ÑÌœô¤4(€€€€€€€€€€€€¹™¥±Ñ•È¡Ğ€ôø…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹¡…Ì¡Ğ°É•Í½±ÕÑ¥½¸¹¥¤¤ì4(€€€€€€€±•ĞÉ•µ½Ù•€ô€Àì4(€€€€€€€Ñ…É•ÑÌ¹™½É… ¡Ñ½­•¸€ôøì4(€€€€€€€€€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹É•µ½Ù”¡Ñ½­•¸°É•Í½±ÕÑ¥½¸¹¥°ì½İ¹•Èè€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœô¤ì(€€€€€€€€€€€¥˜€ …É•ÍÕ±Ğ¹½¬¤ì4(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°É•ÍÕ±Ğ¹µ•ÍÍ…”ñğ5…É­•ÈÉ•µ½Ù…°™…¥±•€ ‘íÉ•ÍÕ±Ğ¹½‘”ñğ€%9QI90ô¤¹€°€]I8œ¤ì(€€€€€€€€€€€ô•±Í”¥˜€¡É•ÍÕ±Ğ¹¡…¹•¤ì4(€€€€€€€€€€€€€€€É•µ½Ù•¬¬ì4(€€€€€€€€€€€ô4(€€€€€€€ô¤ì4(€€€€€€€¥˜€¡É•µ½Ù•¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°I•µ½Ù•Ñ¡”½¹•¹ÑÉ…Ñ¥½¸µ…É­•È™É½´€‘íÉ•µ½Ù•‘ôÑ½­•¸¡Ì¤‘ÕÉ¥¹œÑ•…É‘½İ¸¹€¤ì(€€€€€€€ô4(€€€ô4(€€€ô¤ì4(€€€€¼¼€´´´9½Ñ•Ì€˜½µµ•¹ÑÌ€´´´4(€€€€¼¼¡…¹•€¡ØÄ¸à¸À¤èI•¹…µ•Ñ¡”µ½‘Õ±”Ñ¼½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞİ¡¥±”ÁÉ•Í•ÉÙ¥¹œÍ…Ù•½¹•¹ÑÉ…Ñ¥½¸…Ñ¥Ù¥Ñä°€…½¹•¹ÑÉ…Ñ¥½¸°€…½¸°€…Œ°…¹Ñ¡”½µÁ±•Ñ”ÁÉ¥½È½ÁÑ¥½¸É…µµ…È¸(€€€€¼¼•¥Í¥½¸±½œè4(€€€€¼¼€€!=%è-••À±½İ•É…Í”Á…ÉÍ¥¹œ…¹•ÍÑ…‰±¥Í¡•…±¥…Í•Ì€´1Pè¥¹ÑÉ½‘Õ”„¹•Ü½µµ…¹É…µµ…ÈìI)QèÕ¹¹••ÍÍ…ÉäÕÍ•ÈÉ•ÑÉ…¥¹¥¹œ¸4(€€€€¼¼AÉ¥½È¹½Ñ•Ìè4(€€€€¼¼€€ØÀ¸Ä¸Ğ¸Üè‘Ù…¹•Ñ¼€À¸Ä¸À¸Ø…¹ÕÍ•Ù•É¥™¥•Q½­•¹5½€´µ…Á¤µ…Ìµ…É­•ÈÉ•ÅÕ•ÍÑÌİ¡¥±”ÁÉ•Í•ÉÙ¥¹œÍÑ…¹‘…±½¹”MÑ…ÑÕÍ%¹™¼½‰Í•ÉÙ…Ñ¥½¸¸4(€€€€¼¼€€ØÀ¸Ä¸Ğ¸ÌèI•Í½±Ù•ÕÍÑ½´µ…É­•È¹…µ•ÌÑ¼ÍÑ½É•Ñ…Ì…¹É•Á½ÉÑ•Õ¹É•½¹¥é•½¹™¥ÕÉ…Ñ¥½¸¸4(€€€€¼¼€€ØÀ¸Ä¸Ğ¸ÄèI½ÕÑ•±…ÍÑ…µ…”±¥µ¥ÑÌ…¹Ñ¥µ•ÍÑ…µÁÌÑ¡É½Õ A=1%d½Í¡…É•Ñ¥µ”Í•…µÌ¸4(€€€€¼¼€€ØÀ¸Ä¸Ğè‘‘••á…Ğ½¹™¥ÕÉ•µµ…É­•Èµ…Ñ¡¥¹œ…¹4İ¡¥ÍÁ•È¡…¹‘±¥¹œ¸4(€€€€¼¼€€ØÀ¸Ä¸ÌèM…¹¥Ñ¥é•Ñ¥µ•ÍÑ…µÁÌ°¹½Éµ…±¥é•±•…ä½ÉÕ¹Ñ¥µ”±…ÍÑ…µ…”•¹ÑÉ¥•Ì°Í•±˜µ¡•…±•Á½ÍĞµÑ½±”ÍÑ…Ñ”°…¹…‘‘•µ½‘Õ±”¹…ÉÉ…Ñ¥Ù”¸4(€€€€¼¼€€ØÀ¸Ä¸Ä¸ÈèUÁ‘…Ñ•5!MU%QLµ•Ñ…‘…Ñ„¸4(€€€€¼¼€€ØÀ¸Ä¸Ü¸Àè‘Ù…¹•½¹•¹ÑÉ…Ñ¥½¹QÉ…­•ÈÑ¼€À¸È¸Èì…Í”µ¥¹Í•¹Í¥Ñ¥Ù”€…½¸´¨…¹€…½¹•¹ÑÉ…Ñ¥½¸´¨…±¥…Í•Ì½Ù•È¥ÑÌ½µµ…¹ÍÕÉ™…”°4½4½Á•¸¡•¬½¹ÑÉ½±Ì°…¹€…½¹•¹ÑÉ…Ñ¥½¸°€…Œ°…¹•Ù•Éä•ÍÑ…‰±¥Í¡•€´µ½ÁÑ¥½¸™½É´É•µ…¥¸½µÁ…Ñ¥‰±”¸(€€€€¼¼m5MM%MPé5=U1Lé=99QIQ%=9MM%MQt9(€€€€¼¼€ôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôô4(4(€€€€¼¼ƒŠSŠSŠSŠSŠP!AMM%MP5=U1ØÀ¸Ä¸Ä¸ÈƒŠSŠSŠSŠSŠP(€€€€¼¼€ôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôô4(€€€€¼¼m5MM%MPé5=U1Lé!AMM%MQt	%8(€€€€¼¼M•Ñ¥½¸Q¥Ñ±”è!AÍÍ¥ÍĞµ½‘Õ±”(€€€€¼¼€´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´4(€€€€¼¼µ•¡ÍÕ¥Ñ}Í•Ñ¥½¸èì½‘•¹…µ”è€‰5MM%MPˆ°…É•„è€‰5=U1Lé!AMM%MPˆ°Ñ¥Ñ±”è€‰!AÍÍ¥ÍĞˆ°(€€€€¼¼€€Õ…É…¹Ñ••Ìèl‰A…ÉÍ”9‘7
Å,…¹Í•Ğ‰…ÈÄÑ¼É½±±•!@ˆ°‰½µÁ…ĞÕ¥‘”°ÍÑ…ÑÕÌ°Í•ÑÑ¥¹Ì°É•…µ½¹±äÁ…”…Õ‘¥Ğ°…¹Õ¹­¹½İ¸µ½µµ…¹É•½Ù•ÉäÕÍ”Ñ¡”•ÍÑ…‰±¥Í¡•€…¹ÁŒµ¡À´ÁÉ•™¥à‰t°(€€€€¼¼€€±…ÍÑ}ÕÁ‘…Ñ•‘}Ù•ÉÍ¥½¸è€‰ØÄ¸à¸Àˆ°(€€€€¼¼€€¥¹‘•Á•¹‘•¹Ñ}Ù•ÉÍ¥½¹Ìèìµ½‘Õ±•}Ù•ÉÍ¥½¸è€ˆÀ¸Ä¸Ä¸Èˆôô(€€€€¼¼€´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´4(€€€€¼¼9…ÉÉ…Ñ¥Ù”4(€€€€¼¼5=U1Lé!AMM%MPÁ…ÉÍ•Ì¹Á}¡Á™½ÉµÕ±…€°É½±±Ì!@°…¹İÉ¥Ñ•ÌÑ¼‰…ÈÄÙ…±Õ”½µ…à(€€€€¼¼İ¥Ñ¡½ÕĞ…±Ñ•É¥¹œ‘•™…Õ±ÑÌ¸%Ğ­••ÁÌÑ¡”±•…ä‘¥”Á…ÉÍ¥¹œÍ•µ…¹Ñ¥Ì…¹‰…ÈİÉ¥Ñ•Ì4(€€€€¼¼İ¡¥±”ÍÕÉ™…¥¹œİ…É¹¥¹Ìİ¡•¸™½ÉµÕ±…Ì…É”¥¹Ù…±¥¸4(€€€€¼¼€´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´4(€€€…µ•ÍÍ¥ÍĞ¹É•¥ÍÑ•È !AÍÍ¥ÍĞœ°™Õ¹Ñ¥½¸ ¤ì(€€€€€€€½¹ÍĞµ½‘MÑ…Ñ”€ô…µ•ÍÍ¥ÍĞ¹•ÑMÑ…Ñ” !AÍÍ¥ÍĞœ¤ì(€€€€€€€½¹ÍĞ5=U1}YIM%=8€ô€œÀ¸Ä¸Ä¸Èœì(4(€€€=‰©•Ğ¹…ÍÍ¥¸¡µ½‘MÑ…Ñ”¹½¹™¥œ°ì4(€€€€€€€•¹…‰±•èÑÉÕ”°4(€€€€€€€…ÕÑ½I½±±=¹‘è™…±Í”°4(€€€€€€€€¸¸¹µ½‘MÑ…Ñ”¹½¹™¥œ4(€€€ô¤ì4(4(€€€€€€€™Õ¹Ñ¥½¸Á…ÉÍ•¥•MÑÉ¥¹œ¡‘¥•MÑÈ¤ì4(€€€€€€€€€€€€¼¼5…Ñ ƒŠq9‘7Št°ƒŠq9‘4­/Št°ƒŠq9‘4€¬/Št°ƒŠq9‘4µ/Št°…Í”µ¥¹Í•¹Í¥Ñ¥Ù”½¸ƒŠq“Št4(€€€€€€€€€€€½¹ÍĞµ…Ñ €ô‘¥•MÑÈ¹µ…Ñ  4(€€€€€€€€€€€€€€€€½yqÌ¨¡q¬¥qÌ©m‘uqÌ¨¡q¬¤ üéqÌ¨¡l¬µt¥qÌ¨¡q¬¤¤ıqÌ¨¼4(€€€€€€€€€€€€¤ì4(€€€€€€€€€€€¥˜€ …µ…Ñ ¤É•ÑÕÉ¸¹Õ±°ì4(4(€€€€€€€€€€€½¹ÍĞ½Õ¹Ğ€ôÁ…ÉÍ•%¹Ğ¡µ…Ñ¡lÅt°€ÄÀ¤ì4(€€€€€€€€€€€½¹ÍĞÍ¥‘•Ì€ôÁ…ÉÍ•%¹Ğ¡µ…Ñ¡lÉt°€ÄÀ¤ì4(€€€€€€€€€€€½¹ÍĞÍ¥¸€€ôµ…Ñ¡lÍt€ôôô€œ´œ€ü€´Ä€è€Äì4(€€€€€€€€€€€½¹ÍĞ‰½¹ÕÌ€ôµ…Ñ¡lÑt€üÍ¥¸€¨Á…ÉÍ•%¹Ğ¡µ…Ñ¡lÑt°€ÄÀ¤€è€Àì4(4(€€€€€€€€€€€É•ÑÕÉ¸ì½Õ¹Ğ°Í¥‘•Ì°‰½¹ÕÌôì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸É½±±¥”¡½Õ¹Ğ°Í¥‘•Ì¤ì4(€€€€€€€€€€€±•ĞÑ½Ñ…°€ô€Àì4(€€€€€€€€€€€™½È€¡±•Ğ¤€ô€Àì¤€ğ½Õ¹Ğì¤¬¬¤ì4(€€€€€€€€€€€€€€€Ñ½Ñ…°€¬ô5…Ñ ¹™±½½È¡5…Ñ ¹É…¹‘½´ ¤€¨Í¥‘•Ì¤€¬€Äì4(€€€€€€€€€€€ô4(€€€€€€€€€€€É•ÑÕÉ¸Ñ½Ñ…°ì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸É½±±!@¡‘¥•…Ñ„¤ì4(€€€€€€€€€€€½¹ÍĞì½Õ¹Ğ°Í¥‘•Ì°‰½¹ÕÌô€ô‘¥•…Ñ„ì4(€€€€€€€€€€€É•ÑÕÉ¸É½±±¥”¡½Õ¹Ğ°Í¥‘•Ì¤€¬‰½¹ÕÌì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸É•Í½±Ù•9Á½¹Ñ•áĞ¡Ñ½­•¸°ì±½]…É¹¥¹Ì€ôÑÉÕ”ô€ôíô¤ì4(€€€€€€€€€€€¥˜€ …Ñ½­•¸¤ì4(€€€€€€€€€€€€€€€¥˜€¡±½]…É¹¥¹Ì¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°€Q½­•¸¹½Ğ™½Õ¹œ°€]I8œ¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€€€€€É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€½¹ÍĞ±¥¹­•€ô…µ•ÍÍ¥ÍĞ¹•Ñ1¥¹­•‘¡…É…Ñ•È¡Ñ½­•¸¤ì4(€€€€€€€€€€€¥˜€ …±¥¹­•¤ì4(€€€€€€€€€€€€€€€¥˜€¡±½]…É¹¥¹Ì¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°€‘íÑ½­•¸¹•Ğ ¹…µ”œ¤ñğ€Q½­•¸ôµÕÍĞ‰”±¥¹­•Ñ¼„¡…É…Ñ•È½¸Ñ¡”=‰©•ÑÌ±…å•È¹€°€]I8œ¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€€€€€É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€½¹ÍĞ‘¥ÍÁ±…å9…µ”€ôÑ½­•¸¹•Ğ ¹…µ”œ¤ñğ±¥¹­•¹¡…É…Ñ•È¹•Ğ ¹…µ”œ¤ñğ€Q½­•¸œì4(4(€€€€€€€€€€€½¹ÍĞ¹ÁÑÑÈ€ô™¥¹‘=‰©Ì¡ì4(€€€€€€€€€€€€€€€}ÑåÁ”è€…ÑÑÉ¥‰ÕÑ”œ°4(€€€€€€€€€€€€€€€}¡…É…Ñ•É¥è±¥¹­•¹¡…É…Ñ•È¹¥°4(€€€€€€€€€€€€€€€¹…µ”è€¹ÁŒœ4(€€€€€€€€€€€ô¥lÁtì4(4(€€€€€€€€€€€¥˜€ …¹ÁÑÑÈñğ¹ÁÑÑÈ¹•Ğ ÕÉÉ•¹Ğœ¤€„ôô€œÄœ¤ì4(€€€€€€€€€€€€€€€¥˜€¡±½]…É¹¥¹Ì¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°€‘í‘¥ÍÁ±…å9…µ•ô¥Ì¹½Ğ™±…•…Ì…¸9A¹€°€]I8œ¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€€€€€É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€½¹ÍĞ¡Á½ÉµÕ±…ÑÑÈ€ô™¥¹‘=‰©Ì¡ì4(€€€€€€€€€€€€€€€}ÑåÁ”è€…ÑÑÉ¥‰ÕÑ”œ°4(€€€€€€€€€€€€€€€}¡…É…Ñ•É¥è±¥¹­•¹¡…É…Ñ•È¹¥°4(€€€€€€€€€€€€€€€¹…µ”è€¹Á}¡Á™½ÉµÕ±„œ4(€€€€€€€€€€€ô¥lÁtì4(4(€€€€€€€€€€€¥˜€ …¡Á½ÉµÕ±…ÑÑÈ¤ì4(€€€€€€€€€€€€€€€¥˜€¡±½]…É¹¥¹Ì¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°9¼!@™½ÉµÕ±„™½Õ¹™½È€‘í‘¥ÍÁ±…å9…µ•õ€°€]I8œ¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€€€€€É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€½¹ÍĞ™½ÉµÕ±„€ô¡Á½ÉµÕ±…ÑÑÈ¹•Ğ ÕÉÉ•¹Ğœ¤ì4(€€€€€€€€€€€½¹ÍĞ‘¥•…Ñ„€ôÁ…ÉÍ•¥•MÑÉ¥¹œ¡™½ÉµÕ±„¤ì4(4(€€€€€€€€€€€¥˜€ …‘¥•…Ñ„¤ì4(€€€€€€€€€€€€€€€¥˜€¡±½]…É¹¥¹Ì¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°%¹Ù…±¥!@™½ÉµÕ±„è€‘í™½ÉµÕ±…õ€°€]I8œ¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€€€€€É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€É•ÑÕÉ¸ì±¥¹­•°™½ÉµÕ±„°‘¥•…Ñ„°‘¥ÍÁ±…å9…µ”ôì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸É½±±Q½­•¹!@¡Ñ½­•¸°ì±½]…É¹¥¹Ì€ôÑÉÕ”°É•…Í½¸€ô€µ…¹Õ…°œô€ôíô¤ì(€€€€€€€€€€€½¹ÍĞ½¹Ñ•áĞ€ôÉ•Í½±Ù•9Á½¹Ñ•áĞ¡Ñ½­•¸°ì±½]…É¹¥¹Ìô¤ì4(€€€€€€€€€€€¥˜€ …½¹Ñ•áĞ¤É•ÑÕÉ¸™…±Í”ì4(4(€€€€€€€€€€€½¹ÍĞ¡À€ôÉ½±±!@¡½¹Ñ•áĞ¹‘¥•…Ñ„¤ì4(4(€€€€€€€€€€€Ñ½­•¸¹Í•Ğ ‰…ÈÅ}Ù…±Õ”œ°¡À¤ì4(€€€€€€€€€€€Ñ½­•¸¹Í•Ğ ‰…ÈÅ}µ…àœ°¡À¤ì4(4(€€€€€€€€€€€½¹ÍĞÍÕ™™¥à€ôÉ•…Í½¸€ôôô€…ÕÑ¼œ€ü€œ€¡…ÕÑ¼µÉ½±°½¸…‘¤œ€è€œœì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ !AÍÍ¥ÍĞœ°€‘í½¹Ñ•áĞ¹‘¥ÍÁ±…å9…µ•ô!@Í•ĞÑ¼€‘í¡ÁôÕÍ¥¹œl‘í½¹Ñ•áĞ¹™½ÉµÕ±…õt‘íÍÕ™™¥áõ€¤ì(€€€€€€€€€€€É•ÑÕÉ¸ÑÉÕ”ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Í•¹‘9Á!ÁA…¹•°¡Ñ¥Ñ±”°™¥•±‘Ì¤ì(€€€€€€€€€€€½¹ÍĞ‰½‘ä€ô™¥•±‘Ì¹µ…À¡™¥•±€ôøíì‘í}Í…¹¥Ñ¥é”¡™¥•±¹±…‰•°¥ôô‘í™¥•±¹Ù…±Õ•õõõ€¤¹©½¥¸ œ€œ¤ì(€€€€€€€€€€€Í•¹‘¡…Ğ !AÍÍ¥ÍĞœ°€½Ü´€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”ô‘í}Í…¹¥Ñ¥é”¡Ñ¥Ñ±”¥õõô€‘í‰½‘åõ€¤ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Í¡½İ9Á!ÁÕ¥‘” ¤ì(€€€€€€€€€€€Í•¹‘9Á!ÁA…¹•° !AÍÍ¥ÍĞÕ¥‘”œ°l(€€€€€€€€€€€€€€€ì±…‰•°è€Ñ¥½¹Ìœ°Ù…±Õ”è€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I½±°M•±•Ñ•9AÌœ°€œ…¹ÁŒµ¡ÀµÍ•±•Ñ•œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I½±°A…”9AÌœ°€œ…¹ÁŒµ¡Àµ…±°œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ÕÉÉ•¹ĞMÑ…ÑÕÌœ°€œ…¹ÁŒµ¡ÀµÍÑ…ÑÕÌœ¥õ€ô°(€€€€€€€€€€€€€€€ì±…‰•°è€1•…É¸=ÈI•Ù¥•Üœ°Ù…±Õ”è€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ]¡…Ğ‘½•Ì!AÍÍ¥ÍĞ‘¼üœ°€œ…¡Àµ¥¹™¼œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•…µ=¹±äÕ‘¥Ğœ°€œ…¡Àµ…Õ‘¥Ğœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ M•ÑÑ¥¹Ìœ°€œ…¡ÀµÍ•ÑÑ¥¹Ìœ¥õ€ô(€€€€€€€€€€€t¤ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Í¡½İ9Á!Á½¹ÑÉ½° ¤ì(€€€€€€€€€€€½¹ÍĞ½Õ¹ÑÌ€ô¥¹ÍÁ•Ñ9Á!ÁA…” ¤ì(€€€€€€€€€€€Í•¹‘9Á!ÁA…¹•° !AÍÍ¥ÍĞ4½¹ÑÉ½±Ìœ°l(€€€€€€€€€€€€€€€ì±…‰•°è€ÕÉÉ•¹ĞA…”œ°Ù…±Õ”è€‘í½Õ¹ÑÌ¹•±¥¥‰±•ô•±¥¥‰±”9AÌğ€‘í½Õ¹ÑÌ¹¥¹Ù…±¥‘ô¹••…¸!@™½ÉµÕ±…€ô°(€€€€€€€€€€€€€€€ì±…‰•°è€I½±°!@œ°Ù…±Õ”è€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ M•±•Ñ•9AÌœ°€œ…¹ÁŒµ¡ÀµÍ•±•Ñ•œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ±°A…”9AÌœ°€œ…¹ÁŒµ¡Àµ…±°œ¥õ€ô°(€€€€€€€€€€€€€€€ì±…‰•°è€I•Ù¥•Ü¹M•ÑÕÀœ°Ù…±Õ”è€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ MÑ…ÑÕÌœ°€œ…¹ÁŒµ¡ÀµÍÑ…ÑÕÌœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•…µ=¹±äÕ‘¥Ğœ°€œ…¹ÁŒµ¡Àµ…Õ‘¥Ğœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ M•ÑÑ¥¹Ìœ°€œ…¹ÁŒµ¡ÀµÍ•ÑÑ¥¹Ìœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ Õ¥‘”œ°€œ…¹ÁŒµ¡Àµ¡•±Àœ¥õ€ô(€€€€€€€€€€€t¤ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Í¡½İ9Á!Á%¹™¼ ¤ì(€€€€€€€€€€€Í•¹‘9Á!ÁA…¹•° ]¡…Ğ!AÍÍ¥ÍĞ½•Ìœ°l(€€€€€€€€€€€€€€€ì±…‰•°è€AÕÉÁ½Í”œ°Ù…±Õ”è€I½±±Ì•… ÅÕ…±¥™å¥¹œ±¥¹­•9ApÌ¹Á}¡Á™½ÉµÕ±„…¹İÉ¥Ñ•ÌÑ¡”É•ÍÕ±ĞÑ¼‰…È€ÄÕÉÉ•¹Ğ…¹µ…á¥µÕ´!@¸œô°(€€€€€€€€€€€€€€€ì±…‰•°è€ĞQ¡”Q…‰±”œ°Ù…±Õ”è€M•±•Ğ9AÑ½­•¹Ì™½È„‘•±¥‰•É…Ñ”É½±°°½ÈÉ½±°•Ù•ÉäÅÕ…±¥™å¥¹œ9A½¸Ñ¡”ÕÉÉ•¹ĞÁ±…å•ÈÁ…”¸A±…å•È¡…É…Ñ•ÉÌ°Õ¹±¥¹­•Ñ½­•¹Ì°…¹¥¹Ù…±¥™½ÉµÕ±…Ì…É”Í­¥ÁÁ•¸œô°(€€€€€€€€€€€€€€€ì±…‰•°è€Õ¥‘”œ°Ù…±Õ”è€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 	…¬Ñ¼Õ¥‘”œ°€œ…¹ÁŒµ¡Àµ¡•±Àœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•…µ=¹±äÕ‘¥Ğœ°€œ…¹ÁŒµ¡Àµ…Õ‘¥Ğœ¥õ€ô(€€€€€€€€€€€t¤ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸¥¹ÍÁ•Ñ9Á!ÁA…” ¤ì(€€€€€€€€€€€½¹ÍĞÁ…•%€ô…µÁ…¥¸ ¤¹•Ğ Á±…å•ÉÁ…•¥œ¤ì(€€€€€€€€€€€½¹ÍĞÑ½­•¹Ì€ôÁ…•%€ü™¥¹‘=‰©Ì¡ì}Á…•¥èÁ…•%°}ÑåÁ”è€É…Á¡¥Œœ°±…å•Èè€½‰©•ÑÌœô¤€èmtì(€€€€€€€€€€€½¹ÍĞ½Õ¹ÑÌ€ôìÑ½Ñ…°èÑ½­•¹Ì¹±•¹Ñ °•±¥¥‰±”è€À°Õ¹±¥¹­•è€À°ÁŒè€À°¥¹Ù…±¥è€Àôì(€€€€€€€€€€€Ñ½­•¹Ì¹™½É… ¡Ñ½­•¸€ôøì(€€€€€€€€€€€€€€€½¹ÍĞ±¥¹­•€ô…µ•ÍÍ¥ÍĞ¹•Ñ1¥¹­•‘¡…É…Ñ•È¡Ñ½­•¸¤ì(€€€€€€€€€€€€€€€¥˜€ …±¥¹­•¤ì(€€€€€€€€€€€€€€€€€€€½Õ¹ÑÌ¹Õ¹±¥¹­•¬¬ì(€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€½¹ÍĞ¹ÁŒ€ôMÑÉ¥¹œ¡•ÑÑÑÉ	å9…µ”¡±¥¹­•¹¡…É…Ñ•È¹¥°€¹ÁŒœ¤ñğ€œœ¤€ôôô€œÄœì(€€€€€€€€€€€€€€€¥˜€ …¹ÁŒ¤ì(€€€€€€€€€€€€€€€€€€€½Õ¹ÑÌ¹ÁŒ¬¬ì(€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€½¹ÍĞ™½ÉµÕ±„€ôMÑÉ¥¹œ¡•ÑÑÑÉ	å9…µ”¡±¥¹­•¹¡…É…Ñ•È¹¥°€¹Á}¡Á™½ÉµÕ±„œ¤ñğ€œœ¤ì(€€€€€€€€€€€€€€€¥˜€ …Á…ÉÍ•¥•MÑÉ¥¹œ¡™½ÉµÕ±„¤¤ì(€€€€€€€€€€€€€€€€€€€½Õ¹ÑÌ¹¥¹Ù…±¥¬¬ì(€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€½Õ¹ÑÌ¹•±¥¥‰±”¬¬ì(€€€€€€€€€€€ô¤ì(€€€€€€€€€€€É•ÑÕÉ¸½Õ¹ÑÌì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Í¡½İ9Á!ÁMÑ…ÑÕÌ¡…Õ‘¥Ğ€ô™…±Í”¤ì(€€€€€€€€€€€½¹ÍĞ½Õ¹ÑÌ€ô¥¹ÍÁ•Ñ9Á!ÁA…” ¤ì(€€€€€€€€€€€½¹ÍĞ™¥•±‘Ì€ôl(€€€€€€€€€€€€€€€ì±…‰•°è€5½‘Õ±”œ°Ù…±Õ”è€‘í5=U1}YIM%=9ôğ•¹…‰±•…¹É•ÍÁ½¹‘¥¹€ô°(€€€€€€€€€€€€€€€ì±…‰•°è€ÕÑ½µ…Ñ¥ŒI½±°=¸‘œ°Ù…±Õ”èµ½‘MÑ…Ñ”¹½¹™¥œ¹…ÕÑ½I½±±=¹‘€ôôôÑÉÕ”€ü€=¸œ€è€=™˜œô°(€€€€€€€€€€€€€€€ì±…‰•°è€ÕÉÉ•¹ĞA…”œ°Ù…±Õ”è€‘í½Õ¹ÑÌ¹•±¥¥‰±•ô•±¥¥‰±”9AÌğ€‘í½Õ¹ÑÌ¹ÁôÁ±…å•È¡…É…Ñ•ÉÌğ€‘í½Õ¹ÑÌ¹Õ¹±¥¹­•‘ôÕ¹±¥¹­•¥Ñ•µÌğ€‘í½Õ¹ÑÌ¹¥¹Ù…