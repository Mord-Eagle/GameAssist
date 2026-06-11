# GameAssist – Modular API Framework for Roll20

**Version 0.1.4.3** | © 2025 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

> **Release posture:** v0.1.4.3 is a standalone-interoperability stabilization release candidate. It preserves the v0.1.4.2 diagnostic foundation while correcting custom status-marker recognition and improving ConcentrationTracker diagnostics. Live Roll20 smoke confirmation is still required.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel and six bundled modules—ConfigUI, CritFumble, ConcentrationTracker, NPCManager, NPCHPRoller, and DebugTools. It provides guarded module lifecycle controls, direct command and event routing, an explicit opt-in queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. It is designed to make common campaign automation easier to operate and easier to extend without pretending the Roll20 sandbox can cancel running JavaScript, perfectly discover every installed Mod, or automatically repair every possible state problem.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, session metrics, dependency diagnostics, and GM health reporting. |
| 30-Second Install | ① Paste **GameAssist-v0.1.4.3** ② Install **TokenMod** for marker modules ③ Add the seven CritFumble roll-tables ④ Save/reload ⑤ Run `!ga-status`. |
| Flagship Player Commands | `!concentration`, `!cc`, `!critfail`, `!critfumble-<type>`. |
| Flagship GM Commands | `!npc-hp-all`, `!npc-hp-selected`, `!npc-death-report`, `!npc-death-audit`, `!ga-conc-status`, `!ga-config ui`. |
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

> 17. [Roadmap](#17-roadmap) 18. [Changelog](#18-changelog) 19. [Glossary](#19-glossary)

---

## 3 · Overview <a id="3-overview"></a>

GameAssist’s kernel and bundled modules expose:

* **Direct Event & Command Routing** – normal Roll20 events and API commands execute directly through guarded handlers. GameAssist captures Roll20’s native `on` function once and does not replace global `on` or `off`.
* **Explicit Task Queue** – future modules may submit selected work through `GameAssist.enqueue(...)` when serialized execution is genuinely useful.
* **Queue Watchdog** – observes the explicit queue and releases it after stalled jobs time out. It cannot kill the timed-out operation itself.
* **State Manager** – stores namespaced module data under `state.GameAssist.<Module>` and repairs missing or malformed known `config` and `runtime` containers.
* **State Auditor** – warns about unknown branches without deleting them automatically. The GM chooses whether to remove them with `!ga-config cleanup`.
* **Metrics Board** – records command, event, queue, error, toggle, and audit activity. View current health with `!ga-status` and persisted session details with `!ga-metrics`.
* **Guarded Module Toggles** – `!ga-enable` and `!ga-disable` control module activity without depending on a Roll20 `off()` API.
* **Compatibility Audit** – optional, debug-only overlap hints for popular scripts such as TokenMod, ScriptCards, and APILogic.
* **Dependency Diagnostics** – module dependencies are reported as confirmed, missing, or unverifiable instead of being presented as guaranteed discoveries.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that fails honestly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

```text
📥 1  Copy GameAssist-v0.1.4.3 → Roll20 Mod/API Scripts → Save
🛠 2  Install TokenMod if using NPCManager or ConcentrationTracker markers
📜 3  Create 7 CritFumble roll-tables (see §11: Roll-Table Cookbook)
🔄 4  Save/reload the sandbox and wait for the core ready whisper
🩺 5  Run !ga-status and !ga-config modules
🎲 6  Test !critfail, !concentration --status, and !npc-hp-selected
```

`GameAssist.flags.QUIET_STARTUP` defaults to `true`. Expect the core ready whisper, but not one ready message from every module.

### 4.1 Minimum Smoke Test

Run these commands after every update:

```roll20chat
!ga-status
!ga-config modules
!ga-config list
!ga-metrics
!critfail
!concentration --status
!npc-death-report
!npc-death-audit
!npc-hp-selected
```

Then perform four real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Disable and re-enable one module.

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

### 5.2 Why Normal Events Are Not Queued

Roll20 event handlers often perform small, immediate checks. Automatically routing every event through one queue would add latency, increase coupling, and create a single congestion point. In v0.1.4.x, ordinary handlers remain direct; modules opt into serialization only when their own work requires it.

### 5.3 Fail-Safe Scenarios

| Scenario | GameAssist Response | Important Limit |
| --- | --- | --- |
| Uncaught exception in a guarded module handler | Records an error and whispers the GM. Other handlers can continue. | It cannot repair arbitrary module logic. |
| Explicit queued task exceeds its timeout | Logs the timeout and releases the queue for later work. | It cannot cancel the underlying JavaScript or Roll20 operation. |
| Explicit queue remains busy beyond watchdog threshold | Watchdog releases the busy queue state and records a warning. | The original operation may still finish later. |
| Known module branch lacks valid `config` or `runtime` containers | Repairs the malformed containers while preserving valid configuration values. | It does not infer arbitrary missing custom values. |
| Unknown `state.GameAssist` branch is found | Warns and leaves it untouched. | Removal requires `!ga-config cleanup`. |
| Required external dependency is confirmed missing | Skips startup or refuses enablement for the dependent module. | Discovery depends on metadata Roll20 exposes. |
| Dependency cannot be verified | Warns and proceeds without confirmation. | The GM must confirm the dependency manually. |

### 5.4 Persistent State Shape

```text
state.GameAssist
├─ config
├─ flags
├─ metrics
├─ ConfigUI
│  ├─ config
│  └─ runtime
├─ CritFumble
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
  "version": "0.1.4.3",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v0.1.4.3 does not import or restore snapshots.

---

## 6 · Module Guides <a id="6-module-guides"></a>

### 6.1 CritFumble

CritFumble watches common attack and damage roll templates for a natural 1 and offers a player-targeted fumble menu. Calling `!critfail` opens a GM-facing manual menu.

Recognized templates include:

```text
atk, atkdmg, npcatk, npcfullatk, npcaction, spell, simple, dmg, default
```

Commands:

* `!critfail` → Open the manual fumble prompt.
* `!critfumble help` → Whisper the CritFumble help panel.
* `!critfumble-melee|ranged|thrown|spell|natural` → Roll the selected fumble table.
* `!confirm-crit-martial` / `!confirm-crit-magic` → Roll the matching confirmation table.

Internal player-targeted button syntax:

```text
!critfumblemenu --pid <playerId>
```

Config keys: `debug`, `useEmojis`, `rollDelayMs`.

### 6.2 Concentration Tracker

> **Dependency:** TokenMod is required for automated marker changes.

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

Config keys: `marker`, `randomize`.

### 6.3 NPC Manager

> **Dependency:** TokenMod is required for automated death-marker changes.

NPCManager watches `change:graphic:bar1_value` for linked NPC characters with `npc=1`.

* HP below 1 → apply the configured `deadMarker`.
* HP above 0 → remove the configured `deadMarker`.
* `autoHide=true` → move newly dead NPC tokens to `hideLayer`.

Commands:

* `!npc-death-report` → Show recorded NPC death events.
* `!npc-death-clear` → Clear the recorded death-event log.
* `!npc-death-audit` → Check the current player page for HP/death-marker mismatches.

`!npc-death-report` is a history report; `!npc-death-audit` is the mismatch checker.

Config keys: `autoTrackDeath`, `deadMarker`, `autoHide`, `hideLayer`.

### 6.4 NPC HP Roller

> **Dependency:** NPCHPRoller does **not** require TokenMod.

NPCHPRoller reads `npc=1` and `npc_hpformula` from linked characters, parses `NdM+K` or `NdM-K`, and writes the result to token `bar1_value` and `bar1_max`.

* `!npc-hp-selected` → Roll HP for qualifying selected NPC tokens.
* `!npc-hp-all` → Roll HP for qualifying NPC tokens on the current player page.
* `autoRollOnAdd=true` → Quietly attempt HP rolling when a qualifying NPC token is added.

Invalid, unlinked, and PC tokens are skipped.

Config key: `autoRollOnAdd`.

### 6.5 Config UI

`!ga-config ui` or `!ga-config-ui` whispers a GM-only chat control panel. Each module card can show:

* Current enabled/disabled status with a one-click toggle.
* Boolean configuration keys as chat buttons.
* A brief configuration summary.
* Previous, refresh, and next pagination controls.

Config keys: `pageSize`, `showSummaries`.

Disable ConfigUI if you prefer command-only administration.

### 6.6 Debug Tools *(GM-only)*

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

1. Paste the complete contents of `GameAssist-v0.1.4.3`.
2. Keep the script as one complete file; do not paste only individual MECHSUITS sections into Roll20.
3. Save the script.

III. **Install Dependencies**

Install **TokenMod** from the Mod Library if you want NPCManager and ConcentrationTracker to change markers automatically. NPCHPRoller, CritFumble, ConfigUI, and DebugTools do not require TokenMod.

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
| **Admin** | `!ga-status` | — | Show queue mode, metrics, module counts, listeners, and dependency warnings. |
|  | `!ga-metrics` | `[reset]` | Show persisted session totals/history or reset metrics. |
|  | `!ga-config list` | — | Write a versioned configuration-only snapshot handout. |
|  | `!ga-config get <Module> [key]` | — | Whisper one config value or the module’s full config. |
|  | `!ga-config set <Module> <key>=<value>` | — | Persist a module config value; unsafe keys are refused. |
|  | `!ga-config modules` | — | Show per-module configured/runtime/dependency status. |
|  | `!ga-config cleanup` | — | Explicitly remove unknown/orphaned state branches. |
|  | `!ga-config ui` / `!ga-config-ui` | `[--page N]` | Open the GM Config UI. |
|  | `!ga-enable <Module>` / `!ga-disable <Module>` | — | Enable or disable a module. |
| **GM** | `!npc-hp-all` | — | Roll and set HP for qualifying NPC tokens on the current page. |
|  | `!npc-hp-selected` | — | Roll and set HP for qualifying selected NPC tokens. |
|  | `!npc-death-report` | — | Show recorded NPC death events. |
|  | `!npc-death-clear` | — | Clear the recorded death-event log. |
|  | `!npc-death-audit` | — | Report current HP/death-marker mismatches. |
|  | `!ga-conc-status` | — | Show recent concentration DC/damage data per player. |
| **Player / GM** | `!critfail` | — | Open the GM-facing manual fumble prompt. Intended for GM use, but not currently GM-gated. |
|  | `!critfumble help` | — | Whisper CritFumble help. |
| **Debug** | `!ga-debug damage` | `--amount N [--token ID] [--apply]` | Preview or apply bar1 damage. |
|  | `!ga-debug marker` | `--marker NAME [--state on|off|toggle] [--token ID] [--apply]` | Preview or apply a status marker change. |
|  | `!ga-debug save` | `--dc N [--bonus N] [--mode normal|adv|dis] [--label "Text"] [--apply]` | Preview or roll a save. |
| **Player / GM** | `!critfumble-<type>` | `melee|ranged|thrown|spell|natural` | Roll the selected fumble table. |
|  | `!confirm-crit-martial` / `!confirm-crit-magic` | — | Roll the matching confirmation table. |
|  | `!concentration` / `!cc` | `--damage N`, `--mode normal|adv|dis`, `--last`, `--off`, `--status`, `--config randomize on|off`, `--help` | Open or perform a concentration workflow. |

### 8.1 Configuration Safety

These keys are refused:

```text
__proto__
prototype
constructor
```

Setting `enabled=true` or `enabled=false` routes through module lifecycle controls rather than directly mutating the stored value.

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
    dependsOn: ['TokenMod']
});
```

Important contracts:

* Registration must happen before Roll20’s `ready` event.
* `events`, `prefixes`, and `dependsOn` are metadata; they do **not** wire handlers automatically.
* Modules still call `GameAssist.onEvent(...)` and/or `GameAssist.onCommand(...)`.
* A module should persist only inside `state.GameAssist.<Module>`.
* Dependencies may be reported as unverifiable if Roll20 does not expose script metadata.

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

### 10.6 MECHSUITS Contribution Contract

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
!npc-death-audit
!npc-death-clear
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

> **Historical reference only:** The following numbers were recorded for an earlier v0.1.3-era build and have **not** been revalidated for v0.1.4.3. Roll20 sandbox load, campaign size, browser state, network conditions, token formulas, and other Mods can materially change results. Do not treat this table as a current performance guarantee.

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

### 13.1 How to Benchmark v0.1.4.3 Honestly

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

Check errors, running module count, dependency warnings, and recent activity. Queue length describes only explicit queued work and module transitions. A direct handler problem may not appear as a queued task.

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
!ga-enable <Module>
```

### 14.3 TokenMod Is Missing or Unverifiable

NPCManager and ConcentrationTracker require TokenMod for marker changes.

* `missing` means GameAssist found enough metadata to conclude TokenMod is absent.
* `unverifiable` means Roll20 did not expose enough metadata. Confirm TokenMod manually and test one marker change.
* GameAssist cannot guarantee external-script discovery in every Roll20 sandbox.

### 14.4 Startup Messages Are Missing

This is normally expected. `GameAssist.flags.QUIET_STARTUP` defaults to `true`, suppressing module-specific startup whispers. The core ready message remains visible.

Use `!ga-status` and `!ga-config modules` instead of relying on one whisper per module.

### 14.5 State Repair or Unknown-Branch Warnings

Known module branches with malformed/missing `config` or `runtime` containers are repaired conservatively at startup. Valid existing config is preserved.

Unknown branches are not deleted automatically. Review the warning, then explicitly remove orphaned branches only when you are certain:

```roll20chat
!ga-config cleanup
```

### 14.6 `!ga-config list` Is Not a Full Backup

The `GameAssist Config` handout contains flags, global config, and module config only. It excludes runtime caches, metrics, and unknown state branches. v0.1.4.3 cannot import the snapshot.

Use it for configuration review and upgrade comparison—not as a full restore mechanism.

### 14.7 CritFumble Menu or Table Roll Fails

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
!critfail
!critfumble help
!critfumble-melee
!confirm-crit-martial
```

### 14.8 NPC Death Marker Does Not Match HP

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

`!npc-death-report` shows recorded deaths; it does not audit the page.

### 14.9 Concentration Marker Does Not Clear

Select the affected token and run:

```roll20chat
!ga-config get ConcentrationTracker marker
!concentration --off
!concentration --status
```

Confirm TokenMod is installed or manually verified when dependency status is `unverifiable`.

`!concentration --status` reads markers directly and should still respond when TokenMod detection is `unverifiable`. If it reports that the configured marker cannot be recognized, run:

```roll20chat
!token-mod --help-statusmarkers
!ga-config set ConcentrationTracker marker=<name-or-tag>
```

### 14.10 NPC HP Does Not Roll

Confirm the token:

* is linked to a character,
* represents an NPC with `npc=1`,
* has a valid `npc_hpformula` such as `4d8+8`,
* and is on the correct page or selected for the command.

NPCHPRoller does not require TokenMod.

### 14.11 Debug Command Does Nothing

Enable DebugTools first:

```roll20chat
!ga-enable DebugTools
```

DebugTools performs a dry run unless `--apply` is supplied. To use selected tokens, omit `--token`; do not write `--token select`.

### 14.12 Compatibility Hints

Compatibility scanning is debug-only:

```js
GameAssist.flags.DEBUG_COMPAT = true;
```

Reload, inspect the output, then return it to `false` to avoid noise. Do not run standalone versions of CritFumble, Concentration, NPC Death Tracker, or NPC HP Roller alongside their integrated GameAssist modules.

### 14.13 Still Stuck?

Capture:

1. Exact GameAssist version.
2. `!ga-status` output.
3. `!ga-config modules` output.
4. Exact command/action that failed.
5. Exact API sandbox error text.
6. Whether TokenMod was confirmed, missing, or unverifiable.

That evidence is far more useful than “it stopped working.”

---

## 15 · Upgrade Paths <a id="15-upgrade-paths"></a>

### 15.1 Recommended Upgrade: v0.1.4.2 → v0.1.4.3

I. **Freeze the Current Working Script**

1. Keep a copy of the currently working GameAssist script.
2. Record its exact version.
3. Run `!ga-config list` for a configuration-only comparison snapshot.

> The snapshot is not a full-state backup and cannot be imported automatically.

II. **Replace the Script**

1. Replace the Roll20 script contents with the complete `GameAssist-v0.1.4.3`.
2. Save/reload the API sandbox.
3. Do not combine partial sections from multiple releases unless you are deliberately performing a MECHSUITS whole-section update and have reviewed the ancestor contracts.

III. **Verify Core Health**

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

Review all dependency warnings. An `unverifiable` dependency is not proof of failure; it is a prompt for manual confirmation.

IV. **Verify Configuration**

```roll20chat
!ga-config get ConfigUI
!ga-config get CritFumble
!ga-config get NPCManager
!ga-config get ConcentrationTracker
!ga-config get NPCHPRoller
!ga-config get DebugTools
```

v0.1.4.3 retains the known-container repairs from v0.1.4.2 while preserving valid existing config.

V. **Run the Smoke Test**

Use [§4.1 Minimum Smoke Test](#41-minimum-smoke-test), including real HP, concentration, marker, and enable/disable checks.

### 15.2 Rollback

If v0.1.4.3 fails its smoke test:

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

Thank you for helping improve GameAssist. Contributions should remain narrow, testable, and honest about Roll20 limitations.

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

| Item | Status in v0.1.4.3 | Notes |
| --- | --- | --- |
| Auto HP roll on NPC token add | **Implemented, opt-in** | `NPCHPRoller.autoRollOnAdd`, default `false`. |
| Session metrics and logging | **Implemented, basic** | `!ga-status` and `!ga-metrics`; not a full profiler. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Dependency diagnostics | **Implemented, best-effort** | Confirmed/missing/unverifiable; not guaranteed discovery. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| Native Mord character-sheet support | **Deferred** | Begin after the agreed GameAssist architecture foundation is stable; track sequencing in `ROADMAP.md`. |

### 17.2 Near-Term Candidate: Compatibility-First Bridge Character Sheet

After the GameAssist architecture foundation is confirmed stable in Roll20, the recommended character-sheet project is a bridge sheet that:

* preserves existing GameAssist command behavior,
* exposes reliable attributes for linked-token modules,
* defines clear NPC, HP-formula, save-bonus, and roll-template contracts,
* avoids requiring another broad GameAssist kernel rewrite.

This is a separate project and is not implemented in v0.1.4.3.

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

### 17.4 Explicit Non-Goals for v0.1.4.x

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No plugin loader, Rest Manager, encounter suite, or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v0.1.4.3 – Concentration Marker Recognition

* Resolved custom marker display names to the exact tags Roll20 stores on tokens.
* Preserved literal lowercase built-in marker ids such as `dead`.
* Made `!concentration --status` report unrecognized marker configuration clearly.
* Sent resolved marker tags to TokenMod for concentration add/remove/teardown requests.
* Preserved standalone TokenMod as the v0.1.4.x marker-mutation dependency.
* Kept Issue #20 open for live Roll20 sandbox confirmation.

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

* Brought the script forward from the uploaded v0.1.4 baseline.
* Incorporated selected v0.1.5-era fixes conservatively.
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

> **Tip:** When behavior in a campaign differs from this README, treat the current script and a Roll20 smoke test as the final source of truth, then correct the documentation.
