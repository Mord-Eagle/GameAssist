# GameAssist Development Roadmap

**GameAssist v2.0.0: Beta Testing. AlmanacAssist: Alpha Testing.**

This roadmap records GameAssist's completed standalone-to-integrated transition, native initiative and encounter foundations, completed `v1.8.x` module and NPCAssist work, and the current combined v2.0.0 EffectAssist, HealAssist, AttackAssist, AlmanacAssist, shared-health, and guided-play development line.

Use this document for durable release boundaries, sequencing, and completion gates. Use the linked GitHub issues for implementation details and acceptance evidence. Issues #60, #64, and #65 are complete, and PR #81 merged the combined v2.0.0 EffectAssist, HealAssist, AttackAssist, AlmanacAssist, shared-health, and guided-play development line. Issue #88 retains the EffectAssist player-casting and GM-request follow-up, while Issue #95 governs AlmanacAssist as the consolidated world-engine specification. AlmanacAssist 2.0.6 remains **Alpha Testing** in v2.0.0, with campaign-scale GM palettes, reviewed mileage travel, and single-use transactional rests. SheetCapabilities 1.0.0 implements the first Issue #91 contract for operation-specific 2014, 2024/Beacon, and unknown evidence; later verified adapters remain phased work.

> The roadmap is a maintained plan, not a promise of dates. Issues #25 through #29 are development checkpoints within one release train; none is an intermediate public release.

---

## Release Review Fixes

MarkerService 1.1.2 preserves signed relative marker arithmetic before applying count bounds. TokenAssist 1.3.1 retains repaired relative tint/aura colors. InitiativeAssist 1.0.8 reads the shared NPC HP bar for living/dead eligibility and retains the reactivation repair introduced in 1.0.7; CombatAssist 1.2.2 restores its observer, API, and timer resources after re-enabling. AlmanacAssist 2.0.6 consumes rest grants before the first sheet write so a rolled-back HealthService operation cannot make a retry appear successful.

## Current Almanac Status

**AlmanacAssist 2.0.6: Alpha Testing.** **Current Settings** provides direct Climate and Biome choices, twelve ecoregion starters, and optional Geography, Terrain, Environment, Hydrology, and Vegetation layers. Named buttons are paginated; Seasons and Weather Breakdown expose the actual influence on generation. Saved locations and custom local profiles retain the layered setup without changing time or restoring an old weather roll. Existing linked-world controls and saved data remain available under advanced tools. Rest confirmations become single-use when writing begins and failed transactions require a fresh preview. All six internal systems are included; the alpha remains optional and disabled by default while broader campaign testing continues.

The next live checks are **Current Settings And Location Recall** and **Local Layers And Seasonal Influence** in `Smoketest.md`, followed by the retained **Location Setup And Preservation** and **World Profiles And Seasonal Weather** checks. Focused automation covers emitted choices through a local HTML boundary, layer replacement, weather calculations, calendar-season forecasts, save/recall isolation, WorldPack transfer, permissions, and restart preservation. That browser fixture is not Roll20's renderer and does not close live acceptance.

## Status Key

| Status | Meaning |
| --- | --- |
| Planned | Scope and acceptance criteria are recorded, but implementation has not started. |
| In progress | Active investigation or implementation is underway. |
| Sandbox verification | Code work is complete enough for Roll20 testing, but the release gate has not passed. |
| Alpha Testing | Early campaign testing; workflows and usability may still change. AlmanacAssist is at this stage. |
| Beta Testing | GameAssist v2.0.0 testing across the suite, with unresolved findings tracked before a stable release. |
| Complete | Acceptance criteria, documentation, and Roll20 sandbox verification have passed. |
| Deferred | Intentionally postponed until the stated prerequisite is complete. |

---

## Guiding Decisions

1. **The `v0.1.4.x` line remains standalone-compatible.** TokenMod and StatusInfo stay separately installed Roll20 Mod/API scripts. GameAssist may improve interoperability and diagnostics, but it will not embed or rebuild either dependency in this release line.
2. **`v0.1.5.0` is released only as the complete integration.** Production installations will use TokenAssist and ConditionAssist instead of standalone TokenMod and StatusInfo for supported workflows.
3. **MarkerService becomes shared core infrastructure.** `[GAMEASSIST:CORE:MARKERSERVICE]` will be the single internal authority for resolving, reading, modifying, and observing built-in and custom status markers.
4. **TokenAssist owns general token controls.** It uses `!token-assist` and `!ta`/`!ta-*`, temporarily accepts older supported `!token-mod` macros during v0.1.x, and uses MarkerService for marker behavior.
5. **ConditionAssist owns condition guidance.** It preserves supported `!condition` workflows while using MarkerService for marker behavior.
6. **Attribution and license notices are mandatory.** TokenAssist and ConditionAssist preserve applicable MIT notices, authorship, upstream baselines, and adapted portions.
7. **Roll20 is the final compatibility test.** Syntax checks and local reasoning are necessary but cannot replace sandbox smoke tests.
8. **Initiative and combat remain separate responsibilities.** TurnTrackerService owns safe native-tracker mechanics, InitiativeAssist owns initiative calculation and reroll UX, and CombatAssist owns deliberate encounter lifecycle plus conservative turn and round observation. Timers, reminders, current-turn indicators, reporting handoff, and music are staged immediately after the foundation acceptance rather than folded into tracker mechanics.
9. **Public startup greetings remain deliberate.** WelcomeAssist starts disabled, previews privately, announces automatically only after completed healthy Bootstrap, and never treats live enablement as permission to post.
10. **Project releases use three-part semantic versions beginning with v1.8.0.** Historical four-part identifiers remain unchanged, and independently versioned modules keep their own established version sequences. Compatibility aliases are removed only through an explicit later migration issue, never merely because the project version format changed.
11. **SemanticEvents carries notifications, not gameplay authority.** Owning modules persist durable truth; the core service delivers immutable in-memory events in publication order and isolates observers.
12. **EffectAssist owns semantic effects and projection evidence.** MarkerService remains the marker authority, ConditionAssist remains the condition authority, ConcentrationAssist remains the concentration authority, and sheet, HP, and timing integrations use explicit adapters or events rather than hidden cross-module writes.
13. **v2.0.0 includes all six AlmanacAssist systems under Alpha Testing.** Time, Climate, Astronomy, Weather, Environment, and Rest remain independently controlled within one optional module. None ships as a separate partial release, and none becomes a hidden prerequisite for unrelated GameAssist modules.
14. **HealthService records evidence, not combat conclusions.** It normalizes supported 2014-PC HP attributes and linked-NPC transitions on one GM-selected shared token bar, verifies GameAssist-owned writes, and deduplicates linked Roll20 events. Unknown external changes remain unknown; consumers retain their own rules, state, confirmation, and manual paths.
15. **HealAssist guides healing without owning resources.** It uses HealthService for supported HP, offers normal or maximum results and default automatic verified application or optional review, routes private recipients to the GM, and never spends spell slots, items, class resources, or temporary HP on the table's behalf.
16. **AttackAssist guides attacks without owning their consequences.** It reuses verified official-2014 repeating attack formulas and native target prompts, keeps hidden placement with the GM, and never applies damage, spends resources, changes effects or conditions, or moves the Turn Tracker.
17. **Finish Roll20 before beginning the Foundry edition.** Roll20 v2.0.0 ships as a bounded campaign-scale release with GM-editable definitions and portable WorldPacks that fit the Mod sandbox. After live acceptance and a stable Roll20 baseline, development moves consecutively to a Foundry-native sister package. That edition begins with AlmanacAssist and atlas-scale WorldPack storage, then ports other modules around Foundry's own documents, effects, combat, compendia, and application framework. The two editions may share versioned data schemas where practical, but they keep separate codebases and release histories.

---

## Current Sequence

| Stage | Status | Tracking Issue | Release Outcome |
| --- | --- | --- | --- |
| ConcentrationTracker failure investigation | Complete | [#20](https://github.com/Mord-Eagle/GameAssist/issues/20) | Validate custom-marker recognition and actionable diagnostics in Roll20. |
| DM-facing help and audit wording | Complete | [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) | Make CritFumble help/menu output and NPC death-audit reports easier to read while preserving existing commands. |
| NPC death-history buckets and handouts | Complete | [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) | NPCManager 1.1.0 provides four-level history, report writing, hierarchical clears, date rollover, and curated Arc controls. |
| GameAssist status readability | Complete | [#23](https://github.com/Mord-Eagle/GameAssist/issues/23) | The plain-language `!ga-status` system check and optional troubleshooting panel shipped in v0.1.4.6. |
| Standalone interoperability stabilization | Complete | [#24](https://github.com/Mord-Eagle/GameAssist/issues/24) | v0.1.4.7 uses TokenMod's documented `--api-as` path, verifies marker results, reports optional StatusInfo evidence, and passed the Roll20 sandbox acceptance pass. |
| MarkerService checkpoint | Complete | [#25](https://github.com/Mord-Eagle/GameAssist/issues/25) | The shared marker core, consumer migrations, lifecycle safeguards, focused regressions, and Roll20 checkpoint are complete. |
| ConditionAssist checkpoint | Complete | [#26](https://github.com/Mord-Eagle/GameAssist/issues/26) | ConditionAssist 1.0.1 provides accurate selected-token recognition, current-page condition/marker status, wording profiles, artwork, announcements, migration, and MarkerService synchronization accepted for integrated stabilization. |
| TokenAssist checkpoint | Complete | [#27](https://github.com/Mord-Eagle/GameAssist/issues/27) | TokenAssist 1.0.1 provides the supported full/short commands, temporary older syntax, MarkerService-backed status operations, corrected auras and movement, migration, observers, and collision protection accepted for integrated stabilization. |
| Integrated architecture stabilization | Complete | [#28](https://github.com/Mord-Eagle/GameAssist/issues/28) | The complete clean-install, upgrade, lifecycle, condition-status, death-repair, and module smoke tracks passed in Roll20. |
| v0.1.5.0 release gate | Complete | [#29](https://github.com/Mord-Eagle/GameAssist/issues/29) | Attribution, documentation, metadata, artifact identity, automated checks, review, and full Roll20 acceptance are complete. |
| Marker-registry lookup verification | Complete | [#32](https://github.com/Mord-Eagle/GameAssist/issues/32) | MarkerService prefers documented `token_markers`, falls back to `_token_markers`, and keeps built-ins and exact stored tags independent of registry parsing. |
| DM-configurable timezone | Complete | [#35](https://github.com/Mord-Eagle/GameAssist/issues/35) | v0.1.5.1 adds one validated DM timezone for human-facing timestamps and date-based Session rollover while preserving absolute stored timestamps. The focused Roll20 timezone workflow passed; the complete live module suite was not rerun. |
| Native Turn Tracker and initiative foundation | Complete | [#47](https://github.com/Mord-Eagle/GameAssist/issues/47) | The v0.1.6.0 live workflow and v0.1.6.1 private `!Init-GM` controls passed their Roll20 acceptance checks. |
| Optional table welcome | Complete | [PR #49](https://github.com/Mord-Eagle/GameAssist/pull/49) | WelcomeAssist 0.1.6 retains the accepted greeting workflow, compact navigation, stable manual, equal GM/DM settings aliases, and short or full-name command routes while adopting the shared private-control presentation. Its public greeting card remains intentionally distinct. |
| CombatAssist encounter flow | Complete | [#48](https://github.com/Mord-Eagle/GameAssist/issues/48) | v0.1.7.0 includes CombatAssist 1.0.5: native round-counter authority, preserved-round encounter flow, recovery, guarded movement, timers, native pings, privacy-safe confirmations, compact guidance, a stable manual, and equal GM/DM controls. The complete Roll20 acceptance pass succeeded. |
| CombatAssist turn timers and reminders | Complete | [#54](https://github.com/Mord-Eagle/GameAssist/issues/54) | Disabled-by-default duration, deadline, and per-reminder recipient controls bind callbacks to the encounter, round, current identity, tracker revision, and deadline; the Roll20 acceptance pass confirmed timers never advance turns. |
| CombatAssist current-turn visuals | Complete | [#55](https://github.com/Mord-Eagle/GameAssist/issues/55) | Disabled-by-default non-centering native pings support GM, player, combined, and public audiences while restricting hidden turns to the GM. Persistent token highlights remain separately deferred. |
| CombatAssist encounter-summary handoff | **Implemented; sandbox verification** | [#56](https://github.com/Mord-Eagle/GameAssist/issues/56) | An explicit NPCAssist transaction records an optional Session or all-active-report summary by encounter id without creating or duplicating death/revival history. |
| CombatAssist music hooks | Post-v2 research | [#57](https://github.com/Mord-Eagle/GameAssist/issues/57) | Requires verified Jukebox ownership, restore, and coexistence behavior; it is independent of reliable encounter tracking. |
| Compact help and command recovery | Complete | [#58](https://github.com/Mord-Eagle/GameAssist/issues/58) | Every feature module exposes compact navigation, an action-appropriate GM/DM screen, read-only audit wording, and friendly unknown-command recovery. |
| Persistent module manuals | Complete | [#59](https://github.com/Mord-Eagle/GameAssist/issues/59) | Modules with substantial workflows create or update one stable `GameAssist Guide - <Module>` handout; brief modules keep complete guidance in chat. The Roll20 acceptance pass succeeded. |
| Canonical module identities | Complete | [#60](https://github.com/Mord-Eagle/GameAssist/issues/60), [PR #63](https://github.com/Mord-Eagle/GameAssist/pull/63) | v1.8.0 migrated CritAssist, NPCAssist, ConcentrationAssist, and HPAssist names while preserving valid state, records, handouts, APIs, and established commands. PR #63 merged and Issue #60 closed. |
| NPCAssist Bloodied alerts | Complete | [#64](https://github.com/Mord-Eagle/GameAssist/issues/64), [PR #73](https://github.com/Mord-Eagle/GameAssist/pull/73) | v1.8.1 added a focused GM-private 50% HP crossing alert and one-click Control Center toggle without changing death-history semantics. |
| Progressive NPC naming | Complete | [#65](https://github.com/Mord-Eagle/GameAssist/issues/65), [PR #74](https://github.com/Mord-Eagle/GameAssist/pull/74) | v1.8.2 prevents accidental duplicate NPC token names through page-local, current-token numbering that the GM can disable or deliberately override. |
| Suite-level GM/help navigation | Sandbox verification | [PR #81](https://github.com/Mord-Eagle/GameAssist/pull/81) | `!GA-GM`/`!GA-DM`, `!ga-help`, and progressive `!ga-nav` connect all fifteen module-owned interfaces; every module's primary GM screen returns to the suite control center. All GameAssist command paths ignore capitalization and accept spaces or hyphens between command words, while shared navigation, ConfigUI, ConditionAssist, and TokenAssist use the same Roll20 default-template presentation established by HPAssist and CombatAssist. |
| EffectAssist 2014 launch | Sandbox verification | [#75](https://github.com/Mord-Eagle/GameAssist/issues/75) | v2.0.0 implements a focused six-effect catalog, player casting with GM lockout, source-aware instances, multi-projection ownership, lifecycle history, read-only audit, and authorized repair. |
| EffectAssist 2014 sheet projection | Sandbox verification | [#76](https://github.com/Mord-Eagle/GameAssist/issues/76) | Bless, Warding Bond, and Haste use ownership-safe repeating global modifier rows on official 2014 PC sheets, with NPC and assisted fallbacks. |
| EffectAssist cast recognition | Sandbox verification | [#77](https://github.com/Mord-Eagle/GameAssist/issues/77) | EffectAssist offers bounded, deduplicated, single-use GM proposals for unambiguous official 2014 Bless cards; it never infers recipients or bypasses ordinary review and confirmation. |
| EffectAssist player-casting workflow | Sandbox verification | [#88](https://github.com/Mord-Eagle/GameAssist/issues/88) | EffectAssist 2.5.4 uses short-lived player-bound choices, compact unique caster labels with concise duplicate-token disambiguation, recipient counts from one through eleven for Bless, consistent `(GA)` owned rows, retained GM requests, direct GM controls, visible stale-button recovery, exact invalid-recipient guidance, token-specific concentration ownership, and distinct provider-boundary wording. |
| EffectAssist concentration observation | Sandbox verification | [#78](https://github.com/Mord-Eagle/GameAssist/issues/78) | ConcentrationAssist 0.6.0 owns concentration state and exposes lifecycle events used for dependent EffectAssist cleanup. |
| Shared HealthService foundation | Sandbox verification | [#83](https://github.com/Mord-Eagle/GameAssist/issues/83) | HealthService 1.1.1 provides canonical supported HP snapshots, immutable deduplicated transitions, bounded evidence, verified producer-identified writes, and one GM-selected shared NPC bar with current-page setup and unlinked-token auditing. NPC setup refuses missing numeric HP evidence instead of consulting unsupported fields. NPCAssist, HPAssist, and supported DebugTools writes consume the same selection. |
| ConcentrationAssist HP-loss offers | Sandbox verification | [#79](https://github.com/Mord-Eagle/GameAssist/issues/79) | ConcentrationAssist 0.6.0 consumes HealthService evidence through private, deduplicated, revalidated check offers without treating every decrease as proven damage, and refuses unavailable save contracts instead of guessing a bonus. |
| EffectAssist duration candidates | Sandbox verification | [#80](https://github.com/Mord-Eagle/GameAssist/issues/80) | EffectAssist 2.5.4 consumes accepted CombatAssist progression and committed Almanac time to create private, reversible GM review candidates without automatic expiration. |
| EffectAssist catalog expansion | Post-v2 adapters | [#82](https://github.com/Mord-Eagle/GameAssist/issues/82) | Each additional effect needs a verified ownership-safe sheet, initiative, movement, healing, or weapon adapter; adding names without mechanics would repeat the launch-catalog problem. |
| AlmanacAssist master program | **Alpha Testing** | [#95](https://github.com/Mord-Eagle/GameAssist/issues/95), [PR #81](https://github.com/Mord-Eagle/GameAssist/pull/81) | AlmanacAssist 2.0.6 includes all six systems, layered world profiles, season-aware weather, reviewed travel, and single-use rest transactions as an optional alpha in v2.0.0. Expanded live and upgrade results remain part of alpha follow-up, not falsely completed gates. |
| TimeAlmanac | Alpha Testing | [#66](https://github.com/Mord-Eagle/GameAssist/issues/66) | One elapsed fictional-minute authority, four profiles, editable Wayfarer structure and holidays, guarded changes, player read-only output, history, and events. |
| ClimateAlmanac | Alpha Testing | [#67](https://github.com/Mord-Eagle/GameAssist/issues/67) | Built-in/editable/custom profiles, bounded regions, parent inheritance, overrides, active region, and manual season fallback. |
| AstronomyAlmanac | Alpha Testing | [#68](https://github.com/Mord-Eagle/GameAssist/issues/68) | Configurable moons/phases, daylight and deterministic season boundaries, read-only forecasts, and separate weighted rare-event suggestions. |
| WeatherAlmanac | Alpha Testing | [#69](https://github.com/Mord-Eagle/GameAssist/issues/69) | Structured continuity-aware current weather, optional context, fallback operation, forecasts, locks, manual weather, history, and events. |
| EnviroAlmanac | Alpha Testing | [#70](https://github.com/Mord-Eagle/GameAssist/issues/70) | Structured descriptive environment context, weather derivation, manual presets, persistent override, and no automatic gameplay penalties. |
| RestAlmanac | Alpha Testing | [#71](https://github.com/Mord-Eagle/GameAssist/issues/71) | Previewed and revalidated 2014-PC Short/Long/Extended/custom rests with verified fields, optional Time advancement, rollback, history, and events. |
| AlmanacAssist coherent world engine | **Alpha Testing; local gates passed** | [#95](https://github.com/Mord-Eagle/GameAssist/issues/95) | AlmanacAssist 2.0.6 adds compact weather/time/travel/event/announcement/setup palettes and stale-safe mileage travel with advisory road conditions and GM-private encounter checks while retaining Session and Worldbuilding modes, signed Year 0 chronology, a provenance-bearing SceneResolver, bounded definitions, prepared destinations, phenomena, local temporal contexts, presets, RulesAdvisor, advanced Wayfarer editing, atomic WorldPacks, and single-use rest confirmations. Focused live use has been reported; expanded verification continues. |
| GM-private PC health alerts | Sandbox verification | [#86](https://github.com/Mord-Eagle/GameAssist/issues/86) | Optional 50%, 25%, and 10% downward-crossing notices now consume canonical HealthService events, remain GM-private, combine large drops, hide exact HP by default, and leave NPC policy unchanged. |
| HealAssist guided healing | Sandbox verification | [#84](https://github.com/Mord-Eagle/GameAssist/issues/84) | HealAssist 1.2.2 adds authorized sources, direct targeting for one-recipient actions, count choices for multi-recipient actions, supported 2014 normal and maximum healing, default automatic verified application or optional review, private GM placement requests, safe public-result fallback, and HealthService writes without consuming resources. |
| AttackAssist guided attacks | Sandbox verification | [#87](https://github.com/Mord-Eagle/GameAssist/issues/87) | AttackAssist 1.1.0 adds authorized official-2014 repeating-attack selection, stable row identity, a compact native visible-target choice, immediate sheet-setting submission by default, optional explicit roll-mode review, retained private placement requests, complete prompt-safe Classic-sheet materialization, visible native sheet cards, preflight refusal for unresolved prompts, incomplete fields, or unsafe final dice expressions, one-use submission, and no damage or combat-state writes. |
| Shared character-sheet capability contract | **Implemented foundation; later adapters phased** | [#91](https://github.com/Mord-Eagle/GameAssist/issues/91) | SheetCapabilities 1.0.0 centralizes per-character, per-operation 2014, 2024/Beacon, and unknown evidence; `!ga-sheets` audits the current page without writing. Later operation adapters still require their own verification. |
| Guidance verified consumption | Sandbox verification | [#85](https://github.com/Mord-Eagle/GameAssist/issues/85) | EffectAssist 2.5.4 retains the compact owned Guidance label and may consume one exact, unambiguous supported 2014 skill check. Unsupported or ambiguous evidence remains manual; live normal/advantage/disadvantage acceptance is still required. |
| TokenAssist marker-expression parity | **Implemented; expanded verification pending** | [#42](https://github.com/Mord-Eagle/GameAssist/issues/42) | MarkerService owns validated duplicate-index, conditional, relative-count, and minimum/maximum expressions while preserving unrelated markers. |
| TokenAssist attributes, controllers, and reporting | **Implemented; expanded verification pending** | [#43](https://github.com/Mord-Eagle/GameAssist/issues/43) | TokenAssist resolves exact saved attributes and supported computed values, edits exact or unambiguous controller identities, and routes reports through explicit privacy-aware recipients. |
| TokenAssist visual and multi-sided controls | **Implemented; expanded verification pending** | [#44](https://github.com/Mord-Eagle/GameAssist/issues/44) | Selected-token color arithmetic, dimming controls, and relative/random multi-sided selection are implemented; persistent image/default-token asset writes remain Issue #45. |
| TokenAssist image/default-token writes | Post-v2 design | [#45](https://github.com/Mord-Eagle/GameAssist/issues/45) | Persistent avatar/default-token mutation has a larger and less reversible blast radius than ordinary selected-token edits and needs a dedicated confirmation and rollback design. |
| API_Meta diagnostics | Post-v2 diagnostics | [#50](https://github.com/Mord-Eagle/GameAssist/issues/50) | Useful for source offsets and script interoperability evidence, but adopting it requires generated offset metadata and drift maintenance; current GameAssist diagnostics do not depend on it. |
| CombatAssist damage timeline | **Implemented; bounded evidence** | [#52](https://github.com/Mord-Eagle/GameAssist/issues/52) | CombatAssist retains up to 500 HealthService changes for the active or most recent encounter with encounter, round, turn, actor, boundary, and provenance evidence. It does not claim attacker or cause. |
| CombatAssist Ready/Delay actions | **Implemented; opt-in** | [#53](https://github.com/Mord-Eagle/GameAssist/issues/53) | Optional 5e Ready and legacy Delay records include player authorization, expiry, `!Now`, cancellation, and conservative native-tracker reconciliation. The feature defaults off and applies no game mechanics. |
| GameAssist handout organization | **Implemented; folder routing unavailable** | [#72](https://github.com/Mord-Eagle/GameAssist/issues/72) | Stable owner/key identities, conflict-safe updates, and `!ga-handouts` indexing are implemented. Journal-folder placement remains manual because Roll20 exposes no supported writable folder API. |

---

## Phase 1: Finish the `v0.1.4.x` Standalone Line

**Tracking:** [Issue #20](https://github.com/Mord-Eagle/GameAssist/issues/20), [Issue #21](https://github.com/Mord-Eagle/GameAssist/issues/21), [Issue #22](https://github.com/Mord-Eagle/GameAssist/issues/22), [Issue #23](https://github.com/Mord-Eagle/GameAssist/issues/23), and [Issue #24](https://github.com/Mord-Eagle/GameAssist/issues/24)

### Release Contract

Every `v0.1.4.x` production installation continues to use:

- GameAssist as one Roll20 Mod/API script;
- standalone TokenMod for marker mutation used by current dependent modules;
- standalone StatusInfo when the campaign wants condition descriptions and menus.

### Checklist

- [x] Determine the exact `!concentration --status` failure path.
- [x] Correct custom marker display-name versus stored-tag recognition.
- [x] Make CritFumble help/menu output and NPC death-audit reports DM-readable.
- [x] Improve NPC death-history reporting with scoped buckets, handout-backed reports, and curated Arc handouts.
- [x] Add Arc deduplication, deliberate duplicate override, removal controls, and last-addition undo.
- [x] Add selected-only and descendant clearing plus a report writer and date-managed Session rollover.
- [x] Make `!ga-status` easier for DMs to interpret while retaining detailed diagnostics behind `--details`.
- [x] Diagnose built-in `dead` marker mutation failures and remove GameAssist's dependence on TokenMod `players-can-ids` by using `--api-as`.
- [x] Ensure marker-operation failures produce a delayed actionable warning instead of a silent success claim.
- [x] Verify NPCManager marker add, remove, audit, report, and teardown behavior.
- [x] Verify ConcentrationTracker marker add, remove, status, and teardown behavior.
- [x] Verify standalone StatusInfo continues observing relevant marker changes.
- [x] Update README, changelog, and smoke tests with the v0.1.4.7 behavior, supported standalone baselines, and live-test limitations.

### Completion Gate

The final `v0.1.4.x` release must pass its documented Roll20 smoke test with the supported standalone installation before `v0.1.5.0` becomes the production development focus.

### Phase Status

- v0.1.4.3 resolves configured custom marker display names to the exact tags Roll20 stores on tokens.
- v0.1.4.4 separates CritFumble quick reference, guided Natural 1 menu, and direct player picker flows; NPC death audit now reports scope, PC exclusion, and marker mismatches in one grouped GM report.
- v0.1.4.5 advances NPCManager to module version 1.1.0. It records NPC deaths into active Campaign/Chapter/Section/Session buckets, updates one handout per named bucket, moves audit details into `GameAssist NPC Death Audit`, rolls date-managed Sessions forward before activity, adds the `!NPC-WR` report writer, supports selected-only or nested clearing, and maintains deduplicated editable Arc rosters.
- v0.1.4.6 makes the default `!ga-status` response action-oriented for DMs and moves volatile counters, queue timing, timestamps, and internal event-hook counts into `!ga-status --details`.
- v0.1.4.7 uses TokenMod's documented `--api-as` script path, checks requested marker state after dispatch, detects TokenMod through its public contract/version metadata, reports optional StatusInfo evidence in troubleshooting details, and prevents NPCHPRoller token setup from creating false NPC death/revival history.
- Static and simulated checks cover custom markers, counted markers, built-in markers, empty status, invalid-marker diagnostics, and ConcentrationTracker teardown commands.
- Cross-revision simulation also verifies that NPCManager disable/enable preserves saved bucket and Arc records while marker teardown remains active.
- Completion gate passed: v0.1.4.7 NPCManager, ConcentrationTracker, TokenMod, optional StatusInfo, and NPCHPRoller initialization checks completed successfully in the Roll20 API sandbox.
- Follow-up complete: [Issue #32](https://github.com/Mord-Eagle/GameAssist/issues/32) now prefers Roll20's documented `token_markers` property and retains `_token_markers` as a compatibility fallback.
- v0.1.4.7 retains its historical sandbox/UTC date boundary; configurable table time is implemented separately in v0.1.5.1 under [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35).

---

## Phase 2: MarkerService Checkpoint for `v0.1.5.0`

**Tracking:** [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25)

`[GAMEASSIST:CORE:MARKERSERVICE]` becomes shared infrastructure and the single marker authority. It is toggleable so campaigns can keep unrelated GameAssist features while another Mod owns marker behavior. Disabling MarkerService first disables its dependent modules and explains which features are unavailable.

### Intended Internal Contract

The accepted public surface is `GameAssist.MarkerService`:

```js
GameAssist.MarkerService.resolve(markerNameOrTag);
GameAssist.MarkerService.read(token);
GameAssist.MarkerService.inspect(token, markerNameOrTag);
GameAssist.MarkerService.has(token, markerNameOrTag);
GameAssist.MarkerService.add(token, markerNameOrTag);
GameAssist.MarkerService.remove(token, markerNameOrTag);
GameAssist.MarkerService.set(token, markerNameOrTag, enabled);
GameAssist.MarkerService.toggle(token, markerNameOrTag);
GameAssist.MarkerService.observe(handler, { owner: 'ModuleName' });
```

Operations should return useful results or diagnostics rather than assuming success.

### Checklist

- [x] Define MarkerService inputs, outputs, invariants, and failure results.
- [x] Support built-in, legacy, custom, numbered, and duplicate marker forms in the service contract and static regression pass.
- [x] Preserve unrelated markers and number overlays during changes.
- [x] Observe marker changes through one consistent contract.
- [x] Migrate NPCManager, ConcentrationTracker, and DebugTools.
- [x] Remove standalone TokenMod dependency gating from modules that only require marker operations.
- [x] Make MarkerService toggleable and cascade disablement to NPCManager, ConcentrationTracker, and DebugTools while preserving unrelated modules.
- [x] Complete the focused Roll20 sandbox regression pass without standalone TokenMod.
- [x] Update MECHSUITS tree, sections, documentation, changelog, and smoke-test instructions.

### Completion Gate

NPCManager and ConcentrationTracker must perform their marker workflows without standalone TokenMod. MarkerService must demonstrate correct custom-marker behavior and unrelated-marker preservation, and its disable path must turn off dependent modules without making CritFumble, ConfigUI, or NPCHPRoller unavailable.

**Current evidence:** syntax and mocked-ready initialization pass; 23 focused MarkerService checks, 22 mocked marker-consumer workflow checks, 24 service-lifecycle checks, and an 18-check marker-mutation refresh pass. Coverage includes built-in/custom/direct-tag resolution, invalid registry diagnostics, numbered and duplicate markers, unrelated-marker preservation, NPC death/revival history, concentration status/off, DebugTools safeguards, dependent shutdown, opt-out persistence, lifecycle re-enable, and observation delivery. The focused Roll20 checkpoint passed; combined upgrade and release regression now belongs to Issue #28.

---

## Phase 3: ConditionAssist Checkpoint for `v0.1.5.0`

**Tracking:** [Issue #26](https://github.com/Mord-Eagle/GameAssist/issues/26)

Build `ConditionAssist`, preserving selected StatusInfo workflows while routing marker behavior through MarkerService. Its MECHSUITS tag is `[GAMEASSIST:MODULES:CONDITIONASSIST]`.

### Ownership Boundary

- The GameAssist condition-information service owns condition definitions, 2014/2024/campaign wording, selected-token and current-page status menus, `!cond-<condition>` references, announcements, and supported `!condition` compatibility workflows.
- MarkerService owns marker identity, artwork metadata, state, mutation, and observation.
- The condition-information service must not independently parse or mutate markers in ways that compete with MarkerService.

### Checklist

- [x] Add `ConditionAssist` and `[GAMEASSIST:MODULES:CONDITIONASSIST]`.
- [x] Compare StatusInfo 0.3.11 with the published 0.3.12 package and pin the repository snapshot/file blob.
- [x] Record Robin Kuiper attribution, upstream baseline, GameAssist changes, and the MIT notice.
- [x] Define the supported command/configuration compatibility surface.
- [x] Route commands, observations, and lifecycle through GameAssist.
- [x] Route marker behavior through MarkerService.
- [x] Copy valid `state.STATUSINFO` settings and definitions without deleting the legacy branch.
- [x] Validate complete configuration imports before applying them and protect the definition map from generic replacement.
- [x] Detect and warn about accidental standalone StatusInfo installation.
- [x] Default clean campaigns to the complete SRD 5.1 condition catalog and offer SRD 5.2.1 or campaign-custom wording without deleting added definitions or marker choices.
- [x] Add dynamic, case-insensitive, read-only `!cond-<condition>` references for official and campaign-created definitions.
- [x] Add built-in and registered custom marker artwork with readable fallback behavior.
- [x] Add a GM-only selected-character announcement menu with verified marker toggling, character-first is/is-no-longer reporting, `!c-a` and `!cond-!` aliases, public/player-whisper delivery, exact-wording choices, and bounded private-reference buttons.
- [x] Add duplicate-marker assignment warnings.
- [x] Correct selected-token active-condition recognition and add a GM-only current-page condition/other-marker status roster.
- [x] Update documentation, attribution, changelog, upgrade notes, and component smoke tests.

### Completion Gate

Supported `!condition` workflows, `!cond-<condition>` references, selectable condition wording, artwork, and selected-character marker announcements must function through GameAssist and remain synchronized with MarkerService-managed markers without requiring standalone StatusInfo.

**Current evidence:** JavaScript syntax passes, the mocked Roll20 legacy-migration suite passes 35/35 checks, and the clean-install suite passes 58/58 checks. Coverage includes accurate selected-token multi-condition recognition, GM-only current-page condition/other-marker status with a complete handout, documented and compatibility marker-registry lookup, built-in/exact-tag independence from invalid registry data, actionable registry diagnostics, the complete 2014 catalog, 2024 and campaign-custom profile changes, case-insensitive official/custom `!cond-<condition>` references, `!c-a` and `!cond-!` announcement aliases, legacy Concentration-to-Concentrating display repair, built-in/custom artwork and readable fallback, captured selected-character menus, verified mixed-state marker toggling, character-first is/is-no-longer public and controller-whisper reporting, partial and absent controller handling, duplicate-description suppression, bounded private-reference buttons without permission leakage, preservation of added conditions and marker choices, duplicate-marker warnings, schema-v2 export, profile capacity refusal, legacy migration retention, custom and numbered markers, add/remove/toggle, external marker observation, unsafe and protected-config refusal, validated import, MarkerService cascade disable, case-insensitive service restoration, and observer recovery. The focused and complete Roll20 checkpoints passed.

---

## Phase 4: TokenAssist Checkpoint for `v0.1.5.0`

**Tracking:** [Issue #27](https://github.com/Mord-Eagle/GameAssist/issues/27)

Build **TokenAssist** with the supported token-control workflows needed by GameAssist and remove the production requirement for standalone TokenMod. Its MECHSUITS tag is `[GAMEASSIST:MODULES:TOKENASSIST]`.

### Ownership Boundary

- TokenAssist owns `!token-assist` and `!ta`/`!ta-*` parsing and general token operations.
- Older supported `!token-mod` macros continue temporarily through v0.1.x and must be updated before v0.2.0.
- MarkerService owns marker resolution, mutation, and observation semantics.
- Internal GameAssist modules call stable internal services directly rather than generating `!token-mod` chat commands.

### Checklist

- [x] Add `TokenAssist` and `[GAMEASSIST:MODULES:TOKENASSIST]`.
- [x] Pin TokenMod `0.8.88` at Roll20 repository commit `9d634d3149985dcf10333920b3f4c41f215f39fc`, blob `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`.
- [x] Record The Aaron attribution, upstream baseline, adapted portions, compatibility concepts, and MIT notice.
- [x] Define the initial compatibility surface: help/config, selected and authorized-ID targeting, common booleans and token properties, relative values, movement, order, reports, page filters, and MarkerService-backed status commands.
- [x] Document explicit 1.0.1 limits for image-side stacks, default-token writes, computed/name-resolved attributes, advanced controller lists and color arithmetic, relative/random multi-sided-token selection, duplicate-index markers, conditional marker counts, and help-handout rebuilding.
- [x] Add `!token-assist`, `!ta`, and `!ta-*` command forms and retain older supported `!token-mod` syntax as a compatibility alias; any future removal requires a separately announced migration release.
- [x] Normalize aura options, test a visible radius/color/shape combination, and stop movement trails from inheriting stale `lastmove` origins.
- [x] Carry compatible settings forward from earlier v0.1.5.0 development builds before startup auditing.
- [x] Copy a valid legacy `state.TokenMod.playersCanUse_ids` value once while preserving the complete legacy branch.
- [x] Route all status-marker operations through MarkerService.
- [x] Route listeners and lifecycle through GameAssist and declare MarkerService as a lifecycle dependency.
- [x] Provide `GameAssist.TokenAssist.observeTokenChange(...)` as the documented observer replacement without creating a misleading global `TokenMod` object.
- [x] Detect standalone TokenMod, warn the GM, suspend only the deprecated alias so one command cannot be applied twice, and retain the `!token-assist`, `!ta`, and `!ta-*` commands.
- [x] Remove standalone TokenMod from v0.1.5.0 installation instructions.
- [x] Test the implemented command families incrementally in Roll20.

### Completion Gate

The completed `v0.1.5.0` implementation must no longer require standalone TokenMod. TokenAssist commands, temporary support for older macros, and all GameAssist marker consumers must share MarkerService semantics.

**Current evidence:** JavaScript syntax passes. The local TokenAssist regression harness passes 45/45 normal-path assertions and 12/12 standalone-collision assertions. Coverage includes provenance, pre-release and legacy state migration, full/short/case-insensitive commands, deprecation warnings, visible aura storage, hex/RGB/HSV color normalization, stale movement-trail replacement, booleans, quoted text, relative values, built-in/custom/numbered marker operations, safe replacement failure, order, reports, linked bars, player `--ids` authorization, selected-token access, page filters, unsupported-feature refusal before side effects, observers, MarkerService cascade disable/re-enable, and TokenAssist command operation during standalone collision. The focused Roll20 checkpoint passed; combined upgrade, reload, and coexistence regression now belongs to Issue #28.

---

## Phase 5: Integrated Architecture Stabilization and `v0.1.5.0` Release Gate

**Tracking:** [Issue #28](https://github.com/Mord-Eagle/GameAssist/issues/28) and [Issue #29](https://github.com/Mord-Eagle/GameAssist/issues/29)

This phase verifies the complete integration before the first public `v0.1.5.0` release. It is not post-release cleanup.

### Checklist

- [x] Validate an executable upgrade fixture from the final supported `v0.1.4.x` release.
- [x] Validate GameAssist, legacy TokenMod, and legacy StatusInfo state migration behavior.
- [x] Expand verified TokenAssist compatibility-command coverage for the v0.1.5.0 boundary.
- [x] Verify module/service disable, re-enable, dependency cascade, and sandbox reload behavior in isolated harnesses.
- [x] Verify accidental standalone-script warnings.
- [x] Correct active-condition reporting and add current-page condition/other-marker status.
- [x] Keep NPC death audits read-only and add separately confirmed marker repair that preserves HP and history.
- [x] Document known compatibility gaps without overstating support.
- [x] Define a sustainable process for reviewing upstream changes.
- [x] Complete the clean-install and v0.1.4.7-to-v0.1.5.0 live Roll20 release smoke tracks.

### Completion Gate

The integrated architecture is considered stable only when supported workflows have no known silent marker failures, upgrade guidance is tested, and compatibility claims match verified behavior.

**Completed:** the automated suites, full Roll20 smoke pass, attribution audit, documentation audit, artifact-identity check, manifest validation, and review-thread audit all passed. The v0.1.5.0 release candidate is accepted for publication.

---

## Phase 6: DM-Configurable Table Time in `v0.1.5.1`

**Tracking:** [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35)

This focused release gives the DM one campaign timezone for readable GameAssist dates and times. It changes presentation and date-managed Session boundaries while retaining absolute stored event instants.

### Checklist

- [x] Add a validated, persisted IANA timezone setting with a safe sandbox-clock fallback.
- [x] Add a GM-friendly timezone menu with common region buttons, custom input, and clear/reset behavior.
- [x] Show the active timezone, current GameAssist time, and Session date in status and ConfigUI.
- [x] Apply the timezone to logs, status, handout update times, concentration records, NPC history, bucket reports, Arc reports, and configuration output.
- [x] Make date-managed NPC Sessions use the selected timezone and refresh immediately when a timezone change crosses a date boundary.
- [x] Preserve deliberately named Sessions across clock/date changes.
- [x] Preserve absolute ISO event timestamps and dynamically reformat historical entries for the active timezone.
- [x] Add deterministic winter/summer DST, UTC-midnight crossover, invalid-input, malformed-saved-value fallback, reload-persistence, history-preservation, and Session-rollover checks.
- [x] Update README, changelog, smoke tests, manifest, MECHSUITS metadata, and versioned artifacts.
- [x] Complete the focused Roll20 v0.1.5.1 timezone smoke test.

### Completion Gate

Issue #35 is complete when Roll20 accepts a real named timezone, shows the correct current table time and date, retains the setting after a sandbox restart, refuses an invalid name without losing the valid setting, and moves a date-managed NPC Session across the Kiritimati/Honolulu date boundary without changing history.

**Result:** Passed on 2026-07-19 through the focused timezone smoke test. The complete live v0.1.5.1 module suite was not rerun.

---

## Phase 7: Native Initiative Foundation in `v0.1.6.0` and `v0.1.6.1`

**Tracking:** [Issue #47](https://github.com/Mord-Eagle/GameAssist/issues/47)

This major feature release introduces a rules-neutral Turn Tracker authority and a DM-facing initiative module without taking ownership of rounds or combat flow.

### Checklist

- [x] Add toggleable TurnTrackerService 1.0.0 with immutable snapshots, structural classification, revision guards, lossless writes, and observations.
- [x] Add disabled-by-default InitiativeAssist 1.0.0 with a literal, case-insensitive `!Init-` command family, then advance it to 1.0.1 for the private `!Init-GM` page.
- [x] Support mixed D&D 5E by Roll20 2014 and D&D 2024 by Roll20 characters in one tracker.
- [x] Use asynchronous Beacon/Computed access for 2024 initiative and refuse unreadable data rather than silently substituting zero.
- [x] Add direct and varied public initiative invitations with secure player Roll and Roll Options buttons.
- [x] Add a staged roll builder that combines normal/advantage/disadvantage, a bounded flat adjustment, and up to two bounded bonus dice.
- [x] Show Roll20-exposed dice, the final total, and the complete formula, and select optional creative result wording from six score ranges.
- [x] Add `!Init-RR` for every unique PC and living NPC already in the tracker.
- [x] Preserve custom rows, counters, objects, dead NPCs, mismatches, stale/off-page entries, duplicate metadata, text priorities, and unknown fields outside owned reroll slots.
- [x] Add selective PC/NPC/selected/individual/group rerolls, encounter groups, status, a read-only GM chat review, and Manager/Observer modes.
- [x] Complete native pre-tracker population with page-owned rows, a GM PC/NPC roster, and Roll Everyone/Roll All NPCs controls that require no campaign macro.
- [x] Add private-by-default NPC roll evidence, always-private GM-layer NPC rolls, and GM controls for object-layer, GM-layer, or combined living-NPC batches.
- [x] Add `!Init-Roll-Selected` so a GM or player can roll every eligible selected character they control, including characters not yet in Turn Order.
- [x] Add `!Init-GM` by reusing the neutral invitation and complete roster path while whispering every opening panel only to the GM.
- [x] Add initiative/combat-manager overlap diagnostics and document one-writer responsibility.
- [x] Add deterministic local mixed-sheet, permission, preservation, malformed-data, async-conflict, lifecycle, and audit checks.
- [x] Complete the dedicated Roll20 clean-install and upgrade acceptance tracks.
- [x] Resolve review findings, verify release artifacts, and close Issue #47.

### Completion Gate

Issue #47 is complete only when the Roll20 sandbox confirms mixed 2014/2024 initiative, public and GM-only start controls, private NPC evidence, GM-layer and selected-character batches, case-insensitive commands, exact preservation of non-owned rows, duplicate handling, dead/mismatch skips, Observer mode, service cascading, and audit output without regressions in established modules.

**Current evidence:** The live workflow, including private NPC evidence, GM-layer batches, selected-character batches, and equal private `!Init-GM` / `!Init-DM` start pages, is accepted. The InitiativeAssist 1.0.4 behavioral harness passed 116/116 checks; 1.0.5 added the equivalent full-name route, and 1.0.6 repairs the mixed-sheet actor contract returned to roster classification.

---

## Phase 8: WelcomeAssist in `v0.1.6.1`

This patch adds an optional table greeting without changing normal startup output for existing campaigns.

### Checklist

- [x] Add disabled-by-default WelcomeAssist 0.1.0 beneath the MODULES wrapper.
- [x] Add professional, built-in-library, campaign-custom, and double-weighted mixed modes.
- [x] Keep help, settings, status, and previews GM-only; require explicit announce or a later healthy reload for public output.
- [x] Bound delay, readiness polling, header length, greeting length, custom count, and custom mutation syntax through POLICY.
- [x] Escape HTML and neutralize Roll20 inline-roll, attribute, ability, and query syntax at output.
- [x] Add one guarded post-bootstrap completion signal after all configured component initialization attempts.
- [x] Add deterministic disabled, delayed, one-per-sandbox, cancellation, custom-bound, safety, and unhealthy-startup checks.
- [x] Pass the module-specific Roll20 acceptance section.

### Completion Gate

WelcomeAssist is accepted when disabled campaigns remain silent, setup and previews remain private, a healthy reload produces exactly one delayed greeting, manual announce cancels pending automatic output, malformed or duplicate custom entries are refused, and custom text cannot execute Roll20 chat directives.

---

## Phase 9: CombatAssist Foundation in `v0.1.7.0`

**Tracking:** [Issue #48](https://github.com/Mord-Eagle/GameAssist/issues/48)

CombatAssist 1.0.5 begins disabled, requires explicit GM intent, and treats Roll20's native Turn Tracker as authoritative while using TurnTrackerService for guarded reads, writes, and observations. Native round-counter authority, stale-safe turn timers, private-safe native pings, and equal GM/DM control aliases passed the complete Roll20 acceptance check.

### Checklist

- [x] Add case-insensitive `!Combat-` Guide, Control Center, status, start, pause, resume, end, next-turn, previous-turn, and announcement controls.
- [x] Require a readable open tracker on one page with bounded, distinct, structurally valid rows.
- [x] Accept exact one-row forward and backward rotations for turn counting.
- [x] Preserve the current round when valid combatants are added or removed, initiative is rerolled, priorities change, or the native tracker is manually reordered; establish a fresh full-cycle anchor without rewriting the edit.
- [x] Advance the round only after an uninterrupted forward cycle returns to the recorded anchor.
- [x] Prefer one clearly named native custom round counter as the round authority and evaluate its simple signed whole-number calculation when CombatAssist moves it to the top.
- [x] Refuse multiple plausible round counters instead of guessing.
- [x] Ensure backward movement never advances a round.
- [x] Route explicit GM **Next Turn** and **Previous Turn** actions through revision-guarded TurnTrackerService rotations.
- [x] Preserve every row, custom entry, priority, object, and unknown field.
- [x] Keep pause/edit/resume as an optional quiet-edit workflow rather than a requirement for ordinary tracker maintenance.
- [x] Retain the current accepted native tracker plus one complete previous checkpoint, with revision-matched preview/confirmation for restore or undo.
- [x] Reserve attention for unreadable, off-page, closed, malformed, stale, duplicate, or direction-ambiguous tracker states and provide explicit adopt, restore, status, and round-1 restart choices.
- [x] Keep setup, status, confirmation, and attention messages GM-only; make turn announcements configurable as GM-only, public, current-player whispers, or off.
- [x] In Whispers mode, send the GM private Next Turn, Previous Turn, and Open Menu controls while sending the current controlling player a token-bound End My Turn control.
- [x] Recheck current-turn identity and character control when a player uses End My Turn; privately confirm a successful advance and gently acknowledge an already-advanced stale button without moving the tracker again.
- [x] Offer Standard and Varied player completion confirmations through an explicit setting; Varied includes the Standard sentence exactly once within a warmer rotation.
- [x] Report a visible linked next character neutrally without implying player control; use a generic continuation for GM-layer, custom, unlinked, or non-character rows.
- [x] Deliver an outgoing player's Turn Complete confirmation before the next Your Turn prompt when one player controls consecutive characters.
- [x] Replace long InitiativeAssist, CombatAssist, and WelcomeAssist root guides with compact action/navigation panels and focused topic pages.
- [x] Add CombatAssist Status, Guide/Help, GM/Menu, Info, and read-only Audit aliases as the reference navigation implementation.
- [x] Put the complete CombatAssist user manual in one stable on-demand handout and keep only common actions in the root chat guide.
- [x] Add disabled-by-default configurable turn timers, deadline recipients, and up to five per-recipient reminders whose callbacks expire after any relevant encounter or tracker change and never advance initiative.
- [x] Add disabled-by-default non-centering native current-turn pings with GM, player, combined, and public audiences plus mandatory GM-only handling for hidden turns.
- [x] Make short `!Welcome` and `!Welcome-Action` commands primary while retaining the longer WelcomeAssist compatibility surface.
- [x] Give unrecognized WelcomeAssist commands the same clear Open Guide recovery pattern already used by CombatAssist and InitiativeAssist.
- [x] Keep baseline module operation independent: CombatAssist requires TurnTrackerService, no other baseline module requires CombatAssist, and any optional future integration must label and locally enforce its own prerequisite.
- [x] Keep automatic turn advancement, condition/marker mutation, music, and NPC-history behavior out of CombatAssist's baseline; timers and pings report or point only.
- [x] Add focused deterministic coverage and public documentation.
- [x] Pass the complete Roll20 CombatAssist smoke test.
- [x] Resolve review findings and verify identical release artifacts; Issue #48 closes with PR #51.

### Completion Gate

Issue #48 is complete when Roll20 confirms explicit lifecycle controls, native round-counter `+1`, fallback forward rounds, backward safety, preserved-round additions/removals/rerolls/reordering, one-step recovery, optional pause/edit/resume, exact tracker-field preservation, unreadable-state attention, two-row behavior, stale-safe timers, ping audiences and hidden-turn privacy, GM/current-player controls, A-B-A delivery, privacy-safe confirmations, manual handout creation/update, common navigation aliases, compact guide routing, independent disable behavior, reload behavior, and no regressions in InitiativeAssist or established modules.

**Current evidence:** The complete Roll20 smoke test, deterministic coverage, artifact identity check, review closure, and merge completed. Coverage confirms native round-counter calculations, stale timer invalidation, teardown cleanup, timer and ping privacy, preserved-round roster changes, InitiativeAssist rerolls, one-step restore, ordered player confirmations, navigation aliases, compact guidance, and stable module manuals.

---

## Phase 10: Immediate CombatAssist Expansion

The timer and native-ping implementations completed in v0.1.7.0. The v2.0.0 branch later added the bounded timeline, Ready/Delay records, and optional NPCAssist handoff. Music remains separate because it needs its own ownership and coexistence contract.

1. [Issue #54](https://github.com/Mord-Eagle/GameAssist/issues/54) - **complete** configurable turn timers and reminders, including live stale-callback and recipient acceptance.
2. [Issue #55](https://github.com/Mord-Eagle/GameAssist/issues/55) - **complete** native current-turn pings, including live audience and hidden-layer acceptance; persistent token highlights remain separately deferred.
3. [Issue #56](https://github.com/Mord-Eagle/GameAssist/issues/56) - **implemented; sandbox verification** optional deduplicated encounter-summary handoff to NPCAssist without synthetic death or revival history.
4. [Issue #57](https://github.com/Mord-Eagle/GameAssist/issues/57) - **deferred** opt-in combat music hooks that preserve unrelated Jukebox playback.

Damage review (#52) and held-action rules (#53) are implemented on PR #81 with bounded evidence, explicit opt-in controls, and no automatic game-mechanic resolution.

---

## Post-v0.1.5.0 TokenAssist Expansion

These items extended TokenAssist beyond the accepted integrated architecture. The first three are implemented on PR #81; persistent image/default-token writes remain separate because of their larger and less reversible scope.

- [Issue #42](https://github.com/Mord-Eagle/GameAssist/issues/42) — **implemented; expanded verification pending** advanced duplicate-index, conditional, relative-count, and bounded marker expressions owned by MarkerService.
- [Issue #43](https://github.com/Mord-Eagle/GameAssist/issues/43) — **implemented; expanded verification pending** exact saved/computed reporting, controller identity/list resolution, and privacy-aware report routing.
- [Issue #44](https://github.com/Mord-Eagle/GameAssist/issues/44) — **implemented; expanded verification pending** selected-token color arithmetic, dimming controls, and relative/random multi-sided-token selection.
- [Issue #45](https://github.com/Mord-Eagle/GameAssist/issues/45) — **deferred** image-side stacks plus token-image and default-token asset updates, pending dedicated preview, recovery, and live-field compatibility safeguards.

TokenAssist will continue to use its own help and `GameAssist.TokenAssist` API. Rebuilding TokenMod's help handout or creating a global `TokenMod` compatibility object is not planned.

## Phase 11: Canonical Module Identities in `v1.8.0`

**Tracking:** [Issue #60](https://github.com/Mord-Eagle/GameAssist/issues/60), [PR #63](https://github.com/Mord-Eagle/GameAssist/pull/63)

This release adopts CritAssist, NPCAssist, ConcentrationAssist, and HPAssist as the canonical runtime, state, MECHSUITS, configuration, diagnostic, and documentation identities. HP rolling remains a separate module because its deliberate and automatic formula rolls have a narrower lifecycle than NPCAssist's history, markers, reports, and future NPC-state features.

### Checklist

- [x] Adopt three-part project release numbering as `v1.8.0` without rewriting historical release identifiers or independent module versions.
- [x] Rename registration, handler ownership, dependencies, state branches, public labels, MECHSUITS tags, and canonical-tree entries.
- [x] Migrate valid old state destination-first and remove the migrated source branch; retain malformed or unknown branches for warning-only diagnosis.
- [x] Preserve every established command as a compatibility alias and add canonical command families.
- [x] Preserve NPCAssist history, bucket, Arc, marker, and public API compatibility.
- [x] Adopt and rename one unambiguous old guide handout rather than creating a duplicate.
- [x] Pass syntax and the complete local regression suite.
- [x] Pass the focused clean-install and v0.1.7.0 upgrade smoke tracks in Roll20.
- [x] Complete PR #63 and close Issue #60.

### Completion Gate

The Roll20 module list uses only the four canonical names; valid settings and records survive upgrade; old and new command forms each dispatch once; old guide handouts are adopted without duplication; malformed legacy data remains diagnosable; and unrelated modules retain their accepted behavior.

---

## Phase 12: Focused NPCAssist Patches in `v1.8.1` and `v1.8.2`

### v1.8.1 — Bloodied Alerts

[Issue #64](https://github.com/Mord-Eagle/GameAssist/issues/64) was completed through [PR #73](https://github.com/Mord-Eagle/GameAssist/pull/73). It adds a GM-private notice only when an eligible NPC crosses from above half of a valid positive maximum HP to half or below while remaining alive, plus a one-click Control Center toggle. It reuses HP-initialization protection and does not write Bloodied events into death-history buckets.

### v1.8.2 — Progressive NPC Naming

[Issue #65](https://github.com/Mord-Eagle/GameAssist/issues/65) was completed through [PR #74](https://github.com/Mord-Eagle/GameAssist/pull/74). It assigns names from the live tokens on the newly added token's page. Existing tokens are never renamed. The default is enabled, the GM may disable it, and deliberate manual duplicates remain allowed. Number selection uses the lowest available positive suffix, so a deleted gap may be reused; no persistent campaign counter is required.

---

## Phase 13: EffectAssist 2014-Sheet Program in `v2.0.0`

[Issue #61](https://github.com/Mord-Eagle/GameAssist/issues/61) is the master specification. The v2.0.0 launch combines the semantic engine, the verified official 2014-sheet adapter, concentration coordination, a focused six-effect catalog with player casting and GM lockout, bounded official 2014 Bless proposals, shared-health offers, and conservative duration review. Recognition, HP, duration, weapon-specific damage, and 2024-sheet work retain separate evidence gates even when implemented on the same PR #81 development line.

EffectAssist remains a gameplay module. MarkerService owns markers, ConditionAssist owns condition definitions and condition-marker workflows, character sheets own their native roll fields, ConcentrationAssist owns concentration checks, HP-writing modules own HP mutations, and TurnTrackerService owns native tracker access.

### Launch Engine and Catalog — v2.0.0

**Tracking:** [Issue #75](https://github.com/Mord-Eagle/GameAssist/issues/75)
**Status:** Sandbox verification

- [x] Add source-aware effect definitions and active instances.
- [x] Keep source character/token identity separate from every target identity.
- [x] Add idempotent application and idempotent ending.
- [x] Add shared multi-projection ownership with baseline preservation.
- [x] Support MarkerService, ConditionAssist, concentration, 2014-sheet, and record-only projections.
- [x] Add Bless, Guidance, Warding Bond, Holy Weapon, Haste, and Pass Without a Trace, separated by automation level.
- [x] Remove Gift of Alacrity, Longstrider, and Beacon of Hope from the built-in launch catalog because their marker-only paths do not provide enough automation; retain generic tracking paths.
- [x] Move ownership-safe weapon, Stealth, initiative, movement-speed, and healing adapter research to [Issue #82](https://github.com/Mord-Eagle/GameAssist/issues/82) so it does not block the focused release.
- [x] Add player casting from controlled sources, direct spell shortcuts, and GM lockout.
- [x] Show automatic, assisted, and informational behavior before application.
- [x] Add bounded ended history and preserve runtime records across module disable/re-enable.
- [x] Add read-only audit and short-lived, GM-bound, one-use repair authorization.
- [x] Refuse partial target application and token-representation drift.
- [x] Add the immutable in-memory SemanticEvents core service.
- [x] Update executable, README, changelog, roadmap, One-Click metadata, and smoke tests.
- [x] Pass 134 focused local EffectAssist checks plus syntax validation in both existing-marker and fresh-marker campaign fixtures.
- [ ] Pass the clean-install and v1.8.2 upgrade smoke tracks in Roll20.
- [ ] Complete the v2.0.0 PR and close Issues #75, #76, and #78.

### Official 2014 Sheet Projection

**Tracking:** [Issue #76](https://github.com/Mord-Eagle/GameAssist/issues/76)
**Status:** Sandbox verification

- [x] Add exact repeating global attack, saving-throw, skill, and AC modifier-row adapters.
- [x] Record exact created attribute IDs, expected values, and baseline ownership.
- [x] Use sheet workers when available and avoid generated aggregate outputs.
- [x] Add complete Bless attack/save rows, Guidance skill rows, Warding Bond AC/save rows, and Haste AC rows.
- [x] Preserve pre-existing and externally edited rows.
- [x] Retain marker plus assisted behavior for NPCs and unsupported sheets.
- [ ] Pass the live 2014-sheet application, overlap, cleanup, edit-preservation, and restart checks.

### Phase C — Cast Recognition

**Tracking:** [Issue #77](https://github.com/Mord-Eagle/GameAssist/issues/77)
**Status:** Sandbox verification

EffectAssist 2.3.0 recognizes only well-evidenced official 2014 Bless spell output and offers a private GM-confirmed proposal. Chat target text is descriptive and is never treated as token identity. The proposal remains sandbox-local, bounded, deduplicated, short-lived, and single-use; selecting recipients and passing through the existing preview and confirmation path remain mandatory.

- [x] Require the exact official 2014 `spell` template and normalized Bless name.
- [x] Require one exact character-name match and one eligible linked source token on the actor's active page.
- [x] Recheck non-GM source control and Objects-layer visibility before offering the proposal.
- [x] Keep unsupported spells and ambiguous evidence non-mutating while giving the GM an actionable path when a supported Bless card is ambiguous.
- [x] Suppress repeated delivery of identical cast evidence and consume a reviewed proposal only once.
- [x] Require GM-selected recipients and reuse the existing EffectAssist review, grant, application, concentration, projection, and announcement path.
- [x] Keep `!effect` and the complete manual catalog prominent and available when recognition is disabled.
- [x] Add private Pending Casts, Status, Control Center, Manual, API, policy, documentation, and focused local-test surfaces.
- [ ] Pass the live Roll20 supported-card, duplicate, ambiguity, recipient-selection, disable/re-enable, and ordinary-catalog checks.

Capture real 2024 template samples before defining a 2024 recognition contract; 2024 effect recognition remains outside this phase.

### Player Casting and GM Requests

**Tracking:** [Issue #88](https://github.com/Mord-Eagle/GameAssist/issues/88)
**Status:** Sandbox verification

EffectAssist 2.3.0 keeps player casting compact without weakening the established source-control, review, confirmation, or privacy boundaries. Generated player buttons carry short-lived opaque choices rather than raw token or character identifiers. Visible linked recipients use Roll20's native target picker; hidden or off-page cases can be retained privately for the GM to finish through the same preview and confirmation path.

- [x] Bind each player casting choice to its player, source, effect, workflow stage, and expiry.
- [x] Revalidate source identity, control, page, layer, module state, and player-casting permission before each step.
- [x] Replace silent stale, reused, fabricated, or wrong-player button failures with a visible **Start Again** route.
- [x] Let players target visible linked recipients through Roll20's native target query without requiring control of the recipient.
- [x] Add bounded, expiring GM requests with `!Effect-Requests`, generated apply controls, and explicit dismissal.
- [x] Keep invalidated requests visible as needing attention until the GM dismisses them or they expire.
- [x] Add direct built-in effect buttons and a request count to the GM Control Center.
- [x] Omit hidden target names from public announcements.
- [x] Pass 34 focused player-flow, privacy, revalidation, request, and recovery checks plus the established EffectAssist regression harnesses.
- [ ] Pass the live Roll20 separate-player source, visible non-controlled recipient, retained request, hidden-recipient privacy, later-lock, stale-button, and direct-GM-control checks.

### Concentration Coordination

**Tracking:** [Issue #78](https://github.com/Mord-Eagle/GameAssist/issues/78)
**Status:** Sandbox verification

- [x] Add the ConcentrationAssist 0.3.0 public lifecycle API.
- [x] Publish concentration-established, failed, and ended events.
- [x] Establish source concentration for catalog effects that require it.
- [x] End dependent effects when source concentration ends.
- [x] Refuse or deliberately replace an existing concentration effect.
- [x] Keep both modules out of each other's persistent state.
- [ ] Pass manual-clear, failed-check, replacement, GM-layer source, and restart checks in Roll20.

### Phase E1 — Shared HealthService Foundation

**Tracking:** [Issue #83](https://github.com/Mord-Eagle/GameAssist/issues/83)
**Status:** Sandbox verification

- [x] Add canonical snapshots for official 2014 PC `hp` attributes and linked NPC token bar 1.
- [x] Publish immutable `health.transition` evidence through SemanticEvents.
- [x] Deduplicate matching linked character-attribute and token-bar notifications.
- [x] Keep unexplained increases and decreases classified as `unknown`.
- [x] Add bounded producer/operation-identified writes with verification and idempotency.
- [x] Route HPAssist HP initialization and supported RestAlmanac HP restoration through the shared write contract while preserving their independent fallback behavior.
- [x] Add compact GM-only service status, recent-evidence, and current-page audit diagnostics.
- [x] Pass the focused local HealthService harness and JavaScript syntax validation.
- [ ] Pass the focused live Roll20 observation, write, deduplication, disable/re-enable, and restart checks.

### Phase E2 — HP-Loss Offers

**Tracking:** [Issue #79](https://github.com/Mord-Eagle/GameAssist/issues/79)
**Status:** Sandbox verification

ConcentrationAssist consumes HealthService evidence conservatively while preserving its independent manual workflow. A declared and verified GameAssist damage write carries stronger provenance; an unexplained numeric decrease remains an unknown observation and is presented only as observed HP loss.

- [x] Advance ConcentrationAssist to 0.5.0 with `healthPrompts=true`, a portable built-in `stopwatch` default for fresh campaigns, narrow migration of the unavailable former stock value, and GM-facing health and marker controls.
- [x] Offer Normal, Advantage, and Disadvantage checks only for an already-concentrating supported character after verified damage or an unexplained numeric decrease.
- [x] Deduplicate linked sheet/token evidence into one logical offer while whispering that offer separately to the GM and eligible current controllers.
- [x] Keep GM-layer and player-hidden identities GM-only and suppress public emotes for hidden offered checks.
- [x] Recheck the exact latest HealthService event, current HP, concentration marker, token identity, player-page visibility, and current controller before rolling.
- [x] Keep healing, initialization, synchronization, clearing, invalid values, unrelated changes, and non-concentrating characters silent.
- [x] Route applied DebugTools damage through verified HealthService evidence on supported HP surfaces while retaining its dry-run default and direct unsupported/disabled-service fallback.
- [x] Keep generated offers bounded, single-use, and sandbox-local; a HealthService outage disables only this integration.
- [x] Preserve `!concentration`, `!cc`, `--damage`, `--last`, marker controls, status, audit, and lifecycle events.
- [x] Pass the focused local privacy, deduplication, stale-button, classification, hidden-token, and manual-path harness.
- [ ] Pass the live Roll20 checks with direct HP edits, a verified GameAssist write, a linked PC, a linked NPC, a GM-layer NPC, HealthService disabled, and the module setting disabled.

### Phase F — Encounter and World-Time Durations

**Tracking:** [Issue #80](https://github.com/Mord-Eagle/GameAssist/issues/80)
**Status:** Sandbox verification

EffectAssist records formal duration rules and whichever verified provider anchors are available when a built-in effect begins. CombatAssist 1.2.1 retains the immutable encounter identity and accepted forward/backward transition evidence introduced in 1.1.0; AlmanacAssist continues to publish one committed event for each world-time change.

- [x] Record ten-round/one-minute rules for Bless, Guidance, and Haste plus six-hundred-round/sixty-minute rules for Warding Bond, Holy Weapon, and Pass Without a Trace.
- [x] Anchor encounter durations only to an active CombatAssist encounter on the effect source's page.
- [x] Anchor world durations only to available committed Almanac time.
- [x] Create one bounded private GM expiration candidate when either verified boundary is reached; never end the effect automatically.
- [x] Create an encounter-end reminder when a round boundary was not verified before CombatAssist ended.
- [x] Ignore backward turns, tracker rebases, initiative edits, and backward Almanac movement as duration progress.
- [x] Compare large Almanac jumps once without replaying every elapsed minute.
- [x] Let the GM end the effect, keep it active, or reopen a dismissed candidate from `!Effect-Duration`.
- [x] Preserve manual ending and explain provider absence, disabled candidate processing, custom duration text, and pre-schema-3 effects without inventing start times.
- [x] Reconcile persisted anchors after startup and when the GM opens Duration Review following re-enable, without unbounded event replay.
- [x] Pass the focused local provider, boundary, reversal, restart, spoofing, and non-automatic-ending harness plus existing HealthService and ConcentrationAssist regressions.
- [ ] Pass the live Roll20 same-page encounter, tracker edit, backward turn, encounter end, Almanac advance/retreat, provider-disabled, restart, and manual-decision checks.

### Completion Gate

The EffectAssist portion of v2.0.0 must survive the live Roll20 clean-install, upgrade, complete Bless, catalog coverage, 2014-sheet rows, concentration cleanup, overlap, baseline-state, audit/repair, cast-recognition, player-casting and retained-request, duration-provider, disable/re-enable, and restart tests. ConcentrationAssist HP-loss offers require their separate live Issue #79 acceptance. The 2024-sheet contract remains later work; Issue #88 is implemented at the sandbox checkpoint and remains open until its separate-player Roll20 acceptance passes.

---

## Phase 14: Complete AlmanacAssist Program in `v2.0.0`

[Issue #95](https://github.com/Mord-Eagle/GameAssist/issues/95) is the consolidated specification for one GameAssist campaign-world module with six independently toggleable systems, one coherent scene contract, and separate live-play and worldbuilding surfaces. Every part remains on PR #81's single v2.0.0 development line. Earlier Almanac issues remain historical design and defect evidence; Issue #95 owns implementation and final acceptance rather than creating partial releases.

1. [#66 TimeAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/66).
2. [#67 ClimateAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/67).
3. [#68 AstronomyAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/68).
4. [#69 WeatherAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/69).
5. [#70 EnviroAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/70).
6. [#71 RestAlmanac](https://github.com/Mord-Eagle/GameAssist/issues/71).

Each phase must provide useful standalone behavior with explicit optional integrations. Fictional world time remains separate from GameAssist's real-world table timezone and NPCAssist's real-world Session dates.

### Implemented Scope

- [x] Register AlmanacAssist as one disabled-by-default feature module with independent Time, Climate, Astronomy, Weather, Environment, and Rest switches.
- [x] Implement TimeAlmanac with one elapsed-minute authority, Standard/Solamnic/Harptos/Wayfarer profiles, bounded history, guarded reversal/exact setting, player read-only output, Wayfarer holidays, and Wayfarer's ordinal 20-hour daily language without AM/PM.
- [x] Rebuild Wayfarer as a persistent-draft workflow with direct component editors, retained guided review, readable preview, built-in profile duplication, editable seasonal ranges, visible moon phases, atomic activation, elapsed-time preservation, command-only draft recovery, and one rollback point.
- [x] Implement ClimateAlmanac with editable built-ins, bounded custom profiles, regions, true parent inheritance, overrides, direct active-region selection, a compact at-a-glance screen, and manual season fallback.
- [x] Add paginated reusable palettes with 17 climates, 16 biomes, 12 geographies, 12 ecoregion profiles, and seven seasonal responses; preserve editable copies and separate profiles from named regions, subregions, areas, and locations.
- [x] Use the active place, named calendar season, elevation, coast, biome wetness, and local adjustments for weather; retain explicit overrides and resolve forecast seasons on their future dates.
- [x] Implement AstronomyAlmanac with configurable moon cycles/offsets/phases, deterministic daylight and season boundaries, bounded forecasts, and separately weighted rare-event suggestions.
- [x] Implement WeatherAlmanac with structured continuity-aware generation, optional context, standalone fallback, read-only forecasts, explicit manual state, lock/unlock, history, and events.
- [x] Implement EnviroAlmanac with structured weather-derived context, quick standalone presets, focused one-field customization, on-demand technical details, bounded custom override, explicit return to weather-derived context, and no automatic gameplay penalties.
- [x] Implement RestAlmanac for linked controlled 2014 PCs with preview, expiring one-use confirmation, complete revalidation, verified HP/Hit Dice/slot writes, optional Time advancement, rollback, history, and custom rests.
- [x] Add shared navigation, a stable manual, configurable announcement audiences/headings/presets/fields, focused read-only audits, bounded policy, protected structured configuration, defensive public context APIs, and semantic events.
- [x] Pass the grouped 18-run local regression sweep, including the 493 focused Almanac/matrix/location/Wayfarer/repair checks, cross-module interactions, fresh-marker EffectAssist coverage, syntax parsing, and the 33-section MECHSUITS structural validator. These remain non-live evidence.
- [x] Record owner-reported live Almanac use on 2026-08-27, without treating it as a completed case-by-case acceptance inventory.
- [x] Confirm all three v2.0.0 release scripts are byte-identical to the locally verified build.
- [x] Designate AlmanacAssist 2.0.6 as Alpha Testing in the README, roadmap, and smoke guide.
- [ ] Complete and record expanded live clean-install and v1.8.2-to-v2.0.0 upgrade coverage before graduating AlmanacAssist from alpha.
- [x] Prepare the ASCII-only v2.0.0 One-Click listing with AlmanacAssist's Alpha Testing notice and selected legacy-version entries.
- [x] Verify the local submission overlay: schema-valid metadata, matching current scripts, exact copies of the four selected legacy builds, and retained published version folders.
- [ ] Preview the description and installation behavior through Roll20's One-Click path; local Markdown and schema checks do not establish live rendering.

### Release Gate

AlmanacAssist may be included in GameAssist v2.0.0 as an explicitly labeled, optional **Alpha Testing** module. Its complete expanded smoke track remains the graduation target, not a requirement to claim every alpha workflow fully accepted before inclusion. The alpha baseline covers startup, basic navigation, current settings, generation, persistence, and the safety of enabled integrations; RestAlmanac sheet writes must be checked with disposable characters when enabled. A confirmed sandbox crash, privacy leak, data loss, or unsafe write remains a release blocker. Other modules retain their own release checks, and PR review plus final package verification remain separate publishing steps.

---

## Phase 15: HealAssist Guided Healing in `v2.0.0`

**Tracking:** [Issue #84](https://github.com/Mord-Eagle/GameAssist/issues/84), [PR #81](https://github.com/Mord-Eagle/GameAssist/pull/81)

HealAssist is a disabled-by-default HealthService consumer for deliberate official-2014 healing. It improves the path from choosing a healing action to applying HP without becoming a spell-slot manager, inventory engine, arbitrary spell-card interpreter, damage-reversal tool, or second HP observer.

### Implemented Scope

- [x] Register HealAssist as an independently toggleable module that requires HealthService and leaves unrelated modules independent.
- [x] Support guided Cure Wounds, Healing Word, Prayer of Healing, Mass Healing Word, Mass Cure Wounds, Heal, four 2014 potion grades, and bounded simple manual formulas.
- [x] Require an authorized linked official-2014 source and read only the explicitly chosen Intelligence, Wisdom, or Charisma modifier when the action needs one.
- [x] Use short-lived player-bound source choices and Roll20's native targeting for visible supported PCs, including PCs the healer's player does not control.
- [x] Send exactly-one-recipient actions directly to the native target prompt while retaining recipient-count choices for genuinely multi-recipient actions.
- [x] Retain NPC, GM-layer, hidden, and off-page placement requests for private GM review without exposing NPC identity or HP.
- [x] Apply verified healing automatically by default for new configurations. Optional review presents raw dice, formula, current HP, proposed HP, maximum HP, actual gain, and manual resource responsibility before the write. Preserve saved GM choices.
- [x] Cap healing at maximum HP, preserve an already-over-maximum value, and refuse unsupported or stale HP evidence.
- [x] Use one expiring, one-use proposal in both application modes and revalidate actor, source, recipient, control, page, layer, representation, HP, maximum HP, module state, and HealthService before writing. Require a confirmation click only when review is enabled.
- [x] Route every accepted write through HealthService with HealAssist producer/operation identity and verified `healing` provenance.
- [x] Treat multi-recipient healing as one transaction in both modes and attempt verified synchronization rollback when a later recipient write fails.
- [x] Add player lockout, safe public/private result policy, retained-request controls, standard GM/DM, Guide/Help, Info, Status, Audit, Manual, and compatibility command surfaces.
- [x] Add documentation, configuration and public API references, One-Click metadata, focused smoke tests, and a 96-check local regression harness covering the automatic default, saved modes, restart, permissions, optional review, and failed-write recovery.
- [ ] Pass the live Roll20 player-to-visible-PC workflow with a separate non-GM account.
- [ ] Pass NPC and GM-layer request privacy, stale and reused confirmation, maximum-HP cap, multi-recipient, player lockout, HealthService cascade, and sandbox-restart checks.

### Completion Gate

Issue #84 remains at **Sandbox verification** until the complete focused HealAssist track passes in Roll20. No v2.0.0 release is approved from the local harness alone. Spell/item/resource consumption, temporary HP, arbitrary spell cards, 2024-sheet fields, and damage reversal remain outside the launch contract.

---

## Phase 16: AttackAssist Guided Attacks in `v2.0.0`

**Tracking:** [Issue #87](https://github.com/Mord-Eagle/GameAssist/issues/87), [PR #81](https://github.com/Mord-Eagle/GameAssist/pull/81)

AttackAssist is a disabled-by-default guide for official D&D 5E by Roll20 2014 PC repeating attacks. It shortens source, attack, and target selection, submits immediately with the sheet setting by default, and leaves optional roll-mode review under GM control while the character sheet, damage, resources, HP, effects, conditions, initiative, and turn flow remain under their established owners.

### Implemented Scope

- [x] Register AttackAssist as an independently toggleable module with optional player access and no required feature-module dependency.
- [x] Require a linked authorized official-2014 PC source and refuse unsupported, 2024, NPC, unlinked, hidden, off-page, or uncontrolled player sources with actionable guidance.
- [x] Read verified repeating attacks in saved sheet order and preserve exact stable row identity when display names are duplicated.
- [x] Put Roll20's native visible-target choice directly beside each verified attack, without requiring target control or an inert intermediate target screen.
- [x] Retain player requests for hidden, GM-layer, or off-page placement as private GM work without exposing the target identity to the player.
- [x] Submit with the saved sheet roll mode by default and offer an optional GM-enabled review with Sheet, Normal, Advantage, and Disadvantage choices without temporarily changing the character's `rtype` setting.
- [x] Qualify the verified sheet-generated roll formula to the exact character and repeating row, then submit it as the acting character so the familiar template and CritAssist natural-1 path remain intact.
- [x] Bind flows, requests, and submissions to the initiating player, expire them after ten minutes, consume submissions before rolling, and refuse stale, reused, changed-row, or cross-player buttons.
- [x] Announce the attacker and visible target only after the roll callback; keep hidden-target completion private.
- [x] Leave target HP, markers, effects, conditions, resources, position, Turn Tracker state, and campaign data unchanged.
- [x] Add standard GM/DM, Guide/Help, Info, Status, Audit, Manual, Requests, player-lockout, and full module-name command surfaces.
- [x] Add documentation, configuration and observational public API references, One-Click metadata, focused smoke tests, and local coverage for direct targeting, optional-sheet defaults, unknown-field refusal, and one-use submission.
- [ ] Pass the live Roll20 visible-target workflow with a separate non-GM account and an official-2014 PC containing duplicate display-name attacks.
- [ ] Pass sheet/Normal/Advantage/Disadvantage modes, natural-1 single delivery to CritAssist, stale/reused/cross-player refusal, private hidden-target request, player lockout, disable/re-enable, and sandbox-restart checks.

### Completion Gate

Issue #87 remains at **Sandbox verification** until the complete focused AttackAssist track passes in Roll20. No v2.0.0 release is approved from the local harness alone. Automatic damage, resource spending, 2024-sheet attacks, NPC action formulas, and arbitrary roll-card interpretation remain outside the launch contract.

---

## Phase 17: Continue The `v2.0.0` Issue Queue In PR #81

PR #81 remains the only v2.0.0 development line. These issues are taken one at a time in dependency-aware order and do not create intermediate public releases:

1. **Issue #95 - AlmanacAssist 2.0.6 Alpha Testing:** include the optional module in v2.0.0 with its alpha baseline and clear labeling. Continue expanded live coverage for Session Mode, Worldbuilding Mode, coherent scenes, Year 0, travel, local time, phenomena, Wayfarer handout editing, WorldPacks, all six subsystem boundaries, rest writes, restart preservation, and UI readability before graduating it from alpha.
2. **Issue #86 — GM-private PC health alerts:** implemented at sandbox verification; complete the live privacy, crossing, rearm, and service-disable track before closing.
3. **Issue #84 — HealAssist:** implemented at sandbox verification; complete the live player, NPC privacy, stale-confirmation, multi-recipient, and HealthService lifecycle track before closing.
4. **Issue #87 — AttackAssist:** AttackAssist 1.1.0 is implemented at sandbox verification with compact direct attack-row target choices, immediate sheet-setting submission, optional GM-enabled roll-mode review, complete prompt-safe Classic-sheet expansion, documented defaults, visible native sheet cards, and preflight refusal for unresolved prompts, incomplete fields, or unsafe final dice expressions; complete the live source, duplicate-row, target, roll-mode, natural-1, privacy, stale-button, Companion coexistence, and lifecycle track before closing.
5. **Issue #85 — Guidance consumption:** EffectAssist 2.5.4 retains the guarded candidate using an exact compact owned roll label, current projection ownership, controller checks, unique character/instance resolution, normal lifecycle cleanup, and duplicate-event suppression; player casting now separates caster and recipient-count choices. Complete the focused live normal, advantage, disadvantage, unrelated-d4, ambiguity, and manual-fallback checks before closing it.

Issues #42-44, #52, #53, #56, #72, and the first Issue #91 service contract are implemented on PR #81 and remain at **Sandbox verification** until their focused Roll20 checks pass. Issue #45 remains outside the release gate because persistent token-image/default-token writes need dedicated preview and recovery. Issues #50 and #57 remain deferred as comparatively expensive integrations with limited immediate table value. Issue #82 remains post-v2.0 catalog-adapter expansion because every added effect needs a verified mechanical adapter rather than a catalog name alone.

---

## Platform Sequence After Roll20 `v2.0.0`

Development remains consecutive rather than concurrent:

1. Finish the bounded Roll20 v2.0.0 candidate on PR #81.
2. Complete live Roll20 acceptance, repair only verified failures, and establish a stable Roll20 baseline.
3. Begin a separate Foundry-native GameAssist package and version history.
4. Build AlmanacAssist and atlas-scale WorldPack storage first, using Foundry compendia, documents, application windows, and package relationships instead of reproducing Roll20 chat and handout constraints.
5. Port the remaining modules around Foundry's native Active Effects, Combat, token, actor, and chat contracts only after that foundation is stable.

The Roll20 edition remains campaign-scale: it provides bounded GM-editable definitions, coherent scenes, travel, calendars, and portable WorldPacks that fit safely in the Mod sandbox. It is not required to embed a full atlas or a large library of setting-scale world data. The Foundry edition is a sibling implementation rather than a line-by-line port. Versioned portable schemas may be shared when they remain platform-neutral, but runtime state and platform-specific behavior do not cross between editions.

---

## Current `v2.0.0` Architecture

```text
[GAMEASSIST]/
├─ [GAMEASSIST:POLICY]
├─ [GAMEASSIST:APP]
│  └─ [GAMEASSIST:APP:UTILS]
├─ [GAMEASSIST:CORE]
│  ├─ [GAMEASSIST:CORE:QUEUE]
│  ├─ [GAMEASSIST:CORE:COMPAT]
│  ├─ [GAMEASSIST:CORE:STATE]
│  ├─ [GAMEASSIST:CORE:MARKERSERVICE]
│  ├─ [GAMEASSIST:CORE:TURNTRACKERSERVICE]
│  ├─ [GAMEASSIST:CORE:SEMANTICEVENTS]
│  ├─ [GAMEASSIST:CORE:HEALTHSERVICE]
│  └─ [GAMEASSIST:CORE:OBJECT]
├─ [GAMEASSIST:INTERFACES]
│  ├─ [GAMEASSIST:INTERFACES:EVENTS]
│  └─ [GAMEASSIST:INTERFACES:COMMANDS]
├─ [GAMEASSIST:MODULES]
│  ├─ [GAMEASSIST:MODULES:CONFIGUI]
│  ├─ [GAMEASSIST:MODULES:CRITASSIST]
│  ├─ [GAMEASSIST:MODULES:CONDITIONASSIST]
│  ├─ [GAMEASSIST:MODULES:TOKENASSIST]
│  ├─ [GAMEASSIST:MODULES:INITIATIVEASSIST]
│  ├─ [GAMEASSIST:MODULES:COMBATASSIST]
│  ├─ [GAMEASSIST:MODULES:WELCOMEASSIST]
│  ├─ [GAMEASSIST:MODULES:NPCASSIST]
│  ├─ [GAMEASSIST:MODULES:CONCENTRATIONASSIST]
│  ├─ [GAMEASSIST:MODULES:EFFECTASSIST]
│  ├─ [GAMEASSIST:MODULES:HEALASSIST]
│  ├─ [GAMEASSIST:MODULES:ATTACKASSIST]
│  ├─ [GAMEASSIST:MODULES:ALMANACASSIST]
│  ├─ [GAMEASSIST:MODULES:HPASSIST]
│  └─ [GAMEASSIST:MODULES:DEBUGTOOLS]
└─ [GAMEASSIST:BOOTSTRAP]
```

This tree matches the implemented executable section hierarchy. Per MECHSUITS v1.5.2, it and the executable banner's `canonical_tree` must remain synchronized whenever a section tag changes.

---

## Cross-Cutting Release Gates

Completed checkpoints must satisfy the applicable checks below. An explicitly labeled alpha may retain documented expanded testing, but privacy, data preservation, integration safety, and accurate package information remain release requirements. AlmanacAssist's alpha designation does not mark other outstanding checks as passed:

- [ ] JavaScript syntax checks pass.
- [ ] Changed behavior has focused tests or a documented manual proof.
- [ ] Roll20 sandbox smoke tests pass for changed workflows.
- [ ] Module enable/disable and reload behavior is checked when affected.
- [ ] State migration and rollback consequences are documented when affected.
- [ ] README, changelog, smoke tests, and upgrade instructions are updated.
- [ ] MECHSUITS tags, nesting, canonical tree, section metadata, and footers are accurate.
- [ ] Applicable attribution, provenance, and license notices are preserved.
- [ ] Known limitations are documented.

---

## Work Outside The Immediate Sequence

These remain outside the Roll20 v2.0.0 release gate or require their own later design work:

- native Mord character-sheet development;
- unrelated encounter, rest, resource, and roadmap modules;
- broad plugin-loader work;
- standard API_Meta diagnostic adoption, explicitly deferred in [Issue #50](https://github.com/Mord-Eagle/GameAssist/issues/50);
- persistent TokenAssist image/default-token writes, tracked in [Issue #45](https://github.com/Mord-Eagle/GameAssist/issues/45); advanced expressions, controller/report semantics, and selected-token visual/multi-sided controls from Issues #42-#44 are implemented on PR #81 pending live verification;
- condition changes and automatic turn advancement, which remain unscoped and deferred;
- optional CombatAssist Jukebox hooks, tracked in [Issue #57](https://github.com/Mord-Eagle/GameAssist/issues/57); the bounded timeline, Ready/Delay records, and NPCAssist handoff from Issues #52, #53, and #56 are implemented pending live verification;
- true Journal-folder routing; stable handout identities and `!ga-handouts` indexing from [Issue #72](https://github.com/Mord-Eagle/GameAssist/issues/72) are implemented, but Roll20 exposes no supported writable folder API;
- broader EffectAssist effects only after their exact sheet or service adapters are designed, tracked in [Issue #82](https://github.com/Mord-Eagle/GameAssist/issues/82);
- claims of complete TokenMod compatibility before command-family verification;
- automatic deletion of legacy or unexpected persistent state.

---

## Maintaining This Roadmap

When work advances:

1. Update the relevant issue checklist and add investigation notes there.
2. Update the stage status in this document when its lifecycle changes.
3. Mark a stage complete only after its acceptance criteria and Roll20 release gate pass.
4. If scope changes materially, update both this roadmap and the relevant issue so neither becomes misleading.
5. Keep release notes and the README aligned with what is implemented, not merely planned.
