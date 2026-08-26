# AlmanacAssist 2.0 — Implementation Plan

- Build branch: `AlmanacAssist-v2.0.0-Build`
- Baseline: duplicate of `75-v2.0.0-effectassist` (`e08cb36`)
- Source implementation master: **#95** (left unchanged)
- Build tracking copy: **#96**
- Architectural destination: **#94**
- Updated: 2026-08-26

## 0. Working model

The branch is a duplicate of the existing `75-v2.0.0-effectassist` branch. Nothing
on the branch touches `main` or the existing branch. All edits are confined to the
AlmanacAssist section, directly affected shared contracts, documentation, metadata,
and tests until a final consolidated regression pass.

The plan follows the delivery order in #95/#96. The narrow repairs in **Gate 0** are
completed first because they are independently verifiable and reduce risk before
the larger architectural work begins. **AlmanacAssist v2.0.0 is the active implementation version for the entire program. Live Roll20 validation is a final release phase and must not begin until all Issue #96 code gates are built.**

## 1. Status summary

| Gate | Scope | Status |
| --- | --- | --- |
| Gate 0 | Preserve and repair the current foundation | **Code built — #92/#93, configured-state preservation, close aliases, and warning-only future-state guards are covered in focused VM tests; final live lifecycle evidence remains pending** |
| Gate 1 | Make the existing six systems usable in Roll20 | **Code built — compact Current World/dashboard, complete Wayfarer chat route plus optional handout route, snapshot-backed presentation, and six-system safeguards are implemented; live UX verification remains final-phase work** |
| Gate 2 | Introduce the SceneResolver current-scene authority | **Code built — read-only snapshot, explicit Phenomena/Temporal evidence, and focused VM coverage are implemented; live verification remains final-phase work** |
| Gate 3 | Build live-world systems from #94 | **Code built — generic place composition, Prepared Destinations, reviewed Travel, Phenomena, PresetRegistry, RulesAdvisor, and consistent Worldbuilding editor layers are implemented** |
| Gate 4 | Portable world data and temporal contexts | **Code built — WorldPacks and explicit reviewed temporal contexts are implemented with bounded parser/review/event contracts** |
| Acceptance | Automated/structural + live Roll20 | **Automated/structural evidence is clean as of 2026-08-26; final live Roll20 acceptance is now eligible but has not begun** |

## 2. Gate 0 — Preserve and repair the current foundation

### Completed in this branch

- **#92 — Remove redundant full-range chronology scan.**
  - Removed `maximumWorldMinute(profile)`, which traversed years 1–9999 on every
    `resolveWorldMinute()` call.
  - Changed the resolver's initial validation from
    `if (!Number.isFinite(minute) || minute < 0 || minute > maximumWorldMinute(profile)) return null;`
    to
    `if (!Number.isFinite(minute) || minute < 0) return null;`.
  - The existing bounded year-resolution loop still rejects values beyond
    `minimumYear..maximumYear`, so all chronology semantics are preserved.
  - No cache or memoization was added.

- **#93 — Consistent `getSubmoduleStatus()` semantics.**
  - Replaced the mixed return (effective availability for `time`, configured state
    for the rest) with a single object that reports configured subsystem state for
    all six systems:
    - `time: submoduleEnabled('time') && modState.config.timeAlmanacEnabled !== false`
    - `climate/astronomy/weather/environment/rest: submoduleEnabled(name)`
  - Parent availability remains `isAvailable()`.
  - Effective Time availability remains `isTimeAvailable()`.
  - No generalized `submoduleAvailable()` helper was added.
  - Read-only getter behavior is unchanged.

- **Version and metadata.**
  - Historical internal checkpoints advanced from `1.6.1` through `1.10.0`; the active AlmanacAssist implementation version is now **`2.0.0`** for the full Issue #96 code program.
  - Section metadata and footer distinguish that active v2.0.0 implementation from retained historical rollback notes.
  - `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` remain byte-identical at each verified checkpoint.

### Other Gate 0 items remaining

- [x] Confirm in the focused VM harness that commands are case-insensitive and
      accept established close space/hyphen variants (`!Almanac`, `!aa`,
      `!aa-gm`, `!Almanac-GM`, etc.). Live Roll20 confirmation remains required.
- [x] Add focused automated checks for #92 and #93, chronology boundaries,
      executable identity, configured-state semantics, and valid saved-state
      preservation through a disable/re-enable simulation.
- [x] Verify in the focused harness that valid saved configuration is preserved
      when AlmanacAssist or a subsystem is disabled and re-enabled. Live Roll20
      lifecycle confirmation remains required.
- [x] Keep known future Worldbuilding configuration/runtime, WorldPack, Temporal Context, Wayfarer-import, and transition-review state warning-only; never delete, expire, or reinterpret it automatically in an older build.
- [ ] **Final validation only:** Complete the live Roll20 smoke checks for disable/re-enable and subsystem toggles after all Issue #96 code gates are built.

## 3. Gate 1 — Make the existing six systems usable in Roll20

This code gate has a v2.0.0 implementation foundation: compact Current World/Scene presentation, bounded generic location context, Prepared Destinations, reviewed Travel, and explicit Phenomena overlays. Its live Roll20 acceptance work is intentionally deferred and must begin only after all remaining Issue #96 code gates are built.

- [x] Implement the compact `!Almanac-GM` / `!Almanac-DM` / `!aa-gm` Current World
      dashboard, Scene view, quick time anchors, and explicit return navigation in
      the new Session Mode surfaces.
- [x] Add bounded Change Location selection with current, favorites, recents, and
      all generic owner-authored Locations; preserve Weather and other provider
      ownership when a place changes.
- [x] Implement reviewed Travel start/route/pace/segment/arrival flow with
      accepted-only fictional-time advancement and final-location switch.
- [ ] **Final validation only:** Verify all ordinary Travel and generated buttons in live Roll20 after the complete Issue #96 code build.
- [x] Wayfarer calendar manager: create/edit/preview/validate/activate/duplicate/
      roll back/reset without raw JSON; complete query prompts; atomic activation;
      elapsed-time preservation; year-0 behavior defined once; plus optional bounded
      versioned handout export/edit/import with inert parsing, review, stale protection,
      and draft-only atomic confirmation.
- [x] Route dashboard, Scene, announcement preview/delivery, and public weather
      announcement current-world facts through a single read-only SceneResolver
      snapshot. Preserve independent Off/Descriptive/Detailed/Technical fields and
      Quick/Calendar/Travel/Everything presets; technical content is forced GM-only.
- [ ] **Final validation only:** Verify every presentation mode and preset in live Roll20 after the complete Issue #96 code build.
- [x] Climate/weather/environment/astronomy/rest ownership and coherence are implemented in code through the shared snapshot and guarded provider boundaries; final live proof remains below.
- [ ] **Final validation only:** Run the live Roll20 Wayfarer, announcement, weather/environment coherence, astronomy, and rest tracks after the complete Issue #96 code build.

## 4. Gate 2 — SceneResolver current-scene authority

- [x] Add an internal read-only SceneResolver exposed through
      `GameAssist.AlmanacAssist.getScene()`.
- [x] Declare the ownership matrix and implement generic Region, Geography,
      Ecoregion, Biome, Location, active Travel, and explicit Phenomena overlay evidence.
- [x] Return deeply immutable/defensive snapshots with field-level provenance and
      bounded warnings without provider-state writes.
- [x] Resolve Time-owned season before Climate interpretation; keep Weather's exact
      current temperature, Environment's immediate context, Astronomy's phase, and
      SceneResolver's moon-visibility conclusion distinct.
- [x] Compose persistent Geography terrain/hydrology, Ecoregion water regime,
      Biome ground/water tendencies, immediate Environment, and temporary Weather
      effects as separate fields; absent layers remain partial/unavailable.
- [x] Report missing, disabled, and parent-disabled providers without invented facts.
- [x] Add focused VM checks for no writes, deep immutability, disabled states, manual
      Time fallback, unusual Weather combinations, technical-delivery privacy, and
      Scene presentation.
- [x] Route committed Weather forecast display through the snapshot.
- [x] Route Rest preview context and its time-revalidation boundary through the
      snapshot; committed Weather forecast display also uses the snapshot.
- [x] Route active reviewed Travel through the snapshot with immutable journey
      evidence and field provenance; Travel actions retain explicit review boundaries.
- [x] Add bounded explicit Phenomena definitions and immutable read-only overlay evidence; filter scoped/elapsed records without writes, preserve newer active records warning-only, and keep non-authoritative terrain/travel presentation separate.
- [ ] **Final validation only:** Complete live Roll20 Phenomena/coherence evidence after the complete Issue #96 code build.
- [ ] **Final validation only:** Verify large time changes emit no unbounded event replay in Roll20 after the complete Issue #96 code build.

## 5. Gate 3 — Live-world systems from #94

- [x] Establish bounded, generic owner-authored Region, Geography, Ecoregion, Biome,
      and Location records with direct Roll20 add/edit/remove controls and
      Location-selected parent composition in SceneResolver.
- [x] Add Favorites and Recents to the prioritized Change Location picker alongside
      current place and all Locations.
- [x] Add the Worldbuilding Mode category hub: Places, Natural World, Local Context,
      Time & Sky, Gameplay, and Campaign Tools; ordinary cards keep basic facts and
      put stable IDs/removal under Advanced.
- [x] Keep unknown future Worldbuilding schemas warning-only and preserve them on
      SceneResolver reads; add focused VM composition/workflow coverage.
- [x] Add Location-bound Prepared Destinations with preview/confirm context
      transitions that preserve Weather, Environment, Astronomy, and Time ownership.
- [x] Add bounded bidirectional Travel Routes and retained route/pace journeys;
      review start and every segment, advance Time only after confirmation, and
      change Location only on accepted arrival.
- [x] Phenomena: bounded owner-authored definitions with optional Location scope, reviewed activation/deactivation, optional fictional-time expiry, explicit cleanup, safe active-record deletion constraints, Worldbuilding/Session/Travel presentation, and focused VM coverage.
- [x] PresetRegistry: immutable generic versioned built-ins, Preview → reviewed Clone/Install → Customize, independent editable campaign clones, provenance, bounded references, and focused VM coverage.
- [x] RulesAdvisor: optional profile-specific bounded SceneResolver-derived reminders, explicit on/off and profile controls, no provider/gameplay writes, and focused VM coverage.
- [x] Complete Basic / Detailed / Technical layers for every generic Worldbuilding record editor through the shared `worldRecordEditorLayers()` contract; Technical adds provenance/stable identity and guarded removal without normal-panel JSON.
- [x] Keep built-in packs generic and owner-authored; no published setting pack data is bundled pending any separate provenance/licensing review.

## 6. Gate 4 — Portable world data and temporal contexts

- [x] WorldPackService: separate PresetRegistry/WorldPack/runtime data classes; shared versioned editable handout/canonical-export schema; bounded documents/parser work; syntax/schema/semantic/reference/conflict/provenance validation; dependency report; Preview → stale-protected Confirm → atomic Worldbuilding/registry commit; New/Update/Copy; stable provenance; blank template; no imported-text execution; and focused VM coverage.
- [x] Temporal contexts: explicit immutable Prime/regional/planar time-rate contexts; Basic/Detailed/Technical editing; preview plus stale-protected reconciliation; no silent reversal of rests/effects/NPC history/combat/resources/real-world records; rules/lore presets distinct from mechanics; bounded `almanac.temporal.transition` events for EffectAssist and other consumers.

## 7. Acceptance strategy

### Automated and structural

- [x] Focused VM harnesses cover Gate 0, SceneResolver, generic Worldbuilding and editor layers,
      Prepared Destination/reviewed Travel, explicit Phenomena boundaries, PresetRegistry clone/install boundaries, RulesAdvisor, WorldPack parser/review/atomicity, Temporal Context projection/reconciliation/events, Wayfarer handout import, and future Worldbuilding/other-runtime preservation; they do not replace final live Roll20 acceptance.
- [x] Final syntax parsing passed for `GameAssist`, `GameAssist.js`, and
      `GameAssist-v2.0.0` at the 2026-08-26 automated checkpoint.
- [x] Executable artifacts were reconfirmed byte-identical at that checkpoint.
- [x] Targeted structural validation passed: balanced canonical section markers/tree,
      plus the active Almanac section's v2.0.0 metadata, identifier, and Notes &
      Comments footer. The repository has no standalone MECHSUITS validator; older
      unrelated legacy sections were not rewritten merely to change their metadata style.
- [x] Chronology boundary tests cover the final valid year, first invalid minute,
      leap rules, intercalary days, custom periods, weekday skipping, seasons, and
      calendar switching in the focused Gate 0 VM harness.
- [x] Focused state migration/future-state, disable/re-enable, rollback, stale preview, bounds,
      and malformed-input tests cover the Almanac additions; final live restart/lifecycle proof remains deferred.
- [x] Scene coherence tests prove one authoritative value per field with field-level
      provenance in the focused SceneResolver VM harness.
- [x] WorldPack import/parser tests prove bounded failure, stale-preview refusal, no-overwrite behavior, update/copy provenance, and atomicity.
- [x] Temporal-context projection/reconciliation tests prove bounded failure, stale refusal, canonical-only atomic commits, event boundaries, and future-state preservation.
- [x] Ran the repository's complete focused Almanac collection (11 Node VM suites) as one consolidated automated checkpoint. No separate broader repository test runner exists; this does not replace final live Roll20 acceptance.

### Live Roll20

**Final live phase (eligible, not started):** All Issue #96 code gates—including WorldPacks, Temporal Contexts, future Worldbuilding runtime preservation, layered editors, and the Wayfarer handout workflow—are built, and the consolidated automated checkpoint is clean. Execute the following only in a disposable real Roll20 campaign; no VM result marks a live item complete.

- [ ] Nontrivial Wayfarer calendar via chat controls only.
- [ ] Every generated button opens a complete prompt and produces a visible result.
- [ ] Session Mode common actions within one or two screens.
- [ ] Off/Descriptive/Detailed/Technical output and all presets.
- [ ] Climate, weather, environment, temperature, precipitation, visibility, and
      moon visibility are coherent.
- [ ] Each system disabled alone; AlmanacAssist disabled as a parent.
- [ ] Rest on disposable supported 2014-sheet characters including stale preview
      and rollback.
- [ ] Unsupported sheets fail without partial writes.
- [ ] Large time jumps do not stall the sandbox.
- [ ] Public output reveals no GM-only technical evidence.

## 8. Verification results on this branch

- `node tests/almanac-gate0.test.js` passes. It boots the actual `GameAssist`
  artifact in an isolated Roll20-shaped Node VM and verifies executable-artifact
  identity, removal of `maximumWorldMinute`, direct resolver boundary behavior
  (negative/non-finite input, the last valid minute of year 9999, and the first
  invalid minute), #93 configured-state semantics, valid saved-state preservation,
  and case-insensitive close dashboard aliases.
- The 2026-08-26 automated checkpoint passed `node --check GameAssist`, `node --check GameAssist.js`, `node --check < GameAssist-v2.0.0`, artifact comparison, `git diff --check`, and all 11 focused Almanac Node VM suites: Gate 0, SceneResolver, Worldbuilding, Travel, Phenomena, Presets, RulesAdvisor, WorldPacks, Temporal Contexts, Wayfarer handout, and conservative migration (including future Worldbuilding runtime preservation). These suites prove no-write immutable scope/expiry filtering, future-state preservation, review-before-commit, and atomicity; they do not replace Roll20.
- `maximumWorldMinute` no longer appears anywhere in the source.
- `getSubmoduleStatus()` now returns the explicit six-field configured-state
  object.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` are byte-identical after
  the edits.
- The VM harnesses are focused automated development evidence only. The Issue #96 code build and automated gate are complete; final live Roll20 tests remain the governing release acceptance evidence and have not been run in this repository environment.
