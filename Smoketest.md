# GameAssist v0.1.6.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v0.1.6.0. It retains the established module checks and adds dedicated TurnTrackerService and InitiativeAssist acceptance sections.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

---

## Focused Timezone Regression

**What this proves:** GameAssist accepts one table timezone, shows it clearly, preserves it across a sandbox restart, and uses it for a date-managed NPC Session.

**Why test it:** Timezone support affects logs, status panels, handouts, history displays, and the date boundary that creates a new Session.

**Skip when:** Do not skip after first installing v0.1.6.0 or changing the campaign timezone. The cross-date test may be skipped when NPCManager is disabled and will not be used.

### Quick Check

1. Run `!ga-status` and confirm the title identifies **GameAssist 0.1.6.0**.
2. Run `!ga-timezone`.
3. Choose the city/region that governs the campaign clock, or use **Choose Another Timezone** and enter an IANA name such as `America/New_York`.
4. Confirm **Current GameAssist time** and **Current Session date** match that location.
5. Run `!ga-status` again and confirm its **Timezone** field shows the saved choice.
6. Restart the Roll20 Mod sandbox, reopen `!ga-timezone`, and confirm the same choice remains active.

Pass when the setting, displayed time, Session date, status field, and restart result all agree. A timezone name that Roll20 cannot format must be refused without replacing the saved choice.

### Date-Managed Session Check

Skip this part when NPCManager is disabled or the active Session has a deliberate campaign name that should not be replaced.

1. Run `!npc-death-buckets` and click **Reset Session Date** so the Session is date-managed.
2. Run `!ga-timezone set Pacific/Kiritimati`, then `!npc-death-buckets`; record the Session's `YYYY-MM-DD` name.
3. Run `!ga-timezone set Pacific/Honolulu`, then `!npc-death-buckets` again.
4. Confirm the date-managed Session moves to the Honolulu calendar date. These zones are one full calendar day apart, so this tests rollover without waiting for midnight.
5. Restore the campaign's intended timezone with `!ga-timezone`.

Changing timezone must not erase Campaign, Chapter, Section, Session, Arc, death, or revival history. A manually named Session should remain unchanged across timezone and date changes until **Reset Session Date** is used.

### Troubleshooting Checks

| Check | Expected result |
| --- | --- |
| `!ga-timezone set Not/A_Real_Zone` | A clear refusal; the prior setting remains active. |
| `!ga-timezone clear` | GameAssist returns to **Sandbox default** without deleting history. |
| `!ga-config timezone` | Opens the same timezone menu. |
| `!ga-config list` | The `globalConfig.timezone` field contains the saved IANA name or `null` for sandbox default. |
| Existing NPC report after a timezone change | The same recorded event appears at the newly formatted local time; its underlying event remains the same. |

The maintainer test suite separately checks fixed winter and summer instants, a UTC-midnight crossover, ISO timestamp preservation, invalid saved-state fallback, and reload persistence. Those deterministic checks cover daylight-saving boundaries that may not occur during a live smoke pass.

---

## Full v0.1.6.0 Release Acceptance Test

This is the release test for v0.1.6.0. It has two distinct tracks:

| Track | Script being tested | Purpose |
| --- | --- | --- |
| **A. Clean installation** | **v0.1.6.0** | Proves the complete suite and new native initiative foundation work together. |
| **B. Upgrade** | **v0.1.6.0** | Proves v0.1.5.1 configuration, history, timezone, and module behavior survive the update. |

Do not use an earlier release guide as the v0.1.6.0 acceptance test. In Track B, v0.1.5.1 is only the starting point used to create existing campaign state; every acceptance check after replacement is performed with v0.1.6.0.

### Release Candidate Files

Use the current repository copies of:

- `GameAssist-v0.1.6.0` or the identical `GameAssist.js` One-Click artifact;
- this `Smoketest.md` guide.

After saving the script, wait for the Mod sandbox to restart. Do not continue unless the startup message and `!ga-status` both identify **GameAssist v0.1.6.0**.

### Track A: Clean v0.1.6.0 Installation

Use a new disposable campaign, or a disposable campaign in which GameAssist state may be cleared safely.

1. Install GameAssist v0.1.6.0. Remove or disable standalone TokenMod and StatusInfo before testing their integrated replacements.
2. Prepare the disposable PC, NPC, unlinked token, and optional CritFumble tables described under [Before Testing](#before-testing).
3. Run every **Basic Check** in Components 1 through 12, except a deliberately disabled optional feature may be recorded as **Skipped by choice**.
4. Run the complete MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, and InitiativeAssist acceptance sections. These may not be skipped for v0.1.6.0 release approval.
5. Run the cross-component permission, duplicate-installation, and state-recovery checks.
6. Restart the sandbox once more and repeat `!ga-status`, `!ga-config modules`, one marker change, and one harmless TokenAssist command.

Record the release result here:

| Clean-install requirement | Result |
| --- | --- |
| Core System and ConfigUI | [ ] Pass [ ] Fail |
| MarkerService full acceptance | [ ] Pass [ ] Fail |
| TurnTrackerService full acceptance | [ ] Pass [ ] Fail |
| CritFumble basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| ConditionAssist full acceptance | [ ] Pass [ ] Fail |
| TokenAssist full acceptance | [ ] Pass [ ] Fail |
| InitiativeAssist full acceptance | [ ] Pass [ ] Fail |
| ConcentrationTracker basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| NPCManager basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| NPCHPRoller basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| DebugTools dry-run safeguard | [ ] Pass [ ] Fail |
| Cross-component checks | [ ] Pass [ ] Fail |
| Restart persistence check | [ ] Pass [ ] Fail |

### Track B: Upgrade v0.1.5.1 to v0.1.6.0

Use a separate disposable campaign so the upgrade begins with authentic v0.1.5.1 state.

#### Create the previous-release state

1. Install GameAssist v0.1.5.1 without standalone TokenMod or StatusInfo.
2. Enable the ordinary modules the campaign will use.
3. Change at least one non-default GameAssist setting.
4. Create one NPC death and revival record.
5. Give the active Campaign, Chapter, Section, and Session buckets recognizable test names.
6. Record the output of:

   ```roll20chat
   !ga-config modules
   !ga-config list
   !npc-death-buckets
   !npc-death-report --scope session
   ```

#### Install and test v0.1.6.0

1. Replace the complete v0.1.5.1 script with the current v0.1.6.0 artifact.
2. Confirm standalone TokenMod and StatusInfo remain absent so the integrated services can be tested without overlap.
3. Restart the sandbox and run:

   ```roll20chat
   !ga-status
   !ga-status --details
   !ga-config modules
   !npc-death-buckets
   !npc-death-report --scope session
   ```

4. Confirm the non-default setting, bucket names, and NPC history remain available.
5. Confirm MarkerService is enabled and ConditionAssist, TokenAssist, NPCManager, and ConcentrationTracker report confirmed MarkerService dependencies.
6. Run the inherited module checks plus the complete TurnTrackerService and InitiativeAssist sections using v0.1.6.0.
7. Restart the sandbox and confirm the retained configuration, timezone, history, tracker, and InitiativeAssist setting remain available.

Record the upgrade result here:

| Upgrade requirement | Result |
| --- | --- |
| v0.1.6.0 starts without a new GameAssist exception | [ ] Pass [ ] Fail |
| Valid v0.1.5.1 configuration is retained | [ ] Pass [ ] Fail |
| NPC history and bucket names are retained | [ ] Pass [ ] Fail |
| MarkerService and enabled dependents are running | [ ] Pass [ ] Fail |
| Standalone TokenMod and StatusInfo are no longer required | [ ] Pass [ ] Fail |
| New ConditionAssist and TokenAssist workflows pass | [ ] Pass [ ] Fail |
| TurnTrackerService and InitiativeAssist acceptance passes | [ ] Pass [ ] Fail |
| Existing gameplay module basic checks pass | [ ] Pass [ ] Fail |
| Migrated state survives another sandbox restart | [ ] Pass [ ] Fail |

### Release Decision

The v0.1.6.0 release regression passes only when:

- Track A passes in a clean installation;
- Track B passes after replacing v0.1.5.1 with v0.1.6.0;
- MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, and InitiativeAssist have no skipped acceptance checks;
- no unrelated marker, token property, character attribute, NPC history, or configuration is changed;
- any optional skipped gameplay module is recorded with a clear reason.

A failure should be recorded using [Bug Report Evidence](#bug-report-evidence) before the sandbox or affected token is reset.

---

## Test Summary

| Component | What the basic test proves | Why test it | Skip when |
| --- | --- | --- | --- |
| Core System | GameAssist loaded, responds, and started enabled modules. | Every other feature depends on the core. | Never after an install or update. |
| Table Timezone | The saved table clock, readable timestamps, and date-managed Session agree. | A wrong date boundary can put NPC history in the wrong Session. | Only the cross-date portion may be skipped when NPCManager is disabled. |
| MarkerService | GameAssist can change and read markers without standalone TokenMod while preserving unrelated markers. | NPC death and concentration markers depend on it. | Only when no enabled module or future service uses token markers. |
| TurnTrackerService | Native tracker rows can be read, audited, and safely updated without losing custom or unknown data. | InitiativeAssist depends on one lossless Turn Tracker authority. | Never for v0.1.6.0 release acceptance. |
| ConfigUI | The GM settings interface opens and responds once. | It is the easiest way for most DMs to manage modules. | The campaign is intentionally managed only through commands. |
| CritFumble | Help and the Natural 1 workflow respond. | Table automation can fail separately from the rest of GameAssist. | CritFumble is disabled and will not be used. |
| ConditionAssist | Condition help, selected-token controls, descriptions, and MarkerService synchronization work. | Condition workflows combine permissions, configuration, markers, and chat output. | ConditionAssist is deliberately disabled and will not be used. |
| TokenAssist | Selected-token controls, values, movement, reports, and MarkerService-backed status commands work. | It replaces the supported general token-control workflows previously supplied by standalone TokenMod. | TokenAssist is deliberately disabled and none of its commands, including the temporary older command, will be used. |
| InitiativeAssist | Mixed 2014/2024 actors roll through the native tracker while counters, objects, dead NPCs, and attention rows remain untouched. | Initiative mistakes interrupt play and can damage another tool's tracker state. | Never for v0.1.6.0 release acceptance. |
| ConcentrationTracker | Status, saving throws, and marker removal work on linked PC tokens. | It combines character data, rolls, chat, and MarkerService. | ConcentrationTracker is disabled and will not be used. |
| NPCManager | Death, revival, audit, history, buckets, and Arc menus work. | It combines HP events, markers, saved records, and handouts. | NPCManager is disabled and will not be used. |
| NPCHPRoller | Qualifying NPC HP formulas roll without changing PCs or unlinked tokens. | Incorrect eligibility can damage token HP or create false history. | NPCHPRoller is disabled and NPC HP is set another way. |
| DebugTools | Dry runs remain non-destructive and `--apply` is explicit. | It verifies diagnostic safeguards and direct MarkerService access. | Normally skip; DebugTools is optional and disabled by default. |

---

## What Counts as a Pass?

GameAssist is ready for normal use when:

- the Roll20 Mod sandbox reloads without a new GameAssist exception;
- the Core System basic test passes;
- MarkerService passes if ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, or marker diagnostics will be used;
- TurnTrackerService and InitiativeAssist pass before v0.1.6.0 is approved;
- every enabled module that matters to the coming session passes its basic test;
- any skipped test is skipped for a stated reason, not because its result was unclear.

Expected conditions that are not failures:

- DebugTools is disabled by default.
- Standalone TokenMod is not required for GameAssist marker operations or supported TokenAssist commands in v0.1.6.0. Remove it while testing TokenAssist so both scripts cannot respond to `!token-mod`.
- ConditionAssist provides GameAssist's condition menus and marker descriptions; remove standalone StatusInfo while testing the overlapping workflows.
- CritFumble help works without rollable tables, but table rolls require the seven exact table names.
- Counts and timestamps in diagnostic panels vary by sandbox session.

### Result Guide

| Result | Meaning |
| --- | --- |
| **Pass** | The expected response or token change occurred and no unrelated state changed. |
| **Needs attention** | GameAssist responds, but a module, marker, table, token, or character is not configured for the test. |
| **Fail** | A command is silent, a GameAssist exception appears, the wrong object changes, unrelated markers are lost, or saved data changes unexpectedly. |

---

## Before Testing

After saving GameAssist, wait for the Roll20 Mod sandbox to restart. The core-ready whisper should identify GameAssist v0.1.6.0.

For expanded tests, prepare:

### Disposable PC

Create a character named `GA Test PC` with:

```text
constitution_save_bonus = 3
```

Add an Objects-layer token that represents that character and has positive bar 1 HP.

### Disposable NPC

Create a character named `GA Test NPC` with:

```text
npc = 1
npc_hpformula = 4d8+8
```

Add an Objects-layer token that represents that character and uses bar 1 for HP.

### Unlinked Token

Add one disposable token that does not represent a character. It proves that invalid tokens are skipped without being modified.

### CritFumble Tables

Only create these when testing actual CritFumble table rolls:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

Each table needs at least one item.

---

# Component Tests

## 1. Core System

**What this proves:** GameAssist loaded, its command router responds, and enabled modules completed startup.

**Why test it:** A core failure can make every module appear broken.

**Skip when:** Never skip the basic check after installing or updating GameAssist.

### Basic Check

Run:

```roll20chat
!ga-status
!ga-config modules
```

Pass when:

- `!ga-status` identifies GameAssist v0.1.6.0 and gives a clear overall result;
- MarkerService, TurnTrackerService, and seven default gameplay/administration modules are enabled and running;
- InitiativeAssist and DebugTools are shown as disabled or paused until deliberately enabled;
- no enabled module is dependency-skipped;
- the actions below `!ga-status` include **Troubleshooting Details**, **Modules & Services**, and **Open Settings**.

The exact message, command, listener, and timestamp values are not fixed pass conditions.

### Expanded Core Checks

#### Detailed Status

Run:

```roll20chat
!ga-status --details
!ga-metrics
```

Check:

- [ ] MarkerService v1.0.1 is enabled.
- [ ] TurnTrackerService v1.0.0 is enabled.
- [ ] Queue length returns to zero while idle.
- [ ] Queue mode says normal handlers execute directly and queue use is explicit.
- [ ] A missing duration is shown as `N/A`, not `N/Ams`.
- [ ] Errors refer to the current sandbox session, not campaign lifetime.
- [ ] Details provide **Simple View**, **Modules & Services**, and **Metrics** actions.

#### Command Boundary

Run:

```roll20chat
!ga-status-extra
```

Pass when it does not trigger `!ga-status`.

#### Configuration Snapshot

Run:

```roll20chat
!ga-config list
```

Open the `GameAssist Config` handout and check:

- [ ] `format` is `gameassist-config-snapshot`.
- [ ] `schemaVersion` is `1`.
- [ ] `scope` is `configuration-only`.
- [ ] `version` is `0.1.6.0`.
- [ ] MarkerService, TurnTrackerService, and all nine module configuration objects are present.
- [ ] Runtime caches, metrics, death history, and Arc data are absent.

This is a configuration snapshot, not a complete state backup, and it cannot be imported in v0.1.6.0.

#### Safe Configuration Round Trip

Run:

```roll20chat
!ga-config get CritFumble debug
!ga-config set CritFumble debug=true
!ga-config get CritFumble debug
!ga-config set CritFumble debug=false
!ga-config get CritFumble debug
```

Pass when the value changes to `true` and then returns to `false`.

Confirm unsafe keys are refused:

```roll20chat
!ga-config set CritFumble __proto__=bad
```

#### Optional Lifecycle Check

Use ConfigUI because it does not change gameplay records:

```roll20chat
!ga-disable ConfigUI
!ga-config modules
!ga-enable ConfigUI
!ga-config modules
!ga-config ui
```

Run each line only after the previous response. Pass when ConfigUI disables, re-enables, and opens once.

---

## 2. MarkerService

**What this proves:** GameAssist can resolve, add, remove, inspect, and preserve token markers through its own MarkerService.

**Why test it:** ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and marker diagnostics share MarkerService instead of maintaining competing marker implementations.

**Skip when:** Skip only if MarkerService and every dependent GameAssist module are deliberately disabled. The **without TokenMod** portion is required for Issue #25 acceptance; use a disposable campaign when the active campaign cannot safely remove TokenMod yet.

### Basic Check

On a disposable page:

1. Put an unrelated numbered marker, such as blue with the number 7, on the linked test NPC.
2. Set the NPC from known positive HP to `0`.
3. Confirm the configured death marker appears.
4. Set HP above `0`.
5. Confirm the death marker disappears.
6. Run:

   ```roll20chat
   !concentration --status
   !npc-death-audit
   ```

Pass when:

- NPCManager changes only the death marker;
- the unrelated blue marker remains numbered 7;
- both status/audit commands respond clearly;
- no TokenMod dependency warning blocks either module.

### Full Issue #25 Acceptance Test

This is the release gate for [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25) and MarkerService v1.0.1.

#### Setup

Use a disposable campaign or page. Record the current marker settings:

```roll20chat
!ga-config get NPCManager deadMarker
!ga-config get NPCManager autoHide
!ga-config get ConcentrationTracker marker
```

For the independence check, remove or disable standalone TokenMod and standalone StatusInfo, then restart the Mod sandbox. Leave either installed only if the campaign cannot safely test without its independent commands; that means the overlapping independence portion remains unconfirmed.

Use a fresh linked NPC with known positive HP so older death history cannot be mistaken for the new result. If auto-hide is enabled, temporarily turn it off:

```roll20chat
!ga-config set NPCManager autoHide=false
```

Then add an unrelated numbered marker to both test tokens.

#### M1. Startup Without TokenMod

Run:

```roll20chat
!ga-status --details
!ga-config modules
```

Pass when:

- MarkerService v1.0.1 is enabled;
- ConditionAssist, TokenAssist, NPCManager, and ConcentrationTracker are running;
- all four show confirmed MarkerService dependencies;
- none is skipped because TokenMod or StatusInfo is absent.

#### M2. Numbered Death Marker

Configure a numbered built-in marker:

```roll20chat
!ga-config set NPCManager deadMarker=dead@2
```

Set the linked test NPC from positive HP to `0`.

Pass when:

- the dead marker appears with number 2;
- the unrelated numbered marker is unchanged;
- the death is recorded once.

Raise HP above `0`.

Pass when:

- the dead marker is removed;
- the unrelated numbered marker is unchanged;
- the existing death record is annotated as revived rather than duplicated.

#### M3. Numbered Concentration Marker

Select the linked `GA Test PC` token. Temporarily set that character's `constitution_save_bonus` to a value large enough to guarantee success, such as `100`, using the character sheet or its Attributes & Abilities tab. Then run each command after the previous result appears:

```roll20chat
!ga-config set ConcentrationTracker marker=stopwatch@3
!concentration --damage 1 --mode normal
!concentration --status
```

Pass when:

- the stopwatch marker appears with number 3;
- the unrelated numbered marker remains unchanged;
- `--status` lists the test token.

Clear it:

```roll20chat
!concentration --off
!concentration --status
```

Pass when only the configured concentration marker is removed and the status command reports no concentrating test token.

Restore the test character's normal Constitution save bonus afterward.

#### M4. Custom Display Name and Exact Stored Tag

An ordinary campaign that never uses custom token markers may skip this check. The Issue #25 release acceptance pass must create a disposable custom marker and must not skip it.

Choose a disposable custom marker with a distinctive display name. Select a disposable token, then use a DebugTools dry run to reveal the exact stored tag without changing the token:

```roll20chat
!ga-enable DebugTools
!ga-debug marker --marker "Custom Marker Name" --state on
```

The preview should say it would add a value in the form `Name::id`. Record that exact value. Do not include `--apply`.

```roll20chat
!ga-config set NPCManager deadMarker=<custom display name>
```

Perform one death/revival cycle. Then repeat with:

```roll20chat
!ga-config set NPCManager deadMarker=<Name::id>
```

Pass when both configurations target the intended custom marker and no similarly named marker changes.

This also confirms that GameAssist can read the campaign's custom-marker library. If the exact stored tag works but the display name does not, record that distinction when reporting the problem; it identifies a marker-library lookup issue rather than a general marker failure.

Optional numbered exact-tag check:

```roll20chat
!ga-config set NPCManager deadMarker=<Name::id>@3
```

Pass when the custom marker appears with number 3.

Return DebugTools to its default state after recording the tag:

```roll20chat
!ga-disable DebugTools
```

#### M5. Individual Module Teardown and Re-enable

Apply the configured death and concentration markers to disposable tokens. Then run each command separately:

```roll20chat
!ga-disable NPCManager
!ga-enable NPCManager
!ga-disable ConcentrationTracker
!ga-enable ConcentrationTracker
```

Pass when:

- teardown removes only each module's configured marker from current-page tokens;
- unrelated markers and numbers remain unchanged;
- both modules return to running;
- NPC death history, buckets, and Arcs remain present.

#### M6. MarkerService Opt-Out and Dependency Cascade

Run each command after the previous response appears:

```roll20chat
!ga-disable MarkerService
!ga-config modules
!ga-enable TokenAssist
```

Pass when:

- the command controls MarkerService rather than reporting `No such module` or `No such service`;
- ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools are configured off and not running;
- MarkerService is configured off and not running;
- CritFumble, ConfigUI, and NPCHPRoller keep their prior configured/running state;
- the disable notice names the affected modules and explains that unrelated GameAssist modules remain available;
- the notice accurately describes standalone TokenMod and StatusInfo as separate alternatives rather than as a hidden GameAssist fallback;
- the attempt to enable TokenAssist is refused with guidance to enable MarkerService first.

Now restore the service and enabled dependents:

```roll20chat
!ga-enable MarkerService
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable NPCManager
!ga-enable ConcentrationTracker
!ga-config modules
```

Pass when MarkerService starts first, all four ordinary dependents can then start, and DebugTools remains disabled unless the GM explicitly enables it.

#### M7. Reload and Persistence

Disable MarkerService again, save or restart the Mod sandbox, then run:

```roll20chat
!ga-status --details
!ga-config modules
```

Pass when MarkerService and its dependents remain configured off after reload while CritFumble, ConfigUI, and NPCHPRoller keep their previous settings.

Restore normal marker operation, restart once more, and verify retained campaign data:

```roll20chat
!ga-enable MarkerService
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable NPCManager
!ga-enable ConcentrationTracker
!npc-death-report
!concentration --status
```

Pass when the service and dependents run again, ConditionAssist definitions, TokenAssist settings, and existing NPC history are retained, and configuration remains consistent.

#### M8. Restore Campaign Settings

Restore the original `deadMarker`, `autoHide`, concentration `marker`, intended ConditionAssist permissions, and intended TokenAssist `players-can-ids` setting. Leave MarkerService and only the GameAssist modules the campaign uses in their intended final enabled state.

### MarkerService Failure Evidence

If any MarkerService check fails, record:

- configured marker value;
- exact token `statusmarkers` value before and after;
- token name and ID;
- whether the token is linked and on the Objects layer;
- which other Mods could change token markers during the test;
- `!ga-status --details` and `!ga-config modules` output;
- exact GameAssist warning or API Console exception.

---

## 3. TurnTrackerService

**What this proves:** GameAssist can read, preserve, observe, and safely hand off Roll20's native Turn Tracker through one toggleable core service.

**Why test it:** InitiativeAssist must not erase custom counters, unknown fields, duplicate turns, text priorities, or rows created by another tool.

**Skip when:** Never skip for v0.1.6.0 release acceptance. A campaign that will not use InitiativeAssist may limit this to the basic lifecycle check after release.

### Basic Check

1. Open Roll20's Turn Tracker on a disposable encounter page.
2. Add one character turn and one custom item named `Round Test`.
3. Record their order and values.
4. Run each command after the prior response appears:

```roll20chat
!ga-config modules
!ga-disable TurnTrackerService
!ga-config modules
!ga-enable TurnTrackerService
!ga-config modules
```

Pass when disabling the service also disables InitiativeAssist, neither tracker row changes or disappears, and the service can be re-enabled without rebuilding the tracker.

### Expanded TurnTrackerService Checks

- [ ] An empty tracker produces a readable InitiativeAssist status after the module is enabled.
- [ ] A custom row retains its name, value, position, and any Roll20 formula after `!Init-RR`.
- [ ] A token deleted after entering initiative is reported as stale and remains untouched.
- [ ] A tracker row for a token on another page is reported and remains untouched.
- [ ] Disabling TurnTrackerService never clears or closes Roll20's native tracker.
- [ ] Re-enabling the service does not duplicate tracker observations or chat output.

The mixed-row write checks are performed through InitiativeAssist below because TurnTrackerService intentionally has no separate GM mutation command.

---

## 4. ConfigUI

**What this proves:** The GM configuration interface opens, renders module controls, and routes button commands once.

**Why test it:** Most DMs will manage GameAssist through this interface rather than raw configuration commands.

**Skip when:** The campaign intentionally uses command-only configuration.

### Basic Check

Run either command:

```roll20chat
!ga-config ui
!ga-config-ui
```

Pass when one Config UI panel appears for each command, module cards show their current states, and **Refresh** redraws the panel once.

### Expanded ConfigUI Checks

- [ ] Boolean settings appear as understandable buttons.
- [ ] Module enable/disable buttons change the intended module.
- [ ] Pagination works when more settings exist than fit on one page.
- [ ] `!ga-config ui` and `!ga-config-ui` do not double-trigger.
- [ ] A non-GM cannot use GM-only configuration actions.

---

## 5. CritFumble

**What this proves:** CritFumble help, guided menus, direct table commands, and Natural 1 detection respond.

**Why test it:** Help can work even when rollable tables or attack-template detection are misconfigured.

**Skip when:** CritFumble is disabled and will not be used.

### Basic Check

Run:

```roll20chat
!critfumble help
!critfumble menu
!critfail
```

Pass when:

- help opens the quick reference and shows **Open Natural 1 Menu**;
- the menu shows numbered steps, attack types, direct rolls, and confirmation actions;
- `!critfail` opens the GM player picker or explains that no active players are available.

This basic check does not require rollable tables.

### Expanded CritFumble Checks

#### Direct Table Rolls

Run only after creating all seven tables:

```roll20chat
!critfumble-melee
!critfumble-ranged
!critfumble-thrown
!critfumble-spell
!critfumble-natural
!confirm-crit-martial
!confirm-crit-magic
```

Pass when each command rolls the matching table.

#### Natural 1 Detection

Roll a real attack using a supported Roll20 template and a natural 1 on its d20.

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

Pass when the attacker receives the fumble workflow and the GM receives the expected notification.

If the automatic test fails but direct commands work, record the roll template and inline-roll structure.

---

## 6. ConditionAssist

**What this proves:** ConditionAssist opens readable guidance, manages selected-token conditions, and stays synchronized with MarkerService without standalone StatusInfo.

**Why test it:** A condition can fail because of permissions, a malformed definition, an unrecognized custom marker, duplicate StatusInfo installation, or a disabled MarkerService.

**Skip when:** ConditionAssist is deliberately disabled and no condition descriptions or controls will be used. Do not skip this section for Issue #26 acceptance.

### Basic Check

Remove or disable standalone StatusInfo, select one disposable token, and give that token one unrelated numbered marker such as `blue@2`. Then run:

```roll20chat
!ga-config modules
!condition help
!condition
!CoNd-PrOnE
!condition add prone poisoned stunned
!condition
!condition status
!condition prone
!condition remove prone poisoned stunned
```

Pass when:

- ConditionAssist is configured on, running, and reports `deps confirmed`;
- help gives a quick start and an **Open Condition Menu** button;
- mixed-case `!CoNd-PrOnE` shows the configured Prone wording without changing any marker;
- before the add, the menu names the selected token and accurately reports that no configured condition marker is active;
- after the add, reopening the menu lists Prone, Poisoned, and Stunned rather than `No tracked conditions`;
- `!condition status` lists that token on the current player page, puts Prone, Poisoned, and Stunned under configured conditions, and lists the numbered blue marker separately as **Blue (2)**;
- removing the three conditions clears only their configured markers;
- the unrelated `blue@2` marker remains unchanged throughout.

### Expanded ConditionAssist Checks

#### Current-Page Condition Status

Place configured condition markers on one linked PC and one linked NPC, plus an unrelated or non-condition marker such as `dead`, `stopwatch`, or a numbered color. Run:

```roll20chat
!condition status
!condition --status
```

Pass when both forms open the same GM-only roster, each marked linked token appears once, configured condition names are shown under **Conditions**, and every other active marker is shown separately under **Other markers**. The complete result must also appear in the updated `GameAssist Condition Status` handout when the chat summary is bounded. Unmarked tokens should be omitted. Marked unlinked scenery or labels may be counted as ignored but should not be presented as characters. A non-GM account must not receive the page-wide roster.

#### Rules Wording Profiles

Open `!condition config`. The fresh-install wording source should be **2014 SRD**. Confirm that **Manage Conditions** includes **Exhaustion** and does not list Inspiration as a condition. Then choose **Use 2024 SRD**, confirm the prompt, and run:

```roll20chat
!cond-grappled
!cond-incapacitated
!cond-exhaustion
```

Pass when the descriptions use the active 2024 mechanics: Grappled includes attacks against other targets and dragging costs, Incapacitated breaks Concentration and prevents a Bonus Action, and Exhaustion reduces D20 Tests and speed by level. Existing marker choices and campaign-added conditions must remain unchanged.

Return to **Manage Conditions**, add or edit a disposable campaign condition such as **Moon-Touched**, and run `!COND-MOON-TOUCHED`. Pass when the custom wording appears despite mixed capitalization and Settings identifies an edited official wording set as **Campaign Custom**. Restore the intended 2014 or 2024 profile after the test if the edit was disposable.

#### Marker Artwork

With **Show marker artwork with descriptions** enabled, run `!cond-prone`. Pass when the Prone panel includes Roll20's `back-pain` marker artwork rather than only its identifier.

Create a disposable custom Roll20 marker with an image, assign it to a custom condition, and run that condition's `!cond-<condition>` shortcut. Pass when the registered campaign-marker image appears. Then temporarily use an exact custom tag that Roll20 cannot match back to readable registry artwork. Pass when the condition wording still appears with a readable marker-name fallback rather than failing.

#### Selected-Character Announcements

Select two disposable tokens linked to characters, with at least one character assigned to a non-GM player. Put the condition marker you plan to test on one token and leave it off the other, then run:

```roll20chat
!condition announce
!c-a
!cond-!
```

Pass when each command, including mixed capitalization such as `!C-A` or `!CoNd-!`, opens the same alphabetical condition-button list for the captured characters. Choose a condition and verify the delivery menu offers:

- **Toggle & Announce**;
- **Toggle & Whisper**;
- **Toggle & Post Wording**;
- **Toggle & Whisper Wording**.

Choosing the condition should not change either token yet. Click **Toggle & Announce** and pass when:

- the token that lacked the condition now displays its configured marker;
- the token that already had the condition no longer displays that marker;
- unrelated markers and marker numbers remain unchanged;
- the public message uses one neutral statement per character in the form **Mira is Prone** or **Orin is no longer Prone**;
- the message includes **Read Exact Wording** but does not also produce a duplicate condition-description panel.

Run the same final action again and pass when both marker states reverse cleanly. Clicking **Read Exact Wording** from a player account must whisper the exact configured wording to that player even when unrestricted player descriptions are disabled. The button should eventually expire rather than granting permanent access.

The player-whisper choices should toggle the same captured markers once and go only to non-GM controllers of the linked characters. Characters without a player controller should still receive the marker change when at least one selected character has a valid recipient, while the GM is told which characters received no player whisper. If none of the selected characters has a non-GM controller, the whisper choice should refuse before changing any marker. Change the current token selection after opening the first menu and confirm later buttons still use the originally captured characters.

If a saved or migrated campaign definition is named exactly **Concentration**, reload the sandbox and reopen the condition menu. Pass when its display name is **Concentrating** while its marker, description, and compatible `concentration` key remain unchanged.

#### Permissions

Open `!condition config`. Test **Players may view descriptions** and **Players may change token conditions** separately from a non-GM account. Pass when each permission affects only its named behavior and denied actions receive a clear explanation.

#### Custom and Numbered Marker

Create a disposable custom Roll20 marker named `Warded`. In **Manage Conditions**, add a Warded definition and configure either its display name, exact stored `Warded::id` tag, or a numbered value such as `Warded::id@3`. Add and remove it from the selected token.

Pass when the exact custom marker changes, its number is retained, and unrelated markers remain unchanged.

Assign the same disposable marker to two definitions and return to **Manage Conditions**. Pass when the menu warns which conditions share the marker. Restore separate marker assignments before continuing.

#### Marker-Change Description

With **Show descriptions when markers are added** enabled, add a configured condition marker directly from Roll20's token marker menu.

Pass when one matching ConditionAssist description appears. Removing the marker should not re-add it.

#### Validated Export and Import

Run:

```roll20chat
!condition config export
!ga-config set ConditionAssist conditions={}
```

Pass when the export contains `gameassist-condition-config`, schema version `2`, and the active `rulesProfile`, and the generic setter refuses to replace the protected condition map. Import only the unchanged exported JSON or a disposable, reviewed copy. Pass when the entire payload is validated before any setting changes.

#### Legacy StatusInfo Migration

Run this only when upgrading a campaign that previously used StatusInfo. Before removing standalone StatusInfo, record one customized condition and permission setting. Install the development GameAssist version, remove StatusInfo, reload, and open `!condition config` plus **Manage Conditions**.

Pass when valid settings and definitions were copied, the migration is reported once, and rollback remains possible because GameAssist did not delete the legacy `state.STATUSINFO` branch.

#### MarkerService Restart

Run:

```roll20chat
!ga-disable MarkerService
!ga-config modules
!ga-enable markerservice
!ga-enable conditionassist
```

Pass when MarkerService shutdown also turns off ConditionAssist, the unrelated modules remain available, both components re-enable case-insensitively, and a later direct marker addition still produces its condition description.

#### Duplicate Installation Warning

Temporarily load standalone StatusInfo only in a disposable test campaign and restart the sandbox. Pass when GameAssist warns that both tools respond to `!condition` and marker changes. Remove standalone StatusInfo before continuing.

---

## 7. TokenAssist

**What this proves:** TokenAssist can safely control selected tokens through `!token-assist` and `!ta`/`!ta-*`, temporarily accept supported legacy macros during migration, and route every status-marker change through MarkerService.

**Why test it:** General token controls touch many Roll20 properties. A useful acceptance pass must prove that targeting, authorization, relative values, linked bars, movement, reports, and markers change only the intended token data.

**Skip when:** TokenAssist is deliberately disabled and the campaign uses none of its commands. Do not skip this section for Issue #27 acceptance.

### Basic Check

Remove standalone TokenMod and restart the Mod sandbox. Select only the disposable unlinked token, note its current name and bar 3 value, and add an unrelated numbered blue marker such as `blue@7`. Then run one command at a time:

```roll20chat
!ga-config modules
!token-assist help
!token-assist about
!ta-flip showname
!ta-set "name|GA TokenAssist Test" bar3_value|10
!ta-set bar3_value|+2
!ta-set statusmarkers|red:3
!ta-set statusmarkers|-red
```

Pass when:

- TokenAssist is configured on, running, and reports a confirmed MarkerService dependency;
- the quick guide and attribution/limits panel both open;
- the token-name visibility setting flips once;
- the token is renamed and bar 3 ends at `12`;
- red appears with number 3 and is then removed;
- the unrelated `blue@7` marker remains unchanged;
- no other selected or unselected token changes.

Restore the token's original name, bar 3 value, and name-visibility setting after the check.

### Full Issue #27 Acceptance Test

Use a disposable page and keep standalone TokenMod absent except during the dedicated collision check. Record the initial TokenAssist setting:

```roll20chat
!ga-config get TokenAssist playersCanUseIds
```

#### T1. Help, Case, and Configuration

Run:

```roll20chat
!ToKeN-AsSiSt HeLp
!TA-HELP
!ta-help-statusmarkers
!token-assist config
!token-mod --help
```

Pass when the full and short TokenAssist commands open the same readable guide, marker help explains add/remove/toggle/replace behavior, the settings button clearly reports whether player `--ids` targeting is on or off, and the legacy spelling produces a clear deprecation notice that names its v0.2.0 removal deadline.

#### T2. Selected-Token Properties and Reports

Select one disposable token. Record its current name, bar 3 value, aura 1 radius, aura 1 color, aura 1 shape, and name-visibility setting. Then run:

```roll20chat
!ta-on showname --set "name|GA Test Guardian" bar3_value|20 aura1_radius|5 aura1_color|336699 aura1_options|circle
!ta-set bar3_value|-5 --report gm|"{name}: bar 3 changed from {bar3_value:before} to {bar3_value}"
!ta-off showname
```

Pass when the selected token alone is renamed, its bar 3 value changes from 20 to 15, a visible five-unit circular aura appears in the chosen color, the GM receives an understandable before/after report, and name visibility ends off. Restore the original values afterward.

#### T3. Movement and Order

Place two disposable tokens where movement is easy to see. Select one and run:

```roll20chat
!ta-move 1g
!ta-move =90|1u
!ta-order tofront
!ta-order toback
```

Pass when only the selected token moves, each displayed movement trail begins at the position where that command started instead of reconnecting to the token's first or older location, and both front/back order commands visibly affect stacking. Roll20's **Always show token movement** setting may make the new trail visible; it should not change its origin. Return the token to its starting position.

#### T4. Built-In, Numbered, and Custom Markers

Put `blue@7` on the selected token, then run:

```roll20chat
!token-assist --set statusmarkers|red:3
!token-assist --set statusmarkers|!red
!token-assist --set statusmarkers|red
```

Pass when red is added with 3, toggled off, and added again while `blue@7` remains unchanged.

Create a disposable custom marker, then test its display name and exact stored `Name::id` tag:

```roll20chat
!token-assist --set "statusmarkers|Custom Marker Name"
!token-assist --set "statusmarkers|-Custom Marker Name"
!token-assist --set statusmarkers|Name::id:4
!token-assist --set statusmarkers|-Name::id
```

Pass when only the intended custom marker changes and its numbered form displays 4. The literal `Name::id` above must be replaced with the actual stored tag.

Finally, run an invalid replacement while `blue@7` is still present:

```roll20chat
!token-assist --set "statusmarkers|=Marker That Does Not Exist"
```

Pass when TokenAssist gives an actionable warning and does **not** clear `blue@7`. Remove the disposable red marker when finished.

#### T5. Player Authorization

Assign a disposable token to a non-GM player. With player `--ids` disabled, have that player select the token and run:

```roll20chat
!token-assist --flip showname
```

Pass when the selected-token command works because the player can control that token. Record its token ID, clear the selection, and run:

```roll20chat
!token-assist --ids TOKEN_ID --flip showname
```

Pass when TokenAssist refuses explicit-ID targeting without changing the token. The GM can temporarily enable the setting from `!token-assist config`; after enabling it, repeat the explicit-ID command and pass when the controlled token changes once. Restore the original setting and visibility value.

#### T6. Linked Bar Update

Use a disposable linked token and a disposable character attribute. Link token bar 3 to that attribute through Roll20's token settings, record the attribute's current and maximum values, then run:

```roll20chat
!token-assist --set bar3_value|17 bar3_max|25
```

Pass when the linked character attribute becomes current `17`, maximum `25`, and the sheet-backed token bar follows it. Restore the original values after the check.

#### T7. Page Filters and Character IDs

Put copies of one disposable character on two pages. From the GM account, run a command using the character ID rather than a token ID, first with `--current-page` and then without it:

```roll20chat
!token-assist --ignore-selected --ids CHARACTER_ID --current-page --flip showname
!token-assist --ignore-selected --ids CHARACTER_ID --flip showname
```

Pass when the first command changes only the copy on the GM's current page and the second reaches all tokens representing that character. Restore both tokens afterward.

#### T8. Legacy Setting Migration

Run this only in an upgrade test campaign that previously used TokenMod. Before installing the development build, record standalone TokenMod's **Players can use --ids** setting. Remove TokenMod, install GameAssist, restart, and run:

```roll20chat
!ga-config get TokenAssist playersCanUseIds
```

Pass when the valid legacy boolean is copied once, the old `state.TokenMod` branch remains available for rollback, and later TokenAssist setting changes are not overwritten on reload.

#### T9. MarkerService Lifecycle

Run each command after the prior response appears:

```roll20chat
!ga-disable MarkerService
!ga-config modules
!ga-enable tokenassist
!ga-enable markerservice
!ga-enable tokenassist
!token-assist help
```

Pass when disabling MarkerService also disables TokenAssist, the premature TokenAssist enable is refused, case-insensitive re-enabling works after MarkerService returns, and help opens once. Unrelated modules should retain their prior settings.

#### T10. Standalone Collision Protection

Use a disposable campaign for this check. Temporarily install standalone TokenMod beside GameAssist and restart. Run:

```roll20chat
!ga-status --details
!token-assist about
!ta-flip showname
!token-mod --flip showname
```

Pass when GameAssist warns that standalone TokenMod was detected, `!ta-flip` still changes the selected token once, and the legacy `!token-mod` command is left to standalone TokenMod rather than also being applied by GameAssist. Remove standalone TokenMod and restart before continuing.

#### T11. Explicit Compatibility Limit

Select a disposable token whose name visibility is off, then run:

```roll20chat
!token-assist --set imgsrc|ignored --on showname
```

Pass when TokenAssist refuses the unsupported image-side property, explains that this feature is outside TokenAssist 1.0.1, and leaves name visibility unchanged. TokenAssist also does not claim default-token writes, computed or name-resolved attributes, advanced controller-list editing, advanced color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, exact TokenMod report-recipient distinctions, duplicate-index marker editing, conditional marker counts, or TokenMod help-handout rebuilding.

#### T12. Restore Campaign Settings

Restore changed token properties, linked attributes, marker choices, module enablement, and the original `players-can-ids` setting. Leave standalone TokenMod removed for normal TokenAssist use, and replace any remaining legacy `!token-mod` macros before v0.2.0.

### TokenAssist Failure Evidence

If any TokenAssist check fails, record:

- the exact command and whether it came from a GM, player, macro, or another Mod;
- selected token names/IDs and any explicit token or character IDs;
- the property values and `statusmarkers` string before and after;
- whether standalone TokenMod was installed or detected;
- the TokenAssist and MarkerService rows from `!ga-config modules`;
- `!ga-status --details` output and the exact API Console exception or warning.

---

## 8. InitiativeAssist

**What this proves:** InitiativeAssist can guide players, read mixed 2014/2024 characters, reroll only eligible characters, and preserve every tracker row it does not own.

**Why test it:** Initiative happens at a time-sensitive moment in play. A safe result must be quick to understand and must not disturb round counters, objects, dead NPCs, or another Mod's custom entries.

**Skip when:** Never skip for v0.1.6.0 release acceptance. After release, campaigns that deliberately leave InitiativeAssist disabled may skip it.

### Basic Check

Open Roll20's Turn Tracker on the disposable encounter page, then run:

```roll20chat
!ga-enable InitiativeAssist
!Init-Help
!Init-Menu
!Init-Status
!Init-Go
!Init-Go!
```

Pass when:

- `!Init-Help` opens **InitiativeAssist Guide**, which explains the workflow rather than acting like another control menu;
- `!Init-Menu` opens **Initiative Control Center**, which groups actions by starting, rerolling, reviewing, and managing;
- `!Init-Status` opens **Initiative Status Summary**, a concise chat snapshot rather than a full audit;
- both Go commands make a public **Roll for Initiative** announcement;
- the announcements include **Roll Initiative** and **Roll Options** buttons;
- `!Init-Go` uses direct wording and `!Init-Go!` uses varied wording;
- commands also work with different capitalization, such as `!iNiT-sTaTuS`.

### Full InitiativeAssist Acceptance

#### I1. Mixed 2014 and 2024 Setup

Put these disposable tokens on one page, open Roll20's Turn Tracker on that page, and **leave Turn Order empty**:

1. one player-controlled D&D 5E by Roll20 **2014** character;
2. one living **2014** NPC;
3. one player-controlled D&D **2024** character;
4. one living **2024** Compendium NPC;
5. one NPC at 0 HP with the configured death marker;
6. one unlinked object token.

The 2024 characters may require Roll20's supported Experimental Mod API server. Do not pre-populate the tracker or add the later `Round Test` custom row yet; the first checks prove InitiativeAssist can find a player's token before initiative exists.

#### I2. Empty Tracker, Status Summary, and Audit Handout

Run:

```roll20chat
!Init-Status
!Init-Audit
```

Pass when **Initiative Status Summary** clearly says the tracker is empty while reporting linked characters available on the encounter page. `!Init-Audit` should report **Initiative Audit Handout Updated**. Open `GameAssist Initiative Audit`; it should contain an empty Turn Tracker section and a separate list of the linked page characters it found. Neither command should add or change a turn.

#### I3. Player Invitation, Recipient, and Pre-Tracker Roll

As the GM, run `!Init-Go`. In a separate player session that is **not logged in as a GM**, click **Roll Initiative**.

Pass when the player can choose only linked tokens they control on the active encounter page and the chosen character is added to Turn Order with a numeric result. The token did not need an existing tracker row. Player-specific choices and setup warnings should be visible to the clicking player, not another ordinary player; the public invitation and completed result remain visible to the table. The player must not be able to roll an uncontrolled NPC or a token from another page.

If the roll is refused, read the message literally: InitiativeAssist should distinguish a wrong tracker page, no object-layer tokens, no character linkage, and no player control instead of giving one generic failure.

#### I4. Roll Options

Click **Roll Options** and test:

- Normal;
- Advantage;
- Disadvantage;
- Add One Die using a common die button;
- Add Two Dice using two sequential die choices.

Pass when each workflow asks only for necessary choices, updates the selected character, and reports a clear result. A custom die must accept whole-number sides from 2 through 100 and refuse invalid input. Haste is not presented as a built-in initiative bonus.

#### I5. Populate the Mixed Tracker and Reroll Everyone

Add the remaining 2014 PC/NPC and 2024 PC/NPC turns using InitiativeAssist or their normal sheet rolls. Add the dead NPC, unlinked object token, and a custom row named `Round Test` without changing the disposable setup described above. Record the complete order and values, then run:

```roll20chat
!Init-RR
```

Pass when every PC and living NPC rerolls, while the dead NPC, object token, and `Round Test` row keep the same values and exact positions. The command must not add every token from the page; it rerolls eligible characters already in the tracker.

This check also covers the Roll20 sessions that expose an open Turn Tracker as boolean `true`: the GM should not receive a false wrong-page message or a false **No eligible PCs or living NPCs** warning when all tracker tokens belong to this encounter page.

#### I6. Duplicate, Mismatch, and Attention Rows

1. Add the same living NPC token to the tracker a second time with a different value.
2. Give another NPC positive HP but leave its death marker on, creating an HP/marker mismatch.
3. Run `!Init-RR` again.

Pass when both occurrences of the duplicate token receive one shared roll, the mismatched NPC is left unchanged, and the GM receives a bounded attention summary. Remove the test mismatch afterward.

#### I7. Selective Rerolls and Groups

Run:

```roll20chat
!Init-RR-Menu
!Init-Group
```

Use the menu to reroll PCs only, living NPCs only, selected tracker tokens, and one individual. Then select two tracker tokens and create a named group. Rename the group from its management row, briefly move the Turn Tracker to a different page to confirm the group is not shown there, then return to the original page.

Pass when each action changes only the requested eligible rows, the saved group can be renamed and rerolled on its original page, it stays out of other-page menus, and it can be removed without deleting tracker entries.

#### I8. Status and Read-Only Audit

Run:

```roll20chat
!Init-Status
!Init-Audit
```

Pass when status distinguishes PCs, NPCs, dead NPCs, objects, custom rows, stale/off-page items, and attention items. Open `GameAssist Initiative Audit`; it should contain the complete tracker row list plus the linked-character roster for the tracker page, and it should not change the tracker.

#### I9. Observer Mode

Run:

```roll20chat
!Init-Mode observer
!Init-RR
!Init-Status
!Init-Mode manager
```

Pass when Observer mode still permits status/audit reading but refuses rerolls with a plain-language explanation. Returning to Manager mode restores guarded writes.

#### I10. Unavailable 2024 Data

If a separate disposable campaign can switch away from the supported 2024 Mod environment, run `!Init-Status` and `!Init-RR` there.

Pass when unreadable 2024 characters are named as needing attention and their tracker rows remain unchanged. A missing value must never silently become zero. Skip this destructive environment-switch check when it would disrupt the campaign; record it as **not reproduced** rather than forcing the failure.

#### I11. Coexistence Check

When another Mod can roll initiative, add custom tracker rows, count rounds, or advance turns, choose one owner before testing. Put InitiativeAssist in Observer mode while the other tool owns writes. If InitiativeAssist Manager mode will be used beside a custom-row utility, run `!Init-RR` once and confirm that utility's rows stay exact.

### InitiativeAssist Failure Evidence

Record:

- the exact `!Init-` command or button used;
- whether the caller was GM or player;
- Roll20 sheet year and `charactersheetname` for each affected character;
- token name, ID, page, layer, control, bar 1 HP, and death-marker state;
- tracker JSON or screenshots before and after;
- Mod API server selection for 2024 characters;
- other Mods that read or write turn order;
- `!Init-Status`, `!Init-Audit`, `!ga-status --details`, and `!ga-config modules` results;
- the exact API Console exception or GameAssist warning.

---

## 9. ConcentrationTracker

**What this proves:** ConcentrationTracker reads linked character data, builds the correct save, remembers the last check, and uses MarkerService.

**Why test it:** A failure may come from token linkage, character attributes, roll mode, marker configuration, or command routing.

**Skip when:** ConcentrationTracker is disabled and will not be used.

### Basic Check

Run:

```roll20chat
!concentration
!concentration --status
```

Pass when the button menu appears and status returns either a token list or `No tokens concentrating.`

A completely silent status command is a failure. An actionable invalid-marker warning is a configuration problem, not a pass.

### Expanded ConcentrationTracker Checks

With the linked test PC selected:

```roll20chat
!concentration --damage 12 --mode normal
!concentration --damage 20 --mode adv
!concentration --damage 20 --mode dis
!concentration --last
!ga-conc-status
```

Check:

- [ ] Damage 12 uses DC 10.
- [ ] Normal mode uses one d20.
- [ ] Advantage uses the higher d20.
- [ ] Disadvantage uses the lower d20.
- [ ] The character's `constitution_save_bonus` is included.
- [ ] `--last` repeats the prior damage and mode.
- [ ] `!ga-conc-status` summarizes recent recorded concentration activity.

Clear the marker:

```roll20chat
!concentration --off
!concentration --status
```

Pass when the configured marker is removed from selected linked tokens and status updates.

Select an unlinked token and repeat a check. Pass when GameAssist explains that a linked character is required and does not change the token.

---

## 10. NPCManager

**What this proves:** NPCManager tracks genuine HP transitions, changes death markers, audits current-page mismatches, and maintains report buckets and Arc records.

**Why test it:** NPCManager combines event timing, token eligibility, MarkerService, persistent state, and handout writing.

**Skip when:** NPCManager is disabled and will not be used.

### Basic Check

On the linked test NPC, start with positive HP:

1. Set bar 1 HP to `0`.
2. Confirm the death marker appears.
3. Set HP above `0`.
4. Confirm the marker clears.
5. Run:

   ```roll20chat
   !npc-death-report
   !npc-death-audit
   ```

Pass when one death is recorded, revival is annotated, and the audit reports no remaining mismatch.

### NPCManager Menu Guide

| Command | Expected purpose |
| --- | --- |
| `!npc-death-help` | Central NPCManager guide. |
| `!npc-death-report` | Read a bounded report for the active or requested bucket. |
| `!npc-death-buckets` | Review or rename Campaign, Chapter, Section, and Session buckets. |
| `!NPC-WR` or `!npc-death-write` | Review report targets before writing handouts. |
| `!npc-death-audit` | Compare linked NPC HP with the configured death marker. |
| `!npc-death-repair` | Preview and confirm marker-only corrections from current HP. |
| `!npc-death-arc` | Manage independent story-specific Arc records. |

### Expanded NPCManager Checks

#### Death Audit

Create a deliberate mismatch:

- leave HP below 1 and manually remove the death marker; or
- leave HP above 0 and manually add the death marker.

Run:

```roll20chat
!npc-death-audit
```

Pass when:

- chat shows the mismatch count and required action;
- the affected token appears under **Add Death Marker** or **Remove Death Marker**;
- HP, markers, and token ID are readable;
- the full list appears in the `GameAssist NPC Death Audit` handout;
- the scope explains that linked NPCs are checked and PCs are excluded.

Correctly marked NPCs are intentionally omitted. Unlinked scenery, labels, party markers, and props may be mentioned as ignored.

The audit itself must remain read-only. Confirm that the deliberate mismatch still exists after opening `!npc-death-audit`.

#### Death Marker Repair

With the deliberate mismatch still present, click **Review Marker Repairs** or run:

```roll20chat
!npc-death-repair
```

Pass when the preview states how many markers would be added and removed, explains that current bar 1 HP is the authority, and offers **Confirm Marker Repairs**. Opening the preview must not change HP, markers, history, buckets, or Arcs.

On disposable tokens only, confirm the repair. Pass when GameAssist re-scans the page, changes only the configured death marker, preserves unrelated markers, reports any failed verification, and leaves HP and death-history counts unchanged. Run `!npc-death-audit` again and confirm the repaired mismatch is gone.

Repeat once with positive HP plus a stale death marker so both add and remove behavior are proven. Give a linked NPC blank or non-numeric HP and confirm it is reported as ignored rather than treated as dead.

#### Reports and Handouts

Run:

```roll20chat
!npc-death-report --recent
!npc-death-report --page 2
!npc-death-report --scope campaign
!npc-death-report --scope chapter
!npc-death-report --scope section
!npc-death-report --scope session
!NPC-WR
```

Pass when chat summaries remain bounded, scopes are clearly named, and the writer menu does not change counts merely by opening.

#### Campaign, Chapter, Section, and Session

Use fresh disposable names:

```roll20chat
!npc-death-buckets --campaign "Smoke Campaign"
!npc-death-buckets --chapter "Smoke Chapter"
!npc-death-buckets --section "Smoke Section"
!npc-death-buckets --session "Smoke Session"
!npc-death-buckets
```

Record one new death, then check all four scopes:

```roll20chat
!npc-death-report --scope campaign
!npc-death-report --scope chapter
!npc-death-report --scope section
!npc-death-report --scope session
!npc-death-write --all
```

Pass when the death appears once in every active scope and the four matching handouts are created or updated.

Changing an active bucket name starts or resumes that named bucket. It does not delete the previous handout.

#### Start a New Section from the Current Session

Run:

```roll20chat
!npc-death-write --newSection "Smoke Section Two"
!npc-death-report --scope section
!npc-death-report --scope session
```

Pass when the current Session is appended once to the new Section, Session remains unchanged, and repeating the command does not duplicate entries.

#### Arc Deduplication and Recovery

With the test NPC selected:

```roll20chat
!npc-death-arc --name "Smoke Test Arc"
!npc-death-arc --name "Smoke Test Arc" --session
!npc-death-arc --name "Smoke Test Arc" --manage
```

Pass when the selected NPC appears once and appending the Session updates rather than duplicates it.

Test the explicit duplicate override and undo:

```roll20chat
!npc-death-arc --name "Smoke Test Arc" --session --allowDuplicates
!npc-death-arc --name "Smoke Test Arc" --undo
```

Pass when the first command deliberately duplicates the entry and undo removes only the last addition.

With the token selected:

```roll20chat
!npc-death-arc --name "Smoke Test Arc" --removeSelected
```

Pass when only the Arc entry is removed; Campaign, Chapter, Section, and Session history remains.

#### Clear Only and Clear Nested

First open a confirmation without deleting:

```roll20chat
!npc-death-clear --scope section
```

The menu should offer **Clear Only Section** and **Clear Section And Below**.

| Selected scope | Clear only | Clear nested |
| --- | --- | --- |
| Campaign | Campaign | Campaign, Chapter, Section, Session |
| Chapter | Chapter | Chapter, Section, Session |
| Section | Section | Section, Session |
| Session | Session | No child scopes |

Use `--confirm` only on disposable test history:

```roll20chat
!npc-death-clear --scope section --nested --confirm
```

Pass when Section and Session clear while Campaign and Chapter remain.

#### Date-Managed Session

The default Session follows the active GameAssist table date. The `!ga-timezone` setting selects that clock; when none is selected, the Roll20 sandbox clock is used. A timezone change refreshes an active date-managed Session immediately, and the next NPCManager command or qualifying HP change after local midnight moves it to the new date. A manually named Session does not roll over until **Reset Session Date** is used.

Use the focused timezone regression above to test both sides of a date boundary without waiting for midnight.

#### Auto-Hide

Check:

```roll20chat
!ga-config get NPCManager autoHide
!ga-config get NPCManager hideLayer
```

Default behavior is `autoHide=false`. If enabled, dead NPCs intentionally move to the configured layer. Test only with disposable tokens.

---

## 11. NPCHPRoller

**What this proves:** NPCHPRoller recognizes qualifying NPCs, rolls `npc_hpformula`, and protects initialization from false death history.

**Why test it:** A broad HP operation must not modify PCs, unlinked tokens, or NPCManager history incorrectly.

**Skip when:** NPCHPRoller is disabled and all NPC HP is managed manually or by another script.

### Basic Check

Select the linked test NPC and run:

```roll20chat
!npc-hp-selected
```

Pass when bar 1 current and maximum become the same rolled value and the result identifies the NPC and formula.

### Expanded NPCHPRoller Checks

#### Mixed Selection

Select the linked NPC, linked PC, and unlinked token:

```roll20chat
!npc-hp-selected
```

Pass when only the qualifying NPC receives rolled HP.

#### Current Page

On the disposable page:

```roll20chat
!npc-hp-all
```

Pass when qualifying NPCs roll, PCs remain unchanged, and unlinked tokens are skipped.

#### Invalid Formula

Temporarily replace `npc_hpformula` with invalid text and run `!npc-hp-selected`.

Pass when GameAssist reports the invalid formula without applying bad HP. Restore the formula afterward.

#### Auto-Roll on Add

This feature defaults to off. Test only in a disposable campaign:

```roll20chat
!ga-config set NPCHPRoller autoRollOnAdd=true
```

Add a qualifying linked NPC token.

Pass when:

- HP is rolled automatically;
- no temporary death marker appears;
- no false death/revival pair enters any NPCManager bucket;
- a later genuine positive-to-zero transition is tracked normally.

Restore the default:

```roll20chat
!ga-config set NPCHPRoller autoRollOnAdd=false
```

---

## 12. DebugTools

**What this proves:** DebugTools remains opt-in, previews mutations by default, and requires `--apply`.

**Why test it:** Diagnostics should not alter campaign state accidentally.

**Skip when:** Normally skip unless validating a release or troubleshooting MarkerService, HP, or save behavior.

### Basic Check

Run each command separately:

```roll20chat
!ga-enable DebugTools
!ga-debug
```

Pass when DebugTools becomes active and its help appears.

### Expanded DebugTools Checks

With a disposable token selected:

```roll20chat
!ga-debug damage --amount 2
!ga-debug marker --marker blue --state toggle
!ga-debug save --dc 12 --bonus 3 --mode adv --label "Smoke Test"
```

Pass when all three commands preview actions without changing HP, markers, or rolling.

Apply each test:

```roll20chat
!ga-debug damage --amount 2 --apply
!ga-debug marker --marker blue --state toggle --apply
!ga-debug save --dc 12 --bonus 3 --mode adv --label "Smoke Test" --apply
```

Pass when:

- damage changes HP by exactly 2 without going below zero;
- the marker action changes only the requested marker through MarkerService;
- the save rolls and whispers its result.

Return DebugTools to its default state:

```roll20chat
!ga-disable DebugTools
!ga-config modules
```

---

# Cross-Component Checks

## Permissions

**Purpose:** Confirm GM-only administration cannot be run by ordinary players.

**Skip when:** Skip only if no player account is available; record it as untested.

From a non-GM account, try:

```roll20chat
!ga-status
!ga-config modules
!condition config
!condition add prone
!token-assist config
!token-assist --ids TOKEN_ID --flip showname
!Init-RR
!npc-hp-all
!npc-death-audit
```

Pass when GM-only actions do not execute for the player. TokenAssist should refuse explicit-ID targeting while `players-can-ids` is off, but selected-token commands remain available for tokens the player controls. InitiativeAssist should refuse player reroll/management commands while still allowing its public Roll and Roll Options buttons for controlled characters.

## Duplicate Installation

**Purpose:** Confirm one chat command produces one response.

**Skip when:** Never skip when commands respond twice.

If a command produces duplicate output:

1. Check the Mod/API page for multiple GameAssist copies.
2. Check for older standalone scripts that implement the same feature.
3. Keep only the intended implementation.
4. Restart the sandbox and repeat the command.

Scripts that independently respond to `!condition` or `!token-mod`, describe the same marker changes, modify the same NPC HP/bar 1, control the same token properties or death/concentration/condition markers, process the same Natural 1 workflow, or rewrite the native Turn Tracker may conflict even when their names differ. TokenAssist deliberately suspends only its deprecated `!token-mod` alias when standalone TokenMod is detected, but the standalone copy should still be removed for normal v0.1.6.0 use. Use InitiativeAssist Observer mode when another initiative or combat manager owns tracker writes.

## State Recovery

**Purpose:** Confirm known state containers self-heal while unknown branches are preserved for review.

**Skip when:** Skip intentional state corruption outside a disposable test campaign.

Safe review:

```roll20chat
!ga-status
!ga-metrics
!ga-config list
```

Do not run `!ga-config cleanup` merely to test it. Cleanup deletes unknown or orphaned `state.GameAssist` branches after explicit confirmation.

---

# Troubleshooting by Symptom

## Nothing Responds

1. Wait for the Mod sandbox restart.
2. Check the API Console for a GameAssist syntax or reference error.
3. Confirm GameAssist is enabled.
4. Remove duplicate or broken copies.
5. Retry `!ga-status`.

Solve the core problem before testing modules.

## One Module Is Silent

Run:

```roll20chat
!ga-config modules
!ga-config get <ModuleOrServiceName>
!ga-enable <ModuleOrServiceName>
```

Check the configured state, running state, exact command spelling, and test-token eligibility. Read the enable response before changing more settings.

## Marker Automation Fails

Run:

```roll20chat
!ga-status --details
!ga-config get NPCManager deadMarker
!ga-config get ConcentrationTracker marker
!token-assist --help-statusmarkers
!condition status
!npc-death-audit
!npc-death-repair
!concentration --status
```

Check:

- MarkerService is enabled.
- The affected module is running.
- The token is on the Objects layer and represents the right character.
- NPCManager tokens have `npc=1`.
- The configured built-in marker, custom display name, or exact stored tag exists.
- The HP or concentration outcome actually requested the expected marker state.

Standalone TokenMod permissions are not a repair for GameAssist marker failures in v0.1.6.0.

Stop testing and report the before/after marker values if an unrelated marker or number changes.

## NPC HP Does Not Roll

Confirm:

- token is selected or on the current player page;
- token is on the Objects layer;
- token represents a character;
- character has `npc=1`;
- character has a valid `npc_hpformula`, such as `4d8+8`.

## CritFumble Does Not Roll

Confirm:

- `!critfumble help` responds;
- the exact required table exists and has an item;
- the direct table command works;
- automatic detection uses a supported template with a d20 natural 1.

## Queue or Error Counts Increase

Run:

```roll20chat
!ga-status --details
!ga-metrics
!ga-config modules
```

Queue length describes explicit queued work and module lifecycle transitions. A timeout can release the queue but cannot terminate underlying Roll20 or JavaScript work.

Record evidence before resetting metrics.

---

# Bug Report Evidence

When a test fails, record:

- [ ] GameAssist version.
- [ ] Component and numbered test.
- [ ] Exact command or token action.
- [ ] Expected result.
- [ ] Actual result.
- [ ] `!ga-status --details` output.
- [ ] `!ga-config modules` output.
- [ ] Relevant `!ga-config get <ModuleOrServiceName>` output.
- [ ] Exact API Console error.
- [ ] Token name, ID, layer, and linkage.
- [ ] Relevant character attributes.
- [ ] Marker values before and after, when applicable.
- [ ] Whether standalone TokenMod or standalone StatusInfo was installed or detected.
- [ ] Whether duplicate or overlapping scripts were active.

---

# Pre-Session Check

Immediately before a session:

```roll20chat
!ga-status
!ga-config modules
```

Then run only the basic checks for features the session will use:

- MarkerService: one disposable death/revival marker cycle.
- ConfigUI: open settings.
- CritFumble: `!critfumble help`.
- ConditionAssist: select a disposable token, open `!condition`, and run `!condition status`.
- TokenAssist: select a disposable token, open `!token-assist help`, and flip one harmless visibility setting twice.
- ConcentrationTracker: `!concentration --status`.
- NPCManager: `!npc-death-report`; use `!npc-death-audit` when checking markers and open repair only if a mismatch is intentional.
- NPCHPRoller: roll one disposable selected NPC.
- DebugTools: skip unless deliberately needed.

Do not discover a marker, HP, or table problem for the first time during combat.
