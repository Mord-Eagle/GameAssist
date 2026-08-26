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
| Gate 0 | Preserve and repair the current foundation | **Code substantially built — #92/#93 and focused automated checks are complete; retain unknown-state hardening through final implementation** |
| Gate 1 | Make the existing six systems usable in Roll20 | **Code substantially built — compact Current World dashboard and snapshot-backed presentation are implemented; live UX verification is deferred to the final phase** |
| Gate 2 | Introduce the SceneResolver current-scene authority | **Code built — read-only snapshot, explicit Phenomena evidence, and focused VM coverage are implemented; live verification is deferred to the final phase** |
| Gate 3 | Build live-world systems from #94 | **In progress — generic place composition, Prepared Destinations, reviewed Travel, explicit Phenomena overlays, PresetRegistry, and RulesAdvisor are built; editor-layer completion remains** |
| Gate 4 | Portable world data and temporal contexts | Not started |
| Acceptance | Automated/structural + live Roll20 | **Deferred — begin only after every Issue #96 code gate is built** |

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
- [ ] Keep unknown state warning-only; never delete or reinterpret automatically.
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
- [ ] Wayfarer calendar manager: create/edit/preview/validate/activate/duplicate/
      roll back/reset without raw JSON; complete query prompts; atomic activation;
      elapsed-time preservation; year-0 behavior defined once.
- [x] Route dashboard, Scene, announcement preview/delivery, and public weather
      announcement current-world facts through a single read-only SceneResolver
      snapshot. Preserve independent Off/Descriptive/Detailed/Technical fields and
      Quick/Calendar/Travel/Everything presets; technical content is forced GM-only.
- [ ] **Final validation only:** Verify every presentation mode and preset in live Roll20 after the complete Issue #96 code build.
- [ ] Climate/weather/environment/astronomy/rest ownership and coherence.
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
- [ ] Complete Basic / Detailed / Technical layers for every editor.
- [ ] Provenance and licensing review before any published setting pack data.

## 6. Gate 4 — Portable world data and temporal contexts

- [x] WorldPackService: separate PresetRegistry/WorldPack/runtime data classes; shared versioned editable handout/canonical-export schema; bounded documents/parser work; syntax/schema/semantic/reference/conflict/provenance validation; dependency report; Preview → stale-protected Confirm → atomic Worldbuilding/registry commit; New/Update/Copy; stable provenance; blank template; no imported-text execution; and focused VM coverage.
- [ ] Temporal contexts (explicit planar/regional time-rate contexts; preview plus
      reconciliation; no silent reversal of rests/effects/NPC history/combat/
      resources/real-world records; rules/lore presets distinct from mechanics;
      EffectAssist receives bounded semantic events).

## 7. Acceptance strategy

### Automated and structural

- [x] Focused VM harnesses cover Gate 0, SceneResolver, generic Worldbuilding,
      Prepared Destination/reviewed Travel, explicit Phenomena boundaries, PresetRegistry clone/install boundaries, RulesAdvisor, and WorldPack parser/review/atomicity boundaries; they do not replace final live Roll20 acceptance.
- [x] Syntax parsing passes for `GameAssist`, `GameAssist.js`, and
      `GameAssist-v2.0.0`.
- [x] Executable artifacts remain byte-identical.
- [ ] MECHSUITS banner, canonical tree, metadata, footers, and identifier
      literalism pass.
- [ ] Chronology boundary tests: final valid year, first invalid minute, leap
      rules, intercalary days, custom periods, weekday skipping, seasons, calendar
      switching.
- [ ] State migration, disable/re-enable, restart, rollback, stale preview, bounds,
      and malformed-input tests.
- [ ] Scene coherence tests: one authoritative value per field with field-level
      provenance.
- [x] WorldPack import/parser tests prove bounded failure, stale-preview refusal, no-overwrite behavior, update/copy provenance, and atomicity.
- [ ] Temporal-context import/reconciliation tests prove bounded failure and atomicity.
- [ ] Focused Almanac tests before one consolidated GameAssist regression pass.

### Live Roll20

**Deferred final phase:** Do not execute any item in this section until all Issue #96 code gates—including WorldPacks and temporal contexts—are built and the consolidated automated regression pass is clean.

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
- `node --check GameAssist`, `node --check GameAssist.js`, `node --check < GameAssist-v2.0.0`, and the focused Almanac suites—including `tests/almanac-presets.test.js` and `tests/almanac-phenomena.test.js`—are run before each coherent checkpoint. The Phenomena harness proves no-write immutable scope/expiry filtering, newer-record preservation, review-before-activate/deactivate, explicit expiry cleanup, aliases, and Worldbuilding cards.
- `maximumWorldMinute` no longer appears anywhere in the source.
- `getSubmoduleStatus()` now returns the explicit six-field configured-state
  object.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` are byte-identical after
  the edits.
- The VM harness is focused automated development evidence only. Live Roll20 tests remain the governing final acceptance evidence, but are deliberately deferred until the full Issue #96 code build is complete.
