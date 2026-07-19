# GameAssist v0.1.5.0 Test Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> `v0.1.5.0` is still in development. MarkerService and ConditionService have focused checkpoint tests below; the integrated token service, stabilization work, and final release acceptance tests remain required.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

---

## Test Summary

| Component | What the basic test proves | Why test it | Skip when |
| --- | --- | --- | --- |
| Core System | GameAssist loaded, responds, and started enabled modules. | Every other feature depends on the core. | Never after an install or update. |
| MarkerService | GameAssist can change and read markers without standalone TokenMod while preserving unrelated markers. | NPC death and concentration markers depend on it. | Only when no enabled module or future service uses token markers. |
| ConfigUI | The GM settings interface opens and responds once. | It is the easiest way for most DMs to manage modules. | The campaign is intentionally managed only through commands. |
| CritFumble | Help and the Natural 1 workflow respond. | Table automation can fail separately from the rest of GameAssist. | CritFumble is disabled and will not be used. |
| ConditionService | Condition help, selected-token controls, descriptions, and MarkerService synchronization work. | Condition workflows combine permissions, configuration, markers, and chat output. | ConditionService is deliberately disabled and will not be used. |
| ConcentrationTracker | Status, saving throws, and marker removal work on linked PC tokens. | It combines character data, rolls, chat, and MarkerService. | ConcentrationTracker is disabled and will not be used. |
| NPCManager | Death, revival, audit, history, buckets, and Arc menus work. | It combines HP events, markers, saved records, and handouts. | NPCManager is disabled and will not be used. |
| NPCHPRoller | Qualifying NPC HP formulas roll without changing PCs or unlinked tokens. | Incorrect eligibility can damage token HP or create false history. | NPCHPRoller is disabled and NPC HP is set another way. |
| DebugTools | Dry runs remain non-destructive and `--apply` is explicit. | It verifies diagnostic safeguards and direct MarkerService access. | Normally skip; DebugTools is optional and disabled by default. |

---

## What Counts as a Pass?

GameAssist is ready for normal use when:

- the Roll20 Mod sandbox reloads without a new GameAssist exception;
- the Core System basic test passes;
- MarkerService passes if ConditionService, NPCManager, ConcentrationTracker, or marker diagnostics will be used;
- every enabled module that matters to the coming session passes its basic test;
- any skipped test is skipped for a stated reason, not because its result was unclear.

Expected conditions that are not failures:

- DebugTools is disabled by default.
- Standalone TokenMod is not required for GameAssist marker operations in v0.1.5.0.
- ConditionService is independently branded GameAssist functionality; standalone StatusInfo should be absent while its overlapping workflows are tested.
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

After saving GameAssist, wait for the Roll20 Mod sandbox to restart. The core-ready whisper should identify GameAssist v0.1.5.0.

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

- `!ga-status` identifies GameAssist v0.1.5.0 and gives a clear overall result;
- MarkerService and five default gameplay/administration modules are enabled and running;
- DebugTools is shown as disabled or paused;
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

- [ ] MarkerService v1.0.0 is enabled.
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
- [ ] `version` is `0.1.5.0`.
- [ ] All six module configuration objects are present.
- [ ] Runtime caches, metrics, death history, and Arc data are absent.

This is a configuration snapshot, not a complete state backup, and it cannot be imported in v0.1.5.0.

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

**Why test it:** ConditionService, NPCManager, ConcentrationTracker, and marker diagnostics share MarkerService instead of maintaining competing marker implementations.

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

This is the release gate for [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25) and MarkerService v1.0.0.

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

- MarkerService v1.0.0 is enabled;
- ConditionService, NPCManager, and ConcentrationTracker are running;
- all three show confirmed MarkerService dependencies;
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
!ga-enable NPCManager
```

Pass when:

- the command controls MarkerService rather than reporting `No such module` or `No such service`;
- ConditionService, NPCManager, ConcentrationTracker, and DebugTools are configured off and not running;
- MarkerService is configured off and not running;
- CritFumble, ConfigUI, and NPCHPRoller keep their prior configured/running state;
- the disable notice names the affected modules and explains that unrelated GameAssist modules remain available;
- the notice accurately describes standalone TokenMod and StatusInfo as separate alternatives rather than as a hidden GameAssist fallback;
- the attempt to enable NPCManager is refused with guidance to enable MarkerService first.

Now restore the service and enabled dependents:

```roll20chat
!ga-enable MarkerService
!ga-enable ConditionService
!ga-enable NPCManager
!ga-enable ConcentrationTracker
!ga-config modules
```

Pass when MarkerService starts first, all three ordinary dependents can then start, and DebugTools remains disabled unless the GM explicitly enables it.

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
!ga-enable ConditionService
!ga-enable NPCManager
!ga-enable ConcentrationTracker
!npc-death-report
!concentration --status
```

Pass when the service and dependents run again, ConditionService definitions and existing NPC history are retained, and configuration remains consistent.

#### M8. Restore Campaign Settings

Restore the original `deadMarker`, `autoHide`, concentration `marker`, and intended ConditionService permission settings. Leave MarkerService and only the GameAssist modules the campaign uses in their intended final enabled state.

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

## 3. ConfigUI

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

## 4. CritFumble

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

## 5. ConditionService

**What this proves:** ConditionService opens readable guidance, manages selected-token conditions, and stays synchronized with MarkerService without standalone StatusInfo.

**Why test it:** A condition can fail because of permissions, a malformed definition, an unrecognized custom marker, duplicate StatusInfo installation, or a disabled MarkerService.

**Skip when:** ConditionService is deliberately disabled and no condition descriptions or controls will be used. Do not skip this section for Issue #26 acceptance.

### Basic Check

Remove or disable standalone StatusInfo, select one disposable token, and give that token one unrelated numbered marker such as `blue@2`. Then run:

```roll20chat
!ga-config modules
!condition help
!condition
!condition add prone
!condition prone
!condition remove prone
```

Pass when:

- ConditionService is configured on, running, and reports `deps confirmed`;
- help gives a quick start and an **Open Condition Menu** button;
- the menu names the selected token and shows its tracked conditions;
- adding Prone applies only `back-pain` and shows the configured description;
- removing Prone clears only `back-pain`;
- the unrelated `blue@2` marker remains unchanged throughout.

### Expanded ConditionService Checks

#### Permissions

Open `!condition config`. Test **Players may view descriptions** and **Players may change token conditions** separately from a non-GM account. Pass when each permission affects only its named behavior and denied actions receive a clear explanation.

#### Custom and Numbered Marker

Create a disposable custom Roll20 marker named `Warded`. In **Manage Conditions**, add a Warded definition and configure either its display name, exact stored `Warded::id` tag, or a numbered value such as `Warded::id@3`. Add and remove it from the selected token.

Pass when the exact custom marker changes, its number is retained, and unrelated markers remain unchanged.

#### Marker-Change Description

With **Show descriptions when markers are added** enabled, add a configured condition marker directly from Roll20's token marker menu.

Pass when one matching ConditionService description appears. Removing the marker should not re-add it.

#### Validated Export and Import

Run:

```roll20chat
!condition config export
!ga-config set ConditionService conditions={}
```

Pass when the export contains `gameassist-condition-config`, and the generic setter refuses to replace the protected condition map. Import only the unchanged exported JSON or a disposable, reviewed copy. Pass when the entire payload is validated before any setting changes.

#### Legacy StatusInfo Migration

Run this only when upgrading a campaign that previously used StatusInfo. Before removing standalone StatusInfo, record one customized condition and permission setting. Install the development GameAssist version, remove StatusInfo, reload, and open `!condition config` plus **Manage Conditions**.

Pass when valid settings and definitions were copied, the migration is reported once, and rollback remains possible because GameAssist did not delete the legacy `state.STATUSINFO` branch.

#### MarkerService Restart

Run:

```roll20chat
!ga-disable MarkerService
!ga-config modules
!ga-enable markerservice
!ga-enable conditionservice
```

Pass when MarkerService shutdown also turns off ConditionService, the unrelated modules remain available, both components re-enable case-insensitively, and a later direct marker addition still produces its condition description.

#### Duplicate Installation Warning

Temporarily load standalone StatusInfo only in a disposable test campaign and restart the sandbox. Pass when GameAssist warns that both tools respond to `!condition` and marker changes. Remove standalone StatusInfo before continuing.

---

## 6. ConcentrationTracker

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

## 7. NPCManager

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

The default Session follows the sandbox's UTC date. On the next NPCManager command or qualifying HP change after that date changes, a date-managed Session should move to the new date. A manually named Session should not roll over until **Reset Session Date** is used.

Skip this test unless the test naturally crosses midnight UTC; v0.1.5.0 has no fake-clock command.

#### Auto-Hide

Check:

```roll20chat
!ga-config get NPCManager autoHide
!ga-config get NPCManager hideLayer
```

Default behavior is `autoHide=false`. If enabled, dead NPCs intentionally move to the configured layer. Test only with disposable tokens.

---

## 8. NPCHPRoller

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

## 9. DebugTools

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
!npc-hp-all
!npc-death-audit
```

Pass when GM-only actions do not execute for the player.

## Duplicate Installation

**Purpose:** Confirm one chat command produces one response.

**Skip when:** Never skip when commands respond twice.

If a command produces duplicate output:

1. Check the Mod/API page for multiple GameAssist copies.
2. Check for older standalone scripts that implement the same feature.
3. Keep only the intended implementation.
4. Restart the sandbox and repeat the command.

Scripts that independently respond to `!condition`, describe the same marker changes, modify the same NPC HP/bar 1, control the same death/concentration/condition markers, or process the same Natural 1 workflow may conflict even when their names differ.

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
!npc-death-audit
!concentration --status
```

Check:

- MarkerService is enabled.
- The affected module is running.
- The token is on the Objects layer and represents the right character.
- NPCManager tokens have `npc=1`.
- The configured built-in marker, custom display name, or exact stored tag exists.
- The HP or concentration outcome actually requested the expected marker state.

Standalone TokenMod permissions are not a repair for GameAssist marker failures in v0.1.5.0.

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
- [ ] Whether TokenMod or StatusInfo was installed.
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
- ConditionService: select a disposable token and open `!condition`.
- ConcentrationTracker: `!concentration --status`.
- NPCManager: `!npc-death-report`.
- NPCHPRoller: roll one disposable selected NPC.
- DebugTools: skip unless deliberately needed.

Do not discover a marker, HP, or table problem for the first time during combat.
