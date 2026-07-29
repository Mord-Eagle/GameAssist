# GameAssist v1.8.2 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v1.8.2. It retains the established component checks and adds focused NPCAssist progressive-naming and Bloodied-alert acceptance sections.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

---

## Focused v1.8.2 NPCAssist Progressive-Naming Regression

**What this proves:** NPCAssist gives newly added eligible NPC tokens clear page-local names without changing existing tokens, represented characters, or unrelated token properties.

**Why test it:** This is the only new gameplay behavior in v1.8.2. Real `add:graphic` ordering and copied-token behavior must be confirmed inside Roll20.

**Skip when:** Skip only when NPCAssist will remain disabled or automatic NPC names will remain off. Do not skip for v1.8.2 release acceptance.

### Control Center

Run:

```roll20chat
!NPC-GM
```

Confirm **Automatic NPC Names** says **On** and offers **Turn Off**. Click the button once; the Control Center should redraw with **Off** and **Turn On**. Click **Turn On** to restore the default.

### Basic Same-Page Sequence

On a disposable page with no other linked NPC named Goblin:

1. Add a linked NPC whose represented character is named **Goblin**. It should remain **Goblin**.
2. Add the same character again. The new token should become **Goblin 1**.
3. Add it a third time. The new token should become **Goblin 2**.
4. Confirm the first two tokens were not renamed when the third arrived.

### Gap Reuse and Restart

1. Delete **Goblin 1** while leaving **Goblin** and **Goblin 2**.
2. Add another Goblin. It should receive **Goblin 1**.
3. Restart the Mod sandbox and add another Goblin. It should receive the lowest name currently available without rebuilding or repairing a saved counter.

### Independent Page and Layer Checks

- On a second page with no Goblins, the first eligible token should remain **Goblin** even while Page A contains numbered Goblins.
- A linked NPC added to the GM layer participates in the same page-local name pool.
- Objects-layer and GM-layer NPCs on the same page must not receive duplicate automatic names.

### Exclusions and Deliberate Overrides

Confirm each remains unchanged:

- a linked player-character token;
- an unlinked token;
- a map-layer graphic;
- a token whose represented character cannot be read as an NPC;
- a token with no usable character or token name.

Turn **Automatic NPC Names** off and add another Goblin. Its name must remain exactly as Roll20 supplies it. Turn the feature back on, manually rename two existing tokens to the same name, and confirm NPCAssist does not police or undo that deliberate change.

### Rapid Add and HPAssist Coexistence

Add or paste several copies of the same eligible NPC in quick succession. Each new token should finish with a distinct automatic name.

When HPAssist automatic roll-on-add is enabled, repeat the test and confirm:

- each token receives a unique page-local name;
- each qualifying token still receives rolled HP;
- no false death, revival, or Bloodied event is recorded;
- no marker, history, Arc, or handout is changed by naming alone.

---

## Retained NPCAssist Bloodied Regression

**What this proves:** NPCAssist privately notifies the GM when a qualifying living NPC crosses to half HP or below, without changing markers or history.

**Why test it:** This is the only new gameplay behavior in v1.8.2. The checks confirm that the notice appears at the right moment, stays private, does not repeat, and does not mistake token setup or death for becoming Bloodied.

**Skip when:** Skip only when NPCAssist will remain disabled or `notifyBloodied` will remain off. Do not skip for v1.8.2 release acceptance.

### Quick Check

Use one disposable token on the **Objects layer** that is linked to a character with `npc=1`. Set bar 1 to **51 / 100**.

```roll20chat
!ga-config get NPCAssist notifyBloodied
!ga-config set NPCAssist notifyBloodied=true
```

Change bar 1 HP from **51** to **50**.

Pass when the GM receives one private panel like:

```text
NPCAssist: Bloodied
NPC: <token name>
HP: 50 / 100
```

The player chat must not receive the NPC name or HP notice. No marker or NPCAssist history entry should be added by the Bloodied notice.

### Threshold and Rearm Check

1. Change HP from **50** to **40**. No second notice should appear.
2. Heal the NPC to **60**. No notice should appear.
3. Change HP from **60** to **50**. One new private GM notice should appear.
4. Change HP from **50** to **49**. No additional notice should appear.

Pass when each above-half-to-half-or-below crossing produces exactly one notice and all movement that stays on one side of the threshold remains silent.

### Death Separation Check

Set the NPC to **60 / 100**, then change HP directly to **0**.

Pass when the existing NPCAssist death workflow runs and no Bloodied notice appears. The death marker and history behavior should be exactly the same as before v1.8.2.

### Eligibility and Invalid-Maximum Check

Repeat an above-half-to-half-or-below change with each of these disposable tokens:

| Token | Expected result |
| --- | --- |
| Linked NPC on Objects layer with blank maximum HP | No Bloodied notice |
| Linked NPC on Objects layer with maximum HP `0` | No Bloodied notice |
| Linked NPC on Objects layer with non-numeric maximum HP | No Bloodied notice or sandbox exception |
| Linked player character | No Bloodied notice |
| Unlinked token | No Bloodied notice |
| Linked NPC on GM layer | No Bloodied notice |

### Control Center Toggle and Configuration Opt-Out Check

Run:

```roll20chat
!NPC-GM
```

Confirm the NPCAssist Control Center shows **Bloodied Alerts: On** with a **Turn Off** button. Click **Turn Off**.

Pass when the same Control Center redraws once, now shows **Bloodied Alerts: Off**, and offers **Turn On**. Repeat the 51-to-50 change; no notice should appear. Confirm an ordinary death and revival still use the configured death marker and history normally.

Click **Turn On** to restore the release default. Confirm the redrawn Control Center says **Bloodied Alerts: On**. The command equivalents may also be checked directly:

```roll20chat
!npc-bloodied
!NPC-Death-Bloodied
```

Each command should toggle exactly once and return to the NPCAssist Control Center. Leave the setting **On** when finished.

### HPAssist Initialization Check

Run this only when testing `HPAssist autoRollOnAdd=true`.

1. Enable automatic HP rolling on token add.
2. Add a fresh qualifying NPC token whose temporary bar 1 value is blank, 0, or another placeholder before HPAssist writes the rolled result.
3. Wait for HPAssist to finish.

Pass when the token receives its rolled HP without a Bloodied notice, false death/revival pair, or new death-history entry. A later manual gameplay drop across half HP should still produce one private GM notice.

### Troubleshooting Evidence

If this section fails, record:

- the exact previous, current, and maximum bar 1 values;
- the token layer and represented character name;
- the result of `!ga-config get NPCAssist notifyBloodied`;
- whether HPAssist automatic rolling was active;
- the complete GameAssist whisper and sandbox error, if any.

---

## Focused Timezone Regression

**What this proves:** GameAssist accepts one table timezone, shows it clearly, preserves it across a sandbox restart, and uses it for a date-managed NPC Session.

**Why test it:** Timezone support affects logs, status panels, handouts, history displays, and the date boundary that creates a new Session.

**Skip when:** Do not skip after first installing v1.8.2 or changing the campaign timezone. The cross-date test may be skipped when NPCAssist is disabled and will not be used.

### Quick Check

1. Run `!ga-status` and confirm the title identifies **GameAssist 1.8.1**.
2. Run `!ga-timezone`.
3. Choose the city/region that governs the campaign clock, or use **Choose Another Timezone** and enter an IANA name such as `America/New_York`.
4. Confirm **Current GameAssist time** and **Current Session date** match that location.
5. Run `!ga-status` again and confirm its **Timezone** field shows the saved choice.
6. Restart the Roll20 Mod sandbox, reopen `!ga-timezone`, and confirm the same choice remains active.

Pass when the setting, displayed time, Session date, status field, and restart result all agree. A timezone name that Roll20 cannot format must be refused without replacing the saved choice.

### Date-Managed Session Check

Skip this part when NPCAssist is disabled or the active Session has a deliberate campaign name that should not be replaced.

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

## Full v1.8.2 Release Acceptance Test

This is the release test for v1.8.2. It has two distinct tracks:

| Track | Script being tested | Purpose |
| --- | --- | --- |
| **A. Clean installation** | **v1.8.2** | Proves the complete suite and the new NPCAssist Bloodied behavior work together. |
| **B. Upgrade** | **v1.8.2** | Proves v0.1.7.0 configuration, history, guide handouts, optional-module settings, and tracker contents survive the module-name migration. |

Do not use an earlier release guide as the v1.8.2 acceptance test. In Track B, v0.1.7.0 is only the starting point used to create existing campaign state; every acceptance check after replacement is performed with v1.8.2.

### Release Candidate Files

Use the current repository copies of:

- `GameAssist-v1.8.2` or the identical `GameAssist.js` One-Click artifact;
- this `Smoketest.md` guide.

After saving the script, wait for the Mod sandbox to restart. Do not continue unless the startup message and `!ga-status` both identify **GameAssist v1.8.2**.

### Track A: Clean v1.8.2 Installation

Use a new disposable campaign, or a disposable campaign in which GameAssist state may be cleared safely.

1. Install GameAssist v1.8.2. Remove or disable standalone TokenMod and StatusInfo before testing their integrated replacements.
2. Prepare the disposable PC, NPC, unlinked token, and optional CritAssist tables described under [Before Testing](#before-testing).
3. Run every **Basic Check** in Components 1 through 14, except a deliberately disabled optional feature may be recorded as **Skipped by choice**.
4. Run the focused NPCAssist Bloodied regression plus the complete MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, and WelcomeAssist acceptance sections. These may not be skipped for v1.8.2 release approval.
5. Run the cross-component permission, duplicate-installation, and state-recovery checks.
6. Restart the sandbox once more and repeat `!ga-status`, `!ga-config modules`, one marker change, and one harmless TokenAssist command.

Record the release result here:

| Clean-install requirement | Result |
| --- | --- |
| Core System and ConfigUI | [ ] Pass [ ] Fail |
| MarkerService full acceptance | [ ] Pass [ ] Fail |
| TurnTrackerService full acceptance | [ ] Pass [ ] Fail |
| CritAssist basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| ConditionAssist full acceptance | [ ] Pass [ ] Fail |
| TokenAssist full acceptance | [ ] Pass [ ] Fail |
| InitiativeAssist full acceptance | [ ] Pass [ ] Fail |
| CombatAssist full acceptance | [ ] Pass [ ] Fail |
| WelcomeAssist full acceptance | [ ] Pass [ ] Fail |
| ConcentrationAssist basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| NPCAssist basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| NPCAssist Bloodied regression | [ ] Pass [ ] Fail |
| HPAssist basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| DebugTools dry-run safeguard | [ ] Pass [ ] Fail |
| Cross-component checks | [ ] Pass [ ] Fail |
| Restart persistence check | [ ] Pass [ ] Fail |

### Track B: Upgrade v0.1.7.0 to v1.8.2

Use a separate disposable campaign so the upgrade begins with authentic v0.1.7.0 state.

#### Create the previous-release state

1. Install GameAssist v0.1.7.0 without standalone TokenMod or StatusInfo.
2. Enable the ordinary modules the campaign will use.
3. Change at least one non-default GameAssist setting.
4. Create one NPC death and revival record.
5. Give the active Campaign, Chapter, Section, and Session buckets recognizable test names.
6. Enable InitiativeAssist, place at least three distinct rows in the native tracker, and save one InitiativeAssist group or non-default NPC-roll setting.
7. Enable and configure WelcomeAssist without requiring a public greeting.
8. Run `!critfumble manual`, `!npc-death-manual`, and `!concentration manual` once so the old-name guide handouts exist.
9. Record the output of:

   ```roll20chat
   !ga-config modules
   !ga-config list
   !npc-death-buckets
   !npc-death-report --scope session
   ```

#### Install and test v1.8.2

1. Replace the complete v0.1.7.0 script with the current v1.8.2 artifact.
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
5. Confirm the module list uses CritAssist, NPCAssist, ConcentrationAssist, and HPAssist. It should not list a second running copy under the old names.
6. Confirm MarkerService is enabled and ConditionAssist, TokenAssist, NPCAssist, and ConcentrationAssist report confirmed MarkerService dependencies.
7. Run `!ga-config get CritFumble`, `!ga-config get NPCManager`, `!ga-config get ConcentrationTracker`, and `!ga-config get NPCHPRoller`. Each legacy configuration name should resolve to the canonical module without recreating a second old-name state branch.
8. Run each renamed module's `manual` command. One unambiguous old guide handout should be renamed and updated; no duplicate old/new pair should remain.
9. Confirm CombatAssist remains disabled if it was disabled before the upgrade and did not adopt or reorder the existing tracker.
10. Run the inherited module checks, the focused NPCAssist Bloodied regression, and the complete TurnTrackerService, InitiativeAssist, CombatAssist, and WelcomeAssist sections using v1.8.2.
11. Restart the sandbox and confirm the retained configuration, timezone, history, tracker, InitiativeAssist setting/group, WelcomeAssist configuration, and CombatAssist setting remain available.

Record the upgrade result here:

| Upgrade requirement | Result |
| --- | --- |
| v1.8.2 starts without a new GameAssist exception | [ ] Pass [ ] Fail |
| Valid v0.1.7.0 configuration is retained | [ ] Pass [ ] Fail |
| Old module branches migrate to the four canonical names | [ ] Pass [ ] Fail |
| NPC history and bucket names are retained | [ ] Pass [ ] Fail |
| Existing guide handouts are adopted without duplication | [ ] Pass [ ] Fail |
| MarkerService and enabled dependents are running | [ ] Pass [ ] Fail |
| Standalone TokenMod and StatusInfo are no longer required | [ ] Pass [ ] Fail |
| New ConditionAssist and TokenAssist workflows pass | [ ] Pass [ ] Fail |
| TurnTrackerService, InitiativeAssist, CombatAssist, and WelcomeAssist acceptance passes | [ ] Pass [ ] Fail |
| Existing gameplay module basic checks pass | [ ] Pass [ ] Fail |
| NPCAssist Bloodied regression passes | [ ] Pass [ ] Fail |
| Migrated state survives another sandbox restart | [ ] Pass [ ] Fail |

### Release Decision

The v1.8.2 release regression passes only when:

- Track A passes in a clean installation;
- Track B passes after replacing v0.1.7.0 with v1.8.2;
- NPCAssist Bloodied, MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, and WelcomeAssist have no skipped acceptance checks;
- no unrelated marker, token property, character attribute, NPC history, or configuration is changed;
- any optional skipped gameplay module is recorded with a clear reason.

A failure should be recorded using [Bug Report Evidence](#bug-report-evidence) before the sandbox or affected token is reset.

---

## Test Summary

| Component | What the basic test proves | Why test it | Skip when |
| --- | --- | --- | --- |
| Core System | GameAssist loaded, responds, and started enabled modules. | Every other feature depends on the core. | Never after an install or update. |
| Table Timezone | The saved table clock, readable timestamps, and date-managed Session agree. | A wrong date boundary can put NPC history in the wrong Session. | Only the cross-date portion may be skipped when NPCAssist is disabled. |
| MarkerService | GameAssist can change and read markers without standalone TokenMod while preserving unrelated markers. | NPC death and concentration markers depend on it. | Only when no enabled module or future service uses token markers. |
| TurnTrackerService | Native tracker rows can be read, audited, and safely updated without losing custom or unknown data. | InitiativeAssist and CombatAssist depend on one lossless Turn Tracker authority. | Never for v1.8.2 release acceptance. |
| ConfigUI | The GM settings interface opens and responds once. | It is the easiest way for most DMs to manage modules. | The campaign is intentionally managed only through commands. |
| CritAssist | Help and the Natural 1 workflow respond. | Table automation can fail separately from the rest of GameAssist. | CritAssist is disabled and will not be used. |
| ConditionAssist | Condition help, selected-token controls, descriptions, and MarkerService synchronization work. | Condition workflows combine permissions, configuration, markers, and chat output. | ConditionAssist is deliberately disabled and will not be used. |
| TokenAssist | Selected-token controls, values, movement, reports, and MarkerService-backed status commands work. | It replaces the supported general token-control workflows previously supplied by standalone TokenMod. | TokenAssist is deliberately disabled and none of its commands, including the temporary older command, will be used. |
| InitiativeAssist | Mixed 2014/2024 actors roll through the native tracker while counters, objects, dead NPCs, and attention rows remain untouched. | Initiative mistakes interrupt play and can damage another tool's tracker state. | Never for v1.8.2 release acceptance. |
| CombatAssist | Explicit lifecycle, rounds, ordinary native tracker edits, recovery, and player confirmations work without replacing Roll20's tracker. | A false round or destructive tracker edit can disrupt an encounter immediately. | Never for v1.8.2 release acceptance. |
| WelcomeAssist | Optional greetings remain deliberate, bounded, private during setup, and limited to one automatic post per sandbox. | Startup output should welcome the table without misreporting unhealthy GameAssist components or executing custom chat syntax. | Never for v1.8.2 release acceptance. |
| ConcentrationAssist | Status, saving throws, and marker removal work on linked PC tokens. | It combines character data, rolls, chat, and MarkerService. | ConcentrationAssist is disabled and will not be used. |
| NPCAssist | Death, revival, audit, history, buckets, and Arc menus work. | It combines HP events, markers, saved records, and handouts. | NPCAssist is disabled and will not be used. |
| HPAssist | Qualifying NPC HP formulas roll without changing PCs or unlinked tokens. | Incorrect eligibility can damage token HP or create false history. | HPAssist is disabled and NPC HP is set another way. |
| DebugTools | Dry runs remain non-destructive and `--apply` is explicit. | It verifies diagnostic safeguards and direct MarkerService access. | Normally skip; DebugTools is optional and disabled by default. |

---

## What Counts as a Pass?

GameAssist is ready for normal use when:

- the Roll20 Mod sandbox reloads without a new GameAssist exception;
- the Core System basic test passes;
- MarkerService passes if ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, or marker diagnostics will be used;
- TurnTrackerService, InitiativeAssist, CombatAssist, and WelcomeAssist pass before v1.8.2 is approved;
- every enabled module that matters to the coming session passes its basic test;
- any skipped test is skipped for a stated reason, not because its result was unclear.

Expected conditions that are not failures:

- DebugTools is disabled by default.
- Standalone TokenMod is not required for GameAssist marker operations or supported TokenAssist commands in v1.8.2. Remove it while testing TokenAssist so both scripts cannot respond to `!token-mod`.
- ConditionAssist provides GameAssist's condition menus and marker descriptions; remove standalone StatusInfo while testing the overlapping workflows.
- CritAssist help works without rollable tables, but table rolls require the seven exact table names.
- Counts and timestamps in diagnostic panels vary by sandbox session.

### Result Guide

| Result | Meaning |
| --- | --- |
| **Pass** | The expected response or token change occurred and no unrelated state changed. |
| **Needs attention** | GameAssist responds, but a module, marker, table, token, or character is not configured for the test. |
| **Fail** | A command is silent, a GameAssist exception appears, the wrong object changes, unrelated markers are lost, or saved data changes unexpectedly. |

---

## Before Testing

After saving GameAssist, wait for the Roll20 Mod sandbox to restart. The core-ready whisper should identify GameAssist v1.8.2.

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

### CritAssist Tables

Only create these when testing actual CritAssist table rolls:

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

## Compact Guides and Module Manuals

**What this proves:** Every feature has a predictable way to find help, check its current state, run a read-only audit, and recover from a mistyped command. Modules with longer workflows create one stable user-manual handout instead of filling chat with a wall of instructions.

**Why test it:** These screens are the front door for both first-time GMs and experienced users returning to a feature months later. A working feature is still difficult to use when its controls are hard to find.

**Skip when:** Do not skip this section while approving v1.8.2 or after changing a module's command routing or help content. During ordinary troubleshooting, test only the affected enabled module. WelcomeAssist, InitiativeAssist, CombatAssist, and DebugTools may be skipped when they are deliberately disabled and will remain unused.

### Quick Pattern

For each enabled module below:

1. Open **Guide** and confirm it is short, action-focused, and links to deeper information.
2. Open **Status** and confirm the module gives a concise current-state response.
3. Open **Audit** and confirm it clearly says no changes were made.
4. Enter the listed bad command and confirm it explains the problem and offers **Open Guide**.
5. Where **Manual** is listed, run it twice. The second run must update the same handout rather than create a duplicate.
6. Run both role aliases and confirm **GM** and **DM** open the same module-specific Game Master interaction screen.

| Module | GM / DM screen | Guide | Status | Audit | Manual | Deliberate bad command |
| --- | --- | --- | --- | --- | --- | --- |
| ConfigUI | `!ConfigUI-GM` / `!ConfigUI-DM` | `!ga-config-ui help` | `!ga-config-ui status` | `!ga-config-ui audit` | `!ga-config-ui manual` | `!ga-config-ui impossible` |
| CritAssist | `!CritAssist-GM` / `!CritAssist-DM` | `!CritAssist-Guide` | `!CritAssist-Status` | `!CritAssist-Audit` | `!CritAssist-Manual` | `!CritAssist-Impossible` |
| ConditionAssist | `!Condition-GM` / `!Condition-DM` | `!condition guide` | `!condition status` | `!condition audit` | `!condition manual` | `!condition impossible` |
| TokenAssist | `!TokenAssist-GM` / `!TokenAssist-DM` | `!ta-guide` | `!ta-status` | `!ta-audit` | `!ta-manual` | `!ta-impossible` |
| InitiativeAssist | `!Init-GM` / `!Init-DM` | `!Init-Guide` | `!Init-Status` | `!Init-Audit` | `!Init-Manual` | `!Init-Impossible` |
| CombatAssist | `!Combat-GM` / `!Combat-DM` | `!Combat-Guide` | `!Combat-Status` | `!Combat-Audit` | `!Combat-Manual` | `!Combat-Impossible` |
| WelcomeAssist | `!Welcome-GM` / `!Welcome-DM` | `!Welcome-Guide` | `!Welcome-Status` | `!Welcome-Audit` | `!Welcome-Manual` | `!Welcome-Impossible` |
| NPCAssist | `!NPCAssist-GM` / `!NPCAssist-DM` | `!NPCAssist-Guide` | `!NPCAssist-Status` | `!NPCAssist-Audit` | `!NPCAssist-Manual` | `!NPCAssist-Impossible` |
| ConcentrationAssist | `!ConcentrationAssist-GM` / `!ConcentrationAssist-DM` | `!ConcentrationAssist-Guide` | `!ConcentrationAssist-Status` | `!ConcentrationAssist-Audit` | `!ConcentrationAssist-Manual` | `!ConcentrationAssist-Impossible` |
| HPAssist | `!HP-GM` / `!HP-DM` | `!HP-Guide` | `!HP-Status` | `!HP-Audit` | `!HP-Manual` | `!HP-Impossible` |
| DebugTools | `!Debug-GM` / `!Debug-DM` | `!ga-debug guide` | `!ga-debug status` | `!ga-debug audit` | `!ga-debug manual` | `!ga-debug impossible` |

### Renamed Module Compatibility Check

Run these read-only commands:

```roll20chat
!NPC-Status
!NPC-Death-Status
!NPCAssist-Status
!NPCManager-Status
!Con-Status
!Concentration-Status
!ConcentrationAssist-Status
!critfumble status
!CritAssist-Status
!HP-Status
!hp status
!npc-hp-status
```

Pass when each command family reaches its one canonical module exactly once: four NPCAssist responses, three ConcentrationAssist responses, two CritAssist responses, and three HPAssist responses. The deprecated `!npc-hp-status` check must reach HPAssist without an NPCAssist “command was not recognized” warning. No token, marker, HP value, or history record should change.

ConfigUI, HPAssist, and DebugTools are deliberately brief. Their **Manual** command should explain that the complete guidance remains in chat. The other Manual commands create or update these handouts:

```text
GameAssist Guide - CritAssist
GameAssist Guide - ConditionAssist
GameAssist Guide - TokenAssist
GameAssist Guide - InitiativeAssist
GameAssist Guide - CombatAssist
GameAssist Guide - WelcomeAssist
GameAssist Guide - NPCAssist
GameAssist Guide - ConcentrationAssist
```

Pass when every tested command responds once, every audit is visibly read-only, every bad command offers a useful recovery path, and no Manual command creates a second handout with the same module name.

For an upgrade test, create the old `GameAssist Guide - CritFumble`, `GameAssist Guide - NPCManager`, and `GameAssist Guide - ConcentrationTracker` handouts under v0.1.7.0 first. After installing v1.8.2, the corresponding Manual commands should adopt and rename those handouts. If more than one old handout has the same legacy name, GameAssist should refuse to guess and explain the duplicate instead of overwriting either one.

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

- `!ga-status` identifies GameAssist v1.8.2 and gives a clear overall result;
- MarkerService, TurnTrackerService, and seven default gameplay/administration modules are enabled and running;
- InitiativeAssist, CombatAssist, WelcomeAssist, and DebugTools are shown as disabled or paused until deliberately enabled;
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
- [ ] `version` is `0.1.7.0`.
- [ ] MarkerService, TurnTrackerService, and all eleven module configuration objects are present.
- [ ] Runtime caches, metrics, death history, and Arc data are absent.

This is a configuration snapshot, not a complete state backup, and it cannot be imported in v1.8.2.

#### Safe Configuration Round Trip

Run:

```roll20chat
!ga-config get CritAssist debug
!ga-config set CritAssist debug=true
!ga-config get CritAssist debug
!ga-config set CritAssist debug=false
!ga-config get CritAssist debug
```

Pass when the value changes to `true` and then returns to `false`.

Confirm unsafe keys are refused:

```roll20chat
!ga-config set CritAssist __proto__=bad
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

**Why test it:** ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and marker diagnostics share MarkerService instead of maintaining competing marker implementations.

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

- NPCAssist changes only the death marker;
- the unrelated blue marker remains numbered 7;
- both status/audit commands respond clearly;
- no TokenMod dependency warning blocks either module.

### Full Issue #25 Acceptance Test

This is the release gate for [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25) and MarkerService v1.0.1.

#### Setup

Use a disposable campaign or page. Record the current marker settings:

```roll20chat
!ga-config get NPCAssist deadMarker
!ga-config get NPCAssist autoHide
!ga-config get ConcentrationAssist marker
```

For the independence check, remove or disable standalone TokenMod and standalone StatusInfo, then restart the Mod sandbox. Leave either installed only if the campaign cannot safely test without its independent commands; that means the overlapping independence portion remains unconfirmed.

Use a fresh linked NPC with known positive HP so older death history cannot be mistaken for the new result. If auto-hide is enabled, temporarily turn it off:

```roll20chat
!ga-config set NPCAssist autoHide=false
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
- ConditionAssist, TokenAssist, NPCAssist, and ConcentrationAssist are running;
- all four show confirmed MarkerService dependencies;
- none is skipped because TokenMod or StatusInfo is absent.

#### M2. Numbered Death Marker

Configure a numbered built-in marker:

```roll20chat
!ga-config set NPCAssist deadMarker=dead@2
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
!ga-config set ConcentrationAssist marker=stopwatch@3
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
!ga-config set NPCAssist deadMarker=<custom display name>
```

Perform one death/revival cycle. Then repeat with:

```roll20chat
!ga-config set NPCAssist deadMarker=<Name::id>
```

Pass when both configurations target the intended custom marker and no similarly named marker changes.

This also confirms that GameAssist can read the campaign's custom-marker library. If the exact stored tag works but the display name does not, record that distinction when reporting the problem; it identifies a marker-library lookup issue rather than a general marker failure.

Optional numbered exact-tag check:

```roll20chat
!ga-config set NPCAssist deadMarker=<Name::id>@3
```

Pass when the custom marker appears with number 3.

Return DebugTools to its default state after recording the tag:

```roll20chat
!ga-disable DebugTools
```

#### M5. Individual Module Teardown and Re-enable

Apply the configured death and concentration markers to disposable tokens. Then run each command separately:

```roll20chat
!ga-disable NPCAssist
!ga-enable NPCAssist
!ga-disable ConcentrationAssist
!ga-enable ConcentrationAssist
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
- ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools are configured off and not running;
- MarkerService is configured off and not running;
- CritAssist, ConfigUI, and HPAssist keep their prior configured/running state;
- the disable notice names the affected modules and explains that unrelated GameAssist modules remain available;
- the notice accurately describes standalone TokenMod and StatusInfo as separate alternatives rather than as a hidden GameAssist fallback;
- the attempt to enable TokenAssist is refused with guidance to enable MarkerService first.

Now restore the service and enabled dependents:

```roll20chat
!ga-enable MarkerService
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable NPCAssist
!ga-enable ConcentrationAssist
!ga-config modules
```

Pass when MarkerService starts first, all four ordinary dependents can then start, and DebugTools remains disabled unless the GM explicitly enables it.

#### M7. Reload and Persistence

Disable MarkerService again, save or restart the Mod sandbox, then run:

```roll20chat
!ga-status --details
!ga-config modules
```

Pass when MarkerService and its dependents remain configured off after reload while CritAssist, ConfigUI, InitiativeAssist, WelcomeAssist, and HPAssist keep their previous settings.

Restore normal marker operation, restart once more, and verify retained campaign data:

```roll20chat
!ga-enable MarkerService
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable NPCAssist
!ga-enable ConcentrationAssist
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

**Skip when:** Never skip for v1.8.2 release acceptance. A campaign that will use neither InitiativeAssist nor CombatAssist may limit this to the basic lifecycle check after release.

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

Pass when disabling the service also disables InitiativeAssist and CombatAssist, neither tracker row changes or disappears, and the service can be re-enabled without rebuilding the tracker.

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

## 5. CritAssist

**What this proves:** CritAssist help, guided menus, direct table commands, and Natural 1 detection respond.

**Why test it:** Help can work even when rollable tables or attack-template detection are misconfigured.

**Skip when:** CritAssist is disabled and will not be used.

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

### Expanded CritAssist Checks

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

Pass when the full and short TokenAssist commands open the same readable guide, marker help explains add/remove/toggle/replace behavior, the settings button clearly reports whether player `--ids` targeting is on or off, and the legacy spelling produces a clear deprecation notice that names its v2.0.0 removal deadline.

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

Pass when TokenAssist refuses the unsupported image-side property, explains that this feature is outside TokenAssist 1.0.3, and leaves name visibility unchanged. TokenAssist also does not claim default-token writes, computed or name-resolved attributes, advanced controller-list editing, advanced color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, exact TokenMod report-recipient distinctions, duplicate-index marker editing, conditional marker counts, or TokenMod help-handout rebuilding.

#### T12. Restore Campaign Settings

Restore changed token properties, linked attributes, marker choices, module enablement, and the original `players-can-ids` setting. Leave standalone TokenMod removed for normal TokenAssist use, and replace any remaining legacy `!token-mod` macros before v2.0.0.

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

**What this proves:** InitiativeAssist can guide players, read mixed 2014/2024 characters, protect NPC roll details, roll selected controlled characters, include living GM-layer NPCs privately, reroll only eligible characters, and preserve every tracker row it does not own.

**Why test it:** Initiative happens at a time-sensitive moment in play. A safe result must be quick to understand and must not disturb round counters, objects, dead NPCs, or another Mod's custom entries.

**Skip when:** Never skip for v1.8.2 release acceptance. After release, campaigns that deliberately leave InitiativeAssist disabled may skip it.

### Basic Check

Open Roll20's Turn Tracker on the disposable encounter page, then run:

```roll20chat
!ga-enable InitiativeAssist
!Init-Help
!Init-Help start
!Init-Menu
!Init-Status
!Init-Go
!Init-Go!
!Init-GM
!Init-DM
```

Pass when:

- `!Init-Help` opens a compact **InitiativeAssist Guide** with common actions and topic buttons rather than displaying the full manual at once;
- `!Init-Help start` opens the focused starting-instructions panel and includes **Back to Guide**;
- `!Init-Menu` opens **Initiative Control Center**, which groups actions by starting, rerolling, reviewing, and managing;
- `!Init-Status` opens **Initiative Status Summary**, a concise chat snapshot rather than a full audit;
- both Go commands make a public **Roll for Initiative** announcement;
- the announcements include **Roll Initiative**, **Roll Selected**, and **Roll Options** buttons;
- the GM separately receives **GM Initiative Roster**, separating PCs, object-layer NPCs, and GM-layer NPCs with object-layer, GM-layer, and combined batch controls;
- the Control Center shows whether object-layer NPC rolls are hidden or public;
- `!Init-Go` uses direct wording and `!Init-Go!` uses varied wording;
- `!Init-GM` and `!Init-DM` each whisper the GM the same neutral roll controls and complete GM Initiative Roster, with no public chat panel;
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

#### I2. Empty Tracker, Status Summary, and Detailed Review

Run:

```roll20chat
!Init-Status
!Init-Audit
```

Pass when **Initiative Status Summary** clearly says the tracker is empty while reporting linked characters available on the encounter page. `!Init-Audit` should whisper the GM an **Initiative Review** with an empty Turn Tracker section and a separate list of linked page characters not yet in Turn Order. Neither command should add or change a turn, and no InitiativeAssist handout should be created.

#### I3. Player Invitation, Recipient, and Pre-Tracker Roll

As the GM, run `!Init-Go`. Confirm the public invitation is followed by a private **GM Initiative Roster** containing the PCs and NPCs from the encounter page. In a separate player session that is **not logged in as a GM**, click **Roll Initiative**.

Pass when the player can choose only linked tokens they control on the active encounter page and the chosen character becomes a visible Turn Order row with a numeric result. The token did not need an existing tracker row or a Roll20 macro. The result must show `Roll(s)`, the final total, and the complete formula, and the Turn Order row must still be visible after the announcement. Player-specific choices and setup warnings should be visible to the clicking player, not another ordinary player; the public invitation and completed PC initiative result remain visible to the table. The player must not be able to roll an uncontrolled NPC or a token from another page.

If the roll is refused, read the message literally: InitiativeAssist should distinguish a wrong tracker page, no object-layer tokens, no character linkage, and no player control instead of giving one generic failure.

#### I3B. GM-Only Initiative Page

Run:

```roll20chat
!Init-GM
```

Pass when the GM receives the neutral **Roll for Initiative** controls followed by the complete **GM Initiative Roster**, including individual and batch buttons, while an ordinary player receives no new message. Clicking its controls must behave exactly like the equivalent `!Init-Go` controls; only the delivery of the opening panels is different.

#### I4. Roll Every Selected Controlled Character

As the player, select both controlled PC tokens from I1 and click **Roll Selected** in the public invitation. Include an uncontrolled NPC in the selection once as a permission check.

Pass when both controlled PCs are added or updated with one public, readable result panel and the uncontrolled NPC is ignored. No selected token may bypass the active-page, character-link, player-control, living-NPC, or readable-modifier checks. Repeat as the GM with several selected linked characters. Running `!Init-Roll-Selected` with nothing selected should explain that tokens must be selected rather than silently doing nothing.

#### I5. NPC Privacy and GM-Layer Batches

Place one living linked NPC and one dead linked NPC on the GM layer. Keep an ordinary living NPC on the Objects layer. Run:

```roll20chat
!Init-NPC-Rolls hidden
!Init-Go
```

From the private GM roster, roll one object-layer NPC, then click **GM-Layer NPCs**. Pass when the raw dice and readable NPC results are visible only to the GM, the living GM-layer NPC receives initiative, the dead GM-layer NPC is excluded, and the public invitation never reveals a GM-layer NPC's name. The GM-layer tracker entry should remain hidden from an ordinary player under Roll20's normal GM-layer behavior.

Run `!Init-NPC-Rolls public` and roll the ordinary object-layer NPC again. Pass when that NPC's dice and completed result become public while a GM-layer NPC roll remains private. Restore `!Init-NPC-Rolls hidden`, then click **All NPCs** and confirm every eligible living NPC on both layers is added or updated without adding the dead NPC or revealing GM-layer details.

#### I6. Roll Options

Click **Roll Options** and test:

- Normal with no additions;
- Advantage plus a positive or negative flat adjustment;
- Disadvantage plus one common bonus die;
- Advantage plus a flat adjustment and two sequential bonus-die choices.

Pass when the options appear in a short sequence, every earlier choice remains visible in the later button commands, and the final roll combines all selected parts. Advantage and disadvantage must show both d20 results, followed by any bonus dice, the final total, and the complete formula. A custom die must accept whole-number sides from 2 through 100 and refuse invalid input. Haste is not presented as a built-in initiative bonus; the flat adjustment and generic dice exist for effects chosen by the table.

For the playful result check, use `!Init-Go!` and repeat with temporary flat adjustments that place completed totals in the ranges **0-5**, **6-12**, **13-19**, **20-25**, **26-34**, and **35+**. Pass when the optional narration matches the degree of readiness. `!Init-Go` should remain neutral regardless of score.

#### I7. Populate the Mixed Tracker and Reroll Everyone

Return to the GM roster created by `!Init-Go` and click **Everyone**. Pass when every eligible PC and living NPC on the Objects layer is added or updated in Turn Order, while the dead NPC and unlinked object remain absent. Record one PC's score, then run `!Init-Go` again and click **Object NPCs**; pass when eligible object-layer NPCs change and that PC keeps the recorded score. The GM-layer and combined NPC controls were tested separately in I5.

Now add the dead NPC, unlinked object token, and a custom row named `Round Test` through Roll20's normal tracker controls. Record the complete order and values, then run:

```roll20chat
!Init-RR
```

Pass when every PC and living NPC rerolls, while the dead NPC, object token, and `Round Test` row keep the same values and exact positions. The command must not add every token from the page; it rerolls eligible characters already in the tracker. The completed reroll summary must be whispered to the GM and include bounded per-character roll details rather than posting the whole reroll list publicly.

This check also covers the Roll20 sessions that expose an open Turn Tracker as boolean `true`: the GM should not receive a false wrong-page message or a false **No eligible PCs or living NPCs** warning when all tracker tokens belong to this encounter page.

#### I8. Duplicate, Mismatch, and Attention Rows

1. Add the same living NPC token to the tracker a second time with a different value.
2. Give another NPC positive HP but leave its death marker on, creating an HP/marker mismatch.
3. Run `!Init-RR` again.

Pass when both occurrences of the duplicate token receive one shared roll, the mismatched NPC is left unchanged, and the GM receives a bounded attention summary. Remove the test mismatch afterward.

#### I9. Selective Rerolls and Groups

Run:

```roll20chat
!Init-RR-Menu
!Init-Group
```

Use the menu to reroll PCs only, living NPCs only, selected tracker tokens, and one individual. Then select two tracker tokens and create a named group. Rename the group from its management row, briefly move the Turn Tracker to a different page to confirm the group is not shown there, then return to the original page.

Pass when each action changes only the requested eligible rows, the saved group can be renamed and rerolled on its original page, it stays out of other-page menus, and it can be removed without deleting tracker entries.

#### I10. Status and Read-Only Review

Run:

```roll20chat
!Init-Status
!Init-Audit
```

Pass when status distinguishes PCs, NPCs, dead NPCs, objects, custom rows, stale/off-page items, and attention items. **Initiative Review** should list the bounded tracker details plus linked page characters not yet in Turn Order, remain private to the GM, create no handout, and change nothing in the tracker.

#### I11. Observer Mode

Run:

```roll20chat
!Init-Mode observer
!Init-RR
!Init-Status
!Init-Mode manager
```

Pass when Observer mode still permits status/audit reading but refuses rerolls with a plain-language explanation. Returning to Manager mode restores guarded writes.

#### I12. Unavailable 2024 Data

If a separate disposable campaign can switch away from the supported 2024 Mod environment, run `!Init-Status` and `!Init-RR` there.

Pass when unreadable 2024 characters are named as needing attention and their tracker rows remain unchanged. A missing value must never silently become zero. Skip this destructive environment-switch check when it would disrupt the campaign; record it as **not reproduced** rather than forcing the failure.

#### I13. Coexistence Check

When another Mod can roll initiative, add custom tracker rows, count rounds, or advance turns, choose one owner before testing. Put InitiativeAssist in Observer mode while the other tool owns writes. If InitiativeAssist Manager mode will be used beside a custom-row utility, run `!Init-RR` once and confirm that utility's rows stay exact.

### InitiativeAssist Failure Evidence

Record:

- the exact `!Init-` command or button used;
- whether the caller was GM or player;
- Roll20 sheet year and `charactersheetname` for each affected character;
- token name, ID, page, layer, control, bar 1 HP, and death-marker state;
- tracker JSON or screenshots before and after;
- the displayed `Roll(s)` values, total, and formula;
- Mod API server selection for 2024 characters;
- other Mods that read or write turn order;
- `!Init-Status`, `!Init-Audit`, `!ga-status --details`, and `!ga-config modules` results;
- the exact API Console exception or GameAssist warning.

---

## 9. CombatAssist

**What this proves:** CombatAssist remains an optional layer over Roll20's native tracker, starts only when asked, honors a native custom round counter, preserves the current round through valid lineup and initiative changes, expires stale reminders, sends private-safe native pings, offers one-step recovery, orders shared-player turn messages correctly, and keeps long-form guidance in one reusable manual handout.

**Why test it:** A false round count or destructive tracker update interrupts an encounter immediately. The test therefore checks both normal table use and the refusal paths that protect uncertain tracker state.

**Skip when:** Never skip for v1.8.2 release acceptance. After release, campaigns that deliberately leave CombatAssist disabled may skip it.

### Basic Check

Put at least three distinct rows in Roll20's Turn Tracker on one page. Include one custom row if the campaign uses counters, lair actions, reminders, or other non-token entries. Record their exact order and values, then run:

```roll20chat
!ga-enable CombatAssist
!Combat-Help
!Combat-Guide
!Combat-Help turns
!Combat-Help timers
!Combat-Help messages
!Combat-Menu
!Combat-GM
!Combat-DM
!Combat-Info
!Combat-Audit
!Combat-Manual
!Combat-Timer
!Combat-Cue
!Combat-Start
!Combat-Status
```

Pass when:

- **CombatAssist Quick Guide** shows only common actions and topic buttons;
- the `turns`, `timers`, and `messages` topic panels reveal focused guidance on demand and include **Back to Guide**;
- `!Combat-Guide` opens the same compact guide, while `!Combat-GM` and `!Combat-DM` each open the same **CombatAssist Control Center** as `!Combat-Menu`;
- `!Combat-Info` whispers a short purpose summary and buttons for the manual, Control Center, and guide;
- `!Combat-Audit` labels the inspection read-only and changes neither the tracker nor encounter state;
- `!Combat-Manual` creates or updates exactly one `GameAssist Guide - CombatAssist` handout containing Quick Start, normal play, recovery, privacy, and command-reference sections;
- the manual confirmation offers **Open Manual**, **Whisper Short Version**, and **Open Control Center**; running `!Combat-Manual` a second time updates the same handout rather than creating another;
- **CombatAssist Control Center** clearly separates encounter controls, announcement choices, timer settings, current-turn ping settings, status, and help;
- start identifies the encounter page, current first row, number of tracked rows, and either round 1 or the recognized native round-counter value;
- status reports `active`, the round and its source, the current turn, and a plain-language **Tracker Check** with the number of readable distinct entries;
- no tracker row, priority, custom label, or unknown field changes during help, menu, start, or status;
- mixed capitalization such as `!cOmBaT-sTaTuS` works.

### Full CombatAssist Acceptance

#### C1. Exact Forward Turns and One Complete Round

With the three-or-more-row tracker from the Basic Check, use Roll20's native next-turn arrow once, then run:

```roll20chat
!Combat-Status
```

Pass when the next row is current and the round remains 1. Continue forward until the original starting row returns to the top. Pass when the round changes to 2 exactly once.

Compare the tracker with the recorded setup. Every row object, custom entry, initiative value, and extra field should still exist unchanged; only array order should have rotated.

#### C2. Backward Safety

From the round-2 anchor, use Roll20's native previous-turn arrow once and run `!Combat-Status`.

Pass when the prior row becomes current and the round remains 2. Move forward once to undo that step. The round must still remain 2. Continue through one complete uninterrupted forward cycle; the round should then change to 3 exactly once.

#### C3. Guarded Next and Previous Turns

Record the complete tracker, then run:

```roll20chat
!Combat-Next
!Combat-Prev
```

Pass when Next moves exactly the first row to the end and Previous moves exactly the last row to the front. All row contents remain unchanged, backward movement does not change the round, and each GM turn whisper contains **Next Turn** and **Open Menu**. No new counter, token, marker, history entry, or additional handout should appear.

#### C4. Native Round Counter and `+1`

End the disposable encounter and rebuild its native tracker in this exact order:

1. One token row.
2. A second token row.
3. One Roll20 **Custom Item** named `Round Counter`, current value `1`, and Round Calculation `+1`.

Start CombatAssist and run `!Combat-Status`. Pass when **Round Source** names the native Round Counter and the recorded round is 1. Run `!Combat-Next` once; the second token should become current and the round should remain 1. Run it again.

Pass when the custom Round Counter reaches the top, its displayed value becomes 2, and CombatAssist reports round 2. Advance once more and confirm the first token begins round 2. Run `!Combat-Prev`; the Round Counter should return to the top without becoming 3.

The same behavior should work for the exact whole-label variations **Round**, **Rounds**, **Round Count**, **Round Number**, **Round Tracker**, **Combat Round**, and **Current Round**. Ordinary custom rows such as `Round Reminder` must not be mistaken for the counter. Add a second plausible counter temporarily and confirm `!Combat-Start` refuses to choose between them and explains what to rename.

#### C5. Optional Pause, Edit, and Resume

Run:

```roll20chat
!Combat-Pause
```

While paused, add one custom reminder row, remove it again, or deliberately reorder the tracker. Confirm CombatAssist does not count those edits. Then run:

```roll20chat
!Combat-Resume
!Combat-Status
```

Pass when the prior round number is retained, the current first row becomes the new counting baseline, status returns to `active`, and CombatAssist does not rewrite the edited tracker. Pause is a convenience for making several quiet changes; it is not required for normal additions, removals, rerolls, or reordering.

#### C6. Native Tracker Changes Preserve the Round

While active and **without pausing**, record the round and complete tracker, then perform these one at a time:

1. Remove a non-current NPC that is leaving combat.
2. Add a distinct NPC or custom row that is joining combat.
3. Change initiative values or manually reorder two rows.
4. When InitiativeAssist is enabled, run `!Init-RR` on eligible tracked characters.

After each change, run `!Combat-Status`.

Pass when CombatAssist remains active, preserves the recorded round, treats Roll20's current first entry as the beginning of a fresh full-cycle count, and never writes over the native edit. A changed order should produce a readable **Turn Tracker Updated** whisper with **Undo Last Tracker Change**.

For at least one change, click **Undo Last Tracker Change** or run:

```roll20chat
!Combat-Restore
```

Pass when CombatAssist previews the complete saved tracker and requires confirmation. Confirm the restore and verify the exact prior rows, values, labels, and order return while the recorded round is preserved. Make one valid edit again and keep it; this proves recovery is optional rather than an automatic overwrite.

#### C7. Attention and Recovery for Unreadable Trackers

Close the Turn Tracker or move it to another page while the encounter is active.

Pass when CombatAssist reports **Needs Attention**, retains the recorded round and last accepted tracker, and offers **Use Current Tracker**, **Restore Last Safe Tracker**, status, and explicit **Restart at Round 1** choices. It must not alter Roll20's tracker.

Return to the encounter page and reopen a valid tracker. CombatAssist may recover automatically. If attention remains, use `!Combat-Adopt` to keep the current readable tracker and round, or `!Combat-Restore` to preview and confirm the saved tracker. Use **Restart at Round 1** only when deliberately abandoning the recorded round.

#### C8. Duplicate and Stale Rows

On a disposable tracker, add the same token twice or create two custom rows with the same exact label, then try `!Combat-Start`.

Pass when start is refused because the rows are indistinguishable and both rows remain untouched. Also test one tracker row whose token was deleted. CombatAssist should identify the missing or unrecognized reference rather than deleting it or starting.

Restore distinct valid rows before continuing.

#### C9. Two-Row Direction Limitation

End the current test encounter, leave exactly two distinct valid rows, and start again. Use Roll20's native next-turn arrow once.

Pass when CombatAssist enters attention and explains that native forward and backward movement produce the same two-row order. Use **Restore Last Safe Tracker** to preview and restore the prior order, or **Use Current Tracker** to keep the moved order and recorded round. Then use:

```roll20chat
!Combat-Next
!Combat-Next
!Combat-Status
```

Pass when the first command advances one turn and the second returns to the anchor at round 2. Restart once more and verify `!Combat-Prev` safely moves backward without entering attention or changing the round.

#### C10. Announcement Audiences and Player Confirmations

With a healthy active encounter, test:

```roll20chat
!Combat-Announce gm
!Combat-Next
!Combat-Announce public
!Combat-Next
!Combat-Announce whispers
!Combat-Confirm standard
!Combat-Next
```

Arrange the tracker so the current player-controlled character is followed by a different linked character token on the Objects layer. From the non-GM player's whisper, click **End My Turn** and retain that old button for the stale-button check. Then run `!Combat-Confirm varied`, advance to another player-controlled character, and click the new **End My Turn** button.

Also test one player account that controls two consecutive characters. End the first character's turn from its button and read that player's private messages in received order.

Repeat once with a player-controlled character followed by a GM-layer NPC or a custom row such as a lair action. Finally, run `!Combat-Announce off` followed by `!Combat-Next`.

Pass when:

- GM mode whispers the GM and includes **Next Turn** plus **Open Menu**;
- public mode posts the current turn to the table;
- Whispers mode privately sends those controls to the GM and separately whispers the current linked character's non-GM controller an **End My Turn** button;
- clicking **End My Turn** advances exactly one row when that player still controls the current character;
- when one player controls consecutive characters, the received order is **Your Turn: first character**, **Turn Complete: first character**, then **Your Turn: second character**; the second prompt never arrives ahead of the first character's completion;
- when the next entry is a linked Objects-layer token, the private confirmation says it is that character's turn without saying or implying the recipient controls that character;
- when the next entry is a GM-layer token, unlinked object, or custom row, the player sees **Combat has continued with the next initiative** and does not see the hidden or non-character entry's name;
- `standard` uses one direct confirmation, while `varied` rotates among warmer confirmations and contains the complete Standard sentence as one library choice rather than appending it to every varied message;
- clicking the old button again after the turn changes produces a friendly **Turn Already Advanced** notice and does not move the tracker;
- a player who does not control the current linked character cannot advance it;
- off mode suppresses automatic output while explicit Next or Previous still confirms privately to the GM.

Setup, status, warnings, and encounter confirmation prompts remain GM-only. Test Whispers mode from a separate non-GM player login; a GM using **Rejoin as Player** still has GM permissions and is not a valid permission test.

#### C11. Turn Timers and Current-Turn Pings

Use a current player-controlled character followed by a different player-controlled character. Open `!Combat-Timer`, then configure:

```roll20chat
!Combat-Timer duration 15
!Combat-Timer deadline gm
!Combat-Timer add 10 player
!Combat-Timer on
```

Pass when the timer menu explains a 15-second turn, a GM deadline, and a player reminder with 10 seconds remaining. Start or advance to the first character, wait about two seconds, then advance to the second character. At the original reminder time, the first character's controller must receive nothing; only a reminder still bound to the second character may appear. Let one disposable turn reach its deadline and confirm the GM is notified while the Turn Tracker remains on the same row.

Run `!Combat-Pause` during another timed turn and wait beyond its former reminder/deadline. Pass when no stale reminder appears. Resume, then test `!Combat-Timer off`; no further timer notice should be scheduled. No timer path should expose an **Advance Automatically** control or move initiative.

Test native pings with:

```roll20chat
!Combat-Cue gm
!Combat-Next
!Combat-Cue players
!Combat-Next
!Combat-Cue both
!Combat-Next
!Combat-Cue public
!Combat-Next
!Combat-Cue off
```

Pass when each enabled mode sends one temporary Roll20 ping at the current token without recentering anyone's map or changing its position, aura, tint, markers, or other properties. **Players** reaches only the current token's non-GM controllers; **Both** reaches those controllers and the GM; **Public** is visible to the table. Repeat Public with a GM-layer token current. Only the GM should see that ping. Also set the timer deadline to **player** for that hidden turn and confirm the notice stays with the GM rather than revealing the hidden actor. Custom rows should not produce a token ping or player timer notice.

#### C12. End Confirmation

Record the tracker and run:

```roll20chat
!Combat-End
```

Pass when CombatAssist asks for confirmation and the encounter remains active. Confirm from the button or run:

```roll20chat
!Combat-End --confirm
```

Pass when CombatAssist reports no active encounter and the native tracker remains byte-for-byte unchanged.

#### C13. TurnTrackerService Cascade and Reload

Start a healthy disposable CombatAssist encounter, record the tracker and current round, then run:

```roll20chat
!ga-disable TurnTrackerService
!ga-config modules
```

Pass when TurnTrackerService disables CombatAssist and InitiativeAssist, unrelated modules remain available, and the native tracker is unchanged. Re-enable in dependency order:

```roll20chat
!ga-enable TurnTrackerService
!ga-enable CombatAssist
!Combat-Status
```

Pass when the saved encounter is available if the tracker did not change. Restart the Mod sandbox with the same healthy tracker and run `!Combat-Status` again. The encounter and round should remain available. If the tracker changes while CombatAssist is disabled or unavailable, re-enabling should produce attention rather than guessing what happened.

#### C14. CombatAssist Independence and Optional Interoperability

Record the native tracker and the enabled state of InitiativeAssist and several unrelated modules, then run:

```roll20chat
!ga-disable CombatAssist
!ga-config modules
```

Pass when only CombatAssist is disabled, Roll20's tracker remains unchanged and usable through its native arrows, and InitiativeAssist plus every unrelated module retains its prior configuration. CombatAssist's baseline requires TurnTrackerService, but no other baseline module requires CombatAssist. Any future optional interoperability action must clearly name its prerequisite and disable only that action when the prerequisite is unavailable.

### CombatAssist Failure Evidence

Record:

- the exact `!Combat-` command or native tracker action;
- tracker page and whether the tracker was open;
- tracker order, labels, priorities, and duplicate rows before and after;
- the saved lifecycle state and round from `!Combat-Status`;
- whether the change was forward, backward, an edit, or caused by another Mod;
- announcement mode, current linked-character controller, and whether the End My Turn button was current or stale;
- round source, round-counter label/value/formula when present, timer settings, and current-turn ping audience;
- the CombatAssist and TurnTrackerService rows from `!ga-config modules`;
- `!ga-status --details` and the exact API Console exception or GameAssist warning.

---

## 10. ConcentrationAssist

**What this proves:** ConcentrationAssist reads linked character data, builds the correct save, remembers the last check, and uses MarkerService.

**Why test it:** A failure may come from token linkage, character attributes, roll mode, marker configuration, or command routing.

**Skip when:** ConcentrationAssist is disabled and will not be used.

### Basic Check

Run:

```roll20chat
!concentration
!concentration --status
```

Pass when the button menu appears and status returns either a token list or `No tokens concentrating.`

A completely silent status command is a failure. An actionable invalid-marker warning is a configuration problem, not a pass.

### Expanded ConcentrationAssist Checks

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

## 11. NPCAssist

**What this proves:** NPCAssist tracks genuine HP transitions, privately reports qualifying Bloodied crossings, changes death markers, audits current-page mismatches, and maintains report buckets and Arc records.

**Why test it:** NPCAssist combines event timing, token eligibility, private HP notices, MarkerService, persistent state, and handout writing.

**Skip when:** NPCAssist is disabled and will not be used.

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

Then set bar 1 to **51 / 100** and lower it to **50 / 100**. Pass when the GM receives one private Bloodied notice, players receive nothing, and no marker or history entry is added by that notice.

### NPCAssist Menu Guide

| Command | Expected purpose |
| --- | --- |
| `!npc-death-help` | Central NPCAssist guide. |
| `!npc-death-report` | Read a bounded report for the active or requested bucket. |
| `!npc-death-buckets` | Review or rename Campaign, Chapter, Section, and Session buckets. |
| `!NPC-WR` or `!npc-death-write` | Review report targets before writing handouts. |
| `!npc-death-audit` | Compare linked NPC HP with the configured death marker. |
| `!npc-death-repair` | Preview and confirm marker-only corrections from current HP. |
| `!npc-death-arc` | Manage independent story-specific Arc records. |

### Expanded NPCAssist Checks

#### Bloodied Alerts

Run the complete **Focused v1.8.2 NPCAssist Bloodied Regression** near the top of this guide. It covers the threshold, repeat suppression, healing rearm, death separation, opt-out, private delivery, invalid maxima, token eligibility, and HPAssist initialization.

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

The default Session follows the active GameAssist table date. The `!ga-timezone` setting selects that clock; when none is selected, the Roll20 sandbox clock is used. A timezone change refreshes an active date-managed Session immediately, and the next NPCAssist command or qualifying HP change after local midnight moves it to the new date. A manually named Session does not roll over until **Reset Session Date** is used.

Use the focused timezone regression above to test both sides of a date boundary without waiting for midnight.

#### Auto-Hide

Check:

```roll20chat
!ga-config get NPCAssist autoHide
!ga-config get NPCAssist hideLayer
```

Default behavior is `autoHide=false`. If enabled, dead NPCs intentionally move to the configured layer. Test only with disposable tokens.

---

## 12. HPAssist

**What this proves:** HPAssist recognizes qualifying NPCs, rolls `npc_hpformula`, and protects initialization from false death, revival, and Bloodied events.

**Why test it:** A broad HP operation must not modify PCs, unlinked tokens, or NPCAssist history incorrectly.

**Skip when:** HPAssist is disabled and all NPC HP is managed manually or by another script.

### Command Routing Check

Run these read-only commands with no token selected:

```roll20chat
!HP-Status
!hp status
!hP-gUiDe
!npc-hp-status
```

Pass when all four commands produce one HPAssist response each, mixed capitalization works, and the deprecated `!npc-hp-status` alias does not produce an NPCAssist unrecognized-command warning.

### Basic Check

Select the linked test NPC and run:

```roll20chat
!HP-Selected
```

Pass when bar 1 current and maximum become the same rolled value and the result identifies the NPC and formula.

### Expanded HPAssist Checks

#### Mixed Selection

Select the linked NPC, linked PC, and unlinked token:

```roll20chat
!HP-Selected
```

Pass when only the qualifying NPC receives rolled HP.

#### Current Page

On the disposable page:

```roll20chat
!HP-All
```

Pass when qualifying NPCs roll, PCs remain unchanged, and unlinked tokens are skipped.

#### Invalid Formula

Temporarily replace `npc_hpformula` with invalid text and run `!HP-Selected`.

Pass when GameAssist reports the invalid formula without applying bad HP. Restore the formula afterward.

#### Auto-Roll on Add

This feature defaults to off. Test only in a disposable campaign:

```roll20chat
!ga-config set HPAssist autoRollOnAdd=true
```

Add a qualifying linked NPC token.

Pass when:

- HP is rolled automatically;
- no temporary death marker appears;
- no false death/revival pair enters any NPCAssist bucket and no false Bloodied notice appears;
- a later genuine positive-to-zero transition is tracked normally.

Restore the default:

```roll20chat
!ga-config set HPAssist autoRollOnAdd=false
```

---

## 13. DebugTools

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

## 14. WelcomeAssist

**What this proves:** WelcomeAssist stays silent until deliberately enabled, keeps setup private, posts no more than one automatic greeting per sandbox lifecycle, and safely manages campaign greeting text.

**Why test it:** The module writes to public chat during startup. It must never surprise the table while being configured, repeat itself, claim GameAssist is ready when an enabled component is unhealthy, or execute Roll20 syntax hidden inside custom text.

**Skip when:** Never skip for v1.8.2 release acceptance. After release, campaigns that leave WelcomeAssist disabled may confirm the disabled check and skip the expanded tests.

### Basic Check

Confirm `!ga-config modules` shows WelcomeAssist disabled. Reload the Mod sandbox once and verify no WelcomeAssist greeting appears. Then run:

```roll20chat
!ga-enable WelcomeAssist
!Welcome
!Welcome-Help setup
!Welcome-Help safety
!Welcome-GM
!Welcome-DM
!Welcome-Status
!Welcome-Preview
!Welcome-Not-A-Command
!welcome-assist help
```

Pass when:

- the root Guide is a compact action and topic menu rather than the complete setup manual;
- the setup and safety topics explain their focused subjects and include **Back to Guide**;
- `!Welcome-GM` and `!Welcome-DM` open the same private setup and status screen;
- status reports module `0.1.4`, `mixed` mode on a first-time configuration, a 3-second delay, and no automatic greeting yet;
- preview is whispered only to the GM;
- the unrecognized command returns **Needs Attention** with an **Open Guide** button rather than silently opening an unrelated screen;
- the retained `!welcome-assist help` alias opens one guide response rather than producing duplicate output;
- enabling and previewing do not create any public message.

Reload the Mod sandbox. Pass when exactly one public greeting appears after the delay. Wait at least 20 seconds and confirm no second automatic greeting appears.

### Expanded WelcomeAssist Checks

#### W1. Mode and Immediate Announcement

Run these one at a time and use **Preview** before **Announce Now**:

```roll20chat
!Welcome-Mode default
!Welcome-Mode builtin
!Welcome-Mode custom
!Welcome-Mode mixed
```

Pass when default uses the professional greeting, builtin uses one of the included geek-culture lines, empty custom mode falls back to the professional greeting with a GM warning, and mixed can use the default, built-ins, or campaign lines. Every preview remains private. Every deliberate `announce` is public.

#### W2. Campaign Greeting Management

Run:

```roll20chat
!Welcome-Custom add Dovie'andi se tovya sagain
!Welcome-Custom list
!Welcome-Custom add DOVIE'ANDI SE TOVYA SAGAIN
!Welcome-Custom remove 1 junk
```

Pass when the first greeting appears once in the list, the capitalization-only duplicate is refused, and the malformed removal value does not delete it. Add nine other disposable greetings; the tenth total entry should be accepted and an eleventh refused.

Remove one item with its exact number. Then test clearing:

```roll20chat
!Welcome-Custom clear
!Welcome-Custom clear --confirm
```

Pass when the first command refuses and the confirmed command empties the list.

#### W3. Public Chat Safety

Add this disposable campaign greeting exactly as text:

```roll20chat
!Welcome-Custom add [[1d20]] @{strength} %{ability} ?{query} <b>hello</b>
!Welcome-Mode custom
!Welcome-Preview
!Welcome-Announce
```

Pass when the greeting displays the Roll20 expressions and HTML-like text literally. It must not roll dice, read an attribute, call an ability, open a query, or render a bold HTML element. Remove the disposable greeting afterward.

#### W4. Header, Delay, and Timer Cancellation

Run:

```roll20chat
!Welcome-Header hide
!Welcome-Preview
!Welcome-Header show
!Welcome-Header Campaign Ready
!Welcome-Delay 5
```

Pass when previews accurately hide, show, and rename the header, and status reports a 5-second delay. Reload, then use `!Welcome-Announce` before the five seconds expire. Pass when the manual greeting appears once and the pending automatic greeting does not appear afterward.

#### W5. Disable and Reload Safety

Set a five-second delay, reload, and disable WelcomeAssist before the timer fires:

```roll20chat
!ga-disable WelcomeAssist
```

Pass when no public greeting appears. Re-enable it during the same running sandbox and wait; pass when live enablement still does not post. Automatic behavior resumes only after another sandbox reload.

For the ordinary healthy-start test, every other configured module should be running before the greeting appears. Do not intentionally damage a live campaign to force the failure path; the automated harness covers the bounded wait and named-component refusal. If a real startup failure already exists, pass when WelcomeAssist skips the greeting and names the inactive component to the GM.

### WelcomeAssist Failure Evidence

Record:

- enabled/running state from `!ga-config modules`;
- `!Welcome-Status` output;
- selected mode, delay, header setting, and custom-list count;
- whether the action was preview, manual announce, or automatic startup;
- whether another enabled GameAssist component was inactive;
- public and GM-whisper output;
- exact API Console exception or warning.

Restore the desired campaign greeting configuration. Leave WelcomeAssist disabled when the campaign does not intend to use automatic greetings.

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
!Welcome-Announce
!HP-All
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

Scripts that independently respond to `!condition` or `!token-mod`, describe the same marker changes, modify the same NPC HP/bar 1, control the same token properties or death/concentration/condition markers, process the same Natural 1 workflow, or rewrite the native Turn Tracker may conflict even when their names differ. TokenAssist deliberately suspends only its deprecated `!token-mod` alias when standalone TokenMod is detected, but the standalone copy should still be removed for normal v1.8.2 use. Use InitiativeAssist Observer mode when another initiative roller owns initiative values; leave CombatAssist disabled when another encounter manager owns turn advancement or rounds.

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
!ga-config get NPCAssist deadMarker
!ga-config get ConcentrationAssist marker
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
- NPCAssist tokens have `npc=1`.
- The configured built-in marker, custom display name, or exact stored tag exists.
- The HP or concentration outcome actually requested the expected marker state.

Standalone TokenMod permissions are not a repair for GameAssist marker failures in v1.8.2.

Stop testing and report the before/after marker values if an unrelated marker or number changes.

## NPC HP Does Not Roll

Confirm:

- token is selected or on the current player page;
- token is on the Objects layer;
- token represents a character;
- character has `npc=1`;
- character has a valid `npc_hpformula`, such as `4d8+8`.

## CritAssist Does Not Roll

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
- CritAssist: `!critfumble help`.
- ConditionAssist: select a disposable token, open `!condition`, and run `!condition status`.
- TokenAssist: select a disposable token, open `!token-assist help`, and flip one harmless visibility setting twice.
- ConcentrationAssist: `!concentration --status`.
- NPCAssist: `!npc-death-report`; use `!npc-death-audit` when checking markers and open repair only if a mismatch is intentional.
- HPAssist: roll one disposable selected NPC.
- DebugTools: skip unless deliberately needed.
- InitiativeAssist: open `!Init-GM` when private encounter setup will be used.
- WelcomeAssist: when enabled, preview the greeting and confirm status before the session; do not use manual announce merely as a health check.

Do not discover a marker, HP, or table problem for the first time during combat.
