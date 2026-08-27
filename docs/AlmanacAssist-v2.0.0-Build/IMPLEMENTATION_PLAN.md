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
the larger architectural work begins. **AlmanacAssist v2.0.0 is the active implementation version for the entire program.** A real exploratory Roll20 launch invalidated the earlier assumption that framework completion meant usable code completion. Formal live acceptance must not restart until the fresh-GM recovery work below is built and focused-covered.

## 1. Status summary

| Gate | Scope | Status |
| --- | --- | --- |
| Gate 0 | Preserve and repair the current foundation | **Focused source evidence retained.** #92/#93, future-state contracts, and the false-positive retained-`Core` audit repair are covered; fresh real-Roll20 startup verification remains required. |
| Gate 1 | Make the existing six systems usable in Roll20 | **Active recovery.** Complete rendered prompts, outcomes, navigation, and first-run recovery are required; framework/menu presence is insufficient. |
| Gate 2 | Introduce the SceneResolver current-scene authority | **Focused evidence retained.** It must support a usable current Location rather than becoming a generic unassigned-state dead end. |
| Gate 3 | Build live-world systems from #94 | **Active recovery.** Add/use legally distributable generic starter worlds, world selection, climate profiles/regions, Locations, destinations, and Travel as an ordinary fresh-GM flow. |
| Gate 4 | Portable world data and temporal contexts | **Focused evidence retained.** Advanced import/context tools remain bounded and must not be required to escape an empty campaign. |
| Acceptance | Automated/structural + live Roll20 | **Blocked.** Historical VM evidence is not product completion; exploratory live Roll20 found blockers. Formal acceptance is not currently eligible. |

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
- [x] **Recovery source repair:** Reproduced the startup `Unexpected state branch: Core` warning in the Roll20-shaped harness. `auditState()` now recognizes every registered internal module namespace, including retained `state.GameAssist.Core`, without deleting it; genuinely unregistered branches still warn. `assertKnownInternalStateNamespace()` in the Gate 0 harness locks that distinction. Fresh live startup verification remains in the recovery preflight.
- [ ] **Final validation only:** Complete the live Roll20 smoke checks for disable/re-enable and subsystem toggles after the fresh-GM recovery work is complete.

## 3. Gate 1 — Make the existing six systems usable in Roll20

This gate has a v2.0.0 framework foundation: compact Current World/Scene presentation, bounded generic location context, Prepared Destinations, reviewed Travel, and explicit Phenomena overlays. The exploratory live result proved that those foundations do not yet constitute a usable ordinary GM path.

### Fresh-GM interaction recovery (required before formal live acceptance)

- [ ] Every generated action opens a complete Roll20 prompt or invokes a complete command: no blank `--value`, literal boolean residue, incomplete `--period`, or missing required identifier.
- [ ] Every generated action gives a visible success/refusal/result panel and recovery link; a GM must not need to memorize a command to continue.
- [ ] First-run Session, Scene, Location, Travel, Climate, Weather, Environment, Astronomy, Rest, Preset, WorldPack, and Wayfarer screens explain the relevant state and link to a usable next action.
- [ ] Ordinary panels use names/choices for pages, handouts, worlds, profiles, and records; raw IDs are technical-only evidence, never setup input.
- [ ] Climate Add Region and every comparable create/edit action have complete deferred queries and useful profile/region selection.
- [ ] Add focused VM assertions that inspect decoded generated targets and state/outcome behavior; then require a fresh real-Roll20 render/prompt check.
- [x] Recovery source additions now include generic Starter Worlds/World Library, first-run recovery links, first-created Location activation, selected Climate profiles/regions, deferred Climate queries, and named Roll20 page/handout selection controls. These remain focused-VM evidence pending a fresh rendered Roll20 check.
- [x] Focused source prompt audit now decodes and checks more than 350 generated actions from ordinary starter-world screens for executable targets, closed/nonblank deferred queries, the visible default plus each first-level named query choice, and the known blank/literal placeholder failures. Generated refusal/no-change panels must retain a recovery control; coverage includes Weather's complete manual-condition/history routes, compatible named WorldPack/Wayfarer handout pickers, and selected-token Rest behavior. This detects source/render-target regressions only; Roll20 remains the final prompt renderer.
- [x] Reconcile effective Climate provenance across Scene, Climate, Weather, Environment, status, public API, and semantic events: Location direct relation → Ecoregion relation → campaign fallback. Location moves retain provider-owned Weather; mismatches are visible, and both generated and manual Weather record the effective source. No-Weather Environment follows the active Location default. Focused VM coverage includes direct, Ecoregion-only, and no-local/fallback paths.

- [x] Implement the compact `!Almanac-GM` / `!Almanac-DM` / `!aa-gm` Current World
      dashboard, Scene view, quick time anchors, and explicit return navigation in
      the new Session Mode surfaces.
- [x] Add bounded Change Location selection with current, favorites, recents, and
      all generic owner-authored Locations; preserve Weather and other provider
      ownership when a place changes.
- [x] Implement reviewed Travel start/route/pace/segment/arrival flow with
      accepted-only fictional-time advancement and final-location switch.
- [ ] **Final validation only:** Verify all ordinary Travel and generated buttons in live Roll20 after fresh-GM recovery is complete.
- [x] Wayfarer calendar manager: create/edit/preview/validate/activate/duplicate/
      roll back/reset without raw JSON; complete query prompts; atomic activation;
      elapsed-time preservation; year-0 behavior defined once; plus optional bounded
      versioned handout export/edit/import with inert parsing, review, stale protection,
      and draft-only atomic confirmation.
- [x] Route dashboard, Scene, announcement preview/delivery, and public weather
      announcement current-world facts through a single read-only SceneResolver
      snapshot. Preserve independent Off/Descriptive/Detailed/Technical fields and
      Quick/Calendar/Travel/Everything presets; technical content is forced GM-only.
- [ ] **Final validation only:** Verify every presentation mode and preset in live Roll20 after fresh-GM recovery is complete.
- [x] Climate/weather/environment/astronomy/rest ownership and coherence are implemented in code through the shared snapshot and guarded provider boundaries; final live proof remains below.
- [ ] **Final validation only:** Run the live Roll20 Wayfarer, announcement, weather/environment coherence, astronomy, and rest tracks after fresh-GM recovery is complete.

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
- [ ] **Final validation only:** Complete live Roll20 Phenomena/coherence evidence after fresh-GM recovery is complete.
- [ ] **Final validation only:** Verify large time changes emit no unbounded event replay in Roll20 after fresh-GM recovery is complete.

## 5. Gate 3 — Live-world systems from #94

### Starter-world and travel usability recovery

- [ ] A fresh campaign must offer an obvious choice of included, generic, legally distributable starter worlds or an equally usable guided first-world route; it must not require WorldPack import or freeform data entry to begin play.
- [ ] Installing/selecting a starter must visibly create and select a usable active Location, Climate region/profile, Prepared Destinations, routes, and at least one coherent Scene path.
- [ ] A GM must be able to inspect, change, and edit starter records through ordinary named controls, retain compatible campaign data when switching saved worlds, and recover to a blank campaign-world without data loss.
- [ ] Travel must be reachable from the active Location and its no-location state must link to World Library/Location setup rather than merely refuse.
- [ ] Starter material remains bounded generic owner-authored content; it may not reproduce names, lore, maps, factions, or text from a published setting.
- [x] Source recovery implementation now has four generic starters (Ember Coast, Sunward Expanse, Frostfall Marches, Mirewood Basin), saved World Library switching, Location/Travel first-run recovery, destinations/routes, and starter-world focused VM coverage. Its real rendered usability remains unproven.

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
- [x] Keep every Worldbuilding collection usable at setting scale: ordinary named catalog screens are name-sorted 12-entry pages with Previous/Next, name/tag Search, and direct Edit controls. Catalog browsing/search is read-only and never relies on a GM recalling a Technical stable ID; focused four-pack coverage reaches the final Location and Route pages.
- [x] Keep dynamic editor selection usable at the same scale: Worldbuilding hierarchy/endpoints, Climate and named Roll20 pages, installed-palette profile bindings, Session Preset overlays, Route Leg Travel Profile/intermediate Location choices, and palette collection/default/cross-reference controls open complete name/tag-searchable 12-entry pickers. A picker is read-only until it delegates to the existing guarded setter or atomic split path; focused VM coverage reaches final profile and 640-Location choice pages and checks decoded rendered targets.
- [x] Bound each reusable palette collection at 160 records on import, validation, and direct addition. Preserve multi-template Ecoregion Profile references as canonical arrays through the visible picker/save path.
- [x] Keep built-in packs generic and owner-authored; no published setting pack data is bundled pending any separate provenance/licensing review.

## 6. Gate 4 — Portable world data and temporal contexts

- [x] WorldPackService: separate PresetRegistry/WorldPack/runtime data classes; shared versioned editable handout/canonical-export schema; bounded documents/parser work; syntax/schema/semantic/reference/conflict/provenance validation; dependency report; Preview → stale-protected Confirm → atomic Worldbuilding/registry commit; New/Update/Copy; stable provenance; blank template; no imported-text execution; visible immutable-source update/current-state controls with bounded conflict evidence and independent-copy recovery; and focused VM coverage.
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
- [x] WorldPack import/parser tests prove bounded failure, stale-preview refusal, no-overwrite behavior, immutable-source update/current/refusal/copy recovery, update/copy provenance, and atomicity.
- [x] Temporal-context projection/reconciliation tests prove bounded failure, stale refusal, canonical-only atomic commits, event boundaries, and future-state preservation.
- [x] Historical automated checkpoint: 11 Node VM suites ran as one consolidated checkpoint. No separate broader repository test runner exists. The live exploratory failure showed this does not establish first-run usability.
- [x] Recovery test expansion: `tests/almanac-starter-worlds.test.js` now covers first-run actions, starter installation/switching, direct/Ecoregion/fallback Climate provenance, retained Weather mismatch/manual provenance, Location-default Environment parity, climate-removal guards, and a decoded ordinary-screen generated-target audit. It runs in the full focused suite. Rare/advanced flows still require continued audit plus final Roll20 rendering evidence.

### Live Roll20

**Recovery render phase (required before formal acceptance):** An exploratory live launch already found blockers, so formal acceptance is **not eligible**. In a disposable real Roll20 campaign, first run and record the following recovery checks; no VM result marks a live item complete:

- [ ] Fresh campaign: open World Library, preview/install each starter, and verify an active Location, named Climate region/profile, destinations, routes, and coherent Scene are immediately usable.
- [ ] Fresh campaign: create a first blank Location and verify it becomes current; change/clear/assign a named Roll20 page without typing an ID.
- [ ] Fresh campaign: create/select a Climate region; verify Add Region’s rendered query supplies name/profile rather than emitting a truncated command.
- [ ] Fresh campaign: reach Prepared Destination and Travel from Location, review/start a route, and use a no-location recovery link.
- [ ] WorldPack and Wayfarer: choose named existing handouts or follow an actionable no-handout export/template path without typing an ID.
- [ ] Startup: confirm no false `Unexpected state branch: Core` audit warning and retain warnings for genuinely unknown state.
- [ ] Nontrivial Wayfarer calendar via chat controls only.
- [ ] Every generated button opens a complete prompt and produces a visible result.
- [ ] Session Mode common actions within one or two screens.
- [ ] Worldbuilding editor catalogs: with a full installed WorldPack, page Locations and Routes, search a named record, and open a distant record’s direct Edit control without typing a Technical stable ID; confirm compact rendered cards and no accidental state change while browsing.
- [ ] Off/Descriptive/Detailed/Technical output and all presets.
- [ ] Climate, weather, environment, temperature, precipitation, visibility, and
      moon visibility are coherent. In particular, verify direct Location Climate, Ecoregion-only inheritance, and campaign fallback; confirm a Location move retains and flags old-region Weather, then use both Generate and Set Manual Conditions to replace it. Before Weather is committed, confirm EnviroAlmanac matches the active Location default.
- [ ] Each system disabled alone; AlmanacAssist disabled as a parent.
- [ ] Rest on disposable supported 2014-sheet characters including stale preview
      and rollback.
- [ ] Unsupported sheets fail without partial writes.
- [ ] Large time jumps do not stall the sandbox.
- [ ] Public output reveals no GM-only technical evidence.

Only after the recovery-render checks pass may this list be treated as the formal full acceptance track. Record each real result; do not collapse a menu/prompt smoke observation into a release claim.

## 8. Verification results on this branch

- `node tests/almanac-gate0.test.js` passes. It boots the actual `GameAssist`
  artifact in an isolated Roll20-shaped Node VM and verifies executable-artifact
  identity, removal of `maximumWorldMinute`, direct resolver boundary behavior
  (negative/non-finite input, the last valid minute of year 9999, and the first
  invalid minute), #93 configured-state semantics, valid saved-state preservation,
  and case-insensitive close dashboard aliases.
- The historical 2026-08-26 automated checkpoint passed `node --check GameAssist`, `node --check GameAssist.js`, `node --check < GameAssist-v2.0.0`, artifact comparison, `git diff --check`, and 11 focused Almanac Node VM suites: Gate 0, SceneResolver, Worldbuilding, Travel, Phenomena, Presets, RulesAdvisor, WorldPacks, Temporal Contexts, Wayfarer handout, and conservative migration (including future Worldbuilding runtime preservation). Those suites prove specific no-write, future-state, review-before-commit, and atomicity contracts; they did not prove fresh-GM Roll20 usability.
- The post-convergence regression sweep passed all 14 focused Almanac Node VM suites with direct executable-identity assertions enabled, including the four-pack 640-Location/860-Route catalog workload, Worldbuilding direct Edit paging/search, PresetRegistry bounds, RulesAdvisor no-provider-write behavior, and Climate scope compatibility. Syntax checks and direct comparisons also passed for `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0`. This is local regression evidence only; it does not replace the required Roll20 render/performance acceptance work.
- `maximumWorldMinute` no longer appears anywhere in the source.
- `getSubmoduleStatus()` now returns the explicit six-field configured-state
  object.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` are byte-identical after
  the edits.
- The current post-coherence checkpoint passed syntax checks, artifact identity, `git diff --check`, and all 12 focused Almanac Node VM suites, including the expanded starter-world/prompt suite. The VM harnesses are focused automated development evidence only. An exploratory real-Roll20 run exposed startup/audit, starter-content, Location/Travel, Climate prompt, and navigation gaps. The Issue #96 program remains in active recovery; formal live Roll20 tests must not be described as merely “not yet run” or as the only remaining work.
