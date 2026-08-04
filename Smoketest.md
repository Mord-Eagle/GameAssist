# GameAssist v2.0.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v2.0.0. It covers the accepted 2014-sheet EffectAssist foundation, the complete AlmanacAssist release track, the shared HealthService foundation, and private ConcentrationAssist HP-loss offers while retaining the established component checks and the v1.8.2 NPCAssist naming and Bloodied regressions.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

---

## Focused v2.0.0 HealthService Acceptance

**What this proves:** HealthService recognizes supported official 2014 PC and linked-NPC HP surfaces, collapses matching linked sheet/token notifications into one transition, records GameAssist-owned writes with verified provenance, and leaves unexplained changes classified as unknown.

**Why test it:** Later concentration offers, healing tools, damage timelines, and PC alerts need one dependable HP signal. This test confirms the shared signal without asking HealthService to guess who attacked, what caused the change, or how temporary HP and resistance should be adjudicated.

**Skip when:** Do not skip for the Issue #83 checkpoint or v2.0.0 release acceptance. After release, campaigns that deliberately disable HealthService and do not use provenance-aware integrations may skip it.

### Preparation

Use a disposable page with:

- one linked official D&D 5E by Roll20 2014 PC token whose bar 1 is linked to the sheet's `hp` attribute;
- one linked NPC token with `npc=1`, bar 1 HP, and a valid `npc_hpformula`;
- HealthService and HPAssist enabled;
- known positive current and maximum HP on both test characters.

Run:

```roll20chat
!ga-health
!ga-health audit
```

Pass when the private status identifies HealthService 1.0.0 as enabled and the read-only audit counts both supported tokens. Unlinked tokens, unsupported sheets, and unlinked 2014-PC bars may be counted as not included; that is not a failure.

### Unknown Observation and Linked Deduplication

1. Note the recent-transition count shown by `!ga-health`.
2. Change the test PC's current HP once through the character sheet, from one valid number to a lower valid number.
3. Wait for the linked token bar to finish updating.
4. Run:

```roll20chat
!ga-health recent
```

Pass when exactly one new entry describes the PC's old and new HP, labels the classification **unknown**, and identifies the source as a Roll20 observation. One direct sheet edit must not appear as separate sheet and token events. Unknown is the correct result: the edit proves that HP decreased, but not why.

### Verified HPAssist Write

Select the linked NPC and run:

```roll20chat
!HP-Selected
!ga-health recent
```

Pass when HPAssist still rolls and writes current/max bar 1 HP, and the newest evidence identifies an **HPAssist verified write**. A blank or invalid starting value should be classified as initialization; replacing an already valid value may be classified as synchronization.

### Clearing and Invalid Evidence

On the disposable NPC token, change bar 1 current HP to blank, then to nonnumeric text. Run `!ga-health recent` after each change.

Pass when blank HP is recorded as **clearing**, nonnumeric HP is recorded as **invalid**, and neither entry is called damage or healing. Restore valid positive HP afterward.

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

Pass when HealthService disables without disabling HPAssist, HPAssist retains its established direct HP-roll behavior, and no shared evidence is retained while the service is off. Re-enabling restores observation without duplicating listeners.

Restart the Roll20 Mod sandbox and run `!ga-health` again. Pass when HealthService is enabled, the recent count has reset because evidence is intentionally sandbox-local, and subsequent supported changes are observed once.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| Supported 2014 PC and NPC surfaces recognized | â˜ Pass â˜ Fail |
| One linked sheet edit produces one unknown transition | â˜ Pass â˜ Fail |
| HPAssist write is declared and verified | â˜ Pass â˜ Fail |
| Clearing and invalid values remain non-causal evidence | â˜ Pass â˜ Fail |
| Disable preserves HPAssist fallback and re-enable does not duplicate listeners | â˜ Pass â˜ Fail |
| Sandbox restart clears bounded evidence and restores observation | â˜ Pass â˜ Fail |

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
- the configured Concentrating marker available;
- MarkerService, HealthService, and ConcentrationAssist enabled.

Open `!concentration settings`. Pass when **HP-Loss Check Offers** is **On** and the GM can turn it off without disabling ConcentrationAssist. From the non-GM test player, the same screen must identify the choice as GM-managed and a crafted config command must be refused.

### Direct PC HP Loss and Deduplication

1. Put the configured Concentrating marker on the PC token.
2. Note the PC's HP, then lower it once through the character sheet by `12`.
3. Wait for the linked token bar to finish updating.

Pass when the GM and controlling player each receive one private **Concentration Check Available** panel showing:

- **Observed HP Loss: 12** rather than claiming a known damage source;
- **DC: 10**;
- Normal, Advantage, and Disadvantage buttons.

The unrelated test player must receive nothing, and the linked attribute/bar update must not create a second logical offer for either recipient.

Click **Advantage** as the controlling player. Pass when the result shows both d20 values, the kept result, the Constitution save bonus, and the complete formula. Click the same offer again; pass when it says the offer expired or was already used and does not roll twice.

### Verified GameAssist Damage

Enable DebugTools, select the concentrating Objects-layer PC or NPC, and run:

```roll20chat
!ga-debug damage --amount 12
!ga-debug damage --amount 12 --apply
```

The first command must remain a dry run. The applied command should create one private offer labeled **Damage: 12**, and `!ga-health recent` should identify a declared-and-verified DebugTools damage write. Disable DebugTools after this check.

### Stale and Ended Offers

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

Put the configured Concentrating marker on the GM-layer NPC and lower its valid bar 1 HP once. Pass when only the GM receives the offer. After the GM clicks a roll mode, no public emote or hidden NPC name appears in player chat.

### Optional Integration and Manual Fallback

Turn **HP-Loss Check Offers** off in `!concentration settings`, lower HP, and confirm no offer appears. Then run a normal selected-token `!concentration --damage 8 --mode normal`; it must still work.

Turn offers back on, disable HealthService, and repeat those two checks. The automatic offer must remain off while the manual command still works. Re-enable HealthService afterward.

### Acceptance Record

| Requirement | Result |
| --- | --- |
| Direct linked PC loss creates one logical private offer | â˜ Pass â˜ Fail |
| Controller and unrelated-player privacy are correct | â˜ Pass â˜ Fail |
| Unknown loss and verified damage use different accurate labels | â˜ Pass â˜ Fail |
| DC and normal/advantage/disadvantage evidence are correct | â˜ Pass â˜ Fail |
| Reused, stale, unauthorized, and ended-concentration buttons refuse safely | â˜ Pass â˜ Fail |
| Healing, setup, synchronization, invalid, and unrelated changes stay silent | â˜ Pass â˜ Fail |
| GM-layer identity and result remain GM-only | â˜ Pass â˜ Fail |
| Setting/service opt-out preserves manual concentration checks | â˜ Pass â˜ Fail |

---

## Focused v2.0.0 EffectAssist Acceptance

**What this proves:** EffectAssist coordinates its focused six-effect launch catalog, applies verified 2014-sheet modifiers where available, authorizes player casting from controlled sources, links concentration-dependent effects to their source, keeps overlapping sources separate, preserves pre-existing campaign state, and repairs only a freshly confirmed safe mismatch.

**Why test it:** v2.0.0 introduces durable effect records and ownership across tokens, concentration, and repeating character-sheet rows. Roll20 must confirm real 2014-sheet worker behavior, token selection, marker storage, module toggles, chat buttons, and persistent state.

**Skip when:** Do not skip this section for v2.0.0 release acceptance. After release, a campaign that keeps EffectAssist disabled may skip it. Campaign updates using EffectAssist should always test Bless, concentration cleanup, overlap, audit, and disable/re-enable; the remaining catalog entries may use the shorter coverage pass below.

### Preparation

Use one disposable page with:

- two linked source tokens representing different official D&D 5E by Roll20 2014 PC sheets;
- one linked 2014 PC target token on the Objects layer;
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
5. Review the preview and click **Apply This Effect**.
6. Open the target's 2014 sheet and inspect its global attack and saving-throw modifiers.
7. Confirm the **Effect Applied** result includes **End Effect**, then run `!Effect-Status`.

**Pass when:**

- one active Bless instance names the chosen source and target;
- the target has the configured Blessed marker;
- the target sheet has one active `Bless (GameAssist)` attack row with `1d4` and one active `Bless (GameAssist)` saving-throw row with `1d4`;
- the source has the configured Concentrating marker and ConcentrationAssist reports it as concentrating;
- unrelated markers, HP, bars, layer, controllers, character attributes, and Turn Tracker rows are unchanged;
- the application result offers an End Effect button without requiring the GM to type the internal instance ID;
- Status remains a compact summary rather than printing the complete active and ended history.

Clear concentration from the source with ConcentrationAssist. Pass when the Bless instance ends, the target marker and both unedited GameAssist sheet rows are removed, and unrelated sheet rows remain.

### Launch Catalog Coverage

Apply each remaining catalog effect once to disposable tokens through `!Effect-Catalog`:

| Effect | Confirm before ending it |
| --- | --- |
| Guidance | Target marker, source concentration, and one active `Guidance (GameAssist)` `1d4` global skill row exist; the preview explains that non-skill ability checks still need a manual d4. |
| Warding Bond | Target marker plus `Warding Bond (GameAssist)` `+1` AC and save rows exist; no concentration marker is added. |
| Holy Weapon | Target marker and source concentration are active; no global damage row changes every weapon. |
| Haste | Target marker, `Haste (GameAssist)` `+2` AC row, and source concentration are active. |
| Pass Without a Trace | Target marker and source concentration are active; the preview identifies the `+10` Stealth step. |

End each effect from its **Effect Applied** panel or `!Effect-Active`. Pass when every owned marker and unedited sheet row clears, concentration clears only when it belongs to that effect, and the assisted instructions remain readable.

Confirm the catalog visibly separates Bless, Guidance, Warding Bond, and Haste under **Marker And Sheet Automation** from Holy Weapon and Pass Without a Trace under **Tracked; Rules Stay Manual**. Gift of Alacrity, Longstrider, and Beacon of Hope should not appear as built-in launch buttons.

### Player Casting, GM Requests, and Lockout

Use a separate non-GM player login with two linked character tokens that player controls. Keep one visible linked recipient controlled by someone else and one disposable linked recipient on the GM layer.

1. As the player, run `!Bless` without selecting a recipient first.
2. Click one caster button, then click **Choose 1 Recipient** and point at the visible linked recipient on the mapã¸îÚ$z{-®éÜj×6²÷6fR&÷w2Â6öæ6VçG&F–öâÂ÷fW&ÆÂæB6ÆVçW&V†f–÷"&÷fVâ'’F†Ræ÷&ÖÂ6FÆörFW7Bà ¤÷VâF†RVæF–ærÆ—7C  ¦&öÆÃ#6†@¢VffV7BÔ67G0¦  ¥72v†VâF†RW6VB&÷÷6Â—2vöæRâ6Æ–6¶–ær—G2öÆB&Wf–Wr'WGFöâv–â×W7B&W÷'BF†B—B—2Væf–Æ&ÆRæB×W7Bæ÷B7&VFR6V6öæBVffV7Bà ¤æ÷rFW7BF†R6öç6W'fF—fR&÷VæF&–W3  £â67BwV–Fæ6R÷"æ÷F†W"Vç7W÷'FVB7VÆÂ6&Bâæò&÷÷6ÂæBæòVffV7B–ç7Fæ6R6†÷VÆBV"à£"âv—fR6V6öæB6†&7FW"F†R67FW"w2W†7BæÖRÂ÷"Æ6R6V6öæBVÆ–v–&ÆRFö¶Vâf÷"F†R6ÖR67FW"öâF†R7F—fRvRÂF†Vâ67B&ÆW72v–ââF†RtÒ6†÷VÆB&V6V—fRâ7F–öæ&ÆRÖ&–wV—G’ÖW76vRæBæòVffV7B–ç7Fæ6Rà£2â&VÖ÷fRF†RGWÆ–6FRÂ'VâVffV7BÕ&V6övæ—F–öâöffÂæB67B&ÆW72âæò&÷÷6Â6†÷VÆBV#²VffV7F×W7B7F–ÆÂ÷VâF†R6ö×ÆWFRÖçVÂ6FÆörà£Bâ&W7F÷&RVffV7BÕ&V6övæ—F–öâöæf÷"6×–vç2F†BvçBF†R6†÷'F7WBà ¥&V6÷&Bf–ÇW&W2v—F‚F†R&öÆÂ×FV×ÆFRæÖR6†÷vâ–âF†R’6öç6öÆR–bf–Æ&ÆRÂ7VÆÂæÖRÂ6†&7FW"æÖRÂ7F÷"Â7F—fRvRÂçVÖ&W"öbÆ–æ¶VB6÷W&6RFö¶Vç2öâF†BvRÂVæF–ærÖ67B÷WGWBÂæBv†WF†W"ç’Ö&¶W"Â6öæ6VçG&F–öâ7FFRÂ6†VWB&÷rÂ÷"7F—fR–ç7Fæ6R6†ævVB&Vf÷&R6öæf—&ÖF–öâà ¢222VffV7D76—7BGW&F–öâ&÷f–FW"6†V6·0 ¢¢¥v†BF†—2&÷fW3¢¢¢6öÖ&D76—7BæBF–ÖTÆÖæ26â&÷f–FR6öç6W'fF—fRVÆ6VBÖGW&F–öâWf–FVæ6Rv—F†÷WBVæF–ærâVffV7B÷"&WÆ––ærwVW76VB†—7F÷'’à ¢¢¥v‡’FW7B—C¢¢¢F†W6R–çFVw&F–öç27&÷72ÖöGVÆR&÷VæF&–W2æBW'6—7FVçB7FFRâ&B&÷VæF'’6÷VÆB&VÖ÷fRfÆ–BVffV7BFöòV&Ç’Âv†–ÆRÖ—76–ærö'6W'fW"6÷VÆBÆVfRF†RtÒVæv&RF†BGW&F–öâv2&V6†VBà ¢¢¥6¶—v†Vã¢¢¢6¶—–â÷&F–æ'’Æ’v†VâVffV7D76—7BGW&F–öâ6æF–FFW2v–ÆÂ&VÖ–âöfbâFòæ÷B6¶—f÷"—77VR3ƒ÷"c"ãã&VÆV6R66WFæ6Rà ¥&W&RGvòF—7÷6&ÆRÆ–æ¶VB#B6†&7FW'2öâF†R6ÖRvRâVæ&ÆRVffV7D76—7BÂ6öÖ&D76—7BÂæBÆÖæ476—7C²Vç7W&RF–ÖTÆÖæ2—2öââWBBÆV7BF†RGvò6†&7FW'2–â&öÆÃ#w2GW&âG&6¶W"æB7F'B6öÖ&D76—7Bà ¦&öÆÃ#6†@¢vÖVæ&ÆR6öÖ&D76—7@¢vÖVæ&ÆRÆÖæ476—7@¢vÖVæ&ÆRVffV7D76—7@¢6öÖ&BÕ7F'@¢VffV7@¢VffV7BÔGW&F–öà¦  ¤Ç’¢¤&ÆW72¢¢g&öÒöæR6†&7FW"FòF†R÷F†W"â72v†VâGW&F–öâ&Wf–Wr–FVçF–f–W2F†RFVâ×&÷VæBööæRÖÖ–çWFR'VÆRæBÆ—7G2&÷F‚¢¤6öÖ&D76—7B&÷VæG2¢¢æB¢¤ÆÖæ2F–ÖR¢¢2&÷f–FW'2à ¤Gfæ6Rf–7F–öæÂF–ÖR'’öæRÖ–çWFS  ¦&öÆÃ#6†@¢×F–ÖRGfæ6RÒÖÖ–çWFW2¦  ¥72v†VâF†RtÒ&V6V—fW2öæR&—fFR¢¤VffV7BGW&F–öâ&Wf–Wr¢¢æ÷F–6Rv—F‚¢¤VæBVffV7B¢¢æB¢¤¶VW7F—fR¢¢'WGFöç2â6öæf—&ÒF†B&ÆW72Â—G2Ö&¶W'2Â—G26†VWB&÷w2ÂæB6öæ6VçG&F–öâ&R7F–ÆÂ&W6VçBâ6Æ–6²¢¤¶VW7F—fR¢¢Â&V÷VâVffV7BÔGW&F–öæÂ6Æ–6²¢¥&V÷Vâ¢¢ÂæB6öæf—&ÒF†R6æF–FFR—2f–Æ&ÆRv–ââVæBF†RW†7BVffV7BöæÇ’gFW"F†B&Wf–Wrà ¤Ç’¢¤†7FR¢¢GW&–ærF†R6ÖRVæ6÷VçFW"ÂF†Vâ6†ævRâ–æ—F–F—fRfÇVR÷"FB÷&VÖ÷fRÆVv—F–ÖFRG&6¶W"&÷râ72v†Vâ6öÖ&D76—7B66WG2÷"6·2F†RtÒFòF÷BF†RæWr&6VÆ–æRv—F†÷WB&—6–ærGW&F–öâ6æF–FFRâÖ÷fRöæRGW&â&6·v&BæB6öæf—&Òæò6æF–FFRV'2â&W7VÖRf÷'v&BÆ’æB6ö×ÆWFRFVâgVÆÂ&÷VæG2VçF–ÂF†RGW&âG&6¶W"&WGW&ç2FòF†R–æ—F–F—fRö–çBBv†–6‚†7FR&Vvââ72v†VâöæR6æF–FFRV'2æB†7FR&VÖ–ç27F—fRà ¤Ç’æ÷F†W"F–ÖVBVffV7BÂF†VâVæB6öÖ&D76—7B&Vf÷&R—G2&÷VæB&÷VæF'“  ¦&öÆÃ#6†@¢6öÖ&BÔVæBÒÖ6öæf—&Ğ¦  ¥72v†VâF†RtÒ&V6V—fW2âVæ6÷VçFW"ÖVæB&VÖ–æFW"F†B6·2f÷"&Wf–Wrv—F†÷WB6Æ–Ö–ærF†RVffV7BW‡—&VBâF†RVffV7B×W7B&VÖ–â7F—fRà ¥FW7BF†RF—6&ÆVBæB&W7F'BF‡2v—F‚g&W6‚öæRÖÖ–çWFRVffV7C  £âÇ’F†RVffV7Bv†–ÆRF–ÖTÆÖæ2—27F—fRà£"âF—6&ÆRVffV7D76—7Bà£2âGfæ6RF–ÖTÆÖæ2'’öæRÖ–çWFRà£Bâ&RÖVæ&ÆRVffV7D76—7Bà£Râ'VâVffV7BÔGW&F–öæà ¥72v†VâæòVffV7B6†ævW2v†–ÆRVffV7D76—7B—2F—6&ÆVBÂF†R6fVBVffV7B&WGW&ç2gFW"&RÖVæ&ÆRÂæBGW&F–öâ&Wf–Wr7&VFW2BÖ÷7BöæR6æF–FFRg&öÒF†R7W'&VçB6öÖÖ—GFVBF–ÖRâ&WVBv—F‚VffV7BÔGW&F–öç2öff²æWvÇ’Æ–VBVffV7B6†÷VÆB7FFRF†B—G2GW&F–öâ&VÖ–ç2ÖçVÂæBæòVÆ6VB×F–ÖR6æF–FFR6†÷VÆBV"à ¤f–æÆÇ’ÂÖ÷fRF–ÖTÆÖæ2&6·v&Bv—F‚—G2æ÷&ÖÂ6öæf—&ÖF–öââ72v†VâF†R6ÆVæF"6†ævW2'WBæòGW&F–öâ6æF–FFR—27&VFVBæBæòW†—7F–ærVffV7B—2&W7F÷&VBÂ&VÖ÷fVBÂ÷"&Wv÷VæBà ¥&V6÷&Bf–ÇW&W2v—F‚F†RVffV7BæÖRæB–ç7Fæ6R”BÂ7F—fR6öÖ&D76—7B&÷VæBö7W'&VçB&÷rÂ7W'&VçBÆÖæ2FFR÷F–ÖRÂGW&F–öâ&Wf–Wr÷WGWBÂv†WF†W"F†RVffV7B7GVÆÇ’6†ævVBÂæBF†RW†7B’6öç6öÆRW'&÷"à ¢222VffV7D76—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  Ğ¢ÒF†RW†7B6öÖÖæC°Ğ¢ÒF†R6VÆV7FVBFö¶VâæÖW3°Ğ¢ÒF†RVffV7B–ç7Fæ6R”B6†÷vâ'’7FGW3°Ğ¢ÒF†RVF—B7VÖÖ'’æBÖ—6ÖF6‚&V6öã°Ğ¢Òv†WF†W"F†RÖ&¶W"Â6öæF—F–öâÂ6öæ6VçG&F–öâ7FFRÂ÷"6†VWB&÷rW†—7FVB&Vf÷&RÆ–6F–öã°Ğ¢Òv†WF†W"æ÷F†W"6÷W&6R7F–ÆÂ÷væVBF†R6ÖR&ö¦V7F–öã°¢Òç’æWr6æF&÷‚W†6WF–öâà ¢ÒÒĞ ¢22bâÆÖæ476—7@ ¢¢¥v†BF†—2&÷fW3¢¢¢F†RÖ7FW"6öçG&öÇ26â&V6‚ÆÂ6—‚ÆÖæ476—7B7—7FV×2ÂV6‚7—7FVÒ&W÷'G2—G2÷vâ7FFRÂæBF†RÖöGVÆR&W6W'fW2FVÆ–&W&FR&÷VæF&–W2&WGvVVâf–7F–öæÂF–ÖRÂFW67&—F—fR6öçFW‡BÂæBfW&–f–VB6†VWB6†ævW2à ¢¢¥v‡’FW7B—C¢¢¢ÆÖæ476—7Bc"ãã6öçF–ç2ÆÂ6—‚&öÖ—6VB–çFW&æÂ7—7FV×2âV–6²726†÷VÆB6F6‚Ö—76–ær6öÖÖæB&÷WFW2ÂF—6&ÆVB×7—7FVÒÆV¶vRÂ7FÆR6öçFW‡BÂæBVç6fR&W7B&V†f–÷"&Vf÷&RvÖRæ–v‡Bà ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’v†VâÆÖæ476—7Bv–ÆÂ&VÖ–âF—6&ÆVB–â÷&F–æ'’Æ’âFòæ÷B6¶—f÷"c"ãã&VÆV6R&÷fÂà ¢222&6–26†V6° ¦&öÆÃ#6†@¢vÖVæ&ÆRÆÖæ476—7@¢ÆÖæ2ÔtĞ¢ÆÖæ2Õ7—7FV×0¢ÆÖæ2Õ7FGW0¢ÆÖæ2ÔVF—@¢FFP¢6Æ–Ğ¢7G&ğ¢vVF†W ¢Vçf—&ğ¢&W7@¦  ¥72v†VâF†RÖ7FW"67&VVâæÖW2F–ÖRÂ6Æ–ÖFRÂ7G&öæö×’ÂvVF†W"ÂVçf—&öæÖVçBÂæB&W7C²WfW'’6†÷'B6öÖÖæB÷Vç2F†RÖF6†–ær7—7FVÒW†7FÇ’öæ6S²7FGW2v—fW26ö×7B7W'&VçB–7GW&S²VF—B6—2—B—2&VBÖöæÇ“²æB&W7B6·2f÷"âVÆ–v–&ÆR6VÆV7FVB#B2&F†W"F†âw&—F–ær–ÖÖVF–FVÇ’à ¥F†VâGfæ6RöæRf–7F–öæÂF’ÂvVæW&FRvVF†W"Â&Wf–WrVçf—&öæÖVçBÂæB&Wf–Wr6†÷'B&W7BöâF—7÷6&ÆRÆ–æ¶VB#B2â6öæf—&ÒF†Rf–7F–öæÂFFR6†ævW2ÂvVF†W"æBVçf—&öæÖVçB&VÖ–â&VF&ÆRÂæBæò6†VWBf–VÆB6†ævW2&Vf÷&RF†R&W7B6öæf—&ÖF–öâ'WGFöâ—2W6VBà ¢222W‡æFVB6†V6·2'’–çFW&æÂ7—7FVĞ §Â7—7FVÒÂFW7BÂ72v†VâÂ6¶—v†VâG&÷V&ÆW6†ö÷F–ærÀ§ÂÒÒÒÂÒÒÒÂÒÒÒÂÒÒÒÀ§Â¢¥F–ÖR¢¢Â6†ævR6ÆVæF"&öf–ÆW2Â7&÷72&÷VæF'’ÂVF—Bv–f&W"ÂæBGFV×B&WfW'6ÂöW†7B6WBâÂöæRVÆ6VBÖöÖVçB—2&W6W'fVC²f÷'v&B6†ævW2v÷&³²&—6·’6†ævW2&WV—&R6öæf—&ÖF–öã²&VÂ×v÷&ÆBvÖT76—7BF–ÖW7F×2&RVçF÷V6†VBâÂæòVæ&ÆVBfVGW&RW6W2f–7F–öæÂFFW2æBF–ÖR—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¤6Æ–ÖFR¢¢Â7&VFR7W7FöÒ&öf–ÆRÂ&VçB&Vv–öâÂ–æ†W&—F–ær6†–ÆBÂæB÷fW'&–FRâÂ–æ†W&—Fæ6RæB÷fW'&–FW2&R6ÆV#²GWÆ–6FRöÖ&–wV÷W2ö–çfÆ–B6†ævW2w&—FRæ÷F†–ærâÂ6Æ–ÖFR—2–çFVçF–öæÆÇ’öfbæBvVF†W"W6W2fÆÆ&6²6öçFW‡BâÀ§Â¢¤7G&öæö×’¢¢Â6öæf–wW&RÖööâæB&&RWfVçBÂf÷&V67BÂF†Vâ&VÖ÷fRF–ÖR6öçFW‡BâÂ†6W2öF–Æ–v‡B&RFWFW&Ö–æ—7F–3²f÷&V67B—2&VBÖöæÇ“²&&RWfVçG2&VÖ–â6W&FS²ÖçVÂfÆÆ&6²v÷&·2âÂ7G&öæö×’—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¥vVF†W"¢¢ÂvVæW&FRÂf÷&V67BÂÆö6²ÂÖçVÆÇ’&WÆ6RÂæB'Vâv—F†÷WBF–ÖRô6Æ–ÖFRâÂ7W'&VçBvVF†W"—27G'V7GW&VBæB6öçF–çV÷W3²f÷&V67BFöW2æ÷B6öÖÖ—C²Æö6²—2&W7V7FVC²fÆÆ&6²v÷&·2âÂvVF†W"—2–çFVçF–öæÆÇ’öfbæBVçf—&öæÖVçBW6W2ÖçVÂ÷fW'&–FRâÀ§Â¢¤Vçf—&öæÖVçB¢¢ÂFW&—fRg&öÒvVF†W"ÂÇ’ö6ÆV"â÷fW'&–FRÂF†Vâ'Vâv—F†÷WBvVF†W"âÂ6öçFW‡B—2FW67&—F—fRæB7G'V7GW&VC²÷fW'&–FR&VÖ–ç2WF†÷&—FF—fS²æòvÖWÆ’7FFR6†ævW2âÂVçf—&öæÖVçB—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¥&W7B¢¢Â&Wf–Wrö6öæf—&Ò6†÷'BæBÆöær&W7BÂFW7B7FÆR&Wf–WrÂ–çfÆ–BFö¶VâÂæB÷F–öæÂF–ÖRGfæ6RâÂöæÇ’6öçG&öÆÆVBÆ–æ¶VB#B72VÆ–g“²W†7BfW&–f–VBf–VÆG26†ævRgFW"6öæf—&ÖF–öã²7FÆRö–çfÆ–B&WVW7G2w&—FRæ÷F†–ærâÂ&W7B—2–çFVçF–öæÆÇ’öfc²æWfW"6¶—f÷"&W÷'FVB6†VWB×w&—FR&ö&ÆVÒâÀ ¥'VâF†R6ö×ÆWFR´fö7W6VBc"ãã6ö×ÆWFRÆÖæ476—7B66WFæ6UÒ‚6fö7W6VB×c#Ö6ö×ÆWFRÖÆÖæ676—7BÖ66WFæ6R’&Vf÷&R&VÆV6R&÷fÂà ¢222ÆÖæ476—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  ¢ÒF†RW†7B6öÖÖæBæB–çFW&æÂ7—7FVÓ°¢ÒÆÖæ2Õ7FGW6æBÆÖæ2ÔVF—F÷WGWC°¢Ò7F—fR6ÆVæF"÷&öf–ÆR÷&Vv–öâ÷"ÖçVÂfÆÆ&6²–çföÇfVC°¢Òv†WF†W"F†R7—7FVÒv2Væ&ÆVB&Vf÷&RæBgFW"F†R7F–öã°¢Òf÷"&W7G2Â6VÆV7FVBFö¶VâæÖW2Â6†VWBG—RÂ&Wf–WrFW‡BÂf–VÆG26†ævVBgFW"&Wf–WrÂæBv†WF†W"F–ÖRGfæ6VÖVçBv2öffW&VC°¢Òç’æWr6æF&÷‚W†6WF–öâà ¢ÒÒĞ ¢27&÷72Ô6ö×öæVçB6†V6·0 Ğ¢22W&Ö—76–öç0Ğ Ğ¢¢¥W'÷6S¢¢¢6öæf—&ÒtÒÖöæÇ’FÖ–æ—7G&F–öâ6ææ÷B&R'Vâ'’÷&F–æ'’Æ–W'2àĞ Ğ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’–bæòÆ–W"66÷VçB—2f–Æ&ÆS²&V6÷&B—B2VçFW7FVBàĞ Ğ¤g&öÒæöâÔtÒ66÷VçBÂG'“  ¦&öÆÃ#6†@¢v×7FGW0¢vÖ†VÇF€¢vÖ6öæf–rÖöGVÆW0¢6öæF—F–öâ6öæf–pĞ¢6öæF—F–öâFB&öæPĞ¢Fö¶VâÖ76—7B6öæf–pĞ¢Fö¶VâÖ76—7BÒÖ–G2Dô´Tåô”BÒÖfÆ—6†÷væÖPĞ¢–æ—BÕ% Ğ¢vVÆ6öÖRÔææ÷Væ6PĞ¢…ÔÆÀĞ¢ç2ÖFVF‚ÖVF—@Ğ¦ Ğ Ğ¥72v†VâtÒÖöæÇ’7F–öç2Fòæ÷BW†V7WFRf÷"F†RÆ–W"Â–æ6ÇVF–ær†VÇF…6W'f–6RWf–FVæ6RæBvRÖVF—B÷WGWBâFö¶Vä76—7B6†÷VÆB&VgW6RW‡Æ–6—BÔ”BF&vWF–ærv†–ÆRÆ–W'2Ö6âÖ–G6—2öfbÂ'WB6VÆV7FVB×Fö¶Vâ6öÖÖæG2&VÖ–âf–Æ&ÆRf÷"Fö¶Vç2F†RÆ–W"6öçG&öÇ2â–æ—F–F—fT76—7B6†÷VÆB&VgW6RÆ–W"&W&öÆÂöÖævVÖVçB6öÖÖæG2v†–ÆR7F–ÆÂÆÆ÷v–ær—G2V&Æ–2&öÆÂæB&öÆÂ÷F–öç2'WGFöç2f÷"6öçG&öÆÆVB6†&7FW'2à Ğ¢22GWÆ–6FR–ç7FÆÆF–öàĞ Ğ¢¢¥W'÷6S¢¢¢6öæf—&ÒöæR6†B6öÖÖæB&öGV6W2öæR&W7öç6RàĞ Ğ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—v†Vâ6öÖÖæG2&W7öæBGv–6RàĞ Ğ¤–b6öÖÖæB&öGV6W2GWÆ–6FR÷WGWC Ğ Ğ£â6†V6²F†RÖöBô’vRf÷"×VÇF—ÆRvÖT76—7B6÷–W2àĞ£"â6†V6²f÷"öÆFW"7FæFÆöæR67&—G2F†B–×ÆVÖVçBF†R6ÖRfVGW&RàĞ£2â¶VWöæÇ’F†R–çFVæFVB–×ÆVÖVçFF–öâàĞ£Bâ&W7F'BF†R6æF&÷‚æB&WVBF†R6öÖÖæBàĞ Ğ¥67&—G2F†B–æFWVæFVçFÇ’&W7öæBFò6öæF—F–öæ÷"Fö¶VâÖÖöFÂFW67&–&RF†R6ÖRÖ&¶W"6†ævW2ÂÖöF–g’F†R6ÖRå2…ö&"Â6öçG&öÂF†R6ÖRFö¶Vâ&÷W'F–W2÷"FVF‚ö6öæ6VçG&F–öâö6öæF—F–öâÖ&¶W'2Â&ö6W72F†R6ÖRæGW&Âv÷&¶fÆ÷rÂ÷"&Ww&—FRF†RæF—fRGW&âG&6¶W"Ö’6öæfÆ–7BWfVâv†VâF†V—"æÖW2F–ffW"âFö¶Vä76—7BFVÆ–&W&FVÇ’7W7VæG2öæÇ’—G2öÆFW"Fö¶VâÖÖöF6ö×F–&–Æ—G’Æ–2v†Vâ7FæFÆöæRFö¶VäÖöB—2FWFV7FVBÂ'WBF†R7FæFÆöæR6÷’6†÷VÆB7F–ÆÂ&R&VÖ÷fVBf÷"æ÷&ÖÂc"ããW6RâW6R–æ—F–F—fT76—7Bö'6W'fW"ÖöFRv†Vâæ÷F†W"–æ—F–F—fR&öÆÆW"÷vç2–æ—F–F—fRfÇVW3²ÆVfR6öÖ&D76—7BF—6&ÆVBv†Vâæ÷F†W"Væ6÷VçFW"ÖævW"÷vç2GW&âGfæ6VÖVçB÷"&÷VæG2àĞ Ğ¢227FFR&V6÷fW'Ğ Ğ¢¢¥W'÷6S¢¢¢6öæf—&Ò¶æ÷vâ7FFR6öçF–æW'26VÆbÖ†VÂv†–ÆRVæ¶æ÷vâ'&æ6†W2&R&W6W'fVBf÷"&Wf–WràĞ Ğ¢¢¥6¶—v†Vã¢¢¢6¶—–çFVçF–öæÂ7FFR6÷''WF–öâ÷WG6–FRF—7÷6&ÆRFW7B6×–vâàĞ Ğ¥6fR&Wf–Ws Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW0Ğ¢vÖÖWG&–70Ğ¢vÖ6öæf–rÆ—7@Ğ¦ Ğ Ğ¤Fòæ÷B'VâvÖ6öæf–r6ÆVçWÖW&VÇ’FòFW7B—Bâ6ÆVçWFVÆWFW2Væ¶æ÷vâ÷"÷'†æVB7FFRävÖT76—7F'&æ6†W2gFW"W‡Æ–6—B6öæf—&ÖF–öâàĞ Ğ¢ÒÒĞĞ Ğ¢2G&÷V&ÆW6†ö÷F–ær'’7–×FöĞĞ Ğ¢22æ÷F†–ær&W7öæG0Ğ Ğ£âv—Bf÷"F†RÖöB6æF&÷‚&W7F'BàĞ£"â6†V6²F†R’6öç6öÆRf÷"vÖT76—7B7–çF‚÷"&VfW&Væ6RW'&÷"àĞ£2â6öæf—&ÒvÖT76—7B—2Væ&ÆVBàĞ£Bâ&VÖ÷fRGWÆ–6FR÷"'&ö¶Vâ6÷–W2àĞ£Râ&WG'’v×7FGW6àĞ Ğ¥6öÇfRF†R6÷&R&ö&ÆVÒ&Vf÷&RFW7F–ærÖöGVÆW2àĞ Ğ¢22öæRÖöGVÆR—26–ÆVç@Ğ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¢vÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSàĞ¢vÖVæ&ÆRÄÖöGVÆT÷%6W'f–6TæÖSàĞ¦ Ğ Ğ¤6†V6²F†R6öæf–wW&VB7FFRÂ'Vææ–ær7FFRÂW†7B6öÖÖæB7VÆÆ–ærÂæBFW7B×Fö¶VâVÆ–v–&–Æ—G’â&VBF†RVæ&ÆR&W7öç6R&Vf÷&R6†æv–ærÖ÷&R6WGF–æw2àĞ Ğ¢22Ö&¶W"WFöÖF–öâf–Ç0Ğ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW2ÒÖFWF–Ç0Ğ¢vÖ6öæf–rvWBå476—7BFVDÖ&¶W Ğ¢vÖ6öæf–rvWB6öæ6VçG&F–öä76—7BÖ&¶W Ğ¢Fö¶VâÖ76—7BÒÖ†VÇ×7FGW6Ö&¶W'0Ğ¢6öæF—F–öâ7FGW0Ğ¢ç2ÖFVF‚ÖVF—@Ğ¢ç2ÖFVF‚×&W— Ğ¢6öæ6VçG&F–öâÒ×7FGW0Ğ¦ Ğ Ğ¤6†V6³ Ğ Ğ¢ÒÖ&¶W%6W'f–6R—2Væ&ÆVBàĞ¢ÒF†RffV7FVBÖöGVÆR—2'Vææ–æràĞ¢ÒF†RFö¶Vâ—2öâF†Rö&¦V7G2Æ–W"æB&W&W6VçG2F†R&–v‡B6†&7FW"àĞ¢Òå476—7BFö¶Vç2†fRç3ÓàĞ¢ÒF†R6öæf–wW&VB'V–ÇBÖ–âÖ&¶W"Â7W7FöÒF—7Æ’æÖRÂ÷"W†7B7F÷&VBFrW†—7G2àĞ¢ÒF†R…÷"6öæ6VçG&F–öâ÷WF6öÖR7GVÆÇ’&WVW7FVBF†RW‡V7FVBÖ&¶W"7FFRàĞ Ğ¥7FæFÆöæRFö¶VäÖöBW&Ö—76–öç2&Ræ÷B&W—"f÷"vÖT76—7BÖ&¶W"f–ÇW&W2–âc"ããàĞ Ğ¥7F÷FW7F–æræB&W÷'BF†R&Vf÷&RögFW"Ö&¶W"fÇVW2–bâVç&VÆFVBÖ&¶W"÷"çVÖ&W"6†ævW2àĞ Ğ¢22å2…FöW2æ÷B&öÆÀĞ Ğ¤6öæf—&Ó Ğ Ğ¢ÒFö¶Vâ—26VÆV7FVB÷"öâF†R7W'&VçBÆ–W"vS°Ğ¢ÒFö¶Vâ—2öâF†Rö&¦V7G2Æ–W#°Ğ¢ÒFö¶Vâ&W&W6VçG26†&7FW#°Ğ¢Ò6†&7FW"†2ç3Ó°Ğ¢Ò6†&7FW"†2fÆ–Bç5ö‡f÷&×VÆÂ7V6‚2FC‚³†àĞ Ğ¢227&—D76—7BFöW2æ÷B&öÆÀĞ Ğ¤6öæf—&Ó Ğ Ğ¢Ò7&—FgVÖ&ÆR†VÇ&W7öæG3°Ğ¢ÒF†RW†7B&WV—&VBF&ÆRW†—7G2æB†2â—FVÓ°Ğ¢ÒF†RF—&V7BF&ÆR6öÖÖæBv÷&·3°Ğ¢ÒWFöÖF–2FWFV7F–öâW6W27W÷'FVBFV×ÆFRv—F‚C#æGW&ÂàĞ Ğ¢22VWVR÷"W'&÷"6÷VçG2–æ7&V6PĞ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW2ÒÖFWF–Ç0Ğ¢vÖÖWG&–70Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¦ Ğ Ğ¥VWVRÆVæwF‚FW67&–&W2W‡Æ–6—BVWVVBv÷&²æBÖöGVÆRÆ–fV7–6ÆRG&ç6—F–öç2âF–ÖV÷WB6â&VÆV6RF†RVWVR'WB6ææ÷BFW&Ö–æFRVæFW&Ç––ær&öÆÃ#÷"¦f67&—Bv÷&²àĞ Ğ¥&V6÷&BWf–FVæ6R&Vf÷&R&W6WGF–ærÖWG&–72àĞ Ğ¢ÒÒĞĞ Ğ¢2'Vr&W÷'BWf–FVæ6PĞ Ğ¥v†VâFW7Bf–Ç2Â&V6÷&C Ğ Ğ¢Ò²ÒvÖT76—7BfW'6–öâàĞ¢Ò²Ò6ö×öæVçBæBçVÖ&W&VBFW7BàĞ¢Ò²ÒW†7B6öÖÖæB÷"Fö¶Vâ7F–öâàĞ¢Ò²ÒW‡V7FVB&W7VÇBàĞ¢Ò²Ò7GVÂ&W7VÇBàĞ¢Ò²Òv×7FGW2ÒÖFWF–Ç6÷WGWBàĞ¢Ò²ÒvÖ6öæf–rÖöGVÆW6÷WGWBàĞ¢Ò²Ò&VÆWfçBvÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSæ÷WGWBàĞ¢Ò²ÒW†7B’6öç6öÆRW'&÷"àĞ¢Ò²ÒFö¶VâæÖRÂ”BÂÆ–W"ÂæBÆ–æ¶vRàĞ¢Ò²Ò&VÆWfçB6†&7FW"GG&–'WFW2àĞ¢Ò²ÒÖ&¶W"fÇVW2&Vf÷&RæBgFW"Âv†VâÆ–6&ÆRàĞ¢Ò²Òv†WF†W"7FæFÆöæRFö¶VäÖöB÷"7FæFÆöæR7FGW4–æfòv2–ç7FÆÆVB÷"FWFV7FVBàĞ¢Ò²Òv†WF†W"GWÆ–6FR÷"÷fW&Æ–ær67&—G2vW&R7F—fRàĞ Ğ¢ÒÒĞĞ Ğ¢2&RÕ6W76–öâ6†V6°Ğ Ğ¤–ÖÖVF–FVÇ’&Vf÷&R6W76–öã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW0Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¦ Ğ Ğ¥F†Vâ'VâöæÇ’F†R&6–26†V6·2f÷"fVGW&W2F†R6W76–öâv–ÆÂW6S Ğ Ğ¢ÒÖ&¶W%6W'f–6S¢öæRF—7÷6&ÆRFVF‚÷&Wf—fÂÖ&¶W"7–6ÆRàĞ¢Ò6öæf–uT“¢÷Vâ6WGF–æw2àĞ¢Ò7&—D76—7C¢7&—FgVÖ&ÆR†VÇàĞ¢Ò6öæF—F–öä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷Vâ6öæF—F–öæÂæB'Vâ6öæF—F–öâ7FGW6àĞ¢ÒFö¶Vä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷VâFö¶VâÖ76—7B†VÇÂæBfÆ—öæR†&ÖÆW72f—6–&–Æ—G’6WGF–ærGv–6RàĞ¢Ò6öæ6VçG&F–öä76—7C¢6öæ6VçG&F–öâÒ×7FGW6àĞ¢Òå476—7C¢ç2ÖFVF‚×&W÷'F²W6Rç2ÖFVF‚ÖVF—Fv†Vâ6†V6¶–ærÖ&¶W'2æB÷Vâ&W—"öæÇ’–bÖ—6ÖF6‚—2–çFVçF–öæÂàĞ¢Ò…76—7C¢&öÆÂöæRF—7÷6&ÆR6VÆV7FVBå2àĞ¢ÒFV'VuFööÇ3¢6¶—VæÆW72FVÆ–&W&FVÇ’æVVFVBàĞ¢Ò–æ—F–F—fT76—7C¢÷Vâ–æ—BÔtÖv†Vâ&—fFRVæ6÷VçFW"6WGWv–ÆÂ&RW6VBàĞ¢ÒvVÆ6öÖT76—7C¢v†VâVæ&ÆVBÂ&Wf–WrF†Rw&VWF–æræB6öæf—&Ò7FGW2&Vf÷&RF†R6W76–öã²Fòæ÷BW6RÖçVÂææ÷Væ6RÖW&VÇ’2†VÇF‚6†V6²àĞ Ğ¤Fòæ÷BF—66÷fW"Ö&¶W"Â…Â÷"F&ÆR&ö&ÆVÒf÷"F†Rf—'7BF–ÖRGW&–ær6öÖ&BàĞ