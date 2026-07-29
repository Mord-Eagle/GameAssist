# GameAssist – Modular API Framework for Roll20

**Version 2.0.0 development line** | © 2025-2026 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

GameAssist v2.0.0 introduces EffectAssist: a disabled-by-default, catalog-driven effect coordinator for the official D&D 5E by Roll20 2014 sheet. Its first catalog covers Bless, Guidance, Gift of Alacrity, Warding Bond, Holy Weapon, Haste, Longstrider, Pass Without a Trace, and Beacon of Hope. EffectAssist records each source and target, applies the mechanics Roll20 can represent safely, identifies the remaining table steps, and removes only the marker, condition, concentration, or sheet state that it can prove it owns.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel, dedicated marker and Turn Tracker services, a versioned semantic-event contract, and twelve bundled gameplay and administration modules—ConfigUI, CritAssist, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, WelcomeAssist, ConcentrationAssist, NPCAssist, EffectAssist, HPAssist, and DebugTools. It provides guided menus, guarded lifecycle controls, direct command and event routing, an explicit queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. The goal is campaign automation that remains approachable at the table and understandable when something needs attention.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, versioned semantic events, session metrics, dependency diagnostics, GM health reporting, and toggleable marker and Turn Tracker services with dependent-module safeguards. |
| Quick Install | 📥 Install the complete script → 📜 add the CritAssist tables if used → 🔄 reload → 🩺 run the health checks → 🎲 test the enabled features with disposable tokens. |
| Flagship Player Commands | `!condition <name>`, `!cond-<condition>`, `!concentration`, `!cc`, `!critfumble-<type>` when the GM permits the relevant player action. |
| Flagship GM Commands | `!Init-GM` / `!Init-DM`, `!Combat-GM` / `!Combat-DM`, `!Welcome-GM` / `!Welcome-DM`, `!TokenAssist-GM` / `!TokenAssist-DM`, `!Condition-GM` / `!Condition-DM`, `!CritAssist-GM` / `!CritAssist-DM`, `!NPC-GM` / `!NPC-DM`, `!Con-GM` / `!Con-DM`, `!Effect-GM` / `!Effect-DM`, plus each module's specialized commands below. |
| Admin Controls | `!ga-config list|get|set|modules|cleanup|ui|timezone`, `!ga-timezone`, `!ga-enable`, `!ga-disable`, `!ga-status`, `!ga-metrics`, and `!ga-debug`. |
| Table Time | `!ga-timezone` chooses a named IANA timezone, follows daylight-saving changes, and controls readable times plus date-managed NPC Sessions without rewriting stored event instants. |
| Queue Model | Normal commands/events run directly. Only `GameAssist.enqueue(...)` work and module transitions use the serialized queue. |
| Watchdog Limit | A timeout releases the explicit queue; it **cannot** terminate underlying JavaScript, `sendChat()`, or Roll20 operations. |
| State Safety | Repairs malformed known module containers while preserving valid config; unexpected branches warn until the GM explicitly runs cleanup. |
| Dependency Safety | Reports dependencies as `confirmed`, `missing`, or `unverifiable`; detection is best-effort. |
| Backup Utility | `!ga-config list` writes a versioned **configuration-only** snapshot. It is not a full-state backup and cannot yet be imported. |

> `!ga-debug` requires `!ga-enable DebugTools`. DebugTools is GM-only, disabled by default, and dry-run by default.

> **Required CritAssist Roll-Tables:** `CF-Melee`, `CF-Ranged`, `CF-Thrown`, `CF-Spell`, `CF-Natural`, `Confirm-Crit-Martial`, and `Confirm-Crit-Magic`.

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
* **TurnTrackerService** – `GameAssist.TurnTrackerService` reads, classifies, observes, and safely writes Roll20's native Turn Tracker while preserving custom entries, unknown fields, duplicate token turns, text priorities, and rows owned by other tools. Disabling it leaves the tracker unchanged and turns off InitiativeAssist and CombatAssist.
* **SemanticEvents** – `GameAssist.SemanticEvents` publishes immutable, versioned, in-sandbox domain notifications for optional module integrations. Delivery is direct, ordered, non-persistent, and non-replayed; one observer failure cannot interrupt another.
* **ConditionAssist** – supplies 2014 SRD condition wording by default, optional 2024 SRD wording, campaign-editable descriptions, case-insensitive `!cond-<condition>` quick references, marker artwork, an accurate selected-token menu, a GM current-page condition/marker status roster, verified marker-toggling announcements in public chat or player whispers, add/remove/toggle commands, guarded player permissions, and marker-change descriptions. Every condition marker operation and observation goes through MarkerService.
* **TokenAssist** – provides general token controls through `!token-assist` and `!ta`/`!ta-*`, explicit-ID permissions, token-change observers, and MarkerService-backed status operations. Older supported `!token-mod` macros remain compatibility aliases during v1.x and are not processed by GameAssist when standalone TokenMod is detected.
* **InitiativeAssist** – provides the case-insensitive `!Init-` command family for D&D 5E 2014 and 2024 characters, public player invitations, composable roll options, detailed dice/formula results, score-aware optional narration, selective rerolls, encounter groups, audits, and preservation-first `!Init-RR`. It does not advance turns or own encounter rounds.
* **CombatAssist** – provides the case-insensitive `!Combat-` command family as an optional layer over Roll20's native Turn Tracker. Native arrows remain available; a recognized native round-counter row can own the round number, while guarded movement, stale-safe timers, native pings, private player prompts, preserved-round maintenance, and one-step recovery add convenience. TurnTrackerService is required for tracker access; timers never advance initiative and pings never alter tokens.
* **WelcomeAssist** – optionally posts one delayed table greeting after GameAssist completes a healthy startup. It starts disabled, offers professional, built-in table-humor, campaign-custom, and mixed greeting modes, keeps configuration and previews private to the GM, and uses the short case-insensitive `!Welcome` / `!Welcome-Action` command family.
* **EffectAssist** – starts disabled and coordinates a catalog of source-aware effects for the official 2014 sheet. Bless receives automatic 1d4 global attack and saving-throw rows, a target marker, source concentration, and linked cleanup; Warding Bond and Haste receive their ownership-safe sheet modifiers; all nine launch effects receive tracked lifecycles with automatic, assisted, and informational steps stated plainly. Overlapping sources remain independently removable, pre-existing state remains campaign-owned, and audit never writes without fresh confirmation.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that reports failures clearly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

| Step | What to do |
| --- | --- |
| 📥 **1 · Install** | Add GameAssist through Roll20 One-Click, or paste the complete `GameAssist.js` file into **Mod (API) Scripts**, then save. |
| 🧩 **2 · Choose Features** | Open `!ga-config ui` and keep only the tools that fit the campaign. MarkerService and TurnTrackerService begin enabled; InitiativeAssist, CombatAssist, WelcomeAssist, and EffectAssist begin disabled until the GM deliberately configures them. |
| 📜 **3 · Prepare CritAssist** | If CritAssist will be used, create the seven tables listed in [§11 · Roll-Table Cookbook](#11-roll-table-cookbook). Skip this step when CritAssist is disabled. |
| 🔄 **4 · Reload** | Save or restart the Mod sandbox and wait for the GameAssist core ready whisper. Module-by-module startup whispers are normally quiet. |
| 🩺 **5 · Check Health** | Run `!ga-status` and `!ga-config modules`. Confirm the features you enabled are running. |
| 🕰️ **6 · Set Table Time** | Open `!ga-timezone`, choose the city/region that governs the campaign clock, and confirm the displayed time and Session date. The sandbox default remains available. |
| 🎲 **7 · Try the Table Tools** | Test `!token-assist help`, `!condition help`, `!critfumble menu`, `!concentration --status`, `!HP-Selected`, `!Init-Help`, `!Combat-Help`, `!Welcome`, and `!Effect-Guide` for the modules you use. |
| 🛡️ **8 · Verify Real Changes** | With disposable tokens, test one NPC death/revival, one concentration marker, and one mixed-character initiative reroll before the first live session. |

The `v0.1.5.x` line replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by GameAssist. It does not keep a hidden legacy path that sends GameAssist work back to those standalone scripts. Remove both standalone scripts before testing overlapping TokenAssist or ConditionAssist commands.

If MarkerService is deliberately disabled, ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools are also disabled. CritAssist, ConfigUI, InitiativeAssist, CombatAssist, WelcomeAssist, and HPAssist remain available. Standalone **TokenMod by The Aaron** and **StatusInfo by Robin Kuiper** can then provide their own token-marker and condition tools, but they do not restore GameAssist death-history, concentration, TokenAssist, or ConditionAssist features.

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
!Init-GM
!Init-RR
!ga-enable CombatAssist
!Combat-Help
!Combat-Start
!Combat-Status
!concentration --status
!npc-death-help
!npc-death-report
!npc-death-buckets
!npc-death-audit
!npc-death-repair
!HP-Selected
!ga-enable EffectAssist
!Effect-GM
!Effect-Status
!Effect-Audit
```

Then perform ten real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Select a disposable token, add and remove one condition, and confirm unrelated markers remain unchanged.
5. Select a disposable token and use one supported `!token-assist --set` or `--on` command.
6. Disable and re-enable one module or service.
7. Put a PC, a living NPC, and a custom round/counter row in Roll20's Turn Tracker; run `!Init-RR` and verify only the two characters reroll.
8. Start CombatAssist, move the native tracker through one complete forward cycle, move back once, remove or add one disposable combatant, and verify the round survives the native edit while row contents remain intact. Preview one restore before ending the test.
9. If WelcomeAssist will be used, enable it, preview a greeting, reload the sandbox, and verify exactly one public greeting appears.
10. With a linked 2014 PC source and target, apply Bless and verify its marker, the source's concentration marker, and `Bless (GameAssist)` rows under the target sheet's global attack and saving-throw modifiers. Clear concentration and verify all EffectAssist-owned Bless projections are removed. Repeat the overlap test with two sources before release approval.

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
NPCAssist, ConcentrationAssist, DebugTools, or another consumer
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
├─ TurnTrackerService
│  ├─ config
│  └─ runtime
├─ ConfigUI
│  ├─ config
│  └─ runtime
├─ CritAssist
│  ├─ config
│  └─ runtime
├─ ConditionAssist
│  ├─ config
│  └─ runtime
├─ TokenAssist
│  ├─ config
│  └─ runtime
├─ InitiativeAssist
│  ├─ config
│  └─ runtime
├─ CombatAssist
│  ├─ config
│  └─ runtime
├─ WelcomeAssist
│  ├─ config
│  └─ runtime
├─ NPCAssist
│  ├─ config
│  └─ runtime
├─ ConcentrationAssist
│  ├─ config
│  └─ runtime
├─ HPAssist
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
  "version": "1.8.1",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v2.0.0 does not import or restore snapshots.

### 5.6 Table Timezone

Run `!ga-timezone` or `!ga-config timezone` to open the GM-only timezone menu. Choose a common region or enter a standard IANA name such as `America/New_York`, `Europe/London`, or `Australia/Sydney`. GameAssist validates the name before saving it and refuses an unsupported value without replacing the current setting.

The selected timezone controls human-facing GameAssist dates and times, including status panels, logs, configuration handouts, condition and NPC handouts, death/revival history displays, and the date used by automatically named NPC Sessions. Named regions follow daylight-saving changes automatically. `!ga-timezone clear` restores the Roll20 sandbox clock.

GameAssist stores event instants as absolute ISO timestamps. Changing the table timezone changes how those instants are displayed; it does not move or rewrite the underlying events. A date-managed NPC Session updates immediately when the timezone setting crosses a date boundary and continues checking before NPCAssist activity. A deliberately named Session remains unchanged until the DM uses **Reset Session Date**.

---

## 6 · Module Guides <a id="6-module-guides"></a>

Every module now follows the same small navigation vocabulary through its established command family:

| Choice | What it opens |
| --- | --- |
| **Guide** or **Help** | A compact starting panel with the most useful actions. |
| **Menu**, **GM**, or **DM** | The module's main Game Master interaction screen. GM and DM are equal role aliases. |
| **Status** | A concise current-health or current-state summary. |
| **Info** | A short explanation of what the module does at the table. |
| **Audit** | A read-only inspection that explicitly says it changed nothing. |
| **Manual** | A stable `GameAssist Guide - <Module>` handout for modules with substantial workflows. Brief modules explain that their complete guidance already fits in chat. |

The exact prefix stays familiar to that feature: for example, `!critfumble guide`, `!condition audit`, `!npc-death-manual`, `!Init-Info`, and `!Welcome-Menu`. Commands are case-insensitive. An unrecognized command under a module's prefix explains the problem and offers an **Open Guide** button instead of failing silently. The GM and DM role aliases open the screen that best fits that module: for example, `!Init-GM` and `!Init-DM` open the private initiative roster, while `!Combat-GM` and `!Combat-DM` open CombatAssist's Control Center.

### 6.1 CritAssist

> **Module version:** `0.2.5.1`

CritAssist watches common attack and damage roll templates for a natural 1 and offers a player-targeted fumble menu. Calling `!critfumble menu` opens the guided Natural 1 dialogue; `!critfail` opens the direct GM-facing player picker.

Recognized templates include:

```text
atk, atkdmg, npcatk, npcfullatk, npcaction, spell, simple, dmg, default
```

Commands:

* `!critfumble` / `!critfumble help` → Whisper a quick reference with setup table names and a button to open the guided menu.
* `!crit` / `!CritAssist-<command>` → Use the shorter or canonical CritAssist command family for the same guide, menu, status, audit, manual, and roll actions.
* `!critfumble guide` → Open the same compact quick reference.
* `!critfumble menu` → Whisper the guided Natural 1 dialogue with player-picker, direct-roll, and confirm-roll buttons.
* `!critfail`, `!CritAssist-GM`, or `!CritAssist-DM` → Open the direct manual player picker for the Game Master.
* `!critfumble status` / `!critfumble audit` → Check the seven required rollable-table names; Audit is explicitly read-only.
* `!critfumble info` → Whisper the short module explanation.
* `!critfumble manual` → Create or update the stable CritAssist user-manual handout.
* `!critfumble-melee|ranged|thrown|spell|natural` → Roll the selected fumble table.
* `!confirm-crit-martial` / `!confirm-crit-magic` → Roll the matching confirmation table.

The established `!critfumble*`, `!critfail`, and `!CritFumble-GM|DM` forms remain compatibility aliases. New macros should prefer `!crit` or `!CritAssist-*` when a branded module name is useful.

Internal player-targeted button syntax:

```text
!critfumblemenu --pid <playerId>
```

Config keys: `debug`, `useEmojis`, `rollDelayMs`.

### 6.2 ConditionAssist

> **Module version:** `1.0.3`

ConditionAssist gives the table a readable condition reference and a marker-backed selected-token menu. It defaults to the fifteen SRD 5.1 conditions used by the 2014 rules, including Exhaustion rather than Inspiration. The GM can switch the official descriptions to SRD 5.2.1 wording for the 2024 rules or edit any description for campaign-specific wording. Open `!condition` after selecting tokens to see their active configured conditions and toggle another condition with one click. Use `!condition status` to review every linked character or NPC on the current player page that has a configured condition or another active marker. Select linked character tokens and use `!condition announce`, `!c-a`, or `!cond-!` to toggle a condition marker and report the verified result publicly or to their player controllers. `!condition help` is the quick-start guide.

Common commands:

* `!condition` → Open the selected-token condition menu.
* `!condition status` or `!condition --status` → Show a GM-only current-page summary of configured conditions and other active markers, and update the complete `GameAssist Condition Status` handout.
* `!condition help` / `guide` → Open the compact guide.
* `!condition menu`, `!Condition-GM`, or `!Condition-DM` → Open the selected-token condition menu for the Game Master.
* `!condition info` → Whisper the short module explanation.
* `!condition audit` → Inspect current-page condition markers without changing them.
* `!condition manual` → Create or update the stable ConditionAssist user-manual handout.
* `!condition <name>` → Show one configured condition description.
* `!cond-<condition>` → Show the same description with a case-insensitive short reference command, such as `!cond-prone`, `!COND-EXHAUSTION`, or a DM-created condition key.
* `!condition add <condition...>` → Add one or more conditions to selected tokens.
* `!condition remove <condition...>` → Remove conditions from selected tokens.
* `!condition toggle <condition...>` → Switch conditions on or off for selected tokens.
* `!condition announce`, `!c-a`, or `!cond-!` → Open a selected-character menu that toggles the chosen marker and reports the verified result publicly or by player whisper.
* `!condition config` → Open GM settings.
* `!condition config-conditions` → Add, edit, or remove condition definitions.
* `!condition config export` / `!condition config import <JSON>` → Export or apply a validated ConditionAssist configuration.
* `!condition reset` → Open a confirmation prompt before restoring defaults.

Player description access and player marker changes are separate settings. Both are off by default. The permanent `!condition` and `!cond-<condition>` commands remain available even when the GM configures an additional compatibility alias. A private **Read Exact Wording** button issued by the GM grants only that temporary reference; it does not enable unrestricted player commands.

The **Condition wording** setting offers **2014 SRD** and **2024 SRD** profiles. Switching profiles updates only the fifteen official condition names and descriptions: configured marker choices and additional campaign conditions are retained. Editing any description marks the wording source as **Campaign Custom**. Untouched ConditionAssist 1.0.0 defaults are upgraded to the complete 2014 list; previously edited or migrated definitions are preserved as custom wording.

Condition definitions store a display name, plain-language description, and a marker. A marker may be a built-in id, a custom display name, an exact stored `Name::id` tag, or a numbered value such as `red@3`. ConditionAssist uses MarkerService for every read, add, remove, toggle, and marker-change observation, so unrelated markers and number overlays remain intact. Built-in markers render from Roll20's status artwork. Registered custom markers use their campaign-library image URL when Roll20 exposes it; an exact tag without readable registry artwork falls back to the marker name.

The GM-only status workflow keeps chat readable while preserving the complete result. It lists configured conditions separately from other active markers, omits unmarked tokens, counts marked unlinked items separately, and updates the `GameAssist Condition Status` handout with every marked linked character or NPC on the current player page.

The announcement workflow is GM-only. Select up to twelve linked character tokens, open `!condition announce` or either shorthand, choose a configured official or custom condition, then choose a final public or player-whisper button. That final button toggles the marker once on every captured token, verifies the stored result, and gives each character a direct statement such as **Mira is Prone** or **Orin is no longer Prone**. Saved definitions named exactly **Concentration** are displayed as **Concentrating** while their stored key, marker, and description remain intact. Summary messages include an expiring **Read Exact Wording** button; exact-wording choices include the configured description immediately. If a marker change cannot be verified, that token is omitted from the success message and the GM receives the failure details.

On first startup, valid legacy `state.STATUSINFO` settings and condition definitions are copied into `state.GameAssist.ConditionAssist.config`. GameAssist keeps the original `state.STATUSINFO` branch for rollback and records what was imported. A separately installed StatusInfo script should then be removed or disabled because both tools respond to `!condition` and condition-marker changes.

Configuration imports are size-bounded, reject unsafe keys, validate every definition, and apply only after the entire payload passes. The protected `conditions`, `rulesProfile`, and migration-record maps cannot be replaced through generic `!ga-config set`; use the ConditionAssist settings menu and validated importer.

**StatusInfo compatibility boundary:** ConditionAssist preserves the principal condition-reference, artwork, menu, permission, definition, import/export, and marker-change workflows, but it is not a line-for-line replacement. StatusInfo's Shaped Character Sheet attribute synchronization is intentionally omitted because GameAssist currently targets Roll20's D&D 5E sheets and treats token markers as the condition source of truth. Legacy StatusInfo global helper names and observer callbacks are replaced by `GameAssist.ConditionAssist` and `GameAssist.MarkerService.observe(...)`. An optional custom command alias takes effect after the Mod sandbox reloads; permanent `!condition` and `!cond-<condition>` routes remain active.

Config keys: `command`, `rulesProfile`, `userAllowed`, `userToggle`, `sendOnlyToGM`, `showDescOnStatusChange`, `showIconInDescription`, and `conditions`.

### 6.3 TokenAssist

> **Module version:** `1.0.3`

TokenAssist provides general token controls without requiring standalone TokenMod. Use `!token-assist` for the full command name, `!ta` for a short form, or `!ta-<action>` for quick table commands such as `!ta-set` and `!ta-move`. Select one or more tokens before running a command. Players can affect tokens they can select, while direct `--ids` targeting remains GM-only unless the GM enables **Players can use --ids**.

Start here:

```roll20chat
!token-assist help
!TokenAssist-GM
!TokenAssist-DM
!token-assist status
!token-assist audit
!token-assist manual
!token-assist about
!ta-help
!ta-help-statusmarkers
```

Supported compatibility families:

* `--on <property...>` → Turn supported boolean token properties on.
* `--off <property...>` → Turn supported boolean properties off.
* `--flip <property...>` → Toggle supported boolean properties.
* `--set <property|value...>` → Set common names, tooltips, bars, auras, colors, layers, position, size, facing, vision, lighting, links, controllers, and markers.
* `--move <distance>` / `--move <angle|distance>` → Move relative to current facing or an absolute/relative angle. Supported units include `g`, `u`, and common page units.
* `--order tofront|toback` → Change token stacking order.
* `--report <recipient|message>` → Report token values with `{property}`, `{property:before}`, `{property:change}`, and `{property:abschange}` placeholders.
* `--ids <token-or-character-id...>` → Add explicit token or represented-character targets when authorized.
* `--ignore-selected`, `--current-page`, and `--active-pages` → Refine targeting.
* `--api-as <player-id>` → Preserve script-to-script authorization behavior for a command whose Roll20 sender is `API`.
* `--config players-can-ids|on|off` → GM control for player `--ids` use.

Examples:

```roll20chat
!ta-on showname
!ta-set name|"City Watch" bar1_value|25
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
!ta-set bar1_value|-5 left|+70
!ta-move 3g
!token-assist --set layer|gmlayer --order tofront
!ta-set statusmarkers|red:3|Warded;;1001;4
!ta-report gm|"{name}: {bar1_value:before} to {bar1_value}"
```

Relative numbers use `+`, `-`, `*`, or `/`. Use a leading `=` for exact assignment when a negative number might otherwise mean subtraction: `bar1_value|=-5`. Quoted text is required when a value contains spaces.

Status-marker syntax is handled only by MarkerService. An unprefixed name or `+name` adds a marker, `-name` removes it, `!name` toggles it, and `=name` replaces the complete marker list after the replacement resolves successfully. Use `red:3` for a number, a registered custom display name, or an exact `Name::id` tag. In Roll20 query/button syntax, `Name;;id;3` is accepted for a numbered custom tag. Unrelated markers and their numbers are preserved unless an explicit replacement is requested.

TokenAssist `1.0.3` focuses on the token controls GameAssist and most table macros use directly. Its current scope does not include image-side stack editing, default-token writes, computed or name-resolved attribute links, advanced controller-list editing, color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, separate `token`/`character`/`control` report-recipient behavior, duplicate-index marker operations, conditional marker counts, or TokenMod help-handout rebuilding. Unsupported operations return a clear warning before unrelated requested changes are applied.

That boundary keeps the first integrated release testable. Image stacks and default-token writes alter persistent token assets; computed attributes and controller-name editing require separate expression and identity-resolution rules; and color arithmetic, random side selection, advanced marker counts, and recipient distinctions add specialized parsers that none of GameAssist's current modules require. Those groups can be evaluated individually after the integrated architecture passes its Roll20 release gate. TokenAssist already supplies its own chat help, and integrations use `GameAssist.TokenAssist` rather than a global `TokenMod` object, so those two differences are intentional rather than unfinished compatibility work.

On first startup, TokenAssist copies a valid legacy `state.TokenMod.playersCanUse_ids` value into its own configuration. It records the migration and leaves `state.TokenMod` untouched for rollback. It does not expose a global `TokenMod` object; integrations should use `GameAssist.TokenAssist.observeTokenChange(...)` or MarkerService's marker observer.

Existing supported `!token-mod` macros remain compatibility aliases in v2.0.0, but new macros should use `!token-assist`, `!ta`, or `!ta-*`. Their eventual removal requires a separate announced migration release. When standalone TokenMod is detected, GameAssist leaves `!token-mod` to that script while TokenAssist commands remain available. Remove standalone TokenMod for normal v2.0.0 use because both tools can change the same token properties and markers.

Config keys: `playersCanUseIds`, `warnOnStandalone`, and the protected `configSchemaVersion`.

### 6.4 InitiativeAssist

> **Module version:** `1.0.4`<br>
> **Core service:** `TurnTrackerService 1.0.0`<br>
> **Default:** Disabled until the GM enables it.

InitiativeAssist works inside Roll20's native Turn Tracker and reads initiative for both **D&D 5E by Roll20 (2014)** and **D&D 2024 by Roll20** characters in the same encounter. The 2024 sheet uses Roll20's asynchronous Beacon/Computed access and may require the supported Experimental Mod API server. If 2024 initiative data cannot be read, GameAssist leaves that tracker row unchanged and explains the problem; it never substitutes zero.

Start here:

```roll20chat
!ga-enable InitiativeAssist
!Init-Help
!Init-Menu
!Init-Go
!Init-GM
!Init-DM
```

`!TokenAssist-GM` and `!TokenAssist-DM` open the same action-focused Game Master screen for the current token selection. `!token-assist help` and `!ta-help` remain the instructional guide.

All `!Init-` commands are case-insensitive. `!Init-Go` posts a direct public call for initiative; `!Init-Go!` uses a rotating set of light encounter announcements. `!Init-GM` and `!Init-DM` open the same neutral roll controls and complete encounter roster only for the Game Master, without posting an invitation to the table. The public calls offer **Roll Initiative**, **Roll Selected**, and **Roll Options**, then privately give the GM separate PC, object-layer NPC, and GM-layer NPC controls. The GM can roll everyone on the Objects layer, either NPC layer, or every living NPC across both layers. A player's controlled, linked token does not need to be in Turn Order first: InitiativeAssist finds it on the active encounter page, saves a page-owned Roll20 row, verifies the visible tracker data, and only then announces the result. Players who control several characters may select those tokens and use **Roll Selected**; every token's page, link, control, and eligibility are checked again before rolling. No Roll20 macro is required.

NPC roll details are **GM-only by default**, including the raw inline roll and the readable result panel. The GM can make object-layer NPC rolls public from the Control Center with `!Init-NPC-Rolls public`; `!Init-NPC-Rolls hidden` restores privacy. GM-layer NPC rolls always remain private, regardless of that setting. PC results remain public so the table can see player initiative normally.

**Roll Options are cumulative.** First choose normal, advantage, or disadvantage. Then optionally add a flat adjustment and zero, one, or two bonus dice. Common die buttons avoid typing; custom dice accept whole-number sides from 2 to 100. Advantage and disadvantage results show both d20s, followed by any bonus dice, the final total, and the complete formula, matching ConcentrationAssist's readable evidence style. Results requested through `!Init-Go!` also receive varied narration selected from six score ranges, from being caught unready at 5 or less to appearing to act before combat began at 35 or more. `!Init-Go` remains neutral and direct.

The in-game screens have separate jobs: the **Guide** is a compact starting page whose topic buttons open focused reference panels, the **Control Center** contains encounter actions, the **Status Summary** provides a quick check, and the **Detailed Review** reports tracker and page details privately in chat without creating a campaign handout.

GM commands:

* `!Init-Menu` → Open the Initiative Control Center for encounter actions.
* `!Init-Help` → Open the InitiativeAssist Guide.
* `!Init-Status` → Open the quick Status Summary for PCs, NPCs, preserved rows, and items needing attention.
* `!Init-Go` / `!Init-Go!` → Invite players to roll, then whisper the GM an encounter roster with individual and batch controls.
* `!Init-GM` / `!Init-DM` → Open the neutral initiative controls and complete encounter roster only for the Game Master.
* `!Init-Roll-Selected` → Roll every eligible selected character controlled by the clicking GM or player, including characters not yet in Turn Order.
* `!Init-Start --scope all|npc|gm-npc|all-npc` → Add or update eligible object-layer characters, object-layer NPCs, GM-layer NPCs, or NPCs across both layers; normally used through the GM roster buttons.
* `!Init-NPC-Rolls hidden|public` → Keep object-layer NPC roll details GM-only or make them public. GM-layer rolls always remain private.
* `!Init-RR` → Reroll every unique PC and living NPC already in the tracker, then whisper the bounded result summary to the GM.
* `!Init-RR-Menu` → Reroll only PCs, living NPCs, selected tokens, one character, or a saved encounter group.
* `!Init-Group` → Create, review, rename, reroll, or remove page-scoped encounter groups built from selected tracker tokens.
* `!Init-Audit` → Show a detailed, read-only GM chat review of current tracker rows and linked characters not yet in Turn Order.
* `!Init-Info` → Whisper the short InitiativeAssist explanation.
* `!Init-Manual` → Create or update the stable InitiativeAssist user-manual handout.
* `!Init-Mode observer|manager` → Choose read-only coexistence or InitiativeAssist-owned writes.

`!Init-RR` rolls once per unique eligible token. Duplicate occurrences receive the same result. Custom rows, counters, objects, dead NPCs, HP/death-marker mismatches, stale references, off-page tokens, unsupported sheets, and unreadable 2024 entries are not rerolled or repositioned. Eligible rows sort only among the positions InitiativeAssist owns, so a round counter or another Mod's custom entry stays exactly where the GM placed it.

InitiativeAssist deliberately stops at initiative. CombatAssist owns deliberate encounter lifecycle, exact turn movement, native or conservative round counting, optional turn timers, and native current-turn pings. Condition-duration countdowns and automatic end-of-turn effects remain outside both modules in v2.0.0.

Config keys: `enabled`, `mode` (`manager` or `observer`), `hideNpcRolls` (default `true`).

### 6.5 CombatAssist

> **Module version:** `1.0.5`<br>
> **Core service:** `TurnTrackerService 1.0.0`<br>
> **Default:** Disabled until the GM enables it.

CombatAssist manages the flow of an encounter after initiative has been established. It observes Roll20's native Turn Tracker rather than replacing it: the GM can continue using Roll20's ordinary arrows, add or remove combatants, reorder entries, and reroll initiative. CombatAssist starts only when the GM asks it to start and never treats an open tracker as proof that combat has begun.

CombatAssist has one **hard prerequisite**: TurnTrackerService, because every tracker read and write uses that shared authority. Baseline InitiativeAssist and CombatAssist operation remains independent. A future optional feature may connect them, but that feature must name its prerequisite, remain off or unavailable when the prerequisite is absent, and never prevent either module's independent features from running.

Start here:

```roll20chat
!ga-enable CombatAssist
!Combat-Help
!Combat-Start
```

All `!Combat-` commands are case-insensitive. The **Control Center** is the main table screen; the compact **Quick Guide** links to focused topics for starting, tracker edits, recovery, player messages, and troubleshooting; **Status** reports the saved encounter and a plain-language tracker check. **What does CombatAssist do?** creates or updates the persistent `GameAssist Guide - CombatAssist` handout, then offers buttons to open the manual, whisper a short summary, or return to the Control Center.

* `!Combat-Menu`, `!Combat-GM`, or `!Combat-DM` → Open the action-focused Game Master Control Center.
* `!Combat-Help` or `!Combat-Guide` → Open the plain-language Quick Guide.
* `!Combat-Manual` → Create or update the complete CombatAssist user-manual handout.
* `!Combat-Info` → Whisper the abbreviated purpose and ordinary table workflow.
* `!Combat-Start` → Begin tracking the current open Turn Tracker at its recognized round-counter value, or round 1 when no counter is present.
* `!Combat-Start --confirm` → Deliberately replace the current CombatAssist encounter baseline.
* `!Combat-Next` → Move exactly one native tracker row through TurnTrackerService.
* `!Combat-Prev` → Move exactly one native tracker row backward without changing the saved round.
* `!Combat-End-Turn --token <ID>` → Player control generated by Whispers mode; advances only when the clicking player still controls the current token.
* `!Combat-Adopt` → Keep the current Roll20 tracker, preserve the round, and begin a fresh cycle from its current entry.
* `!Combat-Restore` → Preview a one-step restoration of the last accepted tracker; confirmation and an unchanged tracker revision are required.
* `!Combat-Pause` → Stop counting while leaving the native tracker untouched.
* `!Combat-Resume` → Keep the round number and accept the current tracker order as a fresh baseline.
* `!Combat-Status` → Review state, round, current turn, page, announcement mode, and tracker readability.
* `!Combat-Audit` → Run the same current tracker and encounter inspection with an explicit read-only result.
* `!Combat-End` → Open a confirmation prompt.
* `!Combat-End --confirm` → Clear only CombatAssist's encounter record; tracker rows remain unchanged.
* `!Combat-Announce gm|public|whispers|off` → Whisper turns to the GM, post them publicly, privately notify the GM and current player, or suppress automatic turn notices.
* `!Combat-Confirm standard|varied` → Choose one direct player turn-completion message or a warmer rotation that contains the Standard sentence exactly once.
* `!Combat-Timer` → Open turn length, deadline audience, and early-reminder controls.
* `!Combat-Timer on|off` → Enable or disable timers without changing initiative.
* `!Combat-Timer duration <seconds>` → Set a 10-3600 second turn length.
* `!Combat-Timer deadline gm|player|both|public` → Choose who hears that the configured turn time elapsed.
* `!Combat-Timer add <seconds-remaining> <gm|player|both|public>` → Add or update one of five early reminders.
* `!Combat-Timer remove <seconds-remaining>` / `clear --confirm` → Remove reminder points.
* `!Combat-Cue off|gm|players|both|public` → Choose who receives Roll20's temporary native current-turn ping.

CombatAssist counts an exact forward or backward row rotation as turn movement. When exactly one custom item is clearly named **Round**, **Rounds**, **Round Count**, **Round Counter**, **Round Number**, **Round Tracker**, **Combat Round**, or **Current Round**, its positive whole-number value becomes the authoritative round. When CombatAssist moves that row to the top, it evaluates a simple signed whole-number Round Calculation such as `+1`; this replaces the native calculation that Roll20's API-side array write would otherwise skip. Multiple plausible counters are refused rather than guessed. Without a recognized counter, one uninterrupted forward cycle back to the anchor advances the internal round. Backward movement never advances a round.

Valid additions, removals, InitiativeAssist rerolls, priority changes, and manual reordering keep the current round and establish the current first entry as a fresh cycle baseline. If a recognized round counter is present, its displayed value remains authoritative after that rebaseline. These changes do not restart CombatAssist or rewrite Roll20's chosen order.

Pause remains useful when the GM wants to make several changes without intermediate notices. It is no longer required for ordinary roster maintenance. CombatAssist enters **attention** only when it cannot read a trustworthy tracker, such as a closed or wrong-page tracker, malformed data, a stale token reference, duplicate identities, or ambiguous native movement with exactly two entries.

CombatAssist retains the last accepted tracker and one previous checkpoint. **Use Current Tracker** continues from a readable tracker without changing the round. **Restore Last Safe Tracker** or **Undo Last Tracker Change** previews the exact saved entries before a confirmed, revision-guarded restoration. **Restart at Round 1** remains available, but it is not the normal recovery path.

With exactly two rows, Roll20's native forward and backward arrows produce the same visible order. CombatAssist cannot distinguish them. Use **Next Turn**, **Previous Turn**, `!Combat-Next`, or `!Combat-Prev` for a two-row encounter when round counting matters.

Every private GM turn notice includes **Next Turn**, **Previous Turn**, and **Open Menu**. In `whispers` mode, the current linked character's non-GM controller also receives a private **End My Turn** button. A successful click receives its **Turn Complete** confirmation before any next-character **Your Turn** prompt, including when one player controls consecutive characters. The confirmation reports the next initiative without implying the recipient controls it. A linked token visible on the objects layer may be named; GM-layer tokens, unlinked objects, and custom rows use a generic continuation message. An older button explains that the turn has already advanced and makes no additional change. The GM can choose one Standard sentence or a warmer Varied rotation containing that Standard sentence once.

Turn timers are disabled by default. Each callback is bound to the active encounter, round, current token identity, exact tracker revision, and stored deadline. Advancing through Roll20, CombatAssist, InitiativeAssist, or End My Turn invalidates the old callbacks. Pausing, attention, ending, or disabling CombatAssist cancels them. A timer reports elapsed time only and never advances the Turn Tracker. Player-targeted reminders are sent only for visible linked Objects-layer character turns; hidden, unlinked, and custom entries stay with the GM. When the sandbox reloads, a still-valid saved deadline resumes; an already-passed deadline produces no late player reminder.

Current-turn pings are also disabled by default. They use Roll20's native `sendPing()` without recentering anyone's map or changing token state. A GM-layer or otherwise hidden token is restricted to GM visibility even if the configured audience is broader. Custom tracker rows receive no token ping.

Config keys: `enabled`; `announcements` (`gm`, `public`, `whispers`, or `off`; default `gm`); `playerConfirmations` (`standard` or `varied`; default `standard`); `timerEnabled` (default `false`); `timerDurationSeconds` (default `120`); `timerDeadlineAudience` (default `gm`); `timerReminders` (up to five guarded reminder records); and `turnCue` (`off`, `gm`, `players`, `both`, or `public`; default `off`). Saved pre-release `fun` values migrate to `varied`.

### 6.6 ConcentrationAssist

> **Module version:** `0.2.2`<br>
> **Marker service:** ConcentrationAssist uses the integrated `GameAssist.MarkerService`; standalone TokenMod is not required.

`!concentration` or `!cc` opens buttons for normal, advantage, or disadvantage rolls. The case-insensitive `!Con-<command>` and `!Concentration-<command>` families provide equivalent aliases, while the established space-and-`--` syntax remains compatible:

* `help` / `guide` / `--help` → Whisper the compact guide.
* `menu` / `gm` / `dm` → Open the concentration-check buttons. `!Con-GM|DM` and `!Concentration-GM|DM` are the short role forms.
* `info` → Whisper the short module explanation.
* `status` / `--status` → List tokens currently carrying the configured marker.
* `audit` → Run the same marker inspection with an explicit read-only result.
* `manual` → Create or update the stable ConcentrationAssist user-manual handout.
* `settings` / `config` → Open result-message settings.
* `--damage N` → Roll against DC `max(10, floor(N / 2))`.
* `--mode normal|adv|dis` → Choose roll mode.
* `--last` → Repeat the player’s last recorded check.
* `--off` → Remove the configured marker from selected tokens.
* `--config randomize on|off` → Toggle emote randomization.
* `!ga-conc-status` → GM-only snapshot of the most recent concentration DC and damage per player.

The tracker reads `constitution_save_bonus` from a token’s represented character. Runtime `lastDamage` data self-heals and accepts legacy number entries.

In v0.1.4.3, built-in marker ids, custom marker display names, and exact custom tags resolve to the marker identity Roll20 stores on tokens. If the configured marker cannot be recognized, `!concentration --status` gives an actionable warning instead of silently reporting an incorrect empty result.

In v0.1.5.0, concentration status, add, remove, and teardown operations use MarkerService. Each mutation returns an explicit result, exact stored custom tags remain usable when the campaign registry cannot be read, and unrelated or numbered markers are preserved. ConditionAssist observes MarkerService directly and can describe a configured concentration marker when a matching condition definition exists.

Config keys: `marker`, `randomize`.

### 6.7 NPCAssist

> **Marker service:** NPCAssist uses the integrated `GameAssist.MarkerService`; death history remains independent from marker-write success.

> **Module version:** NPCAssist `1.4.0` in GameAssist v2.0.0. NPCAssist `1.0.0` introduced the four-level history model; `1.1.0` added curated Arc management, hierarchical clearing, date rollover, and the report writer; `1.1.1` hardened standalone interoperability and new-token HP initialization; `1.2.0` migrated marker behavior to MarkerService; `1.2.1` added confirmation-gated marker repair; `1.3.0` applies the DM-selected timezone to Session dates and history displays without changing stored event instants; `1.3.1` added compact navigation, status, and a persistent manual; `1.3.2` added equivalent NPC command families and dedicated GM/DM control aliases; `1.3.3` adds configurable GM-private Bloodied threshold notices; `1.4.0` adds optional page-local progressive names for newly added linked NPC tokens.

NPCAssist watches `change:graphic:bar1_value` for linked NPC characters with `npc=1`.

* HP below 1 → record the NPC death into the active Campaign, Chapter, Section, and Session buckets, then request the configured `deadMarker`.
* HP above 0 → annotate the matching death entry as revived and request removal of the configured `deadMarker`.
* HP crosses from above half to half or below while still above 0 → whisper the GM once when `notifyBloodied=true` and bar 1 max is valid and positive.
* `autoHide=true` → move newly dead NPC tokens to `hideLayer`.

When HPAssist `autoRollOnAdd=true`, NPCAssist treats the short placeholder-HP interval on a newly added token as setup rather than combat. Blank or unknown starting HP is not accepted as evidence that a living NPC crossed below 1 HP. The automatic roll therefore does not flash the death marker, add a false death/revival pair to history, or produce a false Bloodied notice; later known gameplay changes remain ordinary tracked events.

Commands:

* `!npc-death-help` / `!npc-death-guide` → Open the compact NPCAssist guide.
* `!NPC-GM`, `!NPC-Death-GM`, or `!NPCAssist-GM` → Open the NPCAssist Control Center. Replace `GM` with `DM` for the equal Dungeon Master aliases.
* `!npc-bloodied` → Toggle private Bloodied alerts and immediately return to the Control Center. The equivalent NPCAssist command families are also accepted.
* `!npc-numbering` → Toggle automatic page-local NPC names and immediately return to the Control Center. Equivalent NPCAssist command families are accepted.
* `!npc-death-status` → Show current bucket, history, marker, and Arc health.
* `!npc-death-info` → Whisper the short module explanation.
* `!npc-death-manual` → Create or update the stable NPCAssist user-manual handout.
* `!npc-death-report` → Show the active Session bucket summary.
* `!npc-death-report --scope campaign|chapter|section|session` → View a different active bucket.
* `!npc-death-report --recent` → Show the newest recorded death events for the selected bucket.
* `!npc-death-report --page N` → Page through older recorded death events for the selected bucket.
* `!npc-death-report --write` → Open the report writer without immediately changing a handout.
* `!npc-death-report --help` or `!npc-death-help` → Open the central NPCAssist guide for setup, reports, clearing, audits, and Arcs.
* `!npc-death-buckets` → Show active bucket names, counts, report buttons, and rename buttons.
* `!npc-death-buckets --campaign "Name" --chapter "Name" --section "Name" --session "Name"` → Set retained active bucket names.
* `!npc-death-clear --scope session` → Ask for confirmation before clearing the selected active bucket. Defaults to Session.
* `!npc-death-clear --scope session --confirm` → Clear only that active bucket.
* `!npc-death-clear --scope section --nested --confirm` → Clear the active Section and Session while retaining Chapter and Campaign. The same rule applies to other parent levels.
* `!NPC-WR` or `!npc-death-write` → Open the report writer.
* `!npc-death-write --all` → Update all four active handouts.
* `!npc-death-write --scope section` → Update one active handout.
* `!npc-death-write --newSection "Name"` → Start/resume a Section and seed it with only missing deaths from the current Session.
* `!npc-death-audit` → Check the current player page for HP/death-marker mismatches and update the `GameAssist NPC Death Audit` handout.
* `!npc-death-repair` → Re-scan the current page and preview marker corrections based on current bar 1 HP.
* `!npc-death-repair --confirm` → Apply the previewed rule after a fresh scan, changing only the configured death marker.
* `!npc-death-arc` → Show arc bucket help and current arc counts.
* `!npc-death-arc --name "Arc Name"` → Add selected linked PC/NPC tokens to that arc handout.
* `!npc-death-arc --name "Arc Name" --session` → Append current Session bucket deaths to that arc handout.
* `!npc-death-arc --name "Arc Name" --manage` → Open removal, selected-token removal, undo, and Session-import controls.
* `!npc-death-arc --name "Arc Name" --session --allowDuplicates` → Intentionally add repeated entries; ordinary additions deduplicate by creature.

Every NPCAssist command suffix in this section is available through the case-insensitive `!NPC-*`, `!NPC-Death-*`, and `!NPCAssist-*` families. The older `!NPCManager-*` family remains a compatibility alias. For example, `!NPC-Audit`, `!NPC-Death-Audit`, `!NPCAssist-Audit`, and `!NPCManager-Audit` run the same read-only audit.

`!npc-death-report` is a history report. It opens with totals, the latest death, most frequent names, recent entries, and buttons for common next steps. Every new death is written to all four active buckets. A clear confirmation offers either the selected bucket alone or that level and its descendants; for example, clearing Section and below clears Section and Session while retaining Chapter and Campaign. Each bucket has its own handout named like `GameAssist Deaths - Session - 2026-07-17`. Revivals are annotated on the matching entry instead of silently deleting the death. Current entries are matched by token ID, so separate tokens with the same name remain separate records.

The default Session name follows the active GameAssist table date. Choose the table timezone with `!ga-timezone`; when none is selected, GameAssist uses the Roll20 sandbox clock. Before any NPCAssist command or tracked NPC HP change, GameAssist checks the date and moves a date-managed Session to the new `YYYY-MM-DD` bucket. Changing the timezone also refreshes the Session immediately when the named date changes. No death processed after that check is written into yesterday's Session. If the DM explicitly names the Session, that custom name remains active across date changes; **Reset Session Date** restores automatic date-managed rollover.

Arc handouts are curated rosters, not another hierarchy level. A linked creature appears once per Arc by default, so adding selected NPCs and later importing the full Session does not repeat those creatures. The Session import can enrich an existing selected entry with its death record. The management menu can remove one entry, remove all selected tokens, or undo the most recent Arc addition. `--allowDuplicates` is an explicit override for deliberate repetition. Selected-token Arc entries remain general story notes; revival annotations apply only after an entry is linked to Session death history.

`!npc-death-audit` is the read-only mismatch checker. Chat shows a summary plus bounded, token-specific **Add Death Marker** and **Remove Death Marker** groups. The complete list is written to the `GameAssist NPC Death Audit` handout. The audit checks linked NPC tokens on the current player page; player characters are not included. A clean audit means linked NPC tokens have death markers that match their HP. The audit may also note ignored unlinked page items such as party markers, scenery, labels, or props. Blank or non-numeric HP is reported separately and is never treated as zero by repair.

When mismatches exist, **Review Marker Repairs** opens the separate `!npc-death-repair` preview. It explains exactly how many markers would be added or removed and requires confirmation. Confirmation re-scans current HP before acting, verifies each MarkerService change, and preserves HP, death history, report buckets, Arc records, and unrelated markers. This separation matters when the mismatch reveals housekeeping the DM would rather fix manually, such as a revived token whose marker was removed before its HP was restored.

Disabling NPCAssist stops its automation and requests removal of its configured marker from qualifying current-page tokens. Saved Campaign, Chapter, Section, Session, and Arc records remain available after the module is enabled again. Use the NPCAssist clear and Arc-management controls when history should actually be removed.

When automatic NPC names are enabled, a newly added linked NPC on the Objects or GM layer uses its represented character name. If another eligible NPC on that page already uses the name, NPCAssist chooses the lowest available positive suffix. Existing tokens are not renumbered, pages are independent, deleted gaps may be reused, and the GM can turn the feature off or rename a token afterward to make a deliberate duplicate.

The NPCAssist Control Center shows whether automatic names and Bloodied alerts are on and provides one-click Turn On or Turn Off buttons. Bloodied notices are whispered only to the GM and show the NPC name plus current/max HP. They do not add a Bloodied marker, write history, alter Arc records, or repeat while the NPC remains at or below half. Healing above half naturally rearms a later crossing. PCs, unlinked tokens, non-object-layer tokens, deaths, and blank, invalid, zero, or negative maximum HP values do not produce the notice.

Config keys: `autoTrackDeath`, `notifyBloodied`, `autoNumberNpcTokens`, `deadMarker`, `autoHide`, `hideLayer`.

### 6.8 HPAssist

> **Module version:** `0.1.1.3`<br>
> **Dependency:** HPAssist does **not** require TokenMod.

HPAssist reads `npc=1` and `npc_hpformula` from linked characters, parses `NdM+K` or `NdM-K`, and writes the result to token `bar1_value` and `bar1_max`.

Use either command style below. Commands are not case-sensitive.

* `!HP-Selected` or `!hp selected` → Roll HP for qualifying selected NPC tokens.
* `!HP-All` or `!hp all` → Roll HP for qualifying NPC tokens on the current player page.
* `!HP-Guide` or `!hp guide` → Open the compact guide.
* `!HP-Status` or `!hp status` → Show module and automatic-roll status.
* `!HP-Audit` or `!hp audit` → Count qualifying, skipped, and invalid current-page tokens without changing HP.
* `!HP-Info` or `!hp info` → Whisper the short module explanation.
* `!HP-GM`, `!HP-DM`, `!hp gm`, or `!hp dm` → Open the Game Master HP controls.
* `autoRollOnAdd=true` → Quietly attempt HP rolling when a qualifying NPC token is added.

Older `!HPAssist-*`, `!npc-hp-*`, `!NPCHP-*`, and `!NPCHPRoller-*` macros remain compatibility aliases, but new macros and every HPAssist button use `!HP-<command>` or `!hp <command>`.

Invalid, unlinked, and PC tokens are skipped.

Config key: `autoRollOnAdd`.

### 6.9 Config UI

> **Module version:** `0.2.2`

`!ga-config ui` or `!ga-config-ui` whispers a GM-only chat control panel. Each module card can show:

* Current enabled/disabled status with a one-click toggle.
* Boolean configuration keys as chat buttons.
* A brief configuration summary.
* Previous, refresh, and next pagination controls.

Config keys: `pageSize`, `showSummaries`.

Disable ConfigUI if you prefer command-only administration.

Use `!ga-config-ui help|guide`, `menu|gm|dm`, `status`, `info`, or `audit` for the standard compact screens. `!ConfigUI-GM` and `!ConfigUI-DM` open the same settings screen. `!ga-config-ui manual` explains that this brief module keeps its complete guidance in chat.

### 6.10 Debug Tools *(GM-only)*

> **Module version:** `0.2.2`

DebugTools is disabled by default and remains dry-run unless `--apply` is present:

* `!ga-debug damage --amount 12 [--token TOKENID] [--apply]`
* `!ga-debug marker --marker statusname [--state on|off|toggle] [--token TOKENID] [--apply]`
* `!ga-debug save --dc 15 [--bonus 3] [--mode adv|dis|normal] [--label "Text"] [--apply]`

To act on the currently selected token, omit `--token`. Literal `--token select` is not supported.

Typical session:

```roll20chat
!ga-enable DebugTools
!ga-debug marker --marker dead --state toggle
!ga-debug marker --marker dead --state toggle --apply
!ga-disable DebugTools
```

After enabling the module, use `!ga-debug help|guide`, `menu|gm|dm`, `status`, `info`, `audit`, or `settings` for its standard compact screens. `!Debug-GM|DM` and `!DebugTools-GM|DM` open the diagnostic control screen. `!ga-debug manual` explains that the full dry-run-first guidance already fits in chat.

### 6.11 WelcomeAssist *(optional, GM-managed)*

> **Module version:** `0.1.4`<br>
> **Default:** Disabled<br>
> **Automatic behavior:** At most one public greeting per sandbox lifecycle after completed GameAssist startup.

WelcomeAssist gives the table a short opening greeting without turning startup into a wall of status messages. Its default `mixed` mode chooses from the professional greeting, the included built-in greeting library, and any campaign greetings the GM adds. Each campaign greeting has twice the individual chance of one built-in line.

Start here:

```roll20chat
!ga-enable WelcomeAssist
!Welcome
!Welcome-Preview
```

Choose a mode, adjust the greeting if desired, then reload the Mod sandbox. WelcomeAssist waits for the configured delay and confirms that every other enabled GameAssist component is active before it posts. If a component remains unhealthy, the greeting is skipped and the GM receives the component name instead of a misleading ready announcement.

Enabling WelcomeAssist during a running sandbox does **not** post publicly. `!Welcome-Preview` is always private to the GM. `!Welcome-Announce` is the explicit immediate public action and cancels any pending automatic greeting for that sandbox lifecycle.

Main commands:

* `!Welcome` or `!Welcome-Help` → Open the compact action guide; its topic buttons reveal setup, mode, campaign-text, appearance, and startup details.
* `!Welcome-Guide` → Open the same compact guide.
* `!Welcome-Menu`, `!Welcome-GM`, or `!Welcome-DM` → Open private greeting settings and actions.
* `!Welcome-Info` → Whisper the short module explanation.
* `!Welcome-Audit` → Inspect readiness and saved greeting configuration without posting or changing anything.
* `!Welcome-Manual` → Create or update the stable WelcomeAssist user-manual handout.
* `!Welcome-Status` → Review the current mode, delay, header, custom-list count, timer, and current-sandbox announcement.
* `!Welcome-Preview` → Show the next greeting only to the GM.
* `!Welcome-Announce` → Post one greeting publicly now.
* `!Welcome-Mode default|builtin|custom|mixed` → Choose the greeting pool.
* `!Welcome-Delay <seconds>` → Set a delay from 1 to 60 seconds.
* `!Welcome-Header show|hide|<text>` → Control the optional heading.
* `!Welcome-Default <text>` → Replace the professional greeting.
* `!Welcome-Custom list|add|remove|clear` → Manage up to ten campaign greetings; clearing requires `--confirm`.

All short Welcome commands are case-insensitive. The longer `!welcome-assist ...` forms remain accepted so existing campaign macros do not break, but new menus and documentation use the shorter family.

Custom greetings are plain text, limited to 240 characters, deduplicated without regard to capitalization, and escaped before public output. Roll20 inline-roll, attribute, ability, and query syntax is displayed as text rather than executed.

Config keys: `enabled`, `mode`, `delayMs`, `showHeader`, `header`, `defaultGreeting`, and the protected `customGreetings` list.

---

### 6.12 EffectAssist *(optional, GM-managed)*

> **Module version:** `2.0.0`<br>
> **Default:** Disabled<br>
> **Launch sheet:** Official D&D 5E by Roll20 2014 sheet. The 2024 sheet and other character sheets are deferred until their contracts can be implemented and tested separately.

EffectAssist records **why** an effect exists instead of treating a marker or character-sheet field as the complete truth. Each active instance retains its source character and token, exact targets, concentration dependency, stacking group, duration guidance, creator, lifecycle, and every visible or mechanical projection it manages.

Start here:

```roll20chat
!ga-enable EffectAssist
!Effect-GM
```

Select the target tokens, open the Effect Catalog, choose an effect, and choose its source. A confirmation panel shows what GameAssist will do automatically and what the table must still handle before anything changes.

| Effect | Automatic in v2.0.0 | Assisted at the table |
| --- | --- | --- |
| **Bless** | Target marker; 2014-sheet `1d4` global attack and save rows; source concentration; linked cleanup. | Choose legal targets and end early when a non-concentration rule requires it. |
| **Guidance** | Target marker; source concentration; linked cleanup. | Add `1d4` to one eligible ability check and end after use. |
| **Gift of Alacrity** | Target marker and durable effect record. | Add `1d8` through InitiativeAssist or the normal initiative workflow. |
| **Warding Bond** | Target marker; 2014-sheet `+1` AC and saving-throw rows. | Resolve resistance and mirrored damage. |
| **Holy Weapon** | Target marker; source concentration; linked cleanup. | Apply bonus damage only to the affected weapon and resolve the optional burst. |
| **Haste** | Target marker; 2014-sheet `+2` AC row; source concentration; linked cleanup. | Resolve speed, Dexterity-save advantage, the restricted action, and ending lethargy. |
| **Longstrider** | Target marker and durable effect record. | Add 10 feet to the appropriate movement speed. |
| **Pass Without a Trace** | Target marker; source concentration; linked cleanup. | Add `+10` to affected Stealth checks and maintain the area-based target list. |
| **Beacon of Hope** | Target marker; source concentration; linked cleanup. | Resolve Wisdom-save and death-save advantage and maximum healing. |

Automatic means EffectAssist has an ownership-safe Roll20 representation. Assisted does not mean forgotten: the confirmation, status, catalog, and manual identify those mechanics so the GM knows exactly what remains.

Two sources applying the same non-stacking effect to one target remain separate instances but share each effective projection. Ending one source leaves the other source's marker and sheet rows in place. Ending the final source removes only the state EffectAssist originally created. Matching markers or modifier rows that existed first remain untouched.

Main commands:

* `!Effect-GM`, `!Effect-DM`, or `!Effect-Menu` → Open the Game Master control screen.
* `!Effect-Guide` or `!Effect-Help` → Open the compact quick-start guide.
* `!Effect-Catalog` → Open the nine-effect launch catalog and guided application buttons.
* `!Effect-Active` → Manage active instances and end one exact source.
* `!Effect-Status` → Review active effects, recent history, source/target details, concentration, and projection health.
* `!Effect-Definitions` → Review built-in and campaign definitions with automatic, assisted, and informational behavior.
* `!Effect-Audit` → Compare semantic records, exact targets, ownership ledgers, markers, conditions, concentration, and sheet rows without changing anything.
* `!Effect-Repair` → Reopen the audit unless a fresh one-use confirmation grant is supplied by the audit button.
* `!Effect-End --id <generated-id>` → End one exact source instance; ordinary menus generate this button so the GM need not memorize IDs.
* `!Effect-Info` → Explain source ownership, overlap, and current supported boundaries.
* `!Effect-Manual` → Create or update the stable EffectAssist user-manual handout.
* `!effect <command>` → Use the same controls through the case-insensitive spaced command family.

Audit reports missing tokens, token representation changes, unavailable projections, missing or changed markers and sheet rows, missing ownership records, orphaned owned state, and malformed preserved records. Repair is offered only for safe current mismatches, is bound to the GM who ran the audit, expires after five minutes, rechecks the complete mismatch signature, and verifies the result. If a GM edits an EffectAssist-created sheet row, cleanup preserves that edited row and marks the instance for attention instead of deleting the GM's work.

Disabling EffectAssist stops its commands and future automation while preserving valid active records, ended history, definitions, and existing projections. Re-enable it and run Status or Audit before continuing. MarkerService, ConditionAssist, or ConcentrationAssist can be unavailable without corrupting the semantic record; affected projections remain visible as pending or needing attention.

Config keys: `enabled`, the protected `markerOverrides` map, and the protected `customDefinitions` map. In v2.0.0, the two protected maps are reserved for validated release data and are not edited through `!ga-config`; GMs use the built-in catalog or the guided custom Marker, Condition, and Record Only choices.

---

## 7 · Installation <a id="7-installation"></a>

I. **Open the Roll20 Mod/API Editor**

1. Open your game’s **Settings**.
2. Open **Mod (API) Scripts**.
3. Create or select the GameAssist script entry.

II. **Install GameAssist**

1. Paste the complete contents of `GameAssist` v2.0.0.
2. Keep the script as one complete file; do not paste only individual MECHSUITS sections into Roll20.
3. Save the script.

III. **Remove Overlapping Standalone Marker Tools**

GameAssist v2.0.0 replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by TokenAssist and ConditionAssist. Remove both standalone scripts before enabling the overlapping GameAssist modules. TokenAssist and standalone TokenMod both recognize `!token-mod`; ConditionAssist and standalone StatusInfo both recognize `!condition` and marker changes.

If standalone TokenMod is accidentally left installed, TokenAssist suspends only its deprecated `!token-mod` alias and warns the GM instead of applying that command twice. The `!token-assist`, `!ta`, and `!ta-*` commands remain available, but this safeguard is diagnostic rather than a supported permanent dual-install arrangement.

MarkerService itself may be disabled when the campaign deliberately chooses a different marker system. GameAssist will also turn off its dependent modules and explain which features are unavailable; CritAssist, ConfigUI, and HPAssist continue to work.

IV. **Create the Seven CritAssist Tables**

Create these exact rollable-table names:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

V. **Reload and Inspect**

1. Save/reload the API sandbox.
2. Expect one core ready whisper.
3. Run:

```roll20chat
!ga-status
!ga-config modules
!ga-timezone
```

Because `QUIET_STARTUP` defaults to `true`, individual module-ready whispers are normally suppressed.

VI. **Run the Smoke Test**

Use the checklist in [§4.1 Minimum Smoke Test](#41-minimum-smoke-test) before trusting the release in a live session.

---

## 8 · Command Matrix <a id="8-command-matrix"></a>

Commands are generally matched case-insensitively with token boundaries. Preserve documented spelling and spacing for predictable results.

`!concentration --config randomize on|off` changes the shared module setting and is part of the current player-accessible concentration command surface.

| Scope | Command | Parameters / Flags | Purpose |
| --- | --- | --- | --- |
| **Admin** | `!ga-status` | `[--details]` | Show a plain-language system check; `--details` adds session activity, queue, timestamp, and internal event-hook diagnostics. |
|  | `!ga-timezone` / `!ga-config timezone` | `set <IANA timezone>`, `clear` | Open table-time settings, save a validated named timezone, or restore sandbox-default time. |
|  | `!ga-metrics` | `[reset]` | Show persisted session totals/history or reset metrics. |
|  | `!ga-config list` | — | Write a versioned configuration-only snapshot handout. |
|  | `!ga-config get <ModuleOrService> [key]` | — | Whisper one config value or the component’s full config. |
|  | `!ga-config set <ModuleOrService> <key>=<value>` | — | Persist an ordinary component config value; unsafe and component-protected keys are refused. |
|  | `!ga-config modules` | — | Show feature-module and core-service configured/runtime/dependency status. |
|  | `!ga-config cleanup` | — | Explicitly remove unknown/orphaned state branches. |
|  | `!ga-config ui` / `!ga-config-ui` | `[--page N]` | Open the GM Config UI. |
|  | `!ga-config-ui help|menu|gm|dm|status|info|audit|manual` | `!ConfigUI-GM|DM`, `!Config-GM|DM` | Open ConfigUI guidance, the Game Master settings screen, health, explanation, read-only review, or its short-module manual notice. |
|  | `!ga-enable <ModuleOrService>` / `!ga-disable <ModuleOrService>` | — | Enable or disable a module or core service; names are case-insensitive. |
| **Initiative** | `!Init-Menu` / `!Init-Help` / `!Init-Status` | — | Open InitiativeAssist controls, guidance, or the current native-tracker summary. |
|  | `!Init-Go` / `!Init-Go!` | — | Publicly invite players to roll, then whisper the GM a PC/NPC roster with individual and batch controls. |
|  | `!Init-GM` / `!Init-DM` | — | Whisper the Game Master the neutral initiative controls and complete encounter roster without a public invitation. |
|  | `!Init-Roll-Selected` | `[--mode normal\|adv\|dis] [--adjust number] [--extra die[,die]]` | Roll every eligible selected character controlled by the clicking GM or player. |
|  | `!Init-Start` | `--scope all\|npc\|gm-npc\|all-npc` | Add or update object-layer characters, object-layer NPCs, GM-layer NPCs, or NPCs across both layers. |
|  | `!Init-NPC-Rolls` | `hidden\|public` | Choose whether object-layer NPC evidence is GM-only. GM-layer evidence always remains private. |
|  | `!Init-Roll` / `!Init-Options` | `[--token ID] [--mode normal\|adv\|dis] [--adjust number] [--extra die[,die]]` | Roll an authorized linked token. The guided options combine d20 mode, a bounded flat adjustment, and up to two bounded bonus dice. |
|  | `!Init-RR` | — | Reroll every unique eligible PC and living NPC already in the tracker while preserving other rows. |
|  | `!Init-RR-Menu` | — | Open PC, NPC, selected-token, individual, and saved-group reroll choices. |
|  | `!Init-Group` | `[--create "Name"] [--rename ID --name "Name"] [--remove ID]` | Manage page-scoped encounter groups from selected tracker tokens. |
|  | `!Init-Audit` | — | Show the detailed read-only Initiative Review privately in chat. |
|  | `!Init-Info` / `!Init-Manual` | — | Whisper the short explanation or create/update the stable InitiativeAssist manual handout. |
|  | `!Init-Mode observer\|manager` | — | Choose read-only coexistence or InitiativeAssist tracker writes. |
| **Combat** | `!Combat-Menu` / `!Combat-GM` / `!Combat-DM` | — | Open the CombatAssist Control Center. |
|  | `!Combat-Help` / `!Combat-Guide` | `[turns\|timers\|recovery\|messages\|attention]` | Open the compact guide or one focused reference panel. |
|  | `!Combat-Manual` / `!Combat-Info` | — | Create or update the complete user-manual handout, or whisper its abbreviated purpose. |
|  | `!Combat-Status` / `!Combat-Audit` | — | Review current encounter health, or run the explicitly read-only tracker inspection. |
|  | `!Combat-Start` | `[--confirm]` | Start from a recognized native round counter or round 1, or deliberately replace an existing encounter baseline after confirmation. |
|  | `!Combat-Next` | — | Rotate the native Turn Tracker forward exactly one row through TurnTrackerService. |
|  | `!Combat-Prev` | — | Rotate the native Turn Tracker backward exactly one row without changing the round. |
|  | `!Combat-End-Turn` | `--token <ID>` | Whispers-mode player button; advances only if the clicking player still controls the current token. |
|  | `!Combat-Adopt` | — | Keep the current readable native tracker and current round, then begin a fresh cycle from its first entry. |
|  | `!Combat-Restore` | `[--confirm --revision <ID>]` | Preview and confirm one revision-guarded restoration of the last accepted tracker state. |
|  | `!Combat-Pause` / `!Combat-Resume` | — | Optionally pause during several tracker edits, then keep the round and accept the current order as a fresh baseline. |
|  | `!Combat-End` | `[--confirm]` | Clear only CombatAssist encounter state after confirmation; leave Roll20 tracker rows unchanged. |
|  | `!Combat-Announce` | `gm\|public\|whispers\|off` | Choose GM-only, public, GM-plus-current-player, or disabled turn notices. |
|  | `!Combat-Confirm` | `standard\|varied` | Choose one direct private player acknowledgement or a warmer rotation containing the Standard sentence exactly once. |
|  | `!Combat-Timer` | `on\|off\|duration N\|deadline audience\|add N audience\|remove N\|clear --confirm` | Configure stale-safe turn timing and per-reminder recipients; never auto-advance. |
|  | `!Combat-Cue` | `off\|gm\|players\|both\|public` | Configure a temporary native current-turn ping without changing token properties or map position. |
| **Welcome** | `!Welcome` / `!Welcome-Help` / `!Welcome-Status` / `!Welcome-Preview` | — | Open the GM guide, review settings, or preview the next greeting privately. |
|  | `!Welcome-Guide` / `!Welcome-Menu` / `!Welcome-GM` / `!Welcome-DM` | — | Open the compact guide or private greeting controls. |
|  | `!Welcome-Info` / `!Welcome-Audit` / `!Welcome-Manual` | — | Open the short explanation, read-only readiness review, or stable manual handout. |
|  | `!Welcome-Announce` | — | Post one greeting publicly now and cancel the pending automatic greeting for this sandbox. |
|  | `!Welcome-Mode` | `default\|builtin\|custom\|mixed` | Choose the greeting pool. |
|  | `!Welcome-Delay` | `<seconds>` | Set the automatic delay from 1 to 60 seconds. |
|  | `!Welcome-Header` | `show\|hide\|<text>` | Show, hide, or replace the public greeting header. |
|  | `!Welcome-Default` | `<text>` | Replace the professional default greeting. |
|  | `!Welcome-Custom` | `list`, `add <text>`, `remove <number>`, `clear --confirm` | Manage the bounded campaign greeting list. |
| **Effects** | `!Effect-GM` / `!Effect-DM` / `!Effect-Menu` | selected linked targets; guided source picker | Open EffectAssist's private action screen. |
|  | `!Effect-Guide` / `!Effect-Help` / `!Effect-Info` / `!Effect-Manual` | — | Open compact guidance, the short explanation, or the stable manual handout. |
|  | `!Effect-Catalog` | selected linked targets; guided source picker | Choose from Bless, Guidance, Gift of Alacrity, Warding Bond, Holy Weapon, Haste, Longstrider, Pass Without a Trace, or Beacon of Hope. |
|  | `!Effect-Active` / `!Effect-Status` / `!Effect-Definitions` | — | Manage active instances, review recent history and projection health, or inspect catalog behavior. |
|  | `!Effect-Apply` | `--effect <catalog-id>` or bounded `--name` with `--marker`, `--condition`, or `--none`; generated `--source` | Preview one atomic application. The generated confirmation identifies automatic 2014-sheet changes and assisted table steps before writing. |
|  | `!Effect-End` | `--id <generated-id>` | End one exact source instance through generated buttons and remove only an unneeded EffectAssist-owned projection. |
|  | `!Effect-Audit` / `!Effect-Repair` | fresh generated confirmation grant | Compare records against marker, condition, concentration, and 2014-sheet projections without writing, then deliberately repair only a still-current safe mismatch. |
|  | `!effect <command>` / `!EffectAssist-<command>` | case-insensitive | Spaced canonical command family and compatibility family for the same guarded controls. |
| **Token Controls** | `!token-assist help` / `!ta-help` | — | Open TokenAssist guidance, commands, compatibility limits, provenance, and attribution. |
|  | `!token-assist menu|gm|dm|status|info|audit|manual` | matching `!ta-*` aliases; `!TokenAssist-GM|DM` | Open Game Master controls, health, explanation, read-only review, or the stable TokenAssist manual. |
|  | `!token-assist --help-statusmarkers` / `!ta-help-statusmarkers` | — | Open the marker-command guide. |
|  | `!token-assist --on|--off|--flip <property...>` / `!ta-on|off|flip` | selected/authorized targets | Change supported boolean token properties. |
|  | `!token-assist --set <property|value...>` / `!ta-set` | selected/authorized targets | Change supported token, bar, aura, vision, lighting, layer, position, and marker properties. |
|  | `!token-assist --move <distance|angle\|distance>` / `!ta-move` | selected/authorized targets | Move tokens using pixels, grid units, or page units. |
|  | `!token-assist --order tofront|toback` / `!ta-order` | selected/authorized targets | Change token stacking order. |
|  | `!token-assist --report <recipient\|message>` / `!ta-report` | `{property}` placeholders | Report before/after token values to the GM, caller, table, or controllers. |
|  | `!token-assist --ids <id...>` / `!ta-ids` | `--ignore-selected`, `--current-page`, `--active-pages` | Add explicit token/character targets when authorized and optionally filter their pages. |
|  | `!token-assist --config players-can-ids|on|off` / `!ta-config` | GM only | Control whether players may supply explicit IDs; selected-token use remains available. |
|  | `!token-mod ...` | temporary older syntax | Accepts supported older macros in v2.0.0; use `!token-assist` or `!ta` for new macros. Removal requires a separately announced migration release. |
| **GM** | `!HP-All` / `!hp all` | — | Roll and set HP for qualifying NPC tokens on the current page. |
|  | `!HP-Selected` / `!hp selected` | — | Roll and set HP for qualifying selected NPC tokens. |
|  | `!HP-<command>` / `!hp <command>` | case-insensitive | Open HPAssist controls, roll selected/page NPC HP, show guidance, or run read-only checks; older HP command families remain compatibility aliases only. |
|  | `!npc-death-help` | — | Open the same central NPCAssist guide as `!npc-death-report --help`. |
|  | `!NPC-<command>` / `!NPC-Death-<command>` / `!NPCAssist-<command>` | legacy `!NPCManager-<command>`; case-insensitive | Use any NPCAssist command through an equivalent family; GM and DM open the Control Center. |
|  | `!npc-death-report` | `[--scope campaign\|chapter\|section\|session] [--recent] [--page N] [--write] [--help]` | Show bucket history; `--help` opens the central guide and `--write` opens the report writer. |
|  | `!npc-death-buckets` | `[--campaign "Name"] [--chapter "Name"] [--section "Name"] [--session "Name"] [--resetSession]` | View or rename the active death-history buckets. |
|  | `!npc-death-clear` | `[--scope session] [--nested] [--confirm]` | Clear only the selected bucket, or add `--nested` to clear that level and its descendants. |
|  | `!NPC-WR` / `!npc-death-write` | `[--all] [--scope <level>] [--newSection "Name"]` | Open the report writer, update selected handouts, or seed a new Section from the current Session. |
|  | `!npc-death-audit` | — | Summarize current HP/death-marker mismatches and update the audit handout. |
|  | `!npc-death-repair` | `[--confirm]` | Preview marker corrections from current HP; `--confirm` re-scans and changes only the configured death marker. |
|  | `!npc-death-arc` | `[--name "Arc"] [--session] [--note "Text"] [--manage] [--allowDuplicates]` | Maintain a deduplicated Arc roster from selected tokens or the current Session; manage removal and undo in chat. |
|  | `!ga-conc-status` | — | Show recent concentration DC/damage data per player. |
|  | `!condition config` | — | Open ConditionAssist settings and condition-definition controls. |
| **Player / GM** | `!critfumble` / `!critfumble help` | — | Whisper the CritAssist quick reference. |
|  | `!critfumble menu` | — | Whisper the guided Natural 1 dialogue. |
|  | `!critfumble guide|gm|dm|status|info|audit|manual` | `!crit`, `!CritAssist-*`; legacy `!CritFumble-GM|DM` | Open compact navigation, the Game Master picker, setup health, explanation, read-only table audit, or the stable manual. |
|  | `!critfail` | — | Open the direct GM-facing manual fumble prompt. Intended for GM use, but not currently GM-gated. |
| **Debug** | `!ga-debug damage` | `--amount N [--token ID] [--apply]` | Preview or apply bar1 damage. |
|  | `!ga-debug help|menu|gm|dm|status|info|audit|settings|manual` | `!Debug-GM|DM`, `!DebugTools-GM|DM` | Open DebugTools controls, guidance, and read-only checks; its short guidance remains in chat. |
|  | `!ga-debug marker` | `--marker NAME [--state on|off|toggle] [--token ID] [--apply]` | Preview or apply a status marker change. |
|  | `!ga-debug save` | `--dc N [--bonus N] [--mode normal|adv|dis] [--label "Text"] [--apply]` | Preview or roll a save. |
| **Player / GM** | `!critfumble-<type>` | `melee|ranged|thrown|spell|natural` | Roll the selected fumble table. |
|  | `!confirm-crit-martial` / `!confirm-crit-magic` | — | Roll the matching confirmation table. |
|  | `!condition` / `!condition help` | — | Open the selected-token condition menu or quick-start guide. |
|  | `!condition guide|menu|gm|dm|status|info|audit|manual` | `!Condition-GM|DM` | Open compact navigation, selected-token controls, health, explanation, read-only review, or the stable manual. |
|  | `!condition <name>` | — | Show one configured condition description when permitted. |
|  | `!cond-<condition>` | — | Show any official or DM-created condition through the case-insensitive short reference prefix. |
|  | `!condition add|remove|toggle <condition...>` | selected tokens | Change one or more condition markers when permitted. |
| **GM** | `!condition announce` / `!c-a` / `!cond-!` | selected linked character tokens | Choose a condition, then toggle and verify its marker while announcing the result or exact wording publicly or to player controllers. |
|  | `!condition status` / `!condition --status` | current player page | List linked characters and NPCs with configured conditions or other active markers. |
|  | `!concentration` / `!cc` / `!Con-<command>` / `!Concentration-<command>` | `help|guide|menu|gm|dm|status|info|audit|manual|settings`, plus established `--damage N`, `--mode normal|adv|dis`, `--last`, `--off`, `--status`, `--config randomize on|off`, `--help` | Open navigation or perform a concentration workflow through case-insensitive equivalent aliases. |

### 8.1 Configuration Safety

These keys are refused:

```text
__proto__
prototype
constructor
```

Setting `enabled=true` or `enabled=false` routes through component lifecycle controls rather than directly mutating the stored value. ConditionAssist's `conditions`, `rulesProfile`, and migration record are protected from generic replacement; use `!condition config` and its validated importer.

---

## 9 · Configuration Keys <a id="9-configuration-keys"></a>

| Module | Key | Type | Default | Purpose |
| --- | --- | --- | --- | --- |
| **ConfigUI** | `enabled` | bool | `true` | Enable the ConfigUI module. |
|  | `pageSize` | number | `3` | Modules displayed per UI page. |
|  | `showSummaries` | bool | `true` | Show config summaries on module cards. |
| **CritAssist** | `enabled` | bool | `true` | Enable automatic and manual fumble handling. |
|  | `debug` | bool | `false` | Enable CritAssist-specific debug messages. |
|  | `useEmojis` | bool | `true` | Use emoji styling in CritAssist output. |
|  | `rollDelayMs` | number | `200` | Delay between applicable table-roll actions. |
| **ConditionAssist** | `enabled` | bool | `true` | Enable condition menus, descriptions, and marker controls. |
|  | `command` | string | `"condition"` | Optional additional command alias; permanent `!condition` compatibility remains. |
|  | `rulesProfile` | enum | `"2014"` | Select `2014`, `2024`, or campaign-`custom` condition wording through the ConditionAssist settings panel. |
|  | `userAllowed` | bool | `false` | Allow players to request condition descriptions. |
|  | `userToggle` | bool | `false` | Allow players to change condition markers on selected tokens. |
|  | `sendOnlyToGM` | bool | `false` | Whisper condition descriptions only to the GM. |
|  | `showDescOnStatusChange` | bool | `true` | Show a condition description when its marker is added. |
|  | `showIconInDescription` | bool | `true` | Show built-in or registered custom marker artwork beside descriptions, with a readable fallback. |
|  | `conditions` | object | 15 definitions | Validated condition name, marker, and description map; manage through `!condition config`. |
| **TokenAssist** | `enabled` | bool | `true` | Enable general token controls and retained compatibility support for older `!token-mod` macros. |
|  | `playersCanUseIds` | bool | legacy value or `false` | Allow players to add explicit `--ids` targets; selected-token controls remain available. |
|  | `warnOnStandalone` | bool | `true` | Warn when standalone TokenMod is detected and compatibility handling is suspended. |
|  | `configSchemaVersion` | number | `1` | Protected TokenAssist configuration schema identifier. |
| **InitiativeAssist** | `enabled` | bool | `false` | Enable the `!Init-` workflow after choosing InitiativeAssist as the encounter's initiative owner. |
|  | `mode` | enum | `"manager"` | Use `manager` for guarded tracker writes or `observer` for status and audit only. |
|  | `hideNpcRolls` | bool | `true` | Hide NPC inline rolls and result details from players. GM-layer NPC rolls remain private even when this is false. |
| **CombatAssist** | `enabled` | bool | `false` | Enable explicit encounter, turn, and round tracking through the `!Combat-` workflow. |
|  | `announcements` | enum | `"gm"` | Send turn notices with `gm`, `public`, `whispers`, or `off`; Whispers privately gives the current player an authorized End My Turn button. |
|  | `playerConfirmations` | enum | `"standard"` | Use `standard` or `varied` private acknowledgements after a player successfully ends a turn. |
|  | `timerEnabled` | bool | `false` | Enable guarded turn timers; timers report only and never advance initiative. |
|  | `timerDurationSeconds` | number | `120` | Set the turn deadline from 10 to 3600 seconds. |
|  | `timerDeadlineAudience` | enum | `"gm"` | Send the deadline notice to `gm`, `player`, `both`, or `public`. |
|  | `timerReminders` | array | `[]` | Up to five seconds-remaining/audience records managed through `!Combat-Timer`. |
|  | `turnCue` | enum | `"off"` | Send a native non-centering ping to `gm`, `players`, `both`, or `public`; hidden turns remain GM-only. |
| **WelcomeAssist** | `enabled` | bool | `false` | Enable the optional post-bootstrap table greeting. Reload after setup for automatic behavior. |
|  | `mode` | enum | `"mixed"` | Use the professional default, built-ins, campaign greetings, or the combined weighted pool. |
|  | `delayMs` | number | `3000` | Wait 1-60 seconds after Bootstrap before checking health and greeting the table. |
|  | `showHeader` | bool | `true` | Show the greeting card header. |
|  | `header` | string | `"Game Night Is Ready"` | Set the bounded heading text; the default also includes a die icon. |
|  | `defaultGreeting` | string | professional greeting | Set the professional greeting used by default and mixed modes. |
|  | `customGreetings` | array | `[]` | Protected list of up to ten campaign greetings; manage through `!Welcome-Custom`. |
| **ConcentrationAssist** | `enabled` | bool | `true` | Enable concentration commands and tracking. |
|  | `marker` | string | `"Concentrating"` | Marker name used for status checks and removal. |
|  | `randomize` | bool | `true` | Randomize concentration emote flavor. |
| **NPCAssist** | `enabled` | bool | `true` | Enable NPC death tracking. |
|  | `autoTrackDeath` | bool | `true` | Automatically add/remove the death marker. |
|  | `notifyBloodied` | bool | `true` | Whisper the GM when an eligible living NPC crosses to half HP or below. |
|  | `autoNumberNpcTokens` | bool | `true` | Give newly added linked NPC tokens unique page-local names using the lowest available suffix. |
|  | `deadMarker` | string | `"dead"` | Marker used for death state. |
|  | `autoHide` | bool | `false` | Move newly dead NPC tokens to another layer. |
|  | `hideLayer` | string | `"gmlayer"` | Target layer used by `autoHide`. |
| **EffectAssist** | `enabled` | bool | `false` | Enable catalog-driven effect controls and supported 2014-sheet projections. |
|  | `markerOverrides` | object | `{}` | Protected release data for validated effect-marker choices; not an end-user `!ga-config` setting. |
|  | `customDefinitions` | object | `{}` | Protected bounded definitions created only through EffectAssist's guided custom-effect workflow. |
| **HPAssist** | `enabled` | bool | `true` | Enable NPC HP commands. |
|  | `autoRollOnAdd` | bool | `false` | Attempt HP rolling when qualifying tokens are added. |
| **DebugTools** | `enabled` | bool | `false` | Enable GM-only dry-run/apply debug commands. |

Examples:

```roll20chat
!ga-config get NPCAssist
!ga-config get NPCAssist deadMarker
!ga-config set NPCAssist notifyBloodied=false
!ga-config set NPCAssist autoNumberNpcTokens=false
!ga-config set NPCAssist autoHide=true
!ga-config set NPCAssist hideLayer=gmlayer
!ga-config set HPAssist autoRollOnAdd=true
!ga-config set CritAssist debug=false
!token-assist --config players-can-ids|off
```

---

## 10 · Developer API <a id="10-developer-api"></a>

### 10.1 Public API Summary

| Category | Method | Description |
| --- | --- | --- |
| **Module Registration** | `GameAssist.register(name, initFn, options)` | Register a module before Roll20’s `ready` event. |
| **Command Handling** | `GameAssist.onCommand(prefix, handler, moduleName, opts)` | Register a guarded API-command handler. |
| **Event Handling** | `GameAssist.onEvent(eventName, handler, moduleName)` | Register a guarded Roll20 event handler. |
| **Explicit Queue** | `GameAssist.enqueue(task, options)` | Explicitly submit serialized work; returns `true` if accepted. |
| **Listener Bookkeeping** | `GameAssist.offCommands(moduleName)` / `GameAssist.offEvents(moduleName)` | Clear GameAssist’s internal registry entries; cannot detach Roll20 handlers. |
| **Module Control** | `GameAssist.enableModule(name)` / `GameAssist.disableModule(name)` | Run guarded module lifecycle transitions. |
| **State Management** | `GameAssist.getState(name)` / `saveState(name, data)` / `clearState(name)` | Read, merge, or reset a module-owned state branch. |
| **Token Helper** | `GameAssist.getLinkedCharacter(token)` | Return `{ token, character }` for a valid linked object-layer token, otherwise `null`. |
| **Marker Service** | `GameAssist.MarkerService` | Resolve markers and artwork metadata, inspect state, add, remove, toggle, set, and observe through one structured contract. |
| **Turn Tracker Service** | `GameAssist.TurnTrackerService` | Read immutable native-tracker snapshots, classify rows, apply guarded lossless updates, and observe tracker changes. |
| **Semantic Events** | `GameAssist.SemanticEvents` | Publish or observe immutable versioned in-sandbox domain events without persistence or replay. |
| **Condition Assist** | `GameAssist.ConditionAssist` | Read validated condition definitions or apply add/remove/toggle actions through MarkerService. |
| **Token Assist** | `GameAssist.TokenAssist` | Inspect component provenance/lifecycle and subscribe to token changes made through supported TokenAssist commands. |
| **Initiative Assist** | `GameAssist.InitiativeAssist` | Inspect the currently classified mixed-sheet tracker roster while InitiativeAssist is running. |
| **Combat Assist** | `GameAssist.CombatAssist` | Inspect the active CombatAssist component version and a defensive copy of its current encounter record. |
| **Welcome Assist** | `GameAssist.WelcomeAssist` | Inspect the active module version; Bootstrap uses its guarded completion hook internally. |
| **Effect Assist** | `GameAssist.EffectAssist` | Create, end, inspect, audit, and observe source-aware semantic effect instances while the module is enabled. |
| **Chat Helpers** | `GameAssist.createButton(label, command)` / `GameAssist.rollTable(tableName)` | Create safe chat buttons or roll a sanitized table name. |
| **Config UI** | `GameAssist.renderConfigUI(playerId, options)` | Open the ConfigUI when that module is active. |
| **Metrics** | `GameAssist.getMetricsStore()` / `GameAssist.recordMetric(type, opts)` | Inspect or record metrics. |
| **Logging** | `GameAssist.log(mod, message, level, opts)` / `GameAssist.handleError(mod, error)` | Whisper safe logs and record errors. |

### 10.2 Module Registration

```js
GameAssist.register('MyModule', function initMyModule() {
    GameAssist.onCommand('!mymod', msg => {
        GameAssist.log('MyModule', `Hello, ${msg.who}`);
    }, 'MyModule');
}, {
    enabled: true,
    events: ['chat:message'],
    prefixes: ['!mymod'],
    teardown: null,
    dependsOn: [],
    preserveRuntimeOnDisable: false,
    protectedConfigKeys: []
});
```

Important contracts:

* Registration must happen before Roll20’s `ready` event.
* `events`, `prefixes`, and `dependsOn` are metadata; they do **not** wire handlers automatically.
* Modules still call `GameAssist.onEvent(...)` and/or `GameAssist.onCommand(...)`.
* A module should persist only inside `state.GameAssist.<Module>`.
* Dependencies may be reported as unverifiable if Roll20 does not expose script metadata.
* Runtime is cleared on disable by default. Set `preserveRuntimeOnDisable: true` only when the module deliberately stores durable records there; NPCAssist uses this for death-history buckets and Arc records.
* Use `protectedConfigKeys` when a complex configuration map must be changed only through a component-owned validator.

### 10.3 Command Matching

```js
GameAssist.onCommand('!mymod', handler, 'MyModule', {
    gmOnly: false,
    acl: [],
    match: {
        caseInsensitive: true,
        mode: 'token'
    }
});
```

| Option | Meaning |
| --- | --- |
| `gmOnly` | Refuse non-GM callers when `true`. |
| `acl` | Optional allowed player-ID list. |
| `match.caseInsensitive` | Match command case-insensitively when `true`. |
| `match.mode: 'token'` | Require a whitespace/end boundary after the command. Recommended for ordinary commands. |
| `match.mode: 'prefix'` | Intentionally match any content beginning with the prefix. Use sparingly. |

### 10.4 Events and Lifecycle Guards

```js
GameAssist.onEvent('change:graphic:bar1_value', (token, previous) => {
    // Handle the event directly.
}, 'MyModule');
```

Normal handlers execute directly and return early unless their module is initialized and active. `offCommands()` and `offEvents()` clear GameAssist’s internal bookkeeping but cannot unregister callbacks from Roll20’s event bus.

### 10.5 Explicit Queue

Use the queue only when order or non-overlap matters:

```js
GameAssist.enqueue(() => {
    // Synchronous serialized work.
});

GameAssist.enqueue(() => new Promise(resolve => {
    sendChat('', '[[1d20]]', results => {
        // Process results, then settle the queued portion.
        resolve();
    });
}), {
    priority: 0,
    timeout: 30000
});
```

Queue rules:

* `GameAssist.enqueue(task, options)` returns `true` when accepted and `false` when `task` is invalid.
* Async queued work must return a Promise.
* Higher numeric priority runs first; equal-priority tasks preserve enqueue order.
* A timeout advances/releases the queue but cannot cancel the underlying operation.
* Never use the queue merely because an event exists.

### 10.6 MarkerService

`GameAssist.MarkerService` is toggleable core infrastructure. It begins enabled and may be controlled through `!ga-enable MarkerService`, `!ga-disable MarkerService`, or ConfigUI. Marker-dependent modules must be enabled only while the service is running.

```js
const markers = GameAssist.MarkerService;

const resolution = markers.resolve('Concentrating');
const artwork = markers.artwork('Concentrating');
const inspection = markers.inspect(token, 'Concentrating');
const added = markers.add(token, 'Concentrating');
const removed = markers.remove(token, 'Concentrating');
const toggled = markers.toggle(token, 'Concentrating');
const setResult = markers.set(token, 'Concentrating', true);

const subscription = markers.observe(event => {
    // event.added, event.removed, event.previous, event.current, event.token
}, { owner: 'MyModule' });

// Later:
subscription.unsubscribe();
```

Public operations:

| Method | Result |
| --- | --- |
| `version` | MarkerService component version (`1.0.1`). |
| `isEnabled()` | Reports whether MarkerService currently accepts marker work. |
| `resolve(marker)` | Resolves a built-in id, custom display name, exact stored tag, or numbered stored value. |
| `artwork(marker)` | Returns presentation-neutral built-in or registered custom artwork metadata; consumers provide readable fallback UI when unavailable. |
| `read(token)` | Returns the complete parsed marker list, including duplicates and number overlays. |
| `inspect(token, marker)` | Returns resolution, presence, match count, and matching stored entries. |
| `has(token, marker)` | Boolean convenience check. Use `inspect` when diagnostics matter. |
| `add/remove/toggle/set` | Returns `ok`, `changed`, `verified`, before/after entries, and an error code/message when unsuccessful. |
| `observe(callback, options)` | Subscribes to the shared marker-change stream and returns an unsubscribe handle. |
| `clearObservers(owner)` | Removes every observer registered under an owner name. |
| `getRegistry()` | Returns the readable campaign custom-marker registry and the Roll20 property that supplied it. |

Marker removal clears every duplicate instance of the requested marker. Other marker ids, duplicate entries for unrelated markers, and number overlays are preserved. Adding an already-present marker is idempotent unless a number option explicitly updates its first matching entry.

Custom marker lookup reads Roll20's documented `token_markers` campaign property first and uses `_token_markers` only as a compatibility fallback when the documented value is absent or unusable. Built-in marker ids and exact stored `Name::id` tags do not require either registry property to resolve.

When MarkerService is disabled, marker operations return `UNAVAILABLE` with the command needed to restore the service. ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools are disabled before the service closes so their teardown can complete safely. Observer registrations pause while the service is off and resume when it is enabled again.

### 10.7 TurnTrackerService

`GameAssist.TurnTrackerService` is toggleable, rules-neutral infrastructure. It owns GameAssist reads and writes to Roll20's native `Campaign().get('turnorder')` data but does not decide who should roll, advance turns, or manage rounds.

```js
const tracker = GameAssist.TurnTrackerService;
const snapshot = tracker.snapshot();

if (snapshot.ok) {
    const rows = snapshot.entries.map((entry, index) =>
        tracker.classifyEntry(entry, index, snapshot)
    );
}

const subscription = tracker.observe(event => {
    // event.current is a fresh immutable snapshot.
}, { owner: 'MyModule' });
```

| Method / Field | Result |
| --- | --- |
| `version` | TurnTrackerService component version (`1.0.0`). |
| `isEnabled()` | Reports whether the service currently accepts tracker work. |
| `snapshot()` | Returns the active initiative page, exact raw tracker data, immutable parsed entries, and a revision identifier. Malformed JSON returns a refusal result. |
| `classifyEntry(entry, index, snapshot)` | Structurally identifies custom, token, missing-token, off-page, or unknown rows without applying game rules. |
| `apply(mutator, options)` | Gives the mutator a fresh cloned tracker, serializes one guarded Roll20 write, preserves unmodified fields, and returns before/after snapshots. |
| `observe(callback, options)` | Subscribes to native or GameAssist-owned tracker changes. |
| `clearObservers(owner)` | Removes observers registered under one owner. |

Consumers should preserve fields they do not own and refuse malformed input. Disabling TurnTrackerService first disables InitiativeAssist and CombatAssist and leaves Roll20's current tracker untouched.

### 10.8 ConditionAssist

`GameAssist.ConditionAssist` is available while the module is running:

```js
const conditions = GameAssist.ConditionAssist;

const prone = conditions.getCondition('prone');
const allDefinitions = conditions.getConditions();
const result = conditions.apply([token], ['prone', 'poisoned'], 'add');
```

| Method | Result |
| --- | --- |
| `version` | ConditionAssist component version (`1.0.1`). |
| `configSchemaVersion` | Validated condition export/import schema version (`2`). |
| `rulesProfile()` | Returns the active `2014`, `2024`, or `custom` wording source. |
| `getCondition(name)` | Returns a copy of one definition or `null`. |
| `getConditions()` | Returns a deep copy of every configured definition. |
| `apply(tokens, names, action)` | Applies `add`, `remove`, or `toggle` through MarkerService and returns changed/unchanged/failed counts. |

The public API refuses mutation while ConditionAssist is disabled. Callers must inspect `ok`; a disabled module returns `UNAVAILABLE`, and an unsupported action returns `INVALID_ARGUMENT`.

### 10.9 TokenAssist

`GameAssist.TokenAssist` is available for integrations that need TokenAssist lifecycle, provenance, or command-owned token-change notifications:

```js
const tokens = GameAssist.TokenAssist;

const subscription = tokens.observeTokenChange((token, previous, context) => {
    // Called after a supported TokenAssist command changes this token.
    // context.source === 'TokenAssist'; context.command contains the API command.
}, { owner: 'MyModule' });

// Later:
subscription.unsubscribe();
```

| Method / Field | Result |
| --- | --- |
| `version` | TokenAssist component version (`1.0.1`). |
| `configSchemaVersion` | TokenAssist configuration schema (`1`). |
| `reference` | Pinned TokenMod reference version, repository, commit, path, and blob. |
| `isEnabled()` | Reports whether TokenAssist and MarkerService are both running. |
| `observeTokenChange(callback, options)` | Subscribes to successful TokenAssist command mutations and returns an unsubscribe handle. |
| `ObserveTokenChange(callback, options)` | Compatibility spelling on the GameAssist-owned API object; no global `TokenMod` object is created. |
| `clearObservers(owner)` | Removes observers registered under one owner, or all observers when the owner is omitted. |

Use `GameAssist.MarkerService.observe(...)` when the integration needs every marker change, including direct GameAssist condition, death, concentration, or debug actions. Use TokenAssist observation only for complete token mutations performed by its supported command handler.

### 10.10 InitiativeAssist

`GameAssist.InitiativeAssist` is available while the module is running:

```js
const roster = await GameAssist.InitiativeAssist.getRoster();
```

The result retains the TurnTrackerService snapshot and adds InitiativeAssist classifications such as PC, NPC, object, death state, attention messages, resolved modifier, and reroll eligibility. The API is read-only in `1.0.1`; tracker mutations remain behind the guarded `!Init-` UX and TurnTrackerService authority.

### 10.11 CombatAssist

`GameAssist.CombatAssist` is available while CombatAssist is running:

```js
const encounter = GameAssist.CombatAssist.getStatus();
```

`version` reports CombatAssist `1.0.5`. `getStatus()` returns a defensive copy of the current encounter record or `null`; changing the returned object cannot alter saved GameAssist state. Tracker mutation remains behind GM-only Next, Previous, and confirmed Restore controls or the current player's token-bound End My Turn control, and every path uses TurnTrackerService authority. A recognized round counter is reported as the round source. Timer callbacks and native pings remain private module behavior and expose no mutation API.

### 10.12 WelcomeAssist

`GameAssist.WelcomeAssist` exists only while WelcomeAssist is running. Its `version` field is available for inspection. The `onBootstrapComplete()` method is the module's internal post-bootstrap lifecycle hook; external modules should not call it to produce additional greetings. Public management belongs to the guarded short `!Welcome` commands; the longer `!welcome-assist` family remains a compatibility alias.

### 10.13 SemanticEvents

`GameAssist.SemanticEvents` is always available as lightweight in-sandbox infrastructure. It does not discover or enable providers, persist events, replay startup history, or move ordinary handlers onto the queue.

```js
const subscription = GameAssist.SemanticEvents.observe(event => {
    // event.type, event.producer, event.eventId, event.sequence, event.payload
}, {
    owner: 'MyModule',
    types: ['effect.lifecycle.changed']
});

const result = GameAssist.SemanticEvents.publish(
    'example.completed',
    'MyModule',
    { id: 'example-1' }
);

// Later:
subscription.unsubscribe();
```

Every accepted event includes `eventSchemaVersion`, `eventId`, `streamId`, monotonic `sequence`, `type`, `producer`, RFC-3339 `occurredAt`, optional `causeEventId`, and a deeply frozen JSON-safe `payload`. Delivery is direct and ordered. Observer exceptions are isolated through GameAssist diagnostics.

### 10.14 EffectAssist

`GameAssist.EffectAssist` is created when EffectAssist is first enabled:

```js
const effects = GameAssist.EffectAssist;
const result = effects.apply({
    definitionId: 'bless',
    sourceTokenId,
    targetTokenIds,
    createdBy: 'MyModule',
    requestId
});
```

| Method / Field | Result |
| --- | --- |
| `version` / `stateSchemaVersion` | EffectAssist module and durable-state contract versions. |
| `isAvailable()` | Reports the saved module enablement state. |
| `getDefinitions()` | Returns defensive copies of built-in and campaign effect definitions. |
| `getActiveInstances()` / `getHistory()` | Returns defensive copies of active and bounded ended records. |
| `apply(request)` | Atomically validates source and targets, records one semantic instance, and applies every supported projection or rolls the operation back. |
| `end(instanceId, actor)` | Ends one source instance idempotently and removes only unneeded EffectAssist-owned projections. |
| `audit()` | Returns a defensive read-only comparison of records, ownership, marker/condition state, concentration, and 2014-sheet rows. |
| `observe(callback, options)` | Filters SemanticEvents to `effect.lifecycle.changed`. |
| `clearObservers(owner)` | Clears semantic observers registered under the exact owner. |
| `registerProjectionAdapter(name, adapter)` | Adds a validated projection adapter without changing the stored effect identity. Built-ins cover MarkerService, ConditionAssist, record-only, and verified 2014 repeating modifiers. |

A script-provided `requestId` is bounded and idempotent for the retained runtime window. A reused ID with a different intent is refused. Apply is transactional across its supported projections; a partial write is rolled back. Cleanup uses exact ownership evidence, preserves pre-existing state, and leaves externally edited sheet rows in place for GM review.

### 10.15 MECHSUITS Contribution Contract

The executable file follows MECHSUITS v1.5.2 conventions:

* Preserve literal codename and tags: `GAMEASSIST`.
* Keep the file-scoped `canonical_tree` synchronized with actual tags.
* Maintain proper parent/child nesting and paired `BEGIN`/`END` tags.
* Update the narrowest complete framed section whose behavior or contract changes.
* Apply the Meaningful Change Rule to `last_updated_version` and the section footer.
* Preserve prior notes instead of silently deleting project history.
* Do not claim full MECHSUITS compliance without checking the complete v1.5.2 checklist.

---

## 11 · Roll-Table Cookbook <a id="11-roll-table-cookbook"></a>

CritAssist expects these exact Roll20 rollable-table names:

| Table | Intended Use |
| --- | --- |
| `CF-Melee` | Melee weapon fumbles. |
| `CF-Ranged` | Ranged weapon fumbles. |
| `CF-Thrown` | Thrown weapon fumbles. |
| `CF-Spell` | Spell attack fumbles. |
| `CF-Natural` | Natural weapon/unarmed fumbles. |
| `Confirm-Crit-Martial` | Martial critical confirmation/flavor. |
| `Confirm-Crit-Magic` | Magic critical confirmation/flavor. |

Table names must match exactly. GameAssist supplies the roll; you own the entries, weights, and campaign tone.

### 11.1 Sample `CF-Melee` Table

| Entry | Weight | Example Effect |
| --- | ---: | --- |
| **Sweaty Grip** | 1 | Disadvantage on your next attack. |
| **Weapon Twists** | 3 | The attack deals half damage. |
| **Off-Balance** | 2 | You fall prone. |
| **Lost Grip** | 1 | Your weapon falls at the opponent’s feet. |
| **Double Trouble** | 1 | Roll twice; both effects apply. |

### 11.2 Sample Confirmation Tables

| Table | Example Entry | Weight |
| --- | --- | ---: |
| `Confirm-Crit-Martial` | “Perfect opening—describe the decisive strike.” | 1 |
| `Confirm-Crit-Magic` | “Arcane resonance—describe how the spell intensifies.” | 1 |

> **Content note:** Sample effects are suggestions, not enforced mechanics. Adjust them for your system, tone, and player expectations.

---

## 12 · Macro Recipes <a id="12-macro-recipes"></a>

### 12.1 GM Health Dashboard

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

### 12.2 GM Panic – Disable Every Bundled Module

```roll20chat
!ga-disable MarkerService
!ga-disable TurnTrackerService
!ga-disable ConfigUI
!ga-disable CritAssist
!ga-disable HPAssist
```

Disabling MarkerService also turns off ConditionAssist, TokenAssist, ConcentrationAssist, NPCAssist, and DebugTools. Core admin commands remain available. NPCAssist's configured marker may be cleared from current-page tokens, but its saved death-history and Arc records are retained.

Disabling TurnTrackerService also turns off InitiativeAssist and CombatAssist and leaves the current native Turn Tracker unchanged.

### 12.3 Restore Normal Bundled Modules

```roll20chat
!ga-enable MarkerService
!ga-enable TurnTrackerService
!ga-enable ConfigUI
!ga-enable CritAssist
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable ConcentrationAssist
!ga-enable NPCAssist
!ga-enable HPAssist
```

Leave InitiativeAssist, CombatAssist, WelcomeAssist, and DebugTools disabled until they are deliberately wanted.

### 12.4 Concentration Check Prompt

```roll20chat
!concentration --damage ?{Damage Taken|10} --mode ?{Mode|normal|adv|dis}
```

### 12.5 NPC Death Controls

```roll20chat
!npc-death-report
!npc-death-report --scope campaign
!npc-death-buckets
!NPC-WR
!npc-death-audit
!npc-death-report --recent
!npc-death-clear --scope session
!npc-death-clear --scope session --confirm
!npc-death-clear --scope section --nested --confirm
!npc-death-arc
```

### 12.6 NPC HP Setup

```roll20chat
!HP-Selected
```

Select the desired linked NPC tokens before running the macro.

### 12.7 Safe Marker Debug

```roll20chat
!ga-enable DebugTools
!ga-debug marker --marker dead --state toggle
```

The first run is a dry run. Add `--apply` only after checking the preview.

### 12.8 TokenAssist Selected-Token Controls

```roll20chat
!token-assist help
!ta-on showname
!ta-set bar1_value|-5
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
!ta-set statusmarkers|!red
```

Select disposable tokens first. The first command opens the guide; the remaining examples show a nameplate, subtract 5 from bar 1, create a visible circular aura, and toggle the red marker through MarkerService.

### 12.9 InitiativeAssist Encounter Controls

```roll20chat
!ga-enable InitiativeAssist
!Init-Go
!Init-GM
!Init-Roll-Selected
!Init-RR
!Init-RR-Menu
!Init-Audit
```

Use these only after opening Roll20's Turn Tracker on the encounter page. `!Init-GM` opens the neutral controls and roster privately when no public invitation is wanted. `!Init-Roll-Selected` adds or updates the selected controlled characters even when they are not yet in the tracker. `!Init-RR` rerolls PCs and living NPCs already in that tracker, whispers the result list to the GM, and does not add every page token or change custom counters.

`!Init-Help` opens instructions, `!Init-Menu` opens the action-focused Control Center, `!Init-Status` gives a quick chat summary, and `!Init-Audit` whispers the detailed read-only review without creating a handout.

### 12.10 CombatAssist Encounter Controls

```roll20chat
!ga-enable CombatAssist
!Combat-Start
!Combat-Next
!Combat-Prev
!Combat-Adopt
!Combat-Restore
!Combat-Pause
!Combat-Resume
!Combat-Status
!Combat-Timer
!Combat-Cue
!Combat-End
```

Establish initiative first. Start CombatAssist only when the encounter actually begins. Roll20's native arrows remain the normal tracker controls; Next and Previous are guarded alternatives. A single custom **Round Counter** row with value `1` and calculation `+1` can supply the round boundary and number. Adding or removing combatants, manually reordering the tracker, and using `!Init-RR` preserve the round and establish a fresh cycle from the current first entry. Pause is optional when making several edits. Restore previews one saved tracker checkpoint; `!Combat-End` asks for confirmation and leaves the native tracker intact.

### 12.11 WelcomeAssist Setup

```roll20chat
!ga-enable WelcomeAssist
!Welcome
!Welcome-Custom add Dovie'andi se tovya sagain
!Welcome-Mode mixed
!Welcome-Preview
```

Preview privately, then reload the sandbox when the greeting is ready. Use `!Welcome-Announce` only when an immediate public greeting is intended.

---

## 13 · Performance Benchmarks <a id="13-performance-benchmarks"></a>

> **Historical reference only:** The following numbers were recorded for an earlier v0.1.3-era build and have **not** been revalidated for v0.1.5.x. Roll20 sandbox load, campaign size, browser state, network conditions, token formulas, and other Mods can materially change results. Do not treat this table as a current performance guarantee.

| Environment Item | Historical Test Environment |
| --- | --- |
| CPU / RAM | Ryzen 7 7735HS @ 3.2 GHz · 16 GB DDR5-4800 |
| OS / Browser | Windows 11 Home 24H2 · Chrome 137 |
| Roll20 sandbox | Experimental channel, April 2025-era build |
| Dataset | 25 NPC tokens on one page |

**Historical `!HP-All` timing**

| Run Group | Samples | Mean | Median | Standard Deviation | Min–Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Warm sandbox | 24 | 280 ms | 268 ms | 24 ms | 253–337 ms |
| Fresh sandbox | 10 | 355 ms | 350 ms | 18 ms | 330–387 ms |
| **Combined** | **34** | **298 ms** | **300 ms** | **39 ms** | **253–387 ms** |

### 13.1 Repeatable Benchmarking for v0.1.5.x

1. Duplicate the campaign or use a test game.
2. Record token count, active Mods, formulas, and sandbox channel.
3. Run both fresh-sandbox and warm-sandbox samples.
4. Test visible user behavior, not only queue metrics.
5. Remember that `!ga-metrics` queue durations describe explicit queued work; direct event-handler work is not automatically represented as a queue duration.

---

## 14 · Troubleshooting <a id="14-troubleshooting"></a>

### 14.1 GameAssist Appears Unresponsive

Run:

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

Start with the default `!ga-status` system check. A separate **GameAssist Actions** whisper immediately below the table provides **Troubleshooting Details**, **Modules & Services**, and **Open Settings** buttons. The detailed view uses a separate **Troubleshooting Actions** strip for **Refresh Details**, **Simple View**, **Modules & Services**, and **Metrics**. The details table keeps session counters, queue information, the last recorded activity, and GameAssist's internal event-hook count separate from the health result.

### 14.2 A Module Is Configured but Not Running

Use:

```roll20chat
!ga-config modules
```

The output distinguishes:

* **Configured** – stored `enabled` preference.
* **Running** – initialized and active in the current sandbox.
* **Dependency-skipped** – not running because a dependency is confirmed missing.
* **Unverifiable dependency** – GameAssist could not confirm the dependency and proceeded with a warning.

Then try:

```roll20chat
!ga-enable <ModuleOrService>
```

### 14.3 MarkerService and Other Marker Mods

ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools use `GameAssist.MarkerService`; they should report `deps confirmed` without standalone TokenMod or StatusInfo.

Run:

```roll20chat
!ga-status --details
!ga-config modules
```

The details panel should report MarkerService as enabled. ConditionAssist and TokenAssist should appear enabled and running after standalone StatusInfo and TokenMod are removed. If a standalone script is detected, the details explain which overlapping command handler is suspended.

If another Mod must own marker behavior, use `!ga-disable MarkerService`. GameAssist disables ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools first, then turns off MarkerService. The chat notice identifies the affected features; unrelated GameAssist modules remain available. Re-enable MarkerService before re-enabling any dependent module.

### 14.4 TokenAssist Does Not Respond or a Token Does Not Change

Run:

```roll20chat
!ga-config modules
!ga-status --details
!token-assist help
```

TokenAssist and MarkerService must both be running. If troubleshooting details report standalone TokenMod, remove that script and restart the sandbox. While the collision exists, TokenAssist leaves only the deprecated `!token-mod` alias to the standalone handler; the `!token-assist`, `!ta`, and `!ta-*` commands remain available.

Select a disposable token and try:

```roll20chat
!ta-on showname
!ta-set name|"TokenAssist Test"
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
```

Values containing spaces must be quoted. Players may use selected-token commands, but `--ids` remains restricted unless the GM enables it through `!token-assist --config players-can-ids|on` or `!ta-config players-can-ids|on`. Commands involving unsupported advanced image, default-token, computed/name-resolved attribute, controller-list, color-math, multi-sided-token, duplicate marker index, conditional marker count, or TokenMod-style help-handout rebuilding are outside TokenAssist 1.0.4's compatibility boundary and should produce a clear warning rather than a partial mutation.

### 14.5 ConditionAssist Does Not Respond, Shows the Wrong Wording, or Uses the Wrong Marker

Run:

```roll20chat
!ga-config modules
!condition help
!condition config
!cond-prone
!condition status
```

Confirm MarkerService and ConditionAssist are running, and remove standalone StatusInfo if both tools are responding. The Settings panel identifies the active **2014 SRD**, **2024 SRD**, or **Campaign Custom** wording source. Use the profile buttons to restore an official set, or open **Manage Conditions** to edit one description or check its marker. Built-in ids, custom display names, exact `Name::id` tags, and numbered markers such as `red@3` are supported. `!condition status` separates markers that match configured conditions from other active markers so the GM can tell whether the marker exists but lacks a ConditionAssist definition. Use the validated ConditionAssist importer for definition maps; generic `!ga-config set ConditionAssist conditions=...` is intentionally refused.

When a marker action fails, first verify the configured marker and target token rather than changing TokenMod permissions:

```roll20chat
!ga-config get NPCAssist deadMarker
!ga-config get ConcentrationAssist marker
!npc-death-audit
!concentration --status
```

For an exact custom marker, configure either its display name or stored `Name::id` tag. A valid exact stored tag remains usable even when Roll20's campaign marker registry cannot be parsed.

### 14.6 Startup Messages Are Missing

This is normally expected. `GameAssist.flags.QUIET_STARTUP` defaults to `true`, suppressing module-specific startup whispers. The core ready message remains visible.

Use `!ga-status` and `!ga-config modules` instead of relying on one whisper per module.

### 14.7 State Repair or Unknown-Branch Warnings

Known module branches with malformed/missing `config` or `runtime` containers are repaired conservatively at startup. Valid existing config is preserved.

Unknown branches are not deleted automatically. Review the warning, then explicitly remove orphaned branches only when you are certain:

```roll20chat
!ga-config cleanup
```

### 14.8 `!ga-config list` Is Not a Full Backup

The `GameAssist Config` handout contains flags, global config, and module config only. It excludes runtime caches, metrics, and unknown state branches. v2.0.0 cannot import the snapshot.

Use it for configuration review and upgrade comparison—not as a full restore mechanism.

### 14.9 CritAssist Menu or Table Roll Fails

Confirm all seven table names exist exactly:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

Then run:

```roll20chat
!critfumble menu
!critfumble help
!critfumble-melee
!confirm-crit-martial
```

### 14.10 NPC Death Marker Does Not Match HP

Run:

```roll20chat
!ga-config get NPCAssist deadMarker
!npc-death-audit
!npc-death-repair
```

Confirm the token:

* is on the Objects layer,
* represents a character,
* has character attribute `npc=1`,
* uses `bar1_value` for HP,
* and has a valid configured marker.

`!npc-death-audit` whispers a bounded list of the specific tokens needing a marker added or removed, and writes the complete mismatch list to the `GameAssist NPC Death Audit` handout. Player characters are intentionally excluded from this audit.

The audit does not change markers. Use its **Review Marker Repairs** button or run `!npc-death-repair` to preview corrections. Read the proposed changes before confirming: repair follows current bar 1 HP, so a token whose HP is wrong should be corrected manually first. `!npc-death-repair --confirm` re-scans the page, changes only the configured death marker, and leaves HP and history untouched.

`!npc-death-report` shows recorded bucket history in summary/detail views; it does not audit the page.

### 14.11 Concentration Marker Does Not Clear

Select the affected token and run:

```roll20chat
!ga-config get ConcentrationAssist marker
!concentration --off
!concentration --status
```

`!concentration --status` reads through MarkerService and should always respond while ConcentrationAssist is running. If it reports that the configured marker cannot be recognized, inspect the campaign marker library and run:

```roll20chat
!ga-config set ConcentrationAssist marker=<name-or-tag>
```

For a custom marker, the exact stored `Name::id` tag is the most deterministic configuration.

### 14.12 NPC HP Does Not Roll

Confirm the token:

* is linked to a character,
* represents an NPC with `npc=1`,
* has a valid `npc_hpformula` such as `4d8+8`,
* and is on the correct page or selected for the command.

HPAssist does not require TokenMod.

### 14.13 Debug Command Does Nothing

Enable DebugTools first:

```roll20chat
!ga-enable DebugTools
```

DebugTools performs a dry run unless `--apply` is supplied. To use selected tokens, omit `--token`; do not write `--token select`.

### 14.14 InitiativeAssist Does Not Roll or Preserves a Row

Run:

```roll20chat
!ga-config modules
!Init-Status
!Init-Audit
```

Confirm Roll20's Turn Tracker is open on the intended encounter page and InitiativeAssist is enabled in **Manager** mode. A character does not need an existing tracker row for **Roll Initiative**, **Roll Selected**, or **Roll Options**; it needs an object-layer token on the tracker page, a linked character sheet, and control assigned to the clicking player. The GM may also roll linked living NPCs from the GM layer through the private roster. If the player is on another page or control/linkage is missing, InitiativeAssist names that setup problem directly.

Use `!Init-GM` when the GM needs the neutral initiative controls and complete roster without posting the player invitation publicly. If it produces no panel, confirm InitiativeAssist is running in Manager mode and the Turn Tracker is open on the encounter page.

TurnTrackerService accepts both the normal Roll20 tracker page id and the open-tracker boolean used by some campaign sessions. With an empty tracker it uses the Player Ribbon page; with existing turns it identifies the single page containing those token rows. It refuses to guess if tracker tokens genuinely span multiple pages.

The detailed Initiative Review separates current Turn Tracker rows from linked characters found on the tracker page and whispers the result to the GM without creating a handout. It explains rows skipped because they are custom entries, objects, dead NPCs, off-page tokens, stale references, unsupported sheet data, HP/death-marker mismatches, or characters whose initiative data cannot be read. InitiativeAssist also probes compatible 2014 attributes or 2024 Beacon data when Roll20 omits or changes the character's sheet label. GameAssist-created turns include Roll20's encounter-page field and are checked before success is reported; if a completed result is ever absent from Turn Order, record the exact result and current page for troubleshooting.

For D&D 2024 characters, use Roll20's supported Experimental Mod API server when Beacon computed data is unavailable. InitiativeAssist deliberately leaves an unreadable 2024 row unchanged rather than rolling with zero. For coexistence with another initiative roller, use `!Init-Mode observer` and let only one tool write initiative values.

### 14.15 CombatAssist Stops Counting

Run:

```roll20chat
!ga-config modules
!Combat-Status
!Combat-Menu
```

CombatAssist reports **attention** when the tracker is not trustworthy enough to follow. Common causes are a closed tracker, a page change, malformed tracker data, a stale token reference, duplicate identities, or native movement with exactly two entries where Roll20 does not reveal the direction. Valid additions, removals, rerolls, priority changes, and manual reordering preserve the round and rebaseline automatically.

Use **Use Current Tracker** when the visible order is correct. Use **Restore Last Safe Tracker** or **Undo Last Tracker Change** when the preceding saved order should return; restoration always previews its effect and refuses to continue if the tracker changed after that preview. Use **Restart at Round 1** only when the GM deliberately wants a new encounter baseline.

With exactly two rows, use `!Combat-Next` or `!Combat-Prev`. Roll20 exposes the same two-row result for its native forward and backward arrows, so CombatAssist refuses to guess the direction.

If a player cannot use **End My Turn**, confirm announcement mode is `whispers`, the button came from the newest turn message, and the linked character still names that player as a controller. Character control is authoritative when a token is linked. A successful click receives a private Turn Complete message; an older button receives a friendly notice that the tracker already advanced.

If a native custom **Round Counter** does not advance through `!Combat-Next`, confirm it has one of the documented whole-label names, a positive whole-number current value, and a simple signed whole-number Round Calculation such as `+1`. CombatAssist refuses multiple plausible counters rather than choosing one silently. Native Roll20 arrow movement normally evaluates the calculation itself; CombatAssist evaluates the same simple calculation on its own guarded forward movement.

If a turn reminder appears late, record whether initiative was advanced through Roll20, CombatAssist, InitiativeAssist, or another Mod. GameAssist binds each callback to the exact encounter, round, current token, tracker revision, and deadline; a callback from an older turn should produce no message. `!Combat-Timer` shows the live configuration. `!Combat-Cue` shows the current ping audience; hidden and GM-layer turns are always restricted to the GM.

If another Mod also advances turns, manages rounds, rewrites tracker rows, or inserts and updates counters, use only one encounter-flow owner. Disabling CombatAssist leaves InitiativeAssist and the native tracker available.

### 14.16 WelcomeAssist Does Not Greet the Table

Run:

```roll20chat
!ga-config modules
!Welcome-Status
!Welcome-Preview
```

WelcomeAssist starts disabled. Enable it, configure and preview it, then reload the Mod sandbox; enabling it during a running sandbox intentionally does not announce. The automatic greeting waits 1-60 seconds, runs at most once per sandbox lifecycle, and is skipped when another configured GameAssist component remains inactive. In that case, the GM warning names the blocking component.

`!Welcome-Preview` is private. `!Welcome-Announce` is public and consumes the automatic greeting opportunity for the current sandbox so the table does not receive a duplicate after the timer fires. Custom mode falls back to the professional greeting when its campaign list is empty. Existing `!welcome-assist` macros remain accepted.

### 14.17 EffectAssist Reports a Pending or Mismatched Projection

1. Confirm EffectAssist is enabled with `!ga-config modules`.
2. Open `!Effect-Status`, then run `!Effect-Audit`.
3. A **pending** projection means the semantic effect record is safe but a required marker, condition, concentration, or sheet adapter could not complete.
4. A **missing or changed projection** means the effect record and ownership ledger still exist, but a marker, condition, concentration state, or exact 2014-sheet row changed.
5. A **token identity change** means the exact token now represents a different character. EffectAssist refuses automatic cleanup or repair on that token.
6. If an EffectAssist-created sheet row was edited, keep it or remove it manually after reviewing the character; EffectAssist intentionally will not delete an edited row.
7. Use the audit's generated confirmation button only when the displayed repair matches the GM's intent. A stale, expired, or different-GM confirmation is refused.

Disabling EffectAssist preserves valid records and projections. Re-enable it and audit before ending or repairing effects. A marker that existed before EffectAssist applied the first source is intentionally preserved after the final source ends.

### 14.18 Compatibility Hints

Compatibility scanning is debug-only:

```js
GameAssist.flags.DEBUG_COMPAT = true;
```

Reload, inspect the output, then return it to `false` to avoid noise. If another Mod processes the same natural-1 attack rolls, concentration markers, NPC death events, NPC HP/bar 1 changes, initiative values, custom tracker rows, rounds, or turn advancement, choose one tool to own that responsibility. InitiativeAssist Observer mode prevents its initiative writes; disabling CombatAssist prevents its encounter-flow controls while leaving the native tracker unchanged.

### 14.19 Still Stuck?

Capture:

1. Exact GameAssist version.
2. `!ga-status` output.
3. `!ga-config modules` output.
4. Exact command/action that failed.
5. Exact API sandbox error text.
6. Which other Mods can change the same token bars, markers, attack-roll messages, initiative values, or Turn Tracker rows.

These details help maintainers reproduce the campaign conditions and focus the investigation quickly.

---

## 15 · Upgrade Paths <a id="15-upgrade-paths"></a>

### 15.1 Recommended Upgrade: v1.8.2 → v2.0.0

I. **Record the Working Campaign**

1. Keep a copy of the complete v1.8.2 script.
2. Run `!ga-config list` for a configuration-only comparison snapshot.
3. Record `!ga-config modules`, active NPC reporting scopes, and any non-default marker names.

> The snapshot is not a full-state backup and cannot be imported automatically. NPC history, Arc records, runtime caches, and future EffectAssist instances are intentionally outside it.

II. **Replace the Complete Script**

1. Replace v1.8.2 with the complete GameAssist v2.0.0 file.
2. Save or restart the Mod sandbox.
3. Do not combine framed sections from different releases.

III. **Confirm Existing Modules First**

```roll20chat
!ga-status
!ga-status --details
!ga-config modules
!NPC-Status
!Con-Status
!HP-Status
```

EffectAssist should appear configured off and paused on first installation. Existing canonical module settings, NPC records, and established command aliases remain available.

IV. **Enable and Prove EffectAssist Deliberately**

```roll20chat
!ga-enable EffectAssist
!Effect-GM
!Effect-Status
!Effect-Audit
```

Use disposable linked 2014 PC tokens for one complete Bless lifecycle, two overlapping Bless sources, one final cleanup, one pre-existing-marker preservation check, and one manual marker-removal audit/repair cycle. Confirm that Bless creates `Bless (GameAssist)` rows in the target's global attack and saving-throw modifiers, establishes concentration on the source, and removes only owned state when concentration ends. Other Mods that create, edit, or remove global attack, saving-throw, or AC modifier rows can overlap EffectAssist's Bless, Warding Bond, or Haste projections; let one tool own each effect row and audit after testing overlapping automation.

V. **Run the Release Smoke Test**

Use [§4.1 Minimum Smoke Test](#41-minimum-smoke-test), the focused v2.0.0 EffectAssist track, and the retained v1.8.2 regression in `Smoketest.md`. Include the ordinary death/revival, concentration, HP, condition, initiative, combat, welcome, and module lifecycle checks used by the campaign.

### 15.2 Rollback

If v2.0.0 fails its smoke test:

1. Replace it with your complete previous working script.
2. Save/reload.
3. Run `!ga-status` and the smallest relevant module checks.
4. Remember that rolling back code does not automatically roll back persistent state.
5. Do not attempt manual state import unless you have a separately validated process.

### 15.3 Upgrade Discipline

> **Copy → Save → Inspect → Smoke Test → Keep or Roll Back**

Do not make a live-session release decision from syntax checks alone. The Roll20 API sandbox remains the final compatibility test.

---

## 16 · Contributing <a id="16-contributing"></a>

Thank you for helping improve GameAssist. Contributions should remain narrow, testable, and explicit about Roll20 limitations.

### 16.1 Reporting Issues

Include:

1. A clear title and exact GameAssist version.
2. Reproduction steps in a minimal test game when possible.
3. Relevant commands, token setup, and character attributes.
4. Exact API sandbox errors and GameAssist whispers.
5. `!ga-status` and `!ga-config modules` results.
6. Whether dependencies were confirmed, missing, or unverifiable.

### 16.2 Coding Style

* Use the existing JavaScript style and Roll20-compatible runtime features.
* Preserve literal identifiers, public commands, module names, tags, and codename `GAMEASSIST`.
* Prefer shared helpers when behavior is genuinely shared.
* Validate and normalize at input edges.
* Keep ordinary handlers direct; use `GameAssist.enqueue(...)` only for work that requires serialization.
* Do not override Roll20’s global `on` or invent an `off` lifecycle that Roll20 does not provide.
* Never claim that a timeout cancels an underlying Roll20 operation.

### 16.3 MECHSUITS Update Workflow

For executable code changes:

1. Identify the narrowest framed section whose code or contract changes.
2. Return or replace the complete `BEGIN` through `END` section.
3. Replace ancestors only when their declared contract becomes inaccurate.
4. Keep the canonical tree synchronized if tags change.
5. Apply the Meaningful Change Rule:
   * meaningful behavior/contract/operational change → update `last_updated_version` and add `Changed (...)`;
   * comment-only or proven behavior-preserving change → keep `last_updated_version` and add `Maintenance (...)`.
6. Preserve prior commentary under `Prior notes`.
7. Verify the full v1.5.2 checklist before calling the file MECHSUITS-compliant.

### 16.4 Testing Expectations

At minimum:

* Run a JavaScript syntax check.
* Audit MECHSUITS tag pairing, nesting, tree consistency, section metadata, and footers.
* Run the Roll20 smoke test.
* Test each changed command or event with real Roll20 objects.
* Test dependency states affected by the change.
* Test module disable/re-enable when lifecycle behavior changes.
* Confirm no unrelated module behavior changed.

### 16.5 Documentation Expectations

Update the relevant README surfaces whenever you change:

* commands → Command Matrix and Module Guide;
* configuration → Configuration Keys;
* roll-table names → Roll-Table Cookbook;
* public helpers → Developer API;
* operational limitations → Architecture and Troubleshooting;
* release behavior → Changelog and Upgrade Paths.

---

## 17 · Roadmap <a id="17-roadmap"></a>

The roadmap is directional, not a promise. Items are labeled so implemented features are not mistaken for future work and future ideas are not mistaken for current behavior.

### 17.1 Current Status

| Item | Status in v2.0.0 | Notes |
| --- | --- | --- |
| MarkerService | **Implemented and accepted** | One toggleable service owns GameAssist marker resolution, mutation, preservation, and observation. Disabling it turns off dependent modules without disabling unrelated features. |
| Bundled marker consumers | **Migrated** | NPCAssist 1.4.0, ConcentrationAssist 0.3.0, and DebugTools 0.2.2 no longer require standalone TokenMod. ConcentrationAssist also exposes the lifecycle contract used by EffectAssist. |
| ConditionAssist 1.0.3 | **Implemented and accepted** | Condition references with `!condition` and case-insensitive `!cond-<condition>` commands, accurate selected-token recognition, current-page condition/marker status, selectable 2014/2024 SRD wording, campaign edits, marker artwork, verified marker-toggling announcements, validated legacy import, MarkerService synchronization, compact navigation, and GM/DM control aliases. |
| TokenAssist 1.0.4 | **Implemented and accepted** | General token controls with `!token-assist` and `!ta`/`!ta-*` commands, temporary support for older `!token-mod` macros, MarkerService-backed markers, token-change observation, clear compatibility limits, duplicate-install protection, an action-focused GM/DM screen, and a stable manual. |
| Integrated architecture stabilization | **Complete** | Upgrade, migration, lifecycle, command, marker, documentation, and Roll20 sandbox checks passed under Issues #28 and #29. |
| DM-configurable timezone | **Implemented; focused acceptance passed** | One validated table timezone controls readable timestamps and date-managed NPC Sessions while stored event instants remain absolute. The complete live module suite was not rerun for v0.1.5.1. |
| TurnTrackerService 1.0.0 | **Implemented; live foundation passed** | Toggleable native-tracker snapshots, structural row classification, guarded lossless writes, observations, dependency cascading, and visible page-owned row creation passed the focused Roll20 checkpoint. |
| SemanticEvents 1 | **Implemented; local contract checks passed** | Immutable, versioned, direct-delivery domain events let optional modules interoperate without hard dependencies, persistence, replay, or implicit queueing. |
| EffectAssist 2.0.0 | **v2.0.0 sandbox candidate** | Disabled-by-default nine-effect catalog for the official 2014 sheet, multi-projection ownership, concentration-linked cleanup, bounded history, read-only audit, and confirmed repair are ready for focused Roll20 testing. |
| InitiativeAssist 1.0.4 | **Implemented and accepted** | Mixed 2014/2024 initiative, public and private GM/DM start pages, private NPC evidence, GM-layer NPC batches, selected-character batches, roll options, selective rerolls, encounter groups, status, audit, compact navigation, and a stable manual through the case-insensitive `!Init-` namespace. |
| CombatAssist 1.0.5 | **Implemented and accepted** | Optional native-tracker layer with native round-counter authority, conservative fallback rounds, preserved-round roster/reroll adoption, one-step recovery, guarded movement, stale-safe configurable timers, private-safe native pings, ordered player confirmations, GM/DM controls, compact guidance, and a persistent manual. TurnTrackerService is its only baseline prerequisite. |
| WelcomeAssist 0.1.4 | **Implemented and accepted** | Disabled-by-default post-bootstrap greeting with professional, built-in, campaign-custom, and mixed modes; private preview/configuration; bounded custom text; health-gated one-per-sandbox automatic output; compact standard navigation; GM/DM status controls; a stable manual; short `!Welcome` commands; and retained `!welcome-assist` compatibility. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| NPC death history | **Implemented** | Page-local progressive NPC names, four-level handouts, Arc management, report writer, date-managed Sessions, MarkerService-backed death markers, and optional GM-private Bloodied threshold notices. |
| Native Mord character-sheet support | **Deferred** | Begin after the complete v0.1.5.0 marker, token, and condition architecture is stable. |

### 17.2 Current Candidate: v2.0.0 EffectAssist 2014 Launch

The v2.0.0 candidate adds EffectAssist 2.0.0 as a disabled-by-default, catalog-driven 2014-sheet module. Bless is the complete acceptance example: it coordinates the target marker, `1d4` global attack and saving-throw rows, source concentration, overlap, and linked cleanup. Warding Bond and Haste add the other verified 2014-sheet modifier rows, while Guidance, Gift of Alacrity, Holy Weapon, Longstrider, Pass Without a Trace, and Beacon of Hope combine safe automation with explicit assisted steps. Passive cast recognition, HP-loss offers, automatic duration providers, and 2024-sheet projections remain separately tracked enhancements.

### 17.3 Later Candidate: Compatibility-First Bridge Character Sheet

With the `v0.1.5.0` integrated architecture accepted in Roll20, the recommended character-sheet project is a bridge sheet that:

* preserves existing GameAssist command behavior,
* exposes reliable attributes for linked-token modules,
* defines clear NPC, HP-formula, save-bonus, and roll-template contracts,
* avoids requiring another broad GameAssist kernel rewrite.

This is a separate project and is not implemented in v0.1.5.0.

### 17.4 Planned GameAssist Work

1. **v1.8.0 — Module Identity Migration:** completed through Issue #60 and PR #63 with canonical CritAssist, NPCAssist, ConcentrationAssist, and HPAssist names, migration-safe state and handout handling, and retained command aliases.
2. **v1.8.1 — NPCAssist Bloodied Alerts:** completed through Issue #64 and PR #73 with a GM-private crossing notification and one-click Control Center toggle.
3. **v1.8.2 — Progressive NPC Naming:** completed through Issue #65 and PR #74 with page-local duplicate avoidance based on the tokens present when a new eligible NPC is added.
4. **v2.0.0 — EffectAssist 2014 Launch:** in progress through Issues #61, #75, #76, and #78 with source-aware instances, a nine-effect catalog, ownership-safe marker/condition/2014-sheet projections, ConcentrationAssist lifecycle coordination, read-only audit, and deliberate repair. Issues #77, #79, and #80 retain the separately gated recognition, HP, and duration enhancements.
5. **v2.y — AlmanacAssist:** use Issue #62 as the master specification and implement Time, Climate, Astronomy, Weather, Environment, and Rest as six separately tracked internal submodule phases.
6. **v2.z — Deferred Backlog:** revisit older TokenAssist parity work, CombatAssist integrations, and other deferred features after the new module foundations are stable.

The public [development roadmap](ROADMAP.md) carries the detailed gates and issue links. Planned release labels describe sequence, not promised dates.

### 17.5 Explicit Non-Goals for v2.0.0

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No 2024-sheet or third-party-sheet modifier writes.
* No passive spell-card recognition.
* No concentration prompts inferred from HP loss.
* No automatic round, turn, minute, real-time, or fictional-world-time expiration.
* No 2024 native Effect writes without a documented Roll20 contract.
* No WildShape or token-representation interoperability guesswork.
* No plugin loader, Rest Manager, or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v2.0.0 – EffectAssist 2014 Sheet Automation

* Added disabled-by-default EffectAssist 2.0.0 with a nine-effect launch catalog, source and target records, dependencies, stacking, lifecycle, and bounded history.
* Bless now coordinates its target marker, 2014-sheet `1d4` attack and save modifier rows, source concentration, overlap, and dependent cleanup.
* Warding Bond and Haste add their verified AC/save rows; all catalog entries distinguish automatic mechanics from assisted table steps.
* Preserves non-stacking projections across overlapping sources and removes only final EffectAssist-owned markers, conditions, concentration, and unedited sheet rows.
* Adds read-only audit, GM-bound one-use repair confirmation, identity-drift refusal, external-edit preservation, and post-write verification.
* Added CORE:SEMANTICEVENTS for immutable versioned optional-integration contracts without persistence, replay, or implicit queueing.

### v1.8.2 – Page-Local Progressive NPC Names

* Added `autoNumberNpcTokens`, enabled by default, for newly added linked NPC tokens on the Objects or GM layer.
* Keeps the unsuffixed represented-character name when available; otherwise uses the lowest available positive page-local suffix.
* Never renames existing tokens or represented characters and stores no sequence counter.
* Adds a one-click Control Center toggle, status visibility, configuration reference, and focused Roll20 tests.

### v1.8.1 – Private NPCAssist Bloodied Alerts

* Added `notifyBloodied`, enabled by default, to privately notify the GM when an eligible living object-layer NPC crosses from above half HP to half HP or below.
* Uses Roll20's previous/current HP transition as the complete rearm rule: remaining below half does not repeat, while healing above half permits a later crossing notice.
* Requires numeric HP and a valid positive bar 1 maximum; PCs, unlinked tokens, GM-layer tokens, deaths, invalid maxima, and HPAssist initialization transitions remain silent.
* Keeps Bloodied notices out of markers, death history, report buckets, Arc records, and public chat.

### v1.8.0 – Canonical Module Names and Migration Safety

* Renamed CritFumble to CritAssist, NPCManager to NPCAssist, ConcentrationTracker to ConcentrationAssist, and NPCHPRoller to HPAssist across runtime registration, state ownership, diagnostics, MECHSUITS tags, guide handouts, configuration, documentation, and One-Click metadata.
* Migrates valid saved branches to their canonical names before startup auditing while preserving valid destination values. Unknown or malformed legacy branches remain available for diagnosis.
* Preserves established commands, compatibility access, NPC history and Arc records, enabled settings, marker ownership, and one existing guide handout per renamed module.
* Adopts three-part project release numbering beginning with v1.8.0. Historical release identifiers and independent module versions remain unchanged.

### v0.1.7.0 – CombatAssist Encounter Flow

* Added disabled-by-default CombatAssist `1.0.5` as an optional layer over the native Turn Tracker, with deliberate lifecycle, guarded next/previous controls, authorized player End My Turn prompts, privacy-safe next-initiative confirmations, native round-counter support, turn timers, current-turn pings, and equal GM/DM control aliases.
* Added native round authority from one clearly named custom Round Counter, including conservative `+1` evaluation when CombatAssist moves that row to the top. Without a counter, exact one-row movement retains conservative complete-cycle counting; valid combatant additions, removals, initiative rerolls, and manual reordering preserve the current round and establish a fresh cycle.
* Added one-step recovery through a complete saved tracker checkpoint, revision-matched restore confirmation, and deliberate acceptance of the current native tracker without forcing a round-1 restart.
* Added GM-only setup and diagnostics plus configurable GM, public, GM-and-current-player whispers, or disabled turn announcements. Optional stale-safe timers support a bounded duration, deadline recipient, and up to five early reminders without advancing initiative. Optional native pings can identify the current token without recentering a map or changing token state, and hidden turns remain GM-only.
* Refined all eleven modules with compact navigation through their established prefixes, explicit read-only audits, and friendly unknown-command recovery. Substantial modules create or update one stable user-manual handout; brief modules keep complete guidance in chat.
* Advanced the module interaction contract so GM and DM role aliases open each module's actual Game Master screen; InitiativeAssist is `1.0.4`, CombatAssist is `1.0.5`, and WelcomeAssist is `0.1.4`.
* Preserved all existing tracker rows and fields; unreadable, stale, duplicate, off-page, closed, or malformed states stop with recovery choices instead of guessing.

### v0.1.6.1 – Private Initiative and WelcomeAssist

* Advanced InitiativeAssist to `1.0.1` and added case-insensitive `!Init-GM`, which presents the neutral roll controls and complete encounter roster only to the GM.
* Added disabled-by-default WelcomeAssist `0.1.0` with one health-gated automatic greeting per sandbox lifecycle, private preview/configuration, explicit public announcement, professional/built-in/custom/mixed modes, an included built-in greeting library, and up to ten double-weighted campaign greetings.
* Added bounded delay, header, default-text, and custom-list controls with HTML escaping and Roll20 chat-directive neutralization.
* Added deterministic InitiativeAssist and WelcomeAssist coverage; the focused Roll20 acceptance pass confirmed private `!Init-GM` delivery and WelcomeAssist startup behavior.

### v0.1.6.0 – Native Initiative Foundation

* Added toggleable `TurnTrackerService 1.0.0` as the single GameAssist authority for native Turn Tracker snapshots, compatibility page resolution, structural row classification, guarded writes, and observations.
* Added disabled-by-default `InitiativeAssist 1.0.0` with the case-insensitive `!Init-` namespace, mixed D&D 5E 2014/2024 modifier adapters, public player invitations, private-by-default NPC evidence, GM-layer NPC batches, selected-character rolling, a GM encounter roster with individual and batch controls, pre-tracker controlled-token discovery, player-specific choices, normal/advantage/disadvantage and bonus-die options, selective rerolls, encounter groups, and distinct Guide, Control Center, Status Summary, and detailed chat Review surfaces.
* Added `!Init-RR` to reroll each unique eligible PC and living NPC once while retaining custom rows, counters, objects, dead NPCs, mismatches, stale references, off-page rows, duplicate metadata, and unknown fields.
* Added Manager and Observer modes for deliberate coexistence with other initiative or combat tools.
* Kept round counting, turn advancement, timers, durations, current-turn visuals, and encounter lifecycle outside InitiativeAssist and deferred them to CombatAssist.
* Added compatibility diagnostics and a dedicated mixed-sheet local harness. The native tracker foundation passed its live checkpoint; the newest NPC-privacy, GM-layer, and selected-character additions remain in focused sandbox verification.

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

* **CombatAssist**
  GameAssist's optional encounter-flow module. It deliberately starts, pauses, resumes, observes, advances, and ends round tracking without replacing Roll20's native Turn Tracker.

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

* **TurnTrackerService**
  GameAssist's shared authority for reading, observing, and guardedly writing Roll20's native Turn Tracker while preserving rows and fields it does not own.

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
