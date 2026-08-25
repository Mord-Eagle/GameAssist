# GameAssist v2.0.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v2.0.0. It covers suite-level GM/help navigation, the accepted 2014-sheet EffectAssist foundation and guarded Guidance candidate, guided HealAssist and AttackAssist workflows, the complete AlmanacAssist release track, the shared HealthService foundation, optional GM-private PC health alerts, and private ConcentrationAssist HP-loss offers while retaining the established component checks and the v1.8.2 NPCAssist naming and Bloodied regressions.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

---

## Focused v2.0.0 Suite Navigation Acceptance

**What this proves:** GameAssist has one predictable starting point for Game Masters, one help directory, and one progressive module navigator without replacing the modules' own controls.

**Why test it:** These buttons connect every feature. One incorrect destination can make a healthy module appear broken.

**Skip when:** Do not skip for v2.0.0 release acceptance or after changing command routing, module names, GM screens, or help screens. During ordinary troubleshooting, repeat only the affected destination.

Run:

```roll20chat
!GA-GM
!GA-DM
!ga-help
!ga-nav
!ga-nav effect
!ga-nav effect apply
!ga-nav hp
!gA gM
!GA dM
!Ga HeLp
!GA NaV effect apply
!GA STATUS --details
!ToKeN AsSiSt Gm
!condition-gm
!HP gm
!ConfigUI gm
!Welcome gm
!token
!Combat
!ConditionAssist
!InitiativeAssist
!WelcomeAssist
!NPCAssist
!EffectAssist
!HealAssist
!AttackAssist
!AlmanacAssist
!HPAssist
!DebugTools
!token-assist actions
```

**Pass when:**

- `!GA-GM` and `!GA-DM` open the same private control center with all fifteen feature modules organized into readable groups;
- an enabled module button opens that module's own primary GM screen exactly once;
- every primary module GM screen includes **GameAssist Home**, and that button returns to the suite control center;
- `!ga-help` lists all fifteen help destinations; an enabled module opens its own help, while a disabled module still opens a concise purpose-and-enable screen instead of a dead command;
- `!ga-nav` lists all modules, `!ga-nav hp` shows HPAssist's destinations directly, and `!ga-nav effect` first shows EffectAssist sections before `!ga-nav effect apply` shows that section's controls;
- a disabled module offers **Enable** rather than a dead feature button, and an enabled module that failed to start offers **Check Status**;
- mixed capitalization and space/hyphen variants such as `!gA gM`, `!GA dM`, `!Ga HeLp`, and `!GA NaV effect apply` behave like their canonical button forms and trigger exactly once;
- `!GA STATUS --details` preserves the option and opens detailed status, while `!ToKeN AsSiSt Gm`, `!condition-gm`, and `!HP gm` reach their intended module screens;
- each bare short or full module name reaches that module's established GM screen, player screen, or disabled-module recovery panel instead of remaining silent;
- the suite navigator, ConfigUI, ConditionAssist, TokenAssist, and WelcomeAssist's private controls use the same readable Roll20 default-template presentation as HPAssist and CombatAssist rather than separate white, pink, or purple control-panel styles;
- TokenAssist's ordinary GM screen includes **More Actions**, and that button or `!token-assist actions` opens one organized extended library with grouped token operations and a return to GM Controls;
- WelcomeAssist's public greeting card may remain visually distinct because it is table content rather than a private control interface;
- none of these commands posts publicly or exposes another module's protected controls to players.

---

## Focused v2.0.0 HealthService Acceptance

**What this proves:** HealthService recognizes supported official 2014 PC and linked-NPC HP surfaces, collapses matching linked sheet/token notifications into one transition, records GameAssist-owned writes with verified provenance, and leaves unexplained changes classified as unknown.

**Why test it:** Later concentration offers, healing tools, damage timelines, and PC alerts need one dependable HP signal. This test confirms the shared signal without asking HealthService to guess who attacked, what caused the change, or how temporary HP and resistance should be adjudicated.

**Skip when:** Do not skip for the Issue #83 checkpoint or v2.0.0 release acceptance. After release, campaigns that deliberately disable HealthService and do not use provenance-aware integrations may skip it.

### Preparation

Use a disposable page with:

- one linked official D&D 5E by Roll20 2014 PC token whose bar 1 is linked to the sheet's `hp` attribute;
- one linked NPC token with `npc=1`, valid character HP, and a valid `npc_hpformula`;
- one disposable token on the same page that does not represent a character;
- HealthService and HPAssist enabled;
- known positive current and maximum HP on both test characters.

Run:

```roll20chat
!ga-health
!ga-health audit
```

Pass when the private status identifies HealthService 1.1.0 as enabled and the read-only audit counts both supported tokens. Unlinked tokens, unsupported sheets, and unlinked 2014-PC bars may be counted as not included; that is not a failure.

### Shared NPC HP Bar Setup

1. Record the currently selected NPC HP bar and the disposable linked NPC token's values in all three bars.
2. Run `!ga-health bars` and choose a different disposable bar, preferably Bar 2 or Bar 3.
3. Click **Audit**. Confirm the linked NPC is either ready or clearly listed as needing setup, and the unlinked token is named under **Not Representing A Character**.
4. Click **Prepare Linked NPCs**. Confirm the preview explains that character HP will be copied independently and that the selected bar's sheet link will be cleared.
5. Click **Confirm Current Page**.

Pass when the selected bar receives the linked NPC character's current and maximum HP, the other two bars remain unchanged, and the unlinked token is not modified. Open `!NPC-GM` and `!HP-Settings`; both must name the same selected bar.

On the linked NPC, lower the selected bar to 0 and then restore it above 0. Pass when NPCAssist applies and removes the configured death marker using that selected bar. Then run `!HP-Selected`; pass when HPAssist writes current and maximum HP to the selected bar only. Restore the campaign's original shared bar after completing this focused suite.

### Unknown Observation and Linked Deduplication

1. Note the recent-transition count shown by `!ga-health`.
2. Change the test PC's current HP once through the character sheet, from one valid number to a lower valid number.
3. Wait for the linked token bar to finish updating.
4. Run:

```roll20chat
!ga-health recent
```

Pass when exactly one new entry describes the PC's old and new HP, labels the classification **unknown**, and identifies it as **Observed in Roll20; source not identified**. One direct sheet edit must not appear as separate sheet and token events. HealthService may still drive supported threshold alerts and concentration offers from the decrease; it does not invent an attacker, damage type, resistance result, or temporary-HP history.

### Verified HPAssist Write

Select the linked NPC and run:

```roll20chat
!HP-Selected
!ga-health recent
```

Pass when HPAssist still rolls and writes current/maximum HP to the selected shared NPC bar, and the newest evidence identifies an **HPAssist verified write**. A blank or invalid starting value should be classified as initialization; replacing an already valid value may be classified as synchronization.

### Clearing and Invalid Evidence

On the disposable NPC token, change the selected shared bar's current HP to blank, then to nonnumeric text. Run `!ga-health recent` after each change.

Pass when blank HP is recorded as **clearing**, nonnumeric HP is recorded as **invalid**, and neither entry is called damage or healing. Restore valid positive HP afterward.

### GM-Private PC Health Alerts

Open the protected alert controls:

```roll20chat
!ga-health alerts
```

Pass when the screen says alerts are off by default, all three standard thresholds are selected, exact HP is hidden, and **Preview Alert** is available. The HealthService card in `!ga-config ui` should also provide **Manage PC Health Alerts**.

1. Click **Preview Alert**. Confirm that only the GM receives one clearly labeled example and no character HP changes.
2. Turn alerts on and leave 50%, 25%, and 10% enabled.
3. Set the disposable 2014 PC to `100 / 100` HP, then lower current HP directly to `5`.
4. Confirm that the GM receives one notice containing all three crossed bands, while the player receives nothing and exact HP is not shown.
5. Lower HP again while it remains below 10%. Confirm that no second alert appears.
6. Heal the PC above 50%, then lower HP to 49%. Confirm that the 50% notice appears again.
7. Turn off the 50% threshold, heal above 50%, and cross it again. Confirm that it remains silent while enabled lower thresholds still work.
8. Turn on **Show Exact HP**, rearm a threshold through healing, and cross it. Confirm that the private notice now includes the before, after, and maximum HP values.
9. Lower a linked NPC across the same percentages. Confirm that no PC health notice appears; NPCAssist retains its separate NPC Bloodied setting.

Initialization, synchronization, blank or invalid HP, and a simultaneous maximum-HP change should not generate a PC threshold alert. The notice reports a health-band crossing only; it does not claim an attacker, damage type, resistance result, or reason for the HP change.

### Disable, Fallback, and Restart

Run each command only after the previous response appears:

```roll20chat
!ga-disable HealthService
!ga-config modules
!HP-Selected
!ga-health
!ga-enable HealthService
!ga-health
```

Pass when HealthService disables without disabling HPAssist, HPAssist retains its established direct HP-roll behavior, and no shared evidence or PC alert is produced while the service is off. If PC alerts remain configured on, `!ga-health alerts` should say that HealthService is disabled instead of claiming the alerts are ready. Re-enabling restores observation without duplicating listeners.

Restart the Roll20 Mod sandbox and run `!ga-health` again. Pass when HealthService is enabled, the recent count has reset because evidence is intentionally sandbox-local, and subsequent supported changes are observed once.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| Supported 2014 PC and NPC surfaces recognized | ☐ Pass ☐ Fail |
| Bar 1/2/3 choice, current-page audit, independent preparation, and shared module use pass | ☐ Pass ☐ Fail |
| One linked sheet edit produces one unknown transition | ☐ Pass ☐ Fail |
| HPAssist write is declared and verified | ☐ Pass ☐ Fail |
| Clearing and invalid values remain non-causal evidence | ☐ Pass ☐ Fail |
| PC alert controls, preview, GM-only delivery, combined crossings, rearming, and exact-HP option pass | ☐ Pass ☐ Fail |
| NPCs and non-comparable HP changes remain outside PC alerts | ☐ Pass ☐ Fail |
| Disable preserves HPAssist fallback and re-enable does not duplicate listeners | ☐ Pass ☐ Fail |
| Sandbox restart clears bounded evidence and restores observation | ☐ Pass ☐ Fail |

---

## Focused v2.0.0 Concentration HP-Loss Offer Acceptance

**What this proves:** ConcentrationAssist offers one private, correctly calculated check after supported HP loss, distinguishes verified damage from an unexplained decrease, and refuses buttons that are stale, reused, unauthorized, or no longer relevant.

**Why test it:** The feature joins real Roll20 HP changes, linked-bar deduplication, marker state, controller permissions, hidden-token privacy, and asynchronous chat buttons. A normal manual concentration roll does not exercise those boundaries.

**Skip when:** Do not skip for Issue #79 or v2.0.0 release acceptance. After release, skip only when ConcentrationAssist is unused or **HP-Loss Check Offers** are deliberately off.

### Preparation

Use a disposable page with:

- one linked official 2014 PC whose bar 1 is linked to the sheet `hp` attribute and controlled by a separate non-GM test player;
- one linked NPC on the Objects layer and one linked NPC on the GM layer;
- valid positive HP and maximum HP;
- the configured concentration marker available; on a fresh campaign this is Roll20's built-in `stopwatch` marker;
- MarkerService, HealthService, and ConcentrationAssist enabled.

Open `!concentration settings`. Pass when **HP-Loss Check Offers** is **On** and the GM can turn it off without disabling ConcentrationAssist. From the non-GM test player, the same screen must identify the choice as GM-managed and a crafted config command must be refused.

### Direct PC HP Loss and Deduplication

1. Put the configured concentration marker on the PC token.
2. Note the PC's HP, then lower it once through the character sheet by `12`.
3. Wait for the linked token bar to finish updating.

Pass when the GM and controlling player each receive one private **Concentration Check Available** panel showing:

- **Observed HP Loss: 12** rather than claiming a known damage source;
- **DC: 10**;
- Normal, Advantage, and Disadvantage buttons.

The unrelated test player must receive nothing, and the linked attribute/bar update must not create a second logical offer for either recipient.

Click **Advantage** as the controlling player. Pass when the result shows both d20 values, the kept result, the Constitution save bonus, and the complete formula. Click the same offer again; pass when it says the offer expired or was already used and does not roll twice.

**Duplicate-token regression:** Leave one stale or off-page token for the same character marked as Concentrating, while the current encounter-page token is also marked. Lower HP on the current-page token. Pass when ConcentrationAssist selects the current-page representation and offers one check instead of reporting multiple possible tokens. Then remove concentration from the current-page token and lower that character's HP again. Pass when no concentration offer or ambiguity warning appears.

### Verified GameAssist Damage

Enable DebugTools, select the concentrating Objects-layer PC or NPC, and run:

```roll20chat
!ga-debug damage --amount 12
!ga-debug damage --amount 12 --apply
```

The first command must remain a dry run. The applied command should create one private offer labeled **Damage: 12**, and `!ga-health recent` should identify a declared-and-verified DebugTools damage write. Disable DebugTools after this check.

### Stale and Ended Offers

Create a fresh offer by lowering linked PC HP once through the character sheet. Allow Roll20's linked bar update to finish, but make no second HP change, then use the original offer. Pass when the check rolls normally; equivalent sheet and linked-token evidence for the same resulting HP must not invalidate it.

Create a new offer, but change HP again before clicking it. Pass when the older button says HP changed again and does not roll.

Create another offer, remove the Concentrating marker, then click. Pass when the private response says the character is no longer concentrating and does not restore the marker or roll.

### Silent Changes

While the token is concentrating, confirm that each of these produces no offer:

- increasing HP;
- clearing HP or entering invalid text;
- an HPAssist initialization or synchronization write;
- changing HP on a character that is not concentrating.

Restore valid HP after the check.

### Hidden NPC Privacy

Put the configured concentration marker on the GM-layer NPC and lower its valid selected-bar HP once. Pass when only the GM receives the offer. After the GM clicks a roll mode, no public emote or hidden NPC name appears in player chat.

### Optional Integration and Manual Fallback

Turn **HP-Loss Check Offers** off in `!concentration settings`, lower HP, and confirm no offer appears. Then run a normal selected-token `!concentration --damage 8 --mode normal`; it must still work.

Turn offers back on, disable HealthService, and repeat those two checks. The automatic offer must remain off while the manual command still works. Re-enable HealthService afterward.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| Direct linked PC loss creates one logical private offer | ☐ Pass ☐ Fail |
| Controller and unrelated-player privacy are correct | ☐ Pass ☐ Fail |
| Unknown loss and verified damage use different accurate labels | ☐ Pass ☐ Fail |
| DC and normal/advantage/disadvantage evidence are correct | ☐ Pass ☐ Fail |
| Reused, stale, unauthorized, and ended-concentration buttons refuse safely | ☐ Pass ☐ Fail |
| Healing, setup, synchronization, invalid, and unrelated changes stay silent | ☐ Pass ☐ Fail |
| GM-layer identity and result remain GM-only | ☐ Pass ☐ Fail |
| Setting/service opt-out preserves manual concentration checks | ☐ Pass ☐ Fail |

---

## Focused v2.0.0 HealAssist Acceptance

**What this proves:** HealAssist guides official-2014 normal or maximum healing from an authorized source, supports review or optional automatic application, and verifies every accepted write through HealthService.

**Why test it:** Healing combines player permissions, native target prompts, private NPC information, formula rules, maximum-HP limits, stale-button protection, and multi-target writes. A normal sheet roll does not prove those safeguards.

**Skip when:** Do not skip for Issue #84 or v2.0.0 release acceptance. After release, skip only when HealAssist remains deliberately disabled.

### Preparation

Prepare:

- one linked official 2014 PC healer controlled by a separate non-GM test player, with nonzero Intelligence, Wisdom, and Charisma modifiers;
- one damaged linked 2014 PC on the Objects layer that the test player does not control;
- a second damaged linked 2014 PC for multi-recipient healing;
- one damaged linked NPC on the Objects layer and, when practical, one on the GM layer;
- valid current and maximum HP on every recipient;
- HealthService enabled and HealAssist enabled through `!ga-enable HealAssist`.

Run `!Heal-GM`, `!Heal-Guide`, `!Heal-Status`, and `!Heal-Audit`. Pass when the Control Center is private, the Guide identifies the short path, Status reports HealthService available, and Audit explicitly says it is read-only.

### Player Heals a Visible PC

1. As the non-GM player, run `!Heal`.
2. Choose the controlled healer and **Cure Wounds**.
3. Choose a slot level and the intended casting ability.
4. Use Roll20's target prompt to choose the visible damaged PC that the player does not control.

Pass when Cure Wounds opens the native target prompt directly after its required choices, without showing a separate **Choose Recipients** or **Choose 1 Recipient** screen. HealAssist must accept the visible PC without granting token control and produce one private review containing:

- every raw healing die and the complete formula;
- the recipient's current HP, proposed HP, and maximum HP;
- the amount that will actually be restored;
- a reminder that the spell slot remains a manual sheet responsibility.

The recipient's HP must remain unchanged before confirmation. Click **Apply Healing** once; pass when the reviewed value is written, `!ga-health recent` identifies a declared-and-verified HealAssist healing operation, and the same button cannot apply the heal again.

### Maximum HP and Public Result

Set a PC one point below maximum, choose a healing action capable of restoring more than one point, and confirm it. Pass when proposed HP stops at maximum and the public result, when public results are enabled, reports only the amount actually regained.

Run `!Heal-Results private` and repeat a small PC heal. Pass when no public completion message appears. Restore the campaign's preferred result setting afterward.

### Maximum Healing and Automatic Application

1. Run `!Heal-Max` and choose a potion or spell whose dice maximum is easy to verify.
2. Continue to one damaged supported recipient.
3. Pass when a potion or other one-recipient action goes directly to the target prompt, the displayed formula is identified as maximum healing, every die contributes its maximum value, and the proposed HP still stops at the recipient's maximum.
4. Run `!Heal-Auto on`, damage the recipient again, and repeat one normal or maximum healing action.
5. Pass when the verified HP change is applied immediately after recipient selection without an **Apply Healing** confirmation screen.
6. Run `!ga-health recent` and confirm the newest entry identifies HealAssist as a verified healing writer.
7. Restore the safer default with `!Heal-Auto off` and confirm `!Heal-GM` says **Review first**.

If an automatic application fails naturally, pass only when the GM receives a private explanation and no success message claims that HP changed. Do not manufacture a destructive failure in a live campaign.

### Manual Formula Boundary

Choose **Manual Healing Formula** and test a simple formula such as `2d6+3`. Pass when the review names that exact formula and reminds the table to resolve its resource manually.

Start again and try an expression containing attributes, roll queries, keep/drop operators, multiplication, or another compound expression. Pass when HealAssist refuses it before rolling or changing HP and retains a clear Start Again route.

### Stale and Single-Use Confirmation

Create a valid healing review, then change the recipient's current HP manually before clicking confirmation. Pass when HealAssist refuses the stale review, does not roll again, and does not overwrite the newer HP.

Create another review and use its confirmation successfully. Click it again. Pass when the second click is refused without another write.

### NPC and Hidden Placement Request

As the non-GM player, begin a healing action and choose the path for a recipient the player cannot place directly. Pass when the request is retained privately for the GM and neither the NPC's name nor HP appears publicly or in the player's review.

As the GM, open `!Heal-Requests`, choose the request, select the intended NPC, and continue through review and confirmation. Pass when the NPC's selected shared HP bar receives the verified value and all NPC roll, HP, and completion evidence remains private. Repeat with a GM-layer NPC when practical.

### Multi-Recipient Healing

Choose Prayer of Healing, Mass Healing Word, or Mass Cure Wounds and select two damaged PCs. Pass when one roll is used for both recipients, each proposed value is capped independently, and neither HP value changes before confirmation. After confirmation, both recipients must match the accepted review.

The maintainer harness simulates a failure on the second HealthService write and verifies that HealAssist attempts a checked synchronization rollback of the first recipient. A live failure does not need to be manufactured destructively; if one occurs naturally, treat any recipient that does not return to its reviewed starting value as a release blocker.

### Player Lockout and Service Lifecycle

Run `!Heal-Players off` as the GM. The player may still open guidance, but cannot begin or complete a healing action; GM healing remains available. Run `!Heal-Players on` to restore the player path.

Disable HealthService. Pass when HealAssist also stops, reports the dependency through `!ga-config modules`, and unrelated modules remain available. Re-enable HealthService and HealAssist, then confirm one fresh healing workflow works without duplicate messages or writes.

Restart the sandbox. Pass when settings persist, pending requests and confirmation buttons expire, no HP changes occur during startup, and a new workflow succeeds.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| GM controls, Guide, Status, Audit, and manual are readable and private where expected | ☐ Pass ☐ Fail |
| One-recipient actions bypass the redundant count menu and a controlled player healer can target a visible non-controlled PC | ☐ Pass ☐ Fail |
| Roll detail, formula, current/proposed/maximum HP, actual gain, and manual resource step are accurate | ☐ Pass ☐ Fail |
| HP remains unchanged before confirmation and the accepted write has verified HealthService provenance | ☐ Pass ☐ Fail |
| Maximum-HP cap and public/private result policy are correct | ☐ Pass ☐ Fail |
| Maximum-healing formulas and optional automatic verified application are correct | ☐ Pass ☐ Fail |
| Bounded manual formula works and unsafe expressions are refused | ☐ Pass ☐ Fail |
| Stale, reused, fabricated, expired, and wrong-player actions refuse without another write | ☐ Pass ☐ Fail |
| NPC, hidden, GM-layer, and off-page requests remain private and GM-reviewed | ☐ Pass ☐ Fail |
| Multi-recipient healing uses one review and produces no silently accepted partial result | ☐ Pass ☐ Fail |
| Player lockout, HealthService cascade, re-enable, and restart behavior pass | ☐ Pass ☐ Fail |

---

## Focused v2.0.0 AttackAssist Acceptance

**What this proves:** AttackAssist guides an authorized official-2014 PC through one exact repeating attack and a native target choice, then submits with the sheet setting by default or presents roll-mode choices when the GM enables review.

**Why test it:** The workflow combines stable repeating-row identity, player control, Roll20 target prompts, hidden-token privacy, official roll-mode fragments, CritAssist observation, and expiring one-use buttons. A normal character-sheet click does not prove those boundaries.

**Skip when:** Do not skip for Issue #87 or v2.0.0 release acceptance. After release, skip only when AttackAssist remains deliberately disabled.

### Preparation

Prepare:

- one linked official D&D 5E by Roll20 2014 PC token controlled by a separate non-GM test player;
- at least two repeating attacks on that character, including two rows with the same display name when practical;
- one visible target token the player does not control;
- one hidden, GM-layer, or off-page target for the private-request check;
- one supported 2024 character token for the refusal check;
- CritAssist enabled and AttackAssist enabled through `!ga-enable AttackAssist`.

Run:

```roll20chat
!Attack-GM
!Attack-Guide
!Attack-Status
!Attack-Audit
!Attack-Manual
```

Pass when the Control Center is private, says **Before Each Roll: Immediate sheet setting**, and provides an **Enable Review** control. The Guide must give the short player path, Status must report player access and pending choices, Audit must explicitly say it is read-only, and the manual must create or update `GameAssist Guide - AttackAssist`.

### Visible Target and Stable Attack Row

1. As the non-GM player, select the controlled 2014 PC and run `!Attack`. Repeat once with `!attack-menu`.
2. Find the intended repeating attack. When two rows share a name, use the numbered labels to distinguish them.
3. Click **Choose Target** beside that attack and point at the visible target the player does not control.

Pass when both starting commands open the same compact source/attack path, neither produces a bare `{}`, Roll20 opens its native target prompt only after **Choose Target** is clicked, and the target is accepted without granting control. With the default setting, no Review Attack screen should appear: the familiar official attack card, including its actual attack roll, should appear once as the attacking character using the sheet setting. AttackAssist may follow it with one compact submission notice. The Roll20 API log must not report a missing `d20`, `atkcritrange`, `atkflag`, `dmgflag`, `dmg2flag`, `saveflag`, `charname_output`, roll-mode, empty global-modifier attribute, or dice-parser `?` syntax error. Confirm the chosen row's bonus, range, and damage links match the numbered attack selected. The target's HP, markers, position, effects, conditions, and Roll20 Turn Tracker must remain unchanged.

Run `!Attack-Review-Mode on`, repeat the attack and target choice, and pass when the Review Attack screen now offers **Use Sheet Setting**, **Normal**, **Advantage**, and **Disadvantage**. Use one roll button, then click that same button again. Pass when the second click is refused without another roll or announcement.

### Roll Modes and Sheet Preservation

With review still enabled, set the Classic character sheet to **Query Whisper** and **Query Advantage**, then repeat the same disposable attack through **Use Sheet Setting**, **Normal**, **Advantage**, and **Disadvantage**. Pass when:

- **Use Sheet Setting** safely uses Public and Normal, the first choices documented by the Classic sheet, because API-authored chat cannot open those per-roll client prompts;
- Normal rolls one d20;
- Advantage shows two d20s and keeps the higher result;
- Disadvantage shows two d20s and keeps the lower result;
- none of the four choices reports a missing documented optional sheet field such as `d20` or `atkcritrange`;
- no unresolved `?{...}` prompt or dice-parser syntax error appears and the Mod sandbox remains running;
- the character's saved roll-mode setting is unchanged after every test.

Run `!Attack-Review-Mode off` after the mode checks. Pass when `!Attack-GM` again reports **Immediate sheet setting** and the next disposable attack bypasses review.

Use a normal 2014 attack whose critical range and attack-template checkboxes have never been edited or separately saved. Pass when AttackAssist uses the Classic sheet's ordinary defaults: critical range 20, attack and first damage enabled, second damage and save disabled. The attack must roll normally without asking the GM to open and save unchanged defaults. If a custom attack contains another interactive query, or an incomplete formula references a genuinely unknown field, pass when AttackAssist names the prompt or field in a **Needs Attention** panel before submission instead of allowing a sandbox exception.

### 5th Edition OGL Companion Coexistence

**Skip when:** The campaign does not use **5th Edition OGL by Roll20 Companion**.

With the Companion installed, make one disposable native Classic-sheet attack and one AttackAssist attack. Pass when the native sheet attack follows the Companion's configured ammunition or spell-slot behavior, while the API-originated AttackAssist roll appears once without a second Companion resource change. Then use only one automatic NPC HP owner: disable Companion automatic NPC HP behavior or disable the overlapping GameAssist HP feature before placing a disposable NPC. Any duplicate resource or HP processing is a failure.

### CritAssist Natural 1 Delivery

With CritAssist enabled, use the disposable attack until its official first d20 is a natural 1. Pass when CritAssist opens its established Natural 1 workflow exactly once for that attack. The later attacker/target announcement must not trigger another fumble response.

### Stale Row and Wrong Player

Open an attack menu, then rename, remove, or structurally change that repeating row before using the older button. Pass when AttackAssist asks for a fresh choice and does not roll the previous formula.

Enable review again, open another valid review as the test player, then have a different player use its generated roll command. Pass when the second player is refused and the rightful player can still use a fresh review. Restore immediate sheet-setting mode afterward.

### Hidden or Off-Page Target Privacy

As the non-GM player, begin an attack and choose **Ask The GM**. Pass when the player receives a neutral confirmation that does not name any hidden target.

As the GM, open `!Attack-Requests`, choose the retained request, select the hidden, GM-layer, or off-page target, and complete the roll. Pass when the roll and target completion remain GM-private. The requesting player may receive a completion notice, but it must not reveal the hidden target's identity or placement.

### Unsupported Source, Lockout, and Lifecycle

Select the supported 2024 test token and run `!Attack`. Pass when AttackAssist explains that 1.1.0 supports official-2014 repeating attacks and that the native 2024 attack buttons remain available.

Run `!Attack-Players off`. Pass when the player can still read guidance but cannot begin or complete a guided attack; GM attacks remain available. Restore `!Attack-Players on` afterward.

Disable and re-enable AttackAssist. Pass when unrelated modules remain active, old flow/request/roll buttons expire, and one fresh workflow succeeds without duplicate messages. Restart the sandbox and confirm the configured player-access choice persists while pending transient choices do not.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| GM controls, Guide, Status, Audit, and manual are readable and private where expected | ☐ Pass ☐ Fail |
| Controlled 2014 PC and exact repeating row are verified, including duplicate display names | ☐ Pass ☐ Fail |
| Visible non-controlled target is accepted without changing target or encounter state | ☐ Pass ☐ Fail |
| Default sheet-setting submission bypasses review; optional Sheet, Normal, Advantage, and Disadvantage review works without a saved-setting mutation | ☐ Pass ☐ Fail |
| Unsaved documented optional fields use their safe sheet defaults; unknown missing fields refuse before submission | ☐ Pass ☐ Fail |
| One accepted roll and one post-roll announcement occur; reused buttons cannot roll again | ☐ Pass ☐ Fail |
| A natural 1 reaches CritAssist exactly once | ☐ Pass ☐ Fail |
| Stale-row and wrong-player buttons refuse safely | ☐ Pass ☐ Fail |
| Hidden, GM-layer, and off-page target identity remains private and GM-reviewed | ☐ Pass ☐ Fail |
| 2024 refusal, player lockout, disable/re-enable, and restart behavior pass | ☐ Pass ☐ Fail |

---

## Focused v2.0.0 EffectAssist Acceptance

**What this proves:** EffectAssist coordinates its focused six-effect launch catalog, applies verified 2014-sheet modifiers where available, authorizes player casting from controlled sources, links concentration-dependent effects to their source, keeps overlapping sources separate, preserves pre-existing campaign state, and repairs only a freshly confirmed safe mismatch.

**Why test it:** v2.0.0 introduces durable effect records and ownership across tokens, concentration, and repeating character-sheet rows. Roll20 must confirm real 2014-sheet worker behavior, token selection, marker storage, module toggles, chat buttons, and persistent state.

**Skip when:** Do not skip this section for v2.0.0 release acceptance. After release, a campaign that keeps EffectAssist disabled may skip it. Campaign updates using EffectAssist should always test Bless, concentration cleanup, overlap, audit, and disable/re-enable; the remaining catalog entries may use the shorter coverage pass below.

### Preparation

Use one disposable page with:

- two linked source tokens representing different official D&D 5E by Roll20 2014 PC sheets;
- a second token representing the first source character, placed on a different visible layer when practical;
- three linked 2014 PC target tokens on the Objects layer;
- one linked NPC target token for fallback behavior;
- one unlinked token;
- MarkerService enabled;
- ConditionAssist enabled for its optional projection check.

EffectAssist begins disabled. Confirm that before changing anything:

```roll20chat
!ga-config modules
!ga-enable EffectAssist
!effect
!Effect-Guide
!Effect-GM
!Effect-Status
!Effect-Audit
```

**Pass when:**

- the initial module list shows EffectAssist configured off and paused;
- enabling it changes only EffectAssist's lifecycle state;
- `!effect` opens the catalog directly, while Guide and GM controls remain compact and understandable;
- Status reports zero active effects on a clean state;
- Audit explicitly reports that it changed nothing.

### Complete Bless Lifecycle

1. Select the linked target token.
2. Run `!effect`.
3. Click **Bless**.
4. Choose the first linked source in the source prompt.
5. With the default settings, confirm the effect applies immediately after choosing the source; no redundant review screen or concentration-replacement question appears.
6. Open the target's 2014 sheet and inspect its global attack and saving-throw modifiers.
7. Roll one supported attack and one saving throw immediately, without opening the sheet and toggling either GameAssist row.
8. Confirm the **Effect Applied** result includes **End Effect**, then run `!Effect-Status`.

**Pass when:**

- one active Bless instance names the chosen source and target;
- the target has the configured Blessed marker;
- the target sheet has one active `Bless (GA)` attack row with `1d4` and one active `Bless (GA)` saving-throw row with `1d4`, and both bonuses roll on the first supported check without manually toggling the sheet fields;
- the source has the configured concentration marker and ConcentrationAssist reports it as concentrating;
- unrelated markers, HP, bars, layer, controllers, character attributes, and Turn Tracker rows are unchanged;
- the application result offers an End Effect button without requiring the GM to type the internal instance ID;
- Status remains a compact summary rather than printing the complete active and ended history.

Clear concentration from the source with ConcentrationAssist. Pass when the Bless instance ends, the target marker and both unedited GameAssist sheet rows are removed, unrelated sheet rows remain, and the next attack/save rolls contain no Bless die. The removed GameAssist rows must not continue contributing until the user manually recreates or toggles anything.

### Three Recipients and Exact Source Token

1. Run `!Bless`, choose **3 Recipients**, and select the three linked 2014 tokens.
2. Confirm all three receive the Blessed marker and owned sheet rows.
3. Repeat with one selected token deliberately left unlinked, then with a token whose saved character was deleted.
4. When the source character has two tokens, verify the caster choices distinguish the exact token and layer. Choose one source token.
5. Remove concentration from the other token representing that character, then from the chosen source token.

**Pass when:** ordinary unique caster buttons show only the useful token or character name; only duplicate visible labels add concise character, layer, and token-reference details. All three valid recipients apply atomically; an invalid request names every affected token and distinguishes an empty **Represents Character** setting from a stale character link; clearing the other source token does nothing; clearing the exact chosen source ends Bless and cleans only the final unneeded EffectAssist-owned projections.

### Launch Catalog Coverage

Apply each remaining catalog effect once to disposable tokens through `!Effect-Catalog`:

| Effect | Confirm before ending it |
| --- | --- |
| Guidance | Target marker, source concentration, and one active `Guidance (GA)` `1d4[GameAssist Guidance]` global skill row exist; the preview explains that unsupported or non-skill checks retain the manual **Use Guidance** path. |
| Warding Bond | Target marker plus `Warding Bond (GA)` `+1` AC and save rows exist; no concentration marker is added. |
| Holy Weapon | Its distinct target marker and source concentration are active; it must not reuse Bless's marker, and no global damage row changes every weapon. |
| Haste | Target marker, `Haste (GA)` `+2` AC row, and source concentration are active. |
| Pass Without a Trace | Target marker and source concentration are active; the preview identifies the `+10` Stealth step. |

End each effect from its **Effect Applied** panel or `!Effect-Active`. Pass when every owned marker and unedited sheet row clears, concentration clears only when it belongs to that effect, and the assisted instructions remain readable.

Confirm the catalog visibly separates Bless, Guidance, Warding Bond, and Haste under **Marker + Supported Sheet Automation** from Holy Weapon and Pass Without a Trace under **Tracked Marker; Rules Stay Manual**. Gift of Alacrity, Longstrider, and Beacon of Hope should not appear as built-in launch buttons.

### Guidance Consumption — Issue #85

Use a disposable official D&D 5E by Roll20 2014 PC target and a separate source. Apply Guidance, then confirm the target sheet contains one active `Guidance (GA)` global skill row whose value is exactly `1d4[GameAssist Guidance]`.

1. Roll an ordinary skill from that target's sheet while controlled by the GM or the character's player.
2. Reapply Guidance and roll a supported skill with advantage.
3. Reapply Guidance and roll a supported skill with disadvantage.
4. Roll an unrelated check containing another d4 while Guidance is active.
5. Use a non-skill ability check or another unsupported roll template while Guidance is active.
6. Create ambiguity with two eligible active Guidance records for the same target only if the ordinary UI permits it; otherwise inspect the manual fallback through **Active Effects**.
7. Edit the owned Guidance row before rolling, then repeat the check.
8. Click an old **Use Guidance** button after the matching instance has already ended.

**Pass when:** each supported normal, advantage, and disadvantage skill check ends exactly one matching Guidance instance and removes only its owned marker, unedited row, and source concentration. The unrelated d4, unsupported check, ambiguous state, edited row, and stale button do not end or alter anything automatically. Those cases retain a clear **Use Guidance** or audit path. A newly reapplied Guidance can be consumed immediately even when the character repeats the same skill check.

### Player Casting, GM Requests, and Lockout

Use a separate non-GM player login with two linked character tokens that player controls. Keep one visible linked recipient controlled by someone else and one disposable linked recipient on the GM layer.

1. As the player, run `!Bless` without selecting a recipient first. Confirm the first compact screen asks only for the caster and never produces a bare `{}`.
2. Choose the intended caster. Confirm the second compact screen offers **1 Recipient**, **2 Recipients**, **3 Recipients**, and **Higher Level Casting**.
3. Click **1 Recipient**. Confirm Roll20 opens its native target prompt only after the button is clicked, then point at the visible linked recipient on the map.
4. Start again, choose **Higher Level Casting**, and confirm a separate screen offers every recipient total from 4 through 11. Use one disposable higher-level total and complete every target prompt.
5. Confirm the default path applies after the source and recipient choices without an extra review click.
6. Confirm the public announcement appears only after application and the private result includes **End Effect**.
7. Click a used recipient button again.
8. Start another effect, choose a caster, and click **Ask the GM** instead of choosing a visible recipient.
9. As GM, open `!Effect-GM`, confirm **Player Requests (1)** appears, then open `!Effect-Requests`.
10. Select the GM-layer recipient, click **Use Selected Tokens**, review the request, and confirm it.
11. Confirm the public announcement does not name the hidden recipient.
12. Create one more player request, preview it as the GM, then lock Player Casting before clicking the old confirmation.
13. Restore **Allow** from the GM control center.

**Pass when:**

- caster choice and recipient count are separate, compact steps containing no visible raw token or character identifier;
- Bless offers one to three recipients directly and four through eleven only behind **Higher Level Casting**;
- a player can target a visible linked recipient they do not control;
- used, stale, fabricated, or wrong-player casting buttons produce a private **Start Again** recovery panel and never apply twice;
- **Ask the GM** remains available under Player Requests instead of disappearing with one chat whisper;
- the GM may place a hidden or off-page recipient through the retained request path; optional Application Review may add a separate confirmation;
- hidden recipient names are not included in the public completion announcement;
- the player cannot see custom, audit, repair, request-management, or configuration controls;
- a later lock invalidates an unconfirmed player request without changing an effect;
- restoring access works without a sandbox restart.

**NPC fallback:** Apply Bless, Warding Bond, and Haste to the disposable linked NPC. Pass when marker and lifecycle behavior work, no PC-only modifier rows are created for the NPC, and the result clearly identifies the manual mechanics.

### Overlapping Sources

1. Keep the same target selected.
2. Apply Bless again, choosing the second source.
3. Confirm Status shows two active Bless instances but the target still has one effective marker and one attack/save row pair.
4. End the first instance from its generated button.
5. Confirm the marker remains.
6. End the second instance.
7. Confirm the marker and sheet rows are removed.

**Pass when:** each source is independently removable, the first ending does not disturb the second, and final cleanup removes only the projections EffectAssist originally added.

### Pre-Existing Marker Preservation

1. Add the configured Bless marker and matching `Bless (GA)` attack/save rows to the target manually before creating an EffectAssist record.
2. Apply one Bless instance.
3. End that instance.

**Pass when:** the marker and pre-existing rows remain. EffectAssist must record that matching state existed before its ownership began, name that preserved state in the completion result, and must not claim or remove it.

### Generic Paths

With the target selected, open `!Effect-GM` and test:

1. **Record Only** — use a temporary name; confirm no marker or condition is added.
2. **Generic Marker** — choose a harmless marker; confirm it is added and removed when the final source ends.
3. **Condition Effect** — choose a disposable configured condition; confirm ConditionAssist owns the condition lookup and MarkerService owns the marker change.

**Pass when:** each record appears in Status, no unsupported text or unsafe key corrupts state, and every final cleanup preserves unrelated markers.

**Skip note:** The Condition Effect step may be skipped when ConditionAssist is intentionally disabled. Record Only must still work.

### Atomic Invalid Selection

1. Select one linked target and one unlinked token together.
2. Try to apply Bless.

**Pass when:** EffectAssist refuses the complete request, names the exact invalid token and its linkage problem, creates no instance, and changes neither token. It must not partially apply to the eligible selection.

### Marker Removal, Read-Only Audit, and Confirmed Repair

1. Apply Bless to two linked targets from one source.
2. Remove the Bless marker from only one target.
3. Run `!Effect-Audit`.
4. Confirm the audit identifies that target and missing projection and says it changed nothing.
5. Click **Confirm Current Repairs**.
6. Run `!Effect-Audit` again.

**Pass when:** removing only one target marker from a multi-target effect remains repairable drift, the first audit changes nothing, the generated confirmation restores and verifies that marker, and the second audit is clean.

Remove the Bless marker from both targets. Pass when the final managed target-marker removal ends the dependent Bless record, clears the source's owned concentration, removes the unneeded sheet rows, and preserves unrelated state. Reapply Bless, then remove the source's Concentrating marker. Pass when the dependent record ends through the same ownership-safe cleanup.

Repeat with one GameAssist-created Bless row changed from `1d4` to another value. End Bless. Pass when EffectAssist preserves the edited row and reports that cleanup needs attention instead of deleting the GM's edit.

For the stale-confirmation check:

1. Create another mismatch and run Audit.
2. Change the relevant token or effect before clicking the old confirmation.
3. Click the old button.

**Pass when:** the repair is refused and the GM is told to run a new audit.

### Token Identity Drift

1. Apply a disposable generic marker effect.
2. Change the target token so it represents a different character.
3. Run `!Effect-Audit`.
4. Try to end the original effect.

**Pass when:** Audit reports that the exact token now represents a different character, repair is not offered for that mismatch, and ending the semantic record leaves the token's marker unchanged with a clear cleanup warning.

### Required-Service Failure and Recovery

1. With EffectAssist still enabled, disable MarkerService.
2. Apply a Record Only effect; it should work normally.
3. Preview Bless, then try to confirm it.
4. Re-enable MarkerService.
5. Apply Bless again.

**Pass when:** disabling MarkerService does not disable EffectAssist, non-marker records remain usable, the incomplete Bless request does not leave partial sheet or concentration state, and the retry succeeds after MarkerService is restored.

### Disable, Re-Enable, and Restart

1. Leave one active disposable effect.
2. Run `!ga-disable EffectAssist`.
3. Confirm EffectAssist commands stop responding and no token, marker, or record is silently removed.
4. Run `!ga-enable EffectAssist`.
5. Confirm Status still shows the active record.
6. Restart the sandbox and repeat Status and Audit.

**Pass when:** valid active records, bounded ended history, definitions, and ownership ledgers survive module toggles and sandbox reload; no automation runs merely because EffectAssist was enabled.

### Navigation and Recovery

```roll20chat
!Effect-GM
!Effect-DM
!Effect-Menu
!Effect-Guide
!Effect-Help
!Effect-Info
!Effect-Status
!Effect-Catalog
!Effect-Active
!Effect-Settings
!Effect-Review on
!Effect-Review off
!Effect-Advanced
!Effect-Multiple-Concentration on
!Effect-Multiple-Concentration off
!Effect-Requests
!Effect-Definitions
!Effect-Audit
!Effect-Manual
!Effect-Impossible
!effect status
```

**Pass when:** commands are case-insensitive; GM/DM/Menu open the same primary controls; Settings shows Application Review off by default; Advanced shows multiple concentration off by default; each toggle changes only its named behavior; the stable manual is created or updated once; the unknown route offers useful recovery buttons; and the spaced command family reaches the same module exactly once.

**Disabled-module recovery:** Disable AttackAssist, then run `!attack`. Pass when the GM receives one clear unavailable-module panel with an **Enable AttackAssist** action, **Modules & Services**, and **GameAssist Home** instead of silence. Re-enable it afterward. Active module commands must still be handled only by their normal route.

---

## Focused v2.0.0 Complete AlmanacAssist Acceptance

**What this proves:** AlmanacAssist 1.6.1 ships as one complete module whose action-first daily controls and Time, Climate, Astronomy, Weather, Environment, and Rest systems are independently usable, preserve valid state while disabled, and exchange optional context without turning one system into a hidden prerequisite for another.

**Why test it:** v2.0.0 must not publish a calendar shell while describing a world-management suite. This track proves the six systems, their boundaries, their shared navigation, and RestAlmanac's deliberate 2014-sheet writes inside the real Roll20 sandbox.

**Skip when:** Do not skip this section for v2.0.0 release acceptance. After release, campaigns that keep AlmanacAssist disabled may skip it. Within ordinary troubleshooting, test only the enabled internal system and any optional context provider involved.

### Preparation and Master Controls

Use a disposable campaign page and one linked official D&D 5E by Roll20 2014 PC token with current and maximum HP, Hit Dice, and at least one spell-slot level configured.

```roll20chat
!ga-config modules
!ga-enable AlmanacAssist
!aa-gm
!Almanac-Systems
!Almanac-Status
!Almanac-Audit
!Almanac-Manual
!Almanac-Impossible
```

**Pass when:** AlmanacAssist begins disabled on a clean v2.0.0 state; enabling it starts all six saved-on systems; `!aa-gm` opens one private, action-first dashboard with **Now**, **Advance Date & Time**, **Set or Change Calendar**, **Share**, **World Today**, and **More**; routine controls do not dump module health, audit evidence, moon-cycle configuration, or full calendar structure; Systems provides independent toggles; Status identifies every system; Audit explicitly changes nothing; Manual creates or updates one stable handout; and the bad command offers a useful route back.

### TimeAlmanac and Calendar Announcements

**Why:** Every optional time consumer must receive one stable fictional-minute authority, while the GM can manage and share the current world state without changing GameAssist's real-world timestamps.

1. Open `!aa-gm`. Use **+10 Minutes**, **+1 Hour**, and **+1 Day**. Then use **Choose Advance** with days, hours, and minutes together.
2. Open **Set Date & Time**, cancel once, and confirm nothing changes. Submit a valid exact moment and confirm it changes only after the generated confirmation.
3. Open `!cal`. Switch among Standard, Solamnic, and Harptos; confirm the displayed date changes but the underlying elapsed fictional moment is preserved.
4. Run `!aa-announcement-settings`. Choose **Off**, then run `!aa-announce`. Confirm no public announcement is sent and the GM receives a private **Announcement Not Sent** result.
5. Open **Choose Announcement Information**. Set Time to Descriptive, Weather to Detailed, Climate to Technical, and at least one other field to Off. Preview and confirm each field independently follows its selected level. Then use **Restore Defaults** and confirm the saved campaign defaults return without changing fictional time or world state.
6. Prepare manual weather with rain, an exact temperature, a wind speed, cloud cover, and visibility. Choose **Descriptive** and **Everything**, then preview. Confirm Wayfarer time is a named period rather than AM/PM; temperature and wind are words rather than measurements; visibility is explicitly labeled; the moon reports **Not Visible** when daylight or cloud cover blocks it; and no placeholder **Home Region** or **Campaign Default** region or second exact temperature appears. A clean state should identify the starter region as **Temperate Lowlands**.
7. Choose **Detailed** and preview. Confirm the current Weather row may show its exact temperature and wind, while Climate is background regional context and does not claim a simultaneous second current temperature.
8. Choose **Technical** and preview. Confirm the deeper precipitation, cloud, climate-likelihood, and environment context appears without relabeling climate expectations as current measured weather.
9. Choose **GM Only** and **Calendar**, preview again, then run `!aa-announce`. Confirm both messages remain private and include only the selected available fields.
10. Choose **Travel**, then **Everything**, and preview each. Confirm Travel prioritizes weather, climate, and environment while Everything includes every currently available field.
11. Open **Choose Announcement Information**, turn one field Off, select another level for a second field, and change the announcement heading. Preview and confirm the settings report **Custom**, the selected field levels match the buttons, and the new heading is used.
12. Restore **Public Chat**, campaign defaults, and **Quick**. Preview once and confirm it is still private; announce once and confirm only the announcement is public.
13. From a player account, run `!date` and `!time`. Confirm the player receives read-only output and no mutation controls.
14. Complete the focused Wayfarer test below.

**Pass when:** quick and chosen advances work; exact setting and reversal require confirmation; all profile changes preserve elapsed time; preview is always GM-private; Off suppresses delivery; Descriptive, Detailed, and Technical produce their intended information levels; current Weather and climate background are not presented as two simultaneous measured temperatures; missing details are omitted rather than guessed; players remain read-only; and the table timezone, log timestamps, and NPCAssist Session date do not change.

#### Wayfarer Custom Calendar

**What this proves:** A GM can use an already saved Wayfarer calendar directly, edit only the component that needs attention, reach teaching or technical detail deliberately, preview and activate a complete draft safely, see moon phases where requested, and recover without editing Roll20 state.

**Skip when:** Skip during ordinary troubleshooting only when the campaign deliberately uses Standard, Solamnic, or Harptos. Do not skip for the v2.0.0 release acceptance.

1. Run `!aa-wayfarer`. Confirm the compact home clearly separates **Use Wayfarer Calendar**, **Choose Another Calendar**, **Edit Calendar**, **Preview Draft**, **Review & Activate**, **Guided Review**, **Start From a Copy**, **Details**, **Recovery**, and **Help**.
2. Confirm the home does **not** display the full period list, complete setup-progress evidence, moon-cycle configuration, rollback explanation, or worked examples.
3. Note the current fictional moment. Click **Use Wayfarer Calendar**, decline confirmation once, then accept it. Confirm the saved Wayfarer definition becomes active without entering draft-review screens and the elapsed fictional moment is preserved.
4. Open **Set Date & Time** while Wayfarer is active. Confirm the Roll20 prompts accept hours `1-20` and minutes `0-74`, matching its 20-hour day and 75-minute hour.
5. Set the time to the 2nd, 7th, 12th, and 17th Hours in turn. Confirm Wayfarer uses ordinal Hours and named periods rather than AM/PM: **First Light (Dawn)**, **Highsun (Midday)**, **Evening's Crest (Dusk)**, and **Deep Night (Midnight)**.
6. Open **Edit Calendar**. Confirm it groups **Name, Clock & Start**, **Weekdays**, **Periods**, **Festival Days**, **Leap Rule**, **Holidays**, and **Seasons**, with Preview/Review and a clear return route.
7. Open **Name, Clock & Start**. Confirm the page shows only the current values and relevant edit controls. Click **Explain This** and confirm the terminology, input boundaries, and example are available there instead of crowding the editor.
8. Click **Change Name**, cancel the Roll20 query, and reopen the editor. Pass when the context prompt appears, the name is unchanged, and it is never set to `true`. Then use **Change Name and Starting Date** once and confirm the complete change is applied together or not at all.
9. On a fresh default draft, open **Details** and confirm it reports **Wayfarer Calendar**, a 10-day week, 17 periods (**12 months + 5 festivals**), 460 ordinary-year days, a 20-hour day, 75-minute hours, current moon phases, validation progress, and rollback availability.
10. Build this disposable example through the focused component editors:
   - Name: `River Kingdom Calendar`
   - Starting date: Year `12`, `Deepwinter`, day `7`, hour `9`, minute `30`
   - Clock: `20` hours per day and `75` minutes per hour
   - Weekdays: `Moonday,Towerday,Marketday,Hearthday,Starday`
   - Periods: `Deepwinter:31,Founding Feast:2:Feast,Thawrise:27,Highsun:35,Harvestfall:29`
   - Additional festival days: none
   - Leap rule: `Starwake`, every `4` years, after period `4`
   - Holidays: `Oath Day:1:1,River Fair:3:12`
   - Seasons: `Winter:5:1:1:31,Spring:2:1:3:27,Summer:4:1:4:35,Autumn:5:1:5:29`
11. Confirm replacing the period list explains that dependent festival days, leap rules, holidays, and seasonal ranges were cleared instead of silently moved.
12. Close the panel between edits and run `!aa-wayfarer` again. Confirm the draft returns unchanged. Restart the sandbox once and confirm it remains available.
13. Use **Preview Draft**. Confirm the unequal period lengths, feast period, leap rule, holidays, seasonal ranges, starting-date preview, and moon-phase note are readable.
14. Submit an invalid period such as `Broken Month:0` or overlapping seasons. Confirm the prior valid draft and active calendar remain unchanged.
15. Review every area, then activate. Confirm the calendar becomes active at the reviewed starting date and the prior calendar is retained as one rollback point.
16. Change one period length and activate again. Confirm elapsed fictional time is preserved rather than replaced by the draft starting date.
17. Use **Start From a Copy** with Harptos. Confirm only the saved draft changes. Open **Recovery**, use **Discard Draft**, and confirm the active calendar remains unchanged.
18. Change the draft clock to fewer hours and fewer minutes than the saved starting time. Confirm the edit succeeds, the starting hour/minute are adjusted into the new valid bounds, and the result explains that adjustment instead of trapping the GM in a starting-date conflict loop.
19. Run `!Weather-GM`, `!weather dm`, `!Weather-Status`, `!Weather-Help`, and `!Weather-Audit`. Confirm each opens the appropriate private Weather screen exactly once. Repeat one route with mixed capitalization.
20. Run `!aa-wayfarer reset-default` without confirmation. Confirm no change is made and no reset button is offered. Then run `!aa-wayfarer reset-default --confirm yes`; confirm the draft returns to **Wayfarer Calendar** while the active calendar and fictional time remain unchanged.
21. Create or update `!Almanac-Manual`. Confirm it explains the action-first dashboard, focused Wayfarer manager, Wayfarer Hour language, announcement controls, seasonal ranges, moon ownership, command-only draft reset, activation, rollback, and recovery.

**Pass when:** the common dashboard actions are direct; saved Wayfarer selection does not force draft setup; all calendar components are directly reachable; routine pages remain compact; explanations/details/recovery are available on demand; exact-time prompts follow the active calendar; the default matches the Wayfarer briefing; moon phases remain available through requested detail and Astronomy views; standardized Weather aliases work with either case and either a space or hyphen; draft edits survive navigation and restart; invalid input causes no partial change; activation and rollback preserve the described state; and the command-only default reset changes only the draft.

### ClimateAlmanac

**Why:** Weather needs optional regional context, but climate settings must also remain useful and understandable by themselves.

1. Open `!clim`. Confirm the first screen names the current region and presents its useful climate at a glance without showing inheritance keys or raw configuration.
2. Switch directly to another existing region, then return to the original region.
3. Open **Manage Regions**, then **Climate Types**, and create one custom profile with a unique name.
4. Create a parent region and one child that inherits its profile.
5. Change the parent profile and confirm the inheriting child follows it.
6. Add a child override and confirm only that value differs.
7. Try a duplicate name and an invalid parent/depth.

**Pass when:** built-in and custom profiles remain distinguishable; inheritance follows the current parent; an explicit override wins; invalid or ambiguous requests write nothing; and the focused audit identifies the active region and profile without changing them.

### AstronomyAlmanac

**Why:** Moon phases and daylight should be reproducible calendar results, while rare omens remain optional weighted suggestions.

1. Open `!astro` and note the current moon phases and daylight.
2. Open Astronomy setup. Confirm each existing moon has its own **Edit** and **Remove** controls, and **Add Moon** opens name, cycle, offset, and phase prompts without asking for an internal ID. Add or edit a disposable moon cycle, offset, and phase-name list.
3. Generate a short future forecast and verify it does not advance current TimeAlmanac time.
4. Add or edit one bounded rare event and request a suggestion.
5. Turn TimeAlmanac off and set the Astronomy manual day/season fallback.

**Pass when:** the same date produces the same moon/daylight result; the forecast is read-only; deterministic boundaries remain separate from rare events; invalid cycles, offsets, phases, or weights make no partial change; and Astronomy remains useful without Time.

### WeatherAlmanac

**Why:** Current weather must evolve deliberately and remain operable even when optional Time or Climate context is absent.

1. Open `!weather`, generate current weather twice, and review its structured summary.
2. Generate a short forecast and confirm current weather does not change.
3. Lock current weather, attempt to replace it, then unlock it.
4. Choose a manual weather condition and review history.
5. Turn Time and Climate off, then generate weather again.

**Pass when:** generated entries include temperature, wind, precipitation, cloud, visibility, severity, duration, and tags; transitions are plausible rather than unrelated redraws; forecast is read-only; lock prevents silent replacement; manual weather stays explicit; and fallback operation still works without Time or Climate.

### EnviroAlmanac

**Why:** Other tools and the GM need structured environmental context without automatic penalties or surprise token/sheet changes.

1. With current weather available, run `!enviro`. Confirm the first screen shows the current environment, where it came from, and the common actions without dumping every technical field or raw tag list.
2. Apply one built-in option from **Quick Choices**.
3. Open **Customize**, change one field, return to the main screen, and confirm only that field changed.
4. Open **View Details** and confirm the complete visibility, temperature, precipitation, wind, ground, water, exposure, severity, and tags are available there.
5. Generate new weather and confirm the custom override remains authoritative.
6. While the override is active, reopen `!weather`. Confirm it shows the Environment override as **Current Scene**, the generated result as **Stored Weather**, and explains that stored weather resumes only after **Follow Weather Again**. A desert scene must not be presented as simultaneously having the stored rainy temperature.
7. Choose **Follow Weather Again** through confirmation and confirm the derived result resumes.
8. Turn Weather off and apply a manual preset again.

**Pass when:** output identifies visibility, temperature, precipitation, wind, ground, water, exposure, severity, and tags; no token, marker, character, roll, or Turn Tracker state changes; the override persists until cleared; and manual Environment still works without Weather.

### RestAlmanac

**Why:** Rest is the only initial Almanac system that writes to character sheets, so preview, permissions, stale-state checks, and rollback behavior must work in Roll20.

1. Select the disposable linked 2014 PC and open `!rest`. Open **Change Rest Rules** and test Standard, Heroic, and Gritty; confirm the visible Short and Long Rest durations change to the chosen profile.
2. Preview a Short Rest. Confirm its subjects and optional time advance before accepting it.
3. Spend a Hit Die through the native sheet if desired; confirm Short Rest does not spend it automatically.
4. Lower HP, Hit Dice, and one remaining spell-slot field, then preview and confirm a Long Rest.
5. Set bounded Custom rest durations, then create and use one bounded custom rest type. Confirm the rule profile and the named house-rule rest remain distinct controls.
6. Prepare another preview, change HP or turn TimeAlmanac off, then click the old confirmation.
7. Select a linked NPC or unlinked token and try again.

**Pass when:** only controlled linked 2014 PCs qualify; every confirmation revalidates the preview; Long Rest restores only verified HP, half Hit Dice with a minimum of one, and remaining spell slots to their verified totals; Short Rest leaves Hit Dice spending to the sheet; optional fictional time advances only when previewed; stale or invalid requests write nothing; and history records completed rests.

### Independent Toggles, Reload, and API Boundaries

1. Give each system at least one non-default valid setting.
2. Turn each internal system off, run its short command, and confirm it performs no active operation.
3. Confirm unrelated Almanac systems continue to work through their documented fallback.
4. Turn each system back on and confirm its settings remain.
5. Disable AlmanacAssist, restart the sandbox, re-enable it, and repeat Status and Audit.

**Pass when:** disabling never erases valid settings or history; no internal system becomes an undeclared hard prerequisite; unavailable public context returns no active value rather than stale data; and restart preserves the same fictional moment, profiles, regions, moons, weather, environment override, rest definitions, and history.

---

## Focused v1.8.2 NPCAssist Progressive-Naming Regression

**What this proves:** NPCAssist gives newly added eligible NPC tokens clear page-local names without changing existing tokens, represented characters, or unrelated token properties.

**Why test it:** This is the only new gameplay behavior in v1.8.2. Real `add:graphic` ordering and copied-token behavior must be confirmed inside Roll20.

**Skip when:** Skip only when NPCAssist will remain disabled or automatic NPC names will remain off. Do not skip for v2.0.0 release acceptance.

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

**Skip when:** Skip only when NPCAssist will remain disabled or `notifyBloodied` will remain off. Do not skip for v2.0.0 release acceptance.

### Quick Check

Use one disposable token on the **Objects layer** that is linked to a character with `npc=1`. Set the shared NPC HP bar shown by `!ga-health bars` to **51 / 100**.

```roll20chat
!ga-config get NPCAssist notifyBloodied
!ga-config set NPCAssist notifyBloodied=true
```

Change the selected bar HP from **51** to **50**.

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
2. Add a fresh qualifying NPC token whose temporary selected-bar value is blank, 0, or another placeholder before HPAssist writes the rolled result.
3. Wait for HPAssist to finish.

Pass when the token receives its rolled HP without a Bloodied notice, false death/revival pair, or new death-history entry. A later manual gameplay drop across half HP should still produce one private GM notice.

### Troubleshooting Evidence

If this section fails, record:

- the exact previous, current, and maximum values on the selected shared NPC HP bar;
- the token layer and represented character name;
- the result of `!ga-config get NPCAssist notifyBloodied`;
- whether HPAssist automatic rolling was active;
- the complete GameAssist whisper and sandbox error, if any.

---

## Focused Timezone Regression

**What this proves:** GameAssist accepts one table timezone, shows it clearly, preserves it across a sandbox restart, and uses it for a date-managed NPC Session.

**Why test it:** Timezone support affects logs, status panels, handouts, history displays, and the date boundary that creates a new Session.

**Skip when:** Do not skip after first installing v2.0.0 or changing the campaign timezone. The cross-date test may be skipped when NPCAssist is disabled and will not be used.

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

## Focused v2.0.0 Non-Almanac Follow-Up Checks

These checks cover the directly implemented backlog work now included in PR #81. They are intentionally short and can be skipped only when the corresponding feature will remain disabled or unused. For this development pass, assume the Roll20 smoke evidence has passed unless a live campaign exposes a new failure.

### SheetCapabilities and HealthService

**What it tests:** Whether GameAssist can identify what a character sheet can safely provide before a module reads or writes it.

**Run:** On a page containing one official 2014 PC, one official 2024 PC if available, and one unknown or unlinked token, run:

```roll20chat
!ga-sheets
!ga-health audit
```

**Pass when:** The report distinguishes supported, unsupported, and unknown operations without inventing a bonus or silently claiming that every operation works. No character or token changes occur.

**Skip when:** No sheet-sensitive GameAssist module is enabled.

### MarkerService and TokenAssist

**What it tests:** Whether the shared marker authority preserves TokenMod-style marker behavior while keeping ordinary token actions safe.

**Run:** Select one disposable token and use:

```roll20chat
!token-assist actions
!ta-set statusmarkers|red[2]
!ta-set statusmarkers|+red
!ta-set statusmarkers|?blue:3
!ta-set statusmarkers|red:+1:0:9
!ta-set statusmarkers|aura1_color|+010101
!ta-set statusmarkers|light_radius|+5
!ta-set currentSide|+1
!ta-report gm|"{name}: {bar1_value}"
```

Then review the marker and action result. Use the action-library buttons for controller edits and report routes rather than typing them if preferred.

**Pass when:** The requested marker operations return clear success or refusal messages, unrelated markers remain intact, duplicate/index operations do not alter unrelated entries, and an unsupported or ambiguous selector is refused without partial mutation. `!ga-sheets` remains read-only.

**Skip when:** TokenAssist and marker-dependent modules are disabled. Do not use a live NPC marker as the disposable target.

### CombatAssist Health Timeline

**What it tests:** Whether supported HP changes can be reviewed at the encounter and turn boundary without being mislabeled as proven damage.

**Run:** Start a disposable native-tracker encounter with at least two rows, make one supported HP change, advance one turn, make another supported HP change, then run:

```roll20chat
!Combat-Start
!Combat-Timeline
!Combat-Timeline round 1
```

**Pass when:** The timeline identifies the encounter, round, turn, subject, before/after values, direction, and evidence source. It clearly says that the record is review evidence and does not claim attacker, damage type, resistance, or causation.

**Skip when:** CombatAssist or HealthService is disabled.

### CombatAssist Ready and Delay

**What it tests:** Whether optional held actions work without replacing Roll20's native initiative rules.

**Run:** As GM, open `!Combat-Ready`, enable the feature, leave the profile at `5e`, and use the player-facing **Ready an Action** button. Then use `!Now` and inspect the confirmation. Repeat once with `profile legacy` if that profile is needed by the campaign.

**Pass when:** The current character can record and cancel one held action, the native tracker advances normally, `!Now` announces use without applying damage or conditions, stale or expired records cannot be reused, and the legacy profile does not guess where a delayed turn belongs.

**Skip when:** The campaign does not use Ready/Delay workflows. The feature is off by default.

### CombatAssist to NPCAssist Summary Handoff

**What it tests:** Whether an ended encounter can be summarized in the existing report system without creating fake deaths or revivals.

**Run:** Start and end a disposable encounter. At the end, choose **Add to Session** or **Add to All Active Reports**, then run:

```roll20chat
!npc-death-report --scope session
!npc-death-write
```

Run the same handoff twice if you want to verify deduplication.

**Pass when:** One encounter summary appears in the chosen bucket, a repeated handoff does not duplicate it, and no death/revival entry appears unless an actual NPC death/revival occurred.

**Skip when:** CombatAssist is not used with NPCAssist reports.

### Handout Identity and Index

**What it tests:** Whether GameAssist updates its own reports and manuals without silently replacing a renamed or conflicting handout.

**Run:** Use one report-writing module, then run:

```roll20chat
!ga-handouts
!ga-config list
```

Open the index and one linked handout. If safe in a disposable campaign, rename one GameAssist handout and run the writer again.

**Pass when:** The index lists stable owner/key identities, the existing handout is updated rather than duplicated, and a renamed/conflicting handout produces a clear diagnostic instead of being overwritten.

**Skip when:** The campaign does not use GameAssist handouts or reports. Folder placement remains a manual Journal action.

### Deferred Work

The following are intentionally not part of this smoke section: persistent image/default-token writes (#45), API_Meta-style source-offset diagnostics (#50), Jukebox/music hooks (#57), and broad EffectAssist catalog expansion (#82).

## Full v2.0.0 Release Acceptance Test

This release test has two tracks:

| Track | Starting point | Purpose |
| --- | --- | --- |
| **A. Clean installation** | No saved GameAssist state | Proves the complete v2.0.0 suite starts cleanly, EffectAssist creates safe source-aware records, HealAssist applies reviewed healing, AttackAssist submits guarded attacks, and all six AlmanacAssist systems operate together. |
| **B. Upgrade** | A working v1.8.2 campaign | Proves existing configuration and runtime history survive the v2.0.0 state upgrade while all four new modules begin disabled. |

Every acceptance check after the script is replaced must use v2.0.0.

### Release Candidate Files

Use the current repository copies of:

- `GameAssist-v2.0.0` or the identical `GameAssist.js` One-Click artifact;
- this `Smoketest.md` guide.

After saving the script, wait for the Mod sandbox to restart. Continue only when the startup message and `!ga-status` both identify **GameAssist v2.0.0**.

### Track A: Clean v2.0.0 Installation

Use a disposable campaign, or a campaign where disposable test tokens and test effects can be removed safely.

1. Install GameAssist v2.0.0.
2. Prepare the PC, NPC, unlinked token, and optional CritAssist tables described under [Before Testing](#before-testing).
3. Run every **Basic Check** in Components 1 through 18 and the HealthService core-service check. A deliberately disabled optional module may be recorded as **Skipped by choice**, except for the four v2.0.0 release modules.
4. Run the complete [Focused v2.0.0 HealthService Acceptance](#focused-v200-healthservice-acceptance) section, including the Issue #86 PC health-alert track. It may not be skipped for release approval.
5. Run the complete [Focused v2.0.0 EffectAssist Acceptance](#focused-v200-effectassist-acceptance) section. It may not be skipped for release approval.
6. Run the complete [Focused v2.0.0 HealAssist Acceptance](#focused-v200-healassist-acceptance) section. It may not be skipped for release approval.
7. Run the complete [Focused v2.0.0 AttackAssist Acceptance](#focused-v200-attackassist-acceptance) section. It may not be skipped for release approval.
8. Run the complete [Focused v2.0.0 Complete AlmanacAssist Acceptance](#focused-v200-complete-almanacassist-acceptance) section. It may not be skipped for release approval.
9. Run the cross-component permission, duplicate-installation, and state-recovery checks.
10. Restart the sandbox and repeat `!ga-status`, `!ga-config modules`, `!ga-health`, one marker change, `!Effect-Status`, `!Heal-Status`, `!Attack-Status`, and `!Almanac-Status`.

| Clean-install requirement | Result |
| --- | --- |
| Sandbox reloads without a new GameAssist exception | ☐ Pass ☐ Fail |
| Core status identifies v2.0.0 | ☐ Pass ☐ Fail |
| Required Components 1 through 18 pass | ☐ Pass ☐ Fail |
| Focused HealthService and GM-private PC alert acceptance passes | ☐ Pass ☐ Fail |
| Focused EffectAssist acceptance passes | ☐ Pass ☐ Fail |
| Focused HealAssist acceptance passes | ☐ Pass ☐ Fail |
| Focused AttackAssist acceptance passes | ☐ Pass ☐ Fail |
| Complete AlmanacAssist acceptance passes | ☐ Pass ☐ Fail |
| Cross-component checks pass | ☐ Pass ☐ Fail |
| Restart check preserves active effect records and Almanac state | ☐ Pass ☐ Fail |

### Track B: Upgrade from v1.8.2

Use a disposable copy of a campaign that already has useful v1.8.2 state.

Before replacing the script:

1. Run `!ga-status` and `!ga-config modules`.
2. Record the active table timezone and at least one non-default module setting.
3. Preserve one NPCAssist history record, one custom condition if available, and any existing guide handout.
4. Confirm EffectAssist, HealAssist, AttackAssist, and AlmanacAssist do not exist in the old module list.

Replace v1.8.2 with v2.0.0, save, and wait for the sandbox restart. Then verify:

| Upgrade requirement | Result |
| --- | --- |
| Existing modules retain their enabled or disabled state | ☐ Pass ☐ Fail |
| Existing configuration values remain intact | ☐ Pass ☐ Fail |
| NPCAssist history and existing handouts remain intact | ☐ Pass ☐ Fail |
| HealthService appears enabled with empty sandbox-local evidence | ☐ Pass ☐ Fail |
| EffectAssist appears disabled by default | ☐ Pass ☐ Fail |
| HealAssist appears disabled by default | ☐ Pass ☐ Fail |
| AttackAssist appears disabled by default | ☐ Pass ☐ Fail |
| AlmanacAssist appears disabled by default | ☐ Pass ☐ Fail |
| Enabling EffectAssist creates only its own state branches | ☐ Pass ☐ Fail |
| Enabling HealAssist creates only its config/runtime branch and no HP change | ☐ Pass ☐ Fail |
| Enabling AttackAssist creates only its config/runtime branch and no roll or target change | ☐ Pass ☐ Fail |
| Enabling AlmanacAssist creates only its own bounded config/runtime branches | ☐ Pass ☐ Fail |
| A Bless test survives one sandbox restart | ☐ Pass ☐ Fail |
| HealAssist settings survive restart while pending healing buttons expire | ☐ Pass ☐ Fail |
| AttackAssist settings survive restart while pending attack buttons expire | ☐ Pass ☐ Fail |
| A fictional-time change and one setting in every Almanac system survive restart | ☐ Pass ☐ Fail |
| Disabling EffectAssist preserves records and stops its commands | ☐ Pass ☐ Fail |
| Re-enabling EffectAssist restores access to the same records | ☐ Pass ☐ Fail |
| Disabling/re-enabling AlmanacAssist preserves state and restores its commands | ☐ Pass ☐ Fail |

Do not approve the release if an existing valid configuration, history record, or unrelated marker is silently removed.

---

## Test Summary

| Component | What the basic test proves | Why test it | Skip when |
| --- | --- | --- | --- |
| Core System | GameAssist loaded, responds, and started enabled modules. | Every other feature depends on the core. | Never after an install or update. |
| Table Timezone | The saved table clock, readable timestamps, and date-managed Session agree. | A wrong date boundary can put NPC history in the wrong Session. | Only the cross-date portion may be skipped when NPCAssist is disabled. |
| MarkerService | GameAssist can change and read markers without standalone TokenMod while preserving unrelated markers. | NPC death and concentration markers depend on it. | Only when no enabled module or future service uses token markers. |
| TurnTrackerService | Native tracker rows can be read, audited, and safely updated without losing custom or unknown data. | InitiativeAssist and CombatAssist depend on one lossless Turn Tracker authority. | Never for v2.0.0 release acceptance. |
| ConfigUI | The GM settings interface opens and responds once. | It is the easiest way for most DMs to manage modules. | The campaign is intentionally managed only through commands. |
| CritAssist | Help and the Natural 1 workflow respond. | Table automation can fail separately from the rest of GameAssist. | CritAssist is disabled and will not be used. |
| ConditionAssist | Condition help, selected-token controls, descriptions, and MarkerService synchronization work. | Condition workflows combine permissions, configuration, markers, and chat output. | ConditionAssist is deliberately disabled and will not be used. |
| TokenAssist | Selected-token controls, values, movement, reports, and MarkerService-backed status commands work. | It replaces the supported general token-control workflows previously supplied by standalone TokenMod. | TokenAssist is deliberately disabled and none of its commands, including the temporary older command, will be used. |
| InitiativeAssist | Mixed 2014/2024 actors roll through the native tracker while counters, objects, dead NPCs, and attention rows remain untouched. | Initiative mistakes interrupt play and can damage another tool's tracker state. | Never for v2.0.0 release acceptance. |
| CombatAssist | Explicit lifecycle, rounds, ordinary native tracker edits, recovery, and player confirmations work without replacing Roll20's tracker. | A false round or destructive tracker edit can disrupt an encounter immediately. | Never for v2.0.0 release acceptance. |
| WelcomeAssist | Optional greetings remain deliberate, bounded, private during setup, and limited to one automatic post per sandbox. | Startup output should welcome the table without misreporting unhealthy GameAssist components or executing custom chat syntax. | Never for v2.0.0 release acceptance. |
| ConcentrationAssist | Status, saving throws, and marker removal work on linked PC tokens. | It combines character data, rolls, chat, and MarkerService. | ConcentrationAssist is disabled and will not be used. |
| NPCAssist | Death, revival, audit, history, buckets, and Arc menus work. | It combines HP events, markers, saved records, and handouts. | NPCAssist is disabled and will not be used. |
| HPAssist | Qualifying NPC HP formulas roll without changing PCs or unlinked tokens. | Incorrect eligibility can damage token HP or create false history. | HPAssist is disabled and NPC HP is set another way. |
| EffectAssist | The focused six-effect catalog coordinates player-safe casting, owned markers, concentration, and 2014-sheet rows without deleting unrelated state. | Effects combine several campaign surfaces, so authorization, ownership, and cleanup must be proven together. | Never for v2.0.0 release acceptance. |
| HealAssist | Guided official-2014 healing rolls once, previews exact HP results, and writes only after fresh confirmation through HealthService. | Player permissions, private NPC data, stale buttons, maximum HP, and multi-target writes must be proven together. | Never for v2.0.0 release acceptance. |
| AttackAssist | Guided official-2014 repeating attacks preserve exact rows, native targeting, familiar roll cards, and one-use submission without resolving damage. | Player control, hidden-target privacy, stale buttons, roll modes, and CritAssist delivery must be proven together. | Never for v2.0.0 release acceptance. |
| AlmanacAssist | Time, Climate, Astronomy, Weather, Environment, and Rest work independently and together while preserving valid state and deliberate write boundaries. | v2.0.0 promises the complete world-context suite, and Rest performs guarded 2014-sheet writes. | Never for v2.0.0 release acceptance. |
| DebugTools | Dry runs remain non-destructive and `--apply` is explicit. | It verifies diagnostic safeguards and direct MarkerService access. | Normally skip; DebugTools is optional and disabled by default. |

---

## What Counts as a Pass?

GameAssist is ready for normal use when:

- the Roll20 Mod sandbox reloads without a new GameAssist exception;
- the Core System basic test passes;
- MarkerService passes if ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, or marker diagnostics will be used;
- TurnTrackerService, InitiativeAssist, CombatAssist, WelcomeAssist, EffectAssist, HealAssist, AttackAssist, and all six AlmanacAssist systems pass before v2.0.0 is approved;
- every enabled module that matters to the coming session passes its basic test;
- any skipped test is skipped for a stated reason, not because its result was unclear.

Expected conditions that are not failures:

- DebugTools is disabled by default.
- Standalone TokenMod is not required for GameAssist marker operations or supported TokenAssist commands in v2.0.0. Remove it while testing TokenAssist so both scripts cannot respond to `!token-mod`.
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

After saving GameAssist, wait for the Roll20 Mod sandbox to restart. The core-ready whisper should identify GameAssist v2.0.0.

For expanded tests, prepare:

### Disposable PC

Create a character named `GA Test PC` with:

```text
constitution_save_bonus = 3
```

Add an Objects-layer token that represents that character and has positive HP on the selected shared NPC bar.

### Disposable NPC

Create a character named `GA Test NPC` with:

```text
npc = 1
npc_hpformula = 4d8+8
```

Add an Objects-layer token that represents that character and uses the selected shared NPC bar for HP.

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

**Skip when:** Do not skip this section while approving v2.0.0 or after changing a module's command routing or help content. During ordinary troubleshooting, test only the affected enabled module. WelcomeAssist, InitiativeAssist, CombatAssist, and DebugTools may be skipped when they are deliberately disabled and will remain unused.

### Quick Pattern

For each enabled module below:

1. Open **Guide** and confirm it is short, action-focused, and links to deeper information.
2. Open **Status** and confirm the module gives a concise current-state response.
3. Open **Audit** and confirm it clearly says no changes were made.
4. Enter the listed bad command and confirm it explains the problem and offers **Open Guide**.
5. Where **Manual** is listed, run it twice. The second run must update the same handout rather than create a duplicate.
6. Run both role aliases and confirm **GM** and **DM** open the same module-specific Game Master interaction screen.
7. Confirm the module's Game Master screen includes **GameAssist Home** and that it returns to `!GA-GM`.

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
| EffectAssist | `!Effect-GM` / `!Effect-DM` | `!Effect-Guide` | `!Effect-Status` | `!Effect-Audit` | `!Effect-Manual` | `!Effect-Impossible` |
| HealAssist | `!Heal-GM` / `!Heal-DM` | `!Heal-Guide` | `!Heal-Status` | `!Heal-Audit` | `!Heal-Manual` | `!Heal-Impossible` |
| AttackAssist | `!Attack-GM` / `!Attack-DM` | `!Attack-Guide` | `!Attack-Status` | `!Attack-Audit` | `!Attack-Manual` | `!Attack-Impossible` |
| AlmanacAssist | `!Almanac-GM` / `!Almanac-DM` | `!Almanac-Guide` | `!Almanac-Status` | `!Almanac-Audit` | `!Almanac-Manual` | `!Almanac-Impossible` |
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

For an upgrade test, create the old `GameAssist Guide - CritFumble`, `GameAssist Guide - NPCManager`, and `GameAssist Guide - ConcentrationTracker` handouts under v0.1.7.0 first. After installing v2.0.0, the corresponding Manual commands should adopt and rename those handouts. If more than one old handout has the same legacy name, GameAssist should refuse to guess and explain the duplicate instead of overwriting either one.

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
!ga-health
!ga-config modules
```

Pass when:

- `!ga-status` identifies GameAssist v2.0.0 and gives a clear overall result;
- MarkerService, TurnTrackerService, HealthService, and seven default gameplay/administration modules are enabled and running;
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
- [ ] HealthService v1.0.0 is enabled and its evidence count is readable.
- [ ] Queue length returns to zero while idle.
- [ ] Queue mode says normal handlers execute directly and queue use is explicit.
- [ ] A missing duration is shown as `N/A`, not `N/Ams`.
- [ ] Errors refer to the current sandbox session, not campaign lifetime.
- [ ] Details provide **Simple View**, **Modules & Services**, **Metrics**, and **Health Evidence** actions.

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
- [ ] `version` is `2.0.0`.
- [ ] MarkerService, TurnTrackerService, HealthService, and every registered module configuration object are present.
- [ ] Runtime caches, metrics, death history, and Arc data are absent.

This is a configuration snapshot, not a complete state backup, and it cannot be imported in v2.0.0.

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

**Skip when:** Never skip for v2.0.0 release acceptance. A campaign that will use neither InitiativeAssist nor CombatAssist may limit this to the basic lifecycle check after release.

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

## 3A. HealthService

**What this proves:** GameAssist can recognize supported HP surfaces and show the GM whether recent evidence was merely observed or came from a declared, verified GameAssist write.

**Why test it:** HealthService is shared infrastructure for future HP-sensitive features. Its most important safeguard is refusing to invent a cause for an unexplained HP change.

**Skip when:** Skip this component check only when HealthService is deliberately disabled. The complete focused acceptance near the top of this guide remains required for Issue #83 and v2.0.0 release approval.

### Basic Check

Run:

```roll20chat
!ga-health
!ga-health audit
!ga-health recent
!ga-health alerts
```

Pass when all four commands whisper only the GM, the audit says it made no changes, an empty recent list is described as no evidence yet rather than an error, and the alert screen provides threshold, exact-HP, and preview controls without changing HP.

### Troubleshooting Check

If a linked token does not appear in the audit, confirm:

- the character uses the official 2014 sheet;
- a PC token's bar 1 is linked to that character's `hp` attribute;
- an NPC character has `npc=1` and the token represents that character;
- the token is on the Objects or GM layer of the Player Ribbon page.

HealthService does not currently claim support for 2024 HP attributes, temporary HP adjudication, attack attribution, damage types, resistance, or automatic concentration decisions.

---

## 4. ConfigUI

**What this proves:** The GM configuration interface opens, renders module controls, and routes button commands once.

**Why test it:** Most DMs will manage GameAssist through this interface rather than raw configuration commands.

**Skip when:** The campaign intentionally uses command-only configuration.

### Basic Check

Run:

```roll20chat
!ga-config modules
!ga-config ui
!ga-config-ui
```

Pass when `!ga-config modules` lists **Services** first in alphabetical order and **Modules** second in alphabetical order. Each ConfigUI command should produce one panel; the paged panels should use the same grouping and ordering. Saved settings must appear as short human summaries rather than raw JSON, long values must remain inside the Roll20 chat column, and **Refresh** must redraw the panel once.

### Expanded ConfigUI Checks

- [ ] Boolean settings appear as understandable, wrapping buttons.
- [ ] Nested settings such as Almanac submodules, Wayfarer, climate, astronomy, and CombatAssist reminders appear as bounded summaries rather than braces, quoted keys, or serialized arrays.
- [ ] At Roll20's normal chat width, no ConfigUI value forces the panel beyond the visible chat column.
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

Pass when the full and short TokenAssist commands open the same readable guide, marker help explains add/remove/toggle/replace behavior, the settings button clearly reports whether player `--ids` targeting is on or off, and the older spelling produces a clear compatibility notice that recommends `!token-assist` or `!ta` for new macros.

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

Pass when TokenAssist refuses the unsupported image-side property, explains that this feature is outside TokenAssist 1.1.0, and leaves name visibility unchanged. TokenAssist also does not claim default-token writes, computed or name-resolved attributes, advanced controller-list editing, advanced color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, exact TokenMod report-recipient distinctions, duplicate-index marker editing, conditional marker counts, or TokenMod help-handout rebuilding.

#### T12. Restore Campaign Settings

Restore changed token properties, linked attributes, marker choices, module enablement, and the original `players-can-ids` setting. Leave standalone TokenMod removed for normal TokenAssist use. Existing supported `!token-mod` macros may remain, but new macros should use `!token-assist` or `!ta`.

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

**Skip when:** Never skip for v2.0.0 release acceptance. After release, campaigns that deliberately leave InitiativeAssist disabled may skip it.

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
- token name, ID, page, layer, control, selected-bar HP, and death-marker state;
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

**Skip when:** Never skip for v2.0.0 release acceptance. After release, campaigns that deliberately leave CombatAssist disabled may skip it.

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

**What this proves:** ConcentrationAssist reads linked character data, builds the correct save, remembers the last check, uses MarkerService, and exposes its optional HealthService offer setting.

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

Open `!concentration settings`. Pass when the result-message and HP-loss-offer choices are readable, the marker row says **Ready**, and the GM sees **Use Stopwatch** and **Choose Marker**. Open **Choose Marker**, select a built-in marker, and confirm a successful check applies that exact marker. A registered custom campaign marker must also be selectable by name. Each control must change only its named behavior.

On a fresh campaign with no custom marker library, pass when ConcentrationAssist starts with Roll20's built-in `stopwatch` marker and Bless can begin source concentration without raw configuration commands. On an upgraded campaign, a valid saved custom `Concentrating` marker must remain unchanged. Only the exact former stock value that cannot be resolved may self-migrate to `stopwatch`.

### Mixed-Sheet Refusal Boundary

**Skip when:** No D&D 2024 by Roll20 character is available in the test campaign.

Select a linked 2024 character and request a concentration check. Pass when ConcentrationAssist identifies the unsupported 2024 save contract, recommends the native 2024 sheet roll, produces no GameAssist roll, and never substitutes a `+0` bonus. Repeat with a disposable Classic character whose Constitution save data is deliberately unavailable; the result must likewise refuse rather than guess. This does not affect InitiativeAssist's separately verified mixed-sheet support.

The complete privacy, deduplication, stale-button, verified-damage, and hidden-token checks live in [Focused v2.0.0 Concentration HP-Loss Offer Acceptance](#focused-v200-concentration-hp-loss-offer-acceptance).

---

## 11. NPCAssist

**What this proves:** NPCAssist tracks genuine HP transitions, privately reports qualifying Bloodied crossings, changes death markers, audits current-page mismatches, and maintains report buckets and Arc records.

**Why test it:** NPCAssist combines event timing, token eligibility, private HP notices, MarkerService, persistent state, and handout writing.

**Skip when:** NPCAssist is disabled and will not be used.

### Basic Check

On the linked test NPC, start with positive HP:

1. Set the shared NPC HP bar shown by `!ga-health bars` to `0`.
2. Confirm the death marker appears.
3. Set HP above `0`.
4. Confirm the marker clears.
5. Run:

   ```roll20chat
   !npc-death-report
   !npc-death-audit
   ```

Pass when one death is recorded, revival is annotated, and the audit reports no remaining mismatch.

Then set the selected bar to **51 / 100** and lower it to **50 / 100**. Pass when the GM receives one private Bloodied notice, players receive nothing, and no marker or history entry is added by that notice.

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

Pass when the preview states how many markers would be added and removed, explains that current selected-bar HP is the authority, and offers **Confirm Marker Repairs**. Opening the preview must not change HP, markers, history, buckets, or Arcs.

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

Pass when the selected shared NPC bar's current and maximum become the same rolled value and the result identifies the NPC and formula. The other two bars must remain unchanged.

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

**Skip when:** Never skip for v2.0.0 release acceptance. After release, campaigns that leave WelcomeAssist disabled may confirm the disabled check and skip the expanded tests.

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

## 15. EffectAssist

**What this proves:** EffectAssist can coordinate one catalog effect across GameAssist-owned markers, conditions, concentration, and verified 2014-sheet rows while preserving overlap and unrelated campaign state.

**Why test it:** EffectAssist now performs real character-sheet automation. A projection error must never silently delete a marker, condition, concentration state, or modifier row the GM or another Mod already owned.

**Skip when:** Never skip for v2.0.0 release acceptance. In ordinary play, the module may remain disabled until the campaign uses effect records.

### Basic Check

Enable the module and open its GM screen:

```roll20chat
!ga-enable EffectAssist
!effect
!Effect-GM
!Effect-Definitions
!Effect-Active
!Effect-Duration
!Effect-Status
!Effect-Audit
!Effect-Not-A-Command
```

Pass when:

- the GM screen clearly separates applying, reviewing, auditing, and help;
- the six focused launch effects appear and are separated into automation and tracked/manual groups;
- status reports no active effects on a first run;
- audit reports no mismatches;
- the unrecognized command offers a clear route back to the Guide.

Then select one linked disposable 2014 PC target and apply Bless from another linked 2014 PC source through the catalog. Confirm:

- one active effect is recorded;
- the configured Bless marker, the source concentration marker, and the target's `1d4` attack/save modifier rows appear;
- the Effect Applied panel names the exact source whose concentration became active and the resolved marker used;
- the Effect Applied panel offers **End Effect**, `!Effect-Active` identifies the source and target, and `!Effect-Status` stays compact;
- `!Effect-Duration` shows the effect's formal duration and whichever verified providers were available when it began;
- applying the same submitted request twice does not create a duplicate;
- ending concentration or using `!Effect-End` removes the EffectAssist-owned marker and unedited modifier rows, then moves the record to recent history.

Run the complete [Focused v2.0.0 EffectAssist Acceptance](#focused-v200-effectassist-acceptance) before approving the release.

### Expanded EffectAssist Checks

Use the focused section to prove:

- two Bless sources share one non-stacking marker and one attack/save row pair;
- ending one source does not remove the remaining source's projections;
- pre-existing matching markers and rows are preserved after all EffectAssist sources end;
- all six catalog definitions can be applied and ended with their documented automatic and assisted behavior;
- Guidance owns one `1d4` global skill row and removes it safely;
- player casting requires control of the source, stays private, and obeys the GM lockout without exposing GM-only menus;
- Warding Bond creates only its `+1` AC/save rows and Haste creates only its `+2` AC row;
- manual source-concentration removal ends dependent effects and cleans only owned target state;
- edited EffectAssist-created sheet rows are preserved and reported for attention;
- linked NPC targets receive marker/lifecycle behavior without inappropriate PC-only modifier rows;
- mixed valid and invalid selections are rejected without partial application;
- an unlinked recipient is named in the refusal and the message directs the GM to the token's **Represents Character** setting;
- an unresolved concentration marker refuses a concentration-dependent effect before any recipient marker or sheet row is written;
- marker, ConditionAssist, 2014-sheet, concentration, and record-only definitions follow their declared projection contracts;
- audit is read-only and repair requires a fresh, one-use GM authorization;
- changed token identity causes a refusal rather than a write to the wrong representation;
- disabling and re-enabling EffectAssist preserves its records;
- malformed known state is reported without deleting unknown branches.

### EffectAssist 2014 Bless Recognition Checks

**What this proves:** A supported official 2014 Bless spell card can save the GM a few setup clicks without applying an effect or guessing who received it.

**Why test it:** Chat cards contain readable spell text, not reliable token identities. GameAssist must recognize the caster conservatively and still require the GM to choose the actual recipients.

**Skip when:** Skip in ordinary play when cast recognition will remain off. Do not skip for Issue #77 or v2.0.0 release acceptance.

Prepare one disposable caster on the Objects layer using the official D&D 5E by Roll20 2014 sheet. The character name must be unique, the token must be linked to that character, and the player casting Bless must control that source. Prepare one or more disposable linked recipient tokens on the same page.

```roll20chat
!ga-enable EffectAssist
!Effect-Recognition on
!Effect-Casts
```

Cast **Bless** from the caster's 2014 sheet. Pass when the GM receives exactly one private **Bless Cast Recognized** panel naming the correct source and asking the GM to select recipients. Confirm immediately that no Blessed marker, concentration marker, modifier row, or active EffectAssist instance was created.

Select the real recipient tokens and click **Review Selected Recipients**. Pass when the ordinary **Review Effect Application** panel names the correct source and selected targets. Confirm the application and verify the same Bless marker, `1d4` attack/save rows, concentration, overlap, and cleanup behavior proven by the normal catalog test.

Open the pending list:

```roll20chat
!Effect-Casts
```

Pass when the used proposal is gone. Clicking its old review button again must report that it is unavailable and must not create a second effect.

Now test the conservative boundaries:

1. Cast Guidance or another unsupported spell card. No proposal and no effect instance should appear.
2. Give a second character the caster's exact name, or place a second eligible token for the same caster on the active page, then cast Bless again. The GM should receive an actionable ambiguity message and no effect instance.
3. Remove the duplicate, run `!Effect-Recognition off`, and cast Bless. No proposal should appear; `!effect` must still open the complete manual catalog.
4. Restore `!Effect-Recognition on` for campaigns that want the shortcut.

Record failures with the roll-template name shown in the API Console if available, spell name, character name, actor, active page, number of linked source tokens on that page, pending-cast output, and whether any marker, concentration state, sheet row, or active instance changed before confirmation.

### EffectAssist Duration Provider Checks

**What this proves:** CombatAssist and TimeAlmanac can provide conservative elapsed-duration evidence without ending an effect or replaying guessed history.

**Why test it:** These integrations cross module boundaries and persistent state. A bad boundary could remove a valid effect too early, while a missing observer could leave the GM unaware that a duration was reached.

**Skip when:** Skip in ordinary play when EffectAssist duration candidates will remain off. Do not skip for Issue #80 or v2.0.0 release acceptance.

Prepare two disposable linked 2014 characters on the same page. Enable EffectAssist, CombatAssist, and AlmanacAssist; ensure TimeAlmanac is on. Put at least the two characters in Roll20's Turn Tracker and start CombatAssist.

```roll20chat
!ga-enable CombatAssist
!ga-enable AlmanacAssist
!ga-enable EffectAssist
!Combat-Start
!effect
!Effect-Duration
```

Apply **Bless** from one character to the other. Pass when Duration Review identifies the ten-round/one-minute rule and lists both **CombatAssist rounds** and **Almanac time** as providers.

Advance fictional time by one minute:

```roll20chat
!aa-time advance --minutes 1
```

Pass when the GM receives one private **Effect Duration Review** notice with **End Effect** and **Keep Active** buttons. Confirm that Bless, its markers, its sheet rows, and concentration are still present. Click **Keep Active**, reopen `!Effect-Duration`, click **Reopen**, and confirm the candidate is available again. End the exact effect only after that review.

Apply **Haste** during the same encounter, then change an initiative value or add/remove a legitimate tracker row. Pass when CombatAssist accepts or asks the GM to adopt the new baseline without raising a duration candidate. Move one turn backward and confirm no candidate appears. Resume forward play and complete ten full rounds until the Turn Tracker returns to the initiative point at which Haste began. Pass when one candidate appears and Haste remains active.

Apply another timed effect, then end CombatAssist before its round boundary:

```roll20chat
!Combat-End --confirm
```

Pass when the GM receives an encounter-end reminder that asks for review without claiming the effect expired. The effect must remain active.

Test the disabled and restart paths with a fresh one-minute effect:

1. Apply the effect while TimeAlmanac is active.
2. Disable EffectAssist.
3. Advance TimeAlmanac by one minute.
4. Re-enable EffectAssist.
5. Run `!Effect-Duration`.

Pass when no effect changes while EffectAssist is disabled, the saved effect returns after re-enable, and Duration Review creates at most one candidate from the current committed time. Repeat with `!Effect-Durations off`; a newly applied effect should state that its duration remains manual and no elapsed-time candidate should appear.

Finally, move TimeAlmanac backward with its normal confirmation. Pass when the calendar changes but no duration candidate is created and no existing effect is restored, removed, or rewound.

Record failures with the effect name and instance ID, active CombatAssist round/current row, current Almanac date/time, Duration Review output, whether the effect actually changed, and the exact API Console error.

### EffectAssist Failure Evidence

Record:

- the exact command;
- the selected token names;
- the effect instance ID shown by status;
- the audit summary and mismatch reason;
- whether the marker, condition, concentration state, or sheet row existed before application;
- whether another source still owned the same projection;
- any new sandbox exception.

---

## 16. HealAssist

**What this proves:** The healing catalog, private controls, review boundary, and verified HP application respond in a normal Roll20 session.

**Why test it:** HealAssist can appear healthy while a character-sheet field, target prompt, permission, or HealthService write still needs attention.

**Skip when:** Skip only when HealAssist will remain disabled. Do not skip for v2.0.0 release approval.

### Basic Check

Damage a disposable linked official-2014 PC, then run:

```roll20chat
!ga-enable HealAssist
!Heal-GM
!Heal-Guide
!Heal-Status
!Heal-Audit
!Heal
```

Choose one supported spell or potion, target the damaged PC, and review the result. Pass when HP remains unchanged until confirmation, the review shows the roll plus current/proposed/maximum HP, and one confirmation applies the reviewed value. `!ga-health recent` should identify HealAssist as a verified healing producer.

### Expanded HealAssist Checks

Run the complete [Focused v2.0.0 HealAssist Acceptance](#focused-v200-healassist-acceptance) before release approval. For ordinary troubleshooting, prioritize player targeting of a visible non-controlled PC, one stale confirmation, one NPC GM request, maximum-HP capping, player lockout, and HealthService disable/re-enable.

### HealAssist Failure Evidence

Record:

- the chosen action, slot level or formula, and healing ability;
- whether the actor was the GM or a separate player;
- source and recipient token layers, pages, linked characters, and control;
- the private review text without publishing hidden NPC HP;
- HP before review, before confirmation, and after the result;
- `!Heal-Status`, `!Heal-Audit`, and `!ga-health recent` output;
- any new sandbox exception.

---

## 17. AttackAssist

**What this proves:** The guided official-2014 attack path can find the intended character-sheet row, target a visible token, and produce one familiar roll.

**Why test it:** AttackAssist can report healthy even when a selected token, repeating row, target prompt, or player permission needs attention.

**Skip when:** Skip only when AttackAssist will remain disabled. Do not skip for v2.0.0 release approval.

### Basic Check

Use a disposable linked official-2014 PC with at least one repeating attack and a visible target token. Then run:

```roll20chat
!ga-enable AttackAssist
!Attack-GM
!Attack-Guide
!Attack-Status
!Attack-Audit
!Attack
```

Choose the attack, target, and Normal roll. Pass when the familiar attack card appears once as the character, the visible attacker and target are announced after it, and no damage, HP, marker, condition, effect, resource, or Turn Tracker change occurs.

### Expanded AttackAssist Checks

Run the complete [Focused v2.0.0 AttackAssist Acceptance](#focused-v200-attackassist-acceptance) before release approval. For ordinary troubleshooting, prioritize one visible target the player does not control, duplicate attack names, one reused button, one stale row, one hidden-target GM request, player lockout, and CritAssist's next natural-1 response.

### AttackAssist Failure Evidence

Record:

- the actor role and selected source token;
- source sheet type, control, page, and layer;
- the repeating attack name and whether another row shares that name;
- selected target layer/page without publishing a hidden target's identity;
- chosen roll mode and resulting attack card;
- `!Attack-Status`, `!Attack-Audit`, and `!ga-config modules` output;
- whether CritAssist responded and whether any target or Turn Tracker state changed;
- any new sandbox exception.

---

## 18. AlmanacAssist

**What this proves:** The master controls can reach all six AlmanacAssist systems, each system reports its own state, and the module preserves deliberate boundaries between fictional time, descriptive context, and verified sheet changes.

**Why test it:** AlmanacAssist v2.0.0 contains all six promised internal systems. A quick pass should catch missing command routes, disabled-system leakage, stale context, and unsafe rest behavior before game night.

**Skip when:** Skip only when AlmanacAssist will remain disabled in ordinary play. Do not skip for v2.0.0 release approval.

### Basic Check

```roll20chat
!ga-enable AlmanacAssist
!Almanac-GM
!Almanac-Systems
!Almanac-Status
!Almanac-Audit
!date
!clim
!astro
!weather
!enviro
!rest
```

Pass when the master screen names Time, Climate, Astronomy, Weather, Environment, and Rest; every short command opens the matching system exactly once; Status gives a compact current picture; Audit says it is read-only; and Rest asks for an eligible selected 2014 PC rather than writing immediately.

Then advance one fictional day, generate weather, review Environment, and preview a Short Rest on a disposable linked 2014 PC. Confirm the fictional date changes, weather and environment remain readable, and no sheet field changes before the rest confirmation button is used.

### Expanded Checks by Internal System

| System | Test | Pass when | Skip when troubleshooting |
| --- | --- | --- | --- |
| **Time** | Change calendar profiles, cross a boundary, edit Wayfarer, and attempt reversal/exact set. | One elapsed moment is preserved; forward changes work; risky changes require confirmation; real-world GameAssist timestamps are untouched. | No enabled feature uses fictional dates and Time is intentionally off. |
| **Climate** | Create a custom profile, parent region, inheriting child, and override. | Inheritance and overrides are clear; duplicate/ambiguous/invalid changes write nothing. | Climate is intentionally off and Weather uses fallback context. |
| **Astronomy** | Configure a moon and rare event, forecast, then remove Time context. | Phases/daylight are deterministic; forecast is read-only; rare events remain separate; manual fallback works. | Astronomy is intentionally off. |
| **Weather** | Generate, forecast, lock, manually replace, and run without Time/Climate. | Current weather is structured and continuous; forecast does not commit; lock is respected; fallback works. | Weather is intentionally off and Environment uses a manual override. |
| **Environment** | Derive from weather, apply/clear an override, then run without Weather. | Context is descriptive and structured; override remains authoritative; no gameplay state changes. | Environment is intentionally off. |
| **Rest** | Preview/confirm Short and Long Rest, test stale preview, invalid token, and optional Time advance. | Only controlled linked 2014 PCs qualify; exact verified fields change after confirmation; stale/invalid requests write nothing. | Rest is intentionally off; never skip for a reported sheet-write problem. |

Run the complete [Focused v2.0.0 Complete AlmanacAssist Acceptance](#focused-v200-complete-almanacassist-acceptance) before release approval.

### AlmanacAssist Failure Evidence

Record:

- the exact command and internal system;
- `!Almanac-Status` and `!Almanac-Audit` output;
- active calendar/profile/region or manual fallback involved;
- whether the system was enabled before and after the action;
- for rests, selected token names, sheet type, preview text, fields changed after preview, and whether Time advancement was offered;
- any new sandbox exception.

---

# Cross-Component Checks

## Permissions

**Purpose:** Confirm GM-only administration cannot be run by ordinary players.

**Skip when:** Skip only if no player account is available; record it as untested.

From a non-GM account, try:

```roll20chat
!ga-status
!ga-health
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

Pass when GM-only actions do not execute for the player, including HealthService evidence and page-audit output. TokenAssist should refuse explicit-ID targeting while `players-can-ids` is off, but selected-token commands remain available for tokens the player controls. InitiativeAssist should refuse player reroll/management commands while still allowing its public Roll and Roll Options buttons for controlled characters.

## Duplicate Installation

**Purpose:** Confirm one chat command produces one response.

**Skip when:** Never skip when commands respond twice.

If a command produces duplicate output:

1. Check the Mod/API page for multiple GameAssist copies.
2. Check for older standalone scripts that implement the same feature.
3. Keep only the intended implementation.
4. Restart the sandbox and repeat the command.

Scripts that independently respond to `!condition` or `!token-mod`, describe the same marker changes, modify the same NPC HP or selected token bar, control the same token properties or death/concentration/condition markers, process the same Natural 1 workflow, or rewrite the native Turn Tracker may conflict even when their names differ. TokenAssist deliberately suspends only its older `!token-mod` compatibility alias when standalone TokenMod is detected, but the standalone copy should still be removed for normal v2.0.0 use. Use InitiativeAssist Observer mode when another initiative roller owns initiative values; leave CombatAssist disabled when another encounter manager owns turn advancement or rounds.

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

Standalone TokenMod permissions are not a repair for GameAssist marker failures in v2.0.0.

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

