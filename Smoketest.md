# GameAssist v1.8.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v1.8.0. It retains the established component checks and adds a dedicated CombatAssist acceptance section.

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

**Skip when:** Do not skip after first installing v1.8.0 or changing the campaign timezone. The cross-date test may be skipped when NPCAssist is disabled and will not be used.

### Quick Check

1. Run `!ga-status` and confirm the title identifies **GameAssist 1.8.0**.
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

## Full v1.8.0 Release Acceptance Test

This is the release test for v1.8.0. It has two distinct tracks:

| Track | Script being tested | Purpose |
| --- | --- | --- |
| **A. Clean installation** | **v1.8.0** | Proves the complete suite and the new encounter-flow module work together. |
| **B. Upgrade** | **v1.8.0** | Proves v0.1.7.0 configuration, history, guide handouts, optional-module settings, and tracker contents survive the module-name migration. |

Do not use an earlier release guide as the v1.8.0 acceptance test. In Track B, v0.1.7.0 is only the starting point used to create existing campaign state; every acceptance check after replacement is performed with v1.8.0.

### Release Candidate Files

Use the current repository copies of:

- `GameAssist-v1.8.0` or the identical `GameAssist.js` One-Click artifact;
- this `Smoketest.md` guide.

After saving the script, wait for the Mod sandbox to restart. Do not continue unless the startup message and `!ga-status` both identify **GameAssist v1.8.0**.

### Track A: Clean v1.8.0 Installation

Use a new disposable campaign, or a disposable campaign in which GameAssist state may be cleared safely.

1. Install GameAssist v1.8.0. Remove or disable standalone TokenMod and StatusInfo before testing their integrated replacements.
2. Prepare the disposable PC, NPC, unlinked token, and optional CritAssist tables described under [Before Testing](#before-testing).
3. Run every **Basic Check** in Components 1 through 14, except a deliberately disabled optional feature may be recorded as **Skipped by choice**.
4. Run the complete MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, and WelcomeAssist acceptance sections. These may not be skipped for v1.8.0 release approval.
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
| HPAssist basic workflow | [ ] Pass [ ] Fail [ ] Skipped by choice |
| DebugTools dry-run safeguard | [ ] Pass [ ] Fail |
| Cross-component checks | [ ] Pass [ ] Fail |
| Restart persistence check | [ ] Pass [ ] Fail |

### Track B: Upgrade v0.1.7.0 to v1.8.0

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

#### Install and test v1.8.0

1. Replace the complete v0.1.7.0 script with the current v1.8.0 artifact.
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
10. Run the inherited module checks plus the complete TurnTrackerService, InitiativeAssist, CombatAssist, and WelcomeAssist sections using v1.8.0.
11. Restart the sandbox and confirm the retained configuration, timezone, history, tracker, InitiativeAssist setting/group, WelcomeAssist configuration, and CombatAssist setting remain available.

Record the upgrade result here:

| Upgrade requirement | Result |
| --- | --- |
| v1.8.0 starts without a new GameAssist exception | [ ] Pass [ ] Fail |
| Valid v0.1.7.0 configuration is retained | [ ] Pass [ ] Fail |
| Old module branches migrate to the four canonical names | [ ] Pass [ ] Fail |
| NPC history and bucket names are retained | [ ] Pass [ ] Fail |
| Existing guide handouts are adopted without duplication | [ ] Pass [ ] Fail |
| MarkerService and enabled dependents are running | [ ] Pass [ ] Fail |
| Standalone TokenMod and StatusInfo are no longer required | [ ] Pass [ ] Fail |
| New ConditionAssist and TokenAssist workflows pass | [ ] Pass [ ] Fail |
| TurnTrackerService, InitiativeAssist, CombatAssist, and WelcomeAssist acceptance passes | [ ] Pass [ ] Fail |
| Existing gameplay module basic checks pass | [ ] Pass [ ] Fail |
| Migrated state survives another sandbox restart | [ ] Pass [ ] Fail |

### Release Decision

The v1.8.0 release regression passes only when:

- Track A passes in a clean installation;
- Track B passes after replacing v0.1.7.0 with v1.8.0;
- MarkerService, TurnTrackerService, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, and WelcomeAssist have no skipped acceptance checks;
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
| TurnTrackerService | Native tracker rows can be read, audited, and safely updated without losing custom or unknown data. | InitiativeAssist and CombatAssist depend on one lossless Turn Tracker authority. | Never for v1.8.0 release acceptance. |
| ConfigUI | The GM settings interface opens and responds once. | It is the easiest way for most DMs to manage modules. | The campaign is intentionally managed only through commands. |
| CritAssist | Help and the Natural 1 workflow respond. | Table automation can fail separately from the rest of GameAssist. | CritAssist is disabled and will not be used. |
| ConditionAssist | Condition help, selected-token controls, descriptions, and MarkerService synchronization work. | Condition workflows combine permissions, configuration, markers, and chat output. | ConditionAssist is deliberately disabled and will not be used. |
| TokenAssist | Selected-token controls, values, movement, reports, and MarkerService-backed status commands work. | It replaces the supported general token-control workflows previously supplied by standalone TokenMod. | TokenAssist is deliberately disabled and none of its commands, including the temporary older command, will be used. |
| InitiativeAssist | Mixed 2014/2024 actors roll through the native tracker while counters, objects, dead NPCs, and attention rows remain untouched. | Initiative mistakes interrupt play and can damage another tool's tracker state. | Never for v1.8.0 release acceptance. |
| CombatAssist | Explicit lifecycle, rounds, ordinary native tracker edits, recovery, and player confirmations work without replacing Roll20's tracker. | A false round or destructive tracker edit can disrupt an encounter immediately. | Never for v1.8.0 release acceptance. |
| WelcomeAssist | Optional greetings remain deliberate, bounded, private during setup, and limited to one automatic post per sandbox. | Startup output should welcome the table without misreporting unhealthy GameAssist components or executing custom chat syntax. | Never for v1.8.0 release acceptance. |
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
- TurnTrackerService, InitiativeAssist, CombatAssist, Û­wöÚ$z{-®éÜj×F†RæWrFFRâÖçVÆÇ’æÖVB6W76–öâFöW2æ÷B&öÆÂ÷fW"VçF–Â¢¥&W6WB6W76–öâFFR¢¢—2W6VBà ¥W6RF†Rfö7W6VBF–ÖW¦öæR&Vw&W76–öâ&÷fRFòFW7B&÷F‚6–FW2öbFFR&÷VæF'’v—F†÷WBv—F–ærf÷"Ö–Fæ–v‡Bà ¢2222WFòÔ†–FP ¤6†V6³  ¦&öÆÃ#6†@¢vÖ6öæf–rvWBå476—7BWFô†–FP¢vÖ6öæf–rvWBå476—7B†–FTÆ–W ¦  ¤FVfVÇB&V†f–÷"—2WFô†–FSÖfÇ6Vâ–bVæ&ÆVBÂFVBå72–çFVçF–öæÆÇ’Ö÷fRFòF†R6öæf–wW&VBÆ–W"âFW7BöæÇ’v—F‚F—7÷6&ÆRFö¶Vç2à ¢ÒÒĞ ¢22"â…76—7@ ¢¢¥v†BF†—2&÷fW3¢¢¢…76—7B&V6övæ—¦W2VÆ–g––ærå72Â&öÆÇ2ç5ö‡f÷&×VÆÂæB&÷FV7G2–æ—F–Æ—¦F–öâg&öÒfÇ6RFVF‚†—7F÷'’à ¢¢¥v‡’FW7B—C¢¢¢'&öB…÷W&F–öâ×W7Bæ÷BÖöF–g’72ÂVæÆ–æ¶VBFö¶Vç2Â÷"å476—7B†—7F÷'’–æ6÷'&V7FÇ’à ¢¢¥6¶—v†Vã¢¢¢…76—7B—2F—6&ÆVBæBÆÂå2…—2ÖævVBÖçVÆÇ’÷"'’æ÷F†W"67&—Bà ¢222&6–26†V6° ¥6VÆV7BF†RÆ–æ¶VBFW7Bå2æB'Vã  ¦&öÆÃ#6†@¢ç2Ö‡×6VÆV7FV@¦  ¥72v†Vâ&"7W'&VçBæBÖ†–×VÒ&V6öÖRF†R6ÖR&öÆÆVBfÇVRæBF†R&W7VÇB–FVçF–f–W2F†Rå2æBf÷&×VÆà ¢222W‡æFVB…76—7B6†V6·0 ¢2222Ö—†VB6VÆV7F–öà ¥6VÆV7BF†RÆ–æ¶VBå2ÂÆ–æ¶VB2ÂæBVæÆ–æ¶VBFö¶Vã  ¦&öÆÃ#6†@¢ç2Ö‡×6VÆV7FV@¦  ¥72v†VâöæÇ’F†RVÆ–g––ærå2&V6V—fW2&öÆÆVB…à ¢22227W'&VçBvP ¤öâF†RF—7÷6&ÆRvS  ¦&öÆÃ#6†@¢ç2Ö‡ÖÆÀ¦  ¥72v†VâVÆ–g––ærå72&öÆÂÂ72&VÖ–âVæ6†ævVBÂæBVæÆ–æ¶VBFö¶Vç2&R6¶—VBà ¢2222–çfÆ–Bf÷&×VÆ ¥FV×÷&&–Ç’&WÆ6Rç5ö‡f÷&×VÆv—F‚–çfÆ–BFW‡BæB'Vâç2Ö‡×6VÆV7FVFà ¥72v†VâvÖT76—7B&W÷'G2F†R–çfÆ–Bf÷&×VÆv—F†÷WBÇ––ær&B…â&W7F÷&RF†Rf÷&×VÆgFW'v&Bà ¢2222WFòÕ&öÆÂöâF@ ¥F†—2fVGW&RFVfVÇG2FòöfbâFW7BöæÇ’–âF—7÷6&ÆR6×–vã  ¦&öÆÃ#6†@¢vÖ6öæf–r6WB…76—7BWFõ&öÆÄöäFC×G'VP¦  ¤FBVÆ–g––ærÆ–æ¶VBå2Fö¶Vâà ¥72v†Vã  ¢Ò…—2&öÆÆVBWFöÖF–6ÆÇ“°¢ÒæòFV×÷&'’FVF‚Ö&¶W"V'3°¢ÒæòfÇ6RFVF‚÷&Wf—fÂ—"VçFW'2ç’å476—7B'V6¶WC°¢ÒÆFW"vVçV–æR÷6—F—fR×Fò×¦W&òG&ç6—F–öâ—2G&6¶VBæ÷&ÖÆÇ’à ¥&W7F÷&RF†RFVfVÇC  ¦&öÆÃ#6†@¢vÖ6öæf–r6WB…76—7BWFõ&öÆÄöäFCÖfÇ6P¦  ¢ÒÒĞ ¢222âFV'VuFööÇ0 ¢¢¥v†BF†—2&÷fW3¢¢¢FV'VuFööÇ2&VÖ–ç2÷BÖ–âÂ&Wf–Ww2×WFF–öç2'’FVfVÇBÂæB&WV—&W2ÒÖÇ–à ¢¢¥v‡’FW7B—C¢¢¢F–væ÷7F–726†÷VÆBæ÷BÇFW"6×–vâ7FFR66–FVçFÆÇ’à ¢¢¥6¶—v†Vã¢¢¢æ÷&ÖÆÇ’6¶—VæÆW72fÆ–FF–ær&VÆV6R÷"G&÷V&ÆW6†ö÷F–ærÖ&¶W%6W'f–6RÂ…Â÷"6fR&V†f–÷"à ¢222&6–26†V6° ¥'VâV6‚6öÖÖæB6W&FVÇ“  ¦&öÆÃ#6†@¢vÖVæ&ÆRFV'VuFööÇ0¢vÖFV'Vp¦  ¥72v†VâFV'VuFööÇ2&V6öÖW27F—fRæB—G2†VÇV'2à ¢222W‡æFVBFV'VuFööÇ26†V6·0 ¥v—F‚F—7÷6&ÆRFö¶Vâ6VÆV7FVC  ¦&öÆÃ#6†@¢vÖFV'VrFÖvRÒÖÖ÷VçB ¢vÖFV'VrÖ&¶W"ÒÖÖ&¶W"&ÇVRÒ×7FFRFövvÆP¢vÖFV'Vr6fRÒÖF2"ÒÖ&öçW22ÒÖÖöFRGbÒÖÆ&VÂ%6Öö¶RFW7B ¦  ¥72v†VâÆÂF‡&VR6öÖÖæG2&Wf–Wr7F–öç2v—F†÷WB6†æv–ær…ÂÖ&¶W'2Â÷"&öÆÆ–ærà ¤Ç’V6‚FW7C  ¦&öÆÃ#6†@¢vÖFV'VrFÖvRÒÖÖ÷VçB"ÒÖÇ¢vÖFV'VrÖ&¶W"ÒÖÖ&¶W"&ÇVRÒ×7FFRFövvÆRÒÖÇ¢vÖFV'Vr6fRÒÖF2"ÒÖ&öçW22ÒÖÖöFRGbÒÖÆ&VÂ%6Öö¶RFW7B"ÒÖÇ¦  ¥72v†Vã  ¢ÒFÖvR6†ævW2…'’W†7FÇ’"v—F†÷WBvö–ær&VÆ÷r¦W&ó°¢ÒF†RÖ&¶W"7F–öâ6†ævW2öæÇ’F†R&WVW7FVBÖ&¶W"F‡&÷Vv‚Ö&¶W%6W'f–6S°¢ÒF†R6fR&öÆÇ2æBv†—7W'2—G2&W7VÇBà ¥&WGW&âFV'VuFööÇ2Fò—G2FVfVÇB7FFS  ¦&öÆÃ#6†@¢vÖF—6&ÆRFV'VuFööÇ0¢vÖ6öæf–rÖöGVÆW0¦  ¢ÒÒĞ ¢22BâvVÆ6öÖT76—7@ ¢¢¥v†BF†—2&÷fW3¢¢¢vVÆ6öÖT76—7B7F—26–ÆVçBVçF–ÂFVÆ–&W&FVÇ’Væ&ÆVBÂ¶VW26WGW&—fFRÂ÷7G2æòÖ÷&RF†âöæRWFöÖF–2w&VWF–ærW"6æF&÷‚Æ–fV7–6ÆRÂæB6fVÇ’ÖævW26×–vâw&VWF–ærFW‡Bà ¢¢¥v‡’FW7B—C¢¢¢F†RÖöGVÆRw&—FW2FòV&Æ–26†BGW&–ær7F'GWâ—B×W7BæWfW"7W'&—6RF†RF&ÆRv†–ÆR&V–ær6öæf–wW&VBÂ&WVB—G6VÆbÂ6Æ–ÒvÖT76—7B—2&VG’v†VââVæ&ÆVB6ö×öæVçB—2Væ†VÇF‡’Â÷"W†V7WFR&öÆÃ#7–çF‚†–FFVâ–ç6–FR7W7FöÒFW‡Bà ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—f÷"cã‚ã&VÆV6R66WFæ6RâgFW"&VÆV6RÂ6×–vç2F†BÆVfRvVÆ6öÖT76—7BF—6&ÆVBÖ’6öæf—&ÒF†RF—6&ÆVB6†V6²æB6¶—F†RW‡æFVBFW7G2à ¢222&6–26†V6° ¤6öæf—&ÒvÖ6öæf–rÖöGVÆW66†÷w2vVÆ6öÖT76—7BF—6&ÆVBâ&VÆöBF†RÖöB6æF&÷‚öæ6RæBfW&–g’æòvVÆ6öÖT76—7Bw&VWF–ærV'2âF†Vâ'Vã  ¦&öÆÃ#6†@¢vÖVæ&ÆRvVÆ6öÖT76—7@¢vVÆ6öÖP¢vVÆ6öÖRÔ†VÇ6WGW ¢vVÆ6öÖRÔ†VÇ6fWG¢vVÆ6öÖRÔtĞ¢vVÆ6öÖRÔDĞ¢vVÆ6öÖRÕ7FGW0¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔæ÷BÔÔ6öÖÖæ@¢vVÆ6öÖRÖ76—7B†VÇ ¦  ¥72v†Vã  ¢ÒF†R&ö÷BwV–FR—26ö×7B7F–öâæBF÷–2ÖVçR&F†W"F†âF†R6ö×ÆWFR6WGWÖçVÃ°¢ÒF†R6WGWæB6fWG’F÷–72W‡Æ–âF†V—"fö7W6VB7V&¦V7G2æB–æ6ÇVFR¢¤&6²FòwV–FR¢£°¢ÒvVÆ6öÖRÔtÖæBvVÆ6öÖRÔDÖ÷VâF†R6ÖR&—fFR6WGWæB7FGW267&VVã°¢Ò7FGW2&W÷'G2ÖöGVÆRããFÂÖ—†VFÖöFRöâf—'7B×F–ÖR6öæf–wW&F–öâÂ2×6V6öæBFVÆ’ÂæBæòWFöÖF–2w&VWF–ær–WC°¢Ò&Wf–Wr—2v†—7W&VBöæÇ’FòF†RtÓ°¢ÒF†RVç&V6övæ—¦VB6öÖÖæB&WGW&ç2¢¤æVVG2GFVçF–öâ¢¢v—F‚â¢¤÷VâwV–FR¢¢'WGFöâ&F†W"F†â6–ÆVçFÇ’÷Væ–ærâVç&VÆFVB67&VVã°¢ÒF†R&WF–æVBvVÆ6öÖRÖ76—7B†VÇÆ–2÷Vç2öæRwV–FR&W7öç6R&F†W"F†â&öGV6–ærGWÆ–6FR÷WGWC°¢ÒVæ&Æ–æræB&Wf–Wv–ærFòæ÷B7&VFRç’V&Æ–2ÖW76vRà ¥&VÆöBF†RÖöB6æF&÷‚â72v†VâW†7FÇ’öæRV&Æ–2w&VWF–ærV'2gFW"F†RFVÆ’âv—BBÆV7B#6V6öæG2æB6öæf—&Òæò6V6öæBWFöÖF–2w&VWF–ærV'2à ¢222W‡æFVBvVÆ6öÖT76—7B6†V6·0 ¢2222sâÖöFRæB–ÖÖVF–FRææ÷Væ6VÖVç@ ¥'VâF†W6RöæRBF–ÖRæBW6R¢¥&Wf–Wr¢¢&Vf÷&R¢¤ææ÷Væ6Ræ÷r¢£  ¦&öÆÃ#6†@¢vVÆ6öÖRÔÖöFRFVfVÇ@¢vVÆ6öÖRÔÖöFR'V–ÇF–à¢vVÆ6öÖRÔÖöFR7W7FöĞ¢vVÆ6öÖRÔÖöFRÖ—†V@¦  ¥72v†VâFVfVÇBW6W2F†R&öfW76–öæÂw&VWF–ærÂ'V–ÇF–âW6W2öæRöbF†R–æ6ÇVFVBvVV²Ö7VÇGW&RÆ–æW2ÂV×G’7W7FöÒÖöFRfÆÇ2&6²FòF†R&öfW76–öæÂw&VWF–ærv—F‚tÒv&æ–ærÂæBÖ—†VB6âW6RF†RFVfVÇBÂ'V–ÇBÖ–ç2Â÷"6×–vâÆ–æW2âWfW'’&Wf–Wr&VÖ–ç2&—fFRâWfW'’FVÆ–&W&FRææ÷Væ6V—2V&Æ–2à ¢2222s"â6×–vâw&VWF–ærÖævVÖVç@ ¥'Vã  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒFBF÷f–RvæF’6RF÷g–6v–à¢vVÆ6öÖRÔ7W7FöÒÆ—7@¢vVÆ6öÖRÔ7W7FöÒFBDõd”RtäD’4RDõe”4t”à¢vVÆ6öÖRÔ7W7FöÒ&VÖ÷fR§Væ°¦  ¥72v†VâF†Rf—'7Bw&VWF–ærV'2öæ6R–âF†RÆ—7BÂF†R6—FÆ—¦F–öâÖöæÇ’GWÆ–6FR—2&VgW6VBÂæBF†RÖÆf÷&ÖVB&VÖ÷fÂfÇVRFöW2æ÷BFVÆWFR—BâFBæ–æR÷F†W"F—7÷6&ÆRw&VWF–æw3²F†RFVçF‚F÷FÂVçG'’6†÷VÆB&R66WFVBæBâVÆWfVçF‚&VgW6VBà ¥&VÖ÷fRöæR—FVÒv—F‚—G2W†7BçVÖ&W"âF†VâFW7B6ÆV&–æs  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒ6ÆV ¢vVÆ6öÖRÔ7W7FöÒ6ÆV"ÒÖ6öæf—&Ğ¦  ¥72v†VâF†Rf—'7B6öÖÖæB&VgW6W2æBF†R6öæf—&ÖVB6öÖÖæBV×F–W2F†RÆ—7Bà ¢2222s2âV&Æ–26†B6fWG ¤FBF†—2F—7÷6&ÆR6×–vâw&VWF–ærW†7FÇ’2FW‡C  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒFBµ³C#ÕÒ·7G&VæwF‡ÒW¶&–Æ—G—Ò÷·VW'—ÒÆ#æ†VÆÆóÂö#à¢vVÆ6öÖRÔÖöFR7W7FöĞ¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔææ÷Væ6P¦  ¥72v†VâF†Rw&VWF–ærF—7Æ—2F†R&öÆÃ#W‡&W76–öç2æB…DÔÂÖÆ–¶RFW‡BÆ—FW&ÆÇ’â—B×W7Bæ÷B&öÆÂF–6RÂ&VBâGG&–'WFRÂ6ÆÂâ&–Æ—G’Â÷VâVW'’Â÷"&VæFW"&öÆB…DÔÂVÆVÖVçBâ&VÖ÷fRF†RF—7÷6&ÆRw&VWF–ærgFW'v&Bà ¢2222sBâ†VFW"ÂFVÆ’ÂæBF–ÖW"6æ6VÆÆF–öà ¥'Vã  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ†VFW"†–FP¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔ†VFW"6†÷p¢vVÆ6öÖRÔ†VFW"6×–vâ&VG¢vVÆ6öÖRÔFVÆ’P¦  ¥72v†Vâ&Wf–Ww267W&FVÇ’†–FRÂ6†÷rÂæB&VæÖRF†R†VFW"ÂæB7FGW2&W÷'G2R×6V6öæBFVÆ’â&VÆöBÂF†VâW6RvVÆ6öÖRÔææ÷Væ6V&Vf÷&RF†Rf—fR6V6öæG2W‡—&Râ72v†VâF†RÖçVÂw&VWF–ærV'2öæ6RæBF†RVæF–ærWFöÖF–2w&VWF–ærFöW2æ÷BV"gFW'v&Bà ¢2222sRâF—6&ÆRæB&VÆöB6fWG ¥6WBf—fR×6V6öæBFVÆ’Â&VÆöBÂæBF—6&ÆRvVÆ6öÖT76—7B&Vf÷&RF†RF–ÖW"f—&W3  ¦&öÆÃ#6†@¢vÖF—6&ÆRvVÆ6öÖT76—7@¦  ¥72v†VâæòV&Æ–2w&VWF–ærV'2â&RÖVæ&ÆR—BGW&–ærF†R6ÖR'Vææ–ær6æF&÷‚æBv—C²72v†VâÆ—fRVæ&ÆVÖVçB7F–ÆÂFöW2æ÷B÷7BâWFöÖF–2&V†f–÷"&W7VÖW2öæÇ’gFW"æ÷F†W"6æF&÷‚&VÆöBà ¤f÷"F†R÷&F–æ'’†VÇF‡’×7F'BFW7BÂWfW'’÷F†W"6öæf–wW&VBÖöGVÆR6†÷VÆB&R'Vææ–ær&Vf÷&RF†Rw&VWF–ærV'2âFòæ÷B–çFVçF–öæÆÇ’FÖvRÆ—fR6×–vâFòf÷&6RF†Rf–ÇW&RFƒ²F†RWFöÖFVB†&æW726÷fW'2F†R&÷VæFVBv—BæBæÖVBÖ6ö×öæVçB&VgW6Ââ–b&VÂ7F'GWf–ÇW&RÇ&VG’W†—7G2Â72v†VâvVÆ6öÖT76—7B6¶—2F†Rw&VWF–æræBæÖW2F†R–æ7F—fR6ö×öæVçBFòF†RtÒà ¢222vVÆ6öÖT76—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  ¢ÒVæ&ÆVB÷'Vææ–ær7FFRg&öÒvÖ6öæf–rÖöGVÆW6°¢ÒvVÆ6öÖRÕ7FGW6÷WGWC°¢Ò6VÆV7FVBÖöFRÂFVÆ’Â†VFW"6WGF–ærÂæB7W7FöÒÖÆ—7B6÷VçC°¢Òv†WF†W"F†R7F–öâv2&Wf–WrÂÖçVÂææ÷Væ6RÂ÷"WFöÖF–27F'GW°¢Òv†WF†W"æ÷F†W"Væ&ÆVBvÖT76—7B6ö×öæVçBv2–æ7F—fS°¢ÒV&Æ–2æBtÒ×v†—7W"÷WGWC°¢ÒW†7B’6öç6öÆRW†6WF–öâ÷"v&æ–ærà ¥&W7F÷&RF†RFW6—&VB6×–vâw&VWF–ær6öæf–wW&F–öââÆVfRvVÆ6öÖT76—7BF—6&ÆVBv†VâF†R6×–vâFöW2æ÷B–çFVæBFòW6RWFöÖF–2w&VWF–æw2à ¢ÒÒĞ ¢27&÷72Ô6ö×öæVçB6†V6·0 ¢22W&Ö—76–öç0 ¢¢¥W'÷6S¢¢¢6öæf—&ÒtÒÖöæÇ’FÖ–æ—7G&F–öâ6ææ÷B&R'Vâ'’÷&F–æ'’Æ–W'2à ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’–bæòÆ–W"66÷VçB—2f–Æ&ÆS²&V6÷&B—B2VçFW7FVBà ¤g&öÒæöâÔtÒ66÷VçBÂG'“  ¦&öÆÃ#6†@¢v×7FGW0¢vÖ6öæf–rÖöGVÆW0¢6öæF—F–öâ6öæf–p¢6öæF—F–öâFB&öæP¢Fö¶VâÖ76—7B6öæf–p¢Fö¶VâÖ76—7BÒÖ–G2Dô´Tåô”BÒÖfÆ—6†÷væÖP¢–æ—BÕ% ¢vVÆ6öÖRÔææ÷Væ6P¢ç2Ö‡ÖÆÀ¢ç2ÖFVF‚ÖVF—@¦  ¥72v†VâtÒÖöæÇ’7F–öç2Fòæ÷BW†V7WFRf÷"F†RÆ–W"âFö¶Vä76—7B6†÷VÆB&VgW6RW‡Æ–6—BÔ”BF&vWF–ærv†–ÆRÆ–W'2Ö6âÖ–G6—2öfbÂ'WB6VÆV7FVB×Fö¶Vâ6öÖÖæG2&VÖ–âf–Æ&ÆRf÷"Fö¶Vç2F†RÆ–W"6öçG&öÇ2â–æ—F–F—fT76—7B6†÷VÆB&VgW6RÆ–W"&W&öÆÂöÖævVÖVçB6öÖÖæG2v†–ÆR7F–ÆÂÆÆ÷v–ær—G2V&Æ–2&öÆÂæB&öÆÂ÷F–öç2'WGFöç2f÷"6öçG&öÆÆVB6†&7FW'2à ¢22GWÆ–6FR–ç7FÆÆF–öà ¢¢¥W'÷6S¢¢¢6öæf—&ÒöæR6†B6öÖÖæB&öGV6W2öæR&W7öç6Rà ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—v†Vâ6öÖÖæG2&W7öæBGv–6Rà ¤–b6öÖÖæB&öGV6W2GWÆ–6FR÷WGWC  £â6†V6²F†RÖöBô’vRf÷"×VÇF—ÆRvÖT76—7B6÷–W2à£"â6†V6²f÷"öÆFW"7FæFÆöæR67&—G2F†B–×ÆVÖVçBF†R6ÖRfVGW&Rà£2â¶VWöæÇ’F†R–çFVæFVB–×ÆVÖVçFF–öâà£Bâ&W7F'BF†R6æF&÷‚æB&WVBF†R6öÖÖæBà ¥67&—G2F†B–æFWVæFVçFÇ’&W7öæBFò6öæF—F–öæ÷"Fö¶VâÖÖöFÂFW67&–&RF†R6ÖRÖ&¶W"6†ævW2ÂÖöF–g’F†R6ÖRå2…ö&"Â6öçG&öÂF†R6ÖRFö¶Vâ&÷W'F–W2÷"FVF‚ö6öæ6VçG&F–öâö6öæF—F–öâÖ&¶W'2Â&ö6W72F†R6ÖRæGW&Âv÷&¶fÆ÷rÂ÷"&Ww&—FRF†RæF—fRGW&âG&6¶W"Ö’6öæfÆ–7BWfVâv†VâF†V—"æÖW2F–ffW"âFö¶Vä76—7BFVÆ–&W&FVÇ’7W7VæG2öæÇ’—G2FW&V6FVBFö¶VâÖÖöFÆ–2v†Vâ7FæFÆöæRFö¶VäÖöB—2FWFV7FVBÂ'WBF†R7FæFÆöæR6÷’6†÷VÆB7F–ÆÂ&R&VÖ÷fVBf÷"æ÷&ÖÂcã‚ãW6RâW6R–æ—F–F—fT76—7Bö'6W'fW"ÖöFRv†Vâæ÷F†W"–æ—F–F—fR&öÆÆW"÷vç2–æ—F–F—fRfÇVW3²ÆVfR6öÖ&D76—7BF—6&ÆVBv†Vâæ÷F†W"Væ6÷VçFW"ÖævW"÷vç2GW&âGfæ6VÖVçB÷"&÷VæG2à ¢227FFR&V6÷fW' ¢¢¥W'÷6S¢¢¢6öæf—&Ò¶æ÷vâ7FFR6öçF–æW'26VÆbÖ†VÂv†–ÆRVæ¶æ÷vâ'&æ6†W2&R&W6W'fVBf÷"&Wf–Wrà ¢¢¥6¶—v†Vã¢¢¢6¶—–çFVçF–öæÂ7FFR6÷''WF–öâ÷WG6–FRF—7÷6&ÆRFW7B6×–vâà ¥6fR&Wf–Ws  ¦&öÆÃ#6†@¢v×7FGW0¢vÖÖWG&–70¢vÖ6öæf–rÆ—7@¦  ¤Fòæ÷B'VâvÖ6öæf–r6ÆVçWÖW&VÇ’FòFW7B—Bâ6ÆVçWFVÆWFW2Væ¶æ÷vâ÷"÷'†æVB7FFRävÖT76—7F'&æ6†W2gFW"W‡Æ–6—B6öæf—&ÖF–öâà ¢ÒÒĞ ¢2G&÷V&ÆW6†ö÷F–ær'’7–×FöĞ ¢22æ÷F†–ær&W7öæG0 £âv—Bf÷"F†RÖöB6æF&÷‚&W7F'Bà£"â6†V6²F†R’6öç6öÆRf÷"vÖT76—7B7–çF‚÷"&VfW&Væ6RW'&÷"à£2â6öæf—&ÒvÖT76—7B—2Væ&ÆVBà£Bâ&VÖ÷fRGWÆ–6FR÷"'&ö¶Vâ6÷–W2à£Râ&WG'’v×7FGW6à ¥6öÇfRF†R6÷&R&ö&ÆVÒ&Vf÷&RFW7F–ærÖöGVÆW2à ¢22öæRÖöGVÆR—26–ÆVç@ ¥'Vã  ¦&öÆÃ#6†@¢vÖ6öæf–rÖöGVÆW0¢vÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSà¢vÖVæ&ÆRÄÖöGVÆT÷%6W'f–6TæÖSà¦  ¤6†V6²F†R6öæf–wW&VB7FFRÂ'Vææ–ær7FFRÂW†7B6öÖÖæB7VÆÆ–ærÂæBFW7B×Fö¶VâVÆ–v–&–Æ—G’â&VBF†RVæ&ÆR&W7öç6R&Vf÷&R6†æv–ærÖ÷&R6WGF–æw2à ¢22Ö&¶W"WFöÖF–öâf–Ç0 ¥'Vã  ¦&öÆÃ#6†@¢v×7FGW2ÒÖFWF–Ç0¢vÖ6öæf–rvWBå476—7BFVDÖ&¶W ¢vÖ6öæf–rvWB6öæ6VçG&F–öä76—7BÖ&¶W ¢Fö¶VâÖ76—7BÒÖ†VÇ×7FGW6Ö&¶W'0¢6öæF—F–öâ7FGW0¢ç2ÖFVF‚ÖVF—@¢ç2ÖFVF‚×&W— ¢6öæ6VçG&F–öâÒ×7FGW0¦  ¤6†V6³  ¢ÒÖ&¶W%6W'f–6R—2Væ&ÆVBà¢ÒF†RffV7FVBÖöGVÆR—2'Vææ–ærà¢ÒF†RFö¶Vâ—2öâF†Rö&¦V7G2Æ–W"æB&W&W6VçG2F†R&–v‡B6†&7FW"à¢Òå476—7BFö¶Vç2†fRç3Óà¢ÒF†R6öæf–wW&VB'V–ÇBÖ–âÖ&¶W"Â7W7FöÒF—7Æ’æÖRÂ÷"W†7B7F÷&VBFrW†—7G2à¢ÒF†R…÷"6öæ6VçG&F–öâ÷WF6öÖR7GVÆÇ’&WVW7FVBF†RW‡V7FVBÖ&¶W"7FFRà ¥7FæFÆöæRFö¶VäÖöBW&Ö—76–öç2&Ræ÷B&W—"f÷"vÖT76—7BÖ&¶W"f–ÇW&W2–âcã‚ãà ¥7F÷FW7F–æræB&W÷'BF†R&Vf÷&RögFW"Ö&¶W"fÇVW2–bâVç&VÆFVBÖ&¶W"÷"çVÖ&W"6†ævW2à ¢22å2…FöW2æ÷B&öÆÀ ¤6öæf—&Ó  ¢ÒFö¶Vâ—26VÆV7FVB÷"öâF†R7W'&VçBÆ–W"vS°¢ÒFö¶Vâ—2öâF†Rö&¦V7G2Æ–W#°¢ÒFö¶Vâ&W&W6VçG26†&7FW#°¢Ò6†&7FW"†2ç3Ó°¢Ò6†&7FW"†2fÆ–Bç5ö‡f÷&×VÆÂ7V6‚2FC‚³†à ¢227&—D76—7BFöW2æ÷B&öÆÀ ¤6öæf—&Ó  ¢Ò7&—FgVÖ&ÆR†VÇ&W7öæG3°¢ÒF†RW†7B&WV—&VBF&ÆRW†—7G2æB†2â—FVÓ°¢ÒF†RF—&V7BF&ÆR6öÖÖæBv÷&·3°¢ÒWFöÖF–2FWFV7F–öâW6W27W÷'FVBFV×ÆFRv—F‚C#æGW&Âà ¢22VWVR÷"W'&÷"6÷VçG2–æ7&V6P ¥'Vã  ¦&öÆÃ#6†@¢v×7FGW2ÒÖFWF–Ç0¢vÖÖWG&–70¢vÖ6öæf–rÖöGVÆW0¦  ¥VWVRÆVæwF‚FW67&–&W2W‡Æ–6—BVWVVBv÷&²æBÖöGVÆRÆ–fV7–6ÆRG&ç6—F–öç2âF–ÖV÷WB6â&VÆV6RF†RVWVR'WB6ææ÷BFW&Ö–æFRVæFW&Ç––ær&öÆÃ#÷"¦f67&—Bv÷&²à ¥&V6÷&BWf–FVæ6R&Vf÷&R&W6WGF–ærÖWG&–72à ¢ÒÒĞ ¢2'Vr&W÷'BWf–FVæ6P ¥v†VâFW7Bf–Ç2Â&V6÷&C  ¢Ò²ÒvÖT76—7BfW'6–öâà¢Ò²Ò6ö×öæVçBæBçVÖ&W&VBFW7Bà¢Ò²ÒW†7B6öÖÖæB÷"Fö¶Vâ7F–öâà¢Ò²ÒW‡V7FVB&W7VÇBà¢Ò²Ò7GVÂ&W7VÇBà¢Ò²Òv×7FGW2ÒÖFWF–Ç6÷WGWBà¢Ò²ÒvÖ6öæf–rÖöGVÆW6÷WGWBà¢Ò²Ò&VÆWfçBvÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSæ÷WGWBà¢Ò²ÒW†7B’6öç6öÆRW'&÷"à¢Ò²ÒFö¶VâæÖRÂ”BÂÆ–W"ÂæBÆ–æ¶vRà¢Ò²Ò&VÆWfçB6†&7FW"GG&–'WFW2à¢Ò²ÒÖ&¶W"fÇVW2&Vf÷&RæBgFW"Âv†VâÆ–6&ÆRà¢Ò²Òv†WF†W"7FæFÆöæRFö¶VäÖöB÷"7FæFÆöæR7FGW4–æfòv2–ç7FÆÆVB÷"FWFV7FVBà¢Ò²Òv†WF†W"GWÆ–6FR÷"÷fW&Æ–ær67&—G2vW&R7F—fRà ¢ÒÒĞ ¢2&RÕ6W76–öâ6†V6° ¤–ÖÖVF–FVÇ’&Vf÷&R6W76–öã  ¦&öÆÃ#6†@¢v×7FGW0¢vÖ6öæf–rÖöGVÆW0¦  ¥F†Vâ'VâöæÇ’F†R&6–26†V6·2f÷"fVGW&W2F†R6W76–öâv–ÆÂW6S  ¢ÒÖ&¶W%6W'f–6S¢öæRF—7÷6&ÆRFVF‚÷&Wf—fÂÖ&¶W"7–6ÆRà¢Ò6öæf–uT“¢÷Vâ6WGF–æw2à¢Ò7&—D76—7C¢7&—FgVÖ&ÆR†VÇà¢Ò6öæF—F–öä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷Vâ6öæF—F–öæÂæB'Vâ6öæF—F–öâ7FGW6à¢ÒFö¶Vä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷VâFö¶VâÖ76—7B†VÇÂæBfÆ—öæR†&ÖÆW72f—6–&–Æ—G’6WGF–ærGv–6Rà¢Ò6öæ6VçG&F–öä76—7C¢6öæ6VçG&F–öâÒ×7FGW6à¢Òå476—7C¢ç2ÖFVF‚×&W÷'F²W6Rç2ÖFVF‚ÖVF—Fv†Vâ6†V6¶–ærÖ&¶W'2æB÷Vâ&W—"öæÇ’–bÖ—6ÖF6‚—2–çFVçF–öæÂà¢Ò…76—7C¢&öÆÂöæRF—7÷6&ÆR6VÆV7FVBå2à¢ÒFV'VuFööÇ3¢6¶—VæÆW72FVÆ–&W&FVÇ’æVVFVBà¢Ò–æ—F–F—fT76—7C¢÷Vâ–æ—BÔtÖv†Vâ&—fFRVæ6÷VçFW"6WGWv–ÆÂ&RW6VBà¢ÒvVÆ6öÖT76—7C¢v†VâVæ&ÆVBÂ&Wf–WrF†Rw&VWF–æræB6öæf—&Ò7FGW2&Vf÷&RF†R6W76–öã²Fòæ÷BW6RÖçVÂææ÷Væ6RÖW&VÇ’2†VÇF‚6†V6²à ¤Fòæ÷BF—66÷fW"Ö&¶W"Â…Â÷"F&ÆR&ö&ÆVÒf÷"F†Rf—'7BF–ÖRGW&–ær6öÖ&Bà