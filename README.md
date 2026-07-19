# GameAssist – Modular API Framework for Roll20

**Version 0.1.5.1 development line** | © 2025-2026 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

GameAssist v0.1.5.0 completed its integrated MarkerService, ConditionAssist, TokenAssist, upgrade, and Roll20 acceptance work. The v0.1.5.1 development line adds one DM-selected table timezone for readable dates, timestamps, and NPC Session rollover.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel, a shared marker service, and eight bundled gameplay and administration modules—ConfigUI, CritFumble, ConditionAssist, TokenAssist, ConcentrationTracker, NPCManager, NPCHPRoller, and DebugTools. It provides guided menus, guarded lifecycle controls, direct command and event routing, an explicit queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. The goal is campaign automation that remains approachable at the table and understandable when something needs attention.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, session metrics, dependency diagnostics, GM health reporting, and one toggleable marker service with dependent-module safeguards. |
| Quick Install | 📥 Install the complete script → 📜 add the CritFumble tables if used → 🔄 reload → 🩺 run the health checks → 🎲 test the enabled features with disposable tokens. |
| Flagship Player Commands | `!condition <name>`, `!cond-<condition>`, `!concentration`, `!cc`, `!critfumble-<type>` when the GM permits the relevant player action. |
| Flagship GM Commands | `!token-assist help`, `!token-assist --help`, `!condition`, `!condition status`, `!condition announce`, `!c-a`, `!cond-!`, `!condition help`, `!critfumble`, `!critfumble help`, `!critfumble menu`, `!critfail`, `!npc-hp-all`, `!npc-hp-selected`, `!npc-death-report --help`, `!npc-death-buckets`, `!NPC-WR`, `!npc-death-audit`, `!npc-death-repair`, `!npc-death-arc`, `!ga-conc-status`, `!ga-config ui`. |
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
* **ConditionAssist** – supplies 2014 SRD condition wording by default, optional 2024 SRD wording, campaign-editable descriptions, case-insensitive `!cond-<condition>` quick references, marker artwork, an accurate selected-token menu, a GM current-page condition/marker status roster, verified marker-toggling announcements in public chat or player whispers, add/remove/toggle commands, guarded player permissions, and marker-change descriptions. Every condition marker operation and observation goes through MarkerService.
* **TokenAssist** – provides general token controls through `!token-assist` and `!ta`/`!ta-*`, explicit-ID permissions, token-change observers, and MarkerService-backed status operations. Older supported `!token-mod` macros continue temporarily during v0.1.x and are not processed by GameAssist when standalone TokenMod is detected.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that reports failures clearly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

| Step | What to do |
| --- | --- |
| 📥 **1 · Install** | Add GameAssist through Roll20 One-Click, or paste the complete `GameAssist.js` file into **Mod (API) Scripts**, then save. |
| 🧩 **2 · Choose Features** | Open `!ga-config ui` and keep only the tools that fit the campaign. MarkerService begins enabled because ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and marker diagnostics use it. |
| 📜 **3 · Prepare CritFumble** | If CritFumble will be used, create the seven tables listed in [§11 · Roll-Table Cookbook](#11-roll-table-cookbook). Skip this step when CritFumble is disabled. |
| 🔄 **4 · Reload** | Save or restart the Mod sandbox and wait for the GameAssist core ready whisper. Module-by-module startup whispers are normally quiet. |
| 🩺 **5 · Check Health** | Run `!ga-status` and `!ga-config modules`. Confirm the features you enabled are running. |
| 🕰️ **6 · Set Table Time** | Open `!ga-timezone`, choose the city/region that governs the campaign clock, and confirm the displayed time and Session date. The sandbox default remains available. |
| 🎲 **7 · Try the Table Tools** | Test `!token-assist help`, `!condition help`, `!critfumble menu`, `!concentration --status`, and `!npc-hp-selected` for the modules you use. |
| 🛡️ **8 · Verify Real Changes** | With disposable tokens, test one NPC death/revival and one concentration marker before the first live session. |

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
!concentration --status
!npc-death-help
!npc-death-report
!npc-death-buckets
!npc-death-audit
!npc-death-repair
!npc-hp-selected
```

Then perform six real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Select a disposable token, add and remove one condition, and confirm unrelated markers remain unchanged.
5. Select a disposable token and use one supported `!token-assist --set` or `--on` command.
6. Disable and re-enable one module or service.

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
  "version": "0.1.5.1",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v0.1.5.1 does not import or restore snapshots.

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

> **Module version:** `1.0.1`

TokenAssist provides general token controls without requiring standalone TokenMod. Use `!token-assist` for the full command name, `!ta` for a short form, or `!ta-<action>` for quick table commands such as `!ta-set` and `!ta-move`. Select one or more tokens before running a command. Players can affect tokens they can select, while direct `--ids` targeting remains GM-only unless the GM enables **Players can use --ids**.

Start here:

```roll20chat
!token-assist help
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

TokenAssist `1.0.1` focuses on the token controls GameAssist and most table macros use directly. Its current scope does not include image-side stack editing, default-token writes, computed or name-resolved attribute links, advanced controller-list editing, color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, separate `token`/`character`/`control` report-recipient behavior, duplicate-index marker operations, conditional marker counts, or TokenMod help-handout rebuilding. Unsupported operations return a clear warning before unrelated requested changes are applied.

That boundary keeps the first integrated release testable. Image stacks and default-token writes alter persistent token assets; computed attributes and controller-name editing require separate expression and identity-resolution rules; and color arithmetic, random side selection, advanced marker counts, and recipient distinctions add specialized parsers that none of GameAssist's current modules require. Those groups can be evaluated individually after the integrated architecture passes its Roll20 release gate. TokenAssist already supplies its own chat help, and integrations use `GameAssist.TokenAssist` rather than a global `TokenMod` object, so those two differences are intentional rather than unfinished compatibility work.

On first startup, TokenAssist copies a valid legacy `state.TokenMod.playersCanUse_ids` value into its own configuration. It records the migration and leaves `state.TokenMod` untouched for rollback. It does not expose a global `TokenMod` object; integrations should use `GameAssist.TokenAssist.observeTokenChange(...)` or MarkerService's marker observer.

Existing supported `!token-mod` macros may continue temporarily during the v0.1.x development line, but should be updated to `!token-assist`, `!ta`, or `!ta-*` before v0.2.0. When standalone TokenMod is detected, GameAssist leaves `!token-mod` to that script while TokenAssist commands remain available. Remove standalone TokenMod for normal v0.1.5.1 use because both tools can change the same token properties and markers.

Config keys: `playersCanUseIds`, `warnOnStandalone`, and the protected `configSchemaVersion`.

### 6.4 Concentration Tracker

> **Marker service:** ConcentrationTracker uses the integrated `GameAssist.MarkerService`; standalone TokenMod is not required.

`!concentration` or `!cc` opens buttons for normal, advantage, or disadvantage rolls and accepts:

* `--help` → Whisper the help panel.
* `--damage N` → Roll against DC `max(10, floor(N / 2))`.
* `--mode normal|adv|dis` → Choose roll mode.
* `--last` → Repeat the player’s last recorded check.
* `--off` → Remove the configured marker from selected tokens.
* `--status` → List tokens currently carrying the configured marker.
* `--config randomize on|off` → Toggle emote randomization.
* `!ga-conc-status` → GM-only snapshot of the most recent concentration DC and damage per player.

The tracker reads `constitution_save_bonus` from a token’s represented character. Runtime `lastDamage` data self-heals and accepts legacy number entries.

In v0.1.4.3, built-in marker ids, custom marker display names, and exact custom tags resolve to the marker identity Roll20 stores on tokens. If the configured marker cannot be recognized, `!concentration --status` gives an actionable warning instead of silently reporting an incorrect empty result.

In v0.1.5.0, concentration status, add, remove, and teardown operations use MarkerService. Each mutation returns an explicit result, exact stored custom tags remain usable when the campaign registry cannot be read, and unrelated or numbered markers are preserved. ConditionAssist observes MarkerService directly and can describe a configured concentration marker when a matching condition definition exists.

Config keys: `marker`, `randomize`.

### 6.5 NPC Manager

> **Marker service:** NPCManager uses the integrated `GameAssist.MarkerService`; death history remains independent from marker-write success.

> **Module version:** NPCManager `1.3.0` in GameAssist v0.1.5.1. NPCManager `1.0.0` introduced the four-level history model; `1.1.0` added curated Arc management, hierarchical clearing, date rollover, and the report writer; `1.1.1` hardened standalone interoperability and new-token HP initialization; `1.2.0` migrated marker behavior to MarkerService; `1.2.1` added confirmation-gated marker repair; `1.3.0` applies the DM-selected timezone to Session dates and history displays without changing stored event instants.

NPCManager watches `change:graphic:bar1_value` for linked NPC characters with `npc=1`.

* HP below 1 → record the NPC death into the active Campaign, Chapter, Section, and Session buckets, then request the configured `deadMarker`.
* HP above 0 → annotate the matching death entry as revived and request removal of the configured `deadMarker`.
* `autoHide=true` → move newly dead NPC tokens to `hideLayer`.

When NPCHPRoller `autoRollOnAdd=true`, NPCManager treats the short placeholder-HP interval on a newly added token as setup rather than combat. Blank or unknown starting HP is not accepted as evidence that a living NPC crossed below 1 HP. The automatic roll therefore does not flash the death marker or add a false death/revival pair to history; later known-positive-to-zero changes remain ordinary tracked deaths.

Commands:

* `!npc-death-report` → Show the active Session bucket summary.
* `!npc-death-report --scope campaign|chapter|section|session` → View a different active bucket.
* `!npc-death-report --recent` → Show the newest recorded death events for the selected bucket.
* `!npc-death-report --page N` → Page through older recorded death events for the selected bucket.
* `!npc-death-report --write` → Open the report writer without immediately changing a handout.
* `!npc-death-report --help` or `!npc-death-help` → Open the central NPCManager guide for setup, reports, clearing, audits, and Arcs.
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

`!npc-death-report` is a history report. It opens with totals, the latest death, most frequent names, recent entries, and buttons for common next steps. Every new death is written to all four active buckets. A clear confirmation offers either the selected bucket alone or that level and its descendants; for example, clearing Section and below clears Section and Session while retaining Chapter and Campaign. Each bucket has its own handout named like `GameAssist Deaths - Session - 2026-07-17`. Revivals are annotated on the matching entry instead of silently deleting the death. Current entries are matched by token ID, so separate tokens with the same name remain separate records.

The default Session name follows the active GameAssist table date. Choose the table timezone with `!ga-timezone`; when none is selected, GameAssist uses the Roll20 sandbox clock. Before any NPCManager command or tracked NPC HP change, GameAssist checks the date and moves a date-managed Session to the new `YYYY-MM-DD` bucket. Changing the timezone also refreshes the Session immediately when the named date changes. No death processed after that check is written into yesterday's Session. If the DM explicitly names the Session, that custom name remains active across date changes; **Reset Session Date** restores automatic date-managed rollover.

Arc handouts are curated rosters, not another hierarchy level. A linked creature appears once per Arc by default, so adding selected NPCs and later importing the full Session does not repeat those creatures. The Session import can enrich an existing selected entry with its death record. The management menu can remove one entry, remove all selected tokens, or undo the most recent Arc addition. `--allowDuplicates` is an explicit override for deliberate repetition. Selected-token Arc entries remain general story notes; revival annotations apply only after an entry is linked to Session death history.

`!npc-death-audit` is the read-only mismatch checker. Chat shows a summary plus bounded, token-specific **Add Death Marker** and **Remove Death Marker** groups. The complete list is written to the `GameAssist NPC Death Audit` handout. The audit checks linked NPC tokens on the current player page; player characters are not included. A clean audit means linked NPC tokens have death markers that match their HP. The audit may also note ignored unlinked page items such as party markers, scenery, labels, or props. Blank or non-numeric HP is reported separately and is never treated as zero by repair.

When mismatches exist, **Review Marker Repairs** opens the separate `!npc-death-repair` preview. It explains exactly how many markers would be added or removed and requires confirmation. Confirmation re-scans current HP before acting, verifies each MarkerService change, and preserves HP, death history, report buckets, Arc records, and unrelated markers. This separation matters when the mismatch reveals housekeeping the DM would rather fix manually, such as a revived token whose marker was removed before its HP was restored.

Disabling NPCManager stops its automation and requests removal of its configured marker from qualifying current-page tokens. Saved Campaign, Chapter, Section, Session, and Arc records remain available after the module is enabled again. Use the NPCManager clear and Arc-management controls when history should actually be removed.

Config keys: `autoTrackDeath`, `deadMarker`, `autoHide`, `hideLayer`.

### 6.6 NPC HP Roller

> **Dependency:** NPCHPRoller does **not** require TokenMod.

NPCHPRoller reads `npc=1` and `npc_hpformula` from linked characters, parses `NdM+K` or `NdM-K`, and writes the result to token `bar1_value` and `bar1_max`.

* `!npc-hp-selected` → Roll HP for qualifying selected NPC tokens.
* `!npc-hp-all` → Roll HP for qualifying NPC tokens on the current player page.
* `autoRollOnAdd=true` → Quietly attempt HP rolling when a qualifying NPC token is added.

Invalid, unlinked, and PC tokens are skipped.

Config key: `autoRollOnAdd`.

### 6.7 Config UI

`!ga-config ui` or `!ga-config-ui` whispers a GM-only chat control panel. Each module card can show:

* Current enabled/disabled status with a one-click toggle.
* Boolean configuration keys as chat buttons.
* A brief configuration summary.
* Previous, refresh, and next pagination controls.

Config keys: `pageSize`, `showSummaries`.

Disable ConfigUI if you prefer command-only administration.

### 6.8 Debug Tools *(GM-only)*

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

---

## 7 · Installation <a id="7-installation"></a>

I. **Open the Roll20 Mod/API Editor**

1. Open your game’s **Settings**.
2. Open **Mod (API) Scripts**.
3. Create or select the GameAssist script entry.

II. **Install GameAssist**

1. Paste the complete contents of `GameAssist` v0.1.5.1.
2. Keep the script as one complete file; do not paste only individual MECHSUITS sections into Roll20.
3. Save the script.

III. **Remove Overlapping Standalone Marker Tools**

GameAssist v0.1.5.1 replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by TokenAssist and ConditionAssist. Remove both standalone scripts before enabling the overlapping GameAssist modules. TokenAssist and standalone TokenMod both recognize `!token-mod`; ConditionAssist and standalone StatusInfo both recognize `!condition` and marker changes.

If standalone TokenMod is accidentally left installed, TokenAssist suspends only its deprecated `!token-mod` alias and warns the GM instead of applying that command twice. The `!token-assist`, `!ta`, and `!ta-*` commands remain available, but this safeguard is diagnostic rather than a supported permanent dual-install arrangement.

MarkerService itself may be disabled when the campaign deliberately chooses a different marker system. GameAssist will also turn off its dependent modules and explain which features are unavailable; CritFumble, ConfigUI, and NPCHPRoller continue to work.

IV. **Create the Seven CritFumble Tables**

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
|  | `!ga-enable <ModuleOrService>` / `!ga-disable <ModuleOrService>` | — | Enable or disable a module or core service; names are case-insensitive. |
| **Token Controls** | `!token-assist help` / `!ta-help` | — | Open TokenAssist guidance, commands, compatibility limits, provenance, and attribution. |
|  | `!token-assist --help-statusmarkers` / `!ta-help-statusmarkers` | — | Open the marker-command guide. |
|  | `!token-assist --on|--off|--flip <property...>` / `!ta-on|off|flip` | selected/authorized targets | Change supported boolean token properties. |
|  | `!token-assist --set <property|value...>` / `!ta-set` | selected/authorized targets | Change supported token, bar, aura, vision, lighting, layer, position, and marker properties. |
|  | `!token-assist --move <distance|angle\|distance>` / `!ta-move` | selected/authorized targets | Move tokens using pixels, grid units, or page units. |
|  | `!token-assist --order tofront|toback` / `!ta-order` | selected/authorized targets | Change token stacking order. |
|  | `!token-assist --report <recipient\|message>` / `!ta-report` | `{property}` placeholders | Report before/after token values to the GM, caller, table, or controllers. |
|  | `!token-assist --ids <id...>` / `!ta-ids` | `--ignore-selected`, `--current-page`, `--active-pages` | Add explicit token/character targets when authorized and optionally filter their pages. |
|  | `!token-assist --config players-can-ids|on|off` / `!ta-config` | GM only | Control whether players may supply explicit IDs; selected-token use remains available. |
|  | `!token-mod ...` | temporary older syntax | Accepts supported older macros during v0.1.x; replace them before v0.2.0. |
| **GM** | `!npc-hp-all` | — | Roll and set HP for qualifying NPC tokens on the current page. |
|  | `!npc-hp-selected` | — | Roll and set HP for qualifying selected NPC tokens. |
|  | `!npc-death-help` | — | Open the same central NPCManager guide as `!npc-death-report --help`. |
|  | `!npc-death-report` | `[--scope campaign\|chapter\|section\|session] [--recent] [--page N] [--write] [--help]` | Show bucket history; `--help` opens the central guide and `--write` opens the report writer. |
|  | `!npc-death-buckets` | `[--campaign "Name"] [--chapter "Name"] [--section "Name"] [--session "Name"] [--resetSession]` | View or rename the active death-history buckets. |
|  | `!npc-death-clear` | `[--scope session] [--nested] [--confirm]` | Clear only the selected bucket, or add `--nested` to clear that level and its descendants. |
|  | `!NPC-WR` / `!npc-death-write` | `[--all] [--scope <level>] [--newSection "Name"]` | Open the report writer, update selected handouts, or seed a new Section from the current Session. |
|  | `!npc-death-audit` | — | Summarize current HP/death-marker mismatches and update the audit handout. |
|  | `!npc-death-repair` | `[--confirm]` | Preview marker corrections from current HP; `--confirm` re-scans and changes only the configured death marker. |
|  | `!npc-death-arc` | `[--name "Arc"] [--session] [--note "Text"] [--manage] [--allowDuplicates]` | Maintain a deduplicated Arc roster from selected tokens or the current Session; manage removal and undo in chat. |
|  | `!ga-conc-status` | — | Show recent concentration DC/damage data per player. |
|  | `!condition config` | — | Open ConditionAssist settings and condition-definition controls. |
| **Player / GM** | `!critfumble` / `!critfumble help` | — | Whisper the CritFumble quick reference. |
|  | `!critfumble menu` | — | Whisper the guided Natural 1 dialogue. |
|  | `!critfail` | — | Open the direct GM-facing manual fumble prompt. Intended for GM use, but not currently GM-gated. |
| **Debug** | `!ga-debug damage` | `--amount N [--token ID] [--apply]` | Preview or apply bar1 damage. |
|  | `!ga-debug marker` | `--marker NAME [--state on|off|toggle] [--token ID] [--apply]` | Preview or apply a status marker change. |
|  | `!ga-debug save` | `--dc N [--bonus N] [--mode normal|adv|dis] [--label "Text"] [--apply]` | Preview or roll a save. |
| **Player / GM** | `!critfumble-<type>` | `melee|ranged|thrown|spell|natural` | Roll the selected fumble table. |
|  | `!confirm-crit-martial` / `!confirm-crit-magic` | — | Roll the matching confirmation table. |
|  | `!condition` / `!condition help` | — | Open the selected-token condition menu or quick-start guide. |
|  | `!condition <name>` | — | Show one configured condition description when permitted. |
|  | `!cond-<condition>` | — | Show any official or DM-created condition through the case-insensitive short reference prefix. |
|  | `!condition add|remove|toggle <condition...>` | selected tokens | Change one or more condition markers when permitted. |
| **GM** | `!condition announce` / `!c-a` / `!cond-!` | selected linked character tokens | Choose a condition, then toggle and verify its marker while announcing the result or exact wording publicly or to player controllers. |
|  | `!condition status` / `!condition --status` | current player page | List linked characters and NPCs with configured conditions or other active markers. |
|  | `!concentration` / `!cc` | `--damage N`, `--mode normal|adv|dis`, `--last`, `--off`, `--status`, `--config randomize on|off`, `--help` | Open or perform a concentration workflow. |

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
| **CritFumble** | `enabled` | bool | `true` | Enable automatic and manual fumble handling. |
|  | `debug` | bool | `false` | Enable CritFumble-specific debug messages. |
|  | `useEmojis` | bool | `true` | Use emoji styling in CritFumble output. |
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
| **TokenAssist** | `enabled` | bool | `true` | Enable general token controls and temporary support for older `!token-mod` macros. |
|  | `playersCanUseIds` | bool | legacy value or `false` | Allow players to add explicit `--ids` targets; selected-token controls remain available. |
|  | `warnOnStandalone` | bool | `true` | Warn when standalone TokenMod is detected and compatibility handling is suspended. |
|  | `configSchemaVersion` | number | `1` | Protected TokenAssist configuration schema identifier. |
| **ConcentrationTracker** | `enabled` | bool | `true` | Enable concentration commands and tracking. |
|  | `marker` | string | `"Concentrating"` | Marker name used for status checks and removal. |
|  | `randomize` | bool | `true` | Randomize concentration emote flavor. |
| **NPCManager** | `enabled` | bool | `true` | Enable NPC death tracking. |
|  | `autoTrackDeath` | bool | `true` | Automatically add/remove the death marker. |
|  | `deadMarker` | string | `"dead"` | Marker used for death state. |
|  | `autoHide` | bool | `false` | Move newly dead NPC tokens to another layer. |
|  | `hideLayer` | string | `"gmlayer"` | Target layer used by `autoHide`. |
| **NPCHPRoller** | `enabled` | bool | `true` | Enable NPC HP commands. |
|  | `autoRollOnAdd` | bool | `false` | Attempt HP rolling when qualifying tokens are added. |
| **DebugTools** | `enabled` | bool | `false` | Enable GM-only dry-run/apply debug commands. |

Examples:

```roll20chat
!ga-config get NPCManager
!ga-config get NPCManager deadMarker
!ga-config set NPCManager autoHide=true
!ga-config set NPCManager hideLayer=gmlayer
!ga-config set NPCHPRoller autoRollOnAdd=true
!ga-config set CritFumble debug=false
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
| **Condition Assist** | `GameAssist.ConditionAssist` | Read validated condition definitions or apply add/remove/toggle actions through MarkerService. |
| **Token Assist** | `GameAssist.TokenAssist` | Inspect component provenance/lifecycle and subscribe to token changes made through supported TokenAssist commands. |
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
* Runtime is cleared on disable by default. Set `preserveRuntimeOnDisable: true` only when the module deliberately stores durable records there; NPCManager uses this for death-history buckets and Arc records.
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

When MarkerService is disabled, marker operations return `UNAVAILABLE` with the command needed to restore the service. ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools are disabled before the service closes so their teardown can complete safely. Observer registrations pause while the service is off and resume when it is enabled again.

### 10.7 ConditionAssist

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

### 10.8 TokenAssist

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

### 10.9 MECHSUITS Contribution Contract

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

CritFumble expects these exact Roll20 rollable-table names:

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
!ga-disable ConfigUI
!ga-disable CritFumble
!ga-disable NPCHPRoller
```

Disabling MarkerService also turns off ConditionAssist, TokenAssist, ConcentrationTracker, NPCManager, and DebugTools. Core admin commands remain available. NPCManager's configured marker may be cleared from current-page tokens, but its saved death-history and Arc records are retained.

### 12.3 Restore Normal Bundled Modules

```roll20chat
!ga-enable MarkerService
!ga-enable ConfigUI
!ga-enable CritFumble
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable ConcentrationTracker
!ga-enable NPCManager
!ga-enable NPCHPRoller
```

Leave DebugTools disabled until needed.

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
!npc-hp-selected
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

---

## 13 · Performance Benchmarks <a id="13-performance-benchmarks"></a>

> **Historical reference only:** The following numbers were recorded for an earlier v0.1.3-era build and have **not** been revalidated for v0.1.5.x. Roll20 sandbox load, campaign size, browser state, network conditions, token formulas, and other Mods can materially change results. Do not treat this table as a current performance guarantee.

| Environment Item | Historical Test Environment |
| --- | --- |
| CPU / RAM | Ryzen 7 7735HS @ 3.2 GHz · 16 GB DDR5-4800 |
| OS / Browser | Windows 11 Home 24H2 · Chrome 137 |
| Roll20 sandbox | Experimental channel, April 2025-era build |
| Dataset | 25 NPC tokens on one page |

**Historical `!npc-hp-all` timing**

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

ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools use `GameAssist.MarkerService`; they should report `deps confirmed` without standalone TokenMod or StatusInfo.

Run:

```roll20chat
!ga-status --details
!ga-config modules
```

The details panel should report MarkerService as enabled. ConditionAssist and TokenAssist should appear enabled and running after standalone StatusInfo and TokenMod are removed. If a standalone script is detected, the details explain which overlapping command handler is suspended.

If another Mod must own marker behavior, use `!ga-disable MarkerService`. GameAssist disables ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools first, then turns off MarkerService. The chat notice identifies the affected features; unrelated GameAssist modules remain available. Re-enable MarkerService before re-enabling any dependent module.

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

Values containing spaces must be quoted. Players may use selected-token commands, but `--ids` remains restricted unless the GM enables it through `!token-assist --config players-can-ids|on` or `!ta-config players-can-ids|on`. Commands involving unsupported advanced image, default-token, computed/name-resolved attribute, controller-list, color-math, multi-sided-token, duplicate marker index, conditional marker count, or help-handout behavior are outside TokenAssist 1.0.1's compatibility boundary and should produce a clear warning rather than a partial mutation.

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
!ga-config get NPCManager deadMarker
!ga-config get ConcentrationTracker marker
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

The `GameAssist Config` handout contains flags, global config, and module config only. It excludes runtime caches, metrics, and unknown state branches. v0.1.5.1 cannot import the snapshot.

Use it for configuration review and upgrade comparison—not as a full restore mechanism.

### 14.9 CritFumble Menu or Table Roll Fails

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
!ga-config get NPCManager deadMarker
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
!ga-config get ConcentrationTracker marker
!concentration --off
!concentration --status
```

`!concentration --status` reads through MarkerService and should always respond while ConcentrationTracker is running. If it reports that the configured marker cannot be recognized, inspect the campaign marker library and run:

```roll20chat
!ga-config set ConcentrationTracker marker=<name-or-tag>
```

For a custom marker, the exact stored `Name::id` tag is the most deterministic configuration.

### 14.12 NPC HP Does Not Roll

Confirm the token:

* is linked to a character,
* represents an NPC with `npc=1`,
* has a valid `npc_hpformula` such as `4d8+8`,
* and is on the correct page or selected for the command.

NPCHPRoller does not require TokenMod.

### 14.13 Debug Command Does Nothing

Enable DebugTools first:

```roll20chat
!ga-enable DebugTools
```

DebugTools performs a dry run unless `--apply` is supplied. To use selected tokens, omit `--token`; do not write `--token select`.

### 14.14 Compatibility Hints

Compatibility scanning is debug-only:

```js
GameAssist.flags.DEBUG_COMPAT = true;
```

Reload, inspect the output, then return it to `false` to avoid noise. If another Mod processes the same natural-1 attack rolls, concentration markers, NPC death events, or NPC HP/bar 1 changes, choose one tool to own that behavior or disable the overlapping GameAssist module.

### 14.15 Still Stuck?

Capture:

1. Exact GameAssist version.
2. `!ga-status` output.
3. `!ga-config modules` output.
4. Exact command/action that failed.
5. Exact API sandbox error text.
6. Which other Mods can change the same token bars, markers, or attack-roll messages.

These details help maintainers reproduce the campaign conditions and focus the investigation quickly.

---

## 15 · Upgrade Paths <a id="15-upgrade-paths"></a>

### 15.1 Recommended Upgrade: v0.1.4.7 → v0.1.5.1

I. **Freeze the Current Working Script**

1. Keep a copy of the complete v0.1.4.7 script.
2. Run `!ga-config list` for a configuration-only comparison snapshot.
3. Record any TokenMod or StatusInfo commands, saved configuration, or macros the campaign currently uses so their GameAssist equivalents can be verified after the upgrade. Existing valid `state.STATUSINFO` definitions and `state.TokenMod.playersCanUse_ids` are copied non-destructively by their GameAssist replacements.

> The snapshot is not a full-state backup and cannot be imported automatically.

II. **Replace the Script**

1. Replace the Roll20 script contents with the complete GameAssist v0.1.5.1 file.
2. Remove standalone TokenMod and StatusInfo from the campaign's Mod list.
3. Save/reload the Mod sandbox.
4. Do not combine partial sections from multiple releases.

III. **Verify Core Health**

```roll20chat
!ga-status
!ga-status --details
!ga-config modules
!ga-metrics
!ga-timezone
```

MarkerService should report enabled. ConditionAssist, TokenAssist, NPCManager, and ConcentrationTracker should run with `deps confirmed`. Troubleshooting details should report that standalone TokenMod and StatusInfo were not detected. Choose the campaign's table timezone and confirm it appears in `!ga-status` after a sandbox restart.

IV. **Verify Configuration and Marker State**

```roll20chat
!ga-config get NPCManager
!ga-config get ConcentrationTracker
!ga-config get ConditionAssist userAllowed
!ga-config get TokenAssist playersCanUseIds
!ga-config get DebugTools
!token-assist help
!ta-help
!condition help
!condition
!npc-death-audit
!concentration --status
```

Existing configured built-in names, custom display names, and exact stored tags remain supported. ConditionAssist copies valid legacy `state.STATUSINFO` settings and definitions into its own validated configuration while retaining the legacy branch for rollback. TokenAssist copies the valid legacy `playersCanUse_ids` choice and leaves `state.TokenMod` intact. Replace retained `!token-mod` macros with `!token-assist` or `!ta` forms before v0.2.0; unsupported advanced command families are reported rather than silently claimed.

V. **Run the Smoke Test**

Use [§4.1 Minimum Smoke Test](#41-minimum-smoke-test), including TokenAssist property and marker commands, real HP, concentration, marker preservation, MarkerService disable cascading, and service/module re-enablement.

### 15.2 Rollback

If v0.1.5.1 fails its smoke test:

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

| Item | Status in v0.1.5.1 | Notes |
| --- | --- | --- |
| MarkerService | **Implemented and accepted** | One toggleable service owns GameAssist marker resolution, mutation, preservation, and observation. Disabling it turns off dependent modules without disabling unrelated features. |
| Bundled marker consumers | **Migrated** | NPCManager 1.3.0, ConcentrationTracker 0.2.0, and DebugTools 0.2.0 no longer require standalone TokenMod. |
| ConditionAssist 1.0.1 | **Implemented and accepted** | Condition references with `!condition` and case-insensitive `!cond-<condition>` commands, accurate selected-token recognition, current-page condition/marker status, selectable 2014/2024 SRD wording, campaign edits, marker artwork, verified marker-toggling announcements, validated legacy import, and MarkerService synchronization. |
| TokenAssist 1.0.1 | **Implemented and accepted** | General token controls with `!token-assist` and `!ta`/`!ta-*` commands, temporary support for older `!token-mod` macros, MarkerService-backed markers, token-change observation, clear compatibility limits, and duplicate-install protection. |
| Integrated architecture stabilization | **Complete** | Upgrade, migration, lifecycle, command, marker, documentation, and Roll20 sandbox checks passed under Issues #28 and #29. |
| DM-configurable timezone | **Implemented; v0.1.5.1 smoke confirmation pending** | One validated table timezone controls readable timestamps and date-managed NPC Sessions while stored event instants remain absolute. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| NPC death history | **Implemented** | Four-level handouts, Arc management, report writer, date-managed Sessions, and MarkerService-backed death markers. |
| Native Mord character-sheet support | **Deferred** | Begin after the complete v0.1.5.0 marker, token, and condition architecture is stable. |

### 17.2 Near-Term Candidate: Compatibility-First Bridge Character Sheet

With the `v0.1.5.0` integrated architecture accepted in Roll20, the recommended character-sheet project is a bridge sheet that:

* preserves existing GameAssist command behavior,
* exposes reliable attributes for linked-token modules,
* defines clear NPC, HP-formula, save-bonus, and roll-template contracts,
* avoids requiring another broad GameAssist kernel rewrite.

This is a separate project and is not implemented in v0.1.5.0.

### 17.3 Deferred GameAssist Features

1. **Spell-Specific Concentration Integration**
   * Detect concentration spell casts.
   * Track spell name, duration, expiration, and optional reminders.
   * Clear concentration under explicitly defined conditions.

2. **Expanded Module Suite**
   * Cooldown tracker.
   * Encounter assistant.
   * Resource tracker.
   * Condition automator.
   * Rest and recovery tools.
   * Dynamic location/AoE helpers.

3. **Plugin Registry and Discovery**
   * A validated extension contract for third-party modules.
   * No promise of filesystem-style “drop-in folders,” because Roll20’s sandbox does not expose a normal plugin directory.

4. **Configuration and State Restore**
   * Validated snapshot import.
   * Migration rules and preview/dry-run behavior.
   * Explicit handling for runtime caches, metrics, and unknown branches.

5. **Rollable-Table Import/Export**
   * Shareable table formats with validation and collision behavior.

6. **Verbose Diagnostics**
   * Runtime-controlled detail without leaking unsafe or excessively noisy data.

7. **Documentation and Community Resources**
   * More macro recipes.
   * Additional table examples.
   * Campaign-tested compatibility notes.

### 17.4 Explicit Non-Goals for v0.1.5.x

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No plugin loader, Rest Manager, encounter suite, or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v0.1.5.1 – DM-Configurable Table Time *(in development)*

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
