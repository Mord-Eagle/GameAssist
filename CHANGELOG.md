# Changelog

All notable changes to GameAssist are documented in this file.

This changelog is intentionally detailed. It records not only visible features, but also implementation locations, replaced behavior, design rationale, compatibility boundaries, state/migration effects, verification evidence, exclusions, and rollback posture. Line references describe the named release artifact and may move in later revisions; MECHSUITS section names are the more stable long-term locator.

---

## Release Ledger

| Revision | Status | Role |
| --- | --- | --- |
| **v2.0.0** | Development candidate; focused EffectAssist checks passed; Roll20 acceptance pending | Catalog-driven 2014-sheet effects, concentration coordination, projection ownership, audit, and repair |
| **v1.8.2** | Merged through PR #74; Issue #65 closed | Page-local progressive NPC token naming |
| **v1.8.1** | Merged through PR #73 | GM-private NPCAssist Bloodied threshold alerts and Control Center toggle |
| **v1.8.0** | Merged through PR #63; 712 automated checks passed | Canonical module identities and migration-safe project version transition |
| **v0.1.7.0** | Accepted after automated verification and live Roll20 smoke testing | Preservation-first encounter, turn, and round flow |
| **v0.1.6.1** | Merged; focused Roll20 acceptance passed | GM-private initiative start and optional table greetings |
| **v0.1.6.0** | Automated verification passed; Roll20 sandbox acceptance pending | Native Turn Tracker service and mixed-sheet initiative workflows |
| **v0.1.5.1** | Focused Roll20 timezone acceptance passed; complete manual module smoke not rerun | DM-configurable table time and NPC Session-date alignment |
| **v0.1.5.0** | Accepted release candidate; Issues #25-#29 and #32 complete | Integrated marker, token, and condition architecture |
| **v0.1.4.7** | Stable release; automated and Roll20 sandbox verification passed | Standalone TokenMod and StatusInfo interoperability |
| **v0.1.4.6** | Merged release | DM-readable system health and troubleshooting status |
| **v0.1.4.5** | Merged release | NPC death-history buckets, handouts, and arc notes |
| **v0.1.4.4** | Merged release | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.2** | Release candidate; automated verification complete, Roll20 smoke confirmation pending | Diagnostic and migration-readiness release |
| **v0.1.4.1** | Preserved rollback baseline | Stability-first repair of the uploaded v0.1.4 baseline |
| **v0.1.4** | Uploaded stable-but-limping baseline | Source used to build v0.1.4.1 |
| **Attempted v0.1.5** | Failed upgrade; never released | Review source for selected fixes only |
| **v0.1.3** | Prior development milestone; supplied notes retained below | Core lifecycle, metrics, helper, and module-hardening work |
| **v0.1.2** | Historical release | Roll20 packaging and initial MECHSUITS structural wrap |
| **v0.1.1.2** | Historical release | CritFumble natural-1 bugfix |
| **v0.1.1.1** | Historical release | Quiet startup and logging improvements |
| **v0.1.1.0** | Initial public release | Original four-module framework |

### Release-history notes

- v0.1.4.2 requires Roll20 API sandbox smoke confirmation before it should be used as a confirmed table build.
- v0.1.4.1 remains available as the rollback script during v0.1.4.2 confirmation.
- The attempted v0.1.5 file was not imported wholesale. Its unsafe or structurally unreliable changes were rejected; only isolated reviewed ideas were ported.
- Older supplied notes used â€œUnreleasedâ€ and â€œStagingâ€ labels for v0.1.3â€“v0.1.5 work. Those records are retained below as historical development evidence rather than silently discarded.
- Where the supplied historical record did not establish a release date, this changelog does not invent one.

---

## [2.0.0] â€“ 2026-07-28

### Release definition

GameAssist v2.0.0 introduces EffectAssist 2.0.0, a disabled-by-default, catalog-driven effect coordinator for the official D&D 5E by Roll20 2014 character sheet. It records the source, targets, stacking, duration guidance, concentration dependency, and projection ownership of each effect, then coordinates the marker, condition, concentration, and sheet mechanics Roll20 can represent safely. The shared SemanticEvents service provides immutable in-sandbox lifecycle notifications without coupling module state.

EffectAssist starts disabled so existing campaigns upgrade without receiving new markers, conditions, chat messages, or state mutations.

### Launch effect catalog

- Adds focused built-in definitions for Bless, Guidance, Warding Bond, Holy Weapon, Haste, and Pass Without a Trace.
- Gives every definition a stable identifier, readable rules summary, target guidance, duration guidance, concentration requirement, stacking group, projection list, and separate automatic, assisted, and informational instructions.
- Separates entries into **Marker and Sheet Automation** and **Tracked; Rules Stay Manual** before application.
- Omits Gift of Alacrity, Longstrider, and Beacon of Hope as built-in launch buttons because marker-only treatment does not remove enough table work; the generic Marker, Condition, and Record Only paths remain available when a GM deliberately wants that tracking.
- Presents a preview before application so the GM or casting player can see exactly what GameAssist will change and what still requires normal table adjudication.

### Official 2014 sheet projections

- Adds an ownership-aware adapter for the official D&D 5E by Roll20 2014 repeating global attack, saving-throw, skill, and AC modifier sections.
- Bless creates active `Bless (GameAssist)` `1d4` rows for global attack and saving-throw modifiers on eligible 2014 PC targets.
- Guidance creates an active `Guidance (GameAssist)` `1d4` global skill modifier row on eligible 2014 PC targets; ability checks that are not represented by a sheet skill retain an explicit manual-d4 instruction.
- Warding Bond creates active `Warding Bond (GameAssist)` `+1` rows for AC and saving throws.
- Haste creates an active `Haste (GameAssist)` `+2` AC row.
- Uses `setWithWorker` when Roll20 exposes it and avoids writing generated aggregate fields.
- Records exact attribute and row identifiers so cleanup can distinguish EffectAssist-created state from campaign-owned rows.
- Adopts matching pre-existing rows without claiming or deleting them.
- Preserves an EffectAssist-created row if a GM or another Mod edits its managed values, then reports that cleanup needs attention.
- Gives linked NPC targets marker and lifecycle support without creating PC-only modifier rows; unsupported mechanics remain explicit assisted steps.

### Complete Bless lifecycle

- Applies the configured Blessed marker to each target.
- Applies the 2014-sheet `1d4` global attack and saving-throw rows to eligible PC targets.
- Establishes concentration on the source through ConcentrationAssist's public lifecycle contract.
- Ends dependent Bless instances when source concentration ends through ConcentrationAssist or MarkerService observation.
- Removes only the final unneeded EffectAssist-owned target marker and unedited sheet rows.
- Rejects a second concentration effect from the same source unless replacement is explicitly confirmed; the guided prompt now presents replacement as the default choice.
- Rolls back partial work when any required projection cannot be established.

### Remaining catalog behavior

- Guidance manages its marker, safe `1d4` global skill row, source concentration, and cleanup while identifying non-skill ability checks as manual.
- Warding Bond manages its marker and safe `+1` AC/save rows while leaving resistance and mirrored damage to the table.
- Holy Weapon manages its marker and source concentration without adding a global damage row that would affect every weapon.
- Haste manages its marker, safe `+2` AC row, source concentration, and cleanup while identifying its remaining speed, save, action, and lethargy rules.
- Pass Without a Trace manages its marker and source concentration while identifying the `+10` Stealth and area-membership responsibilities.

### Semantic effect records and transactions

- Migrates EffectAssist durable state to schema version 2 with exact projection bindings for every instance.
- Adds reusable effect definitions with stable identifiers, readable names, concentration requirements, and multiple declared projections.
- Supports generic MarkerService, ConditionAssist, and record-only definitions for deliberate GM-managed effects.
- Records the exact source character and source token separately from every target character and target token.
- Preserves active instances across sandbox restarts and keeps a bounded history of the 100 most recently ended instances.
- Generates stable instance identifiers and rejects overlong or unsafe request identifiers.
- Makes repeated submission of the same request idempotent and refuses reuse of the same request ID for a different intent.
- Rejects a mixed valid/invalid target selection as one operation so a partial effect is never silently applied.
- Rolls back completed bindings if a later required binding fails during application.

### Projection ownership and overlap

- Adds shared projection ledgers for markers, conditions, concentration, and 2014-sheet rows. Each ledger records baseline state, creation ownership, expected values, and every active instance that currently relies on it.
- Allows overlapping sources to share non-stacking projections without multiplying visible or mechanical state.
- Ending one source removes only that source's ownership while another source remains active.
- Ending the final source removes the projection only when EffectAssist originally created it.
- Preserves matching markers, conditions, concentration, and sheet rows that existed before EffectAssist began managing the effect.
- Verifies each supported write and records clear pending or needs-attention health when a projection cannot be completed or safely cleaned.
- Refuses to mutate a token when its represented character no longer matches the identity captured by the effect instance.
- Treats manual removal of a target effect marker as auditable, repairable projection drift rather than silently ending the source's concentration or every target's effect.
- Continues to end dependent effects when the source's Concentrating marker is removed or ConcentrationAssist reports that concentration ended.

### Audit and authorized repair

- Adds a read-only audit that compares semantic instances, projection ownership, marker/condition state, concentration state, and exact 2014-sheet rows without changing the campaign.
- Reports missing or altered managed projections, unexpected remaining projections, unavailable services, malformed known records, incomplete cleanup, and token-identity drift as distinct conditions.
- Adds short-lived repair grants that are bound to the requesting GM and the exact mismatch signature.
- Makes each repair grant single-use and requires EffectAssist to recheck the mismatch immediately before writing.
- Refuses stale, expired, reused, altered, or non-GM repair requests.
- Runs a fresh audit after an approved repair so the result is visible rather than assumed.

### Game Master experience

- Adds a compact EffectAssist GM/DM control center, Guide/Help, Catalog, Active Effects, Info, Status, Definitions, Audit, Apply/Confirm, End, Repair, and persistent Manual workflow.
- Makes bare `!effect` open the catalog directly and keeps Status compact by moving complete active-instance controls to `!Effect-Active`.
- Adds an **End Effect** button to every successful application result.
- Adds a Player Casting switch to the GM control center; it is enabled by default and may be locked or restored without restarting the sandbox.
- Adds case-insensitive player shortcuts for `!Bless`, `!Guidance` / `!Guide`, `!Haste`, `!Warding-Bond`, `!Holy-Weapon`, and `!PwoaT`.
- Requires every player preview and confirmation to resolve a visible current-page linked source currently controlled by that Roll20 player; custom effects, status, audit, repair, and configuration remain GM-only.
- Uses Roll20's native map-target prompt so a player can choose visible linked recipients without controlling or preselecting their tokens.
- Restricts player-supplied recipient ids to linked Objects-layer tokens on that player's active Roll20 page; hidden and off-page recipients require GM placement.
- Adds an **Ask the GM** path that sends a compact source-authorized request with selected-token and map-target choices while retaining the ordinary review and confirmation gate.
- Preserves both the requesting player and approving GM on an approved effect record.
- Announces a successful player-originated cast publicly only after the complete effect application verifies; direct GM applications remain private.
- Provides friendly unknown-command recovery with a direct route back to the Guide.
- Keeps detailed catalog and lifecycle guidance in the module manual while ordinary chat menus remain task-oriented.
- Adds EffectAssist to ConfigUI, module health reporting, the public command matrix, One-Click metadata, and the module-specific smoke-test guide.

### TokenAssist compatibility wording

- Advances TokenAssist from 1.0.3 to 1.0.4 without changing token mutation behavior or command routing.
- Removes the expired instruction to replace older `!token-mod` macros before v2.0.0.
- Retains `!token-mod` as a compatibility alias while recommending `!token-assist` and `!ta` for new macros.
- Requires any future alias removal to be announced through a separate migration release rather than inferred from project-version numbering.

### SemanticEvents core service

- Adds an always-available in-memory service for immutable, JSON-safe semantic event envelopes.
- Assigns an event schema version, event id, stream id, sequence, producer, occurrence time, optional cause event, and payload to each publication.
- Delivers events directly and in publication order without routing ordinary handlers through the queue.
- Allows observers to filter by exact event type and isolates observer exceptions so one integration cannot interrupt another.
- Provides bounded observer registration and explicit cleanup by subscription or owner.
- Publishes EffectAssist lifecycle changes as `effect.lifecycle.changed`.
- Does not persist or replay events; durable gameplay truth remains in the owning module's state.

### State and lifecycle safeguards

- Adds EffectAssist schema-2 defaults through the existing state self-healing path while preserving valid configuration and unknown state branches.
- Adds the preserved `allowPlayerCasting` configuration key with a default of `true`.
- Reports malformed known definitions, instances, and projection records without deleting them automatically.
- Preserves EffectAssist runtime records when the module is disabled aë®»öÚ$z{-®éÜj×f—6–öâÂæB&W7F÷&W2F‡&÷Vv‚F†RwV&FVB6÷&R6W'f–6R&F†W"F†âw&—F–ærGW&æ÷&FW&F—&V7FÇ’à¢ÒF†RtÒÖ’¶VWF†R7W'&VçB&VF&ÆRG&6¶W"v—F‚6öÖ&BÔF÷FÂ&W6W'f–ærF†R&÷VæBæB&Vv–ææ–ærg&W6‚7–6ÆRv—F†÷WBG&6¶W"w&—FRà¢Ò6öÖ&D76—7BVçFW'2âW‡Æ–6—BGFVçF–öæ7FFRöæÇ’v†Vâ&VÆ–&ÆRö'6W'fF–öâ—2Væf–Æ&ÆR÷"Ö&–wV÷W2Â–æ6ÇVF–ærv†Vã ¢ÒF†RGW&âG&6¶W"6Æ÷6W3°¢ÒF†RG&6¶W"vR6†ævW3°¢ÒG&6¶W"¥4ôâ—2ÖÆf÷&ÖVC°¢ÒFö¶Vâ&VfW&Væ6R—27FÆR÷"öfb×vS°¢Ò&÷r†2æòW6&ÆR–FVçF—G“°¢ÒGWÆ–6FRFö¶Vâ&÷w2÷"GWÆ–6FR7W7FöÒÆ&VÇ2&R–æF—7F–æwV—6†&ÆS°¢ÒæF—fRGvò×&÷rÖ÷fVÖVçB6ææ÷B&R–FVçF–f–VB2f÷'v&B÷"&6·v&Bà¢ÒGFVçF–öâ÷WGWBW‡Æ–ç2v†B7F÷VB6÷VçF–æræBöffW'27W'&VçB×G&6¶W"F÷F–öâÂ6fVB×G&6¶W"&W7F÷&F–öâÂ7FGW2&Wf–WrÂæB6W&FVÇ’Æ&VÆVB&÷VæBÓ&W7F'Bà¢ÒW6R&VÖ–ç2f–Æ&ÆRf÷"6WfW&ÂV–WBVF—G2'WB—2æòÆöævW"&WV—&VBf÷"÷&F–æ'’FF—F–öç2Â&VÖ÷fÇ2Â&W&öÆÇ2Â÷"&V÷&FW&–ærà ¢222FFVB(	2Gvò×&÷rF—&V7F–öâ6fVwV&@ ¢ÒGvò×&÷rG&6¶W"—2ÆÆ÷vVBÂ'WB&öÆÃ#w2æF—fRf÷'v&BæB&6·v&B'&÷w2&öGV6RF†R6ÖR&W7VÇF–ær÷&FW"à¢Ò6öÖ&D76—7B&VgW6W2Fò–æfW"æF—fR'&÷rF—&V7F–öâf÷"F†BÖ&–wV÷W266Rà¢Ò6öÖ&BÔæW‡FæB6öÖ&BÕ&Wf6''’W‡Æ–6—BF—&V7F–öâF‡&÷Vv‚GW&åG&6¶W%6W'f–6RÂ6òGvò×&÷rVæ6÷VçFW'26âÖ÷fR6fVÇ’v†VâF†RtÒW6W26öÖ&D76—7B6öçG&öÇ2à¢ÒF†RV–6²wV–FRÂ7F'BæVÂÂ$TDÔRÂæBG&÷V&ÆW6†ö÷F–ærwV–Fæ6RÆÂF—66Æ÷6RF†—2Æ–Ö—FF–öâæB&V6÷fW'’F‚à ¢222FFVB(	2wV&FVBGW&â6öçG&öÇ0 ¢Ò6öÖ&BÔæW‡FæB6öÖ&BÕ&Wf&RtÒÖöæÇ’à¢Ò&Vf÷&R&÷FF–ærÂ6öÖ&D76—7B&R×&VG2F†R7W'&VçBG&6¶W"ÂfW&–f–W2F†RvRæBW†7BW‡V7FVB÷&FW"ÂæB&VgW6W2âGFVçF–öâ÷"7FÆR7FFRà¢ÒF†RWFFRW6W2vÖT76—7BåGW&åG&6¶W%6W'f–6RæÇ’‚âââ–v—F‚F†R7W'&VçB&Wf—6–öââ6öÖ&D76—7BæWfW"w&—FW26×–vâ‚’ç6WB‚wGW&æ÷&FW"rÂâââ–F—&V7FÇ’à¢ÒF†Rf÷'v&BG&ç6f÷&ÖF–öâÖ÷fW2öæÇ’F†Rf—'7B'&’VÆVÖVçBFòF†RVæC²F†R&6·v&BG&ç6f÷&ÖF–öâÖ÷fW2öæÇ’F†RÆ7BVÆVÖVçBFòF†Rg&öçBâWfW'’&÷rö&¦V7BÂ7W7FöÒVçG'’Â&–÷&—G’ÂVæ¶æ÷vâf–VÆBÂæBW‡FW&æÆÇ’÷væVBfÇVR—2&WF–æVBVæ6†ævVBà¢ÒGW&åG&6¶W%6W'f–6RfW&–f–W2F†R6fVBvRæB6W&–Æ—¦VB&÷w2&Vf÷&R6öÖ&D76—7B&W÷'G2F†RæWrGW&âà¢ÒF†Rv†—7W'2ÖÖöFRVæB×’GW&â'WGFöâ—2&÷VæBFòF†RW†7B7W'&VçBFö¶Vââ6öÖ&D76—7B&V6†V6·2F†R6Æ–6¶–ærÆ–W"w26öçG&öÂF‡&÷Vv‚F†RÆ–æ¶VB6†&7FW"æB&VgW6W27FÆR÷"VæWF†÷&—¦VB6öçG&öÇ2v—F†÷WB6†æv–ærF†RG&6¶W"à ¢222FFVB(	2Væ6÷VçFW"Æ–fV7–6ÆRæB&W6VçFF–öà ¢Ò6öÖ&D76—7B7F'G2F—6&ÆVB6òâWw&FR6ææ÷BF÷BâÇ&VG’÷VâG&6¶W"à¢Ò7F'BÂ7FGW2Â6WGWÂv&æ–ærÂ6öæf—&ÖF–öâÂ&6·v&BÖÖ÷fVÖVçBÂæBVæBæVÇ2&VÖ–âtÒÖöæÇ’à¢ÒGW&âæ÷F–6W2FVfVÇBFòtÒÖöæÇ’æBÖ’&RV&Æ–2Â6VçB26W&FRtÒö7W'&VçB×Æ–W"v†—7W'2Â÷"F—6&ÆVBà¢ÒtÒGW&âv†—7W'2–æ6ÇVFRæW‡BGW&âÂ&Wf–÷W2GW&âÂæB÷VâÖVçRâ–âv†—7W'2ÖöFRÂV6‚6öçG&öÆÆ–æræöâÔtÒÆ–W"&V6V—fW26W&FR&—fFR7W'&VçB×GW&âæVÂv—F‚VæB×’GW&âà¢Ò7V66W76gVÂÆ–W"VæB×’GW&â6Æ–6²&V6V—fW2&—fFR6¶æ÷vÆVFvVÖVçBF†B&W÷'G2F†RæW‡B–æ—F–F—fRv—F†÷WB–×Ç––ærF†BF†R&V6—–VçB6öçG&öÇ2—Bà¢Òv†VâöæRÆ–W"6öçG&öÇ26öç6V7WF—fR6†&7FW'2ÂF†R÷WFvö–ær¢¥GW&â6ö×ÆWFR¢¢6¶æ÷vÆVFvVÖVçB—2VÖ—GFVB&Vf÷&RF†RæW‡B6†&7FW"w2¢¥–÷W"GW&â¢¢&ö×BÂ&W6W'f–ærF†R–çFVæFVBÔ"Ô&VF–ær÷&FW"à¢ÒÆ–æ¶VBFö¶Vç2f—6–&ÆRöâF†Rö&¦V7G2Æ–W"Ö’&RæÖVB–âF†B6¶æ÷vÆVFvVÖVçBâtÒÖÆ–W"Fö¶Vç2ÂVæÆ–æ¶VBö&¦V7G2ÂæB7W7FöÒ&÷w2W6RvVæW&–26öçF–çVF–öâÖW76vR6ò†–FFVâ÷"æöâÖ6†&7FW"–æ—F–F—fR–FVçF—F–W2&Ræ÷BW‡÷6VBà¢ÒF†RtÒ6â6†ö÷6RöæR7FæF&BÖW76vR÷"v&ÖW"f&–VB&÷FF–öââF†R7FæF&B6VçFVæ6RV'2W†7FÇ’öæ6R2öæRÆ–'&'’6†ö–6S²F†R&VÖ–æ–ær6†ö–6W2FB&W7G&–æVBv&×F‚v—F†÷WBFG&W76–ærF†R&V6—–VçB2F†RæW‡B6†&7FW"à¢Ò7FÆRVæB×’GW&â'WGFöâ&V6V—fW2g&–VæFÇ’&—fFRæ÷F–6RF†BF†RG&6¶W"†2Ç&VG’Gfæ6VC²F†RöÆB6Æ–6²Ö¶W2æògW'F†W"6†ævRà¢ÒW6RæB&W7VÖRFòæ÷Bw&—FRG&6¶W"FFâ&W7VÖR¶VW2F†R7W'&VçB&÷VæBæBFVÆ–&W&FVÇ’W7F&Æ—6†W2æWræ6†÷"æB÷&FW"g&öÒF†R7W'&VçBG&6¶W"à¢ÒVæB&WV—&W26öæf—&ÖF–öâæB&VÖ÷fW2öæÇ’7FFRävÖT76—7Bä6öÖ&D76—7Bç'VçF–ÖRæVæ6÷VçFW&à¢ÒF—6&Æ–ær6öÖ&D76—7B&W6W'fW2—G2Væ6÷VçFW"&V6÷&BæBÆVfW2&öÆÃ#w2G&6¶W"Væ6†ævVBâ–bF†RG&6¶W"6†ævVBv†–ÆR6öÖ&D76—7Bv2Væf–Æ&ÆRÂF†R&W7F÷&VBÖöGVÆRVçFW'2GFVçF–öâ&F†W"F†âGFV×F–ærFò&V6öç7G'V7BÖ—76VB†—7F÷'’à¢ÒW‡æFVBv×7FGW2ÒÖFWF–Ç6æ÷r&W÷'G2v†WF†W"6öÖ&D76—7B—2F—6&ÆVBÂ–FÆRÂ7F—fRÂW6VBÂ÷"v—F–ærGFVçF–öâÂæB–FVçF–f–W2&÷F‚–æ—F–F—fT76—7BæB6öÖ&D76—7Bv†VâGW&åG&6¶W%6W'f–6R—2Væf–Æ&ÆRà ¢2227FFRæBÖ–w&F–öâ–×7@ ¢ÒFFVB7FFRävÖT76—7Bä6öÖ&D76—7Bæ6öæf–ræVæ&ÆVFÂFVfVÇF–ærFòfÇ6Và¢ÒFFVB7FFRävÖT76—7Bä6öÖ&D76—7Bæ6öæf–ræææ÷Væ6VÖVçG6ÂFVfVÇF–ærFòvÖà¢ÒFFVB7FFRävÖT76—7Bä6öÖ&D76—7Bæ6öæf–rçÆ–W$6öæf—&ÖF–öç6ÂFVfVÇF–ærFò7FæF&Fv—F‚7W÷'FVB7FæF&FæBf&–VFfÇVW2â6fVB&R×&VÆV6RgVæfÇVW2Ö–w&FRFòf&–VFà¢Ò–çfÆ–B6fVBææ÷Væ6VÖVçBfÇVW26VÆbÖ†VÂFòF†RFö7VÖVçFVBtÒÖöæÇ’FVfVÇBv—F†÷WB6†æv–ærfÆ–BvÖÂV&Æ–6Âv†—7W'6Â÷"öff6†ö–6W2à¢ÒFFVBöæRÖöGVÆRÖ÷væVB'VçF–ÖRæVæ6÷VçFW&&V6÷&B6öçF–æ–ærÆ–fV7–6ÆR7FFRÂvRÂ&÷VæBÂ7W'&VçBGW&â÷6—F–öâÂæ6†÷"Â7W'&VçBæB&6VÆ–æR&÷r–FVçF—F–W2ÂG&ç6—F–öâF—&V7F–öâÂ&Wf—6–öâÂF–ÖW7F×2ÂF†R7W'&VçB66WFVB6ö×ÆWFRG&6¶W"ÂæBöæR&÷VæFVB&Wf–÷W26†V6·ö–çBà¢ÒfÆ–B6öÖ&D76—7BããVæ6÷VçFW"&V6÷&G26VÆbÖ†VÂ'’6VVF–ærF†R66WFVBG&6¶W"g&öÒF†RÖF6†–ær7W'&VçBæF—fRG&6¶W"âÖÆf÷&ÖVB&V6÷fW'’FF—2F—66&FVBv—F†÷WBFVÆWF–ær÷F†W'v—6RfÆ–B6öæf–wW&F–öâà¢ÒW†—7F–ærvÖT76—7B7FFRÂ–æ—F–F—fT76—7Bw&÷W2Â&öÆÃ#G&6¶W"&÷w2ÂÖ&¶W"7FFRÂå2†—7F÷'’Â6öæf–wW&F–öâ6æ6†÷B66†VÖÂæBÖWG&–7266†VÖ&Ræ÷BÖ–w&FVB÷"&Ww&—GFVâà¢Ò&öÆÆ–ær&6²FòcããbãÆVfW2F†R6öÖ&D76—7B'&æ6‚–æW'BâVæF–ærF†RVæ6÷VçFW"&Vf÷&R&öÆÆ&6²—2÷F–öæÂ&V6W6RF†RV&Æ–W"&VÆV6RFöW2æ÷B&VBF†B'&æ6‚à ¢2226ö×F–&–Æ—G’æB÷væW'6†—&÷VæF' ¢Ò–æ—F–F—fT76—7B&VÖ–ç2F†R÷væW"öbBdB#Bó##B–æ—F–F—fR6Æ7VÆF–öâÂÆ–W"&öÆÂ÷F–öç2Âå2&—f7’ÂG&6¶W"÷VÆF–öâÂæB&W&öÆÇ2à¢ÒGW&åG&6¶W%6W'f–6R&VÖ–ç2F†R6–ævÆRWF†÷&—G’f÷"æF—fRG&6¶W"'6–ærÂvR&W6öÇWF–öâÂö'6W'fF–öç2Â&Wf—6–öâwV&G2ÂæBw&—FW2à¢Ò6öÖ&D76—7B÷vç2öæÇ’F†RW‡Æ–6—BVæ6÷VçFW"Æ–fV7–6ÆRÂ6öç6W'fF—fR–çFW'&WFF–öâöbW†7BG&6¶W"&÷FF–öç2ÂæB&W6W'fVB×&÷VæB†æFÆ–æröbfÆ–BæF—fRG&6¶W"Ö–çFVææ6Rà¢ÒGW&åG&6¶W%6W'f–6R—26öÖ&D76—7Bw2&6VÆ–æR&W&WV—6—FRâæò÷F†W"&6VÆ–æRvÖT76—7BÖöGVÆR&WV—&W26öÖ&D76—7BÂæBF—6&Æ–ær—BÆVfW2–æ—F–F—fT76—7BÂF†RæF—fRGW&âG&6¶W"ÂæBVç&VÆFVBvÖT76—7BfVGW&W2f–Æ&ÆRà¢Ò÷F–öæÂgWGW&R–çFW&÷W&&–Æ—G’Ö’æÖRæ÷F†W"ÖöGVÆR2&W&WV—6—FRf÷"F†B–æF—f–GVÂfVGW&RââVæf–Æ&ÆR&W&WV—6—FR×W7BF—6&ÆRöæÇ’F†RFWVæFVçBfVGW&RæB×W7Bæ÷B&WfVçBV—F†W"ÖöGVÆRw2&6VÆ–æR÷W&F–öâà¢Ò&öÆÃ#w2æF—fRf÷'v&BæB&6·v&BG&6¶W"6öçG&öÇ2&VÖ–âfÆ–B–çWG2â6öÖ&D76—7Bö'6W'fW2W†7B&÷FF–öç2æBFG2wV&FVB6öçG&öÇ3²—BFöW2æ÷B&WÆ6RF†RG&6¶W"–çFW&f6Rà¢Òæ÷F†W"ÖöBÖ’6öW†—7Bv†Vâ—BFöW2æ÷BÇ6òGfæ6RGW&ç2Â&V÷&FW"G&6¶W"&÷w2ÂÖævR&÷VæG2Â÷"×WFFR7W7FöÒ6÷VçFW"&÷w2GW&–ærâ7F—fR6öÖ&D76—7BVæ6÷VçFW"â6×–vç26†÷VÆB6†ö÷6RöæR7F—fRVæ6÷VçFW"ÖfÆ÷r÷væW"à¢ÒF—6&Æ–ærGW&åG&6¶W%6W'f–6R666FW2Fò&÷F‚–æ—F–F—fT76—7BæB6öÖ&D76—7Bv†–ÆRÆVf–ærF†RæF—fRG&6¶W"Væ6†ævVBà ¢222ÔT4…5T•E2&V6÷&G0 ¢ÒGfæ6VB&ææW"&ö¦V7E÷fW'6–öæÂ'VçF–ÖRdU%4”ôæÂæB&VÆV6R&÷6RFòcããrãà¢ÒFFVB´tÔT54•5C¤ÔôETÄU3¤4ôÔ$D54•5EÖFòF†R&ææW"÷&FW"Âö'6W'f&–Æ—G’7ç2Â6æöæ–6ÂG&VRÂæB‡—6–6ÂÔôETÄU2æW7F–ærà¢ÒWFFVBôÄ”5’v—F‚&÷VæFVB6öÖ&D76—7BG&6¶W"×&÷rÆ–Ö—G2æBGfæ6VB—G2ÖVæ–ævgVÂÖ6†ævR&V6÷&Bà¢ÒWFFVB4õ$RæBÔôETÄU2w&W"6öçG&7G2v†W&R&VÆV6R–FVçF—G’÷"÷væW'6†—6†ævVBà¢ÒGfæ6VB–æ—F–F—fT76—7BFòãã"v—F‚6ö×7B&ö÷BwV–FRæBfö7W6VBF÷–2æVÇ2v†–ÆR&W6W'f–ær–æ—F–F—fR6Æ7VÆF–öâÂW&Ö—76–öç2Â&—f7’ÂæBG&6¶W"&V†f–÷"à¢ÒFFVB6ö×ÆWFR6öÖ&D76—7B6V7F–öâ†VFW"Âæ'&F—fRÂwV&çFVW2ÂFWVæFVæ6–W2Â–æFWVæFVçBÖöGVÆRfW'6–öâÂFV6†–ær6öÖÖVçF'’ÂFV6—6–öâÆörÂæBæ÷FW2b6öÖÖVçG2fö÷FW"à ¢222&Vf–æVB(	2†VÇæB6öÖÖæB&V6÷fW' ¢Ò&V'V–ÇBF†R–æ—F–F—fT76—7B&ö÷BwV–FR26ö×7B7F–öâæBæf–vF–öâvRâFWF–ÆVB7F'F–ærÂ&öÆÂÖ÷F–öâÂ&W&öÆÂÂå2×&—f7’ÂæBG&÷V&ÆW6†ö÷F–ærwV–Fæ6Ræ÷rV'2öæÇ’gFW"F†R&VFW"6†ö÷6W2F†BF÷–2à¢Ò&V'V–ÇBF†R6öÖ&D76—7BV–6²wV–FR26ö×7B6öçG&öÂ6VçFW"õ7FGW2ÆVæ6†W"v—F‚fö7W6VBF÷–72f÷"Væ6÷VçFW"fÆ÷rÂG&6¶W"&V6÷fW'’ÂÆ–W"ÖW76vW2ÂæBGFVçF–öâ7FFW2à¢Ò6†ævVB¢¥v†BFöW26öÖ&D76—7BFóò¢¢Fò7&VFR÷"WFFRöæRW'6—7FVçBvÖT76—7BwV–FRÒ6öÖ&D76—7F†æF÷WBâ—G26öæf—&ÖF–öâöffW'2¢¤÷VâÖçVÂ¢¢Â¢¥v†—7W"6†÷'BfW'6–öâ¢¢ÂæB¢¤÷Vâ6öçG&öÂ6VçFW"¢¢à¢ÒFFVB6öÖ&D76—7B7FGW6ÂwV–FVö†VÇÂtÖöÖVçVÂ–æföÂæB&VBÖöæÇ’VF—Fæf–vF–öâÆ–6W22F†R&VfW&Væ6R–×ÆVÖVçFF–öâf÷"F†R&ö¦V7B×v–FR6öÖÖæB6öçfVçF–öâà¢ÒGfæ6VBvVÆ6öÖT76—7BFòããæB&WÆ6VB—G2Æöær6WGWvRv—F‚6ö×7B7F–öâæVÂÇW2fö7W6VB6WGWÂÖöFRÂ6×–vâÖw&VWF–ærÂV&æ6RÂæB6fWG’F÷–72à¢ÒFFVBvVÆ6öÖT76—7BVæ¶æ÷vâÖ6öÖÖæB&W7öç6RF†BW‡Æ–ç2F†R6öÖÖæBv2æ÷B&V6övæ—¦VBæB&÷f–FW2â¢¤÷VâwV–FR¢¢'WGFöâÂÖF6†–ærF†R&V6÷fW'’7G–ÆRÇ&VG’W6VB'’6öÖ&D76—7BæB–æ—F–F—fT76—7Bà¢Ò6ö×ÆWFVB´—77VR3S…Ò†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óS‚’7&÷72ÆÂVÆWfVâfVGW&RÖöGVÆW2v†–ÆR&W6W'f–ærV6‚ÖöGVÆRw2W7F&Æ—6†VB&Vf—‚æB7V6–Æ—¦VB6öçG&öÇ2à¢Ò6ö×ÆWFVB´—77VR3S•Ò†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óS’’v—F‚7F&ÆRöâÖFVÖæBÖçVÇ2f÷"7V'7FçF–Âv÷&¶fÆ÷w2æBW‡Æ–6—B–âÖ6†BwV–Fæ6Rf÷"'&–VbÖöGVÆW2à ¢2226öÖ&D76—7BW‡ç6–öâ&V6÷&G0 ¢Ò–×ÆVÖVçFVBæBÆ—fR×FW7FVBF†R6öæf–wW&&ÆRF–ÖW'2æB7FÆR×6fR&VÖ–æFW"6öçG&7BG&6¶VB'’´—77VR3SEÒ†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óSB’Â–æ6ÇVF–ær&V6—–VçB6VÆV7F–öâÂ7FÆR&VÖ–æFW"6æ6VÆÆF–öâÂæBF†R'VÆRF†BFVFÆ–æRæWfW"Gfæ6W2–æ—F–F—fRà¢Ò–×ÆVÖVçFVBæBÆ—fR×FW7FVBF†RæöâÖ6VçFW&–æræF—fR×–ær÷'F–öâöb´—77VR3SUÒ†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óSR’v—F‚tÒÖÆ–W"&—f7’âW'6—7FVçBFö¶Vâ×&÷W'G’†–v†Æ–v‡G2&VÖ–â6öæF—F–öæÂöâW†7BÆVv7’æB§V×vFR&W7F÷&F–öâWf–FVæ6Rà¢ÒFFVB´—77VR3SeÒ†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óSb’f÷"âW‡Æ–6—BÂ÷F–öæÂ6öÖ&D76—7B×FòÔå4ÖævW"Væ6÷VçFW"×7VÖÖ'’†æFöfbF†BFöW2æ÷BGWÆ–6FRFVF‚÷"&Wf—fÂ†—7F÷'’à¢ÒFFVB´—77VR3SuÒ†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óSr’f÷"÷BÖ–â6öÖ&B×W6–2†öö·2F†B&W6W'fRVç&VÆFVB&öÆÃ#§V¶V&÷‚Æ–&6²à¢ÒFVfW'&VB—77VW23SbæB3Sr6ò÷F–öæÂ7&÷72ÖÖöGVÆR†—7F÷'’æB§V¶V&÷‚&V†f–÷"Fòæ÷B&Æö6²F†RæW‡BÖöGVÆR†6Rà¢ÒWFFVB†VÆBÖ7F–öâ´—77VR3S5Ò†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óS2’Fò–æ†W&—B7FæF&Bõf&–VBv÷&F–æræBF†R6ÖR†–FFVâö7W7FöÒæW‡BÖ–æ—F–F—fR&—f7’'VÆRà ¢222Fö7VÖVçFF–öâæBÖWFFF ¢ÒW‡æFVB$TDÔRæÖFv—F‚6öÖ&D76—7Böæ&ö&F–ærÂÖöGVÆRwV–FRÂ6öÖÖæG2Â6öæf–wW&F–öâÂFWfVÆ÷W"’ÂÖ7&÷2ÂG&÷V&ÆW6†ö÷F–ærÂWw&FR7FW2Â&öFÖ7FFRÂ÷væW'6†—&÷VæF&–W2ÂæB7W'&VçBæöâÖvöÇ2à¢ÒW‡æFVB6Öö¶WFW7BæÖFv—F‚FVF–6FVB6öÖ&D76—7B6ö×öæVçB6V7F–öâæBcããrã6ÆVâÖ–ç7FÆÂæBWw&FR66WFæ6R&WV—&VÖVçG2à¢ÒWFFVB$ôDÔæÖFFò&V6÷&B6ö×ÆWFVBÆ—fR66WFæ6Rf÷"—77VW23SBÂ3SRÂ3S‚ÂæB3S’æBW‡Æ–6—FÇ’FVfW"3C"Â3C2Â3CBÂ3CRÂ3SÂ3S"Â3SbÂæB3Srà¢ÒFFVB´—77VR3cÒ†‡GG3¢òöv—F‡V"æ6öÒôÖ÷&BÔVvÆRôvÖT76—7Bö—77VW2óc’f÷"ÆFW"6ö×F–&–Æ—G’×&W6W'f–ærÖ–w&F–öâg&öÒ–æ†W&—FVBÖöGVÆRæÖW2FòF†RvÖT76—7BæÖ–ærfÖ–Ç’Â–æ6ÇVF–ærF†Rå4…&öÆÆW"6öç6öÆ–FF–öâFV6—6–öâà¢ÒWFFVB67&—Bæ§6öæFòGfW'F—6RcããrãÂVÆWfVâÖöGVÆW2ÂF†RW‡æFVBÖöGVÆRæf–vF–öâ6öÖÖæG2ÂF†R6ö×ÆWFR6öÖ&BÖfÖ–Ç’Â6†÷'BvVÆ6öÖV6öÖÖæG2ÂæF—fRVæ6÷VçFW"ÖfÆ÷r6fVwV&G2ÂæBGW&âG&6¶W"÷væW'6†—6öæfÆ–7G2–âVæB×W6W"ÆæwVvRà¢ÒFFVBcããbãFò&Wf–÷W7fW'6–öç6æB&WF–æVB—G2V&Æ–6F–öâ'F–f7B2F†R&öÆÆ&6²6†V6·ö–çBà ¢222&VÆV6R'F–f7G0 §Â'F–f7BÂ4„Ó#SbÀ§ÂÒÒÒÂÒÒÒÀ§ÂvÖT76—7FÂ3C3ƒSc##3T3D3„#$T$SsDSSC##C”4$cSDcc3„T$3#3TTDCD4Sd6À§ÂvÖT76—7Bæ§6Â3C3ƒSc##3T3D3„#$T$SsDSSC##C”4$cSDcc3„T$3#3TTDCD4Sd6À§ÂvÖT76—7B×cããrãÂ3C3ƒSc##3T3D3„#$T$SsDSSC##C”4$cSDcc3„T$3#3TTDCD4Sd6À§ÂvÖT76—7B×cããbãÂcTSc$T$$44dSC#$d4cƒD#CSctCs$CCc$c“cdTS“SCSss#dT3C“””TcvÀ§Â&Wf–÷W7fW'6–öç2ôvÖT76—7BcããbãÂcTSc$T$$44dSC#$d4cƒD#CSctCs$CCc$c“cdTS“SCSss#dT3C“””TcvÀ ¥F†RFWfVÆ÷ÖVçB6÷W&6RÂöæRÔ6Æ–6²V&Æ–6F–öâÖ—'&÷"ÂæBcããrã&öÆÃ#FW7B'F–f7B&R'—FRÖ–FVçF–6ÂâF†R&W6W'fVBcããbã&Wf–÷W2×fW'6–öâ'F–f7BÖF6†W2—G2÷&–v–æÂ&VÆV6R'F–f7Bà ¢222WFöÖFVBfW&–f–6F–öà §Â6†V6²Â&W7VÇBÀ§ÂÒÒÒÂÒÒÒÀ§Â¦f67&—B'6Rö6ö×–ÆRÂ76VBf÷"ÆÂ7W'&VçBæB&W6W'fVB&VÆV6R'F–f7G2À§Â6öÖ&D76—7Bfö7W6VB†&æW72Â76VBƒCRóCR’À§Â–æ—F–F—fT76—7Bfö7W6VB†&æW72Â76VBƒbób’À§ÂvVÆ6öÖT76—7Bfö7W6VB†&æW72Â76VBƒ3ó3’À§Â6öæF—F–öä76—7B6ÆVâÖ–ç7FÆÂ†&æW72Â76VBƒS’óS’’À§Â6öæF—F–öä76—7BÖ–w&FVB×7FFRæB7&÷72ÖÖöGVÆRæf–vF–öâ†&æW72Â76VBƒƒóƒ’À§ÂFö¶Vä76—7B&Vw&W76–öâ†&æW72Â76VBƒCRóCR’À§ÂF–ÖW¦öæR&Vw&W76–öâ†&æW72Â76VBƒ#2ó#2’À§Â–çFVw&F–öâæBÆ–fV7–6ÆR&Vw&W76–öâÂ76VBƒCbóCb’v–ç7BF†R&W6W'fVBcããBãr&6VÆ–æRÀ§Â6öÖ&D76—7BFWVæFVæ7’ÖF—&V7F–öâVF—BÂ76VC¢GW&åG&6¶W%6W'f–6R—2F†R6öÆR&6VÆ–æR&W&WV—6—FS²æò÷F†W"&6VÆ–æRÖöGVÆR&WV—&W26öÖ&D76—7BÀ§ÂÔT4…5T•E2†–W&&6‡’æBÖWFFFVF—BÂ76VC¢#bg&ÖVB6V7F–öç2æB#bÖF6†–ær6æöæ–6Â×G&VRVçG&–W2À§Â67&—Bæ§6öæ'6RfÆ–FF–öâÂ76VBÀ§Â7W'&VçB&VÆV6R'F–f7B–FVçF—G’Â76VBÀ§Â&W6W'fVBcããbã'F–f7B–FVçF—G’Â76VBÀ ¥F†RV–v‡BWFöÖFVB&V†f–÷"G&6·272SCR76W'F–öç2–âF÷FÂâF†R7G'V7GW&ÂÂÖWFFFÂ7–çF‚ÂæB'F–f7BÖ–FVçF—G’vFW2Ç6ò72à ¢222&öÆÃ#66WFæ6P ¥F†RFVF–6FVBÆ—fR&öÆÃ#726ö×ÆWFVB7V66W76gVÆÇ’â—B6öæf—&ÖVBæF—fR&÷VæBÖ6÷VçFW"³ÂfÆÆ&6²&÷VæB6÷VçF–ærÂ&6·v&B6fWG’Â&W6W'fVB×&÷VæBG&6¶W"VF—G2Â7FÆRF–ÖW"6æ6VÆÆF–öâÂFVFÆ–æRæöâÖGfæ6VÖVçBÂ–ærVF–Væ6W2æB†–FFVâ×GW&â&—f7’Â&V6÷fW'’ÂtÒö7W'&VçB×Æ–W"6öçG&öÇ2ÂÔ"ÔFVÆ—fW'’Â&—f7’×6fR6öæf—&ÖF–öç2ÂF†RW'6—7FVçBÖçVÂÂVç&VF&ÆR×7FFRGFVçF–öâÂGvò×&÷r&V†f–÷"ÂF—6&ÆR÷&VÆöB&V†f–÷"ÂæBVæ6†ævVB–æ—F–F—fT76—7B÷W&F–öââF†R6ÖR7266WFVB6ö×7BÖöGVÆRæf–vF–öâÂ&VBÖöæÇ’VF—Bv÷&F–ærÂVæ¶æ÷vâÖ6öÖÖæB&V6÷fW'’Â7F&ÆRæöâÖGWÆ–6F–ærÖçVÇ2ÂWVÂtÖöDÖÖöGVÆR67&VVç2ÂæBF†Rå4ÖævW"æB6öæ6VçG&F–öâ6öÖÖæBÆ–6W2à 