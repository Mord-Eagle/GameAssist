# GameAssist v2.0.0 Smoke Test and Troubleshooting Guide

Use this guide after installing or updating GameAssist, before an important session, or while troubleshooting a feature.

> This guide tests GameAssist v2.0.0. It adds the full 2014-sheet EffectAssist launch track while retaining the established component checks and the v1.8.2 NPCAssist naming and Bloodied regressions.

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

**What this proves:** EffectAssist coordinates its focused six-effect launch catalog, applies verified 2014-sheet modifiers where available, authorizes player casting from controlled sources, lets players point at visible recipients they do not control, offers a bounded GM-request fallback, announces only completed player casts, links concentration-dependent effects to their source, keeps overlapping sources separate, preserves pre-existing campaign state, and repairs only a freshly confirmed safe mismatch.

**Why test it:** v2.0.0 introduces durable effect records and ownership across tokens, concentration, and repeating character-sheet rows. Roll20 must confirm real 2014-sheet worker behavior, native target prompts, page and layer restrictions, marker storage, module toggles, chat buttons, and persistent state.

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

### Player Casting, Native Targets, and GM Lockout

Use a separate non-GM player login with one linked character token that player controls. Keep at least one visible linked recipient controlled by somebody else, plus one disposable token on the GM layer.

1. As the player, run `!Bless` without selecting any recipient first.
2. If the player controls more than one linked character, choose the caster. Otherwise confirm the sole caster is chosen automatically.
3. Click **Choose 1 Recipient**, then click the visible linked recipient controlled by somebody else when Roll20 asks for a map target.
4. Confirm the review is whispered only to that player, then apply it.
5. Confirm public chat announces that the source cast Bless on the visible recipient only after the application succeeds.
6. Confirm the private result includes **End Effect**, then use that button.
7. Repeat the opening steps, click **Ask the GM**, and confirm the player receives **Request Sent** while the GM receives a compact placement panel.
8. From that GM panel, use **Review With My Selected Tokens** or one of its map-target buttons, review the effect, and confirm it.
9. As GM, run `!Effect-GM` and click **Lock** under Player Casting.
10. As the player, run `!Bless` again.
11. Restore **Allow** from the GM control center.

**Pass when:** the player can cast from a source they control onto a visible linked recipient they do not control; no target preselection is required; the public announcement names the completed source, effect, and visible recipient; the GM-request path retains the normal review; the player cannot see custom, audit, repair, or GM configuration controls; lockout produces a clear private notice and writes nothing; restoring access works without a sandbox restart.

**Permission boundary:** Do not try to construct internal target commands during ordinary play. For release acceptance, confirm that the normal player picker never offers a GM-layer token and that **Ask the GM** is the route for hidden or off-page recipients. A direct GM cast should remain private.

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

### ß}:ŞÚ$z{-®éÜj×RvVÆ6öÖT76—7BF—6&ÆVBÖ’6öæf—&ÒF†RF—6&ÆVB6†V6²æB6¶—F†RW‡æFVBFW7G2à ¢222&6–26†V6° ¤6öæf—&ÒvÖ6öæf–rÖöGVÆW66†÷w2vVÆ6öÖT76—7BF—6&ÆVBâ&VÆöBF†RÖöB6æF&÷‚öæ6RæBfW&–g’æòvVÆ6öÖT76—7Bw&VWF–ærV'2âF†Vâ'Vã  ¦&öÆÃ#6†@¢vÖVæ&ÆRvVÆ6öÖT76—7@¢vVÆ6öÖP¢vVÆ6öÖRÔ†VÇ6WGW ¢vVÆ6öÖRÔ†VÇ6fWG¢vVÆ6öÖRÔtĞ¢vVÆ6öÖRÔDĞ¢vVÆ6öÖRÕ7FGW0¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔæ÷BÔÔ6öÖÖæ@¢vVÆ6öÖRÖ76—7B†VÇ ¦  ¥72v†Vã  ¢ÒF†R&ö÷BwV–FR—26ö×7B7F–öâæBF÷–2ÖVçR&F†W"F†âF†R6ö×ÆWFR6WGWÖçVÃ°¢ÒF†R6WGWæB6fWG’F÷–72W‡Æ–âF†V—"fö7W6VB7V&¦V7G2æB–æ6ÇVFR¢¤&6²FòwV–FR¢£°¢ÒvVÆ6öÖRÔtÖæBvVÆ6öÖRÔDÖ÷VâF†R6ÖR&—fFR6WGWæB7FGW267&VVã°¢Ò7FGW2&W÷'G2ÖöGVÆRããFÂÖ—†VFÖöFRöâf—'7B×F–ÖR6öæf–wW&F–öâÂ2×6V6öæBFVÆ’ÂæBæòWFöÖF–2w&VWF–ær–WC°¢Ò&Wf–Wr—2v†—7W&VBöæÇ’FòF†RtÓ°¢ÒF†RVç&V6övæ—¦VB6öÖÖæB&WGW&ç2¢¤æVVG2GFVçF–öâ¢¢v—F‚â¢¤÷VâwV–FR¢¢'WGFöâ&F†W"F†â6–ÆVçFÇ’÷Væ–ærâVç&VÆFVB67&VVã°¢ÒF†R&WF–æVBvVÆ6öÖRÖ76—7B†VÇÆ–2÷Vç2öæRwV–FR&W7öç6R&F†W"F†â&öGV6–ærGWÆ–6FR÷WGWC°¢ÒVæ&Æ–æræB&Wf–Wv–ærFòæ÷B7&VFRç’V&Æ–2ÖW76vRà ¥&VÆöBF†RÖöB6æF&÷‚â72v†VâW†7FÇ’öæRV&Æ–2w&VWF–ærV'2gFW"F†RFVÆ’âv—BBÆV7B#6V6öæG2æB6öæf—&Òæò6V6öæBWFöÖF–2w&VWF–ærV'2à ¢222W‡æFVBvVÆ6öÖT76—7B6†V6·0 ¢2222sâÖöFRæB–ÖÖVF–FRææ÷Væ6VÖVç@ ¥'VâF†W6RöæRBF–ÖRæBW6R¢¥&Wf–Wr¢¢&Vf÷&R¢¤ææ÷Væ6Ræ÷r¢£  ¦&öÆÃ#6†@¢vVÆ6öÖRÔÖöFRFVfVÇ@¢vVÆ6öÖRÔÖöFR'V–ÇF–à¢vVÆ6öÖRÔÖöFR7W7FöĞ¢vVÆ6öÖRÔÖöFRÖ—†V@¦  ¥72v†VâFVfVÇBW6W2F†R&öfW76–öæÂw&VWF–ærÂ'V–ÇF–âW6W2öæRöbF†R–æ6ÇVFVBvVV²Ö7VÇGW&RÆ–æW2ÂV×G’7W7FöÒÖöFRfÆÇ2&6²FòF†R&öfW76–öæÂw&VWF–ærv—F‚tÒv&æ–ærÂæBÖ—†VB6âW6RF†RFVfVÇBÂ'V–ÇBÖ–ç2Â÷"6×–vâÆ–æW2âWfW'’&Wf–Wr&VÖ–ç2&—fFRâWfW'’FVÆ–&W&FRææ÷Væ6V—2V&Æ–2à ¢2222s"â6×–vâw&VWF–ærÖævVÖVç@ ¥'Vã  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒFBF÷f–RvæF’6RF÷g–6v–à¢vVÆ6öÖRÔ7W7FöÒÆ—7@¢vVÆ6öÖRÔ7W7FöÒFBDõd”RtäD’4RDõe”4t”à¢vVÆ6öÖRÔ7W7FöÒ&VÖ÷fR§Væ°¦  ¥72v†VâF†Rf—'7Bw&VWF–ærV'2öæ6R–âF†RÆ—7BÂF†R6—FÆ—¦F–öâÖöæÇ’GWÆ–6FR—2&VgW6VBÂæBF†RÖÆf÷&ÖVB&VÖ÷fÂfÇVRFöW2æ÷BFVÆWFR—BâFBæ–æR÷F†W"F—7÷6&ÆRw&VWF–æw3²F†RFVçF‚F÷FÂVçG'’6†÷VÆB&R66WFVBæBâVÆWfVçF‚&VgW6VBà ¥&VÖ÷fRöæR—FVÒv—F‚—G2W†7BçVÖ&W"âF†VâFW7B6ÆV&–æs  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒ6ÆV ¢vVÆ6öÖRÔ7W7FöÒ6ÆV"ÒÖ6öæf—&Ğ¦  ¥72v†VâF†Rf—'7B6öÖÖæB&VgW6W2æBF†R6öæf—&ÖVB6öÖÖæBV×F–W2F†RÆ—7Bà ¢2222s2âV&Æ–26†B6fWG ¤FBF†—2F—7÷6&ÆR6×–vâw&VWF–ærW†7FÇ’2FW‡C  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ7W7FöÒFBµ³C#ÕÒ·7G&VæwF‡ÒW¶&–Æ—G—Ò÷·VW'—ÒÆ#æ†VÆÆóÂö#à¢vVÆ6öÖRÔÖöFR7W7FöĞ¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔææ÷Væ6P¦  ¥72v†VâF†Rw&VWF–ærF—7Æ—2F†R&öÆÃ#W‡&W76–öç2æB…DÔÂÖÆ–¶RFW‡BÆ—FW&ÆÇ’â—B×W7Bæ÷B&öÆÂF–6RÂ&VBâGG&–'WFRÂ6ÆÂâ&–Æ—G’Â÷VâVW'’Â÷"&VæFW"&öÆB…DÔÂVÆVÖVçBâ&VÖ÷fRF†RF—7÷6&ÆRw&VWF–ærgFW'v&Bà ¢2222sBâ†VFW"ÂFVÆ’ÂæBF–ÖW"6æ6VÆÆF–öà ¥'Vã  ¦&öÆÃ#6†@¢vVÆ6öÖRÔ†VFW"†–FP¢vVÆ6öÖRÕ&Wf–Wp¢vVÆ6öÖRÔ†VFW"6†÷p¢vVÆ6öÖRÔ†VFW"6×–vâ&VG¢vVÆ6öÖRÔFVÆ’P¦  ¥72v†Vâ&Wf–Ww267W&FVÇ’†–FRÂ6†÷rÂæB&VæÖRF†R†VFW"ÂæB7FGW2&W÷'G2R×6V6öæBFVÆ’â&VÆöBÂF†VâW6RvVÆ6öÖRÔææ÷Væ6V&Vf÷&RF†Rf—fR6V6öæG2W‡—&Râ72v†VâF†RÖçVÂw&VWF–ærV'2öæ6RæBF†RVæF–ærWFöÖF–2w&VWF–ærFöW2æ÷BV"gFW'v&Bà ¢2222sRâF—6&ÆRæB&VÆöB6fWG ¥6WBf—fR×6V6öæBFVÆ’Â&VÆöBÂæBF—6&ÆRvVÆ6öÖT76—7B&Vf÷&RF†RF–ÖW"f—&W3  ¦&öÆÃ#6†@¢vÖF—6&ÆRvVÆ6öÖT76—7@¦  ¥72v†VâæòV&Æ–2w&VWF–ærV'2â&RÖVæ&ÆR—BGW&–ærF†R6ÖR'Vææ–ær6æF&÷‚æBv—C²72v†VâÆ—fRVæ&ÆVÖVçB7F–ÆÂFöW2æ÷B÷7BâWFöÖF–2&V†f–÷"&W7VÖW2öæÇ’gFW"æ÷F†W"6æF&÷‚&VÆöBà ¤f÷"F†R÷&F–æ'’†VÇF‡’×7F'BFW7BÂWfW'’÷F†W"6öæf–wW&VBÖöGVÆR6†÷VÆB&R'Vææ–ær&Vf÷&RF†Rw&VWF–ærV'2âFòæ÷B–çFVçF–öæÆÇ’FÖvRÆ—fR6×–vâFòf÷&6RF†Rf–ÇW&RFƒ²F†RWFöÖFVB†&æW726÷fW'2F†R&÷VæFVBv—BæBæÖVBÖ6ö×öæVçB&VgW6Ââ–b&VÂ7F'GWf–ÇW&RÇ&VG’W†—7G2Â72v†VâvVÆ6öÖT76—7B6¶—2F†Rw&VWF–æræBæÖW2F†R–æ7F—fR6ö×öæVçBFòF†RtÒà ¢222vVÆ6öÖT76—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  ¢ÒVæ&ÆVB÷'Vææ–ær7FFRg&öÒvÖ6öæf–rÖöGVÆW6°¢ÒvVÆ6öÖRÕ7FGW6÷WGWC°¢Ò6VÆV7FVBÖöFRÂFVÆ’Â†VFW"6WGF–ærÂæB7W7FöÒÖÆ—7B6÷VçC°¢Òv†WF†W"F†R7F–öâv2&Wf–WrÂÖçVÂææ÷Væ6RÂ÷"WFöÖF–27F'GW°¢Òv†WF†W"æ÷F†W"Væ&ÆVBvÖT76—7B6ö×öæVçBv2–æ7F—fS°¢ÒV&Æ–2æBtÒ×v†—7W"÷WGWC°¢ÒW†7B’6öç6öÆRW†6WF–öâ÷"v&æ–ærà ¥&W7F÷&RF†RFW6—&VB6×–vâw&VWF–ær6öæf–wW&F–öââÆVfRvVÆ6öÖT76—7BF—6&ÆVBv†VâF†R6×–vâFöW2æ÷B–çFVæBFòW6RWFöÖF–2w&VWF–æw2à ¢ÒÒĞ ¢22RâVffV7D76—7@ ¢¢¥v†BF†—2&÷fW3¢¢¢VffV7D76—7B6â6ö÷&F–æFRöæR6FÆörVffV7B7&÷72vÖT76—7BÖ÷væVBÖ&¶W'2Â6öæF—F–öç2Â6öæ6VçG&F–öâÂæBfW&–f–VB#B×6†VWB&÷w2v†–ÆR&W6W'f–ær÷fW&ÆæBVç&VÆFVB6×–vâ7FFRà ¢¢¥v‡’FW7B—C¢¢¢VffV7D76—7Bæ÷rW&f÷&×2&VÂ6†&7FW"×6†VWBWFöÖF–öââ&ö¦V7F–öâW'&÷"×W7BæWfW"6–ÆVçFÇ’FVÆWFRÖ&¶W"Â6öæF—F–öâÂ6öæ6VçG&F–öâ7FFRÂ÷"ÖöF–f–W"&÷rF†RtÒ÷"æ÷F†W"ÖöBÇ&VG’÷væVBà ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—f÷"c"ãã&VÆV6R66WFæ6Râ–â÷&F–æ'’Æ’ÂF†RÖöGVÆRÖ’&VÖ–âF—6&ÆVBVçF–ÂF†R6×–vâW6W2VffV7B&V6÷&G2à ¢222&6–26†V6° ¤Væ&ÆRF†RÖöGVÆRæB÷Vâ—G2tÒ67&VVã  ¦&öÆÃ#6†@¢vÖVæ&ÆRVffV7D76—7@¢VffV7@¢VffV7BÔtĞ¢VffV7BÔFVf–æ—F–öç0¢VffV7BÔ7F—fP¢VffV7BÕ7FGW0¢VffV7BÔVF—@¢VffV7BÔæ÷BÔÔ6öÖÖæ@¦  ¥72v†Vã  ¢ÒF†RtÒ67&VVâ6ÆV&Ç’6W&FW2Ç––ærÂ&Wf–Wv–ærÂVF—F–ærÂæB†VÇ°¢ÒF†R6—‚fö7W6VBÆVæ6‚VffV7G2V"æB&R6W&FVB–çFòWFöÖF–öâæBG&6¶VBöÖçVÂw&÷W3°¢Ò7FGW2&W÷'G2æò7F—fRVffV7G2öâf—'7B'Vã°¢ÒVF—B&W÷'G2æòÖ—6ÖF6†W3°¢ÒF†RVç&V6övæ—¦VB6öÖÖæBöffW'26ÆV"&÷WFR&6²FòF†RwV–FRà ¥F†Vâ6VÆV7BöæRÆ–æ¶VBF—7÷6&ÆR#B2F&vWBæBÇ’&ÆW72g&öÒæ÷F†W"Æ–æ¶VB#B26÷W&6RF‡&÷Vv‚F†R6FÆörâ6öæf—&Ó  ¢ÒöæR7F—fRVffV7B—2&V6÷&FVC°¢ÒF†R6öæf–wW&VB&ÆW72Ö&¶W"ÂF†R6÷W&6R6öæ6VçG&F–öâÖ&¶W"ÂæBF†RF&vWBw2CFGF6²÷6fRÖöF–f–W"&÷w2V#°¢ÒF†RVffV7BÆ–VBæVÂöffW'2¢¤VæBVffV7B¢¢ÂVffV7BÔ7F—fV–FVçF–f–W2F†R6÷W&6RæBF&vWBÂæBVffV7BÕ7FGW67F—26ö×7C°¢ÒÇ––ærF†R6ÖR7V&Ö—GFVB&WVW7BGv–6RFöW2æ÷B7&VFRGWÆ–6FS°¢ÒVæF–ær6öæ6VçG&F–öâ÷"W6–ærVffV7BÔVæF&VÖ÷fW2F†RVffV7D76—7BÖ÷væVBÖ&¶W"æBVæVF—FVBÖöF–f–W"&÷w2ÂF†VâÖ÷fW2F†R&V6÷&BFò&V6VçB†—7F÷'’à ¥'VâF†R6ö×ÆWFR´fö7W6VBc"ããVffV7D76—7B66WFæ6UÒ‚6fö7W6VB×c#ÖVffV7F76—7BÖ66WFæ6R’&Vf÷&R&÷f–ærF†R&VÆV6Rà ¢222W‡æFVBVffV7D76—7B6†V6·0 ¥W6RF†Rfö7W6VB6V7F–öâFò&÷fS  ¢ÒGvò&ÆW726÷W&6W26†&RöæRæöâ×7F6¶–ærÖ&¶W"æBöæRGF6²÷6fR&÷r—#°¢ÒVæF–æröæR6÷W&6RFöW2æ÷B&VÖ÷fRF†R&VÖ–æ–ær6÷W&6Rw2&ö¦V7F–öç3°¢Ò&RÖW†—7F–ærÖF6†–ærÖ&¶W'2æB&÷w2&R&W6W'fVBgFW"ÆÂVffV7D76—7B6÷W&6W2VæC°¢ÒÆÂ6—‚6FÆörFVf–æ—F–öç26â&RÆ–VBæBVæFVBv—F‚F†V—"Fö7VÖVçFVBWFöÖF–2æB76—7FVB&V†f–÷#°¢ÒwV–Fæ6R÷vç2öæRCFvÆö&Â6¶–ÆÂ&÷ræB&VÖ÷fW2—B6fVÇ“°¢ÒÆ–W"67F–ær&WV—&W26öçG&öÂöbF†R6÷W&6RÂW6W2&öÆÃ#w2ÖF&vWB&ö×Bf÷"f—6–&ÆR&V6—–VçG2v—F†÷WB&WV—&–ær&V6—–VçB6öçG&öÂÂææ÷Væ6W2fW&–f–VB6ö×ÆWFVB67BV&Æ–6Ç’ÂöffW'26ö×7BtÒ×&WVW7BfÆÆ&6²ÂæBö&W—2F†RtÒÆö6¶÷WBv—F†÷WBW‡÷6–ærtÒÖöæÇ’ÖVçW3°¢Òv&F–ær&öæB7&VFW2öæÇ’—G2³2÷6fR&÷w2æB†7FR7&VFW2öæÇ’—G2³&2&÷s°¢ÒÖçVÂ6÷W&6RÖ6öæ6VçG&F–öâ&VÖ÷fÂVæG2FWVæFVçBVffV7G2æB6ÆVç2öæÇ’÷væVBF&vWB7FFS°¢ÒVF—FVBVffV7D76—7BÖ7&VFVB6†VWB&÷w2&R&W6W'fVBæB&W÷'FVBf÷"GFVçF–öã°¢ÒÆ–æ¶VBå2F&vWG2&V6V—fRÖ&¶W"öÆ–fV7–6ÆR&V†f–÷"v—F†÷WB–æ&÷&–FR2ÖöæÇ’ÖöF–f–W"&÷w3°¢ÒÖ—†VBfÆ–BæB–çfÆ–B6VÆV7F–öç2&R&V¦V7FVBv—F†÷WB'F–ÂÆ–6F–öã°¢ÒÖ&¶W"Â6öæF—F–öä76—7BÂ#B×6†VWBÂ6öæ6VçG&F–öâÂæB&V6÷&BÖöæÇ’FVf–æ—F–öç2föÆÆ÷rF†V—"FV6Æ&VB&ö¦V7F–öâ6öçG&7G3°¢ÒVF—B—2&VBÖöæÇ’æB&W—"&WV—&W2g&W6‚ÂöæR×W6RtÒWF†÷&—¦F–öã°¢Ò6†ævVBFö¶Vâ–FVçF—G’6W6W2&VgW6Â&F†W"F†âw&—FRFòF†Rw&öær&W&W6VçFF–öã°¢ÒF—6&Æ–æræB&RÖVæ&Æ–ærVffV7D76—7B&W6W'fW2—G2&V6÷&G3°¢ÒÖÆf÷&ÖVB¶æ÷vâ7FFR—2&W÷'FVBv—F†÷WBFVÆWF–ærVæ¶æ÷vâ'&æ6†W2à ¢222VffV7D76—7Bf–ÇW&RWf–FVæ6P ¥&V6÷&C  ¢ÒF†RW†7B6öÖÖæC°¢ÒF†R6VÆV7FVBFö¶VâæÖW3°¢ÒF†RVffV7B–ç7Fæ6R”B6†÷vâ'’7FGW3°¢ÒF†RVF—B7VÖÖ'’æBÖ—6ÖF6‚&V6öã°¢Òv†WF†W"F†RÖ&¶W"Â6öæF—F–öâÂ6öæ6VçG&F–öâ7FFRÂ÷"6†VWB&÷rW†—7FVB&Vf÷&RÆ–6F–öã°¢Òv†WF†W"æ÷F†W"6÷W&6R7F–ÆÂ÷væVBF†R6ÖR&ö¦V7F–öã°¢Òç’æWr6æF&÷‚W†6WF–öâà ¢ÒÒĞ ¢27&÷72Ô6ö×öæVçB6†V6·0 ¢22W&Ö—76–öç0 ¢¢¥W'÷6S¢¢¢6öæf—&ÒtÒÖöæÇ’FÖ–æ—7G&F–öâ6ææ÷B&R'Vâ'’÷&F–æ'’Æ–W'2à ¢¢¥6¶—v†Vã¢¢¢6¶—öæÇ’–bæòÆ–W"66÷VçB—2f–Æ&ÆS²&V6÷&B—B2VçFW7FVBà ¤g&öÒæöâÔtÒ66÷VçBÂG'“  ¦&öÆÃ#6†@¢v×7FGW0¢vÖ6öæf–rÖöGVÆW0¢6öæF—F–öâ6öæf–p¢6öæF—F–öâFB&öæP¢Fö¶VâÖ76—7B6öæf–p¢Fö¶VâÖ76—7BÒÖ–G2Dô´Tåô”BÒÖfÆ—6†÷væÖP¢–æ—BÕ% ¢vVÆ6öÖRÔææ÷Væ6P¢…ÔÆÀ¢ç2ÖFVF‚ÖVF—@¦  ¥72v†VâtÒÖöæÇ’7F–öç2Fòæ÷BW†V7WFRf÷"F†RÆ–W"âFö¶Vä76—7B6†÷VÆB&VgW6RW‡Æ–6—BÔ”BF&vWF–ærv†–ÆRÆ–W'2Ö6âÖ–G6—2öfbÂ'WB6VÆV7FVB×Fö¶Vâ6öÖÖæG2&VÖ–âf–Æ&ÆRf÷"Fö¶Vç2F†RÆ–W"6öçG&öÇ2â–æ—F–F—fT76—7B6†÷VÆB&VgW6RÆ–W"&W&öÆÂöÖævVÖVçB6öÖÖæG2v†–ÆR7F–ÆÂÆÆ÷v–ær—G2V&Æ–2&öÆÂæB&öÆÂ÷F–öç2'WGFöç2f÷"6öçG&öÆÆVB6†&7FW'2à ¢22GWÆ–6FR–ç7FÆÆF–öà ¢¢¥W'÷6S¢¢¢6öæf—&ÒöæR6†B6öÖÖæB&öGV6W2öæR&W7öç6Rà ¢¢¥6¶—v†Vã¢¢¢æWfW"6¶—v†Vâ6öÖÖæG2&W7öæBGv–6Rà ¤–b6öÖÖæB&öGV6W2GWÆ–6FR÷WGWC  £â6†V6²F†RÖöBô’vRf÷"×VÇF—ÆRvÖT76—7B6÷–W2à£"â6†V6²f÷"öÆFW"7FæFÆöæR67&—G2F†B–×ÆVÖVçBF†R6ÖRfVGW&Rà£2â¶VWöæÇ’F†R–çFVæFVB–×ÆVÖVçFF–öâà£Bâ&W7F'BF†R6æF&÷‚æB&WVBF†R6öÖÖæBà ¥67&—G2F†B–æFWVæFVçFÇ’&W7öæBFò6öæF—F–öæ÷"Fö¶VâÖÖöFÂFW67&–&RF†R6ÖRÖ&¶W"6†ævW2ÂÖöF–g’F†R6ÖRå2…ö&"Â6öçG&öÂF†R6ÖRFö¶Vâ&÷W'F–W2÷"FVF‚ö6öæ6VçG&F–öâö6öæF—F–öâÖ&¶W'2Â&ö6W72F†R6ÖRæGW&Âv÷&¶fÆ÷rÂ÷"&Ww&—FRF†RæF—fRGW&âG&6¶W"Ö’6öæfÆ–7BWfVâv†VâF†V—"æÖW2F–ffW"âFö¶Vä76—7BFVÆ–&W&FVÇ’7W7VæG2öæÇ’—G2öÆFW"Fö¶VâÖÖöF6ö×F–&–Æ—G’Æ–2v†Vâ7FæFÆöæRFö¶VäÖöB—2FWFV7FVBÂ'WBF†R7FæFÆöæR6÷’6†÷VÆB7F–ÆÂ&R&VÖ÷fVBf÷"æ÷&ÖÂc"ããW6RâW6R–æ—F–F—fT76—7Bö'6W'fW"ÖöFRv†Vâæ÷F†W"–æ—F–F—fR&öÆÆW"÷vç2–æ—F–F—fRfÇVW3²ÆVfR6öÖ&D76—7BF—6&ÆVBv†Vâæ÷F†W"Væ6÷VçFW"ÖævW"÷vç2GW&âGfæ6VÖVçB÷"&÷VæG2à ¢227FFR&V6÷fW' ¢¢¥W'÷6S¢¢¢6öæf—&Ò¶æ÷vâ7FFR6öçF–æW'26VÆbÖ†VÂv†–ÆRVæ¶æ÷vâ'&æ6†W2&R&W6W'fVBf÷"&Wf–Wrà ¢¢¥6¶—v†Vã¢¢¢6¶—–çFVçF–öæÂ7FFR6÷''WF–öâ÷WG6–FRF—7÷6&ÆRFW7B6×–vâà ¥6fR&Wf–Ws  ¦&öÆÃ#6†@¢v×7FGW0¢vÖÖWG&–70¢vÖ6öæf–rÆ—7@¦  ¤Fòæ÷B'VâvÖ6öæf–r6ÆVçWÖW&VÇ’FòFW7B—Bâ6ÆVçWFVÆWFW2Væ¶æ÷vâ÷"÷'†æVB7FFRävÖT76—7F'&æ6†W2gFW"W‡Æ–6—B6öæf—&ÖF–öâà ¢ÒÒĞ ¢2G&÷V&ÆW6†ö÷F–ær'’7–×FöĞ ¢22æ÷F†–ær&W7öæG0 £âv—Bf÷"F†RÖöB6æF&÷‚&W7F'Bà£"â6†V6²F†R’6öç6öÆRf÷"vÖT76—7B7–çF‚÷"&VfW&Væ6RW'&÷"à£2â6öæf—&ÒvÖT76—7B—2Væ&ÆVBà£Bâ&VÖ÷fRGWÆ–6FR÷"'&ö¶Vâ6÷–W2à£Râ&WG'’v×7FGW6à ¥6öÇfRF†R6÷&R&ö&ÆVÒ&Vf÷&RFW7F–ærÖöGVÆW2à ¢22öæRÖöGVÆR—26–ÆVç@ ¥'Vã  ¦&öÆÃ#6†@¢vÖ6öæf–rÖöGVÆW0¢vÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSà¢vÖVæ&ÆRÄÖöGVÆT÷%6W'f–6TæÖSà¦  ¤6†V6²F†R6öæf–wW&VB7FFRÂ'Vææ–ær7FFRÂW†7B6öÖÖæB7VÆÆ–ærÂæBFW7B×Fö¶VâVÆ–v–&–Æ—G’â&VBF†RVæ&ÆR&W7öç6R&Vf÷&R6†æv–ærÖ÷&R6WGF–æw2à ¢22Ö&¶W"WFöÖF–öâf–Ç0 ¥'Vã  ¦&öÆÃ#6†@¢v×7FGW2ÒÖFWF–Ç0¢vÖ6öæf–rvWBå476—7BFVDÖ&¶W ¢vÖ6öæf–rvWB6öæ6VçG&F–öä76—7BÖ&¶W ¢Fö¶VâÖ76—7BÒÖ†VÇ×7FGW6Ö&¶W'0¢6öæF—F–öâ7FGW0¢ç2ÖFVF‚ÖVF—@¢ç2ÖFVF‚×&W— ¢6öæ6VçG&F–öâÒ×7FGW0¦  ¤6†V6³  ¢ÒÖ&¶W%6W'f–6R—2Væ&ÆVBà¢ÒF†RffV7FVBÖöGVÆR—2'Vææ–ærà¢ÒF†RFö¶Vâ—2öâF†Rö&¦V7G2Æ–W"æB&W&W6VçG2F†R&–v‡B6†&7FW"à¢Òå476—7BFö¶Vç2†fRç3Óà¢ÒF†R6öæf–wW&VB'V–ÇBÖ–âÖ&¶W"Â7W7FöÒF—7Æ’æÖRÂ÷"W†7B7F÷&VBFrW†—7G2à¢ÒF†R…÷"6öæ6VçG&F–öâ÷WF6öÖR7GVÆÇ’&WVW7FVBF†RW‡V7FVBÖ&¶W"7FFRà ¥7FæFÆöæRFö¶VäÖöBW&Ö—76–öç2&Ræ÷B&W—"f÷"vÖT76—7BÖ&¶W"f–ÇW&W2–âc"ããà ¥7F÷FW7F–æræB&W÷'BF†R&Vf÷&RögFW"Ö&¶W"fÇVW2–bâVç&VÆFVBÖ&¶W"÷"çVÖ&W"6†ævW2à ¢22å2…FöW2æ÷B&öÆÀ ¤6öæf—&Ó  ¢ÒFö¶Vâ—26VÆV7FVB÷"öâF†R7W'&VçBÆ–W"vS°¢ÒFö¶Vâ—2öâF†Rö&¦V7G2Æ–W#°¢ÒFö¶Vâ&W&W6VçG26†&7FW#°¢Ò6†&7FW"†2ç3Ó°¢Ò6†&7FW"†2fÆ–Bç5ö‡f÷&×VÆÂ7V6‚2FC‚³†à ¢227&—D76—7BFöW2æ÷B&öÆÀ ¤6öæf—&Ó  ¢Ò7&—FgVÖ&ÆR†VÇ&W7öæG3°¢ÒF†RW†7B&WV—&VBF&ÆRW†—7G2æB†2â—FVÓ°¢ÒF†RF—&V7BF&ÆR6öÖÖæBv÷&·3°¢ÒWFöÖF–2FWFV7F–öâW6W27W÷'FVBFV×ÆFRv—F‚C#æGW&Âà ¢22VWVR÷"W'&÷"6÷VçG2–æ7&V6P ¥'Vã  ¦&öÆÃ#6†@¢v×7FGW2ÒÖFWF–Ç0¢vÖÖWG&–70¢vÖ6öæf–rÖöGVÆW0¦  ¥VWVRÆVæwF‚FW67&–&W2W‡Æ–6—BVWVVBv÷&²æBÖöGVÆRÆ–fV7–6ÆRG&ç6—F–öç2âF–ÖV÷WB6â&VÆV6RF†RVWVR'WB6ææ÷BFW&Ö–æFRVæFW&Ç––ær&öÆÃ#÷"¦f67&—Bv÷&²à ¥&V6÷&BWf–FVæ6R&Vf÷&R&W6WGF–ærÖWG&–72à ¢ÒÒĞ ¢2'Vr&W÷'BWf–FVæ6P ¥v†VâFW7Bf–Ç2Â&V6÷&C  ¢Ò²ÒvÖT76—7BfW'6–öâà¢Ò²Ò6ö×öæVçBæBçVÖ&W&VBFW7Bà¢Ò²ÒW†7B6öÖÖæB÷"Fö¶Vâ7F–öâà¢Ò²ÒW‡V7FVB&W7VÇBà¢Ò²Ò7GVÂ&W7VÇBà¢Ò²Òv×7FGW2ÒÖFWF–Ç6÷WGWBà¢Ò²ÒvÖ6öæf–rÖöGVÆW6÷WGWBà¢Ò²Ò&VÆWfçBvÖ6öæf–rvWBÄÖöGVÆT÷%6W'f–6TæÖSæ÷WGWBà¢Ò²ÒW†7B’6öç6öÆRW'&÷"à¢Ò²ÒFö¶VâæÖRÂ”BÂÆ–W"ÂæBÆ–æ¶vRà¢Ò²Ò&VÆWfçB6†&7FW"GG&–'WFW2à¢Ò²ÒÖ&¶W"fÇVW2&Vf÷&RæBgFW"Âv†VâÆ–6&ÆRà¢Ò²Òv†WF†W"7FæFÆöæRFö¶VäÖöB÷"7FæFÆöæR7FGW4–æfòv2–ç7FÆÆVB÷"FWFV7FVBà¢Ò²Òv†WF†W"GWÆ–6FR÷"÷fW&Æ–ær67&—G2vW&R7F—fRà ¢ÒÒĞ ¢2&RÕ6W76–öâ6†V6° ¤–ÖÖVF–FVÇ’&Vf÷&R6W76–öã  ¦&öÆÃ#6†@¢v×7FGW0¢vÖ6öæf–rÖöGVÆW0¦  ¥F†Vâ'VâöæÇ’F†R&6–26†V6·2f÷"fVGW&W2F†R6W76–öâv–ÆÂW6S  ¢ÒÖ&¶W%6W'f–6S¢öæRF—7÷6&ÆRFVF‚÷&Wf—fÂÖ&¶W"7–6ÆRà¢Ò6öæf–uT“¢÷Vâ6WGF–æw2à¢Ò7&—D76—7C¢7&—FgVÖ&ÆR†VÇà¢Ò6öæF—F–öä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷Vâ6öæF—F–öæÂæB'Vâ6öæF—F–öâ7FGW6à¢ÒFö¶Vä76—7C¢6VÆV7BF—7÷6&ÆRFö¶VâÂ÷VâFö¶VâÖ76—7B†VÇÂæBfÆ—öæR†&ÖÆW72f—6–&–Æ—G’6WGF–ærGv–6Rà¢Ò6öæ6VçG&F–öä76—7C¢6öæ6VçG&F–öâÒ×7FGW6à¢Òå476—7C¢ç2ÖFVF‚×&W÷'F²W6Rç2ÖFVF‚ÖVF—Fv†Vâ6†V6¶–ærÖ&¶W'2æB÷Vâ&W—"öæÇ’–bÖ—6ÖF6‚—2–çFVçF–öæÂà¢Ò…76—7C¢&öÆÂöæRF—7÷6&ÆR6VÆV7FVBå2à¢ÒFV'VuFööÇ3¢6¶—VæÆW72FVÆ–&W&FVÇ’æVVFVBà¢Ò–æ—F–F—fT76—7C¢÷Vâ–æ—BÔtÖv†Vâ&—fFRVæ6÷VçFW"6WGWv–ÆÂ&RW6VBà¢ÒvVÆ6öÖT76—7C¢v†VâVæ&ÆVBÂ&Wf–WrF†Rw&VWF–æræB6öæf—&Ò7FGW2&Vf÷&RF†R6W76–öã²Fòæ÷BW6RÖçVÂææ÷Væ6RÖW&VÇ’2†VÇF‚6†V6²à ¤Fòæ÷BF—66÷fW"Ö&¶W"Â…Â÷"F&ÆR&ö&ÆVÒf÷"F†Rf—'7BF–ÖRGW&–ær6öÖ&Bà 