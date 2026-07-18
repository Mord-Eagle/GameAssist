# GameAssist Smoke Test

Use this checklist after installing or updating GameAssist to confirm the Roll20 Mod/API is working as expected.

The first section is a quick confidence pass for DMs. It prioritizes easy wins without promising a specific completion time. The second section contains deeper tests for troubleshooting individual modules.

> **Current target:** GameAssist v0.1.4.7

Roll20 usually calls the person running the game the **GM**. This guide uses GM and DM interchangeably.

Run commands one at a time unless a section explicitly says otherwise. Multi-line command blocks are checklists, not instructions to paste every line simultaneously.

---

## What Counts as a Pass?

GameAssist is ready for normal use when:

- the Roll20 API sandbox reloads without a red exception;
- the core health commands respond;
- the modules you intend to use report as running;
- any required dependency is either confirmed or manually verified;
- the quick feature tests for the modules you use pass.

You do **not** need every optional module or integration enabled for GameAssist itself to pass.

For example:

- DebugTools is disabled by default. That is expected.
- NPCManager and ConcentrationTracker require TokenMod for marker changes.
- StatusInfo is optional; install it only if the campaign uses condition descriptions and menus.
- NPCHPRoller does not require TokenMod.
- CritFumble table rolls require the seven named rollable tables, but its help command can be tested before those tables exist.

### Traffic-Light Result

| Result | Meaning |
| --- | --- |
| **Green** | Core health responds, no unexplained console error appears, and the modules you use pass their quick checks. |
| **Yellow** | Core works, but an optional module is disabled, a dependency is unverifiable, or a test fixture is incomplete. Resolve before relying on that feature. |
| **Red** | Core commands do not respond, the sandbox throws a GameAssist exception, or expected module behavior changes important tokens incorrectly. Stop and troubleshoot before the session. |

---

# Part One: DM Quick Confidence Check

## Before You Begin

After installing or updating GameAssist, save the script and wait for Roll20's API sandbox to restart before running the checks below. Use a test page or disposable tokens whenever possible. Install TokenMod `0.8.88` if you use NPCManager or ConcentrationTracker. StatusInfo `0.3.11` is the optional supported baseline.

The core-ready whisper should report GameAssist v0.1.4.7. You may not see one ready message for every module because module-specific startup messages are normally kept quiet.

Stop and troubleshoot before continuing if the sandbox repeatedly restarts, the API Console shows a new GameAssist `SyntaxError` or `ReferenceError`, or no GameAssist command responds.

> **Do not test commands that alter HP or markers on important live-session tokens.**

---

## Step 1: Check Core Health

Run:

```roll20chat
!ga-status
```

### Typical Healthy Default Result

The default response is a short system check rather than a list of technical counters:

```text
GameAssist 0.1.4.7 System Check

Overall
Ready - GameAssist is responding and every enabled module is running.

Modules
5 enabled modules running.
1 module turned off.

Errors This Sandbox Session
None recorded.

Dependency Check
Required dependencies were confirmed for enabled modules.
```

Immediately below the status table, a separate **GameAssist Actions** whisper should provide buttons for **Troubleshooting Details**, **Module List**, and **Open Settings**. The buttons are intentionally outside the default-template table because Roll20 omitted the button-only table row during live sandbox testing.

With TokenMod `0.8.88` installed, this common result means GameAssist found TokenMod through its public contract or version metadata. Continue to the marker tests because detection does not prove a specific token can be changed.

### Other Health Results

| What You See | Meaning | Next Action |
| --- | --- | --- |
| `Ready - GameAssist is responding and every enabled module is running.` | No enabled-module, recorded-error, or dependency concern was found. | Continue the smoke test. |
| `Ready - enabled modules are running. A marker check is recommended.` | A dependency could not be confirmed, but this is not automatically a failure. | Test one death or concentration marker. |
| `Attention needed - review the items below.` | An error was recorded, an enabled module is stopped, or a dependency is reported missing. | Open **Troubleshooting Details** and **Module List**. |

`Errors This Sandbox Session` describes only the current Roll20 sandbox session. Roll20 restarts that sandbox often, so this is not a campaign-lifetime or installation-history counter.

If Roll20 **confirms** that TokenMod is missing during startup, NPCManager and ConcentrationTracker should remain configured but not running. The simple panel should say **Attention needed**, name TokenMod and both affected modules, and the details panel should count two dependency-skipped modules. This is different from deliberately turning those modules off: intentionally disabled modules do not create active dependency warnings.

In that confirmed-missing state, retrying `!ga-enable NPCManager` should explain that TokenMod is required without changing NPCManager's existing configured setting. The next `!ga-status` response should still show the dependency-skipped problem rather than hiding it as an ordinary disabled module.

Running `!ga-disable NPCManager` must still turn off that configured-but-inactive module. The next status should stop warning about NPCManager while continuing to report any other configured module that still lacks TokenMod. The equivalent `!ga-config set ConcentrationTracker enabled=false` path must also work; after both affected modules are intentionally disabled, dependency-skipped should return to zero and the missing-TokenMod attention state should clear.

### Troubleshooting Details

Click **Troubleshooting Details** or run:

```roll20chat
!ga-status --details
```

The expanded panel retains:

- registered, enabled, running, and dependency-skipped module counts;
- commands, chat messages, and errors recorded this sandbox session;
- explicit queue length and queue mode;
- average queued-task duration, shown as `N/A` without an `ms` suffix when no duration exists;
- last recorded activity in sandbox-local display time;
- GameAssist's internally tracked event-hook count, explicitly labeled as diagnostic rather than pass/fail information.
- a **Standalone Integrations** row naming detected TokenMod and optional StatusInfo versions/configuration evidence.

Immediately below the details table, a separate **Troubleshooting Actions** whisper should provide **Refresh Details**, **Simple View**, **Module List**, and **Metrics** buttons.

The counters will vary and should not be compared to fixed expected numbers.

---

## Step 2: Check Module Status

Run:

```roll20chat
!ga-config modules
```

### Typical Default Result

```text
ConfigUI: config ✅ | runtime 🟢 | deps confirmed
CritFumble: config ✅ | runtime 🟢 | deps confirmed
NPCManager: config ✅ | runtime 🟢 | deps confirmed
ConcentrationTracker: config ✅ | runtime 🟢 | deps confirmed
NPCHPRoller: config ✅ | runtime 🟢 | deps confirmed
DebugTools: config ❌ | runtime ⏸️ | deps confirmed
```

### What the Symbols Mean

| Symbol or Phrase | Meaning |
| --- | --- |
| `config ✅` | The module is set to be enabled. |
| `runtime 🟢` | The module is currently running. |
| `config ❌` and `runtime ⏸️` for DebugTools | Expected default; DebugTools is intentionally off. |
| `deps confirmed` | No external dependency is needed, or GameAssist confirmed TokenMod through its public contract, version metadata, or Roll20's script list. |
| `deps unverifiable (TokenMod)` | The module is running, but neither TokenMod's public evidence nor Roll20's script list was visible. Test the marker feature itself. |
| `deps missing (TokenMod)` | The module cannot safely provide its TokenMod-powered marker behavior. |

### If a Module Is Not Running

Run:

```roll20chat
!ga-enable <ModuleName>
```

Then run `!ga-config modules` again and read the warning carefully.

---

## Step 3: Open the Config UI

Run either:

```roll20chat
!ga-config ui
```

or:

```roll20chat
!ga-config-ui
```

### Expected

- A GM-only GameAssist Config UI appears in chat.
- Module cards show their enabled/inactive state.
- Boolean options appear as buttons.
- Pagination buttons appear when needed.

### Easy Pass

Open the UI, click **Refresh**, and confirm it redraws once.

---

## Step 4: Check CritFumble Help

Run:

```roll20chat
!critfumble
!critfumble help
```

### Expected

- A `CritFumble Quick Reference` panel appears.
- The panel includes an `Open Natural 1 Menu` button.
- The panel lists common CritFumble commands.
- The panel lists the required rollable table names under `Before First Use`.
- This test does not require the rollable tables.

Receiving a quick reference that can lead the DM into the guided menu is the pass condition for this check.

Run or click:

```roll20chat
!critfumble menu
```

Expected: a `CritFumble Help: Natural 1 Attacks` panel appears with numbered steps, an `Open Player Picker` button, plain attack-type examples, direct-roll buttons, and confirm-roll buttons.

Optional: click **Open Player Picker** or run `!critfail`. Expected: the manual player picker opens, or GameAssist says no players have been active yet this session.

### Optional Table Test

If the CritFumble tables are installed, run:

```roll20chat
!critfumble-melee
```

Expected: GameAssist announces and rolls `CF-Melee`.

---

## Step 5: Check Concentration Status

If you use ConcentrationTracker, run:

```roll20chat
!concentration --status
```

### Expected

You receive either:

- a list of concentrating tokens; or
- `No tokens concentrating.`; or
- an actionable warning that the configured marker could not be recognized.

### What a Failure Looks Like

- **No response at all:** the command check failed. Confirm ConcentrationTracker shows `config ✅` and `runtime 🟢`. Do not assume `deps unverifiable (TokenMod)` explains the silence.
- **An unrecognized-marker warning:** run `!token-mod --help-statusmarkers`, then repair the setting with `!ga-config set ConcentrationTracker marker=<name-or-tag>`.
- **`No tokens concentrating.` while a current-page token visibly has the configured concentration marker:** marker detection failed and should be investigated; v0.1.4.3 resolves custom display names to their stored Roll20 tags.
- **The command responds correctly, but a prior concentration roll did not add or remove a marker:** wait for GameAssist's delayed verification. If it warns that TokenMod did not reach the requested state, select the named token and run the exact direct TokenMod command shown in the warning.

`!concentration --status` reads existing markers directly. TokenMod is needed to change markers, but it is not needed merely to produce a status response.

---

## Step 6: Check NPC Death Information

If you use NPCManager, run:

```roll20chat
!npc-death-help
!npc-death-report
!npc-death-buckets
!NPC-WR
!npc-death-audit
```

### Understanding the Menus

| Command | What It Does | What It Does Not Do |
| --- | --- | --- |
| `!npc-death-help` | Opens the central NPCManager guide, also available through `!npc-death-report --help`. | It does not run an audit or change saved history. |
| `!npc-death-report` | Shows the active Session death bucket, with buttons for recent/detail views. | It does not summarize the current page or check whether markers match HP. |
| `!npc-death-buckets` | Shows the active Campaign, Chapter, Section, and Session bucket names and counts. | It does not erase existing bucket handouts when names change. |
| `!NPC-WR` | Opens the report writer so the DM can review names and counts before updating handouts. | Opening the menu does not write or add a death. |
| `!npc-death-audit` | Looks for contradictions between current bar 1 HP and the configured death marker, then updates the audit handout. | It does not check player characters or list every NPC that is already correct in chat. |

Expected: `!npc-death-help` returns one `NPCManager Guide: Death Reports` panel. It should explain the four levels in plain language and provide buttons for reports, writing, clearing, Arcs, and the current-page audit.

Expected: `!npc-death-report` returns one `NPC Death Report` panel. A clean/new Session bucket says no NPC deaths are recorded. A bucket with recorded deaths shows the bucket name, total recorded deaths, the latest death, most frequent names, recent entries, action buttons, and the matching handout name.

Expected: `!npc-death-buckets` returns one `NPC Death Buckets` panel showing Campaign, Chapter, Section, and Session. The default Session name is the current date unless you already changed it.

Expected: `!NPC-WR` returns one `NPC Report Writer` panel. It should show all four active names and counts before offering write or adjustment buttons.

Expected: a single `NPC Death Audit` panel. When mismatches exist, it names the affected tokens under `Add Death Marker` or `Remove Death Marker`; each entry includes HP, current markers, and token ID. The `Scope` row should say that linked NPCs are checked and player characters are not included. The `Detail Handout` row should point to `GameAssist NPC Death Audit`.

A clean audit says no death-marker problems were found for linked NPCs. A mismatch audit gives counts in chat and writes the detailed token list to the audit handout. If the page has party markers, scenery, labels, or props, GameAssist may also mention ignored unlinked page items; that is normal.

TokenMod is used when NPCManager changes a marker. The audit itself reads existing token HP and markers directly, so an empty audit is not normally caused by TokenMod.

If an HP change records the death but the marker does not change, wait for the GameAssist warning. It should name the token, say whether TokenMod failed to add or remove the marker, and provide a direct `!token-mod --ids @{selected|token_id}` command. The history record and the visual marker are separate outcomes.

The death report no longer dumps the entire bucket by default. Use `!npc-death-report --recent` or `!npc-death-report --page 2` when you need chat details, or open the bucket handout for the full saved history.

---

## Step 7: Check Selected NPC HP

Select one disposable, linked NPC token and run:

```roll20chat
!npc-hp-selected
```

### Expected

- The token’s bar 1 current and maximum values are set to the same rolled HP value.
- GameAssist reports the NPC name, rolled HP, and formula.

### Required NPC Setup

The represented character must have:

```text
npc = 1
npc_hpformula = NdM+K
```

Example:

```text
npc = 1
npc_hpformula = 4d8+8
```

---

## Quick Pass Summary

Mark the tests that apply to your campaign:

- [ ] API sandbox reloads without a GameAssist exception.
- [ ] `!ga-status` responds with the healthy output shape above; variable counters do not need to match the example exactly.
- [ ] `!ga-config modules` lists the expected default module states.
- [ ] `!ga-config ui` opens the Config UI.
- [ ] `!critfumble help` responds.
- [ ] `!concentration --status` responds, if ConcentrationTracker is used.
- [ ] `!npc-death-report` and `!npc-death-audit` respond and are interpreted correctly, if NPCManager is used.
- [ ] `!npc-hp-selected` rolls a disposable linked NPC, if NPCHPRoller is used.

If the applicable boxes pass, GameAssist has passed the quick DM smoke test.

---

# Part Two: In-Depth Troubleshooting Tests

These tests are intended for diagnosing a problem, validating an upgrade, or checking each module before a live session.

Use a disposable Roll20 test game or test page whenever possible.

> When testing `!ga-enable` or `!ga-disable`, run one command at a time and wait for the Enabled/Disabled whisper before continuing. Module lifecycle changes use the internal queue.

---

## Build a Safe Test Page

Create these disposable test objects before running the deeper suite.

### Test PC

Create a character named `GA Test PC` with:

```text
constitution_save_bonus = 3
```

Add a token that:

- represents `GA Test PC`;
- is on the Objects layer;
- has a visible name;
- has a positive bar 1 HP value.

### Test NPC

Create a character named `GA Test NPC` with:

```text
npc = 1
npc_hpformula = 4d8+8
```

Add a token that:

- represents `GA Test NPC`;
- is on the Objects layer;
- uses bar 1 for HP;
- has a visible name.

### Unlinked Test Token

Add one unlinked token on the Objects layer. This is useful for confirming that GameAssist skips invalid tokens without damaging them.

### CritFumble Tables

Create these exact rollable-table names if testing CritFumble table execution:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

Each table needs at least one entry for a meaningful test.

---

## A. Core Health and Diagnostics

### A1. Status Baseline

Run:

```roll20chat
!ga-status
```

Compare the result to the annotated healthy output in Part One.

Check:

- [ ] Version is `0.1.4.7`.
- [ ] Overall health says either **Ready** or **Attention needed** and gives a meaningful next action.
- [ ] The normal default shows five enabled modules running and one module turned off.
- [ ] Errors are absent for a clean sandbox session, or every recorded error is understood.
- [ ] An unconfirmed TokenMod check explicitly says that it is not automatically a failure and recommends a marker test.
- [ ] A separate GameAssist Actions whisper appears immediately below the table.
- [ ] Its buttons open Troubleshooting Details, Module List, and Settings.

Now click **Troubleshooting Details** or run `!ga-status --details`.

- [ ] Six modules are registered.
- [ ] Queue length returns to zero while idle.
- [ ] No-duration state reads `N/A - no queued task duration has been recorded.` without an `ms` suffix.
- [ ] Commands, messages, last activity, and event-hook counts are clearly labeled as variable troubleshooting information.
- [ ] The event-hook count explicitly says that it is not a pass/fail test.
- [ ] A separate Troubleshooting Actions whisper provides Refresh Details, Simple View, Module List, and Metrics.

Remember that Roll20 restarts the API sandbox often. `Errors` describes problems recorded in the current sandbox session, not the lifetime of the campaign or installation.

### A2. Module Detail

Run:

```roll20chat
!ga-config modules
```

Compare the result to the typical default output from Part One.

Check every module's:

- `config` symbol: whether the module is intended to be enabled;
- `runtime` symbol: whether it is actually running now;
- `deps` text: whether GameAssist confirmed, could not verify, or believes a dependency is missing.

If a module is configured but not running, try:

```roll20chat
!ga-enable <ModuleName>
```

The resulting warning usually explains the problem.

### A3. Optional Advanced Metrics Baseline

Most DMs do not need this test. Use it when investigating a problem or preparing a bug report.

Run:

```roll20chat
!ga-metrics
```

Then run a few GameAssist commands and check metrics again:

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

Expected:

- command totals increase;
- recent activity updates;
- no unexplained error spike appears.

### A4. Optional Metrics Reset

Only reset metrics when you no longer need the current diagnostic history:

```roll20chat
!ga-metrics reset
```

Expected:

- GameAssist confirms the reset.
- Session counters restart.

---

## B. Configuration and Snapshot Tests

### B1. Read a Configuration Value

Run:

```roll20chat
!ga-config get CritFumble debug
```

Expected default:

```text
false
```

### B2. Safe Configuration Round Trip

Run:

```roll20chat
!ga-config set CritFumble debug=true
!ga-config get CritFumble debug
!ga-config set CritFumble debug=false
!ga-config get CritFumble debug
```

Expected:

- Value changes to `true`.
- Value changes back to `false`.

### B3. Unsafe-Key Refusal

Run:

```roll20chat
!ga-config set CritFumble __proto__=bad
```

Expected:

- GameAssist refuses the unsafe key.
- CritFumble remains operational.

### B4. Configuration Snapshot

Run:

```roll20chat
!ga-config list
```

Open the `GameAssist Config` handout.

Check:

- [ ] `format` is `gameassist-config-snapshot`.
- [ ] `schemaVersion` is `1`.
- [ ] `scope` is `configuration-only`.
- [ ] `version` is `0.1.4.7`.
- [ ] All six module configuration objects are present.
- [ ] Runtime caches and metrics are not included.

> This handout is a configuration snapshot, not a full-state backup, and v0.1.4.7 cannot import it.

### B5. Config UI Controls

Run:

```roll20chat
!ga-config ui
```

Check:

- module cards render;
- boolean buttons work;
- page navigation works;
- Refresh redraws once;
- `!ga-config-ui` opens the same UI.

---

## C. Module Lifecycle Tests

### C1. Safe Lifecycle Test with ConfigUI

ConfigUI is the safest module for a basic disable/enable test.

Run each line separately and wait for the preceding response:

```roll20chat
!ga-disable ConfigUI
!ga-config modules
!ga-enable ConfigUI
!ga-config modules
!ga-config ui
```

Expected:

- ConfigUI changes to disabled/inactive.
- Core commands continue working.
- ConfigUI returns to configured/running after enable.
- The UI opens after re-enable.

### C2. No Double Trigger

Run each command once:

```roll20chat
!ga-config ui
!ga-config-ui
```

Expected:

- Each command produces one Config UI response.
- Repeated enable/disable cycles do not produce duplicate responses.

### C3. Marker-Module Lifecycle Warning

Disabling NPCManager or ConcentrationTracker runs teardown and may clear that module’s configured marker from current-page tokens.

Only test this on a disposable page:

```roll20chat
!ga-disable NPCManager
!ga-enable NPCManager
!ga-disable ConcentrationTracker
!ga-enable ConcentrationTracker
```

Expected:

- No exception.
- The module returns to running after enable.
- Teardown clears only the configured marker, not similarly named unrelated markers.
- NPCManager's existing Campaign, Chapter, Section, Session, and Arc records remain present after disable and re-enable.

For a concrete retention check, record or add one recognizable NPC before disabling NPCManager. After re-enabling it, open the relevant report or Arc handout and confirm that entry is still present.

---

## D. Standalone TokenMod and StatusInfo Tests

NPCManager and ConcentrationTracker depend on standalone TokenMod for automated marker changes. StatusInfo is optional and should observe those TokenMod changes when condition descriptions are enabled.

### D1. Dependency Report

Run:

```roll20chat
!ga-config modules
```

Interpret the exact TokenMod-dependent module lines:

| What You See | Test Outcome |
| --- | --- |
| `config ✅ | runtime 🟢 | deps confirmed` | Module is running and GameAssist found TokenMod's public contract/version evidence or Roll20 script entry. Continue to marker tests. |
| `config ✅ | runtime 🟢 | deps unverifiable (TokenMod)` | Module is running, but GameAssist could not inspect TokenMod's public evidence or enough Roll20 metadata. Continue to marker tests. |
| `deps missing (TokenMod)` or a paused runtime | Install/enable TokenMod and recheck before relying on marker automation. |

The dependency line is a diagnostic hint, not the final feature test.

Run `!ga-status --details` and inspect **Standalone Integrations**. With the supported baselines installed, it should name TokenMod `v0.8.88` and, when used, StatusInfo `v0.3.11`. StatusInfo should also report whether condition descriptions are enabled.

### D2. Manual TokenMod Sanity Check

Before blaming GameAssist, verify TokenMod itself can change a disposable token marker.

Select a disposable token and run:

```roll20chat
!token-mod --ids @{selected|token_id} --set statusmarkers|+blue
!token-mod --ids @{selected|token_id} --set statusmarkers|-blue
```

Expected: the blue marker appears, then clears.

If TokenMod cannot change the marker directly, resolve TokenMod before troubleshooting GameAssist marker modules.

GameAssist's own marker requests use TokenMod's documented `--api-as` path. TokenMod's **Players can use --ids** option may remain **OFF** during every GameAssist marker test below.

### D3. Optional StatusInfo Observation

Skip this subsection when StatusInfo is not installed.

1. In StatusInfo, configure or identify a condition whose icon is the marker you will test.
2. Confirm **Show descriptions on status change** is enabled.
3. Use one GameAssist workflow to add that marker, such as an NPC death or successful concentration check.
4. Remove it through the matching GameAssist workflow.

Expected:

- StatusInfo produces the configured add/remove description once for each change.
- GameAssist does not produce a duplicate condition description of its own.
- `!ga-status --details` continues to identify StatusInfo as optional rather than a required module dependency.

If the marker changes correctly but StatusInfo says nothing, test the same marker with TokenMod directly. That isolates StatusInfo condition configuration/observation from GameAssist's marker request.

---

## E. CritFumble Tests

### E1. Help Command

Run:

```roll20chat
!critfumble help
```

Expected: CritFumble help appears as a quick reference with a button to open the guided Natural 1 menu and an exact list of required rollable tables.

Run:

```roll20chat
!critfumble menu
```

Expected: the guided Natural 1 menu appears with numbered steps, an Open Player Picker button, attack-type examples, direct-roll buttons, and confirm-roll buttons.

### E2. Manual GM Menu

Run:

```roll20chat
!critfail
```

Expected:

- A GM-facing player-selection menu appears.
- The menu includes recently active chat participants, commonly including the GM who ran the command.

### E3. Direct Table Commands

Run:

```roll20chat
!critfumble-melee
!critfumble-ranged
!critfumble-thrown
!critfumble-spell
!critfumble-natural
!confirm-crit-martial
!confirm-crit-magic
```

Expected:

- Each command announces and rolls the matching table.
- Missing or misspelled tables fail at the Roll20 table layer.

### E4. Natural-1 Detection

Roll a real attack that uses a supported roll template and produces a natural 1.

Supported templates include:

```text
atk
atkdmg
npcatk
npcfullatk
npcaction
spell
simple
dmg
default
```

Expected:

- CritFumble detects the natural 1.
- The player and GM receive the fumble/confirmation workflow.

### If CritFumble Fails

Check:

- [ ] CritFumble is running in `!ga-config modules`.
- [ ] Exact rollable-table names exist.
- [ ] The roll uses a supported template.
- [ ] The attack contains a d20 inline roll.
- [ ] `!critfumble help` still responds.

---

## F. ConcentrationTracker Tests

Use the linked `GA Test PC` token and ensure TokenMod is available or manually verified. Leave TokenMod **Players can use --ids** off to exercise GameAssist's `--api-as` path.

### F1. Button Menu

Run:

```roll20chat
!concentration
```

Expected:

- Three concentration-mode buttons appear.
- A reminder says to select a token.

### F2. Normal Check

Select the linked test PC token and run:

```roll20chat
!concentration --damage 12 --mode normal
```

Expected:

- DC is 10.
- The roll uses the character’s `constitution_save_bonus`.
- Player and GM receive the result.
- Success applies the configured marker.
- Failure removes the configured marker.
- No delayed GameAssist warning says TokenMod failed to reach the requested marker state.

### F3. Advantage and Disadvantage

Run with the test PC selected:

```roll20chat
!concentration --damage 20 --mode adv
!concentration --damage 20 --mode dis
```

Expected:

- DC is 10.
- Advantage uses the higher d20.
- Disadvantage uses the lower d20.

### F4. Repeat Last Check

Keep the test PC selected and run:

```roll20chat
!concentration --last
```

Expected: The last recorded damage and mode are reused.

### F5. Status and GM Status

Run:

```roll20chat
!concentration --status
!ga-conc-status
```

Expected:

- `--status` lists tokens with the configured concentration marker, reports none, or gives an actionable warning when the configured marker cannot be recognized.
- `!ga-conc-status` summarizes recent recorded concentration activity.

These commands report different things:

- `!concentration --status` scans current-page token markers.
- `!ga-conc-status` reports recently recorded concentration-check activity.

If `!concentration --status` is completely silent, confirm ConcentrationTracker is running and record the failure for investigation. If it gives an unrecognized-marker warning, follow the command shown in that warning. If it says no tokens are concentrating while a token visibly has the configured marker, marker detection failed. Neither result should be dismissed merely because dependency status says `unverifiable`.

### F6. Clear Marker

Select the linked test PC token and run:

```roll20chat
!concentration --off
```

Expected:

- The configured concentration marker is removed.
- A confirmation whisper appears.

### F7. Invalid Token Test

Select the unlinked test token and run:

```roll20chat
!concentration --damage 12 --mode normal
```

Expected: GameAssist explains that the token must be linked to a character on the Objects layer.

---

## G. NPCManager Tests

Use the linked `GA Test NPC` token and ensure TokenMod is available or manually verified. Leave TokenMod **Players can use --ids** off to exercise GameAssist's `--api-as` path.

Keep `NPCManager.autoHide` set to `false` during these tests. If auto-hide is enabled, a newly dead token moves off the Objects layer and must be returned before continuing the revival test.

### G1. Death Marker

Set the test NPC’s bar 1 HP to:

```text
0
```

Expected:

- The configured death marker appears.
- GameAssist records and reports the death.
- No delayed warning says TokenMod failed to add the marker.

### G2. Revival

Set the same token’s bar 1 HP to:

```text
1
```

Expected:

- The configured death marker clears.
- GameAssist reports the revival.
- No delayed warning says TokenMod failed to remove the marker.

### G3. Death Report

Run:

```roll20chat
!npc-death-report
```

Expected in v0.1.4.7: The report opens as a summary dashboard for the active Session bucket. It should show a total, latest death, most frequent names, recent entries, and action buttons. It should not dump every bucket entry into chat by default.
It should also name the active bucket handout, usually `GameAssist Deaths - Session - <date>`.

Optional detail checks:

```roll20chat
!npc-death-report --recent
!npc-death-report --page 1
!npc-death-report --scope campaign
!npc-death-report --scope chapter
!npc-death-report --scope section
!npc-death-report --scope session
!npc-death-report --write
!NPC-WR
!npc-death-report --help
```

Expected: recent/detail views remain bounded and readable. Each scope command identifies the requested Campaign, Chapter, Section, or Session bucket and its matching handout. Both `--write` and `!NPC-WR` open the report writer without changing counts or immediately rewriting handouts. `--help` opens the central NPCManager guide.

### G4. Death Audit

The audit reports only mismatches. It intentionally does **not** list correctly marked dead NPCs.

Create a deliberate mismatch on the disposable token without changing HP again:

- set HP below 1, let NPCManager add the marker, then manually remove that marker; or
- set HP above 0, let NPCManager clear the marker, then manually add that marker.

Then run:

```roll20chat
!npc-death-audit
```

Expected: The chat panel reports the mismatch count and lists the affected token under `Add Death Marker` or `Remove Death Marker`, including HP, markers, and token ID. The `GameAssist NPC Death Audit` handout contains the complete mismatch list.

Restore the token to a correct state afterward.

For the token to be audited, it must:

- be on the current player page;
- be on the Objects layer;
- represent a character;
- have character attribute `npc=1`;
- use bar 1 for HP.

TokenMod is not needed for the audit to read existing HP and markers. If a deliberate qualifying mismatch is not listed, record it as an NPCManager audit failure.

### G5. Campaign, Chapter, Section, and Session Buckets

Open the four main NPCManager menus:

```roll20chat
!npc-death-help
!npc-death-buckets
!npc-death-report --help
!NPC-WR
!npc-death-arc
```

Expected:

- `!npc-death-help` and `!npc-death-report --help` open the same central guide.
- `!npc-death-buckets` shows Campaign, Chapter, Section, and Session bucket names and counts.
- `!NPC-WR` opens the report writer with all four active names and counts.
- `!npc-death-arc` opens the independent story-arc menu.

If these names were used in an earlier pass, add a fresh suffix so retained test history does not affect the expected counts.

```roll20chat
!npc-death-buckets --campaign "Smoke Campaign"
!npc-death-buckets --chapter "Smoke Chapter"
!npc-death-buckets --section "Smoke Section"
!npc-death-buckets --session "Smoke Session"
!npc-death-buckets
```

Expected: the final panel shows all four new names. Changing a name starts or resumes that named bucket; it does not delete the previously named bucket.

Set one qualifying linked NPC from positive HP to `0`, then run:

```roll20chat
!npc-death-report --scope campaign
!npc-death-report --scope chapter
!npc-death-report --scope section
!npc-death-report --scope session
!npc-death-write --all
```

Expected:

- all four reports show the same newly recorded death;
- each report names the correct scope and disposable bucket name;
- the four matching `GameAssist Deaths - <Scope> - <Name>` handouts exist;
- `!npc-death-write --all` refreshes those handouts without adding another death.

#### G5a. Start a New Section from the Current Session

Run:

```roll20chat
!npc-death-write --newSection "Smoke Section Two"
!npc-death-report --scope section
!npc-death-report --scope session
```

Expected: the active Section becomes `Smoke Section Two`. Its handout contains the current Session death once, the Session remains unchanged, and Campaign/Chapter are not rewritten by this action. Running the same `--newSection` command again must not duplicate that death.

#### G5b. Arc Deduplication and Recovery

With the dead test NPC selected, run:

```roll20chat
!npc-death-arc
!npc-death-arc --name "Smoke Test Arc"
!npc-death-arc --name "Smoke Test Arc" --session
!npc-death-arc --name "Smoke Test Arc" --manage
```

Expected: the selected NPC appears once. Importing the whole Session does not create a second copy; it updates the existing Arc entry with death-history details. The management menu shows one entry with a Remove button.

Test the deliberate override, then undo it:

```roll20chat
!npc-death-arc --name "Smoke Test Arc" --session --allowDuplicates
!npc-death-arc --name "Smoke Test Arc" --undo
```

Expected: the first command deliberately adds another entry. Undo removes that last addition and returns the Arc to one entry.

With that NPC still selected, test selected removal:

```roll20chat
!npc-death-arc --name "Smoke Test Arc" --removeSelected
```

Expected: the matching Arc entry is removed. Campaign, Chapter, Section, and Session history remains unchanged. To test a single accidental row later, use its `Remove` button in `--manage`; that button affects only the Arc.

#### G5c. Selected-Only and Nested Clearing

First confirm that selected-only clearing preserves every other level:

```roll20chat
!npc-death-clear --scope session
!npc-death-clear --scope session --confirm
!npc-death-report --scope session
!npc-death-report --scope campaign
!npc-death-report --scope chapter
!npc-death-report --scope section
```

Expected: Session is empty; Campaign, Chapter, and Section still contain the death.

While that NPC remains dead, change its HP from `0` to `-1` and run the same four reports again. Session should remain empty and the broader totals should remain unchanged; no duplicate death should be created.

Now revive the test NPC by setting HP above `0`, then set it back to `0`. This creates a fresh death in all four active levels. Test the nested Section clear:

```roll20chat
!npc-death-clear --scope section
!npc-death-clear --scope section --nested --confirm
!npc-death-report --scope section
!npc-death-report --scope session
!npc-death-report --scope chapter
!npc-death-report --scope campaign
```

Expected: the confirmation menu offered both `Clear Only Section` and `Clear Section And Below`. The nested command clears Section and Session. Chapter and Campaign retain their history.

To inspect the complete rule without clearing more test data, open each confirmation menu:

```roll20chat
!npc-death-clear --scope campaign
!npc-death-clear --scope chapter
!npc-death-clear --scope section
!npc-death-clear --scope session
```

Expected hierarchy:

| Selected Level | `Clear Only` | `Clear And Below` |
| --- | --- | --- |
| Campaign | Campaign | Campaign, Chapter, Section, Session |
| Chapter | Chapter | Chapter, Section, Session |
| Section | Section | Section, Session |
| Session | Session | Not shown; Session has no child level |

The nested action always retains parent levels above the selected level.

#### G5d. Date-Managed Session

The default Session uses the sandbox's UTC date in `YYYY-MM-DD` form. When that UTC date changes, the next NPCManager command or qualifying NPC HP change must switch a date-managed Session to the new date before recording or reporting activity. Existing dated Session history and its handout remain available. An explicitly named Session must remain unchanged across date boundaries; **Reset Session Date** restores automatic rollover.

This boundary is easiest to confirm during a test that crosses midnight UTC. v0.1.4.7 does not yet offer a fake-clock command. A DM-selected timezone is tracked separately in GitHub Issue #35.

When troubleshooting duplicate or incorrect history, also check these edge cases:

- Two different NPC tokens with the same displayed name should create separate death records.
- Clearing only the Session bucket while an NPC remains dead should not add another Campaign, Chapter, or Section death when that token's HP changes from one below-zero value to another.
- A healthy selected token added with `!npc-death-arc --name "Smoke Test Arc" --note "Story note"` should keep that ordinary note unchanged after another positive-HP edit. Only death entries imported with `--session` receive revival annotations.

### G6. Auto-Hide Warning

Check before testing death events:

```roll20chat
!ga-config get NPCManager autoHide
!ga-config get NPCManager hideLayer
```

Default:

```text
autoHide = false
hideLayer = "gmlayer"
```

If `autoHide` is true, newly dead NPC tokens move to the configured layer. That behavior is intentional.

---

## H. NPCHPRoller Tests

NPCHPRoller does not require TokenMod.

### H1. Selected Linked NPC

Select `GA Test NPC` and run:

```roll20chat
!npc-hp-selected
```

Expected:

- Bar 1 current and maximum become the same rolled value.
- The result follows `npc_hpformula`.

### H2. Mixed Selection

Select:

- the linked test NPC;
- the linked test PC;
- the unlinked test token.

Run:

```roll20chat
!npc-hp-selected
```

Expected:

- The NPC receives rolled HP.
- PC/unlinked tokens are skipped or warned about.
- Skipped tokens are not modified.

### H3. Current-Page Roll

On the disposable test page, run:

```roll20chat
!npc-hp-all
```

Expected:

- Qualifying linked NPC tokens receive rolled HP.
- Unlinked tokens are listed as skipped.
- Player-character tokens are not rolled as NPCs.

### H4. Invalid Formula

Temporarily set the test NPC’s `npc_hpformula` to an invalid value, then run:

```roll20chat
!npc-hp-selected
```

Expected: GameAssist reports the invalid HP formula and does not apply a bad roll.

Restore the formula afterward.

### H5. Auto-Roll on Add

This feature is opt-in and defaults to false.

Check:

```roll20chat
!ga-config get NPCHPRoller autoRollOnAdd
```

To test on a disposable game:

```roll20chat
!ga-config set NPCHPRoller autoRollOnAdd=true
```

Add a qualifying linked NPC token.

Expected:

- HP is rolled automatically.
- The log identifies the action as auto-roll on add.
- Invalid/non-NPC tokens are skipped quietly.

Restore the default after testing:

```roll20chat
!ga-config set NPCHPRoller autoRollOnAdd=false
```

---

## I. DebugTools Tests

DebugTools is disabled by default and should be tested only with disposable tokens.

### I1. Enable and Show Help

Run `!ga-enable DebugTools`, wait for the Enabled whisper, then run `!ga-debug`:

```roll20chat
!ga-enable DebugTools
!ga-debug
```

Expected:

- DebugTools becomes running.
- Help text appears.

### I2. Damage Dry Run

Select a disposable token with bar 1 HP and run:

```roll20chat
!ga-debug damage --amount 2
```

Expected:

- GameAssist describes what it would do.
- Token HP does not change.

### I3. Damage Apply

With the same token selected, run:

```roll20chat
!ga-debug damage --amount 2 --apply
```

Expected:

- Token HP decreases by 2, not below zero.
- GameAssist confirms the applied action.

### I4. Marker Dry Run and Apply

With a disposable token selected:

```roll20chat
!ga-debug marker --marker blue --state toggle
!ga-debug marker --marker blue --state toggle --apply
```

Expected:

- First command previews the change only.
- Second command changes the marker.

### I5. Save Dry Run and Apply

Run:

```roll20chat
!ga-debug save --dc 12 --bonus 3 --mode adv --label "Smoke Test"
!ga-debug save --dc 12 --bonus 3 --mode adv --label "Smoke Test" --apply
```

Expected:

- First command previews the roll.
- Second command performs the roll and whispers the result to the GM.

### I6. Disable DebugTools

Run:

```roll20chat
!ga-disable DebugTools
!ga-config modules
```

Expected: DebugTools returns to disabled/inactive.

> To use the selected token, omit `--token`. Do not use literal `--token select`.

---

## J. Permissions and Command-Routing Tests

### J1. GM-Only Commands

From a non-GM player account, try:

```roll20chat
!ga-status
!ga-config modules
!npc-hp-all
!npc-death-audit
```

Expected: GM-only commands do not execute for the player.

### J2. Command Boundaries

Run:

```roll20chat
!ga-status-extra
```

Expected: It should not trigger `!ga-status`.

This confirms token-boundary matching prevents neighboring command names from triggering accidentally.

### J3. Duplicate Script Check

If commands respond twice:

1. Open the Roll20 Mod/API Scripts page.
2. Look for more than one active copy of GameAssist or a standalone copy of an integrated module.
3. Keep only the intended GameAssist installation.
4. Save/reload and test again.

Do not run standalone versions of CritFumble, Concentration, NPC Death Tracker, or NPC HP Roller alongside their integrated GameAssist modules.

---

## K. State and Recovery Tests

### K1. Safe State Review

Run:

```roll20chat
!ga-status
!ga-metrics
!ga-config list
```

Check for:

- state repairs;
- unknown-branch warnings;
- unexpected error increases.

### K2. Unknown-Branch Cleanup Warning

Do **not** run this command merely to see whether it works:

```roll20chat
!ga-config cleanup
```

It explicitly deletes unknown/orphaned `state.GameAssist` branches.

Use it only after reviewing the branch names and confirming they are unwanted.

### K3. State Self-Healing Test

Only perform this in a disposable Roll20 test game and only if you are comfortable inspecting/editing API state.

1. Back up the existing state.
2. Corrupt only a known module’s `runtime` container.
3. Reload the API sandbox.
4. Run:

   ```roll20chat
   !ga-metrics
   !ga-config modules
   ```

Expected:

- GameAssist reports/records a state repair.
- Valid module configuration is preserved.
- The known module receives a usable runtime object.

Never intentionally corrupt a production campaign’s state for a smoke test.

---

# Troubleshooting by Symptom

## Nothing Responds

Check in this order:

1. Did the API sandbox reload?
2. Is there a red syntax/reference error in the API Console?
3. Is GameAssist enabled in the Mod/API Scripts page?
4. Are multiple broken/duplicate GameAssist copies installed?
5. Does the core-ready whisper appear?

Start with:

```roll20chat
!ga-status
```

If that does not respond, solve the core/sandbox problem before testing modules.

---

## Core Works, but One Module Is Silent

Run:

```roll20chat
!ga-config modules
!ga-config get <ModuleName>
```

Then check:

- configured enabled state;
- runtime active state;
- dependency result;
- exact command spelling;
- whether the test token/character meets module requirements.

Try:

```roll20chat
!ga-enable <ModuleName>
```

Read the resulting warning.

---

## Marker Automation Does Not Work

Check:

1. TokenMod `0.8.88` is installed and can change a marker directly.
2. Dependency status is not confirmed missing.
3. The token is on the Objects layer.
4. The token represents a valid character.
5. NPCManager tokens have `npc=1`.
6. The configured marker name is correct.

Inspect:

```roll20chat
!ga-config get NPCManager deadMarker
!ga-config get ConcentrationTracker marker
!npc-death-audit
!concentration --status
```

In v0.1.4.3, a configured custom display name such as `Concentrating` should resolve to the exact stored tag automatically. If it cannot, the status command should provide a repair command instead of silently reporting the wrong result.

In v0.1.4.7, GameAssist checks marker state after sending the TokenMod request. A mismatch warning should name the token and provide the exact direct command to try. Run that command with the named token selected:

```roll20chat
!token-mod --ids @{selected|token_id} --set statusmarkers|+dead
```

GameAssist uses TokenMod `--api-as` internally, so turning on **Players can use --ids** is not the expected repair.

Separate marker-changing failures from marker-reading failures:

- If GameAssist's roll or HP-change workflow does not add/remove a marker, TokenMod may be involved.
- If `!concentration --status` or `!npc-death-audit` cannot read a marker that already exists, TokenMod is not normally involved in that read.

For `!npc-death-audit`, remember that player characters and correctly marked NPCs are intentionally omitted. Create a deliberate HP/marker mismatch on a qualifying disposable NPC before deciding the audit failed.

---

## NPC HP Does Not Roll

Check:

1. Token is selected or on the current player page.
2. Token is on the Objects layer.
3. Token represents a character.
4. Character has `npc=1`.
5. Character has a valid `npc_hpformula`.

Valid examples:

```text
4d8
4d8+8
4d8 - 2
```

NPCHPRoller does not require TokenMod.

---

## CritFumble Does Not Roll a Table

Check:

1. `!critfumble help` responds.
2. The exact required table exists.
3. The table has at least one entry.
4. The direct command works.
5. For automatic detection, the attack uses a supported roll template and contains a d20 natural 1.

---

## Commands Respond Twice

Most likely causes:

- two active GameAssist copies;
- a standalone module plus its integrated GameAssist module;
- repeated script installation under different names.

Disable duplicates, save/reload, and retest.

---

## Dependency Shows `unverifiable`

This means Roll20 did not expose enough metadata. It does not necessarily mean the dependency is missing.

For TokenMod:

1. Confirm TokenMod appears in the Mod Library/API Scripts list.
2. Test a TokenMod marker action directly.
3. Test one NPCManager or ConcentrationTracker marker workflow.

If the manual integration works, the dependency is practically available despite the unverifiable diagnostic.

If a command is completely silent or reads an existing marker incorrectly, continue troubleshooting that specific feature. `unverifiable` explains only why GameAssist could not confirm the dependency; it does not explain away a failed command.

---

## Queue Length or Errors Increase

Run:

```roll20chat
!ga-status
!ga-metrics
!ga-config modules
```

Remember:

- queue length describes explicit queued work and lifecycle transitions;
- normal handlers execute directly;
- a timeout can release the queue but cannot cancel underlying Roll20 work.

Record recent activity and API Console errors before resetting metrics.

---

# Evidence Checklist for Bug Reports

When a test fails, record:

- [ ] Exact GameAssist version.
- [ ] Exact command or action that failed.
- [ ] Expected result.
- [ ] Actual result.
- [ ] `!ga-status` output.
- [ ] `!ga-config modules` output.
- [ ] Relevant module config from `!ga-config get <ModuleName>`.
- [ ] Exact API Console error text.
- [ ] Whether TokenMod is confirmed, missing, or unverifiable.
- [ ] Whether the token is linked and on the Objects layer.
- [ ] Relevant character attributes.
- [ ] Whether the problem occurs in a disposable test game.
- [ ] Whether duplicate GameAssist/standalone module scripts are installed.

That evidence usually identifies the failure much faster than a general “it stopped working” report.

---

# Recommended Final Pre-Session Check

Immediately before a live session, run:

```roll20chat
!ga-status
!ga-config modules
```

Then perform the smallest real test for the modules the session will use:

- CritFumble: `!critfumble help`
- ConcentrationTracker: `!concentration --status`
- NPCManager: `!npc-death-audit` and confirm the report states PCs are excluded and lists mismatches by action
- NPCHPRoller: `!npc-hp-selected` on a disposable NPC
- ConfigUI: `!ga-config ui`

If those checks pass and the API Console is clean, GameAssist is ready for the session.
