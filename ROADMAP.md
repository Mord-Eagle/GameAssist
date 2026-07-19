# GameAssist Development Roadmap

This roadmap records the transition from GameAssist's standalone-dependency `v0.1.4.x` line to one complete integrated token and condition release: `v0.1.5.0`.

Use this document for durable release boundaries, sequencing, and completion gates. Use the linked GitHub issues for implementation notes, discoveries, and checklists. The umbrella tracker is [Issue #29](https://github.com/Mord-Eagle/GameAssist/issues/29).

> The roadmap is a maintained plan, not a promise of dates. Issues #25 through #29 are development checkpoints within one release train; none is an intermediate public release.

---

## Status Key

| Status | Meaning |
| --- | --- |
| Planned | Scope and acceptance criteria are recorded, but implementation has not started. |
| In progress | Active investigation or implementation is underway. |
| Sandbox verification | Code work is complete enough for Roll20 testing, but the release gate has not passed. |
| Complete | Acceptance criteria, documentation, and Roll20 sandbox verification have passed. |
| Deferred | Intentionally postponed until the stated prerequisite is complete. |

---

## Guiding Decisions

1. **The `v0.1.4.x` line remains standalone-compatible.** TokenMod and StatusInfo stay separately installed Roll20 Mod/API scripts. GameAssist may improve interoperability and diagnostics, but it will not embed or rebuild either dependency in this release line.
2. **`v0.1.5.0` is released only as the complete integration.** Production installations will use rebuilt, attributed GameAssist token and condition services instead of standalone TokenMod and StatusInfo.
3. **MarkerService becomes shared core infrastructure.** `[GAMEASSIST:CORE:MARKERSERVICE]` will be the single internal authority for resolving, reading, modifying, and observing built-in and custom status markers.
4. **The integrated token service receives its own GameAssist identity.** It may preserve supported `!token-mod` compatibility commands while using MarkerService for marker behavior, but it is not branded as TokenMod.
5. **The integrated condition service receives its own GameAssist identity.** It may preserve supported `!condition` workflows while using MarkerService for marker behavior, but it is not branded as StatusInfo.
6. **Attribution and license notices are mandatory.** Rebuilt TokenMod and StatusInfo modules must conspicuously preserve their applicable MIT notices, authorship, upstream baseline, and GameAssist modifications.
7. **Roll20 is the final compatibility test.** Syntax checks and local reasoning are necessary but cannot replace sandbox smoke tests.

---

## Current Sequence

| Stage | Status | Tracking Issue | Release Outcome |
| --- | --- | --- | --- |
| ConcentrationTracker failure investigation | Complete | [#20](https://github.com/Mord-Eagle/GameAssist/issues/20) | Validate custom-marker recognition and actionable diagnostics in Roll20. |
| DM-facing help and audit wording | Complete | [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) | Make CritFumble help/menu output and NPC death-audit reports easier to read while preserving existing commands. |
| NPC death-history buckets and handouts | Complete | [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) | NPCManager 1.1.0 provides four-level history, report writing, hierarchical clears, date rollover, and curated Arc controls. |
| GameAssist status readability | Complete | [#23](https://github.com/Mord-Eagle/GameAssist/issues/23) | The plain-language `!ga-status` system check and optional troubleshooting panel shipped in v0.1.4.6. |
| Standalone interoperability stabilization | Complete | [#24](https://github.com/Mord-Eagle/GameAssist/issues/24) | v0.1.4.7 uses TokenMod's documented `--api-as` path, verifies marker results, reports optional StatusInfo evidence, and passed the Roll20 sandbox acceptance pass. |
| MarkerService checkpoint | Sandbox verification | [#25](https://github.com/Mord-Eagle/GameAssist/issues/25) | PR #41 contains the shared marker core, consumer migrations, lifecycle safeguards, regressions, and documentation. |
| ConditionService checkpoint | Sandbox verification | [#26](https://github.com/Mord-Eagle/GameAssist/issues/26) | ConditionService 1.1.0 implements supported `!condition` workflows, `!con-<condition>` references, 2014/2024/custom wording, validated legacy migration/import, MarkerService synchronization, and attribution. |
| Integrated token-service checkpoint | Planned | [#27](https://github.com/Mord-Eagle/GameAssist/issues/27) | Add the independently branded and attributed GameAssist token service within `v0.1.5.0`. |
| Integrated architecture stabilization | Planned | [#28](https://github.com/Mord-Eagle/GameAssist/issues/28) | Harden upgrades, coexistence, migration, diagnostics, and verified command coverage before `v0.1.5.0` is released. |
| v0.1.5.0 release gate | Planned | [#29](https://github.com/Mord-Eagle/GameAssist/issues/29) | Publish only after every integrated service, attribution requirement, documentation update, and full Roll20 acceptance check is complete. |
| Deferred marker-registry lookup verification | Deferred | [#32](https://github.com/Mord-Eagle/GameAssist/issues/32) | Verify `token_markers` versus `_token_markers` after the existing issue queue unless it becomes a live blocker. |
| DM-configurable timezone | Planned after existing queue | [#35](https://github.com/Mord-Eagle/GameAssist/issues/35) | Use a validated DM timezone for human-facing timestamps and date-based Session rollover while preserving absolute stored timestamps. |

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
- Deferred follow-up: verify Roll20's campaign marker registry property names in [Issue #32](https://github.com/Mord-Eagle/GameAssist/issues/32) after the current issue queue unless it becomes a live blocker.
- Deferred follow-up: add DM-configurable timezone formatting and Session boundaries in [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35); v0.1.4.7 uses the sandbox/UTC date boundary.

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
- [ ] Complete the focused Roll20 sandbox regression pass without standalone TokenMod.
- [x] Update MECHSUITS tree, sections, documentation, changelog, and smoke-test instructions.

### Completion Gate

NPCManager and ConcentrationTracker must perform their marker workflows without standalone TokenMod. MarkerService must demonstrate correct custom-marker behavior and unrelated-marker preservation, and its disable path must turn off dependent modules without making CritFumble, ConfigUI, or NPCHPRoller unavailable.

**Current evidence:** syntax and mocked-ready initialization pass; 23 focused MarkerService checks, 22 mocked marker-consumer workflow checks, 24 service-lifecycle checks, and an 18-check marker-mutation refresh pass. Coverage includes built-in/custom/direct-tag resolution, invalid registry diagnostics, numbered and duplicate markers, unrelated-marker preservation, NPC death/revival history, concentration status/off, DebugTools safeguards, dependent shutdown, opt-out persistence, lifecycle re-enable, and observation delivery. The Roll20 sandbox smoke pass remains required before Issue #25 closes.

---

## Phase 3: Integrated Condition-Service Checkpoint for `v0.1.5.0`

**Tracking:** [Issue #26](https://github.com/Mord-Eagle/GameAssist/issues/26)

Build the independently branded `ConditionService` module, preserving selected StatusInfo workflows while removing its independent marker implementation. Its stable MECHSUITS tag is `[GAMEASSIST:MODULES:CONDITIONSERVICE]`.

### Ownership Boundary

- The GameAssist condition-information service owns condition definitions, 2014/2024/campaign wording, menus, `!con-<condition>` references, and supported `!condition` compatibility workflows.
- MarkerService owns marker identity, state, mutation, and observation.
- The condition-information service must not independently parse or mutate markers in ways that compete with MarkerService.

### Checklist

- [x] Select `ConditionService` and `[GAMEASSIST:MODULES:CONDITIONSERVICE]` as the stable GameAssist identifiers.
- [x] Compare StatusInfo 0.3.11 with the published 0.3.12 package and pin the repository snapshot/file blob.
- [x] Record Robin Kuiper attribution, upstream baseline, GameAssist changes, and the MIT notice.
- [x] Define the supported command/configuration compatibility surface.
- [x] Route commands, observations, and lifecycle through GameAssist.
- [x] Route marker behavior through MarkerService.
- [x] Copy valid `state.STATUSINFO` settings and definitions without deleting the legacy branch.
- [x] Validate complete configuration imports before applying them and protect the definition map from generic replacement.
- [x] Detect and warn about accidental standalone StatusInfo installation.
- [x] Default clean campaigns to the complete SRD 5.1 condition catalog and offer SRD 5.2.1 or campaign-custom wording without deleting added definitions or marker choices.
- [x] Add dynamic read-only `!con-<condition>` references and duplicate-marker assignment warnings.
- [x] Update documentation, attribution, changelog, upgrade notes, and component smoke tests.

### Completion Gate

Supported `!condition` workflows, `!con-<condition>` references, and selectable condition wording must function through GameAssist and remain synchronized with MarkerService-managed markers without requiring standalone StatusInfo.

**Current evidence:** JavaScript syntax passes, the mocked Roll20 legacy-migration suite passes 30/30 checks, and the clean-install suite passes 26/26 checks. Coverage includes the complete 2014 catalog, 2024 and campaign-custom profile changes, `!con-<condition>` references, preservation of added conditions and marker choices, duplicate-marker warnings, schema-v2 export, profile capacity refusal, legacy migration retention, custom and numbered markers, selected-token menus, add/remove/toggle, external marker observation, unsafe and protected-config refusal, validated import, MarkerService cascade disable, case-insensitive service restoration, and observer recovery. Real Roll20 sandbox acceptance remains required before Issue #26 closes.

---

## Phase 4: Integrated Token-Service Checkpoint for `v0.1.5.0`

**Tracking:** [Issue #27](https://github.com/Mord-Eagle/GameAssist/issues/27)

Build an independently branded GameAssist general token service that preserves selected TokenMod compatibility behavior and removes the production requirement for standalone TokenMod. The owner-authoritative module name and MECHSUITS tag must be selected before code is created.

### Ownership Boundary

- The GameAssist general token service owns supported `!token-mod` compatibility parsing and general token operations.
- MarkerService owns marker resolution, mutation, and observation semantics.
- Internal GameAssist modules call stable internal services directly rather than generating `!token-mod` chat commands.

### Checklist

- [ ] Select the owner-authoritative GameAssist module name and stable MECHSUITS tag.
- [ ] Pin the exact TokenMod adaptation baseline and upstream commit.
- [ ] Record The Aaron attribution, upstream baseline, GameAssist changes, and MIT notice.
- [ ] Define the initially supported TokenMod compatibility surface and its documented limits.
- [ ] Preserve supported `!token-mod` command behavior.
- [ ] Preserve or safely migrate `state.TokenMod` where practical.
- [ ] Route marker operations through MarkerService.
- [ ] Route listeners and lifecycle through GameAssist.
- [ ] Preserve TokenMod observer behavior or document its replacement.
- [ ] Detect and warn about accidental standalone TokenMod installation.
- [ ] Remove standalone TokenMod from production installation instructions.
- [ ] Test command families incrementally in Roll20.

### Completion Gate

The completed `v0.1.5.0` implementation must no longer require standalone TokenMod. Supported compatibility commands and all GameAssist marker consumers must share MarkerService semantics.

---

## Phase 5: Integrated Architecture Stabilization and `v0.1.5.0` Release Gate

**Tracking:** [Issue #28](https://github.com/Mord-Eagle/GameAssist/issues/28)

This phase verifies the complete integration before the first public `v0.1.5.0` release. It is not post-release cleanup.

### Checklist

- [ ] Validate upgrades from the final supported `v0.1.4.x` release.
- [ ] Validate GameAssist, TokenMod, and StatusInfo state migration behavior.
- [ ] Expand verified TokenMod command-family coverage incrementally.
- [ ] Verify module disable/re-enable and sandbox reload behavior.
- [ ] Verify accidental standalone-script warnings.
- [ ] Document known compatibility gaps without overstating support.
- [ ] Define a sustainable process for reviewing upstream changes.

### Completion Gate

The integrated architecture is considered stable only when supported workflows have no known silent marker failures, upgrade guidance is tested, and compatibility claims match verified behavior.

---

## Target `v0.1.5.0` Architecture

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
│  └─ [GAMEASSIST:CORE:OBJECT]
├─ [GAMEASSIST:INTERFACES]
│  ├─ [GAMEASSIST:INTERFACES:EVENTS]
│  └─ [GAMEASSIST:INTERFACES:COMMANDS]
├─ [GAMEASSIST:MODULES]
│  ├─ [GAMEASSIST:MODULES:CONFIGUI]
│  ├─ [GAMEASSIST:MODULES:CRITFUMBLE]
│  ├─ GameAssist-branded general token service (final tag pending)
│  ├─ [GAMEASSIST:MODULES:CONDITIONSERVICE]
│  ├─ [GAMEASSIST:MODULES:NPCMANAGER]
│  ├─ [GAMEASSIST:MODULES:CONCENTRATIONTRACKER]
│  ├─ [GAMEASSIST:MODULES:NPCHPROLLER]
│  └─ [GAMEASSIST:MODULES:DEBUGTOOLS]
└─ [GAMEASSIST:BOOTSTRAP]
```

This is a target tree only. Per MECHSUITS v1.5.2, the executable banner's `canonical_tree` must not include a section until that section actually exists, is properly nested, and is added in the same change.

---

## Cross-Cutting Release Gates

Every development checkpoint must satisfy the following before being marked complete. The public release requires all checkpoints to be complete together:

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

## Explicitly Deferred

These remain outside this integration roadmap until the integrated architecture is stable:

- native Mord character-sheet development;
- unrelated encounter, rest, resource, and roadmap modules;
- broad plugin-loader work;
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
