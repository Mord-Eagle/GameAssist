/*
========================================
GameAssist - Roll20 API Script
Version: 2.0.0
Last Updated: 2026-07-28 (America/New_York)
Development line: source-aware semantic effects with ownership-safe marker and condition projections.
Author: Mord Eagle
License: MIT for original GameAssist code; see LICENSE and ATTRIBUTIONS.md
Homepage: https://github.com/Mord-Eagle/GameAssist

DESCRIPTION
GameAssist is a modular D&D 5E (2014 and 2024) automation suite with an explicit opt-in
task queue, state/configuration helpers, consistent logging, and a core marker
service. Normal event handlers execute directly unless a module deliberately
calls GameAssist.enqueue(). This package ships with twelve configurable modules:
- ConfigUI 0.2.2 - GM-only chat controls for toggling modules and common options.
- CritAssist 0.2.5.1 - Detects natural-1 attacks and offers fumble/confirm menus.
- ConditionAssist 1.0.3 - Provides condition wording, artwork, announcements, and marker controls.
- TokenAssist 1.0.4 - Provides general token controls through !token-assist and !ta commands.
- InitiativeAssist 1.0.4 - Uses Roll20's native Turn Tracker for mixed-sheet initiative workflows and compact topic guidance.
- CombatAssist 1.0.5 - Tracks encounters, native round counters, guarded turns, optional timers, private-safe pings, and recoverable tracker changes.
- WelcomeAssist 0.1.4 - Optionally greets the table after a healthy GameAssist startup through short !Welcome commands.
- ConcentrationAssist 0.3.0 - Runs concentration checks, manages its configured marker, and exposes concentration lifecycle events.
- NPCAssist 1.4.0 - Adds page-local NPC naming and GM-private Bloodied alerts to death markers, history, reports, audits, repair previews, and Arc rosters.
- EffectAssist 2.0.0 - Coordinates catalog-driven effects, 2014-sheet modifiers, markers, conditions, concentration, and ownership-safe cleanup.
- HPAssist 0.1.1.3 - Rolls npc_hpformula and writes the result to token bar 1.
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
  !npc-death-arc, !npc-bloodied, !npc-numbering
- EffectAssist: !Effect-GM, !Effect-Guide, !Effect-Catalog, !Effect-Active,
  !Effect-Status, !Effect-Definitions, !Effect-Targets, !Effect-Request,
  !Effect-Apply, !Effect-End,
  !Effect-Audit, !Effect-Repair, !Effect-Players, !effect, !Bless, !Guidance, !Guide,
  !Haste, !Warding-Bond, !Holy-Weapon, and !PwoaT
- HPAssist: !HP-GM, !HP-Selected, !HP-All, !hp <command>
- DebugTools: !ga-debug damage|marker|save

V2.0.0 FOUNDATION
- [GAMEASSIST:CORE:MARKERSERVICE] is the single GameAssist authority for marker
  resolution, reads, writes, toggles, duplicate handling, and change observation.
- Built-in ids, custom display names, exact stored tags, numbered markers, and
  unrelated marker entries are preserved through a structured mutation contract.
- NPCAssist can assign unique page-local names to newly added linked NPC tokens without persistent counters.
- EffectAssist records semantic effect instances separately from their marker, condition, concentration, and 2014-sheet projections, preserving overlapping sources and pre-existing campaign state.
- The launch catalog includes Bless, Guidance, Warding Bond, Holy Weapon,
  Haste, and Pass Without a Trace, separated by automation level.
- Bless automatically manages its target marker, 2014-sheet 1d4 global attack
  and saving-throw modifiers, source concentration, and dependent cleanup.
- Guidance manages its marker, 2014-sheet 1d4 global skill modifier, source
  concentration, and cleanup while calling out non-skill checks as a manual d4.
- Players may apply built-in effects from controlled sources unless the GM uses
  the EffectAssist control center to lock player casting.
- Mechanics without an ownership-safe 2014-sheet field remain clearly listed as
  assisted table steps instead of being represented by unsafe sheet rewrites.
- EffectAssist audits projection drift without writing and requires a fresh GM confirmation before repair.
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
//   project_version: "v2.0.0"
//   purpose: "Roll20 API modular kernel and bundled modules with MECHSUITS v1.5.2 contracts, migration-safe module identities, explicit opt-in queue execution, state self-healing, dependency diagnostics, toggleable marker and Turn Tracker authorities, source-aware semantic effects with ownership-safe projections, integrated condition guidance, general token controls, mixed 2014/2024 initiative workflows, preservation-first encounter flow, GM-private NPC Bloodied alerts, optional health-gated table greetings, and validated campaign time. Non-goals: fallback dispatch to standalone TokenMod/StatusInfo, implicit event queueing, automatic turn advancement, automatic Bloodied markers/history, automatic condition-duration management, or silent effect repair."
//   order: ["policy","app.utils","core.queue","core.compat","core.state","core.markerservice","core.turntrackerservice","core.semanticevents","core.object","interfaces.events","interfaces.commands","modules.configui","modules.critassist","modules.conditionassist","modules.tokenassist","modules.initiativeassist","modules.combatassist","modules.welcomeassist","modules.npcassist","modules.concentrationassist","modules.effectassist","modules.hpassist","modules.debugtools","bootstrap"]
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
//     spans: ["[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:TURNTRACKERSERVICE]","[GAMEASSIST:CORE:SEMANTICEVENTS]","[GAMEASSIST:MODULES:EFFECTASSIST]","[GAMEASSIST:MODULES:INITIATIVEASSIST]","[GAMEASSIST:MODULES:COMBATASSIST]","[GAMEASSIST:MODULES:WELCOMEASSIST]"]
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
//     â”‚  â”œâ”€ [GAMEASSIST:CORE:SEMANTICEVENTS]
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
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:EFFECTASSIST]
//     â”‚  â”œâ”€ [GAMEASSIST:MODULES:HPASSIST]
//     â”‚  â””â”€ [GAMEASSIST:MODULES:DEBUGTOOLS]
//     â””â”€ [GAMEASSIST:BOOTSTRAP]
// --- prose banner ---
// Guarantee: GameAssist v2.0.0 runs policy, utilities, guarded core services including MarkerService and TurnTrackerService, interfaces, independently lifecycle-managed condition/token/initiative/combat/welcome/effect/gameplay modules, then bootstrap in the declared order. EffectAssist owns source-aware semantic effect records while markers, conditions, concentration, and verified 2014-sheet modifiers remain auditable projections that are never silently repaired. Branded module names own current state and controls while documented legacy names resolve through explicit compatibility aliases. NPCAssist may whisper the GM once when a living eligible NPC crosses to half HP or below without adding marker or history behavior. Human-facing times use the validated campaign timezone while stored instants remain absolute. Secrets required: none. It refuses to emit player data outside Roll20 or override Roll20 global on/off handlers.

// =============================
// === GameAssist v2.0.0 ===
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
// AUTHORS ORÛµã‹h‘éì¶»§q«^uµ” ¤ì4(4(€€€€¼¼ƒŠRŠRŠR AÕ‰±¥Œ½µµ…¹AÉ•™¥á•ÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR 4(€€€½¹ÍĞ5L€ôlœ…½¸œ°€œ…½¹•¹ÑÉ…Ñ¥½¸œ°€œ…½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€œ…½¹•¹ÑÉ…Ñ¥½¸´ñ½µµ…¹øœ°€œ…½¸´ñ½µµ…¹øœ°€œ…Œtì(4(€€€€¼¼ƒŠRŠRŠR 5…É­•È!•±Á•ÈƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR 4(€€€™Õ¹Ñ¥½¸•Ñ5…É­•È ¤ì4(€€€€€€€É•ÑÕÉ¸µ½‘MÑ…Ñ”¹½¹™¥œ¹µ…É­•Èñğ€½¹•¹ÑÉ…Ñ¥¹œœì4(€€€ô4(4(€€€™Õ¹Ñ¥½¸•Ñ5…É­•ÉI•Í½±ÕÑ¥½¸ ¤ì4(€€€€€€€É•ÑÕÉ¸…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹É•Í½±Ù”¡•Ñ5…É­•È ¤¤ì4(€€€ô4(4(€€€™Õ¹Ñ¥½¸µ…É­•ÉI•Í½±ÕÑ¥½¹]…É¹¥¹œ¡É•Í½±ÕÑ¥½¸¤ì4(€€€€€€€½¹ÍĞµ…É­•È€ô}Í…¹¥Ñ¥é”¡É•Í½±ÕÑ¥½¸¹É•ÅÕ•ÍÑ•ñğ•Ñ5…É­•È ¤¤ì4(€€€€€€€½¹ÍĞ‘•Ñ…¥°€ôÉ•Í½±ÕÑ¥½¸¹É•¥ÍÑÉåÉÉ½È4(€€€€€€€€€€€€ü€I½±°ÈÀµ…É­•ÈÉ•¥ÍÑÉäÁÉ½‰±•´è€‘í}Í…¹¥Ñ¥é”¡É•Í½±ÕÑ¥½¸¹É•¥ÍÑÉåÉÉ½È¥ô¹€4(€€€€€€€€€€€€è€œœì4(€€€€€€€É•ÑÕÉ¸ƒŠjƒ¾â<½¹™¥ÕÉ•½¹•¹ÑÉ…Ñ¥½¸µ…É­•È€ˆ‘íµ…É­•Éôˆ½Õ±¹½Ğ‰”É•½¹¥é•¸‘í‘•Ñ…¥±õ€€¬4(€€€€€€€€€€€€¡•¬Ñ¡”…µÁ…¥¸µ…É­•È±¥‰É…Éä°Ñ¡•¸ÕÍ”€…„µ½¹™¥œÍ•Ğ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞµ…É­•Èôñ¹…µ”µ½ÈµÑ…œø¹€ì(€€€ô4(4(€€€€¼¼ƒŠRŠRŠR •™…Õ±Ğµ½Ñ”1¥¹•ÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR 4(€€€½¹ÍĞU1Q}1%9L€ôì4(€€€€€€€ÍÕ•ÍÌèl4(€€€€€€€€€€€€‰ÍÑ•…‘¥•ÌÑ¡•¥È‰É•…Ñ °¡½±‘¥¹œÑ¡•¥È™½ÕÌ¸ˆ°4(€€€€€€€€€€€€ˆÌÉ¥ÀÑ¥¡Ñ•¹Ì…ÌÑ¡•äµ…¥¹Ñ…¥¸Ñ¡•¥ÈÍÁ•±°¸ˆ°4(€€€€€€€€€€€€‰ÍÑ…•ÉÌÍ±¥¡Ñ±ä‰ÕĞ‘½•Ì¹½Ğ±½Í”½¹•¹ÑÉ…Ñ¥½¸¸ˆ°4(€€€€€€€€€€€€‰±•¹¡•ÌÑ¡•¥È©…Ü°µ…¥ŒÍÑ¥±°™±¥­•É¥¹œİ¥Ñ ¥¹Ñ•¹Ğ¸ˆ°4(€€€€€€€€€€€€‰¹…ÉÉ½İÌÑ¡•¥È•å•Ì°ÍÁ•±°ÍÑ¥±°¥¹Ñ…Ğ¸ˆ4(€€€€€€€t°4(€€€€€€€™…¥±ÕÉ”èl4(€€€€€€€€€€€€‰…ÍÁÌ°Ñ¡•¥È™½ÕÌÍ¡…ÑÑ•É•…ÌÑ¡”ÍÁ•±°™…±Ñ•ÉÌ¸ˆ°4(€€€€€€€€€€€€ˆÌ½¹•¹ÑÉ…Ñ¥½¸‰É•…­Ì…¹Ñ¡”µ…¥Œ™…‘•Ì¸ˆ°4(€€€€€€€€€€€€‰É¥•Ì½ÕĞ°Õ¹…‰±”Ñ¼µ…¥¹Ñ…¥¸Ñ¡”ÍÁ•±°¸ˆ°4(€€€€€€€€€€€€ˆÌÍÁ•±°™¥éé±•Ì…ÌÑ¡•ä±½Í”½¹ÑÉ½°¸ˆ°4(€€€€€€€€€€€€‰İ¥¹•Ì°™½ÕÌ±½ÍĞ¥¸Ñ¡”¡•…Ğ½˜‰…ÑÑ±”¸ˆ4(€€€€€€€t4(€€€ôì4(4(€€€€¼¼ƒŠRŠRŠR !•±Á•ÈÕ¹Ñ¥½¹ÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR 4(4(€€€€¼¨¨4(€€€€€¨•Ñ½¹™¥œ ¤4(€€€€€¨€€5•É”‘•™…Õ±ĞÍ•ÑÑ¥¹Ìİ¥Ñ ÍÑ½É•½¹™¥œ¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸•Ñ½¹™¥œ ¤ì4(€€€€€€€É•ÑÕÉ¸=‰©•Ğ¹…ÍÍ¥¸¡ìÉ…¹‘½µ¥é”èÑÉÕ”ô°µ½‘MÑ…Ñ”¹½¹™¥œ¤ì4(€€€ô4(4(€€€€¼¨¨4(€€€€€¨•Ñ=ÕÑ½µ•1¥¹•Ì¡¹…µ”¤4(€€€€€¨€€I•ÑÕÉ¹ÌÑ¡”ÍÕ•ÍÌ½™…¥±ÕÉ”•µ½Ñ”…ÉÉ…åÌİ¥Ñ íí¹…µ•õôÉ•Á±…•¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸•Ñ=ÕÑ½µ•1¥¹•Ì¡¹…µ”¤ì4(€€€€€€€½¹ÍĞ™¥±°€ô±¥¹”€ôø±¥¹”¹É•Á±…” ‰íí¹…µ•õôˆ°¹…µ”¤ì4(€€€€€€€É•ÑÕÉ¸ì4(€€€€€€€€€€€ÍÕ•ÍÌèU1Q}1%9L¹ÍÕ•ÍÌ¹µ…À¡™¥±°¤°4(€€€€€€€€€€€™…¥±ÕÉ”èU1Q}1%9L¹™…¥±ÕÉ”¹µ…À¡™¥±°¤4(€€€€€€€ôì4(€€€ô4(4(€€€€¼¨¨4(€€€€€¨•Ñ½¹	½¹ÕÌ¡¡…É…Ñ•È¤4(€€€€€¨€€I•…‘ÌÑ¡”¡…É…Ñ•ÈÌ½¹ÍÑ¥ÑÕÑ¥½¸Í…Ù¥¹œÑ¡É½Ü‰½¹ÕÌ¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸•Ñ½¹	½¹ÕÌ¡¡…É…Ñ•È¤ì4(€€€€€€€½¹ÍĞ…ÑÑÈ€ô™¥¹‘=‰©Ì¡ì4(€€€€€€€€€€€}ÑåÁ”è€€€€€€€…ÑÑÉ¥‰ÕÑ”œ°4(€€€€€€€€€€€}¡…É…Ñ•É¥è¡…É…Ñ•È¹¥°4(€€€€€€€€€€€¹…µ”è€€€€€€€€½¹ÍÑ¥ÑÕÑ¥½¹}Í…Ù•}‰½¹ÕÌœ4(€€€€€€€ô¥lÁtì4(€€€€€€€É•ÑÕÉ¸…ÑÑÈ€üÁ…ÉÍ•%¹Ğ¡…ÑÑÈ¹•Ğ ÕÉÉ•¹Ğœ¤°€ÄÀ¤€è€Àì4(€€€ô4(4(€€€€¼¨¨4(€€€€€¨Í•Ñ½¹•¹ÑÉ…Ñ¥½¹5…É­•È¡Ñ½­•¹=É%°½¸°½¹Ñ•áĞ¤(€€€€€¨€€¡…¹•Ì½¹•¹ÑÉ…Ñ¥½¸Ñ¡É½Õ 5…É­•ÉM•ÉÙ¥”…¹ÁÕ‰±¥Í¡•Ì½¹”Í•µ…¹Ñ¥ŒÉ•ÍÕ±Ğ¸(€€€€€¨€€½¹Ñ•áĞ¥Ì‰½Õ¹‘•½Á•É…Ñ¥½¹…°µ•Ñ…‘…Ñ„ì¥Ğ¹•Ù•È•áÁ½Í•ÌÁÉ¥Ù…Ñ”µ½‘Õ±”ÍÑ…Ñ”¸(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸Í•Ñ½¹•¹ÑÉ…Ñ¥½¹5…É­•È¡Ñ½­•¹=É%°½¸°½¹Ñ•áĞ€ôíô¤ì(€€€€€€€¥˜€¡µ½‘MÑ…Ñ”¹½¹™¥œ¹•¹…‰±•€ôôô™…±Í”€˜˜½¹Ñ•áĞ¹…±±½İ¥Í…‰±•€„ôôÑÉÕ”¤ì(€€€€€€€€€€€É•ÑÕÉ¸ì½¬è™…±Í”°½‘”è€U9Y%1	1œ°µ•ÍÍ…”è€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ¥Ì‘¥Í…‰±•¸œôì(€€€€€€€ô(€€€€€€€½¹ÍĞÑ½­•¸€ôÑåÁ•½˜Ñ½­•¹=É%€ôôô€ÍÑÉ¥¹œœ€ü•Ñ=‰¨ É…Á¡¥Œœ°Ñ½­•¹=É%¤€èÑ½­•¹=É%ì(€€€€€€€¥˜€ …Ñ½­•¸¤É•ÑÕÉ¸ì½¬è™…±Í”°½‘”è€9=Q}=U9œ°µ•ÍÍ…”è€Q¡”½¹•¹ÑÉ…Ñ¥½¸Ñ½­•¸İ…Ì¹½Ğ™½Õ¹¸œôì(€€€€€€€¥˜€ …l½‰©•ÑÌœ°€µ±…å•Èt¹¥¹±Õ‘•Ì¡MÑÉ¥¹œ¡Ñ½­•¸¹•Ğ ±…å•Èœ¤ñğ€œœ¤¤¤ì(€€€€€€€€€€€É•ÑÕÉ¸ì½¬è™…±Í”°½‘”è€U9AI=MM	1œ°µ•ÍÍ…”è€Q¡”½¹•¹ÑÉ…Ñ¥½¸Ñ½­•¸µÕÍĞ‰”½¸Ñ¡”=‰©•ÑÌ½È4±…å•È¸œôì(€€€€€€€ô(€€€€€€€½¹ÍĞ¡…É…Ñ•É%€ôMÑÉ¥¹œ¡Ñ½­•¸¹•Ğ É•ÁÉ•Í•¹ÑÌœ¤ñğ€œœ¤ì(€€€€€€€½¹ÍĞ¡…É…Ñ•È€ô¡…É…Ñ•É%€ü•Ñ=‰¨ ¡…É…Ñ•Èœ°¡…É…Ñ•É%¤€è¹Õ±°ì(€€€€€€€¥˜€ …¡…É…Ñ•È¤É•ÑÕÉ¸ì½¬è™…±Í”°½‘”è€U9AI=MM	1œ°µ•ÍÍ…”è€Q¡”½¹•¹ÑÉ…Ñ¥½¸Ñ½­•¸µÕÍĞÉ•ÁÉ•Í•¹Ğ„¡…É…Ñ•È¸œôì(€€€€€€€½¹ÍĞÉ•Í½±ÕÑ¥½¸€ô•Ñ5…É­•ÉI•Í½±ÕÑ¥½¸ ¤ì4(€€€€€€€¥˜€ …É•Í½±ÕÑ¥½¸¹½¬¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°µ…É­•ÉI•Í½±ÕÑ¥½¹]…É¹¥¹œ¡É•Í½±ÕÑ¥½¸¤°€]I8œ¤ì(€€€€€€€€€€€É•ÑÕÉ¸ì½¬è™…±Í”°½‘”èÉ•Í½±ÕÑ¥½¸¹½‘”ñğ€9=Q}=U9œ°µ•ÍÍ…”èµ…É­•ÉI•Í½±ÕÑ¥½¹]…É¹¥¹œ¡É•Í½±ÕÑ¥½¸¤ôì(€€€€€€€ô4(4(€€€€€€€¥˜€¡É•Í½±ÕÑ¥½¸¹…µ‰¥Õ½ÕÌ¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 4(€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€5…É­•È€ˆ‘íÉ•Í½±ÕÑ¥½¸¹É•ÅÕ•ÍÑ•‘ôˆµ…Ñ¡•ÌµÕ±Ñ¥Á±”ÕÍÑ½´µ…É­•ÉÌìÕÍ¥¹œ€‘íÉ•Í½±ÕÑ¥½¸¹¥‘ô¹€°4(€€€€€€€€€€€€€€€€]I8œ4(€€€€€€€€€€€€¤ì4(€€€€€€€ô4(4(€€€€€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹Í•Ğ¡Ñ½­•¸°•Ñ5…É­•È ¤°½¸°ì½İ¹•Èè€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœô¤ì(€€€€€€€¥˜€ …É•ÍÕ±Ğ¹½¬¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°É•ÍÕ±Ğ¹µ•ÍÍ…”ñğ5…É­•È¡…¹”™…¥±•€ ‘íÉ•ÍÕ±Ğ¹½‘”ñğ€%9QI90ô¤¹€°€]I8œ¤ì(€€€€€€€€€€€É•ÑÕÉ¸É•ÍÕ±Ğì(€€€€€€€ô(€€€€€€€½¹ÍĞÉ•…Í½¸€ôMÑÉ¥¹œ¡½¹Ñ•áĞ¹É•…Í½¸ñğ€¡½¸€ü€•ÍÑ…‰±¥Í¡•œ€è€•¹‘•œ¤¤¹Í±¥” À°A=1%d¹Í•µ…¹Ñ¥Ù•¹ÑÌ¹ÑåÁ•1•¹Ñ ¤ì(€€€€€€€½¹ÍĞ•Ù•¹ÑQåÁ”€ô½¸(€€€€€€€€€€€€ü€½¹•¹ÑÉ…Ñ¥½¸¹•ÍÑ…‰±¥Í¡•œ(€€€€€€€€€€€€è€¡É•…Í½¸€ôôô€¡•¬µ™…¥±•œ€ü€½¹•¹ÑÉ…Ñ¥½¸¹™…¥±•œ€è€½¹•¹ÑÉ…Ñ¥½¸¹•¹‘•œ¤ì(€€€€€€€¥˜€¡É•ÍÕ±Ğ¹¡…¹•ñğ½¹Ñ•áĞ¹•µ¥ÑU¹¡…¹•€ôôôÑÉÕ”ñğÉ•…Í½¸€ôôô€¡•¬µ™…¥±•œ¤ì(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹M•µ…¹Ñ¥Ù•¹ÑÌ¹ÁÕ‰±¥Í ¡•Ù•¹ÑQåÁ”°€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°ì(€€€€€€€€€€€€€€€Ñ½­•¹%èÑ½­•¸¹¥°(€€€€€€€€€€€€€€€Ñ½­•¹9…µ”èMÑÉ¥¹œ¡Ñ½­•¸¹•Ğ ¹…µ”œ¤ñğ¡…É…Ñ•È¹•Ğ ¹…µ”œ¤ñğ€U¹¹…µ•Ñ½­•¸œ¤°(€€€€€€€€€€€€€€€¡…É…Ñ•É%è¡…É…Ñ•È¹¥°(€€€€€€€€€€€€€€€¡…É…Ñ•É9…µ”èMÑÉ¥¹œ¡¡…É…Ñ•È¹•Ğ ¹…µ”œ¤ñğÑ½­•¸¹•Ğ ¹…µ”œ¤ñğ€U¹¹…µ•¡…É…Ñ•Èœ¤°(€€€€€€€€€€€€€€€…Ñ¥Ù”è½¸€ôôôÑÉÕ”°(€€€€€€€€€€€€€€€É•…Í½¸°(€€€€€€€€€€€€€€€…Ñ½ÈèMÑÉ¥¹œ¡½¹Ñ•áĞ¹…Ñ½Èñğ€…Á¤œ¤¹Í±¥” À°A=1%d¹Í•µ…¹Ñ¥Ù•¹ÑÌ¹½İ¹•É1•¹Ñ ¤°(€€€€€€€€€€€€€€€¥¹ÍÑ…¹•%è½¹Ñ•áĞ¹¥¹ÍÑ…¹•%€üMÑÉ¥¹œ¡½¹Ñ•áĞ¹¥¹ÍÑ…¹•%¤¹Í±¥” À°A=1%d¹•™™•ÑÌ¹É•ÅÕ•ÍÑ%‘1•¹Ñ ¤€è¹Õ±°°(€€€€€€€€€€€€€€€‘…µ…”è9Õµ‰•È¹¥Í¥¹¥Ñ”¡9Õµ‰•È¡½¹Ñ•áĞ¹‘…µ…”¤¤€ü9Õµ‰•È¡½¹Ñ•áĞ¹‘…µ…”¤€è¹Õ±°°(€€€€€€€€€€€€€€€‘Œè9Õµ‰•È¹¥Í¥¹¥Ñ”¡9Õµ‰•È¡½¹Ñ•áĞ¹‘Œ¤¤€ü9Õµ‰•È¡½¹Ñ•áĞ¹‘Œ¤€è¹Õ±°°(€€€€€€€€€€€€€€€Ñ½Ñ…°è9Õµ‰•È¹¥Í¥¹¥Ñ”¡9Õµ‰•È¡½¹Ñ•áĞ¹Ñ½Ñ…°¤¤€ü9Õµ‰•È¡½¹Ñ•áĞ¹Ñ½Ñ…°¤€è¹Õ±°(€€€€€€€€€€€ô¤ì(€€€€€€€ô4(€€€€€€€É•ÑÕÉ¸ì€¸¸¹É•ÍÕ±Ğ°Ñ½­•¹%èÑ½­•¸¹¥°¡…É…Ñ•É%è¡…É…Ñ•È¹¥°µ…É­•Èè•Ñ5…É­•È ¤ôì(€€€ô((€€€™Õ¹Ñ¥½¸Ñ½±•5…É­•È¡Ñ½­•¸°½¸°½¹Ñ•áĞ€ôíô¤ì(€€€€€€€É•ÑÕÉ¸Í•Ñ½¹•¹ÑÉ…Ñ¥½¹5…É­•È¡Ñ½­•¸°½¸°½¹Ñ•áĞ¤¹½¬€ôôôÑÉÕ”ì(€€€ô4(4(€€€€¼¨¨4(€€€€€¨Á½ÍÑ	ÕÑÑ½¹Ì¡É•¥Á¥•¹Ğ¤4(€€€€€¨€€M•¹‘ÌÑ¡”Ñ¡É•”µ‰ÕÑÑ½¸U$™½È„¹•Ü½¹•¹ÑÉ…Ñ¥½¸¡•¬¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸Á½ÍÑ	ÕÑÑ½¹Ì¡É•¥Á¥•¹Ğ¤ì4(€€€€€€€½¹ÍĞ‘µœ€ô€œıí…µ…”Ñ…­•¸ığÁôœì4(€€€€€€€½¹ÍĞ‰ÕÑÑ½¹Ì€ôl4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ŸÂ~:¼5…¥¹Ñ…¥¸½¹ÑÉ½°œ°€…½¹•¹ÑÉ…Ñ¥½¸€´µ‘…µ…”€‘í‘µô€´µµ½‘”¹½Éµ…±€¤°4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ŸÂ~€	É…”™½ÈÑ¡”¥ÍÑÉ…Ñ¥½¸œ°€…½¹•¹ÑÉ…Ñ¥½¸€´µ‘…µ…”€‘í‘µô€´µµ½‘”…‘Ù€¤°4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ŸÂ~bŒMÑÉÕ±¥¹œÑ¼½ÕÌœ°€…½¹•¹ÑÉ…Ñ¥½¸€´µ‘…µ…”€‘í‘µô€´µµ½‘”‘¥Í€¤4(€€€€€€€t¹©½¥¸ œ€œ¤ì4(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€½Ü€ˆ‘íÉ•¥Á¥•¹Ñôˆ€‘í‰ÕÑÑ½¹Íôñ‰ÈûŠjƒ¾â<M•±•Ğå½ÕÈÑ½­•¸‰•™½É”±¥­¥¹œ¹€4(€€€€€€€€¤ì4(€€€ô4(4(€€€€¼¨¨4(€€€€€¨Í•¹‘I•ÍÕ±Ğ¡Á±…å•È°‘Œ°Ñ½Ñ…°°É½±±Ì°™½ÉµÕ±„¤4(€€€€€¨€€]¡¥ÍÁ•ÉÌÑ¡”½¹•¹ÑÉ…Ñ¥½¸µ¡•¬É•ÍÕ±ĞÑ¼Á±…å•È€˜4¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸Í•¹‘I•ÍÕ±Ğ¡Á±…å•È°‘Œ°Ñ½Ñ…°°É½±±Ì°™½ÉµÕ±„¤ì4(€€€€€€€½¹ÍĞÑÁ°€ô4(€€€€€€€€€€€€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”÷Â~€½¹•¹ÑÉ…Ñ¥½¸¡•­õõ€€¬4(€€€€€€€€€€€€ííô‘í‘õõôííI•ÍÕ±ĞõI½±°¡Ì¤€‘íÉ½±±ÍôƒŠH€‘íÑ½Ñ…±ô€¡™É½´€‘í™½ÉµÕ±…ô¥õõ€ì4(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘íÑÁ±õ€¤ì(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü´€‘íÑÁ±õ€¤ì(€€€ô4(4(€€€€¼¨¨4(€€€€€¨Í¡½İMÑ…ÑÕÌ¡Á±…å•È¤4(€€€€€¨€€1¥ÍÑÌ…±°Ñ½­•¹ÌÕÉÉ•¹Ñ±äµ…É­•½¹•¹ÑÉ…Ñ¥¹œ¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸Í¡½İMÑ…ÑÕÌ¡Á±…å•È°ì…Õ‘¥Ğ€ô™…±Í”ô€ôíô¤ì(€€€€€€€½¹ÍĞÁ…”€ô…µÁ…¥¸ ¤¹•Ğ Á±…å•ÉÁ…•¥œ¤ì4(€€€€€€€½¹ÍĞÉ•Í½±ÕÑ¥½¸€ô•Ñ5…É­•ÉI•Í½±ÕÑ¥½¸ ¤ì4(€€€€€€€¥˜€ …É•Í½±ÕÑ¥½¸¹½¬¤ì4(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ 4(€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•Éôˆ€‘íµ…É­•ÉI•Í½±ÕÑ¥½¹]…É¹¥¹œ¡É•Í½±ÕÑ¥½¸¥õ€4(€€€€€€€€€€€€¤ì4(€€€€€€€ô4(€€€€€€€¥˜€ …Á…”¤ì4(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ 4(€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€½Ü€ˆ‘íÁ±…å•ÉôˆƒŠjƒ¾â<ÕÉÉ•¹ĞÁ±…å•ÈÁ…”½Õ±¹½Ğ‰”‘•Ñ•Éµ¥¹•¸¡•¬€…„µÍÑ…ÑÕÌ…¹ÑÉä……¥¸¹€4(€€€€€€€€€€€€¤ì4(€€€€€€€ô4(€€€€€€€¥˜€¡É•Í½±ÕÑ¥½¸¹…µ‰¥Õ½ÕÌ¤ì4(€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 4(€€€€€€€€€€€€€€€€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€5…É­•È€ˆ‘íÉ•Í½±ÕÑ¥½¸¹É•ÅÕ•ÍÑ•‘ôˆµ…Ñ¡•ÌµÕ±Ñ¥Á±”ÕÍÑ½´µ…É­•ÉÌìÍÑ…ÑÕÌÕÍ•Ì€‘íÉ•Í½±ÕÑ¥½¸¹¥‘ô¹€°4(€€€€€€€€€€€€€€€€]I8œ4(€€€€€€€€€€€€¤ì4(€€€€€€€ô4(€€€€€€€½¹ÍĞÑ½­•¹Ì€ô™¥¹‘=‰©Ì¡ì4(€€€€€€€€€€€}ÑåÁ”è€€É…Á¡¥Œœ°4(€€€€€€€€€€€}Á…•¥èÁ…”°4(€€€€€€€€€€€±…å•Èè€€½‰©•ÑÌœ4(€€€€€€€ô¤¹™¥±Ñ•È¡Ğ€ôø…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹¡…Ì¡Ğ°É•Í½±ÕÑ¥½¸¹¥¤¤ì4(€€€€€€€¥˜€ …Ñ½­•¹Ì¹±•¹Ñ ¤ì(€€€€€€€€€€€É•ÑÕÉ¸Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘í…Õ‘¥Ğ(€€€€€€€€€€€€€€€€ü€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞÕ‘¥ÑõôííI•ÍÕ±Ğõ9¼Ñ½­•¹Ì½¹•¹ÑÉ…Ñ¥¹œ¹õôíí5…É­•Èô‘í}Í…¹¥Ñ¥é”¡•Ñ5…É­•È ¤¥õõôíí¡…¹•Ìõ9½¹”¸Q¡¥Ì…Õ‘¥ĞÉ•…ÕÉÉ•¹ĞµÁ…”Ñ½­•¸µ…É­•ÉÌİ¥Ñ¡½ÕĞ¡…¹¥¹œÑ¡•´¹õõ€(€€€€€€€€€€€€€€€€è€9¼Ñ½­•¹Ì½¹•¹ÑÉ…Ñ¥¹œ¸õ€¤ì(€€€€€€€ô(€€€€€€€±•Ğ½ÕĞ€ô€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”ô‘í…Õ‘¥Ğ€ü€½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞÕ‘¥Ğœ€è€ŸÂ~€½¹•¹ÑÉ…Ñ¥½¸MÑ…ÑÕÌõõõ€ì(€€€€€€€Ñ½­•¹Ì¹™½É… ¡Ğ€ôøì(€€€€€€€€€€€½ÕĞ€¬ôíì‘íĞ¹•Ğ ¹…µ”œ¤ñğ€U¹¹…µ•ôõ½¹•¹ÑÉ…Ñ¥¹õõ€ì(€€€€€€€ô¤ì(€€€€€€€¥˜€¡…Õ‘¥Ğ¤½ÕĞ€¬ô€íí5…É­•Èô‘í}Í…¹¥Ñ¥é”¡•Ñ5…É­•È ¤¥õõôíí¡…¹•Ìõ9½¹”¸Q¡¥Ì…Õ‘¥ĞÉ•…ÕÉÉ•¹ĞµÁ…”Ñ½­•¸µ…É­•ÉÌİ¥Ñ¡½ÕĞ¡…¹¥¹œÑ¡•´¹õõ€ì(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘í½ÕÑõ€¤ì(€€€ô(4(€€€™Õ¹Ñ¥½¸‰Õ¥±‘MÑ…ÑÕÍQ•µÁ±…Ñ” ¤ì4(€€€€€€€½¹ÍĞì±…ÍÑ…µ…”ô€ô•¹ÍÕÉ•½¹•¹ÑÉ…Ñ¥½¹IÕ¹Ñ¥µ” ¤ì4(€€€€€€€½¹ÍĞ•¹ÑÉ¥•Ì€ô=‰©•Ğ¹•¹ÑÉ¥•Ì¡±…ÍÑ…µ…”ñğíô¤ì4(€€€€€€€¥˜€ …•¹ÑÉ¥•Ì¹±•¹Ñ ¤É•ÑÕÉ¸¹Õ±°ì4(4(€€€€€€€½¹ÍĞ½µÁ¥±•€ô•¹ÑÉ¥•Ì¹µ…À ¡mÁ±…å•É%°Á…å±½…‘t¤€ôøì4(€€€€€€€€€€€½¹ÍĞ‘…Ñ„€ô€¡Á…å±½…€˜˜ÑåÁ•½˜Á…å±½…€ôôô€½‰©•Ğœ¤4(€€€€€€€€€€€€€€€€üÁ…å±½…4(€€€€€€€€€€€€€€€€èì‘…µ…”è9Õµ‰•È¡Á…å±½…¤ñğ€À°µ½‘”è€¹½Éµ…°œ°Ñ¥µ•ÍÑ…µÀè€Àôì4(€€€€€€€€€€€½¹ÍĞÁ±…å•É=‰¨€ô•Ñ=‰¨ Á±…å•Èœ°Á±…å•É%¤ì4(€€€€€€€€€€€½¹ÍĞ‘¥ÍÁ±…ä€ô‘…Ñ„¹Á±…å•ÈñğÁ±…å•É=‰¨ü¹•Ğ ‘¥ÍÁ±…å¹…µ”œ¤ñğ€U¹­¹½İ¸A±…å•Èœì4(€€€€€€€€€€€½¹ÍĞÁ±…å•É9…µ”€ô‘¥ÍÁ±…ä¹É•Á±…” ¼p¡5p¤¼°€œœ¤ì4(€€€€€€€€€€€½¹ÍĞ‘…µ…”€ô9Õµ‰•È¡‘…Ñ„¹‘…µ…”¤ñğ€Àì4(€€€€€€€€€€€½¹ÍĞ‘Œ€ô‘…Ñ„¹‘Œ€üü5…Ñ ¹µ…à ÄÀ°5…Ñ ¹™±½½È¡‘…µ…”€¼€È¤¤ì4(€€€€€€€€€€€½¹ÍĞ‰½¹ÕÌ€ôÑåÁ•½˜‘…Ñ„¹‰½¹ÕÌ€ôôô€¹Õµ‰•Èœ€ü‘…Ñ„¹‰½¹ÕÌ€è¹Õ±°ì4(€€€€€€€€€€€½¹ÍĞµ½‘”€ô‘…Ñ„¹µ½‘”ñğ€¹½Éµ…°œì4(€€€€€€€€€€€½¹ÍĞÑ½­•¸€ô‘…Ñ„¹Ñ½­•¹%€ü•Ñ=‰¨ É…Á¡¥Œœ°‘…Ñ„¹Ñ½­•¹%¤€è¹Õ±°ì4(€€€€€€€€€€€½¹ÍĞ¡…É…Ñ•È€ô‘…Ñ„¹¡…É…Ñ•É%€ü•Ñ=‰¨ ¡…É…Ñ•Èœ°‘…Ñ„¹¡…É…Ñ•É%¤€è¹Õ±°ì4(€€€€€€€€€€€½¹ÍĞÑ½­•¹9…µ”€ô‘…Ñ„¹Ñ½­•¹9…µ”ñğÑ½­•¸ü¹•Ğ ¹…µ”œ¤ñğ¡…É…Ñ•Èü¹•Ğ ¹…µ”œ¤ñğ€œ¡Q½­•¸¤œì4(€€€€€€€€€€€½¹ÍĞ¡…É…Ñ•É9…µ”€ô‘…Ñ„¹¡…É…Ñ•É9…µ”ñğ¡…É…Ñ•Èü¹•Ğ ¹…µ”œ¤ñğÑ½­•¹9…µ”ì4(€€€€€€€€€€€½¹ÍĞÉ•½É‘•€ô‘…Ñ„¹Ñ¥µ•ÍÑ…µÀ€ü±½…±Q¥µ”¡‘…Ñ„¹Ñ¥µ•ÍÑ…µÀ¤€è€ŸŠPœì4(€€€€€€€€€€€½¹ÍĞ‰½¹ÕÍQ•áĞ€ô‰½¹ÕÌ€„ôô¹Õ±°€ü€¡‰½¹ÕÌ€øô€À€ü€¬‘í‰½¹ÕÍõ€€è€‘í‰½¹ÕÍõ€¤€è€ŸŠPœì4(4(€€€€€€€€€€€É•ÑÕÉ¸ì4(€€€€€€€€€€€€€€€Á±…å•ÈèÁ±…å•É9…µ”°4(€€€€€€€€€€€€€€€¥¹™¼è€‘í¡…É…Ñ•É9…µ•ôƒŠˆ5€‘í‘…µ…•ôƒŠH€‘í‘ôƒŠˆ	½¹ÕÌ€‘í‰½¹ÕÍQ•áÑôƒŠˆ5½‘”€‘íµ½‘•ôƒŠˆ €‘íÉ•½É‘•‘õ€°4(€€€€€€€€€€€€€€€Ñ¥µ•ÍÑ…µÀè‘…Ñ„¹Ñ¥µ•ÍÑ…µÀñğ€À4(€€€€€€€€€€€ôì4(€€€€€€€ô¤ì4(4(€€€€€€€½µÁ¥±•¹Í½ÉĞ ¡„°ˆ¤€ôø€¡ˆ¹Ñ¥µ•ÍÑ…µÀñğ€À¤€´€¡„¹Ñ¥µ•ÍÑ…µÀñğ€À¤¤ì4(4(€€€€€€€½¹ÍĞÉ½İÌ€ô½µÁ¥±•¹µ…À¡É½Ü€ôøíì‘í}Í…¹¥Ñ¥é”¡É½Ü¹Á±…å•È¥ôô‘í}Í…¹¥Ñ¥é”¡É½Ü¹¥¹™¼¥õõõ€¤ì4(€€€€€€€É•ÑÕÉ¸€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”÷Â~€½¹•¹ÑÉ…Ñ¥½¸MÑ…ÑÕÍõô€‘íÉ½İÌ¹©½¥¸ œ€œ¥õ€ì4(€€€ô4(4(€€€€¼¨¨4(€€€€€¨Í¡½İ!•±À¡Á±…å•È¤4(€€€€€¨€€]¡¥ÍÁ•ÈÑ¡”™Õ±°±¥ÍĞ½˜½µµ…¹‘Ì…¹ÕÍ…”¸4(€€€€€¨¼4(€€€™Õ¹Ñ¥½¸Í¡½İ!•±À¡Á±…å•È¤ì(€€€€€€€½¹ÍĞ½ÕĞ€ô€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞÕ¥‘•õõ€€¬(€€€€€€€€€€€€ííÑ¥½¹Ìô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ =Á•¸¡•¬	ÕÑÑ½¹Ìœ°€œ…½¹•¹ÑÉ…Ñ¥½¸µ•¹Ôœ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ÕÉÉ•¹ĞMÑ…ÑÕÌœ°€œ…½¹•¹ÑÉ…Ñ¥½¸ÍÑ…ÑÕÌœ¥õõõ€€¬(€€€€€€€€€€€€íí1•…É¸=ÈI•Ù¥•Üô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ]¡…Ğ‘½•Ì½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ‘¼üœ°€œ…½¹•¹ÑÉ…Ñ¥½¸¥¹™¼œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ É•…Ñ”½ÈUÁ‘…Ñ”5…¹Õ…°œ°€œ…½¹•¹ÑÉ…Ñ¥½¸µ…¹Õ…°œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•…µ=¹±äÕ‘¥Ğœ°€œ…½¹•¹ÑÉ…Ñ¥½¸…Õ‘¥Ğœ¥õõõ€€¬(€€€€€€€€€€€€ííM•ÑÑ¥¹Ìô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ =Á•¸M•ÑÑ¥¹Ìœ°€œ…½¹•¹ÑÉ…Ñ¥½¸Í•ÑÑ¥¹Ìœ¥õõõ€ì(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘í½ÕÑõ€¤ì(€€€ô((€€€™Õ¹Ñ¥½¸Í¡½İ½¹•¹ÑÉ…Ñ¥½¹%¹™¼¡Á±…å•È¤ì(€€€€€€€½¹ÍĞ½ÕĞ€ô€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ]¡…Ğ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ½•Íõõ€€¬(€€€€€€€€€€€€ííAÕÉÁ½Í”õ	Õ¥±‘Ì¹½Éµ…°°…‘Ù…¹Ñ…”°½È‘¥Í…‘Ù…¹Ñ…”½¹ÍÑ¥ÑÕÑ¥½¸Í…Ù•Ì™É½´‘…µ…”°É•µ•µ‰•ÉÌ•… Á±…å•ÈÌ±…Ñ•ÍĞ¡•¬°…¹µ…¹…•ÌÑ¡”½¹™¥ÕÉ•½¹•¹ÑÉ…Ñ¥¹œµ…É­•È¹õõ€€¬(€€€€€€€€€€€€ííĞQ¡”Q…‰±”õM•±•Ğ„±¥¹­•¡…É…Ñ•ÈÑ½­•¸°½Á•¸Ñ¡”¡•¬‰ÕÑÑ½¹Ì°•¹Ñ•È‘…µ…”°…¹¡½½Í”Ñ¡”…ÁÁÉ½ÁÉ¥…Ñ”É½±°µ½‘”¹õõ€€¬(€€€€€€€€€€€€íí1•…É¸5½É”ô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ É•…Ñ”½ÈUÁ‘…Ñ”5…¹Õ…°œ°€œ…½¹•¹ÑÉ…Ñ¥½¸µ…¹Õ…°œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 	…¬Ñ¼Õ¥‘”œ°€œ…½¹•¹ÑÉ…Ñ¥½¸¡•±Àœ¥õõõ€ì(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘í½ÕÑõ€¤ì(€€€ô((€€€™Õ¹Ñ¥½¸Í¡½İ½¹•¹ÑÉ…Ñ¥½¹M•ÑÑ¥¹Ì¡Á±…å•È¤ì(€€€€€€€½¹ÍĞÉ…¹‘½µ¥é”€ô•Ñ½¹™¥œ ¤¹É…¹‘½µ¥é”€ôôôÑÉÕ”ì(€€€€€€€½¹ÍĞ½ÕĞ€ô€™íÑ•µÁ±…Ñ”é‘•™…Õ±Ñôíí¹…µ”õ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞM•ÑÑ¥¹Íõõ€€¬(€€€€€€€€€€€€ííI•ÍÕ±Ğ5•ÍÍ…•Ìô‘íÉ…¹‘½µ¥é”€ü€Y…É¥•œ€è€MÑ…¹‘…Éõõõ€€¬(€€€€€€€€€€€€íí¡½½Í”ô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ MÑ…¹‘…Éœ°€œ…½¹•¹ÑÉ…Ñ¥½¸€´µ½¹™¥œÉ…¹‘½µ¥é”½™˜œ¥ô€‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ Y…É¥•œ°€œ…½¹•¹ÑÉ…Ñ¥½¸€´µ½¹™¥œÉ…¹‘½µ¥é”½¸œ¥õõõ€€¬(€€€€€€€€€€€€íí5…É­•Èô‘í}Í…¹¥Ñ¥é”¡•Ñ5…É­•È ¤¥õõõ€€¬(€€€€€€€€€€€€ííI•ÑÕÉ¸ô‘í…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 	…¬Ñ¼Õ¥‘”œ°€œ…½¹•¹ÑÉ…Ñ¥½¸¡•±Àœ¥õõõ€ì(€€€€€€€Í•¹‘¡…Ğ ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞœ°€½Ü€ˆ‘íÁ±…å•Éôˆ€‘í½ÕÑõ€¤ì(€€€ô((€€€™Õ¹Ñ¥½¸½¹•¹ÑÉ…Ñ¥½¹5…¹Õ…±!Ñµ° ¤ì(€€€€€€€É•ÑÕÉ¸l(€€€€€€€€€€€€œñ Äù½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞUÍ•È5…¹Õ…°ğ½ Äøœ°(€€€€€€€€€€€€ñÀøñÍÑÉ½¹œù…µ•ÍÍ¥ÍĞØ‘í}Í…¹¥Ñ¥é”¡YIM%=8¥ôğ½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ€‘í}Í…¹¥Ñ¥é”¡5=U1}YIM%=8¥ôğ½ÍÑÉ½¹œøğ½Àù€°(€€€€€€€€€€€€œñÀù½¹•¹ÑÉ…Ñ¥½¹ÍÍ¥ÍĞ‰Õ¥±‘Ì™…µÀí€Õ½¹•¹ÑÉ…Ñ¥½¸¡•­Ì™É½´‘…µ…”°É•…‘ÌÑ¡”±¥¹­•¡…É…Ñ•ÉpÌ½¹ÍÑ¥ÑÕÑ¥½¸Í…Ù¥¹œÑ¡É½Ü‰½¹ÕÌ°É•µ•µ‰•ÉÌÑ¡”Á±…å•ÉpÌ±…Ñ•ÍĞ¡•¬°…¹µ…¹…•ÌÑ¡”½