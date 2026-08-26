# AlmanacAssist 2.0 — Issue Assessment and Comparison

- Build branch: `AlmanacAssist-v2.0.0-Build`
- Source baseline: duplicate of `75-v2.0.0-effectassist` (`e08cb36`)
- Assessment date: 2026-08-26
- Source implementation master: **#95 — AlmanacAssist 2.0 implementation master: coherent world engine and live-play UX** (left unchanged)
- Build tracking copy: **#96 — AlmanacAssist 2.0 implementation master: coherent world engine and live-play UX (Build tracking)**
- Architectural destination: **#94 — AlmanacAssist redesign v2.0.0**

## 1. Purpose

This document reviews every GitHub issue related to AlmanacAssist, compares them
against the current implementation master (#95), and records the guardrails and
guidance used on the `AlmanacAssist-v2.0.0-Build` branch. The branch is a duplicate
of the existing `75-v2.0.0-effectassist` branch. It does **not** modify that branch
or `main`.

## 2. Issue inventory

| Issue | Title | State | Category |
| --- | --- | --- | --- |
| #95 | AlmanacAssist 2.0 implementation master: coherent world engine and live-play UX | Open | Source implementation master (left unchanged) |
| #96 | AlmanacAssist 2.0 implementation master: coherent world engine and live-play UX (Build tracking) | Open | Build tracking copy of #95 |
| #94 | AlmanacAssist redesign v2.0.0 | Open | Architectural destination |
| #62 | AlmanacAssist master: Build six interoperable campaign-world submodules | Open | Original master |
| #66 | AlmanacAssist Phase 1: Build TimeAlmanac | Open | Child of #62 |
| #67 | AlmanacAssist Phase 2: Build ClimateAlmanac | Open | Child of #62 |
| #68 | AlmanacAssist Phase 3: Build AstronomyAlmanac | Open | Child of #62 |
| #69 | AlmanacAssist Phase 4: Build WeatherAlmanac | Open | Child of #62 |
| #70 | AlmanacAssist Phase 5: Build EnviroAlmanac | Open | Child of #62 |
| #71 | AlmanacAssist Phase 6: Build RestAlmanac | Open | Child of #62 |
| #89 | AlmanacAssist: Rebuild Wayfarer custom-calendar setup and documentation | Open | UX / Wayfarer |
| #90 | AlmanacAssist: Complete custom-calendar and world-context UX | Open | Live UX gate |
| #80 | EffectAssist: Add optional duration providers | Closed | Cross-module contract |
| #82 | Post-v2.0: Expand EffectAssist spell-specific adapters and catalog | Open | Deferred, EffectAssist |
| #91 | v2.x: Centralize character-sheet capability detection and 2014/2024 adapter policy | Closed | Shared contract |
| #92 | [AlmanacAssist] Remove redundant full-range chronology scan from `resolveWorldMinute()` | Open | Narrow repair |
| #93 | [AlmanacAssist] Make `getSubmoduleStatus()` consistently report configured subsystem state | Open | Narrow lifecycle repair |
| #81 (PR) | Draft: GameAssist v2.0.0 — EffectAssist, HealAssist, AttackAssist, AlmanacAssist, and HealthService | Open | Development PR |

## 3. Current repository baseline

The `75-v2.0.0-effectassist` branch contains:

- A single Roll20 script implemented in `GameAssist`, `GameAssist.js`, and
  `GameAssist-v2.0.0` (all byte-identical at the branch head).
- AlmanacAssist at **module version 1.6.1**, implemented as one GameAssist module
  with six independently toggleable internal systems:
  **Time, Climate, Astronomy, Weather, Environment, Rest**.
- A complete Wayfarer custom-calendar manager, action-first GM dashboard,
  announcement presets (Quick / Calendar / Travel / Everything) with per-field
  Off / Descriptive / Detailed / Technical control, direct calendar and moon
  editors, climate/region management, weather forecasts and locks, environment
  overrides, and transactional 2014-sheet Rest writes.
- The `GameAssist.AlmanacAssist` public API: `version`, schema versions,
  `isAvailable()`, `isTimeAvailable()`, `getSubmoduleStatus()`, `getTime()`,
  `getClimate()`, `getAstronomy()`, `getWeather()`, `getEnvironment()`,
  `getRestHistory()`, `observe(...)`, and `clearObservers(...)`.

AlmanacAssist is **not** yet at the #95 / #94 destination. It is a coherent
six-system prototype; it is not yet a SceneResolver-centered engine with
Region / Geography / Ecoregion / Biome / Location / Environment / Phenomena /
Travel / PresetRegistry / WorldPackService / temporal contexts.

## 4. Assessment by issue

### #95 — Implementation master

**What it is:** The authoritative delivery issue for AlmanacAssist 2.0. It curates
#94 as the architectural destination, preserves the modular contracts of #62 and
#66–#71, adopts the live UX findings of #89 and #90, and keeps #92 and #93 as
narrow, independently verifiable repairs.

**Assessment:** Suitable governing issue. It already:
- treats #94 as the architectural destination;
- preserves the six-system safety contracts;
- adds Gates 0–4 with acceptance strategy;
- includes GameAssist guardrails and live Roll20 acceptance evidence;
- keeps configuration/lifecycle semantics and state safety explicit.

**Gap to close on the Build branch:** The branch must implement the gates in order,
preserve the existing 1.6.1 rollback baseline, and never claim the broader
2.0 program complete until the live Roll20 acceptance track passes.

### #94 — Redesign v2.0.0

**What it is:** The conceptual destination. It introduces the two-speed UX
(Session Mode / Worldbuilding Mode), SceneResolver, the expanded world-domain
model (Astronomy, Biome, Climate, Ecoregion, Environment, Geography, Location,
Phenomena, Region, Rest, Time, Travel, Weather), PresetRegistry, RulesAdvisor,
progressive disclosure, field-level provenance, and the principles of composition
rather than overrides.

**Assessment:** #95 correctly inherits this. Its requirements appear in Gates 1–4.
The Build branch must not replace the world-domain model with a presentation-only
patch; the SceneResolver authority is the central architectural requirement.

### #62 and #66–#71 — Original master and six phases

**What they are:** The original modular contracts. Each child phase is narrowly
scoped and independently toggleable; each is useful with the others disabled.

**Assessment:** The current 1.6.1 source already satisfies a large share of these
contracts (independent toggles, bounded state, optional context, no hidden
prerequisites, transactional Rest, preserved disabled state). #95 preserves these
contracts. The Build branch must keep each system independently useful and should
not introduce hidden prerequisites (for example, Travel must not require Weather
or Location to be enabled before Time works).

### #89 — Wayfarer custom-calendar setup

**What it is:** Guided Wayfarer setup, draft/active separation, preview,
validation, elapsed-time preservation, rollback, and documentation.

**Assessment:** The current source already implements the guided Wayfarer workflow
with a persistent draft, staged setup, atomic activation, elapsed-time-preserving
edits, and command-only reset. The live Roll20 acceptance track remains the
remaining gate. #95 preserves these requirements under Gate 1.

### #90 — Custom-calendar and world-context UX

**What it is:** The live Roll20 usability gate for Wayfarer, announcements,
climate/weather/environment authority, astronomy, rests, and recovery.

**Assessment:** Partially implemented in 1.6.1; the live acceptance checks remain
open. #95 uses #90 as the first release gate. The Build branch must not mark the
world-context UX complete until the live sandbox runs pass.

### #92 — Remove redundant chronology pre-scan

**What it is:** Remove the unconditional years-1-through-9999 traversal performed
by `maximumWorldMinute()` on every `resolveWorldMinute()` call, and the
`maximumWorldMinute()` helper if it is no longer used.

**Assessment:** Narrow and safe. It preserves chronology semantics, the elapsed
fictional-minute model, the supported year range, and calendar definitions. The
existing year-resolution loop already rejects values beyond `maximumYear`, so the
pre-scan is redundant. No cache should be added.

**Status on this branch:** **Implemented.** See `IMPLEMENTATION_PLAN.md`.

### #93 — Consistent `getSubmoduleStatus()` semantics

**What it is:** `getSubmoduleStatus()` currently mixes effective runtime
availability for `time` (`timeAvailable()`) with configured-state for the other
five systems. It should consistently report configured subsystem state for all
six, while parent availability remains available through `isAvailable()` and
`isTimeAvailable()`.

**Assessment:** Narrow and correct. The change preserves parent lifecycle behavior,
does not add a generalized `submoduleAvailable()` helper, and does not force
read-only getters to return `null` when the parent is disabled.

**Status on this branch:** **Implemented.** See `IMPLEMENTATION_PLAN.md`.

### #91 — Sheet capability detection

**What it is:** Centralize character-sheet capability detection and 2014/2024
adapter policy. RestAlmanac is one consumer.

**Assessment:** #91 is closed. The shared `SheetCapabilities` contract exists in
the baseline. RestAlmanac must continue to write only through verified sheet
capabilities and fail locally on unsupported sheets without partial writes.

### #80 — EffectAssist duration providers

**What it is:** EffectAssist may consume committed Almanac time events, but it
does not own effect expiration. AlmanacAssist publishes bounded semantic events.

**Assessment:** The baseline already publishes `almanac.time.changed` events and
EffectAssist consumes them without granting AlmanacAssist expiration ownership.
The Build branch must preserve this boundary when adding Travel and temporal
contexts.

### #82 — Post-v2.0 EffectAssist adapter expansion

**What it is:** Deferred spell-specific EffectAssist adapters. It is not an
AlmanacAssist requirement and is out of scope for the Build branch.

### #81 (PR) — Development PR

**What it is:** The existing GameAssist v2.0.0 development PR that contains the
current AlmanacAssist 1.6.1.

**Assessment:** The Build branch duplicates this development line rather than
pushing directly to PR #81. The release gate remains a live Roll20 acceptance
track. Generic PR checks must not be treated as a substitute for real Roll20
verification.

## 5. Is #95 based on #94 and does it include the other issues?

Yes. #95 explicitly:

- names #94 as the architectural destination and **re-uses** its two-speed UX,
  SceneResolver-centered world model, prepared destinations, favorites/recents,
  travel, phenomena, PresetRegistry, RulesAdvisor, WorldPackService, and temporal
  contexts;
- preserves the modular contracts and independent controls of the original master
  (**#62**, **#66–#71**);
- carries forward the Wayfarer and world-context UX requirements from **#89** and
  **#90**;
- keeps **#92** and **#93** as narrow, closed-scope repairs;
- keeps cross-module boundaries from **#80** and **#91**;
- adds explicit GameAssist guardrails, acceptance strategy, and a definition of
  done that does not rely on mechanical tests alone.

The Build branch therefore treats #95 as the implementation master and #94 as the
architectural destination, with the original modular contracts and live UX issues
as preserved inputs.

## 6. Guardrails for maximum GameAssist compatibility

The following guardrails consolidate #95 and the repo's existing contracts. Every
change on the Build branch must satisfy them.

1. **One GameAssist module.** AlmanacAssist remains one registered module. Its
   internal systems (Time, Climate, Astronomy, Weather, Environment, Rest) and
   future services (SceneResolver, PresetRegistry, RulesAdvisor, WorldPackService)
   are internal, not separate installed Mods.
2. **Independent controls preserved.** Internal systems remain independently
   toggleable where the contract requires it. Disabling one system must not delete
   its valid configuration or runtime state, and must not disable unrelated
   systems.
3. **Preserved state on disable.** Disabling AlmanacAssist or a subsystem conserves
   valid saved configuration and runtime state. `getSubmoduleStatus()` reports
   configured subsystem state, not parent lifecycle state.
4. **State / runtime separation.** Parent availability is `isAvailable()`.
   Effective Time availability is `isTimeAvailable()`. Do not add generalized
   effective-availability helpers without a real consumer.
5. **Bounded state and bounded work.** All collections, histories, forecasts,
   presets, locations, routes, events, imports, observers, and confirmations stay
   bounded in `POLICY`. Large time jumps stay bounded and publish one committed
   semantic event rather than replaying every minute.
6. **One current-scene authority.** Session Mode, announcements, forecasts, travel,
   rest context, and public APIs consume the same `SceneResolver` snapshot. No
   public scene representation is derived independently.
7. **Composition, not overrides.** Climate, Biome, Environment, Geography, Weather,
   Astronomy, and Location describe different dimensions. One domain does not
   silently replace another.
8. **Persistent facts vs transient events.** Geography, Climate, Biome, Hydrology,
   and Astronomy are persistent. Weather and Environment conditions are transient.
   A blizzard does not turn a biome into tundra.
9. **Presentation never changes facts.** Descriptive / Detailed / Technical are
   different renderings of the one resolved scene.
10. **No external runtime dependency.** AlmanacAssist must function inside the
    Roll20 Mod sandbox without Fantasy Calendar or another hosted service.
11. **Roll20-supported interaction.** Commands and buttons use supported Roll20
    syntax, avoid raw JSON on ordinary screens, keep cards narrow, avoid
    horizontal scrolling, and are tested in the live sandbox.
12. **No silent gameplay writes.** Other world systems remain descriptive. Only
    Rest performs Almanac-owned character-sheet writes, through verified sheet
    capabilities, with preview, revalidation, and transactional confirmation.
    RulesAdvisor advises; it never silently applies damage, exhaustion, movement,
    saves, conditions, markers, or tracker changes.
13. **Cross-module ownership boundaries preserved.**
    - `GameAssist.Time` owns real-world table timestamps.
    - NPCAssist Session dates stay real-world.
    - CombatAssist owns turns/rounds.
    - EffectAssist owns effect endings; AlmanacAssist supplies committed time
      events only.
    - RestAlmanac consumes SheetCapabilities and HealthService where safe.
14. **Conservative migration.** 1.6.1 remains the rollback baseline. Migrate only
    data whose meaning remains trustworthy. Do not destructively reinterpret
    legacy state in place. Unknown state remains warning-only.
15. **Identifier literalism and metadata consistency.** Existing identifiers,
    MECHSUITS tags, canonical tree, section metadata, versions, and Notes &
    Comments change together when a meaningful change is made. Maintenance-only
    edits preserve `last_updated_version` and add a Maintenance footer entry.
16. **Documentation and tests track accepted behavior.** README, roadmap, changelog,
    smoke tests, MECHSUITS metadata, and One-Click metadata describe only
    completed phases. Focused Almanac tests run before a consolidated GameAssist
    regression pass.

## 7. Build-branch scope and current status

- **Branch created:** `AlmanacAssist-v2.0.0-Build`, duplicated from
  `origin/75-v2.0.0-effectassist`.
- **Gate 0 #92:** Implemented (redundant chronology pre-scan removed).
- **Gate 0 #93:** Implemented (`getSubmoduleStatus()` reports configured state).
- **Focused Gate 0 harness:** `tests/almanac-gate0.test.js` boots the shipped
  artifact in an isolated Roll20-shaped Node VM and verifies artifact identity,
  #92 boundaries, #93 configured state, saved-state preservation, and close
  command aliases. It is not a substitute for live Roll20 acceptance.
- **Assessment / plan documents:** Added under `docs/AlmanacAssist-v2.0.0-Build/`.
- **Not yet implemented:** Gates 1–4, SceneResolver, the expanded world-domain
  model, PresetRegistry, WorldPackService, temporal contexts, unknown-state
  warning-only handling, and the full live Roll20 acceptance track.

## 8. Decisions and rationale

- Keep the source version at `1.6.2` rather than claiming `2.0.0` before the
  architectural work is complete. This avoids announcing an incomplete 2.0 engine
  and preserves a trustworthy rollback baseline.
- Keep all three executable artifacts byte-identical (`GameAssist`,
  `GameAssist.js`, `GameAssist-v2.0.0`) as required by the repo's guardrails.
- Do not add a chronology cache in #92; the issue explicitly forbids it without
  measured need.
- Do not add a generalized `submoduleAvailable()` in #93; the issue explicitly
  rejects it without a real consumer.
- Keep the Almanac changes confined to AlmanacAssist and directly affected
  services, docs, metadata, and tests until a consolidated regression pass.
