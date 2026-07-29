# GameAssist v2.0.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v2.0.0. It covers the accepted 2014-sheet EffectAssist foundation and the complete AlmanacAssist release track while retaining the established component checks and the v1.8.2 NPCAssist naming and Bloodied regressions.

The tests are organized by component. Each section explains:

- what the test proves;
- why the result matters;
- when the test may be skipped;
- the smallest useful check;
- additional checks for release testing or troubleshooting.

Run commands one at a time. A multi-line command block is a checklist, not a single block to paste into Roll20 chat.

> Use a disposable page and test tokens for anything that changes HP, markers, handouts, saved history, or module state.

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

### Player Casting and GM Lockout

Use a separate non-GM player login with one linked character token that player controls.

1. As the player, select one or more linked target tokens and run `!effect`.
2. Apply Bless using the player's controlled character as the source.
3. Confirm the review is whispered only to that player, then apply it.
4. Confirm the result includes **End Effect** and use that button.
5. As GM, run `!Effect-GM` and click **Lock** under Player Casting.
6. As the player, run `!Bless` with a target selected.
7. Restore **Allow** from the GM control center.

**Pass when:** the player can apply and end a built-in effect only from a source they control; the player cannot see custom, audit, repair, or GM configuration controls; lockout produces a clear private notice and writes nothing; restoring access works without a sandbox restart.

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

1. Add the configured Bless marker and matching `Bless (GameAssist)` attack/save rows to the target manually before creating an EffectAssist record.
2. Apply one Bless instance.
3. End that instance.

**Pass when:** the marker and pre-existing rows remain. EffectAssist must record that matching state existed before its ownership began and must not claim or remove it.

### Generic Paths

With the target selected, open `!Effect-GM` and test:

1. **Record Only** â€” use a temporary name; confirm no marker or condition is added.
2. **Generic Marker** â€” choose a harmless marker; confirm it is added and removed when the final source ends.
3. **Condition Effect** â€” choose a disposable configured condition; confirm ConditionAssist owns the condition lookup and MarkerService owns the marker change.

**Pass when:** each record appears in Status, no unsupported text or unsafe key corrupts state, and every final cleanup preserves unrelated markers.

**Skip note:** The Condition Effect step may be skipped when ConditionAssist is intentionally disabled. Record Only must still work.

### Atomic Invalid Selection

1. Select one linked target and one unlinked token together.
2. Try to apply Bless.

**Pass when:** EffectAssist refuses the complete request, creates no instance, and changes neither token. It must not partially apply to the eligible selection.

### Read-Only Audit and Confirmed Repair

1. Apply Bless to the linked target.
2. Remove its visible Bless marker manually.
3. Run `!Effect-Audit`.
4. Confirm the audit identifies the target and missing projection and says it changed nothing.
5. Click **Confirm Current Repairs**.
6. Run `!Effect-Audit` again.

**Pass when:** the first audit does not restore the marker or end the source's concentration, the generated confirmation restores and verifies the target marker, and the second audit is clean. Removing only a target projection is repairable drift, not an instruction to end every target's effect.

Then remove the source's Concentrating marker. Pass when the dependent Bless record ends and its unneeded target marker and sheet rows are cleaned up.

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
!Effect-Definitions
!Effect-Audit
!Effect-Manual
!Effect-Impossible
!effect status
```

**Pass when:** commands are case-insensitive, GM/DM/Menu open the same primary controls, the stable manual is created or updated once, the unknown route offers useful recovery buttons, and the spaced command family reaches the same module exactly once.

---

## Focused v2.0.0 Complete AlmanacAssist Acceptance

**What this proves:** AlmanacAssist ships as one complete module whose Time, Climate, Astronomy, Weather, Environment, and Rest systems are independently usable, preserve valid state while disabled, and exchange optional context without turning one system into a hidden prerequisite for another.

**Why test it:** v2.0.0 must not publish a calendar shell while describing a world-management suite. This track proves the six systems, their boundaries, their shared navigation, and RestAlmanac's deliberate 2014-sheet writes inside the real Roll20 sandbox.

**Skip when:** Do not skip this section for v2.0.0 release acceptance. After release, campaigns that keep AlmanacAssist disabled may skip it. Within ordinary troubleshooting, test only the enabled internal system and any optional context provider involved.

### Preparation and Master Controls

Use a disposable campaign page and one linked official D&D 5E by Roll20 2014 PC token with current and maximum HP, Hit Dice, and at least one spell-slot level configured.

```roll20chat
!ga-config modules
!ga-enable AlmanacAssist
!Almanac-GM
!Almanac-Systems
!Almanac-Status
!Almanac-Audit
!Almanac-Manual
!Almanac-Impossible
```

**Pass when:** AlmanacAssist begins disabled on a clean v2.0.0 state; enabling it starts all six saved-on systems; GM and Systems provide clear private navigation; Status identifies every system; Audit explicitly changes nothing; Manual creates or updates one stable handout; and the bad command offers a useful route back.

### TimeAlmanac

**Why:** Every optional time consumer must receive one stable fictional-minute authority without changing real-world GameAssist timestamps.

1. Open `!cal` and note the current fictional date and time.
2. Advance one hour, one day, and across one month boundary through the generated controls.
3. Switch among Standard, Solamnic, and Harptos; confirm the underlying elapsed moment is preserved.
4. Open `!aa-wayfarer`, configure a disposable calendar change and one holiday, then verify the date display.
5. Try to reverse time or set an exact date without confirmation, then use the generated confirmation.
6. From a player account, run `!date` and `!time`.

**Pass when:** forward changes are recorded; profile changes reinterpret rather than reset elapsed time; reversal/exact setting requires confirmation; the Wayfarer holiday appears on its date; players receive read-only output; and the table timezone, log timestamps, and NPCAssist Session date do not change.

### ClimateAlmanac

**Why:** Weather needs optional regional context, but climate settings must also remain useful and understandable by themselves.

1. Open `!clim` and its Profiles and Setup screens.
2. Create one custom profile with a unique name.
3. Create a parent region and one child that inherits its profile.
4. Change the parent profile and confirm the inheriting child follows it.
5. Add a child override and confirm only that value differs.
6. Tryß¾¶ŞÚ$z{-®éÜj×v—C²72v†VâÆ—fRVæ&ÆVÖVçB7F–ÆÂFöW2æ÷B÷7BâWFöÖF–2&V†f–÷"&W7VÖW2öæÇ’gFW"æ÷F†W"6æF&÷‚&VÆöBàĞ Ğ¤f÷"F†R÷&F–æ'’†VÇF‡’×7F'BFW7BÂWfW'’÷F†W"6öæf–wW&VBÖöGVÆR6†÷VÆB&R'Vææ–ær&Vf÷&RF†Rw&VWF–ærV'2âFòæ÷B–çFVçF–öæÆÇ’FÖvRÆ—fR6×–vâFòf÷&6RF†Rf–ÇW&RFƒ²F†RWFöÖFVB†&æW726÷fW'2F†R&÷VæFVBv—BæBæÖVBÖ6ö×öæVçB&VgW6Ââ–b&VÂ7F'GWf–ÇW&RÇ&VG’W†—7G2Â72v†VâvVÆ6öÖT76—7B6¶—2F†Rw&VWF–æræBæÖW2F†R–æ7F—fR6ö×öæVçBFòF†RtÒàĞ Ğ¢222vVÆ6öÖT76—7Bf–ÇW&RWf–FVæ6PĞ Ğ¥&V6÷&C Ğ Ğ¢ÒVæ&ÆVB÷'Vææ–ær7FFRg&öÒvÖ6öæf–rÖöGVÆW6°Ğ¢ÒvVÆ6öÖRÕ7FGW6÷WGWC°Ğ¢Ò6VÆV7FVBÖöFRÂFVÆ’Â†VFW"6WGF–ærÂæB7W7FöÒÖÆ—7B6÷VçC°Ğ¢Òv†WF†W"F†R7F–öâv2&Wf–WrÂÖçVÂææ÷Væ6RÂ÷"WFöÖF–27F'GW°Ğ¢Òv†WF†W"æ÷F†W"Væ&ÆVBvÖT76—7B6ö×öæVçBv2–æ7F—fS°Ğ¢ÒV&Æ–2æBtÒ×v†—7W"÷WGWC°Ğ¢ÒW†7B’6öç6öÆRW†6WF–öâ÷"v&æ–æràĞ Ğ¥&W7F÷&RF†RFW6—&VB6×–vâw&VWF–ær6öæf–wW&F–öââÆVfRvVÆ6öÖT76—7BF—6&ÆVBv†VâF†R6×–vâFöW2æ÷B–çFVæBFòW6RWFöÖF–2w&VWF–æw2àĞ Ğ¢ÒÒĞĞ Ğ¢22RâVffV7D76—7@Ğ Ğ¢¢¥v†BF†—2&÷fW3¢¢¢VffV7D76—7B6â6ö÷&F–æFRöæR6FÆörVffV7B7&÷72vÖT76—7BÖ÷væVBÖ&¶W'2Â6öæF—F–öç2Â6öæ6VçG&F–öâÂæBfW&–f–VB#B×6†VWB&÷w2v†–ÆR&W6W'f–ær÷fW&ÆæBVç&VÆFVB6×–vâ7FFRàĞ Ğ¢¢¥v‡’FW7B—C¢¢¢VffV7D76—7Bæ÷rW&f÷&×2&VÂ6†&7FW"×6†VWBWFöÖF–öââ&ö¦V7F–öâW'&÷"×W7BæWfW"6–ÆVçFÇ’FVÆWFRÖ&¶W"Â6öæF—F–öâÂ6öæ6VçG&F–öâ7FFRÂ÷"ÖöF–f–W"&÷rF†RtÒ÷"æ÷F†W"ÖöBÇ&VG’÷væVBàĞ Ğ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—f÷"c"ãã&VÆV6R66WFæ6Râ–â÷&F–æ'’Æ’ÂF†RÖöGVÆRÖ’&VÖ–âF—6&ÆVBVçF–ÂF†R6×–vâW6W2VffV7B&V6÷&G2àĞ Ğ¢222&6–26†V6°Ğ Ğ¤Væ&ÆRF†RÖöGVÆRæB÷Vâ—G2tÒ67&VVã Ğ Ğ¦&öÆÃ#6†@Ğ¢vÖVæ&ÆRVffV7D76—7@¢VffV7@¢VffV7BÔtĞ¢VffV7BÔFVf–æ—F–öç0¢VffV7BÔ7F—fPĞ¢VffV7BÕ7FGW0Ğ¢VffV7BÔVF—@Ğ¢VffV7BÔæ÷BÔÔ6öÖÖæ@Ğ¦ Ğ Ğ¥72v†Vã Ğ Ğ¢ÒF†RtÒ67&VVâ6ÆV&Ç’6W&FW2Ç––ærÂ&Wf–Wv–ærÂVF—F–ærÂæB†VÇ°Ğ¢ÒF†R6—‚fö7W6VBÆVæ6‚VffV7G2V"æB&R6W&FVB–çFòWFöÖF–öâæBG&6¶VBöÖçVÂw&÷W3°¢Ò7FGW2&W÷'G2æò7F—fRVffV7G2öâf—'7B'Vã°Ğ¢ÒVF—B&W÷'G2æòÖ—6ÖF6†W3°Ğ¢ÒF†RVç&V6övæ—¦VB6öÖÖæBöffW'26ÆV"&÷WFR&6²FòF†RwV–FRàĞ Ğ¥F†Vâ6VÆV7BöæRÆ–æ¶VBF—7÷6&ÆR#B2F&vWBæBÇ’&ÆW72g&öÒæ÷F†W"Æ–æ¶VB#B26÷W&6RF‡&÷Vv‚F†R6FÆörâ6öæf—&Ó Ğ Ğ¢ÒöæR7F—fRVffV7B—2&V6÷&FVC°Ğ¢ÒF†R6öæf–wW&VB&ÆW72Ö&¶W"ÂF†R6÷W&6R6öæ6VçG&F–öâÖ&¶W"ÂæBF†RF&vWBw2CFGF6²÷6fRÖöF–f–W"&÷w2V#°Ğ¢ÒF†RVffV7BÆ–VBæVÂöffW'2¢¤VæBVffV7B¢¢ÂVffV7BÔ7F—fV–FVçF–f–W2F†R6÷W&6RæBF&vWBÂæBVffV7BÕ7FGW67F—26ö×7C°¢ÒÇ––ærF†R6ÖR7V&Ö—GFVB&WVW7BGv–6RFöW2æ÷B7&VFRGWÆ–6FS°Ğ¢ÒVæF–ær6öæ6VçG&F–öâ÷"W6–ærVffV7BÔVæF&VÖ÷fW2F†RVffV7D76—7BÖ÷væVBÖ&¶W"æBVæVF—FVBÖöF–f–W"&÷w2ÂF†VâÖ÷fW2F†R&V6÷&BFò&V6VçB†—7F÷'’àĞ Ğ¥'VâF†R6ö×ÆWFR´fö7W6VBc"ããVffV7D76—7B66WFæ6UÒ‚6fö7W6VB×c#ÖVffV7F76—7BÖ66WFæ6R’&Vf÷&R&÷f–ærF†R&VÆV6RàĞ Ğ¢222W‡æFVBVffV7D76—7B6†V6·0Ğ Ğ¥W6RF†Rfö7W6VB6V7F–öâFò&÷fS Ğ Ğ¢ÒGvò&ÆW726÷W&6W26†&RöæRæöâ×7F6¶–ærÖ&¶W"æBöæRGF6²÷6fR&÷r—#°Ğ¢ÒVæF–æröæR6÷W&6RFöW2æ÷B&VÖ÷fRF†R&VÖ–æ–ær6÷W&6Rw2&ö¦V7F–öç3°Ğ¢Ò&RÖW†—7F–ærÖF6†–ærÖ&¶W'2æB&÷w2&R&W6W'fVBgFW"ÆÂVffV7D76—7B6÷W&6W2VæC°Ğ¢ÒÆÂ6—‚6FÆörFVf–æ—F–öç26â&RÆ–VBæBVæFVBv—F‚F†V—"Fö7VÖVçFVBWFöÖF–2æB76—7FVB&V†f–÷#°¢ÒwV–Fæ6R÷vç2öæRCFvÆö&Â6¶–ÆÂ&÷ræB&VÖ÷fW2—B6fVÇ“°¢ÒÆ–W"67F–ær&WV—&W26öçG&öÂöbF†R6÷W&6RÂ7F—2&—fFRÂæBö&W—2F†RtÒÆö6¶÷WBv—F†÷WBW‡÷6–ærtÒÖöæÇ’ÖVçW3°¢Òv&F–ær&öæB7&VFW2öæÇ’—G2³2÷6fR&÷w2æB†7FR7&VFW2öæÇ’—G2³&2&÷s°Ğ¢ÒÖçVÂ6÷W&6RÖ6öæ6VçG&F–öâ&VÖ÷fÂVæG2FWVæFVçBVffV7G2æB6ÆVç2öæÇ’÷væVBF&vWB7FFS°Ğ¢ÒVF—FVBVffV7D76—7BÖ7&VFVB6†VWB&÷w2&R&W6W'fVBæB&W÷'FVBf÷"GFVçF–öã°Ğ¢ÒÆ–æ¶VBå2F&vWG2&V6V—fRÖ&¶W"öÆ–fV7–6ÆR&V†f–÷"v—F†÷WB–æ&÷&–FR2ÖöæÇ’ÖöF–f–W"&÷w3°Ğ¢ÒÖ—†VBfÆ–BæB–çfÆ–B6VÆV7F–öç2&R&V¦V7FVBv—F†÷WB'F–ÂÆ–6F–öã°Ğ¢ÒÖ&¶W"Â6öæF—F–öä76—7BÂ#B×6†VWBÂ6öæ6VçG&F–öâÂæB&V6÷&BÖöæÇ’FVf–æ—F–öç2föÆÆ÷rF†V—"FV6Æ&VB&ö¦V7F–öâ6öçG&7G3°Ğ¢ÒVF—B—2&VBÖöæÇ’æB&W—"&WV—&W2g&W6‚ÂöæR×W6RtÒWF†÷&—¦F–öã°Ğ¢Ò6†ævVBFö¶Vâ–FVçF—G’6W6W2&VgW6Â&F†W"F†âw&—FRFòF†Rw&öær&W&W6VçFF–öã°Ğ¢ÒF—6&Æ–æræB&RÖVæ&Æ–ærVffV7D76—7B&W6W'fW2—G2&V6÷&G3°Ğ¢ÒÖÆf÷&ÖVB¶æ÷vâ7FFR—2&W÷'FVBv—F†÷WBFVÆWF–ærVæ¶æ÷vâ'&æ6†W2àĞ Ğ¢222VffV7D76—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  Ğ¢ÒF†RW†7B6öÖÖæC°Ğ¢ÒF†R6VÆV7FVBFö¶VâæÖW3°Ğ¢ÒF†RVffV7B–ç7Fæ6R”B6†÷vâ'’7FGW3°Ğ¢ÒF†RVF—B7VÖÖ'’æBÖ—6ÖF6‚&V6öã°Ğ¢Òv†WF†W"F†RÖ&¶W"Â6öæF—F–öâÂ6öæ6VçG&F–öâ7FFRÂ÷"6†VWB&÷rW†—7FVB&Vf÷&RÆ–6F–öã°Ğ¢Òv†WF†W"æ÷F†W"6÷W&6R7F–ÆÂ÷væVBF†R6ÖR&ö¦V7F–öã°¢Òç’æWr6æF&÷‚W†6WF–öâà ¢ÒÒĞ ¢22bâÆÖæ476—7@ ¢¢¥v†BF†—2&÷fW3¢¢¢F†RÖ7FW"6öçG&öÇ26â&V6‚ÆÂ6—‚ÆÖæ476—7B7—7FV×2ÂV6‚7—7FVÒ&W÷'G2—G2÷vâ7FFRÂæBF†RÖöGVÆR&W6W'fW2FVÆ–&W&FR&÷VæF&–W2&WGvVVâf–7F–öæÂF–ÖRÂFW67&—F—fR6öçFW‡BÂæBfW&–f–VB6†VWB6†ævW2à ¢¢¥v‡’FW7B—C¢¢¢ÆÖæ476—7Bc"ãã6öçF–ç2ÆÂ6—‚&öÖ—6VB–çFW&æÂ7—7FV×2âV–6²726†÷VÆB6F6‚Ö—76–ær6öÖÖæB&÷WFW2ÂF—6&ÆVB×7—7FVÒÆV¶vRÂ7FÆR6öçFW‡BÂæBVç6fR&W7B&V†f–÷"&Vf÷&RvÖRæ–v‡Bà ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’v†VâÆÖæ476—7Bv–ÆÂ&VÖ–âF—6&ÆVB–â÷&F–æ'’Æ’âFòæ÷B6¶—f÷"c"ãã&VÆV6R&÷fÂà ¢222&6–26†V6° ¦&öÆÃ#6†@¢vÖVæ&ÆRÆÖæ476—7@¢ÆÖæ2ÔtĞ¢ÆÖæ2Õ7—7FV×0¢ÆÖæ2Õ7FGW0¢ÆÖæ2ÔVF—@¢FFP¢6Æ–Ğ¢7G&ğ¢vVF†W ¢Vçf—&ğ¢&W7@¦  ¥72v†VâF†RÖ7FW"67&VVâæÖW2F–ÖRÂ6Æ–ÖFRÂ7G&öæö×’ÂvVF†W"ÂVçf—&öæÖVçBÂæB&W7C²WfW'’6†÷'B6öÖÖæB÷Vç2F†RÖF6†–ær7—7FVÒW†7FÇ’öæ6S²7FGW2v—fW26ö×7B7W'&VçB–7GW&S²VF—B6—2—B—2&VBÖöæÇ“²æB&W7B6·2f÷"âVÆ–v–&ÆR6VÆV7FVB#B2&F†W"F†âw&—F–ær–ÖÖVF–FVÇ’à ¥F†VâGfæ6RöæRf–7F–öæÂF’ÂvVæW&FRvVF†W"Â&Wf–WrVçf—&öæÖVçBÂæB&Wf–Wr6†÷'B&W7BöâF—7÷6&ÆRÆ–æ¶VB#B2â6öæf—&ÒF†Rf–7F–öæÂFFR6†ævW2ÂvVF†W"æBVçf—&öæÖVçB&VÖ–â&VF&ÆRÂæBæò6†VWBf–VÆB6†ævW2&Vf÷&RF†R&W7B6öæf—&ÖF–öâ'WGFöâ—2W6VBà ¢222W‡æFVB6†V6·2'’–çFW&æÂ7—7FVĞ §Â7—7FVÒÂFW7BÂ72v†VâÂ6¶—v†VâG&÷V&ÆW6†ö÷F–ærÀ§ÂÒÒÒÂÒÒÒÂÒÒÒÂÒÒÒÀ§Â¢¥F–ÖR¢¢Â6†ævR6ÆVæF"&öf–ÆW2Â7&÷72&÷VæF'’ÂVF—Bv–f&W"ÂæBGFV×B&WfW'6ÂöW†7B6WBâÂöæRVÆ6VBÖöÖVçB—2&W6W'fVC²f÷'v&B6†ævW2v÷&³²&—6·’6†ævW2&WV—&R6öæf—&ÖF–öã²&VÂ×v÷&ÆBvÖT76—7BF–ÖW7F×2&RVçF÷V6†VBâÂæòVæ&ÆVBfVGW&RW6W2f–7F–öæÂFFW2æBF–ÖR—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¤6Æ–ÖFR¢¢Â7&VFR7W7FöÒ&öf–ÆRÂ&VçB&Vv–öâÂ–æ†W&—F–ær6†–ÆBÂæB÷fW'&–FRâÂ–æ†W&—Fæ6RæB÷fW'&–FW2&R6ÆV#²GWÆ–6FRöÖ&–wV÷W2ö–çfÆ–B6†ævW2w&—FRæ÷F†–ærâÂ6Æ–ÖFR—2–çFVçF–öæÆÇ’öfbæBvVF†W"W6W2fÆÆ&6²6öçFW‡BâÀ§Â¢¤7G&öæö×’¢¢Â6öæf–wW&RÖööâæB&&RWfVçBÂf÷&V67BÂF†Vâ&VÖ÷fRF–ÖR6öçFW‡BâÂ†6W2öF–Æ–v‡B&RFWFW&Ö–æ—7F–3²f÷&V67B—2&VBÖöæÇ“²&&RWfVçG2&VÖ–â6W&FS²ÖçVÂfÆÆ&6²v÷&·2âÂ7G&öæö×’—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¥vVF†W"¢¢ÂvVæW&FRÂf÷&V67BÂÆö6²ÂÖçVÆÇ’&WÆ6RÂæB'Vâv—F†÷WBF–ÖRô6Æ–ÖFRâÂ7W'&VçBvVF†W"—27G'V7GW&VBæB6öçF–çV÷W3²f÷&V67BFöW2æ÷B6öÖÖ—C²Æö6²—2&W7V7FVC²fÆÆ&6²v÷&·2âÂvVF†W"—2–çFVçF–öæÆÇ’öfbæBVçf—&öæÖVçBW6W2ÖçVÂ÷fW'&–FRâÀ§Â¢¤Vçf—&öæÖVçB¢¢ÂFW&—fRg&öÒvVF†W"ÂÇ’ö6ÆV"â÷fW'&–FRÂF†Vâ'Vâv—F†÷WBvVF†W"âÂ6öçFW‡B—2FW67&—F—fRæB7G'V7GW&VC²÷fW'&–FR&VÖ–ç2WF†÷&—FF—fS²æòvÖWÆ’7FFR6†ævW2âÂVçf—&öæÖVçB—2–çFVçF–öæÆÇ’öfbâÀ§Â¢¥&W7B¢¢Â&Wf–Wrö6öæf—&Ò6†÷'BæBÆöær&W7BÂFW7B7FÆR&Wf–WrÂ–çfÆ–BFö¶VâÂæB÷F–öæÂF–ÖRGfæ6RâÂöæÇ’6öçG&öÆÆVBÆ–æ¶VB#B72VÆ–g“²W†7BfW&–f–VBf–VÆG26†ævRgFW"6öæf—&ÖF–öã²7FÆRö–çfÆ–B&WVW7G2w&—FRæ÷F†–ærâÂ&W7B—2–çFVçF–öæÆÇ’öfc²æWfW"6¶—f÷"&W÷'FVB6†VWB×w&—FR&ö&ÆVÒâÀ ¥'VâF†R6ö×ÆWFR´fö7W6VBc"ãã6ö×ÆWFRÆÖæ476—7B66WFæ6UÒ‚6fö7W6VB×c#Ö6ö×ÆWFRÖÆÖæ676—7BÖ66WFæ6R’&Vf÷&R&VÆV6R&÷fÂà ¢222ÆÖæ476—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  ¢ÒF†RW†7B6öÖÖæBæB–çFW&æÂ7—7FVÓ°¢ÒÆÖæ2Õ7FGW6æBÆÖæ2ÔVF—F÷WGWC°¢Ò7F—fR6ÆVæF"÷&öf–ÆR÷&Vv–öâ÷"ÖçVÂfÆÆ&6²–çföÇfVC°¢Òv†WF†W"F†R7—7FVÒv2Væ&ÆVB&Vf÷&RæBgFW"F†R7F–öã°¢Òf÷"&W7G2Â6VÆV7FVBFö¶VâæÖW2Â6†VWBG—RÂ&Wf–WrFW‡BÂf–VÆG26†ævVBgFW"&Wf–WrÂæBv†WF†W"F–ÖRGfæ6VÖVçBv2öffW&VC°¢Òç’æWr6æF&÷‚W†6WF–öâà ¢ÒÒĞ ¢27&÷72Ô6ö×öæVçB6†V6·0 Ğ¢22W&Ö—76–öç0Ğ Ğ¢¢¥W'÷6S¢¢¢6öæf—&ÒtÒÖöæÇ’FÖ–æ—7G&F–öâ6ææ÷B&R'Vâ'’÷&F–æ'’Æ–W'2àĞ Ğ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’–bæòÆ–W"66÷VçB—2f–Æ&ÆS²&V6÷&B—B2VçFW7FVBàĞ Ğ¤g&öÒæöâÔtÒ66÷VçBÂG'“ Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW0Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¢6öæF—F–öâ6öæf–pĞ¢6öæF—F–öâFB&öæPĞ¢Fö¶VâÖ76—7B6öæf–pĞ¢Fö¶VâÖ76—7BÒÖ–G2Dô´Tåô”BÒÖfÆ—6†÷væÖPĞ¢–æ—BÕ% Ğ¢vVÆ6öÖRÔææ÷Væ6PĞ¢…ÔÆÀĞ¢ç2ÖFVF‚ÖVF—@Ğ¦ Ğ Ğ¥72v†VâtÒÖöæÇ’7F–öç2Fòæ÷BW†V7WFRf÷"F†RÆ–W"âFö¶Vä76—7B6†÷VÆB&VgW6RW‡Æ–6—BÔ”BF&vWF–ærv†–ÆRÆ–W'2Ö6âÖ–G6—2öfbÂ'WB6VÆV7FVB×Fö¶Vâ6öÖÖæG2&VÖ–âf–Æ&ÆRf÷"Fö¶Vç2F†RÆ–W"6öçG&öÇ2â–æ—F–F—fT76—7B6†÷VÆB&VgW6RÆ–W"&W&öÆÂöÖævVÖVçB6öÖÖæG2v†–ÆR7F–ÆÂÆÆ÷v–ær—G2V&Æ–2&öÆÂæB&öÆÂ÷F–öç2'WGFöç2f÷"6öçG&öÆÆVB6†&7FW'2àĞ Ğ¢22GWÆ–6FR–ç7FÆÆF–öàĞ Ğ¢¢¥W'÷6S¢¢¢6öæf—&ÒöæR6†B6öÖÖæB&öGV6W2öæR&W7öç6RàĞ Ğ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—v†Vâ6öÖÖæG2&W7öæBGv–6RàĞ Ğ¤–b6öÖÖæB&öGV6W2GWÆ–6FR÷WGWC Ğ Ğ£â6†V6²F†RÖöBô’vRf÷"×VÇF—ÆRvÖT76—7B6÷–W2àĞ£"â6†V6²f÷"öÆFW"7FæFÆöæR67&—G2F†B–×ÆVÖVçBF†R6ÖRfVGW&RàĞ£2â¶VWöæÇ’F†R–çFVæFVB–×ÆVÖVçFF–öâàĞ£Bâ&W7F'BF†R6æF&÷‚æB&WVBF†R6öÖÖæBàĞ Ğ¥67&—G2F†B–æFWVæFVçFÇ’&W7öæBFò6öæF—F–öæ÷"Fö¶VâÖÖöFÂFW67&–&RF†R6ÖRÖ&¶W"6†ævW2ÂÖöF–g’F†R6ÖRå2…ö&"Â6öçG&öÂF†R6ÖRFö¶Vâ&÷W'F–W2÷"FVF‚ö6öæ6VçG&F–öâö6öæF—F–öâÖ&¶W'2Â&ö6W72F†R6ÖRæGW&Âv÷&¶fÆ÷rÂ÷"&Ww&—FRF†RæF—fRGW&âG&6¶W"Ö’6öæfÆ–7BWfVâv†VâF†V—"æÖW2F–ffW"âFö¶Vä76—7BFVÆ–&W&FVÇ’7W7VæG2öæÇ’—G2öÆFW"Fö¶VâÖÖöF6ö×F–&–Æ—G’Æ–2v†Vâ7FæFÆöæRFö¶VäÖöB—2FWFV7FVBÂ'WBF†R7FæFÆöæR6÷’6†÷VÆB7F–ÆÂ&R&VÖ÷fVBf÷"æ÷&ÖÂc"ããW6RâW6R–æ—F–F—fT76—7Bö'6W'fW"ÖöFRv†Vâæ÷F†W"–æ—F–F—fR&öÆÆW"÷vç2–æ—F–F—fRfÇVW3²ÆVfR6öÖ&D76—7BF—6&ÆVBv†Vâæ÷F†W"Væ6÷VçFW"ÖævW"÷vç2GW&âGfæ6VÖVçB÷"&÷VæG2àĞ Ğ¢227FFR&V6÷fW'Ğ Ğ¢¢¥W'÷6S¢¢¢6öæf—&Ò¶æ÷vâ7FFR6öçF–æW'26VÆbÖ†VÂv†–ÆRVæ¶æ÷vâ'&æ6†W2&R&W6W'fVBf÷"&Wf–WràĞ Ğ¢¢¥6¶—v†Vã¢¢¢6¶—–çFVçF–öæÂ7FFR6÷''WF–öâ÷WG6–FRF—7÷6&ÆRFW7B6×–vâàĞ Ğ¥6fR&Wf–Ws Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW0Ğ¢vÖÖWG&–70Ğ¢vÖ6öæf–rÆ—7@Ğ¦ Ğ Ğ¤Fòæ÷B'VâvÖ6öæf–r6ÆVçWÖW&VÇ’FòFW7B—Bâ6ÆVçWFVÆWFW2Væ¶æ÷vâ÷"÷'†æVB7FFRävÖT76—7F'&æ6†W2gFW"W‡Æ–6—B6öæf—&ÖF–öâàĞ Ğ¢ÒÒĞĞ Ğ¢2G&÷V&ÆW6†ö÷F–ær'’7–×FöĞĞ Ğ¢22æ÷F†–ær&W7öæG0Ğ Ğ£âv—Bf÷"F†RÖöB6æF&÷‚&W7F'BàĞ£"â6†V6²F†R’6öç6öÆRf÷"vÖT76—7B7–çF‚÷"&VfW&Væ6RW'&÷"àĞ£2â6öæf—&ÒvÖT76—7B—2Væ&ÆVBàĞ£Bâ&VÖ÷fRGWÆ–6FR÷"'&ö¶Vâ6÷–W2àĞ£Râ&WG'’v×7FGW6àĞ Ğ¥6öÇfRF†R6÷&R&ö&ÆVÒ&Vf÷&RFW7F–ærÖöGVÆW2àĞ Ğ¢22öæRÖöGVÆR—26–ÆVç@Ğ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¢vÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSàĞ¢vÖVæ&ÆRÄÖöGVÆT÷%6W'f–6TæÖSàĞ¦ Ğ Ğ¤6†V6²F†R6öæf–wW&VB7FFRÂ'Vææ–ær7FFRÂW†7B6öÖÖæB7VÆÆ–ærÂæBFW7B×Fö¶VâVÆ–v–&–Æ—G’â&VBF†RVæ&ÆR&W7öç6R&Vf÷&R6†æv–ærÖ÷&R6WGF–æw2àĞ Ğ¢22Ö&¶W"WFöÖF–öâf–Ç0Ğ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW2ÒÖFWF–Ç0Ğ¢vÖ6öæf–rvWBå476—7BFVDÖ&¶W Ğ¢vÖ6öæf–rvWB6öæ6VçG&F–öä76—7BÖ&¶W Ğ¢Fö¶VâÖ76—7BÒÖ†VÇ×7FGW6Ö&¶W'0Ğ¢6öæF—F–öâ7FGW0Ğ¢ç2ÖFVF‚ÖVF—@Ğ¢ç2ÖFVF‚×&W— Ğ¢6öæ6VçG&F–öâÒ×7FGW0Ğ¦ Ğ Ğ¤6†V6³ Ğ Ğ¢ÒÖ&¶W%6W'f–6R—2Væ&ÆVBàĞ¢ÒF†RffV7FVBÖöGVÆR—2'Vææ–æràĞ¢ÒF†RFö¶Vâ—2öâF†Rö&¦V7G2Æ–W"æB&W&W6VçG2F†R&–v‡B6†&7FW"àĞ¢Òå476—7BFö¶Vç2†fRç3ÓàĞ¢ÒF†R6öæf–wW&VB'V–ÇBÖ–âÖ&¶W"Â7W7FöÒF—7Æ’æÖRÂ÷"W†7B7F÷&VBFrW†—7G2àĞ¢ÒF†R…÷"6öæ6VçG&F–öâ÷WF6öÖR7GVÆÇ’&WVW7FVBF†RW‡V7FVBÖ&¶W"7FFRàĞ Ğ¥7FæFÆöæRFö¶VäÖöBW&Ö—76–öç2&Ræ÷B&W—"f÷"vÖT76—7BÖ&¶W"f–ÇW&W2–âc"ããàĞ Ğ¥7F÷FW7F–æræB&W÷'BF†R&Vf÷&RögFW"Ö&¶W"fÇVW2–bâVç&VÆFVBÖ&¶W"÷"çVÖ&W"6†ævW2àĞ Ğ¢22å2…FöW2æ÷B&öÆÀĞ Ğ¤6öæf—&Ó Ğ Ğ¢ÒFö¶Vâ—26VÆV7FVB÷"öâF†R7W'&VçBÆ–W"vS°Ğ¢ÒFö¶Vâ—2öâF†Rö&¦V7G2Æ–W#°Ğ¢ÒFö¶Vâ&W&W6VçG26†&7FW#°Ğ¢Ò6†&7FW"†2ç3Ó°Ğ¢Ò6†&7FW"†2fÆ–Bç5ö‡f÷&×VÆÂ7V6‚2FC‚³†àĞ Ğ¢227&—D76—7BFöW2æ÷B&öÆÀĞ Ğ¤6öæf—&Ó Ğ Ğ¢Ò7&—FgVÖ&ÆR†VÇ&W7öæG3°Ğ¢ÒF†RW†7B&WV—&VBF&ÆRW†—7G2æB†2â—FVÓ°Ğ¢ÒF†RF—&V7BF&ÆR6öÖÖæBv÷&·3°Ğ¢ÒWFöÖF–2FWFV7F–öâW6W27W÷'FVBFV×ÆFRv—F‚C#æGW&ÂàĞ Ğ¢22VWVR÷"W'&÷"6÷VçG2–æ7&V6PĞ Ğ¥'Vã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW2ÒÖFWF–Ç0Ğ¢vÖÖWG&–70Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¦ Ğ Ğ¥VWVRÆVæwF‚FW67&–&W2W‡Æ–6—BVWVVBv÷&²æBÖöGVÆRÆ–fV7–6ÆRG&ç6—F–öç2âF–ÖV÷WB6â&VÆV6RF†RVWVR'WB6ææ÷BFW&Ö–æFRVæFW&Ç––ær&öÆÃ#÷"¦f67&—Bv÷&²àĞ Ğ¥&V6÷&BWf–FVæ6R&Vf÷&R&W6WGF–ærÖWG&–72àĞ Ğ¢ÒÒĞĞ Ğ¢2'Vr&W÷'BWf–FVæ6PĞ Ğ¥v†VâFW7Bf–Ç2Â&V6÷&C Ğ Ğ¢Ò²ÒvÖT76—7BfW'6–öâàĞ¢Ò²Ò6ö×öæVçBæBçVÖ&W&VBFW7BàĞ¢Ò²ÒW†7B6öÖÖæB÷"Fö¶Vâ7F–öâàĞ¢Ò²ÒW‡V7FVB&W7VÇBàĞ¢Ò²Ò7GVÂ&W7VÇBàĞ¢Ò²Òv×7FGW2ÒÖFWF–Ç6÷WGWBàĞ¢Ò²ÒvÖ6öæf–rÖöGVÆW6÷WGWBàĞ¢Ò²Ò&VÆWfçBvÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSæ÷WGWBàĞ¢Ò²ÒW†7B’6öç6öÆRW'&÷"àĞ¢Ò²ÒFö¶VâæÖRÂ”BÂÆ–W"ÂæBÆ–æ¶vRàĞ¢Ò²Ò&VÆWfçB6†&7FW"GG&–'WFW2àĞ¢Ò²ÒÖ&¶W"fÇVW2&Vf÷&RæBgFW"Âv†VâÆ–6&ÆRàĞ¢Ò²Òv†WF†W"7FæFÆöæRFö¶VäÖöB÷"7FæFÆöæR7FGW4–æfòv2–ç7FÆÆVB÷"FWFV7FVBàĞ¢Ò²Òv†WF†W"GWÆ–6FR÷"÷fW&Æ–ær67&—G2vW&R7F—fRàĞ Ğ¢ÒÒĞĞ Ğ¢2&RÕ6W76–öâ6†V6°Ğ Ğ¤–ÖÖVF–FVÇ’&Vf÷&R6W76–öã Ğ Ğ¦&öÆÃ#6†@Ğ¢v×7FGW0Ğ¢vÖ6öæf–rÖöGVÆW0Ğ¦ Ğ Ğ¥F†Vâ'VâöæÇ’F†R&6–26†V6·2f÷"fVGW&W2F†R6W76–öâv–ÆÂW6S Ğ Ğ¢ÒÖ&¶W%6W'f–6S¢öæRF—7÷6&ÆRFVF‚÷&Wf—fÂÖ&¶W"7–6ÆRàĞ¢Ò6öæf–uT“¢÷Vâ6WGF–æw2àĞ¢Ò7&—D76—7C¢7&—FgVÖ&ÆR†VÇàĞ¢Ò6öæF—F–öä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷Vâ6öæF—F–öæÂæB'Vâ6öæF—F–öâ7FGW6àĞ¢ÒFö¶Vä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷VâFö¶VâÖ76—7B†VÇÂæBfÆ—öæR†&ÖÆW72f—6–&–Æ—G’6WGF–ærGv–6RàĞ¢Ò6öæ6VçG&F–öä76—7C¢6öæ6VçG&F–öâÒ×7FGW6àĞ¢Òå476—7C¢ç2ÖFVF‚×&W÷'F²W6Rç2ÖFVF‚ÖVF—Fv†Vâ6†V6¶–ærÖ&¶W'2æB÷Vâ&W—"öæÇ’–bÖ—6ÖF6‚—2–çFVçF–öæÂàĞ¢Ò…76—7C¢&öÆÂöæRF—7÷6&ÆR6VÆV7FVBå2àĞ¢ÒFV'VuFööÇ3¢6¶—VæÆW72FVÆ–&W&FVÇ’æVVFVBàĞ¢Ò–æ—F–F—fT76—7C¢÷Vâ–æ—BÔtÖv†Vâ&—fFRVæ6÷VçFW"6WGWv–ÆÂ&RW6VBàĞ¢ÒvVÆ6öÖT76—7C¢v†VâVæ&ÆVBÂ&Wf–WrF†Rw&VWF–æræB6öæf—&Ò7FGW2&Vf÷&RF†R6W76–öã²Fòæ÷BW6RÖçVÂææ÷Væ6RÖW&VÇ’2†VÇF‚6†V6²àĞ Ğ¤Fòæ÷BF—66÷fW"Ö&¶W"Â…Â÷"F&ÆR&ö&ÆVÒf÷"F†Rf—'7BF–ÖRGW&–ær6öÖ&BàĞ 