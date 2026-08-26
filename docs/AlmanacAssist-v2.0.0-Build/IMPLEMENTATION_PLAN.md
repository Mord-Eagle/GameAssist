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

The plan follows the delivery order in #95. The narrow repairs in **Gate 0** are
completed first because they are independently verifiable and reduce risk before
the larger architectural work begins.

## 1. Status summary

| Gate | Scope | Status |
| --- | --- | --- |
| Gate 0 | Preserve and repair the current foundation | **In progress — #92/#93 and focused automated checks are complete; unknown-state and live Roll20 checks remain** |
| Gate 1 | Make the existing six systems usable in Roll20 | Not started |
| Gate 2 | Introduce the SceneResolver current-scene authority | Not started |
| Gate 3 | Build live-world systems from #94 | Not started |
| Gate 4 | Portable world data and temporal contexts | Not started |
| Acceptance | Automated/structural + live Roll20 | Not started |

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
  - AlmanacAssist module version advanced from `1.6.1` to `1.6.2` on this build
    line (the architectural 2.0 engine is not yet complete, so `2.0.0` is not
    claimed).
  - Section metadata and footer were updated.
  - `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` were kept byte-identical.

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
- [ ] Complete the live Roll20 smoke checks for disable/re-enable and subsystem
      toggles.

## 3. Gate 1 — Make the existing six systems usable in Roll20

This is the minimum AlmanacAssist completion gate for PR #81. It is largely
implemented in 1.6.1 but must be verified against the live Roll20 acceptance track
before it can be marked complete.

- [ ] Session dashboard: `!Almanac-GM` / `!Almanac-DM` / `!aa-gm` open one compact
      Current World dashboard; common actions are within one or two screens.
- [ ] Wayfarer calendar manager: create/edit/preview/validate/activate/duplicate/
      roll back/reset without raw JSON; complete query prompts; atomic activation;
      elapsed-time preservation; year-0 behavior defined once.
- [ ] Presentation and announcements: one resolved snapshot; independent
      Off/Descriptive/Detailed/Technical; Quick/Calendar/Travel/Everything presets;
      preview before delivery.
- [ ] Climate/weather/environment/astronomy/rest ownership and coherence.
- [ ] Live Roll20 Wayfarer, announcement, weather/environment coherence,
      astronomy, and rest tracks.

## 4. Gate 2 — SceneResolver current-scene authority

- [ ] Add an internal read-only SceneResolver.
- [ ] Ownership matrix: Time, Astronomy, Region, Geography, Ecoregion, Climate,
      Biome, Location, Environment, Weather, Phenomena, Travel, Rest.
- [ ] Return immutable/defensive scene snapshots with field-level provenance and
      warnings.
- [ ] Resolve season from Time; terrain from Geography + Biome + Environment +
      Weather.
- [ ] Distinguish persistent hydrology, transient weather effects, and immediate
      water access.
- [ ] Report moon phase separately from moon visibility.
- [ ] Report missing/disabled providers without inventing authority.
- [ ] Publish no unbounded event replay on large time changes.

## 5. Gate 3 — Live-world systems from #94

- [ ] Prepared Destinations (preview and apply coherent context bundles).
- [ ] Favorites and Recents (prioritized selectors).
- [ ] Travel (retained route/pace, reviewed Time advancement).
- [ ] Phenomena (explicit overlays over ordinary world logic).
- [ ] PresetRegistry (immutable versioned built-ins, Preview → Clone/Install →
      Customize, campaign clones editable).
- [ ] RulesAdvisor (optional, rules-profile-specific, advisory only).
- [ ] Worldbuilding Mode (Places / Natural World / Local Context / Time & Sky /
      Gameplay / Campaign Tools).
- [ ] Basic / Detailed / Technical layers for every editor.
- [ ] Provenance and licensing review before any published setting pack data.

## 6. Gate 4 — Portable world data and temporal contexts

- [ ] WorldPackService (separate data classes; shared versioned schema; bounded
      sizes; Preview → Confirm → Atomic Commit; stale-preview token; Install/Update/
      Import; stable provenance; documented template; no imported text execution).
- [ ] Temporal contexts (explicit planar/regional time-rate contexts; preview plus
      reconciliation; no silent reversal of rests/effects/NPC history/combat/
      resources/real-world records; rules/lore presets distinct from mechanics;
      EffectAssist receives bounded semantic events).

## 7. Acceptance strategy

### Automated and structural

- [ ] Syntax parsing passes for `GameAssist`, `GameAssist.js`, and
      `GameAssist-v2.0.0`.
- [ ] Executable artifacts remain byte-identical.
- [ ] MECHSUITS banner, canonical tree, metadata, footers, and identifier
      literalism pass.
- [ ] Chronology boundary tests: final valid year, first invalid minute, leap
      rules, intercalary days, custom periods, weekday skipping, seasons, calendar
      switching.
- [ ] State migration, disable/re-enable, restart, rollback, stale preview, bounds,
      and malformed-input tests.
- [ ] Scene coherence tests: one authoritative value per field with field-level
      provenance.
- [ ] Import/parser tests prove bounded failure and atomicity.
- [ ] Focused Almanac tests before one consolidated GameAssist regression pass.

### Live Roll20

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
- `node --check GameAssist` and `node --check tests/almanac-gate0.test.js` pass.
- `maximumWorldMinute` no longer appears anywhere in the source.
- `getSubmoduleStatus()` now returns the explicit six-field configured-state
  object.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` are byte-identical after
  the edits.
- The VM harness is focused automated evidence only. Live Roll20 tests are still
  pending and remain the governing acceptance evidence for release.
