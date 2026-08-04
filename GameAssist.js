/*
========================================
GameAssist - Roll20 API Script
Version: 2.0.0
Last Updated: 2026-08-04 (America/New_York)
Release scope: EffectAssist 2.3.0, complete AlmanacAssist 1.1.0, HealthService 1.0.0, and verified CombatAssist duration events on one GameAssist v2.0.0 development line.
Author: Mord Eagle
License: MIT for original GameAssist code; see LICENSE and ATTRIBUTIONS.md
Homepage: https://github.com/Mord-Eagle/GameAssist

DESCRIPTION
GameAssist is a modular D&D 5E (2014 and 2024) automation suite with an explicit opt-in
task queue, state/configuration helpers, consistent logging, and a core marker
service plus a shared health-observation and verified-write contract. Normal event handlers execute directly unless a module deliberately
calls GameAssist.enqueue(). This development package contains thirteen configurable modules:
- ConfigUI 0.2.2 - GM-only chat controls for toggling modules and common options.
- CritAssist 0.2.5.1 - Detects natural-1 attacks and offers fumble/confirm menus.
- ConditionAssist 1.0.3 - Provides condition wording, artwork, announcements, and marker controls.
- TokenAssist 1.0.4 - Provides general token controls through !token-assist and !ta commands.
- InitiativeAssist 1.0.4 - Uses Roll20's native Turn Tracker for mixed-sheet initiative workflows and compact topic guidance.
- CombatAssist 1.1.0 - Tracks encounters, native round counters, guarded turns, optional timers, private-safe pings, recoverable tracker changes, and verified semantic progression events.
- WelcomeAssist 0.1.4 - Optionally greets the table after a healthy GameAssist startup through short !Welcome commands.
- ConcentrationAssist 0.4.0 - Runs manual and private HP-loss-offered concentration checks, manages its configured marker, and exposes concentration lifecycle events.
- NPCAssist 1.4.0 - Adds page-local NPC naming and GM-private Bloodied alerts to death markers, history, reports, audits, repair previews, and Arc rosters.
- EffectAssist 2.3.0 - Coordinates catalog-driven effects, direct GM casting, opaque player flows, retained GM requests, 2014-sheet modifiers, concentration, ownership-safe cleanup, duration candidates, and bounded 2014 Bless proposals.
- AlmanacAssist 1.1.0 - Adds guided Wayfarer drafts to fictional time, climate, astronomy, weather, environments, and verified 2014-sheet rests across six independently controlled internal systems.
- HPAssist 0.2.0 - Rolls npc_hpformula and uses HealthService for verified token bar 1 writes when available.
- DebugTools 0.3.0 - Optional dry-run-first GM diagnostics with verified supported HP damage writes.

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
- !ga-health [recent|audit]
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
  !Effect-Status, !Effect-Definitions, !Effect-Duration, !Effect-Durations on|off,
  !Effect-Casts, !Effect-Recognition on|off, !Effect-Requests,
  !Effect-Targets, !Effect-Request,
  !Effect-Apply, !Effect-End,
  !Effect-Audit, !Effect-Repair, !Effect-Players, !effect, !Bless, !Guidance, !Guide,
  !Haste, !Warding-Bond, !Holy-Weapon, and !PwoaT
- AlmanacAssist: !Almanac, !aa, !cal, !date, !time, !clim, !astro,
  !weather, !enviro, !rest, !aa-time, !aa-climate, !aa-astro,
  !aa-weather, !aa-enviro, !aa-rest, !aa-wayfarer, !Almanac-GM,
  !Almanac-DM, !Almanac-Status, !Almanac-Audit
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
- Player casting buttons use short-lived opaque choices, and Ask the GM requests
  remain available briefly in the GM control center instead of relying on one whisper.
- Mechanics without an ownership-safe 2014-sheet field remain clearly listed as
  assisted table steps instead of being represented by unsafe sheet rewrites.
- EffectAssist audits projection drift without writing and requires a fresh GM confirmation before repair.
- Built-in EffectAssist definitions carry formal duration rules. Accepted CombatAssist progression and committed AlmanacAssist time may create private GM review candidates, but elapsed time never ends an effect automatically.
- A verified official 2014 Bless spell card may create one short-lived GM proposal; it never infers recipients or changes an effect before ordinary review and confirmation.
- AlmanacAssist remains disabled until the GM enables it and provides all six
  independently controlled Time, Climate, Astronomy, Weather, Environment,
  and Rest systems as one complete v2.0.0 module.
- Wayfarer setup keeps persistent draft work separate from the active calendar,
  validates before atomic activation, preserves elapsed time for active-calendar
  edits when possible, and retains one deliberate rollback point.
- Almanac systems exchange optional context without hidden prerequisites;
  disabling one preserves its valid state and leaves unrelated systems usable
  through explicit manual or bounded fallback context.
- RestAlmanac is the only initial Almanac sheet writer. It previews and
  revalidates supported 2014 PC HP, Hit Dice, and spell-slot changes before one
  confirmed transaction, while Environment remains descriptive only.
- [GAMEASSIST:CORE:HEALTHSERVICE] publishes bounded supported HP evidence,
  deduplicates linked PC sheet/token notifications, and verifies identified
  GameAssist HP writes without guessing the cause of unexplained changes.
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
Use !ga-status for system health, !ga-health for supported HP evidence, and !ga-config list for a configuration snapshot.
For bug reports, include the relevant GameAssist chat output and sandbox console error.
========================================
*/

// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST"
//   project_version: "v2.0.0"
//   purpose: "Roll20 API modular kernel and bundled modules with MECHSUITS v1.5.2 contracts, migration-safe module identities, explicit opt-in queue execution, state self-healing, dependency diagnostics, toggleable marker, Turn Tracker, and health authorities, source-aware semantic effects with ownership-safe projections, bounded GM-reviewed official 2014 Bless cast proposals, and optional GM-reviewed duration candidates, integrated condition guidance, general token controls, mixed 2014/2024 initiative workflows, preservation-first encounter flow, GM-private NPC Bloodied alerts, optional health-gated table greetings, validated real-world table time, and independently managed fictional time, climate, astronomy, weather, environments, and deliberate 2014-sheet rests. Non-goals: fallback dispatch to standalone TokenMod/StatusInfo, implicit event queueing, automatic turn advancement, automatic effect application or recipient inference from spell cards, automatic effect expiration from elapsed time, automatic Bloodied markers/history, automatic concentration rolls from observed HP changes, damage-source guessing, silent effect repair, automatic environmental penalties, or automatic reversal of campaign state when fictional time moves backward."
//   order: ["policy","app.utils","core.queue","core.compat","core.state","core.markerservice","core.turntrackerservice","core.semanticevents","core.healthservice","core.object","interfaces.events","interfaces.commands","modules.configui","modules.critassist","modules.conditionassist","modules.tokenassist","modules.initiativeassist","modules.combatassist","modules.welcomeassist","modules.npcassist","modules.concentrationassist","modules.effectassist","modules.almanacassist","modules.hpassist","modules.debugtools","bootstrap"]
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
//     spans: ["[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:TURNTRACKERSERVICE]","[GAMEASSIST:CORE:SEMANTICEVENTS]","[GAMEASSIST:CORE:HEALTHSERVICE]","[GAMEASSIST:MODULES:EFFECTASSIST]","[GAMEASSIST:MODULES:ALMANACASSIST]","[GAMEASSIST:MODULES:INITIATIVEASSIST]","[GAMEASSIST:MODULES:COMBATASSIST]","[GAMEASSIST:MODULES:WELCOMEASSIST]"]
//   performance: { notes: "No current benchmark claim; validate in the target Roll20 campaign sandbox." }
//   concurrency: { model: "Direct event handlers plus explicit opt-in serialized task queue", idempotency: "N/A (event-driven)" }
//   compatibility: { accepts: ["Roll20 API sandbox; current campaign smoke test required"], emits: "Roll20 chat whispers/logs" }
//   policy: { notes_ref: "[GAMEASSIST:POLICY]" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   transport_map:
//     chat: "Errors are whispered to GM; status/info are whispered as structured text"
//   canonical_tree: |
//     [GAMEASSIST]/
//   Ûµã‹h‘éì¶»§q«^t€€€€€Í½ÕÉ•Ù•¹Ñ%è­•ä4(€€€€€€€€€€€€€€€ô°½ÁÑ¥½¹Ì¤ì4(€€€€€€€€€€€€€€€É•ÍÕ±Ğ¹…‘‘•€¬ô¡…¹”¹…‘‘•ì4(€€€€€€€€€€€€€€€É•ÍÕ±Ğ¹ÕÁ‘…Ñ•€¬ô¡…¹”¹ÕÁ‘…Ñ•ì4(€€€€€€€€€€€€€€€É•ÍÕ±Ğ¹‘ÕÁ±¥…Ñ•Ì€¬ô¡…¹”¹‘ÕÁ±¥…Ñ”ì4(€€€€€€€€€€€ô¤ì4(4(€€€€€€€€€€€É•ÑÕÉ¸É•ÍÕ±Ğì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸Í¡½İÉA…¹•°¡µ•ÍÍ…”€ô¹Õ±°¤ì4(€€€€€€€€€€€½¹ÍĞÉÕ¹Ñ¥µ”€ô•¹ÍÕÉ•9A5…¹…•ÉIÕ¹Ñ¥µ” ¤ì4(€€€€€€€€€€€½¹ÍĞ…É1¥¹•Ì€ôÉÕ¹Ñ¥µ”¹…ÉÌ¹±•¹Ñ 4(€€€€€€€€€€€€€€€€üÉÕ¹Ñ¥µ”¹…ÉÌ¹µ…À¡…ÉŒ€ôøl4(€€€€€€€€€€€€€€€€€€€€‘í…ÉŒ¹¹…µ•ôè€‘íÉÉ…ä¹¥ÍÉÉ…ä¡…ÉŒ¹•¹ÑÉ¥•Ì¤€ü…ÉŒ¹•¹ÑÉ¥•Ì¹±•¹Ñ €è€Áô•¹ÑÉ¥•Í€°4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 5…¹…”œ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘íÅÕ•Éå•™…Õ±Ğ¡…ÉŒ¹¹…µ”¥ôˆ€´µµ…¹…•€¤4(€€€€€€€€€€€€€€€t¹©½¥¸ œ€œ¤¤4(€€€€€€€€€€€€€€€€èl9¼…ÉŒ‰Õ­•ÑÌÉ•…Ñ•å•Ğ¸tì4(4(€€€€€€€€€€€Í•¹‘9AA…¹•° 9AÉŒ	Õ­•ÑÌœ°l4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€•™…Õ±ĞIÕ±”œ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”è€… ±¥¹­•É•…ÑÕÉ”…ÁÁ•…ÉÌ½¹”Á•È…ÉŒ¸‘‘¥¹œ¥Ğ……¥¸ÕÁ‘…Ñ•ÌÑ¡”•á¥ÍÑ¥¹œ•¹ÑÉä¥¹ÍÑ•…½˜É•…Ñ¥¹œ„‘ÕÁ±¥…Ñ”¸œ4(€€€€€€€€€€€€€€€ô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€ÕÉÉ•¹ĞÉÌœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”è…É1¥¹•Ì4(€€€€€€€€€€€€€€€ô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€½µµ…¹‘Ìœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”èl4(€€€€€€€€€€€€€€€€€€€€€€€€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€‰A…±…‘¥¸Ñ½¹•µ•¹Ğˆ€ô…‘Í•±•Ñ•±¥¹­•A½9AÑ½­•¹Ìœ°4(€€€€€€€€€€€€€€€€€€€€€€€€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€‰A…±…‘¥¸Ñ½¹•µ•¹Ğˆ€´µÍ•ÍÍ¥½¸€ô…ÁÁ•¹ÕÉÉ•¹ĞÍ•ÍÍ¥½¸‘•…Ñ¡Ìœ°4(€€€€€€€€€€€€€€€€€€€€€€€€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€‰A…±…‘¥¸Ñ½¹•µ•¹Ğˆ€´µ¹½Ñ”€‰Ñ•áĞˆ€ô…‘„Í¡½ÉĞ¹½Ñ”Ñ¼Í•±•Ñ•Ñ½­•¹Ìœ°4(€€€€€€€€€€€€€€€€€€€€€€€€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€‰A…±…‘¥¸Ñ½¹•µ•¹Ğˆ€´µµ…¹…”€ôÉ•µ½Ù”½ÈÕ¹‘¼•¹ÑÉ¥•Ìœ°4(€€€€€€€€€€€€€€€€€€€€€€€€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€‰A…±…‘¥¸Ñ½¹•µ•¹Ğˆ€´µ…±±½İÕÁ±¥…Ñ•Ì€ô‘•±¥‰•É…Ñ•±ä‰åÁ…ÍÌ‘•‘ÕÁ±¥…Ñ¥½¸œ4(€€€€€€€€€€€€€€€€€€€t4(€€€€€€€€€€€€€€€ô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€	ÕÑÑ½¹Ìœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”èl4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ‘M•±•Ñ•Q¼ÉŒœ°€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆıíÉŒ‰Õ­•Ğ¹…µ•ñA…±…‘¥¸Ñ½¹•µ•¹Ñôˆœ¤°4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ÁÁ•¹M•ÍÍ¥½¸Q¼ÉŒœ°€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆıíÉŒ‰Õ­•Ğ¹…µ•ñA…±…‘¥¸Ñ½¹•µ•¹Ñôˆ€´µÍ•ÍÍ¥½¸œ¤°4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 5…¹…”ÉŒœ°€œ…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆıíÉŒ‰Õ­•Ğ¹…µ•ñA…±…‘¥¸Ñ½¹•µ•¹Ñôˆ€´µµ…¹…”œ¤4(€€€€€€€€€€€€€€€€€€€t4(€€€€€€€€€€€€€€€ô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€Q¥Àœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”èµ•ÍÍ…”ñğ€M•±•ĞÑ½­•¹Ì‰•™½É”ÕÍ¥¹œÑ¡”Í•±•Ñ•µÑ½­•¸½µµ…¹¸œ4(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€t¤ì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸Í¡½İÉ5…¹…•A…¹•°¡…ÉŒ°Á…”€ô€Ä°µ•ÍÍ…”€ô¹Õ±°¤ì4(€€€€€€€€€€€½¹ÍĞ±¥µ¥Ğ€ôQ!}IA=IQ}Q%1}1%5%Pì4(€€€€€€€€€€€½¹ÍĞ¹•İ•ÍĞ€ô…ÉŒ¹•¹ÑÉ¥•Ì¹Í±¥” ¤¹É•Ù•ÉÍ” ¤ì4(€€€€€€€€€€€½¹ÍĞÁ…•½Õ¹Ğ€ô5…Ñ ¹µ…à Ä°5…Ñ ¹•¥°¡¹•İ•ÍĞ¹±•¹Ñ €¼±¥µ¥Ğ¤¤ì4(€€€€€€€€€€€½¹ÍĞÕÉÉ•¹ÑA…”€ô5…Ñ ¹µ¥¸¡5…Ñ ¹µ…à¡Á…ÉÍ•%¹Ğ¡Á…”°€ÄÀ¤ñğ€Ä°€Ä¤°Á…•½Õ¹Ğ¤ì4(€€€€€€€€€€€½¹ÍĞÍÑ…ÉĞ€ô€¡ÕÉÉ•¹ÑA…”€´€Ä¤€¨±¥µ¥Ğì4(€€€€€€€€€€€½¹ÍĞ•¹ÑÉ¥•Ì€ô¹•İ•ÍĞ¹Í±¥”¡ÍÑ…ÉĞ°ÍÑ…ÉĞ€¬±¥µ¥Ğ¤ì4(€€€€€€€€€€€½¹ÍĞ…É9…µ”€ôÅÕ•Éå•™…Õ±Ğ¡…ÉŒ¹¹…µ”°€ÉŒœ¤ì4(€€€€€€€€€€€½¹ÍĞ•¹ÑÉå1¥¹•Ì€ô•¹ÑÉ¥•Ì¹±•¹Ñ 4(€€€€€€€€€€€€€€€€ü•¹ÑÉ¥•Ì¹µ…À¡•¹ÑÉä€ôøl4(€€€€€€€€€€€€€€€€€€€€‘í•¹ÑÉä¹¹…µ•ôğ€‘í•¹ÑÉä¹Í½ÕÉ”ñğ€5…¹Õ…°•¹ÑÉäõ€°4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•µ½Ù”œ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µÉ•µ½Ù”€‘í•¹ÑÉä¹…É¹ÑÉå%‘õ€¤4(€€€€€€€€€€€€€€€t¹©½¥¸ œ€œ¤¤4(€€€€€€€€€€€€€€€€èl9¼•¹ÑÉ¥•Ì¥¸Ñ¡¥Ì…ÉŒ¸tì4(€€€€€€€€€€€½¹ÍĞ¹…Ø€ômtì4(4(€€€€€€€€€€€¥˜€¡ÕÉÉ•¹ÑA…”€ø€Ä¤ì4(€€€€€€€€€€€€€€€¹…Ø¹ÁÕÍ ¡…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ 9•İ•Èœ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µµ…¹…”€´µÁ…”€‘íÕÉÉ•¹ÑA…”€´€Åõ€¤¤ì4(€€€€€€€€€€€ô4(€€€€€€€€€€€¥˜€¡ÕÉÉ•¹ÑA…”€ğÁ…•½Õ¹Ğ¤ì4(€€€€€€€€€€€€€€€¹…Ø¹ÁÕÍ ¡…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ =±‘•Èœ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µµ…¹…”€´µÁ…”€‘íÕÉÉ•¹ÑA…”€¬€Åõ€¤¤ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€Í•¹‘9AA…¹•° 5…¹…”9AÉŒœ°l4(€€€€€€€€€€€€€€€ì±…‰•°è€ÉŒœ°Ù…±Õ”è€‘í…ÉŒ¹¹…µ•ô€ ‘í…ÉŒ¹•¹ÑÉ¥•Ì¹±•¹Ñ¡ô•¹ÑÉ¥•Ì¥€ô°4(€€€€€€€€€€€€€€€ì±…‰•°è€¹ÑÉ¥•Ìœ°Ù…±Õ”è•¹ÑÉå1¥¹•Ìô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€	Õ±¬Ñ¥½¹Ìœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”èl4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ I•µ½Ù”M•±•Ñ•Q½­•¹Ìœ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µÉ•µ½Ù•M•±•Ñ•‘€¤°4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ U¹‘¼1…ÍĞ‘‘¥Ñ¥½¸œ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µÕ¹‘½€¤°4(€€€€€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹É•…Ñ•	ÕÑÑ½¸ ÁÁ•¹ÕÉÉ•¹ĞM•ÍÍ¥½¸œ°€…¹ÁŒµ‘•…Ñ µ…ÉŒ€´µ¹…µ”€ˆ‘í…É9…µ•ôˆ€´µÍ•ÍÍ¥½¹€¤4(€€€€€€€€€€€€€€€€€€€t4(€€€€€€€€€€€€€€€ô°4(€€€€€€€€€€€€€€€ì±…‰•°è€A…•Ìœ°Ù…±Õ”è¹…Ø¹±•¹Ñ €ü¹…Ø€èA…”€‘íÕÉÉ•¹ÑA…•ô½˜€‘íÁ…•½Õ¹Ñõ€ô°4(€€€€€€€€€€€€€€€ì4(€€€€€€€€€€€€€€€€€€€±…‰•°è€Q¥Àœ°4(€€€€€€€€€€€€€€€€€€€Ù…±Õ”èµ•ÍÍ…”ñğ€I•µ½Ù”‰ÕÑÑ½¹Ì…™™•Ğ½¹±äÑ¡¥Ì…ÉŒ¡…¹‘½ÕĞ¸…µÁ…¥¸°¡…ÁÑ•È°M•Ñ¥½¸°…¹M•ÍÍ¥½¸‘•…Ñ ¡¥ÍÑ½Éä¥ÌÕ¹¡…¹•¸œ4(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€t¤ì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸É•ÅÕ•ÍÑ•…Ñ¡5…É­•È¡Ñ½­•¸°½¸¤ì4(€€€€€€€€€€€½¹ÍĞÉ•Í½±ÕÑ¥½¸€ô•Ñ•…Ñ¡5…É­•ÉI•Í½±ÕÑ¥½¸ ¤ì4(€€€€€€€€€€€¥˜€ …É•Í½±ÕÑ¥½¸¹½¬¤ì4(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 9AÍÍ¥ÍĞœ°‘•…Ñ¡5…É­•É]…É¹¥¹œ¡É•Í½±ÕÑ¥½¸¤°€]I8œ¤ì(€€€€€€€€€€€€€€€É•ÑÕÉ¸™…±Í”ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€¥˜€¡É•Í½±ÕÑ¥½¸¹…µ‰¥Õ½ÕÌ¤ì4(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 4(€€€€€€€€€€€€€€€€€€€€9AÍÍ¥ÍĞœ°(€€€€€€€€€€€€€€€€€€€5…É­•È€ˆ‘íÉ•Í½±ÕÑ¥½¸¹É•ÅÕ•ÍÑ•‘ôˆµ…Ñ¡•ÌµÕ±Ñ¥Á±”ÕÍÑ½´µ…É­•ÉÌìÕÍ¥¹œ€‘íÉ•Í½±ÕÑ¥½¸¹¥‘ô¹€°4(€€€€€€€€€€€€€€€€€€€€]I8œ4(€€€€€€€€€€€€€€€€¤ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹Í•Ğ¡Ñ½­•¸°µ½‘MÑ…Ñ”¹½¹™¥œ¹‘•…‘5…É­•Èñğ€‘•…œ°½¸°ì½İ¹•Èè€9AÍÍ¥ÍĞœô¤ì(€€€€€€€€€€€¥˜€ …É•ÍÕ±Ğ¹½¬¤ì4(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 9AÍÍ¥ÍĞœ°É•ÍÕ±Ğ¹µ•ÍÍ…”ñğ5…É­•È¡…¹”™…¥±•€ ‘íÉ•ÍÕ±Ğ¹½‘”ñğ€%9QI90ô¤¹€°€]I8œ¤ì(€€€€€€€€€€€€€€€É•ÑÕÉ¸™…±Í”ì4(€€€€€€€€€€€ô4(€€€€€€€€€€€É•ÑÕÉ¸ÑÉÕ”ì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸•Ñ9A½¹Ñ•áĞ¡Ñ½­•¸°±¥¹¬€ô¹Õ±°¤ì4(€€€€€€€€€€€½¹ÍĞ±¥¹­•€ô±¥¹¬ñğ…µ•ÍÍ¥ÍĞ¹•Ñ1¥¹­•‘¡…É…Ñ•È¡Ñ½­•¸¤ì4(€€€€€€€€€€€¥˜€ …±¥¹­•¤É•ÑÕÉ¸¹Õ±°ì4(4(€€€€€€€€€€€½¹ÍĞ¹ÁÑÑÈ€ô™¥¹‘=‰©Ì¡ì4(€€€€€€€€€€€€€€€}ÑåÁ”è€…ÑÑÉ¥‰ÕÑ”œ°4(€€€€€€€€€€€€€€€}¡…É…Ñ•É¥è±¥¹­•¹¡…É…Ñ•È¹¥°4(€€€€€€€€€€€€€€€¹…µ”è€¹ÁŒœ4(€€€€€€€€€€€ô¥lÁtì4(4(€€€€€€€€€€€¥˜€ …¹ÁÑÑÈñğ¹ÁÑÑÈ¹•Ğ ÕÉÉ•¹Ğœ¤€„ôô€œÄœ¤É•ÑÕÉ¸¹Õ±°ì4(€€€€€€€€€€€É•ÑÕÉ¸±¥¹­•ì4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸Á…ÉÍ•QÉ…­•‘!@¡É…Ü¤ì(€€€€€€€€€€€¥˜€¡É…Ü€ôôô€œœñğÉ…Ü€ôô¹Õ±°¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¡À€ôÁ…ÉÍ•%¹Ğ¡É…Ü°€ÄÀ¤ì(€€€€€€€€€€€É•ÑÕÉ¸9Õµ‰•È¹¥Í¥¹¥Ñ”¡¡À¤€ü¡À€è¹Õ±°ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸•Ñ9Á9…µ¥¹½¹Ñ•áĞ¡Ñ½­•¸¤ì(€€€€€€€€€€€¥˜€ …Ñ½­•¸ñğÑåÁ•½˜Ñ½­•¸¹•Ğ€„ôô€™Õ¹Ñ¥½¸œ¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€¥˜€ …l½‰©•ÑÌœ°€µ±…å•Èt¹¥¹±Õ‘•Ì¡Ñ½­•¸¹•Ğ ±…å•Èœ¤¤¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¡…É…Ñ•É%€ôÑ½­•¸¹•Ğ É•ÁÉ•Í•¹ÑÌœ¤ì(€€€€€€€€€€€¥˜€ …¡…É…Ñ•É%¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¡…É…Ñ•È€ô•Ñ=‰¨ ¡…É…Ñ•Èœ°¡…É…Ñ•É%¤ì(€€€€€€€€€€€¥˜€ …¡…É…Ñ•È¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¹ÁÑÑÈ€ô™¥¹‘=‰©Ì¡ì}ÑåÁ”è€…ÑÑÉ¥‰ÕÑ”œ°}¡…É…Ñ•É¥è¡…É…Ñ•È¹¥°¹…µ”è€¹ÁŒœô¥lÁtì(€€€€€€€€€€€¥˜€ …¹ÁÑÑÈñğMÑÉ¥¹œ¡¹ÁÑÑÈ¹•Ğ ÕÉÉ•¹Ğœ¤¤€„ôô€œÄœ¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¡…É…Ñ•É9…µ”€ôMÑÉ¥¹œ¡¡…É…Ñ•È¹•Ğ ¹…µ”œ¤ñğ€œœ¤¹ÑÉ¥´ ¤ì(€€€€€€€€€€€½¹ÍĞÑ½­•¹9…µ”€ôMÑÉ¥¹œ¡Ñ½­•¸¹•Ğ ¹…µ”œ¤ñğ€œœ¤¹ÑÉ¥´ ¤ì(€€€€€€€€€€€½¹ÍĞ‰…Í•9…µ”€ô¡…É…Ñ•É9…µ”ñğÑ½­•¹9…µ”ì(€€€€€€€€€€€É•ÑÕÉ¸‰…Í•9…µ”€üìÑ½­•¸°¡…É…Ñ•È°‰…Í•9…µ”ô€è¹Õ±°ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸¹½Éµ…±¥é•‘9ÁQ½­•¹9…µ”¡É…Ü¤ì(€€€€€€€€€€€É•ÑÕÉ¸MÑÉ¥¹œ¡É…Üñğ€œœ¤¹ÑÉ¥´ ¤¹Ñ½1½İ•É…Í” ¤ì(€€€€€€€ô((€€€€€€€€¼¨¨(€€€€€€€€€¨…ÕÑ½9Õµ‰•É9ÁQ½­•¸ƒŠP¥Ù”„¹•İ±ä…‘‘•9AÑ¡”±½İ•ÍĞ…Ù…¥±…‰±”Á…”µ±½…°¹…µ”¸(€€€€€€€€€¨%¹ÁÕÑÌè½¹”¹•İ±ä…‘‘•É…Á¡¥ŒìÑ¡”±¥¹­•9A¡…É…Ñ•È¹…µ”¥Ì…ÕÑ¡½É¥Ñ…Ñ¥Ù”İ¡•¸ÁÉ•Í•¹Ğ¸(€€€€€€€€€¨%¹Ù…É¥…¹ÑÌèÕÉÉ•¹Ğ•±¥¥‰±”Á…”Ñ½­•¹Ì…É”Ñ¡”½¹±äÍ•ÅÕ•¹”Í½ÕÉ”ì•á¥ÍÑ¥¹œÑ½­•¹Ì…É”¹•Ù•ÈÉ•¹…µ•¸(€€€€€€€€€¨…¥±ÕÉ”èAÌ°Õ¹±¥¹­•½‰±…¹¬Ñ½­•¹Ì°µ…Àµ±…å•ÈÉ…Á¡¥Ì°…¹Õ¹É•…‘…‰±”¥‘•¹Ñ¥Ñä…É”Í­¥ÁÁ•Í¥±•¹Ñ±ä¸(€€€€€€€€€¨•Í¥¸è¹¼Í…Ù•½Õ¹Ñ•Èµ•…¹Ì‘•±•Ñ¥½¸…¹Í…¹‘‰½àÉ•ÍÑ…ÉĞÉ•ÅÕ¥É”¹¼É•Á…¥È¸(€€€€€€€€€¨¼(€€€€€€€™Õ¹Ñ¥½¸…ÕÑ½9Õµ‰•É9ÁQ½­•¸¡Ñ½­•¸¤ì(€€€€€€€€€€€¥˜€¡µ½‘MÑ…Ñ”¹½¹™¥œ¹…ÕÑ½9Õµ‰•É9ÁQ½­•¹Ì€ôôô™…±Í”¤É•ÑÕÉ¸™…±Í”ì(€€€€€€€€€€€½¹ÍĞ½¹Ñ•áĞ€ô•Ñ9Á9…µ¥¹½¹Ñ•áĞ¡Ñ½­•¸¤ì(€€€€€€€€€€€½¹ÍĞÁ…•%€ôÑ½­•¸€˜˜Ñ½­•¸¹•Ğ }Á…•¥œ¤ì(€€€€€€€€€€€¥˜€ …½¹Ñ•áĞñğ€…Á…•%¤É•ÑÕÉ¸™…±Í”ì(€€€€€€€€€€€½¹ÍĞÕÍ•‘9…µ•Ì€ô¹•ÜM•Ğ (€€€€€€€€€€€€€€€™¥¹‘=‰©Ì¡ì}ÑåÁ”è€É…Á¡¥Œœ°}Á…•¥èÁ…•%ô¤(€€€€€€€€€€€€€€€€€€€€¹™¥±Ñ•È¡½Ñ¡•È€ôø½Ñ¡•È¹¥€„ôôÑ½­•¸¹¥€˜˜•Ñ9Á9…µ¥¹½¹Ñ•áĞ¡½Ñ¡•È¤¤(€€€€€€€€€€€€€€€€€€€€¹µ…À¡½Ñ¡•È€ôø¹½Éµ…±¥é•‘9ÁQ½­•¹9…µ”¡½Ñ¡•È¹•Ğ ¹…µ”œ¤¤¤(€€€€€€€€€€€€€€€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤(€€€€€€€€€€€€¤ì(€€€€€€€€€€€±•Ğ…ÍÍ¥¹•‘9…µ”€ô½¹Ñ•áĞ¹‰…Í•9…µ”ì(€€€€€€€€€€€¥˜€¡ÕÍ•‘9…µ•Ì¹¡…Ì¡¹½Éµ…±¥é•‘9ÁQ½­•¹9…µ”¡…ÍÍ¥¹•‘9…µ”¤¤¤ì(€€€€€€€€€€€€€€€±•ĞÍÕ™™¥à€ô€Äì(€€€€€€€€€€€€€€€İ¡¥±”€¡ÕÍ•‘9…µ•Ì¹¡…Ì¡¹½Éµ…±¥é•‘9ÁQ½­•¹9…µ”¡€‘í½¹Ñ•áĞ¹‰…Í•9…µ•ô€‘íÍÕ™™¥áõ€¤¤¤ÍÕ™™¥à¬¬ì(€€€€€€€€€€€€€€€…ÍÍ¥¹•‘9…µ”€ô€‘í½¹Ñ•áĞ¹‰…Í•9…µ•ô€‘íÍÕ™™¥áõ€ì(€€€€€€€€€€€ô(€€€€€€€€€€€¥˜€¡MÑÉ¥¹œ¡Ñ½­•¸¹•Ğ ¹…µ”œ¤ñğ€œœ¤€ôôô…ÍÍ¥¹•‘9…µ”¤É•ÑÕÉ¸™…±Í”ì(€€€€€€€€€€€Ñ½­•¸¹Í•Ğ ¹…µ”œ°…ÍÍ¥¹•‘9…µ”¤ì(€€€€€€€€€€€É•ÑÕÉ¸ÑÉÕ”ì(€€€€€€€ô((€€€€€€€€¼¨¨(€€€€€€€€€¨¡…¹‘±•Q½­•¹‘ƒŠP9…µ”„¹•Ü9A°Ñ¡•¸Õ…É!AÍÍ¥ÍĞÌÁ±…•¡½±‘•Èµ!@¥¹Ñ•ÉÙ…°¸(€€€€€€€€€¨½¹Ñ•áĞèI½±°ÈÀ…¸•áÁ½Í”é•É¼½‰±…¹¬‰…ÈÙ…±Õ•Ì‰•™½É”…ÕÑ¼µÉ½±°µ½¸µ…‘İÉ¥Ñ•ÌÉ½±±•!@¸4(€€€€€€€€€¨%¹Ù…É¥…¹Ğè½¹±ä…Ñ¥Ù”…ÕÑ¼µÉ½±°µ½¸µ…‘É••¥Ù•ÌÑ¡”É…”Á•É¥½ì¹½Éµ…°…µ•Á±…ä!@¡…¹•ÌÉ•µ…¥¸‘¥É•Ğ¸4(€€€€€€€€€¨¼4(€€€€€€€™Õ¹Ñ¥½¸¡…¹‘±•Q½­•¹‘¡Ñ½­•¸¤ì(€€€€€€€€€€€…ÕÑ½9Õµ‰•É9ÁQ½­•¸¡Ñ½­•¸¤ì(€€€€€€€€€€€½¹ÍĞ¡ÁI½±±•É½¹™¥œ€ô…µ•ÍÍ¥ÍĞ¹•ÑMÑ…Ñ” !AÍÍ¥ÍĞœ¤ü¹½¹™¥œì(€€€€€€€€€€€¥˜€¡¡ÁI½±±•É½¹™¥œü¹•¹…‰±•€ôôô™…±Í”ñğ¡ÁI½±±•É½¹™¥œü¹…ÕÑ½I½±±=¹‘€„ôôÑÉÕ”¤É•ÑÕÉ¸ì(4(€€€€€€€€€€€¥¹¥Ñ¥…±¥é¥¹9Á!À¹…‘¡Ñ½­•¸¹¥¤ì4(€€€€€€€€€€€Í•ÑQ¥µ•½ÕĞ 4(€€€€€€€€€€€€€€€€ ¤€ôø¥¹¥Ñ¥…±¥é¥¹9Á!À¹‘•±•Ñ”¡Ñ½­•¸¹¥¤°4(€€€€€€€€€€€€€€€A=1%d¹ÉÕ¹Ñ¥µ”¹¹Á!Á%¹¥Ñ¥…±¥é…Ñ¥½¹É…•5Ì(€€€€€€€€€€€€¤ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸Á…ÉÍ•	±½½‘¥•‘!@¡É…Ü¤ì(€€€€€€€€€€€¥˜€¡É…Ü€ôô¹Õ±°ñğMÑÉ¥¹œ¡É…Ü¤¹ÑÉ¥´ ¤€ôôô€œœ¤É•ÑÕÉ¸¹Õ±°ì(€€€€€€€€€€€½¹ÍĞ¡À€ô9Õµ‰•È¡É…Ü¤ì(€€€€€€€€€€€É•ÑÕÉ¸9Õµ‰•È¹¥Í¥¹¥Ñ”¡¡À¤€ü¡À€è¹Õ±°ì(€€€€€€€ô((€€€€€€€€¼¨¨(€€€€€€€€€¨¹½Ñ¥™å	±½½‘¥•‘É½ÍÍ¥¹œƒŠP]¡¥ÍÁ•È½¹”ÁÉ¥Ù…Ñ”¹½Ñ¥”™½È„ÑÉÕ”¡…±˜µ!@É½ÍÍ¥¹œ¸(€€€€€€€€€¨%¹ÁÕÑÌèÕÉÉ•¹ĞÑ½­•¸Á±ÕÌI½±°ÈÀÌÁÉ•Ù¥½ÕÌ½ÕÉÉ•¹Ğ‰…È€ÄÙ…±Õ•Ììµ…á¥µÕ´!@½µ•Ì™É½´ÕÉÉ•¹Ğ‰…È€Äµ…à¸(€€€€€€€€€¨%¹Ù…É¥…¹ÑÌè±¥Ù¥¹œ½‰©•Ğµ±…å•È9A½¹±äì¹¼µ…É­•È°¡¥ÍÑ½Éä°ÉŒ°½ÈÁ•ÉÍ¥ÍÑ•¹ĞÁ•ÈµÑ½­•¸ÍÑ…Ñ”¡…¹•Ì¸(€€€€€€€€€¨…¥±ÕÉ”èµ¥ÍÍ¥¹œ½È¥¹Ù…±¥!@•Ù¥‘•¹”¥Ì¥¹½É•İ¥Ñ¡½ÕĞÕ•ÍÍ¥¹œ½È¡…Ğ½ÕÑÁÕĞ¸(€€€€€€€€€¨•Í¥¸èÁÉ•Ù¥½ÕÌ½ÕÉÉ•¹ĞÙ…±Õ•Ì¹…ÑÕÉ…±±äÉ•…É´…™Ñ•È¡•…±¥¹œ…‰½Ù”¡…±˜…¹ÁÉ•Ù•¹ĞÉ•Á•…ÑÌİ¡¥±”ÍÑ¥±°‰•±½Ü¡…±˜¸(€€€€€€€€€¨¼(€€€€€€€™Õ¹Ñ¥½¸¹½Ñ¥™å	±½½‘¥•‘É½ÍÍ¥¹œ¡Ñ½­•¸°ÁÉ•Ù¥½ÕÍI…Ü°ÕÉÉ•¹ÑI…Ü¤ì(€€€€€€€€€€€¥˜€¡µ½‘MÑ…Ñ”¹½¹™¥œ¹¹½Ñ¥™å	±½½‘¥•€ôôô™…±Í”ñğÑ½­•¸¹•Ğ ±…å•Èœ¤€„ôô€½‰©•ÑÌœ¤É•ÑÕÉ¸™…±Í”ì((€€€€€€€€€€€½¹ÍĞ±¥¹­•€ô•Ñ9A½¹Ñ•áĞ¡Ñ½­•¸¤ì(€€€€€€€€€€€¥˜€ …±¥¹­•¤É•ÑÕÉ¸™…±Í”ì((€€€€€€€€€€€½¹ÍĞÁÉ•Ù¥½ÕÍ!À€ôÁ…ÉÍ•	±½½‘¥•‘!@¡ÁÉ•Ù¥½ÕÍI…Ü¤ì(€€€€€€€€€€€½¹ÍĞÕÉÉ•¹Ñ!À€ôÁ…ÉÍ•	±½½‘¥•‘!@¡ÕÉÉ•¹ÑI…Ü¤ì(€€€€€€€€€€€½¹ÍĞµ…á!À€ôÁ…ÉÍ•	±½½‘¥•‘!@¡Ñ½­•¸¹•Ğ ‰…ÈÅ}µ…àœ¤¤ì(€€€€€€€€€€€¥˜€¡ÁÉ•Ù¥½ÕÍ!À€ôôô¹Õ±°ñğÕÉÉ•¹Ñ!À€ôôô¹Õ±°ñğµ…á!À€ôôô¹Õ±°ñğµ…á!À€ğô€ÀñğÕÉÉ•¹Ñ!À€ğô€À¤ì(€€€€€€€€€€€€€€€É•ÑÕÉ¸™…±Í”ì(€€€€€€€€€€€ô(€€€€€€€€€€€¥˜€ „¡ÁÉ•Ù¥½ÕÍ!À€¨€È€øµ…á!À€˜˜ÕÉÉ•¹Ñ!À€¨€È€ğôµ…á!À¤¤É•ÑÕÉ¸™…±Í”ì((€€€€€€€€€€€½¹ÍĞ¹…µ”€ôÑ½­•¸¹•Ğ ¹…µ”œ¤ñğ±¥¹­•¹¡…É…Ñ•È¹•Ğ ¹…µ”œ¤ñğ€œ¡U¹¹…µ•9A¤œì(€€€€€€€€€€€Í•¹‘9AA…¹•° 9AÍÍ¥ÍĞè	±½½‘¥•œ°l(€€€€€€€€€€€€€€€ì±…‰•°è€9Aœ°Ù…±Õ”è¹…µ”ô°(€€€€€€€€€€€€€€€ì±…‰•°è€!@œ°Ù…±Õ”è€‘íÕÉÉ•¹Ñ!Áô€¼€‘íµ…á!Áõ€ô(€€€€€€€€€€€t¤ì(€€€€€€€€€€€É•ÑÕÉ¸ÑÉÕ”ì(€€€€€€€ô((€€€€€€€™Õ¹Ñ¥½¸¡•­½É•…Ñ ¡Ñ½­•¸¤ì(€€€€€€€€€€€¥˜€ …µ½‘MÑ…Ñ”¹½¹™¥œ¹…ÕÑ½QÉ…­•…Ñ ¤É•ÑÕÉ¸ì4(4(€€€€€€€€€€€¥˜€ …•Ñ9A½¹Ñ•áĞ¡Ñ½­•¸¤¤É•ÑÕÉ¸ì4(4(€€€€€€€€€€€½¹ÍĞ¡À€ôÁ…ÉÍ•QÉ…­•‘!@¡Ñ½­•¸¹•Ğ ‰…ÈÅ}Ù…±Õ”œ¤¤ì4(€€€€€€€€€€€¥˜€¡¡À€ôôô¹Õ±°¤É•ÑÕÉ¸ì4(4(€€€€€€€€€€€ÁÉ•Á…É•9A5…¹…•ÉÑ¥Ù¥Ñä ¤ì4(€€€€€€€€€€€½¹ÍĞ¥Í•…€ô…µ•ÍÍ¥ÍĞ¹5…É­•ÉM•ÉÙ¥”¹¡…Ì¡Ñ½­•¸°µ½‘MÑ…Ñ”¹½¹™¥œ¹‘•…‘5…É­•È¤ì4(4(€€€€€€€€€€€¥˜€¡¡À€ğ€Ä¤ì4(€€€€€€€€€€€€€€€¥˜€ …¥Í•…¤É•ÅÕ•ÍÑ•…Ñ¡5…É­•È¡Ñ½­•¸°ÑÉÕ”¤ì4(€€€€€€€€€€€€€€€¥˜€¡¡…Í=Á•¹•…Ñ¡¹ÑÉä¡Ñ½­•¸¤¤É•ÑÕÉ¸ì4(4(€€€€€€€€€€€€€€€½¹ÍĞ¹…µ”€ôÑ½­•¸¹•Ğ ¹…µ”œ¤ñğ€œ¡U¹¹…µ•9A¤œì4(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 9AÍÍ¥ÍĞœ°€‘í¹…µ•ôÉ•½É‘•…Ì‘•…€¡!@è€‘í¡Áô¥€¤ì(4(€€€€€€€€€€€€€€€€¼¼ÕÑ¼µ¡¥‘”¥˜•¹…‰±•4(€€€€€€€€€€€€€€€¥˜€¡µ½‘MÑ…Ñ”¹½¹™¥œ¹…ÕÑ½!¥‘”¤ì4(€€€€€€€€€€€€€€€€€€€Ñ½­•¸¹Í•Ğ ±…å•Èœ°µ½‘MÑ…Ñ”¹½¹™¥œ¹¡¥‘•1…å•È¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 9AÍÍ¥ÍĞœ°€‘í¹…µ•ôµ½Ù•Ñ¼€‘íµ½‘MÑ…Ñ”¹½¹™¥œ¹¡¥‘•1…å•Éõ€¤ì(€€€€€€€€€€€€€€€ô4(4(€€€€€€€€€€€€€€€É•½É‘•…Ñ¡%¹	Õ­•ÑÌ¡‘•…Ñ¡Ù•¹Ñ%‘•¹Ñ¥Ñä¡Ñ½­•¸°¡À¤¤ì4(€€€€€€€€€€€ô•±Í”¥˜€¡¡À€øô€Ä¤ì4(€€€€€€€€€€€€€€€½¹ÍĞ…¹¹½Ñ…Ñ•€ô…¹¹½Ñ…Ñ•I•Ù¥Ù…±%¹	Õ­•ÑÌ¡Ñ½­•¸°¡À¤ì4(€€€€€€€€€€€€€€€¥˜€¡¥Í•…¤É•ÅÕ•ÍÑ•…Ñ¡5…É­•È¡Ñ½­•¸°™…±Í”¤ì4(€€€€€€€€€€€€€€€¥˜€¡¥Í•…ñğ…¹¹½Ñ…Ñ•¤ì4(€€€€€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹±½œ 9AÍÍ¥ÍĞœ°€‘íÑ½­•¸¹•Ğ ¹…µ”œ¥ôÉ•Ù¥Ù•€¡!@è€‘í¡Áô¥€¤ì(€€€€€€€€€€€€€€€ô4(€€€€€€€€€€€ô4(€€€€€€€ô4(4(€€€€€€€™Õ¹Ñ¥½¸¡…¹‘±•Q½­•¹¡…¹”¡½‰¨°ÁÉ•Ø¤ì4(€€€€€€€€€€€½¹ÍĞÕÉÉ•¹Ñ!À€ôÁ…ÉÍ•QÉ…­•‘!@¡½‰¨¹•Ğ ‰…ÈÅ}Ù…±Õ”œ¤¤ì4(€€€€€€€€€€€½¹ÍĞÁÉ•Ù¥½ÕÍ!À€ôÁ…ÉÍ•QÉ…­•‘!@¡ÁÉ•Øü¹‰…ÈÅ}Ù…±Õ”¤ì4(€€€€€€€€€€€¥˜€¡ÕÉÉ•¹Ñ!À€ôôô¹Õ±°ñğÕÉÉ•¹Ñ!À€ôôôÁÉ•Ù¥½ÕÍ!À¤É•ÑÕÉ¸ì4(4(€€€€€€€€€€€¥˜€¡¥¹¥Ñ¥…±¥é¥¹9Á!À¹¡…Ì¡½‰¨¹¥¤¤ì4(€€€€€€€€€€€€€€€¥˜€¡ÕÉÉ•¹Ñ!À€øô€Ä¤¥¹¥Ñ¥…±¥é¥¹9Á!À¹‘•±•Ñ”¡½‰¨¹¥¤ì4(€€€€€€€€€€€€€€€É•ÑÕÉ¸ì4(€€€€€€€€€€€ô4(4(€€€€€€€€€€€€¼¼!=%èÕ¹­¹½İ¸½‰±…¹¬€´ø‘•…¥Ì¥¹¥Ñ¥…±¥é…Ñ¥½¸°¹½Ğ•Ù¥‘•¹”½˜„±¥Ù¥¹œ9AÉ½ÍÍ¥¹œé•É¼¸(€€€€€€€€€€€¥˜€¡ÁÉ•Ù¥½ÕÍ!À€ôôô¹Õ±°€˜˜ÕÉÉ•¹Ñ!À€ğ€Ä¤É•ÑÕÉ¸ì(€€€€€€€€€€€¡•­½É•…Ñ ¡½‰¨¤ì(€€€€€€€€€€€¹½Ñ¥™å	±½½‘¥•‘É½ÍÍ¥¹œ¡½‰¨°ÁÉ•Øü¹‰…ÈÅ}Ù…±Õ”°½‰¨¹•Ğ ‰…ÈÅ}Ù…±Õ”œ¤¤ì(€€€€€€€ô(4(€€€€€€€½¹ÍĞ¹Á½µµ…¹‘…µ¥±¥•Ì€ôlœ…¹ÁŒ´œ°€œ…¹Á…ÍÍ¥ÍĞ´œ°€œ…¹ÁŒµ‘•…Ñ ´œ°€œ…¹Áµ…¹…•È´tì(€€€€€€€½¹ÍĞ¹Á-¹½İ¹½µµ…¹‘Ì€ô¹•ÜM•Ğ ¤ì((€€€€€€€™Õ¹Ñ¥½¸É•¥ÍÑ•É9A½µµ…¹¡ÍÕ™™¥à°¡…¹‘±•È¤ì(€€€€€€€€€€€¹Á½µµ…¹‘…µ¥±¥•Ì¹™½É… ¡™…µ¥±ä€ôøì(€€€€€€€€€€€€€€€½¹ÍĞÁÉ•™¥à€ô€‘í™…µ¥±åô‘íÍÕ™™¥áõ€ì(€€€€€€€€€€€€€€€¹Á-¹½İ¹½µµ…¹‘Ì¹…‘¡ÁÉ•™¥à¹Ñ½1½İ•É…Í” ¤¤ì(€€€€€€€€€€€€€€€…µ•ÍÍ¥ÍĞ¹½¹½µµ…¹¡ÁÉ•™¥à°µÍœ€ôøì(€€€€€€€€€€€€€€€€€€€½¹ÍĞ½¹Ñ•¹Ğ€ôMÑÉ¥¹œ¡µÍœ¹½¹Ñ•¹Ğñğ€œœ¤¹ÑÉ¥´ ¤ì(€€€€€€€€€€€€€€€€€€€½¹ÍĞ™¥ÉÍĞ€ô½¹Ñ•¹Ğ¹ÍÁ±¥Ğ ½qÌ¬¼¥lÁtì(€€€€€€€€€€€€€€€€€€€½¹ÍĞÉ•µ…¥¹‘•È€ô½¹Ñ•¹Ğ¹Í±¥”¡™¥ÉÍĞ¹±•¹Ñ ¤¹ÑÉ¥´ ¤ì(€€€€€€€€€€€€€€€€€€€¡…¹‘±•È¡ì(€€€€€€€€€€€€€€€€€€€€€€€€¸¸¹µÍœ°(€€€€€€€€€€€€€€€€€€€€€€€½¹Ñ•¹Ğè€…¹ÁŒµ‘•…Ñ ´‘íÍÕ™™¥áô‘íÉ•µ…¥¹‘•È€ü€€‘íÉ•µ…¥¹‘•Éõ€€è€œõ€(€€€€€€€€€€€€€€€€€€€ô¤ì(€€€€€€€€€€€€€€€ô°€9AÍÍ¥ÍĞœ°ìµ=¹±äèÑÉÕ”ô¤ì(€€€€€€€€€€€ô¤ì(€€€€€€€ô((€€€€€€€É•¥ÍÑ•É9A½µµ…¹ ¡•±Àœ°µÍœ€ôøì(€€€€€€€€€€€ÁÉ•Á…É•9A5…¹…•ÉÑ¥Ù¥Ñä ¤ì(€€€€€€€€€€€Í¡½İ9A5…¹…•É!•±À ¤ì(€€€€€€€ô¤ì((€€€€€€€É•¥ÍÑ•É9A½µµ…¹ Õ¥‘”œ°€ ¤€ôøì(