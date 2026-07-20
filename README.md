# GameAssist – Modular API Framework for Roll20

**Version 0.1.6.0 development line** | © 2025-2026 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

GameAssist v0.1.5.1 completed the integrated marker architecture and added DM-selected table time. The v0.1.6.0 development line introduces a native Turn Tracker service and InitiativeAssist for mixed D&D 5E 2014/2024 encounters without expanding into round or combat automation.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel, dedicated marker and Turn Tracker services, and nine bundled gameplay and administration modules—ConfigUI, CritFumble, ConditionAssist, TokenAssist, InitiativeAssist, ConcentrationTracker, NPCManager, NPCHPRoller, and DebugTools. It provides guided menus, guarded lifecycle controls, direct command and event routing, an explicit queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. The goal is campaign automation that remains approachable at the table and understandable when something needs attention.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, session metrics, dependency diagnostics, GM health reporting, and toggleable marker and Turn Tracker services with dependent-module safeguards. |
| Quick Install | 📥 Install the complete script → 📜 add the CritFumble tables if used → 🔄 reload → 🩺 run the health checks → 🎲 test the enabled features with disposable tokens. |
| Flagship Player Commands | `!condition <name>`, `!cond-<condition>`, `!concentration`, `!cc`, `!critfumble-<type>` when the GM permits the relevant player action. |
| Flagship GM Commands | `!Init-Menu`, `!Init-Go`, `!Init-RR`, `!token-assist help`, `!condition`, `!condition status`, `!critfumble menu`, `!critfail`, `!npc-hp-all`, `!npc-hp-selected`, `!npc-death-report --help`, `!npc-death-buckets`, `!NPC-WR`, `!npc-death-audit`, `!npc-death-repair`, `!npc-death-arc`, `!ga-conc-status`, `!ga-config ui`. |
| Admin Controls | `!ga-config list|get|set|modules|cleanup|ui|timezone`, `!ga-timezone`, `!ga-enable`, `!ga-disable`, `!ga-status`, `!ga-metrics`, and `!ga-debug`. |
| Table Time | `!ga-timezone` chooses a named IANA timezone, follows daylight-saving changes, and controls readable times plus date-managed NPC Sessions without rewriting stored event instants. |
| Queue Model | Normal commands/events run directly. Only `GameAssist.enqueue(...)` work and module transitions use the serialized queue. |
| Watchdog Limit | A timeout releases the explicit queue; it **cannot** terminate underlying JavaScript, `sendChat()`, or Roll20 operations. |
| State Safety | Repairs malformed known module containers while preserving valid config; unexpected branches warn until the GM explicitly runs cleanup. |
| Dependency Safety | Reports dependencies as `confirmed`, `missing`, or `unverifiable`; detection is best-effort. |
| Backup Utility | `!ga-config list` writes a versioned **configuration-only** snapshot. It is not a full-state backup and cannot yet be imported. |

> `!ga-debug` requires `!ga-enable DebugTools`. DebugTools is GM-only, disabled by default, and dry-run by default.

> **Required CritFumble Roll-Tables:** `CF-Melee`, `CF-Ranged`, `CF-Thrown`, `CF-Spell`, `CF-Natural`, `Confirm-Crit-Martial`, and `Confirm-Crit-Magic`.

---

## 2 · Table of Contents

> 3. [Overview](#3-overview) 4. [Quick Start](#4-quick-start) 5. [Deep-Dive Architecture](#5-deep-dive-architecture) 6. [Module Guides](#6-module-guides)

> 7. [Installation](#7-installation) 8. [Command Matrix](#8-command-matrix) 9. [Configuration Keys](#9-configuration-keys) 10. [Developer API](#10-developer-api)

> 11. [Roll-Table Cookbook](#11-roll-table-cookbook) 12. [Macro Recipes](#12-macro-recipes) 13. [Performance Benchmarks](#13-performance-benchmarks)

> 14. [Troubleshooting](#14-troubleshooting) 15. [Upgrade Paths](#15-upgrade-paths) 16. [Contributing](#16-contributing)

> 17. [Roadmap](#17-roadmap) 18. [Changelog](#18-changelog) 19. [Glossary](#19-glossary) 20. [Licensing and Attribution](#20-licensing-and-attribution)

---

## 3 · Overview <a id="3-overview"></a>

GameAssist’s kernel and bundled modules expose:

* **Direct Event & Command Routing** – normal Roll20 events and API commands execute directly through guarded handlers. GameAssist captures Roll20’s native `on` function once and does not replace global `on` or `off`.
* **Explicit Task Queue** – future modules may submit selected work through `GameAssist.enqueue(...)` when serialized execution is genuinely useful.
* **Queue Watchdog** – observes the explicit queue and releases it after stalled jobs time out. It cannot kill the timed-out operation itself.
* **State Manager** – stores namespaced module data under `state.GameAssist.<Module>` and repairs missing or malformed known `config` and `runtime` containers.
* **State Auditor** – warns about unknown branches without deleting them automatically. The GM chooses whether to remove them with `!ga-config cleanup`.
* **Metrics Board** – records command, event, queue, error, toggle, and audit activity. View current health with `!ga-status` and persisted session details with `!ga-metrics`.
* **Guarded Component Toggles** – `!ga-enable` and `!ga-disable` control feature modules and core services without depending on a Roll20 `off()` API.
* **Compatibility Audit** – optional, debug-only overlap hints for popular scripts such as TokenMod, ScriptCards, and APILogic.
* **Dependency Diagnostics** – module dependencies are reported as confirmed, missing, or unverifiable instead of being presented as guaranteed discoveries.
* **Table Timezone** – the GM can choose a validated city/region timezone for status panels, logs, handouts, history, and date-managed NPC Sessions. Named timezones follow daylight-saving changes; saved event instants remain absolute.
* **MarkerService** – `GameAssist.MarkerService` resolves built-in and custom markers, supplies artwork metadata when Roll20 exposes it, preserves unrelated and numbered marker state, applies explicit add/remove/toggle operations, and exposes one observation contract. It can be disabled when another Mod needs exclusive control of marker behavior; GameAssist then turns off MarkerService-dependent modules while leaving unrelated modules available.
* **TurnTrackerService** – `GameAssist.TurnTrackerService` reads, classifies, observes, and safely writes Roll20's native Turn Tracker while preserving custom entries, unknown fields, duplicate token turns, text priorities, and rows owned by other tools. Disabling it leaves the tracker unchanged and turns off InitiativeAssist.
* **ConditionAssist** – supplies 2014 SRD condition wording by default, optional 2024 SRD wording, campaign-editable descriptions, case-insensitive `!cond-<condition>` quick references, marker artwork, an accurate selected-token menu, a GM current-page condition/marker status roster, verified marker-toggling announcements in public chat or player whispers, add/remove/toggle commands, guarded player permissions, and marker-change descriptions. Every condition marker operation and observation goes through MarkerService.
* **TokenAssist** – provides general token controls through `!token-assist` and `!ta`/`!ta-*`, explicit-ID permissions, token-change observers, and MarkerService-backed status operations. Older supported `!token-mod` macros continue temporarily during v0.1.x and are not processed by GameAssist when standalone TokenMod is detected.
* **InitiativeAssist** – provides the case-insensitive `!Init-` command family for D&D 5E 2014 and 2024 characters, public player invitations, normal/advantage/disadvantage and bonus-die rolls, selective rerolls, encounter groups, audits, and preservation-first `!Init-RR`. It does not advance turns, count rounds, run timers, or automate combat flow.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that reports failures clearly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

| Step | What to do |
| --- | --- |
| 📥 **1 · Install** | Add GameAssist through Roll20 One-Click, or paste the complete `GameAssist.js` file into **Mod (API) Scripts**, then save. |
| 🧩 **2 · Choose Features** | Open `!ga-config ui` and keep only the tools that fit the campaign. MarkerService begins enabled for marker features; TurnTrackerService begins enabled so InitiativeAssist can be enabled when wanted. InitiativeAssist itself starts disabled. |
| 📜 **3 · Prepare CritFumble** | If CritFumble will be used, create the seven tables listed in [§11 · Roll-Table Cookbook](#11-roll-table-cookbook). Skip this step when CritFumble is disabled. |
| 🔄 **4 · Reload** | Save or restart the Mod sandbox and wait for the GameAssist core ready whisper. Module-by-module startup whispers are normally quiet. |
| 🩺 **5 · Check Health** | Run `!ga-status` and `!ga-config modules`. Confirm the features you enabled are running. |
| 🕰️ **6 · Set Table Time** | Open `!ga-timezone`, choose the city/region that governs the campaign clock, and confirm the displayed time and Session date. The sandbox default remains available. |
| 🎲 **7 · Try the Table Tools** | Test `!token-assist help`, `!condition help`, `!critfumble menu`, `!concentration --status`, `!npc-hp-selected`, and `!Init-Help` for the modules you use. |
| 🛡️ **8 · Verify Real Changes** | With disposable tokens, test one NPC death/revival, one concentration marker, and one mixed-character initiative reroll before the first live session. |

The `v0.1.5.x` line replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by GameAssist. It does not keep a hidden legacy path that sends GameAssist work back to those standalone scripts. Remove both standalone scripts before testing overlapping TokenAssist or ConditionAssist commands.

If MarkerService is deliberately disabled, ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools are also disabled. CritFumble, ConfigUI, and NPCHPRoller remain available. Standalone **TokenMod by The Aaron** and **StatusInfo by Robin Kuiper** can then provide their own token-marker and condition tools, but they do not restore GameAssist death-history, concentration, TokenAssist, or ConditionAssist features.

`GameAssist.flags.QUIET_STARTUP` defaults to `true`. Expect the core ready whisper, but not one ready message from every module.

### 4.1 Minimum Smoke Test

Run these commands after every update:

```roll20chat
!ga-status
!ga-config modules
!ga-timezone
!ga-config list
!ga-metrics
!token-assist help
!condition help
!condition
!condition status
!critfumble menu
!ga-enable InitiativeAssist
!Init-Menu
!Init-Status
!Init-Go
!Init-RR
!concentration --status
!npc-death-help
!npc-death-report
!npc-death-buckets
!npc-death-audit
!npc-death-repair
!npc-hp-selected
```

Then perform seven real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Select a disposable token, add and remove one condition, and confirm unrelated markers remain unchanged.
5. Select a disposable token and use one supported `!token-assist --set` or `--on` command.
6. Disable and re-enable one module or service.
7. Put a PC, a living NPC, and a custom round/counter row in Roll20's Turn Tracker; run `!Init-RR` and verify only the two characters reroll.

---

## 5 · Deep-Dive Architecture <a id="5-deep-dive-architecture"></a>

### 5.1 Runtime Pipeline

Normal Roll20 traffic follows a direct, guarded route:

```text
Roll20 event or API chat command
          ↓
GameAssist command/event wrapper
          ↓
Module initialized + active guard
          ↓
ACL / GM-only / command-boundary checks
          ↓
Module handler executes directly
          ↓
Metrics and error reporting
```

Serialized work is separate and explicit:

```text
Module calls GameAssist.enqueue(task, options)
          ↓
Priority-sorted explicit queue
          ↓
Task runs until complete or timeout
          ↓
Queue advances to the next task
```

Module enable/disable transitions also use the internal queue to prevent overlapping lifecycle changes.

Marker work follows a separate direct service path:

```text
NPCManager, ConcentrationTracker, DebugTools, or another consumer
          ↓
GameAssist.MarkerService resolves the configured marker
          ↓
Structured read/add/remove/toggle operation
          ↓
Only the requested marker state changes
          ↓
Roll20 change event is published to MarkerService observers
```

MarkerService is a toggleable core service rather than a gameplay module. Disabling one consumer leaves MarkerService available to the others. Disabling MarkerService itself first disables every dependent module, then closes the marker API while leaving unrelated GameAssist features available.

### 5.2 Why Normal Events Are Not Queued

Roll20 event handlers often perform small, immediate checks. Automatically routing every event through one queue would add latency, increase coupling, and create a single congestion point. In v0.1.5.0, ordinary handlers remain direct; modules opt into serialization only when their own work requires it.

### 5.3 Fail-Safe Scenarios

| Scenario | GameAssist Response | Important Limit |
| --- | --- | --- |
| Uncaught exception in a guarded module handler | Records an error and whispers the GM. Other handlers can continue. | It cannot repair arbitrary module logic. |
| Explicit queued task exceeds its timeout | Logs the timeout and releases the queue for later work. | It cannot cancel the underlying JavaScript or Roll20 operation. |
| Explicit queue remains busy beyond watchdog threshold | Watchdog releases the busy queue state and records a warning. | The original operation may still finish later. |
| Known module branch lacks valid `config` or `runtime` containers | Repairs the malformed containers while preserving valid configuration values. | It does not infer arbitrary missing custom values. |
| Unknown `state.GameAssist` branch is found | Warns and leaves it untouched. | Removal requires `!ga-config cleanup`. |
| Required external dependency is confirmed missing | Skips startup, preserves the DM's enabled setting, and reports the configured module as needing attention; a later manual enable is refused without changing the setting, while `!ga-disable` can still turn off the inactive module. | Discovery depends on metadata Roll20 exposes. |
| Dependency cannot be verified | Warns and proceeds without confirmation. | The GM must confirm the dependency manually. |

### 5.4 Persistent State Shape

```text
state.GameAssist
├─ config
├─ flags
├─ metrics
├─ MarkerService
│  ├─ config
│  └─ runtime
├─ ConfigUI
│  ├─ config
│  └─ runtime
├─ CritFumble
│  ├─ config
│  └─ runtime
├─ ConditionAssist
│  ├─ config
│  └─ runtime
├─ NPCManager
│  ├─ config
│  └─ runtime
├─ ConcentrationTracker
│  ├─ config
│  └─ runtime
├─ NPCHPRoller
│  ├─ config
│  └─ runtime
└─ DebugTools
   ├─ config
   └─ runtime
```

Module configuration belongs under `state.GameAssist.<Module>.config`. Runtime caches belong under the matching module’s `runtime` object.

### 5.5 Configuration Snapshot Shape

`!ga-config list` writes a `GameAssist Config` handout containing:

```json
{
  "format": "gameassist-config-snapshot",
  "schemaVersion": 1,
  "scope": "configuration-only",
  "generatedAt": "<ISO timestamp>",
  "version": "0.1.6.0",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v0.1.6.0 does not import or restore snapshots.

### 5.6 Table Timezone

Run `!ga-timezone` or `!ga-config timezone` to open the GM-only timezone menu. Choose a common region or enter a standard IANA name such as `America/New_York`, `Europe/London`, or `Australia/Sydney`. GameAssist validates the name before saving it and refuses an unsupported value without replacing the current setting.

The selected timezone controls human-facing GameAssist dates and times, including status panels, logs, configuration handouts, condition and NPC handouts, death/revival history displays, and the date used by automatically named NPC Sessions. Named regions follow daylight-saving changes automatically. `!ga-timezone clear` restores the Roll20 sandbox clock.

GameAssist stores event instants as absolute ISO timestamps. Changing the table timezone changes how those instants are displayed; it does not move or rewrite the underlying events. A date-managed NPC Session updates immediately when the timezone setting crosses a date boundary and continues checking before NPCManager activity. A deliberately named Session remains unchanged until the DM uses **Reset Session Date**.

---

## 6 · Module Guides <a id="6-module-guides"></a>

### 6.1 CritFumble

CritFumble watches common attack and damage roll templates for a natural 1 and offers a player-targeted fumble menu. Calling `!critfumble menu` opens the guided Natural 1 dialogue; `!critfail` opens the direct GM-facing player picker.

Recognized templates include:

```text
atk, atkdmg, npcatk, npcfullatk, npcaction, spell, simple, dmg, default
```

Commands:

* `!critfumble` / `!critfumble help` → Whisper a quick reference with setup table names and a button to open the guided menu.
* `!critfumble menu` → Whisper the guided Natural 1 dialogue with player-picker, direct-roll, and confirm-roll buttons.
* `!critfail` → Open the direct manual player picker.
* `!critfumble-melee|ranged|thrown|spell|natural` → Roll the selected fumble table.
* `!confirm-crit-martial` / `!confirm-crit-magic` → Roll the matching confirmation table.

Internal player-targeted button syntax:

```text
!critfumblemenu --pid <playerId>
```

Config keys: `debug`, `useEmojis`, `rollDelayMs`.

### 6.2 ConditionAssist

> **Module version:** `1.0.1`

ConditionAssist gives the table a readable condition reference and a marker-backed selected-token menu. It defaults to the fifteen SRD 5.1 conditions used by the 2014 rules, including Exhaustion rather than Inspiration. The GM can switch the official descriptions to SRD 5.2.1 wording for the 2024 rules or edit any description for campaign-specific wording. Open `!condition` after selecting tokens to see their active configured conditions and toggle another condition with one click. Use `!condition status` to review every linked character or NPC on the current player page that has a configured condition or another active marker. Select linked character tokens and use `!condition announce`, `!c-a`, or `!cond-!` to toggle a condition marker and report the verified result publicly or to their player controllers. `!condition help` is the quick-start guide.

Common commands:

* `!condition` → Open the selected-token condition menu.
* `!condition status` or `!condition --status` → Show a GM-only current-page summary of configured conditions and other active markers, and update the complete `GameAssist Condition Status` handout.
* `!condition help` → Open the quick-start guide.
* `!condition <name>` → Show one configured condition description.
* `!cond-<condition>` → Show the same description with a case-insensitive short reference command, such as `!cond-prone`, `!COND-EXHAUSTION`, or a DM-cr…18290 tokens truncated… limitations → Architecture and Troubleshooting;
* release behavior → Changelog and Upgrade Paths.

---

## 17 · Roadmap <a id="17-roadmap"></a>

The roadmap is directional, not a promise. Items are labeled so implemented features are not mistaken for future work and future ideas are not mistaken for current behavior.

### 17.1 Current Status

| Item | Status in v0.1.6.0 | Notes |
| --- | --- | --- |
| MarkerService | **Implemented and accepted** | One toggleable service owns GameAssist marker resolution, mutation, preservation, and observation. Disabling it turns off dependent modules without disabling unrelated features. |
| Bundled marker consumers | **Migrated** | NPCManager 1.3.0, ConcentrationTracker 0.2.0, and DebugTools 0.2.0 no longer require standalone TokenMod. |
| ConditionAssist 1.0.1 | **Implemented and accepted** | Condition references with `!condition` and case-insensitive `!cond-<condition>` commands, accurate selected-token recognition, current-page condition/marker status, selectable 2014/2024 SRD wording, campaign edits, marker artwork, verified marker-toggling announcements, validated legacy import, and MarkerService synchronization. |
| TokenAssist 1.0.1 | **Implemented and accepted** | General token controls with `!token-assist` and `!ta`/`!ta-*` commands, temporary support for older `!token-mod` macros, MarkerService-backed markers, token-change observation, clear compatibility limits, and duplicate-install protection. |
| Integrated architecture stabilization | **Complete** | Upgrade, migration, lifecycle, command, marker, documentation, and Roll20 sandbox checks passed under Issues #28 and #29. |
| DM-configurable timezone | **Implemented; focused acceptance passed** | One validated table timezone controls readable timestamps and date-managed NPC Sessions while stored event instants remain absolute. The complete live module suite was not rerun for v0.1.5.1. |
| TurnTrackerService 1.0.0 | **Implemented; local acceptance passed** | Toggleable native-tracker snapshots, structural row classification, guarded lossless writes, observations, and dependency cascading. Roll20 sandbox acceptance remains required. |
| InitiativeAssist 1.0.0 | **Implemented; local acceptance passed** | Mixed 2014/2024 initiative, public player invitations, roll options, selective rerolls, encounter groups, status, and audit through the case-insensitive `!Init-` namespace. Roll20 sandbox acceptance remains required. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| NPC death history | **Implemented** | Four-level handouts, Arc management, report writer, date-managed Sessions, and MarkerService-backed death markers. |
| Native Mord character-sheet support | **Deferred** | Begin after the complete v0.1.5.0 marker, token, and condition architecture is stable. |

### 17.2 Current Candidate: InitiativeAssist Sandbox Acceptance

The v0.1.6.0 candidate must pass the dedicated TurnTrackerService and InitiativeAssist checks in `Smoketest.md`, including mixed 2014/2024 encounters, player permissions, custom-row preservation, dead/mismatch handling, observer mode, and coexistence checks. The native Roll20 sandbox remains the release gate.

### 17.3 Later Candidate: Compatibility-First Bridge Character Sheet

With the `v0.1.5.0` integrated architecture accepted in Roll20, the recommended character-sheet project is a bridge sheet that:

* preserves existing GameAssist command behavior,
* exposes reliable attributes for linked-token modules,
* defines clear NPC, HP-formula, save-bonus, and roll-template contracts,
* avoids requiring another broad GameAssist kernel rewrite.

This is a separate project and is not implemented in v0.1.5.0.

### 17.4 Deferred GameAssist Features

1. **CombatAssist**
   * Start, pause, resume, and end encounter flow.
   * Own rounds, turns, duration countdowns, end-of-turn controls, and current-turn presentation.
   * Build on accepted TurnTrackerService behavior without moving combat ownership into InitiativeAssist.

2. **Spell-Specific Concentration Integration**
   * Detect concentration spell casts.
   * Track spell name, duration, expiration, and optional reminders.
   * Clear concentration under explicitly defined conditions.

3. **Expanded Module Suite**
   * Cooldown tracker.
   * Encounter assistant.
   * Resource tracker.
   * Condition automator.
   * Rest and recovery tools.
   * Dynamic location/AoE helpers.

4. **Plugin Registry and Discovery**
   * A validated extension contract for third-party modules.
   * No promise of filesystem-style “drop-in folders,” because Roll20’s sandbox does not expose a normal plugin directory.

5. **Configuration and State Restore**
   * Validated snapshot import.
   * Migration rules and preview/dry-run behavior.
   * Explicit handling for runtime caches, metrics, and unknown branches.

6. **Rollable-Table Import/Export**
   * Shareable table formats with validation and collision behavior.

7. **Verbose Diagnostics**
   * Runtime-controlled detail without leaking unsafe or excessively noisy data.

8. **Documentation and Community Resources**
   * More macro recipes.
   * Additional table examples.
   * Campaign-tested compatibility notes.

### 17.5 Explicit Non-Goals for v0.1.6.0

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No automatic round counter, turn advancement, duration timer, end-of-turn command, encounter lifecycle, CombatAssist module, plugin loader, Rest Manager, or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v0.1.6.0 – Native Initiative Foundation *(in development)*

* Added toggleable `TurnTrackerService 1.0.0` as the single GameAssist authority for native Turn Tracker snapshots, structural row classification, guarded writes, and observations.
* Added disabled-by-default `InitiativeAssist 1.0.0` with the case-insensitive `!Init-` namespace, mixed D&D 5E 2014/2024 modifier adapters, public player invitations, normal/advantage/disadvantage and bonus-die options, selective rerolls, encounter groups, status, and audit handout.
* Added `!Init-RR` to reroll each unique eligible PC and living NPC once while retaining custom rows, counters, objects, dead NPCs, mismatches, stale references, off-page rows, duplicate metadata, and unknown fields.
* Added Manager and Observer modes for deliberate coexistence with other initiative or combat tools.
* Kept round counting, turn advancement, timers, durations, current-turn visuals, and encounter lifecycle outside InitiativeAssist and deferred them to CombatAssist.
* Added compatibility diagnostics and a dedicated mixed-sheet local harness; live Roll20 sandbox acceptance remains pending.

### v0.1.5.1 – DM-Configurable Table Time

* Added the GM-only `!ga-timezone` menu and `!ga-config timezone` entry point with common region buttons, validated custom IANA names, and a sandbox-default option.
* Added timezone visibility to `!ga-status` and ConfigUI.
* Applied the selected timezone to human-facing logs, status panels, configuration output, handout update times, concentration records, NPC death/revival history, bucket reports, Arc reports, and date-managed Session names.
* Advanced NPCManager to `1.3.0` and ConfigUI to `0.2.0`.
* Preserved absolute ISO event timestamps; changing the timezone changes presentation and future date boundaries without rewriting recorded instants.
* Added DST, midnight-boundary, reload-persistence, invalid-input, historical-rendering, and custom-Session retention tests.

### v0.1.5.0 – Integrated Token and Condition Architecture

* Added `[GAMEASSIST:CORE:MARKERSERVICE]` and exposed `GameAssist.MarkerService` as a toggleable core service.
* Centralized built-in/custom marker resolution, exact stored-tag fallback, structured reads, add/remove/toggle/set operations, numbered markers, duplicate handling, and observations.
* Migrated NPCManager, ConcentrationTracker, and DebugTools away from chat-generated TokenMod requests.
* Removed standalone TokenMod dependency gating from bundled marker consumers.
* Added service dependency safeguards: disabling MarkerService first disables its dependent modules and leaves unrelated GameAssist modules available.
* Added `[GAMEASSIST:MODULES:CONDITIONASSIST]` and advanced the unreleased `GameAssist.ConditionAssist` to 1.0.1 with guided `!condition` menus, accurate active-condition recognition, a GM current-page condition/marker status roster, case-insensitive `!cond-<condition>` quick references, 2014/2024 SRD wording profiles, campaign-custom descriptions, built-in/custom marker artwork, verified marker-toggling public/player-whisper announcements, add/remove/toggle actions, configurable definitions, and guarded player permissions.
* Added validated, non-destructive migration from `state.STATUSINFO`, bounded ConditionAssist import/export, protected configuration maps, standalone StatusInfo warnings, and numbered/custom marker support through MarkerService.
* Added `[GAMEASSIST:MODULES:TOKENASSIST]` and exposed `GameAssist.TokenAssist` 1.0.1 with `!token-assist` and `!ta`/`!ta-*` commands, common token/bar/aura/vision/light/movement/report operations, explicit-ID authorization, legacy configuration import, and token-change observation.
* Pinned TokenAssist's TokenMod reference to release `0.8.88`, Roll20 repository commit `9d634d3149985dcf10333920b3f4c41f215f39fc`, and blob `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`; preserved the applicable MIT notice and no-endorsement boundary.
* Routed every TokenAssist status-marker command through MarkerService; kept older `!token-mod` syntax temporarily during v0.1.x, left that syntax to standalone TokenMod when detected, and kept TokenAssist commands available.
* Fixed aura acceptance examples to set a visible radius, color, and circle shape; normalized aura option aliases and prevented movement trails from reconnecting to stale pre-command origins.
* Preserved compatible settings from earlier v0.1.5.0 development builds while leaving malformed or unrelated unknown state available for the warning-only auditor.
* Advanced NPCManager to `1.2.1`, adding a separate preview/confirm marker-repair command while keeping audits read-only; ConcentrationTracker and DebugTools remain at `0.2.0`.
* Preserved existing module commands, configuration keys, death history, concentration runtime data, and unrelated token markers.
* Completed integrated-architecture stabilization, upgrade verification, documentation review, artifact verification, and final Roll20 sandbox acceptance under Issues #28 and #29.

### v0.1.4.7 – Standalone TokenMod and StatusInfo Interoperability

* Added contract-aware TokenMod detection using its public observer interface and `API_Meta` version record before falling back to Roll20's script list.
* Routed NPCManager and ConcentrationTracker marker requests through TokenMod's documented `--api-as` path, removing any GameAssist requirement for `players-can-ids`.
* Added delayed marker-result verification with an actionable direct TokenMod command when the requested state is not reached.
* Preserved mutation through standalone TokenMod so StatusInfo continues receiving TokenMod observer notifications.
* Added TokenMod and optional StatusInfo version/configuration evidence to `!ga-status --details`.
* Advanced NPCManager to `1.1.1` and ConcentrationTracker to `0.1.0.6`.
* Prevented NPCHPRoller auto-roll-on-add token setup from creating a false NPC death/revival pair while preserving later genuine HP transitions.

### v0.1.4.6 – DM-Readable System Status

* Rebuilt `!ga-status` around overall health, enabled-module posture, current-sandbox errors, and plain-language dependency guidance.
* Added `!ga-status --details` for session counters, queue state, average queued-task time, last activity, and the qualified internal event-hook count.
* Removed the malformed `N/Ams` duration display; unavailable duration now appears as `N/A` with an explanation.
* Added direct buttons for troubleshooting details, module status, metrics, and settings.
* Kept `unverifiable` dependencies non-fatal and explained the appropriate manual marker check.

### v0.1.4.5 – NPCManager Death History and Report Management

* Added Campaign, Chapter, Section, and Session death-history buckets with one handout per named bucket.
* Advanced NPCManager to `1.1.0` with default Arc deduplication, deliberate duplicate override, removal controls, and last-addition undo.
* Added selected-only and nested hierarchical clear choices.
* Added date-managed Session rollover before NPCManager activity.
* Added the `!NPC-WR` report writer and “new Section from current Session” workflow.
* Rebuilt `!npc-death-report --help` as the central NPCManager guide.

### v0.1.4.4 – DM-Facing Help and Audit Readability

* Separated the CritFumble quick reference, guided Natural 1 menu, and player picker.
* Grouped NPC death-audit results, stated audit scope and PC exclusion, and moved detailed mismatch rows to a handout.

### v0.1.4.3 – Concentration Marker Recognition

* Resolved custom marker display names to the exact tags Roll20 stores on tokens.
* Preserved literal lowercase built-in marker ids such as `dead`.
* Made `!concentration --status` report unrecognized marker configuration clearly.
* Sent resolved marker tags to TokenMod for concentration add/remove/teardown requests.
* Preserved standalone TokenMod as the v0.1.4.x marker-mutation dependency.
* Added focused concentration-marker checks to `Smoketest.md`.

### v0.1.4.2 – Diagnostic and Migration Readiness

* Added conservative state self-healing for known module branches.
* Preserved valid existing configuration during repairs.
* Kept unknown state branches warning-only; added explicit `!ga-config cleanup`.
* Added public opt-in `GameAssist.enqueue(task, options)`.
* Clarified queue timeout and watchdog limits.
* Added confirmed/missing/unverifiable dependency reporting.
* Added versioned configuration-only snapshots through `!ga-config list`.
* Expanded `!ga-status` with configured/running/skipped counts and dependency warnings.
* Documented `!npc-death-clear`, `!npc-death-audit`, `autoHide`, `hideLayer`, `dependsOn`, and command matching options.
* Preserved normal direct event execution and the six bundled module implementations.

### v0.1.4.1 – MECHSUITS and Stability Foundation

* Established v0.1.4 as the behavioral baseline for the stability release.
* Incorporated selected fixes from unreleased v0.1.5 development.
* Hardened shared utilities, marker handling, timestamps, state/runtime helpers, and lifecycle behavior.
* Preserved Roll20’s captured native `on` strategy.
* Structured the executable file around MECHSUITS v1.5.2 requirements.

For the current verification checklist, see `Smoketest.md`.

---

## 19 · Glossary <a id="19-glossary"></a>

* **API Command**  
  A chat message beginning with `!` that a Roll20 Mod/API script can handle, such as `!ga-status`.

* **Command Boundary**  
  The rule that a command must end or be followed by whitespace. It prevents `!ga-status-extra` from accidentally matching `!ga-status`.

* **Command Handler**  
  A function registered through `GameAssist.onCommand(...)` to respond to an API command.

* **Configured Module**  
  A module whose stored `enabled` configuration is not false. It may still be stopped if initialization failed or a dependency is missing.

* **Confirmed Dependency**  
  A dependency GameAssist could positively identify as available.

* **Configuration-Only Snapshot**  
  The versioned handout produced by `!ga-config list`. It excludes runtime caches and metrics and cannot currently be imported.

* **Direct Handler**  
  A normal command/event handler that runs immediately rather than being placed on the explicit queue.

* **Event Handler**  
  A function registered through `GameAssist.onEvent(...)` that responds to a Roll20 event, such as a token HP change.

* **Explicit Queue**  
  The serialized task queue used only when code calls `GameAssist.enqueue(...)` or performs a module lifecycle transition.

* **Kernel**  
  The shared GameAssist core that manages registration, lifecycle controls, metrics, state helpers, dependency diagnostics, logging, and the explicit queue.

* **Marker**  
  A Roll20 token status icon or named status entry, such as `dead` or `Concentrating`.

* **MECHSUITS**  
  The project’s human-readable, assistant-ready code-structure standard. It governs banners, framed sections, nesting, contracts, update notes, and whole-section replacement.

* **Missing Dependency**  
  A dependency GameAssist could confirm is absent. Dependent modules are skipped or refused enablement.

* **Module**  
  A self-contained GameAssist feature registered with a unique name, initializer, metadata, and optional teardown.

* **Persistent State**  
  Data under `state.GameAssist` that survives API sandbox reloads.

* **Roll-Table / Rollable Table**  
  A Roll20 table containing weighted outcomes. CritFumble rolls named tables to produce results.

* **Running Module**  
  A module that is initialized and active in the current sandbox.

* **Runtime Cache**  
  Module-owned operational data stored under `state.GameAssist.<Module>.runtime`. Runtime data is excluded from configuration snapshots.

* **State Self-Healing**  
  Conservative repair of missing or malformed containers for known module branches. It does not delete unknown branches or infer arbitrary data.

* **Teardown Function**  
  An optional function called during module disablement to perform module-specific cleanup.

* **TokenAssist**
  GameAssist's general token-control module. It uses `!token-assist` and `!ta`/`!ta-*` commands and delegates status-marker behavior to MarkerService.

* **Unverifiable Dependency**  
  A dependency whose presence GameAssist could not confirm because Roll20 did not expose enough metadata. GameAssist warns and proceeds.

* **Watchdog**  
  A periodic observer for the explicit queue. It can release stalled queue state but cannot terminate running JavaScript or Roll20 operations.


---

## 20 · Licensing and Attribution <a id="20-licensing-and-attribution"></a>

Original GameAssist code is developed and maintained by Mord Eagle under the MIT License in [`LICENSE`](LICENSE). Third-party credits, source references, and required license notices are preserved in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and the executable source.

### MarkerService

`GameAssist.MarkerService` provides the shared marker mechanics used by GameAssist. Its compatibility goals were informed by TokenMod's established Roll20 marker behavior.

### Token and Condition Credits

**TokenAssist** builds on token-control concepts established by **TokenMod 0.8.88**, created by **The Aaron, Arcane Scriptomancer**. **ConditionAssist** builds on condition-menu and marker-description concepts established by **StatusInfo**, created by **Robin Kuiper**. GameAssist preserves the applicable MIT notices and exact source references in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md).

ConditionAssist includes condition wording derived from SRD 5.1 for the 2014 profile and SRD 5.2.1 for the 2024 profile under the Creative Commons Attribution 4.0 International License. It does not reproduce non-SRD sourcebook text.

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) for public acknowledgments, upstream links, license notices, and SRD guidance.

> **Tip:** After an update, use the current smoke test to confirm the enabled features in the campaign's own Roll20 sandbox.
