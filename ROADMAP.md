# GameAssist Development Roadmap

This roadmap records the transition from GameAssist's standalone-dependency `v0.1.4.x` line to the integrated token and status architecture planned for `v0.1.5.x`.

Use this document for durable release boundaries, sequencing, and completion gates. Use the linked GitHub issues for implementation notes, discoveries, and checklists. The umbrella tracker is [Issue #29](https://github.com/Mord-Eagle/GameAssist/issues/29).

> The roadmap is a maintained plan, not a promise of dates. A stage is complete only after its issue acceptance criteria and Roll20 sandbox checks pass.

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
2. **The `v0.1.5.x` line becomes integrated.** Production installations will use rebuilt, attributed GameAssist modules for TokenMod and StatusInfo instead of the standalone scripts.
3. **MarkerService becomes shared core infrastructure.** `[GAMEASSIST:CORE:MARKERSERVICE]` will be the single internal authority for resolving, reading, modifying, and observing built-in and custom status markers.
4. **TokenMod remains the user-facing token command module.** Integrated TokenMod will preserve the supported `!token-mod` command surface while using MarkerService for marker behavior.
5. **StatusInfo remains the condition-information module.** Integrated StatusInfo will preserve supported `!condition` workflows while using MarkerService for marker behavior.
6. **Attribution and license notices are mandatory.** Rebuilt TokenMod and StatusInfo modules must conspicuously preserve their applicable MIT notices, authorship, upstream baseline, and GameAssist modifications.
7. **Roll20 is the final compatibility test.** Syntax checks and local reasoning are necessary but cannot replace sandbox smoke tests.

---

## Current Sequence

| Stage | Status | Tracking Issue | Release Outcome |
| --- | --- | --- | --- |
| ConcentrationTracker failure investigation | Complete | [#20](https://github.com/Mord-Eagle/GameAssist/issues/20) | Validate custom-marker recognition and actionable diagnostics in Roll20. |
| DM-facing help and audit wording | In progress | [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) | Make CritFumble help and NPC death-audit output easier to read without changing command syntax. |
| NPC death-log reporting improvements | Planned | [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) | Add concise death-log summaries first; defer named pools until the design is ready. |
| GameAssist status readability | Planned | [#23](https://github.com/Mord-Eagle/GameAssist/issues/23) | Make `!ga-status` easier for DMs to interpret while keeping diagnostics available. |
| Standalone interoperability stabilization | Planned | [#24](https://github.com/Mord-Eagle/GameAssist/issues/24) | Finish the `v0.1.4.x` line with reliable standalone TokenMod and StatusInfo behavior. |
| MarkerService foundation | Planned | [#25](https://github.com/Mord-Eagle/GameAssist/issues/25) | Release `v0.1.5.0` with one internal marker authority and migrated GameAssist modules. |
| Integrated StatusInfo | Planned | [#26](https://github.com/Mord-Eagle/GameAssist/issues/26) | Release `v0.1.5.1` with rebuilt and attributed StatusInfo. |
| Integrated TokenMod | Planned | [#27](https://github.com/Mord-Eagle/GameAssist/issues/27) | Release `v0.1.5.2` with rebuilt and attributed TokenMod and no standalone production dependency. |
| Integrated architecture stabilization | Planned | [#28](https://github.com/Mord-Eagle/GameAssist/issues/28) | Harden upgrades, compatibility, diagnostics, and verified TokenMod coverage across later `v0.1.5.x` releases. |
| Deferred marker-registry lookup verification | Deferred | [#32](https://github.com/Mord-Eagle/GameAssist/issues/32) | Verify `token_markers` versus `_token_markers` after the existing issue queue unless it becomes a live blocker. |

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
- [ ] Make CritFumble help and NPC death-audit success output DM-readable.
- [ ] Improve NPC death-log reporting with a concise summary path before any named-pool work.
- [ ] Make `!ga-status` easier for DMs to interpret.
- [ ] Diagnose built-in `dead` marker mutation failures while TokenMod `players-can-ids` is enabled.
- [ ] Ensure marker-operation failures do not produce silent success claims.
- [ ] Verify NPCManager marker add, remove, audit, report, and teardown behavior.
- [ ] Verify ConcentrationTracker marker add, remove, status, and teardown behavior.
- [ ] Verify standalone StatusInfo continues observing relevant marker changes.
- [ ] Update README, changelog, and smoke tests with confirmed behavior and limitations.

### Completion Gate

The final `v0.1.4.x` release must pass its documented Roll20 smoke test with the supported standalone installation before `v0.1.5.0` becomes the production development focus.

### Phase Status

- v0.1.4.3 resolves configured custom marker display names to the exact tags Roll20 stores on tokens.
- Static and simulated checks cover custom markers, counted markers, built-in markers, empty status, invalid-marker diagnostics, and ConcentrationTracker teardown commands.
- Open gate: complete the ConcentrationTracker checks in `Smoketest.md` in a Roll20 API sandbox.
- Deferred follow-up: verify Roll20's campaign marker registry property names in [Issue #32](https://github.com/Mord-Eagle/GameAssist/issues/32) after the current issue queue unless it becomes a live blocker.

---

## Phase 2: `v0.1.5.0` MarkerService Foundation

**Tracking:** [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25)

`[GAMEASSIST:CORE:MARKERSERVICE]` becomes non-optional shared infrastructure. It must not behave like a toggleable gameplay module because disabling it would invalidate dependent modules.

### Intended Internal Contract

The final public names may change during design review, but the service must cover these capabilities:

```js
GameAssist.markers.resolve(markerNameOrTag);
GameAssist.markers.has(token, markerNameOrTag);
GameAssist.markers.set(token, markerNameOrTag, enabled);
GameAssist.markers.toggle(token, markerNameOrTag);
GameAssist.markers.observe(handler);
```

Operations should return useful results or diagnostics rather than assuming success.

### Checklist

- [ ] Define MarkerService inputs, outputs, invariants, and failure results.
- [ ] Support built-in, legacy, custom, numbered, and duplicate marker forms.
- [ ] Preserve unrelated markers and number overlays during changes.
- [ ] Observe marker changes through one consistent contract.
- [ ] Migrate NPCManager, ConcentrationTracker, and DebugTools.
- [ ] Remove standalone TokenMod dependency gating from modules that only require marker operations.
- [ ] Add focused Roll20 regression tests and diagnostics.
- [ ] Update MECHSUITS tree, sections, documentation, and changelog.

### Completion Gate

NPCManager and ConcentrationTracker must perform their marker workflows without standalone TokenMod, while MarkerService demonstrates correct custom-marker behavior and preservation of unrelated marker state.

---

## Phase 3: `v0.1.5.1` Integrated StatusInfo

**Tracking:** [Issue #26](https://github.com/Mord-Eagle/GameAssist/issues/26)

Rebuild StatusInfo as `[GAMEASSIST:MODULES:STATUSINFO]`, preserving the useful supported condition-description workflows while removing its independent marker implementation.

### Ownership Boundary

- StatusInfo owns condition definitions, descriptions, menus, and `!condition` workflows.
- MarkerService owns marker identity, state, mutation, and observation.
- StatusInfo must not independently parse or mutate markers in ways that compete with MarkerService.

### Checklist

- [ ] Record Robin Kuiper attribution, upstream baseline, GameAssist changes, and MIT notice.
- [ ] Define the supported command/configuration compatibility surface.
- [ ] Route commands, events, and lifecycle through GameAssist.
- [ ] Route marker behavior through MarkerService.
- [ ] Preserve or safely migrate existing `state.STATUSINFO` where practical.
- [ ] Validate any supported configuration import before applying it.
- [ ] Detect and warn about accidental standalone StatusInfo installation.
- [ ] Update documentation, attribution, changelog, upgrade notes, and smoke tests.

### Completion Gate

Supported `!condition` workflows and condition descriptions must function through GameAssist and remain synchronized with MarkerService-managed markers without requiring standalone StatusInfo.

---

## Phase 4: `v0.1.5.2` Integrated TokenMod

**Tracking:** [Issue #27](https://github.com/Mord-Eagle/GameAssist/issues/27)

Rebuild TokenMod as `[GAMEASSIST:MODULES:TOKENMOD]`, preserve its supported user-facing command behavior, and remove the production requirement for standalone TokenMod.

### Ownership Boundary

- TokenMod owns `!token-mod` command parsing and supported general token operations.
- MarkerService owns marker resolution, mutation, and observation semantics.
- Internal GameAssist modules call stable internal services directly rather than generating `!token-mod` chat commands.

### Checklist

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

Production `v0.1.5.2` installations must no longer require standalone TokenMod. Supported TokenMod commands and all GameAssist marker consumers must share MarkerService semantics.

---

## Phase 5: Later `v0.1.5.x` Stabilization

**Tracking:** [Issue #28](https://github.com/Mord-Eagle/GameAssist/issues/28)

Later `v0.1.5.x` releases focus on verification and compatibility rather than immediately expanding the feature set.

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

## Target `v0.1.5.x` Architecture

```text
[GAMEASSIST]/
├─ [GAMEASSIST:POLICY]
├─ [GAMEASSIST:APP]
│  └─ [GAMEASSIST:APP:UTILS]
├─ [GAMEASSIST:CORE]
│  ├─ [GAMEASSIST:CORE:QUEUE]
│  ├─ [GAMEASSIST:CORE:COMPAT]
│  ├─ [GAMEASSIST:CORE:STATE]
│  ├─ [GAMEASSIST:CORE:OBJECT]
│  └─ [GAMEASSIST:CORE:MARKERSERVICE]
├─ [GAMEASSIST:INTERFACES]
│  ├─ [GAMEASSIST:INTERFACES:EVENTS]
│  └─ [GAMEASSIST:INTERFACES:COMMANDS]
├─ [GAMEASSIST:MODULES]
│  ├─ [GAMEASSIST:MODULES:CONFIGUI]
│  ├─ [GAMEASSIST:MODULES:CRITFUMBLE]
│  ├─ [GAMEASSIST:MODULES:TOKENMOD]
│  ├─ [GAMEASSIST:MODULES:STATUSINFO]
│  ├─ [GAMEASSIST:MODULES:NPCMANAGER]
│  ├─ [GAMEASSIST:MODULES:CONCENTRATIONTRACKER]
│  ├─ [GAMEASSIST:MODULES:NPCHPROLLER]
│  └─ [GAMEASSIST:MODULES:DEBUGTOOLS]
└─ [GAMEASSIST:BOOTSTRAP]
```

This is a target tree only. Per MECHSUITS v1.5.2, the executable banner's `canonical_tree` must not include a section until that section actually exists, is properly nested, and is added in the same change.

---

## Cross-Cutting Release Gates

Every roadmap stage must satisfy the following before being marked complete:

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
