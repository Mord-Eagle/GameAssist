# AlmanacAssist v2.0.0 — Build Handoff

**Prepared:** 2026-08-26 (America/New_York)

**Implementation status:** **Active live-product recovery.** The earlier “Issue #96 code program complete” assessment was incorrect: a real Roll20 exploratory launch proved that a fresh GM could reach empty/dead-end setup paths and an incomplete Climate prompt. The framework and prior automated contracts remain useful, but they are not a complete usable product.

**Release status:** **Not live-accepted or released; not eligible for formal acceptance.** One exploratory real-Roll20 launch has occurred and exposed blockers. Formal acceptance must restart only after the first-run/starter-content and prompt/menu repairs have focused automated coverage and receive a fresh real-Roll20 usability pass.

This document is a practical restart/recovery guide for the AlmanacAssist **v2.0.0** build. It records what is present in the branch, what live evidence invalidated the prior completion claim, and how to repair or extend the work without weakening its safety boundaries.

---

## 1. Repository and branch identity

- Repository: `Mord-Eagle/GameAssist`
- Required Arena working branch: `arena/01a03c75-gameassist`
- Code implementation commit: `9c0a83a` — `feat(almanac): complete v2 world and temporal workflows`
- Remote branch was pushed as: `origin/arena/01a03c75-gameassist`
- The working implementation started from `ad5e0aa2eeb093b01349c530dbf050a1d096dc46`.
- The intended release artifact contract is byte-identical executables:
  1. `GameAssist` — canonical active source
  2. `GameAssist.js` — executable mirror
  3. `GameAssist-v2.0.0` — executable mirror with no JavaScript filename extension

  **Current recovery boundary:** the two mirrors are known stale and have broad
  pre-existing differences. Do **not** synchronize them during the current
  canonical-source recovery pass. Their identity guard is expected to fail until
  an explicit artifact-convergence pass is planned; focused canonical VM checks
  may bypass only that assertion locally and never treat the bypass as release
  evidence.

### Tracker boundaries

- **Issue #95** is the governing source implementation issue. It was deliberately **not edited, commented on, closed, or otherwise modified**.
- **Issue #96** is the duplicate build tracker used for the implementation program.
- **Issue #94** remains the architectural destination for the live-world UX and RulesAdvisor direction.
- The active implementation name is always **AlmanacAssist v2.0.0**. Historical internal `1.x` checkpoint language is rollback history, not the active implementation version.

---

## 2. Current delivery state

| Area | State | Important qualification |
| --- | --- | --- |
| Gate 0 | Focused VM evidence retained; source warning repair implemented | The false-positive retained-`Core` state warning is covered without silencing genuinely unknown branches. Final live startup/disable-reenable confirmation remains open. |
| Gate 1 | **Active recovery** | A real launch found incomplete prompt rendering and first-run dead ends. Every generated control needs focused prompt/render coverage and a usable visible outcome. |
| Gate 2 | Focused VM evidence retained | SceneResolver safety contracts remain valuable, but “Location unassigned” is not acceptable as the only fresh-campaign experience when no onboarding is offered. |
| Gate 3 | **Active recovery** | Generic record architecture exists, but a fresh GM needs included selectable starter worlds, active-world switching, usable Locations, Climate regions, destinations, routes, and presets. |
| Gate 4 | Focused VM evidence retained | WorldPacks and Temporal Contexts remain bounded advanced tools; they must not be an excuse to ship an empty campaign. |
| Automated/structural evidence | Historical checkpoint plus active additions | Earlier 11-suite passing evidence does not prove rendered Roll20 controls. Add focused recovery coverage before another live checkpoint. |
| Live Roll20 release acceptance | **Blocked / not eligible** | One exploratory launch exposed product blockers. Do not restart formal acceptance until they are repaired and covered. |

---

## 2.1 Confirmed live-product blockers and recovery direction

The first real Roll20 exploratory run did **not** crash, but it invalidated the prior “complete code program” handoff. The GM reported:

- startup warning: `Unexpected state branch: Core` (now reproduced and repaired in source/focused VM by recognizing retained registered internal namespaces; it still needs fresh Roll20 startup confirmation);
- no active Location, no Locations/Favorites/Recents/Prepared Destinations, and Travel blocked with no clear first-launch recovery;
- Scene/Scene Details showing generic provider values while the Location remained unassigned;
- Climate limited to `Temperate Lowlands` with no practical world/profile selection path;
- Climate **Add Region** rendering as `!aa-climate region add --name` and returning the missing-name/profile error;
- no included usable default world collection, despite the product needing practical starter content rather than an empty WorldPack-first framework.

Recovery work must prioritize the fresh-GM journey: World Library/Starter Worlds → active Location → Scene → Climate/Weather/Environment → Travel → editable Worldbuilding records. Included content must be owner-authored generic material or separately license-reviewed; it may not copy published-setting lore. A button is only complete when it opens a complete Roll20 prompt (where needed), does not ask for a hidden identifier, and gives a visible result.

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

#### Climate, Weather, and Environment coherence recovery

- The effective current-Scene Climate is explicit and read-only: direct active Location relation, then active Ecoregion relation, then campaign fallback. A Location move does not rewrite the Climate selector, committed Weather, or Environment owner state.
- `!aa-climate`, Current Scene, dashboard/status, default `getClimate()`, and `almanac.climate.changed` events report that same effective baseline and carry the campaign fallback separately. Their stable coarse scope remains `location`, `ecoregion`, or `campaign`; separate source-kind evidence distinguishes a direct Climate region from a WorldPack Climate Profile without breaking existing consumers. Explicit `getClimate(region)` remains a named-region lookup.
- Generated and manual Weather record the effective source. If a Location move makes stored Weather old-region evidence, Weather and Scene Details retain/flag it until a GM chooses Generate or the visible **Set Manual Conditions** path.
- Before any Weather is committed, EnviroAlmanac follows the active Location’s default context so Environment agrees with Scene. A Climate region referenced by active Worldbuilding cannot be removed until the named Location/Ecoregion relation is reassigned or cleared.
- Focused source coverage includes direct Location, Ecoregion-only, and campaign-fallback Climate paths, manual provenance, retained mismatch, environment parity, semantic-event payloads, removal guards, and decoded ordinary-screen target checks. A real Roll20 renderer still has final authority.

### 3.4 Gate 3: generic live-world tools

#### Worldbuilding Mode

**Recovery addition in progress:** the branch now contains an owner-authored generic Starter World collection (Ember Coast, Sunward Expanse, Frostfall Marches, and Mirewood Basin), a World Library that saves/switches compatible active world context, first-run routing from Worldbuilding/Location/Travel/Scene, direct first-Location activation, climate-region selection, guided page/handout references, ordinary Weather manual/history controls, and a broad decoded target audit of ordinary starter screens. The audit now exercises each first-level visible query choice as well as defaults, requires a recovery control on generated refusal/no-change results, applies a bounded Almanac Home fallback when an otherwise actionless attention panel remains, keeps known-incompatible GameAssist-owned WorldPack and Wayfarer handouts out of each other’s picker, constrains picker labels/IDs before Roll20 decodes query syntax, and covers selected-token Rest previews/confirmation. These are implementation repairs under focused regression coverage, **not** a claim of completed live usability or formal acceptance.

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
- Added complete setting-scale Worldbuilding catalog access for every record type:
  ordinary named collection controls render a name-sorted 12-entry page with
  Previous/Next, name/tag Search, and direct **Edit** actions. Browsing/searching
  is read-only and does not require a GM to recover a Technical stable ID.
- **Current canonical-source recovery addition:** editor relations now use the same
  complete bounded named catalog rather than an inline Roll20 option query. This
  covers Worldbuilding hierarchy/endpoints, Climate and Roll20 page assignment,
  installed-palette profile bindings, Session Preset overlays, and Route Leg
  Travel Profile/intermediate-Location choices. It prevents a distant record from
  disappearing after the first twelve choices and avoids oversized dynamic links;
  the picker itself is read-only and delegates any selection to the existing
  guarded setter or atomic Route Leg split path. The rich Route Leg editor pages
  four legs at a time (the generic chooser page remains twelve choices), and a
  Route with explicit legs replaces endpoint-change controls with a direct
  Route-Leg recovery path rather than offering a known refusal button.
- **Current canonical-source recovery addition:** Phenomena and Presets Session
  roots now disclose their complete campaign counts but retain only three compact
  representative rows. Their direct **Browse**/**Search** catalogs retain every
  campaign definition/preset in 12-entry name/tag pages, with the original
  reviewed-activation or read-only-preview action still authoritative. The
  active-location scoped installed Phenomenon Template list receives the same
  bounded clone-review catalog; browsing alone does not create a definition or
  activate an overlay.

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
- Added four immutable, original, legally distributable setting-scale sources:
  **Asterfall Concord**, **Veyra Turning**, **Narthvale Compact**, and **Lumenfen Atlas**. Each installs as an editable campaign-owned clone with 160 Locations, 215 Routes, 24 Prepared Destinations, 24 Phenomena, hierarchical geography, and typed palette data; the compact Ember Coast/Sunward Expanse/Frostfall Marches/Mirewood Basin concepts remain subordinate local material rather than advertised full worlds.
- Parser work is bounded and inert; imported text is never executed.
- The installed-palette root summarizes typed collection counts and routes each
  collection, default binding, and cross-palette reference through a separate
  name/tag-searchable 12-entry picker. Every palette collection has an explicit
  160-record state/import/addition boundary; an Ecoregion Profile's selected
  Phenomenon Templates are retained canonically as an array rather than a
  malformed one-value text field.
- **Current canonical-source recovery addition:** the WorldPacks hub now discloses
  the full installed-clone count and opens a complete, read-only Installed catalog
  rather than silently showing only its first eight records or constructing one
  all-pack palette query. The catalog pages six rich provenance/palette rows,
  supports name/provenance Search, provides a direct matching-palette action, and
  limits source-update controls to a direct source clone rather than a separately
  imported copy.
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

### 4.2 `runtime.world` future-state safety

This is a retained safety contract. It is not evidence that the wider live-product recovery is closed.

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
| `GameAssist.js` | Known-stale executable mirror. Do not synchronize during the canonical recovery pass; identity is deferred to an explicit convergence gate. |
| `GameAssist-v2.0.0` | Known-stale executable mirror. Do not synchronize during the canonical recovery pass; when convergence is authorized later, syntax must be checked via stdin because its filename extension is not `.js`. |
| `tests/almanac-gate0.test.js` | Shared isolated Roll20-shaped VM harness plus Gate 0 checks. Its harness accepts a historical state fixture for migration testing. |
| `tests/almanac-scene-resolver.test.js` | SceneResolver no-write/immutability/provenance coverage. |
| `tests/almanac-worldbuilding.test.js` | Generic records, editor layers, future config/runtime preservation, and mutation-block checks. |
| `tests/almanac-starter-worlds.test.js` | Fresh-GM onboarding, generic built-in starter worlds, saved-world switching, first-location activation, direct/Ecoregion/fallback Climate provenance, Weather/manual mismatch behavior, Location-default Environment parity, Climate event/removal guards, decoded ordinary-screen prompt targets plus each first-level visible choice, recovery controls for generated refusal/no-change panels, compatible named handout pickers, entity/percent/Markdown-safe picker labels and IDs, and no-hidden-ID reference controls. This is focused VM evidence only; a fresh real-Roll20 render/prompt pass remains required. |
| `tests/almanac-rest.test.js` | Selected linked 2014-PC Rest preview, accepted Long Rest sheet/time commit, stale-plan refusal, and player controller-boundary checks. |
| `tests/almanac-travel.test.js` | Prepared Destination and reviewed Travel checks. |
| `tests/almanac-phenomena.test.js` | Phenomena scope, expiry, review, cleanup, preservation, and setting-scale campaign/template catalog checks. |
| `tests/almanac-presets.test.js` | PresetRegistry clone/install and 160-record campaign-catalog checks. |
| `tests/almanac-rules-advisor.test.js` | Advisory-only RulesAdvisor checks. |
| `tests/almanac-worldpacks.test.js` | Bounded WorldPack parser/review/atomicity/future-runtime/alias checks. |
| `tests/almanac-worldpack-v2.test.js` | Four original setting-scale source workload, Scene/Travel palette inheritance, update/copy, 24-clone installed-WorldPack catalog paging/search, and 640-Location/860-Route catalog paging/search checks. |
| `tests/almanac-temporal-contexts.test.js` | Temporal context, Prime immutability, projection, transition, event, stale, and future-state checks. |
| `tests/almanac-wayfarer-handout.test.js` | Inert Wayfarer handout export/import/review/atomicity checks. |
| `tests/almanac-migration.test.js` | Historical fixture: additive migration, exact Wayfarer starter migration, and future config/runtime preservation. |
| `README.md`, `ROADMAP.md`, `CHANGELOG.md` | Public/current behavior documentation. |
| `Smoketest.md` | Real-Roll20 recovery and later acceptance checklist. Its prior “eligible” status is withdrawn until fresh-GM starter-content, complete-prompt, and dead-end repair checks pass. |
| `docs/AlmanacAssist-v2.0.0-Build/ASSESSMENT.md` | Scope/architecture/status assessment. |
| `docs/AlmanacAssist-v2.0.0-Build/IMPLEMENTATION_PLAN.md` | Gate-by-gate plan and exact automated evidence. |
| `docs/AlmanacAssist-v2.0.0-Build/HANDOFF.md` | This durable restart/recovery summary. |

---

## 6. Automated verification evidence and its limit

The following are the historical focused checks plus the active recovery suite. They are necessary regression evidence, but the first live result proved they are not sufficient evidence of product usability. The direct identity assertions and `cmp` commands are the **future artifact-convergence** sequence; while the mirrors remain deliberately stale, run the same canonical behavioral suites through a temporary local identity-skip copy and leave the real assertions unchanged:

```bash
node tests/almanac-gate0.test.js
node tests/almanac-scene-resolver.test.js
node tests/almanac-worldbuilding.test.js
node tests/almanac-starter-worlds.test.js
node tests/almanac-travel.test.js
node tests/almanac-phenomena.test.js
node tests/almanac-presets.test.js
node tests/almanac-rules-advisor.test.js
node tests/almanac-worldpacks.test.js
node tests/almanac-worldpack-v2.test.js
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

Historical checkpoint evidence also included a targeted canonical-section structural check and a manual surface check for `!Almanac-Manual`. Rerun those checks after any source change that affects their contracts.

### Important test interpretation

These are isolated Node/VM checks. They prove implementation boundaries and regression contracts, **not** Roll20 UI rendering, deferred query expansion, API sandbox behavior, real sheet-worker behavior, first-run discoverability, or release acceptance. The recovery suite is deliberately adding assertions for visible first-launch routes, complete encoded query targets, named page/handout choices, and usable starter state; it still cannot substitute for a real Roll20 chat-rendering pass.

There is no separate broader repository test runner in this checkout. The focused Almanac suite count is not a readiness metric. A green suite must never be summarized as “the code program is complete” without the explicit fresh-GM Roll20 outcome.

---

## 7. Live validation: exploratory failure, recovery, then formal acceptance

An exploratory real Roll20 launch has already happened. It exposed the blockers listed in section 2.1, so it must be recorded as **failed pre-acceptance product discovery**, not omitted or relabeled as a passing/no-start state. The user correctly required that no formal acceptance effort be spent before the implementation is usable; that rule still applies during recovery.

Before a new formal acceptance run, run a short disposable-campaign recovery check for a brand-new GM: choose/install a starter world, see a current Location, set/select a climate region, create/activate a Location, prepare and use a destination, start/review Travel, use a generated query button, and open WorldPack/Wayfarer paths without being asked to discover raw Roll20 IDs. Record the rendered chat text and actual results. Only after those checks pass should the full **Focused v2.0.0 Complete AlmanacAssist Acceptance** section in `Smoketest.md` restart. It includes checks for:

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
2. Confirm the remote branch contains the current recovery work as a descendant of `9c0a83a`; do not treat that historical commit as a completion marker.
3. Confirm whether the current task is still under the deferred mirror boundary. It is at present: do not require identity or copy canonical source into either mirror before testing/committing canonical recovery work.
4. If changing canonical source during the deferred boundary:
   ```bash
   node --check GameAssist
   git diff --check
   ```
   Run relevant canonical behavioral suites with a temporary local identity-skip copy only; remove that copy immediately. When an explicit artifact-convergence pass is authorized later, synchronize all three artifacts, check both mirror syntaxes, and run the real identity guard before release work.
5. Run the applicable focused suite(s), including `almanac-starter-worlds.test.js` for onboarding/UI work and `almanac-worldpack-v2.test.js` for setting-scale catalog/source work, then the full focused collection after any meaningful Almanac change.
6. Preserve the future-state refusal policy. Add a focused test before changing a migration or normalization path.
7. Do not restart formal live Roll20 acceptance until the documented fresh-GM recovery checks are green in source and a disposable campaign is ready.
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

> AlmanacAssist **v2.0.0** is in active live-product recovery on `arena/01a03c75-gameassist`. Earlier framework work supplies SceneResolver, generic Worldbuilding, Travel, Phenomena, Presets, WorldPacks, Temporal Contexts, and Wayfarer, but an exploratory real Roll20 launch found fresh-GM setup, starter-content, Climate prompt, and navigation failures. The branch is repairing a generic Starter World library, active Location/Travel flow, complete deferred prompts, named Roll20 references, and coherent local Climate/Weather/Environment provenance with focused regression coverage. Do not call the Issue #96 program code-complete or start formal acceptance until a fresh GM can use those flows in real Roll20. Issue #95 was not touched.
