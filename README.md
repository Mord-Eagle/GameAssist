# GameAssist – Modular API Framework for Roll20

**Version 0.1.5.0 development line** | © 2025-2026 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

> **Release posture:** `v0.1.4.7` remains the stable campaign release while `v0.1.5.0` is completed. MarkerService and the independently branded ConditionService are implemented development checkpoints; the integrated token service, stabilization work, and complete Roll20 sandbox acceptance pass remain before publication.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel, a shared marker service, and seven bundled gameplay and administration modules—ConfigUI, CritFumble, ConditionService, ConcentrationTracker, NPCManager, NPCHPRoller, and DebugTools. It provides guided menus, guarded lifecycle controls, direct command and event routing, an explicit queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. The goal is campaign automation that remains approachable at the table and understandable when something needs attention.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, session metrics, dependency diagnostics, GM health reporting, and one toggleable marker service with dependent-module safeguards. |
| Quick Install | 📥 Install the complete script → 📜 add the CritFumble tables if used → 🔄 reload → 🩺 run the health checks → 🎲 test the enabled features with disposable tokens. |
| Flagship Player Commands | `!condition <name>`, `!cond-<condition>`, `!concentration`, `!cc`, `!critfumble-<type>` when the GM permits the relevant player action. |
| Flagship GM Commands | `!condition`, `!condition announce`, `!condition help`, `!critfumble`, `!critfumble help`, `!critfumble menu`, `!critfail`, `!npc-hp-all`, `!npc-hp-selected`, `!npc-death-report --help`, `!npc-death-buckets`, `!NPC-WR`, `!npc-death-audit`, `!npc-death-arc`, `!ga-conc-status`, `!ga-config ui`. |
| Admin Controls | `!ga-config list|get|set|modules|cleanup|ui`, `!ga-enable`, `!ga-disable`, `!ga-status`, `!ga-metrics`, and `!ga-debug`. |
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
* **MarkerService** – `GameAssist.MarkerService` resolves built-in and custom markers, supplies artwork metadata when Roll20 exposes it, preserves unrelated and numbered marker state, applies explicit add/remove/toggle operations, and exposes one observation contract. It can be disabled when another Mod needs exclusive control of marker behavior; GameAssist then turns off MarkerService-dependent modules while leaving unrelated modules available.
* **ConditionService** – supplies 2014 SRD condition wording by default, optional 2024 SRD wording, campaign-editable descriptions, case-insensitive `!cond-<condition>` quick references, marker artwork, a selected-token menu, public or player-whisper announcements, add/remove/toggle commands, guarded player permissions, and marker-change descriptions. Every condition marker operation and observation goes through MarkerService.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that reports failures clearly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

| Step | What to do |
| --- | --- |
| 📥 **1 · Install** | Add GameAssist through Roll20 One-Click, or paste the complete `GameAssist.js` file into **Mod (API) Scripts**, then save. |
| 🧩 **2 · Choose Features** | Open `!ga-config ui` and keep only the tools that fit the campaign. MarkerService begins enabled because ConditionService, NPCManager, ConcentrationTracker, and marker diagnostics use it. |
| 📜 **3 · Prepare CritFumble** | If CritFumble will be used, create the seven tables listed in [§11 · Roll-Table Cookbook](#11-roll-table-cookbook). Skip this step when CritFumble is disabled. |
| 🔄 **4 · Reload** | Save or restart the Mod sandbox and wait for the GameAssist core ready whisper. Module-by-module startup whispers are normally quiet. |
| 🩺 **5 · Check Health** | Run `!ga-status` and `!ga-config modules`. Confirm the features you enabled are running. |
| 🎲 **6 · Try the Table Tools** | Test `!condition help`, `!critfumble menu`, `!concentration --status`, and `!npc-hp-selected` for the modules you use. |
| 🛡️ **7 · Verify Real Changes** | With disposable tokens, test one NPC death/revival and one concentration marker before the first live session. |

The final `v0.1.5.0` release replaces the standalone TokenMod and StatusInfo installations for the supported GameAssist token and condition workflows. It does not keep a hidden legacy path that sends GameAssist marker work back to those standalone scripts.

If MarkerService is deliberately disabled, ConditionService, NPCManager, ConcentrationTracker, and DebugTools are also disabled. CritFumble, ConfigUI, and NPCHPRoller remain available. Standalone **TokenMod by The Aaron** and **StatusInfo by Robin Kuiper** can then provide their own token-marker and condition tools, but they do not restore GameAssist death-history, concentration, or ConditionService features.

`GameAssist.flags.QUIET_STARTUP` defaults to `true`. Expect the core ready whisper, but not one ready message from every module.

### 4.1 Minimum Smoke Test

Run these commands after every update:

```roll20chat
!ga-status
!ga-config modules
!ga-config list
!ga-metrics
!condition help
!condition
!critfumble menu
!concentration --status
!npc-death-help
!npc-death-report
!npc-death-buckets
!npc-death-audit
!npc-hp-selected
```

Then perform five real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Select a disposable token, add and remove one condition, and confirm unrelated markers remain unchanged.
5. Disable and re-enable one module or service.

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
├─ ConditionService
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
  "version": "0.1.5.0",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v0.1.5.0 does not import or restore snapshots.

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

### 6.2 ConditionService

> **Module version:** ConditionService `1.0.1` is an independently branded GameAssist module. It acknowledges StatusInfo by Robin Kuiper as its compatibility and design foundation, but it is not an official StatusInfo release.

ConditionService gives the table a readable condition reference and a marker-backed selected-token menu. It defaults to the fifteen SRD 5.1 conditions used by the 2014 rules, including Exhaustion rather than Inspiration. The GM can switch the official descriptions to SRD 5.2.1 wording for the 2024 rules or edit any description for campaign-specific wording. Open `!condition` after selecting tokens to see their tracked conditions and toggle another condition with one click. Select linked character tokens and use `!condition announce` to communicate a condition publicly or to their player controllers. `!condition help` is the quick-start guide.

Common commands:

* `!condition` → Open the selected-token condition menu.
* `!condition help` → Open the quick-start guide.
* `!condition <name>` → Show one configured condition description.
* `!cond-<condition>` → Show the same description with a case-insensitive short reference command, such as `!cond-prone`, `!COND-EXHAUSTION`, or a DM-created condition key.
* `!condition add <condition...>` → Add one or more conditions to selected tokens.
* `!condition remove <condition...>` → Remove conditions from selected tokens.
* `!condition toggle <condition...>` → Switch conditions on or off for selected tokens.
* `!condition announce` → Open a selected-character announcement menu with public and player-whisper choices.
* `!condition config` → Open GM settings.
* `!condition config-conditions` → Add, edit, or remove condition definitions.
* `!condition config export` / `!condition config import <JSON>` → Export or apply a validated ConditionService configuration.
* `!condition reset` → Open a confirmation prompt before restoring defaults.

Player description access and player marker changes are separate settings. Both are off by default. The permanent `!condition` and `!cond-<condition>` commands remain available even when the GM configures an additional compatibility alias. A private **Read Exact Wording** button issued by the GM grants only that temporary reference; it does not enable unrestricted player commands.

The **Condition wording** setting offers **2014 SRD** and **2024 SRD** profiles. Switching profiles updates only the fifteen official condition names and descriptions: configured marker choices and additional campaign conditions are retained. Editing any description marks the wording source as **Campaign Custom**. Untouched ConditionService 1.0.0 defaults are upgraded to the complete 2014 list; previously edited or migrated definitions are preserved as custom wording.

Condition definitions store a display name, plain-language description, and a marker. A marker may be a built-in id, a custom display name, an exact stored `Name::id` tag, or a numbered value such as `red@3`. ConditionService uses MarkerService for every read, add, remove, toggle, and marker-change observation, so unrelated markers and number overlays remain intact. Built-in markers render from Roll20's status artwork. Registered custom markers use their campaign-library image URL when Roll20 exposes it; an exact tag without readable registry artwork falls back to the marker name.

The announcement workflow is GM-only and communication-only: it does not silently change token markers. Select up to twelve linked character tokens, open `!condition announce`, choose a configured official or custom condition, then choose a varied public declaration, a whisper to each selected character's non-GM controllers, or exact wording delivered through either route. Public and whispered declarations include an expiring **Read Exact Wording** button that privately whispers the condition text to the player who clicks it.

On first startup, valid legacy `state.STATUSINFO` settings and condition definitions are copied into `state.GameAssist.ConditionService.config`. GameAssist keeps the original `state.STATUSINFO` branch for rollback and records what was imported. A separately installed StatusInfo script should then be removed or disabled because both tools respond to `!condition` and condition-marker changes.

Configuration imports are size-bounded, reject unsafe keys, validate every definition, and apply only after the entire payload passes. The protected `conditions`, `rulesProfile`, and migration-record maps cannot be replaced through generic `!ga-config set`; use the ConditionService settings menu and validated importer.

**StatusInfo compatibility boundary:** ConditionService preserves the principal condition-reference, artwork, menu, permission, definition, import/export, and marker-change workflows, but it is not a line-for-line replacement. StatusInfo's Shaped Character Sheet attribute synchronization is intentionally omitted because GameAssist currently targets Roll20's D&D 5E sheets and treats token markers as the condition source of truth. Legacy StatusInfo global helper names and observer callbacks are replaced by `GameAssist.ConditionService` and `GameAssist.MarkerService.observe(...)`. An optional custom command alias takes effect after the Mod sandbox reloads; permanent `!condition` and `!cond-<condition>` routes remain active.

Config keys: `command`, `rulesProfile`, `userAllowed`, `userToggle`, `sendOnlyToGM`, `showDescOnStatusChange`, `showIconInDescription`, `randomizeAnnouncements`, and `conditions`.

### 6.3 Concentration Tracker

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

In v0.1.5.0, concentration status, add, remove, and teardown operations use MarkerService. Each mutation returns an explicit result, exact stored custom tags remain usable when the campaign registry cannot be read, and unrelated or numbered markers are preserved. ConditionService observes MarkerService directly and can describe a configured concentration marker when a matching condition definition exists.

Config keys: `marker`, `randomize`.

### 6.4 NPC Manager

> **Marker service:** NPCManager uses the integrated `GameAssist.MarkerService`; death history remains independent from marker-write success.

> **Module version:** NPCManager `1.2.0` in GameAssist v0.1.5.0. NPCManager `1.0.0` introduced the four-level history model; `1.1.0` added curated Arc management, hierarchical clearing, date rollover, and the report writer; `1.1.1` hardened standalone interoperability and new-token HP initialization; `1.2.0` migrates all marker behavior to MarkerService.

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
* `!npc-death-arc` → Show arc bucket help and current arc counts.
* `!npc-death-arc --name "Arc Name"` → Add selected linked PC/NPC tokens to that arc handout.
* `!npc-death-arc --name "Arc Name" --session` → Append current Session bucket deaths to that arc handout.
* `!npc-death-arc --name "Arc Name" --manage` → Open removal, selected-token removal, undo, and Session-import controls.
* `!npc-death-arc --name "Arc Name" --session --allowDuplicates` → Intentionally add repeated entries; ordinary additions deduplicate by creature.

`!npc-death-report` is a history report. It opens with totals, the latest death, most frequent names, recent entries, and buttons for common next steps. Every new death is written to all four active buckets. A clear confirmation offers either the selected bucket alone or that level and its descendants; for example, clearing Section and below clears Section and Session while retaining Chapter and Campaign. Each bucket has its own handout named like `GameAssist Deaths - Session - 2026-07-17`. Revivals are annotated on the matching entry instead of silently deleting the death. Current entries are matched by token ID, so separate tokens with the same name remain separate records.

The default Session name follows the sandbox's UTC date. Before any NPCManager command or tracked NPC HP change, GameAssist checks the date and moves a date-managed Session to the new `YYYY-MM-DD` bucket. No death processed after that check is written into yesterday's Session. If the DM explicitly names the Session, that custom name remains active across date changes; **Reset Session Date** restores automatic date-managed rollover. A DM-configurable timezone is tracked separately because v0.1.5.0 does not yet reinterpret stored timestamps or date boundaries.

Arc handouts are curated rosters, not another hierarchy level. A linked creature appears once per Arc by default, so adding selected NPCs and later importing the full Session does not repeat those creatures. The Session import can enrich an existing selected entry with its death record. The management menu can remove one entry, remove all selected tokens, or undo the most recent Arc addition. `--allowDuplicates` is an explicit override for deliberate repetition. Selected-token Arc entries remain general story notes; revival annotations apply only after an entry is linked to Session death history.

`!npc-death-audit` is the mismatch checker. Chat shows a summary plus bounded, token-specific **Add Death Marker** and **Remove Death Marker** groups. The complete list is written to the `GameAssist NPC Death Audit` handout. The audit checks linked NPC tokens on the current player page; player characters are not included. A clean audit means linked NPC tokens have death markers that match their HP. The audit may also note ignored unlinked page items such as party markers, scenery, labels, or props.

Disabling NPCManager stops its automation and requests removal of its configured marker from qualifying current-page tokens. Saved Campaign, Chapter, Section, Session, and Arc records remain available after the module is enabled again. Use the NPCManager clear and Arc-management controls when history should actually be removed.

Config keys: `autoTrackDeath`, `deadMarker`, `autoHide`, `hideLayer`.

### 6.5 NPC HP Roller

> **Dependency:** NPCHPRoller does **not** require TokenMod.

NPCHPRoller reads `npc=1` and `npc_hpformula` from linked characters, parses `NdM+K` or `NdM-K`, and writes the result to token `bar1_value` and `bar1_max`.

* `!npc-hp-selected` → Roll HP for qualifying selected NPC tokens.
* `!npc-hp-all` → Roll HP for qualifying NPC tokens on the current player page.
* `autoRollOnAdd=true` → Quietly attempt HP rolling when a qualifying NPC token is added.

Invalid, unlinked, and PC tokens are skipped.

Config key: `autoRollOnAdd`.

### 6.6 Config UI

`!ga-config ui` or `!ga-config-ui` whispers a GM-only chat control panel. Each module card can show:

* Current enabled/disabled status with a one-click toggle.
* Boolean configuration keys as chat buttons.
* A brief configuration summary.
* Previous, refresh, and next pagination controls.

Config keys: `pageSize`, `showSummaries`.

Disable ConfigUI if you prefer command-only administration.

### 6.7 Debug Tools *(GM-only)*

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

1. Paste the complete contents of `GameAssist` v0.1.5.0.
2. Keep the script as one complete file; do not paste only individual MECHSUITS sections into Roll20.
3. Save the script.

III. **Remove Overlapping Standalone Marker Tools**

The completed `v0.1.5.0` release replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by GameAssist. ConditionService is already present in this development checkpoint. Remove standalone StatusInfo before enabling it so two tools do not respond to `!condition` or the same marker changes. The integrated token-service replacement remains part of Issue #27.

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
|  | `!ga-metrics` | `[reset]` | Show persisted session totals/history or reset metrics. |
|  | `!ga-config list` | — | Write a versioned configuration-only snapshot handout. |
|  | `!ga-config get <ModuleOrService> [key]` | — | Whisper one config value or the component’s full config. |
|  | `!ga-config set <ModuleOrService> <key>=<value>` | — | Persist an ordinary component config value; unsafe and component-protected keys are refused. |
|  | `!ga-config modules` | — | Show feature-module and core-service configured/runtime/dependency status. |
|  | `!ga-config cleanup` | — | Explicitly remove unknown/orphaned state branches. |
|  | `!ga-config ui` / `!ga-config-ui` | `[--page N]` | Open the GM Config UI. |
|  | `!ga-enable <ModuleOrService>` / `!ga-disable <ModuleOrService>` | — | Enable or disable a module or core service; names are case-insensitive. |
| **GM** | `!npc-hp-all` | — | Roll and set HP for qualifying NPC tokens on the current page. |
|  | `!npc-hp-selected` | — | Roll and set HP for qualifying selected NPC tokens. |
|  | `!npc-death-help` | — | Open the same central NPCManager guide as `!npc-death-report --help`. |
|  | `!npc-death-report` | `[--scope campaign\|chapter\|section\|session] [--recent] [--page N] [--write] [--help]` | Show bucket history; `--help` opens the central guide and `--write` opens the report writer. |
|  | `!npc-death-buckets` | `[--campaign "Name"] [--chapter "Name"] [--section "Name"] [--session "Name"] [--resetSession]` | View or rename the active death-history buckets. |
|  | `!npc-death-clear` | `[--scope session] [--nested] [--confirm]` | Clear only the selected bucket, or add `--nested` to clear that level and its descendants. |
|  | `!NPC-WR` / `!npc-death-write` | `[--all] [--scope <level>] [--newSection "Name"]` | Open the report writer, update selected handouts, or seed a new Section from the current Session. |
|  | `!npc-death-audit` | — | Summarize current HP/death-marker mismatches and update the audit handout. |
|  | `!npc-death-arc` | `[--name "Arc"] [--session] [--note "Text"] [--manage] [--allowDuplicates]` | Maintain a deduplicated Arc roster from selected tokens or the current Session; manage removal and undo in chat. |
|  | `!ga-conc-status` | — | Show recent concentration DC/damage data per player. |
|  | `!condition config` | — | Open ConditionService settings and condition-definition controls. |
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
| **GM** | `!condition announce` | selected linked character tokens | Choose a condition, then announce or deliver its exact wording publicly or to player controllers. |
|  | `!concentration` / `!cc` | `--damage N`, `--mode normal|adv|dis`, `--last`, `--off`, `--status`, `--config randomize on|off`, `--help` | Open or perform a concentration workflow. |

### 8.1 Configuration Safety

These keys are refused:

```text
__proto__
prototype
constructor
```

Setting `enabled=true` or `enabled=false` routes through component lifecycle controls rather than directly mutating the stored value. ConditionService's `conditions`, `rulesProfile`, and migration record are protected from generic replacement; use `!condition config` and its validated importer.

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
| **ConditionService** | `enabled` | bool | `true` | Enable condition menus, descriptions, and marker controls. |
|  | `command` | string | `"condition"` | Optional additional command alias; permanent `!condition` compatibility remains. |
|  | `rulesProfile` | enum | `"2014"` | Select `2014`, `2024`, or campaign-`custom` condition wording through the ConditionService settings panel. |
|  | `userAllowed` | bool | `false` | Allow players to request condition descriptions. |
|  | `userToggle` | bool | `false` | Allow players to change condition markers on selected tokens. |
|  | `sendOnlyToGM` | bool | `false` | Whisper condition descriptions only to the GM. |
|  | `showDescOnStatusChange` | bool | `true` | Show a condition description when its marker is added. |
|  | `showIconInDescription` | bool | `true` | Show built-in or registered custom marker artwork beside descriptions, with a readable fallback. |
|  | `randomizeAnnouncements` | bool | `true` | Vary the creative wording used by condition declarations. |
|  | `conditions` | object | 15 definitions | Validated condition name, marker, and description map; manage through `!condition config`. |
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
| **Condition Service** | `GameAssist.ConditionService` | Read validated condition definitions or apply add/remove/toggle actions through MarkerService. |
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

Marker removal clears every duplicate instance of the requested marker. Other marker ids, duplicate entries for unrelated markers, and number overlays are preserved. Adding an already-present marker is idempotent unless a number option explicitly updates its first matching entry.

When MarkerService is disabled, marker operations return `UNAVAILABLE` with the command needed to restore the service. ConditionService, NPCManager, ConcentrationTracker, and DebugTools are disabled before the service closes so their teardown can complete safely. Observer registrations pause while the service is off and resume when it is enabled again.

### 10.7 ConditionService

`GameAssist.ConditionService` is available while the module is running:

```js
const conditions = GameAssist.ConditionService;

const prone = conditions.getCondition('prone');
const allDefinitions = conditions.getConditions();
const result = conditions.apply([token], ['prone', 'poisoned'], 'add');
```

| Method | Result |
| --- | --- |
| `version` | ConditionService component version (`1.0.1`). |
| `configSchemaVersion` | Validated condition export/import schema version (`2`). |
| `rulesProfile()` | Returns the active `2014`, `2024`, or `custom` wording source. |
| `getCondition(name)` | Returns a copy of one definition or `null`. |
| `getConditions()` | Returns a deep copy of every configured definition. |
| `apply(tokens, names, action)` | Applies `add`, `remove`, or `toggle` through MarkerService and returns changed/unchanged/failed counts. |

The public API refuses mutation while ConditionService is disabled. Callers must inspect `ok`; a disabled module returns `UNAVAILABLE`, and an unsupported action returns `INVALID_ARGUMENT`.

### 10.8 MECHSUITS Contribution Contract

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
!ga-disable ConfigUI
!ga-disable CritFumble
!ga-disable ConcentrationTracker
!ga-disable NPCManager
!ga-disable NPCHPRoller
!ga-disable DebugTools
```

Core admin commands remain available because the core is not a toggleable bundled module.
NPCManager's configured marker may be cleared from current-page tokens, but its saved death-history and Arc records are retained.

### 12.3 Restore Normal Bundled Modules

```roll20chat
!ga-enable ConfigUI
!ga-enable CritFumble
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

---

## 13 · Performance Benchmarks <a id="13-performance-benchmarks"></a>

> **Historical reference only:** The following numbers were recorded for an earlier v0.1.3-era build and have **not** been revalidated for v0.1.5.0. Roll20 sandbox load, campaign size, browser state, network conditions, token formulas, and other Mods can materially change results. Do not treat this table as a current performance guarantee.

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

### 13.1 Repeatable Benchmarking for v0.1.5.0

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

ConditionService, NPCManager, ConcentrationTracker, and DebugTools use `GameAssist.MarkerService`; they should report `deps confirmed` without standalone TokenMod.

Run:

```roll20chat
!ga-status --details
!ga-config modules
```

The details panel should report MarkerService as enabled. ConditionService should appear enabled and running after standalone StatusInfo is removed. The final `v0.1.5.0` release also includes the integrated token service, so standalone TokenMod will be removed before that release's overlapping token-command features are enabled.

If another Mod must own marker behavior, use `!ga-disable MarkerService`. GameAssist disables ConditionService, NPCManager, ConcentrationTracker, and DebugTools first, then turns off MarkerService. The chat notice identifies the affected features; unrelated GameAssist modules remain available. Re-enable MarkerService before re-enabling any dependent module.

### 14.4 ConditionService Does Not Respond, Shows the Wrong Wording, or Uses the Wrong Marker

Run:

```roll20chat
!ga-config modules
!condition help
!condition config
!cond-prone
```

Confirm MarkerService and ConditionService are running, and remove standalone StatusInfo if both tools are responding. The Settings panel identifies the active **2014 SRD**, **2024 SRD**, or **Campaign Custom** wording source. Use the profile buttons to restore an official set, or open **Manage Conditions** to edit one description or check its marker. Built-in ids, custom display names, exact `Name::id` tags, and numbered markers such as `red@3` are supported. Use the validated ConditionService importer for definition maps; generic `!ga-config set ConditionService conditions=...` is intentionally refused.

When a marker action fails, first verify the configured marker and target token rather than changing TokenMod permissions:

```roll20chat
!ga-config get NPCManager deadMarker
!ga-config get ConcentrationTracker marker
!npc-death-audit
!concentration --status
```

For an exact custom marker, configure either its display name or stored `Name::id` tag. A valid exact stored tag remains usable even when Roll20's campaign marker registry cannot be parsed.

### 14.5 Startup Messages Are Missing

This is normally expected. `GameAssist.flags.QUIET_STARTUP` defaults to `true`, suppressing module-specific startup whispers. The core ready message remains visible.

Use `!ga-status` and `!ga-config modules` instead of relying on one whisper per module.

### 14.6 State Repair or Unknown-Branch Warnings

Known module branches with malformed/missing `config` or `runtime` containers are repaired conservatively at startup. Valid existing config is preserved.

Unknown branches are not deleted automatically. Review the warning, then explicitly remove orphaned branches only when you are certain:

```roll20chat
!ga-config cleanup
```

### 14.7 `!ga-config list` Is Not a Full Backup

The `GameAssist Config` handout contains flags, global config, and module config only. It excludes runtime caches, metrics, and unknown state branches. v0.1.5.0 cannot import the snapshot.

Use it for configuration review and upgrade comparison—not as a full restore mechanism.

### 14.8 CritFumble Menu or Table Roll Fails

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

### 14.9 NPC Death Marker Does Not Match HP

Run:

```roll20chat
!ga-config get NPCManager deadMarker
!npc-death-audit
```

Confirm the token:

* is on the Objects layer,
* represents a character,
* has character attribute `npc=1`,
* uses `bar1_value` for HP,
* and has a valid configured marker.

`!npc-death-audit` whispers a bounded list of the specific tokens needing a marker added or removed, and writes the complete mismatch list to the `GameAssist NPC Death Audit` handout. Player characters are intentionally excluded from this audit.

`!npc-death-report` shows recorded bucket history in summary/detail views; it does not audit the page.

### 14.10 Concentration Marker Does Not Clear

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

### 14.11 NPC HP Does Not Roll

Confirm the token:

* is linked to a character,
* represents an NPC with `npc=1`,
* has a valid `npc_hpformula` such as `4d8+8`,
* and is on the correct page or selected for the command.

NPCHPRoller does not require TokenMod.

### 14.12 Debug Command Does Nothing

Enable DebugTools first:

```roll20chat
!ga-enable DebugTools
```

DebugTools performs a dry run unless `--apply` is supplied. To use selected tokens, omit `--token`; do not write `--token select`.

### 14.13 Compatibility Hints

Compatibility scanning is debug-only:

```js
GameAssist.flags.DEBUG_COMPAT = true;
```

Reload, inspect the output, then return it to `false` to avoid noise. Do not run standalone versions of CritFumble, Concentration, NPC Death Tracker, or NPC HP Roller alongside their integrated GameAssist modules.

### 14.14 Still Stuck?

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

### 15.1 Recommended Upgrade: v0.1.4.7 → v0.1.5.0

I. **Freeze the Current Working Script**

1. Keep a copy of the complete v0.1.4.7 script.
2. Run `!ga-config list` for a configuration-only comparison snapshot.
3. Record any TokenMod or StatusInfo commands, saved configuration, or macros the campaign currently uses so their GameAssist equivalents can be verified after the upgrade. Existing valid `state.STATUSINFO` settings are copied non-destructively on first ConditionService startup.

> The snapshot is not a full-state backup and cannot be imported automatically.

II. **Replace the Script**

1. Replace the Roll20 script contents with the complete GameAssist v0.1.5.0 file.
2. Save/reload the Mod sandbox.
3. Do not combine partial sections from multiple releases.

III. **Verify Core Health**

```roll20chat
!ga-status
!ga-status --details
!ga-config modules
!ga-metrics
```

MarkerService should report enabled. ConditionService, NPCManager, and ConcentrationTracker should run with `deps confirmed`. Standalone StatusInfo should be absent; the integrated TokenMod replacement is verified later in this release train under Issue #27.

IV. **Verify Configuration and Marker State**

```roll20chat
!ga-config get NPCManager
!ga-config get ConcentrationTracker
!ga-config get ConditionService userAllowed
!ga-config get DebugTools
!condition help
!condition
!npc-death-audit
!concentration --status
```

Existing configured built-in names, custom display names, and exact stored tags remain supported. ConditionService copies valid legacy `state.STATUSINFO` settings and definitions into its own validated configuration while retaining the legacy branch for rollback.

V. **Run the Smoke Test**

Use [§4.1 Minimum Smoke Test](#41-minimum-smoke-test), including real HP, concentration, marker preservation, MarkerService disable cascading, and service/module re-enablement.

### 15.2 Rollback

If v0.1.5.0 fails its smoke test:

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

| Item | Status in v0.1.5.0 | Notes |
| --- | --- | --- |
| MarkerService | **Implemented; sandbox acceptance pending** | One toggleable service owns GameAssist marker resolution, mutation, preservation, and observation. Disabling it turns off dependent modules without disabling unrelated features. |
| Bundled marker consumers | **Migrated** | NPCManager 1.2.0, ConcentrationTracker 0.2.0, and DebugTools 0.2.0 no longer require standalone TokenMod. |
| ConditionService 1.0.1 | **Implemented; sandbox acceptance pending** | Independently branded and attributed GameAssist condition service with `!condition` and case-insensitive `!cond-<condition>` references, selectable 2014/2024 SRD wording, campaign edits, marker artwork, selected-character announcements, validated legacy migration/import, and MarkerService synchronization. |
| Integrated token service | **Required before release** | Independently branded and attributed GameAssist service based on the TokenMod foundation; compatibility is verified command family by command family. |
| Integrated architecture stabilization | **Required before release** | Upgrade, coexistence, migration, command, marker, and Roll20 sandbox checks tracked through Issues #28 and #29. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| NPC death history | **Implemented** | Four-level handouts, Arc management, report writer, date-managed Sessions, and MarkerService-backed death markers. |
| Native Mord character-sheet support | **Deferred** | Begin after the complete v0.1.5.0 marker, token, and condition architecture is stable. |

### 17.2 Near-Term Candidate: Compatibility-First Bridge Character Sheet

After the complete `v0.1.5.0` integrated architecture is confirmed stable in Roll20, the recommended character-sheet project is a bridge sheet that:

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

### 17.4 Explicit Non-Goals for v0.1.5.0

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No plugin loader, Rest Manager, encounter suite, or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v0.1.5.0 – Integrated Token and Condition Architecture *(in development)*

* Added `[GAMEASSIST:CORE:MARKERSERVICE]` and exposed `GameAssist.MarkerService` as a toggleable core service.
* Centralized built-in/custom marker resolution, exact stored-tag fallback, structured reads, add/remove/toggle/set operations, numbered markers, duplicate handling, and observations.
* Migrated NPCManager, ConcentrationTracker, and DebugTools away from chat-generated TokenMod requests.
* Removed standalone TokenMod dependency gating from bundled marker consumers.
* Added service dependency safeguards: disabling MarkerService first disables its dependent modules and leaves unrelated GameAssist modules available.
* Added `[GAMEASSIST:MODULES:CONDITIONSERVICE]` and advanced the unreleased `GameAssist.ConditionService` to 1.0.1 with guided `!condition` menus, case-insensitive `!cond-<condition>` quick references, 2014/2024 SRD wording profiles, campaign-custom descriptions, built-in/custom marker artwork, public/player-whisper announcements, add/remove/toggle actions, configurable definitions, and guarded player permissions.
* Added validated, non-destructive migration from `state.STATUSINFO`, bounded ConditionService import/export, protected configuration maps, standalone StatusInfo warnings, and numbered/custom marker support through MarkerService.
* Advanced NPCManager to `1.2.0`, ConcentrationTracker to `0.2.0`, and DebugTools to `0.2.0`.
* Preserved existing module commands, configuration keys, death history, concentration runtime data, and unrelated token markers.
* The release remains open until the independently branded token service, stabilization work, and final sandbox acceptance are complete.

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

* **Unverifiable Dependency**  
  A dependency whose presence GameAssist could not confirm because Roll20 did not expose enough metadata. GameAssist warns and proceeds.

* **Watchdog**  
  A periodic observer for the explicit queue. It can release stalled queue state but cannot terminate running JavaScript or Roll20 operations.


---

## 20 · Licensing and Attribution <a id="20-licensing-and-attribution"></a>

Original GameAssist code is independently developed and maintained by Mord Eagle under the MIT License in [`LICENSE`](LICENSE). Adapted upstream work and SRD-derived condition wording retain the separate notices in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and the executable source.

### MarkerService

`GameAssist.MarkerService` is an original GameAssist implementation. Its compatibility goals and marker behavior were informed by TokenMod's established Roll20 behavior. TokenMod was created by **The Aaron, Arcane Scriptomancer**.

### Integrated Token and Condition Services

The final `v0.1.5.0` release includes independently maintained GameAssist token and condition services with original GameAssist names.

Where their implementations contain adapted upstream code, GameAssist will retain:

- the original project and author;
- the exact upstream version and commit;
- the applicable MIT copyright and permission notice;
- a record of adapted and independently implemented portions;
- a statement that the GameAssist service is independently maintained and is not an official upstream release.

The general token service will acknowledge **TokenMod by The Aaron**. **ConditionService** acknowledges **StatusInfo by Robin Kuiper** as its compatibility and design foundation. It preserves selected `!condition` workflows and legacy configuration concepts while using original GameAssist lifecycle, validation, menus, migration, wording profiles, and MarkerService integration. It is not an official StatusInfo release.

ConditionService includes condition wording derived from SRD 5.1 for the 2014 profile and SRD 5.2.1 for the 2024 profile under the Creative Commons Attribution 4.0 International License. It does not reproduce non-SRD sourcebook text.

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) for public acknowledgments, upstream links, license notices, and SRD guidance.

> **Tip:** After an update, use the current smoke test to confirm the enabled features in the campaign's own Roll20 sandbox.
