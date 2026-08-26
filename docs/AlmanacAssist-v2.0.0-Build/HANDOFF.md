# AlmanacAssist v2.0.0 — Build Handoff

**Prepared:** 2026-08-26 (America/New_York)

**Implementation status:** Issue #96 code program and the focused automated/structural checkpoint are complete.

**Release status:** **Not live-accepted or released.** Final live Roll20 validation remains open and has not been run.

This document is a practical restart/recovery guide for the AlmanacAssist **v2.0.0** build. It records what is present in the branch, what was deliberately not done, and how to verify or extend the work without weakening its safety boundaries.

---

## 1. Repository and branch identity

- Repository: `Mord-Eagle/GameAssist`
- Required Arena working branch: `arena/01a03c75-gameassist`
- Code implementation commit: `9c0a83a` — `feat(almanac): complete v2 world and temporal workflows`
- Remote branch was pushed as: `origin/arena/01a03c75-gameassist`
- The working implementation started from `ad5e0aa2eeb093b01349c530dbf050a1d096dc46`.
- The three executable artifacts must remain byte-identical:
  1. `GameAssist` — canonical source
  2. `GameAssist.js` — executable mirror
  3. `GameAssist-v2.0.0` — executable mirror with no JavaScript filename extension

### Tracker boundaries

- **Issue #95** is the governing source implementation issue. It was deliberately **not edited, commented on, closed, or otherwise modified**.
- **Issue #96** is the duplicate build tracker used for the implementation program.
- **Issue #94** remains the architectural destination for the live-world UX and RulesAdvisor direction.
- The active implementation name is always **AlmanacAssist v2.0.0**. Historical internal `1.x` checkpoint language is rollback history, not the active implementation version.

---

## 2. Current delivery state

| Area | State | Important qualification |
| --- | --- | --- |
| Gate 0 | Code and focused VM evidence complete | Final live disable/re-enable confirmation remains open. |
| Gate 1 | Code complete | The six systems, Session Mode surfaces, complete Wayfarer chat workflow, optional handout workflow, and snapshot presentation are built. Live UX proof remains open. |
| Gate 2 | Code complete | SceneResolver is read-only, defensive, provenance-aware, and covered by focused VM tests. |
| Gate 3 | Code complete | Generic Worldbuilding, location workflow, Travel, Phenomena, Presets, and RulesAdvisor are built. |
| Gate 4 | Code complete | Bounded atomic WorldPacks and explicit Temporal Contexts are built. |
| Automated/structural evidence | Complete | All 11 focused Almanac suites, syntax, mirror identity, diff check, manual surface, and targeted source-structure checks passed. |
| Live Roll20 release acceptance | **Open** | Do not claim it passed. It requires a disposable actual Roll20 campaign and the live tracks in `Smoketest.md`. |

---

## 3. What was implemented

### 3.1 Gate 0: preserved chronology and lifecycle contracts

- Preserved **one authoritative fictional-minute chronology**. No later work introduced a second ticking calendar or a per-context clock.
- Completed and verified the two narrow foundation repairs:
  - **#92:** Removed the `maximumWorldMinute()` full-range pre-scan. The bounded resolver still rejects unsupported calendar ranges without looping through years 1–9999 on every call.
  - **#93:** `getSubmoduleStatus()` consistently reports configured state for all six internal systems.
- Preserved valid saved disabled state. Re-enabling AlmanacAssist or an internal system does not rewrite valid saved configuration.
- Preserved case-insensitive close space/hyphen command variants. This includes the dashboard families and the new WorldPack/Temporal composite aliases.
- Added focused Gate 0 VM coverage for artifact identity, chronology boundaries, configured-state semantics, preserved disabled state, and aliases.

### 3.2 Gate 1: usable Almanac surfaces and the Wayfarer workflow

- Kept the six independently controlled systems: **Time, Climate, Astronomy, Weather, Environment, and Rest**.
- Built/retained compact Session Mode panels with Current World, Scene, quick time anchors, navigation, preview/announcement flow, and return paths.
- Routed dashboard, Scene, announcements, weather presentation, and rest context through one read-only scene snapshot so ordinary presentations do not contradict each other.
- Kept Rest as the only Almanac sheet-writing workflow, with preview, revalidation, explicit confirmation, and rollback-oriented safeguards for supported official 2014 sheets.
- Completed the Wayfarer chat workflow: draft/active separation, staged review, duplicate/rollback/reset, exact activation, and elapsed-time preservation.
- Added the optional advanced Wayfarer handout route:
  - `!aa-wayfarer export` writes one GameAssist-owned versioned calendar handout.
  - `!aa-wayfarer import --handout <id>` parses only bounded inert JSON.
  - Import preview and confirmation are stale-protected.
  - Confirmation atomically replaces **only the inactive saved draft**, resets review stages, and does not alter the active calendar or fictional time.
  - Unknown top-level and nested schema fields are refused rather than silently dropped.

### 3.3 Gate 2: read-only SceneResolver

- `GameAssist.AlmanacAssist.getScene()` returns a deeply immutable, defensive current-scene snapshot.
- It reports field-level provenance and bounded warnings rather than inventing provider facts.
- It separates authority boundaries:
  - Time owns fictional chronology and season.
  - Astronomy owns phases.
  - Weather owns its committed current weather and temperature.
  - Environment owns immediate context.
  - Worldbuilding contributes generic place composition.
  - Phenomena provide explicit overlay evidence only.
  - Travel exposes active reviewed journey evidence only.
  - Temporal Contexts expose local projection evidence only.
- It does not write provider state while resolving a scene.
- Technical scene output remains GM-only.

### 3.4 Gate 3: generic live-world tools

#### Worldbuilding Mode

- Added bounded generic owner-authored records for:
  - Region
  - Geography
  - Ecoregion
  - Biome
  - Location
  - Prepared Destination
  - Travel Route
  - Phenomenon
  - Session Preset
- Added category-oriented Worldbuilding Mode and consistent **Basic / Detailed / Technical** record-editor layers.
  - Basic keeps routine work compact.
  - Detailed exposes structured relationships and mechanics fields.
  - Technical exposes stable IDs, provenance, source-pack evidence, and guarded removal without normal-panel raw JSON.
- Added active Location selection, Favorites, and bounded Recents.

#### Prepared Destinations and Travel

- Prepared Destinations are Location-bound and reviewed before changing the active Location.
- The review explicitly preserves Weather, Environment overrides, Astronomy, and fictional time ownership.
- Travel supports routes or direct estimates, bounded paces, retained journeys, review-before-start, review-before-segment, accepted-only fictional time advancement, accepted-only arrival location changes, cancellation, stale review protection, and bounded history.

#### Phenomena

- Added bounded owner-authored Phenomenon definitions and explicit active overlays.
- Activation/deactivation is reviewed and stale-protected.
- Optional expiration uses fictional time, but elapsed overlays are retained until explicit cleanup; no automatic destructive cleanup occurs.
- Phenomena remain descriptive visibility/terrain/travel evidence and never overwrite Weather, Environment, Astronomy, Climate, or Time.

#### PresetRegistry and RulesAdvisor

- Added immutable generic versioned built-in session templates and review-before-install campaign clones.
- Campaign clones retain stable identity and provenance and remain independently editable.
- Added optional, profile-specific, advisory-only RulesAdvisor reminders derived from the scene snapshot.
- RulesAdvisor never applies damage, conditions, movement, saves, resources, marker changes, tracker changes, or provider state.

### 3.5 Gate 4: WorldPacks and Temporal Contexts

#### WorldPacks

- Added a separate WorldPack data class with owned handout template/export/import workflows.
- Parser work is bounded and inert; imported text is never executed.
- Validation covers syntax, document/schema shape, references, provenance, dependencies, conflicts, and policy bounds.
- Imports stop at Preview → stale-protected Confirm → atomic Worldbuilding-plus-registry commit.
- Supports New, Update, and Copy behavior:
  - New/Copy do not overwrite campaign records.
  - Update requires a higher version and refuses imported records changed by campaign customization.
- Packs do not import runtime state, provider state, fictional time, weather, astronomy, or gameplay effects.

#### Temporal Contexts

- Added an immutable canonical **Prime Context** and bounded owner-authored Regional/Planar contexts.
- Contexts are rate-and-offset projections of the one canonical fictional-minute chronology, not independent clocks.
- Prime is protected from rename, description, tags, kind, rate, offset, and removal changes through normal commands and persisted-config validation.
- Context editors use Basic/Detailed/Technical layers.
- Transition preview shows departure/destination projections, canonical elapsed minutes, local reconciliation, expiry, and stale protection.
- Confirmation:
  - advances only canonical fictional time,
  - switches the active context,
  - records bounded reconciliation history,
  - emits bounded `almanac.temporal.transition` semantic events.
- It does **not** reverse/write Rest, EffectAssist records, NPC history, combat, resources, providers, Location, or real-world records.

---

## 4. Critical safety and migration work

### 4.1 Unknown/future state policy

The implementation deliberately treats newer state as warning-only. It must not silently normalize, expire, reinterpret, or erase data an older build cannot understand.

Protected future-state paths include:

- Worldbuilding configuration
- Worldbuilding runtime (`runtime.world`)
- WorldPack configuration and transient review runtime
- Temporal Context configuration and runtime
- Wayfarer import runtime
- Known newer Phenomenon activation records
- RulesAdvisor configuration where applicable

### 4.2 The final `runtime.world` audit

This was the last identified non-live code risk and is now closed.

Before the final hardening, `ensureAlmanacRuntime()` rebuilt `runtime.world` unconditionally. A future `runtime.world.schemaVersion` could therefore have been destructively normalized merely by startup or a display path.

The current behavior is:

1. A future `runtime.world` is preserved byte-for-byte during startup/runtime initialization.
2. `worldRuntimeResult()` identifies it as unavailable with a clear warning.
3. SceneResolver exposes `WORLD_RUNTIME_UNAVAILABLE` and does not derive Travel or Phenomena from it.
4. Status and Worldbuilding read panels describe the preservation state without dereferencing unknown nested fields.
5. Location, Travel, Phenomena, Preset, Worldbuilding mutation, WorldPack import/confirm, and World rules-profile changes are blocked while that runtime is unknown.
6. The focused Worldbuilding and conservative migration tests prove both preservation and mutation refusal.

This behavior is intentionally conservative. Do not replace it with a repair/normalization path without a documented schema migration and dedicated regression coverage.

### 4.3 No raw JSON in normal panels

- Normal GM panels, Worldbuilding cards, editors, and status panels do not dump raw JSON.
- The only editable JSON surfaces are explicitly owned handouts for the advanced Wayfarer and WorldPack workflows.
- Those handouts are bounded, inert data with review-before-commit behavior.

---

## 5. Files that matter

| Path | Purpose |
| --- | --- |
| `GameAssist` | Canonical Roll20 source. Make all source changes here first. |
| `GameAssist.js` | Mirror; copy canonical source here after every source change. |
| `GameAssist-v2.0.0` | Mirror; copy canonical source here after every source change. Syntax must be checked via stdin because its filename extension is not `.js`. |
| `tests/almanac-gate0.test.js` | Shared isolated Roll20-shaped VM harness plus Gate 0 checks. Its harness accepts a historical state fixture for migration testing. |
| `tests/almanac-scene-resolver.test.js` | SceneResolver no-write/immutability/provenance coverage. |
| `tests/almanac-worldbuilding.test.js` | Generic records, editor layers, future config/runtime preservation, and mutation-block checks. |
| `tests/almanac-travel.test.js` | Prepared Destination and reviewed Travel checks. |
| `tests/almanac-phenomena.test.js` | Phenomena scope, expiry, review, cleanup, and preservation checks. |
| `tests/almanac-presets.test.js` | PresetRegistry clone/install checks. |
| `tests/almanac-rules-advisor.test.js` | Advisory-only RulesAdvisor checks. |
| `tests/almanac-worldpacks.test.js` | Bounded WorldPack parser/review/atomicity/future-runtime/alias checks. |
| `tests/almanac-temporal-contexts.test.js` | Temporal context, Prime immutability, projection, transition, event, stale, and future-state checks. |
| `tests/almanac-wayfarer-handout.test.js` | Inert Wayfarer handout export/import/review/atomicity checks. |
| `tests/almanac-migration.test.js` | Historical fixture: additive migration, exact Wayfarer starter migration, and future config/runtime preservation. |
| `README.md`, `ROADMAP.md`, `CHANGELOG.md` | Public/current behavior documentation. |
| `Smoketest.md` | Final real-Roll20 acceptance checklist. Its Almanac section is eligible but still unexecuted. |
| `docs/AlmanacAssist-v2.0.0-Build/ASSESSMENT.md` | Scope/architecture/status assessment. |
| `docs/AlmanacAssist-v2.0.0-Build/IMPLEMENTATION_PLAN.md` | Gate-by-gate plan and exact automated evidence. |
| `docs/AlmanacAssist-v2.0.0-Build/HANDOFF.md` | This durable restart/recovery summary. |

---

## 6. Exact automated verification evidence

The following passed at the final code checkpoint:

```bash
node tests/almanac-gate0.test.js
node tests/almanac-scene-resolver.test.js
node tests/almanac-worldbuilding.test.js
node tests/almanac-travel.test.js
node tests/almanac-phenomena.test.js
node tests/almanac-presets.test.js
node tests/almanac-rules-advisor.test.js
node tests/almanac-worldpacks.test.js
node tests/almanac-temporal-contexts.test.js
node tests/almanac-wayfarer-handout.test.js
node tests/almanac-migration.test.js

node --check GameAssist
node --check GameAssist.js
node --check < GameAssist-v2.0.0

cmp GameAssist GameAssist.js
cmp GameAssist GameAssist-v2.0.0
git diff --check
```

Also passed:

- A targeted structural check for balanced canonical source section markers, the canonical-tree Almanac identifier, and active Almanac section metadata/footer.
- A manual surface check proving that `!Almanac-Manual` produces a handout containing Temporal Context, Wayfarer handout, and editor-layer guidance.

### Important test interpretation

These are isolated Node/VM checks. They prove implementation boundaries and regression contracts, **not** Roll20 UI rendering, prompts, API sandbox behavior, real sheet-worker behavior, or release acceptance.

There is no separate broader repository test runner in this checkout. The 11 focused Almanac suites are the complete current automated test collection for this work.

---

## 7. Live validation: the only remaining release phase

No live Roll20 validation has started. This was intentional: the user required all Issue #96 code before spending time in a live sandbox.

When a disposable real Roll20 campaign is available, use the **Focused v2.0.0 Complete AlmanacAssist Acceptance** section in `Smoketest.md`. It includes checks for:

- A nontrivial Wayfarer calendar through chat controls only
- Every generated button and prompt
- Session Mode common actions within one or two screens
- Off/Descriptive/Detailed/Technical output and announcement presets
- Climate/weather/environment/astronomy coherence
- Individual internal-system and parent-module disable/re-enable behavior
- Rest transactions and stale/rollback behavior on supported 2014 sheets
- Safe refusal on unsupported sheets
- Large fictional time jumps
- GM-only technical evidence staying out of public output
- The WorldPack, Temporal Context, layered editor, and Wayfarer handout paths

Do not mark the implementation as a live Roll20 release until those checks are actually recorded as passed in a real campaign.

---

## 8. Safe resumption checklist

1. **Stay on the Arena branch.** Do not switch to, create, or push another branch.
2. Confirm the remote branch contains `9c0a83a` or its descendant.
3. Confirm the three executable artifacts are identical before testing or committing source work.
4. If changing canonical source:
   ```bash
   node --check GameAssist
   cp GameAssist GameAssist.js
   cp GameAssist GameAssist-v2.0.0
   node --check GameAssist.js
   node --check < GameAssist-v2.0.0
   cmp GameAssist GameAssist.js
   cmp GameAssist GameAssist-v2.0.0
   ```
5. Run the full 11-suite focused collection after any meaningful Almanac change.
6. Preserve the future-state refusal policy. Add a focused test before changing a migration or normalization path.
7. Do not begin live Roll20 work until using a disposable campaign and the final checklist deliberately.
8. Do not modify Issue #95.
9. Before a new commit, run `git diff --check`; then commit/push only `arena/01a03c75-gameassist`.

---

## 9. Non-goals and guardrails that must remain true

- No second fictional chronology or hidden context clock.
- No raw JSON in ordinary panels.
- No bundled published-setting lore or unreviewed setting packs.
- No imported text execution.
- No silent gameplay writes from SceneResolver, Worldbuilding, WorldPacks, Phenomena, RulesAdvisor, or Temporal Contexts.
- Rest is the sole initial Almanac sheet-writing workflow and remains transactional.
- No automatic reversal of Rest, effects, NPC history, combat, resources, providers, Location, or real-world state when time moves backward or a temporal context changes.
- No live Roll20 acceptance claim based solely on VM evidence.

---

## 10. Short status statement for a new thread

> AlmanacAssist **v2.0.0** has the complete Issue #96 code program on `arena/01a03c75-gameassist`, including SceneResolver, layered generic Worldbuilding, Prepared Destinations, reviewed Travel, Phenomena, PresetRegistry, advisory-only RulesAdvisor, atomic WorldPacks, immutable Prime plus regional/planar Temporal Contexts, and optional stale-safe Wayfarer handout editing. All focused automated/structural checks passed, including future `runtime.world` preservation and mutation blocking. Issue #95 was not touched. The only remaining release work is final live Roll20 acceptance in a disposable campaign; it has not started.
