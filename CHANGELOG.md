# Changelog

All notable changes to GameAssist are documented in this file.

This changelog is intentionally detailed. It records not only visible features, but also implementation locations, replaced behavior, design rationale, compatibility boundaries, state/migration effects, verification evidence, exclusions, and rollback posture. Line references describe the named release artifact and may move in later revisions; MECHSUITS section names are the more stable long-term locator.

---

## Release Ledger

| Revision | Status | Role |
| --- | --- | --- |
| **v0.1.4.5** | Pre-release; automated verification complete, Roll20 smoke confirmation pending | NPC death-log summary and navigation update |
| **v0.1.4.4** | Merged release | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.2** | Release candidate; automated verification complete, Roll20 smoke confirmation pending | Diagnostic and migration-readiness release |
| **v0.1.4.1** | Preserved rollback baseline | Stability-first repair of the uploaded v0.1.4 baseline |
| **v0.1.4** | Uploaded stable-but-limping baseline | Source used to build v0.1.4.1 |
| **Attempted v0.1.5** | Failed upgrade; never released | Review source for selected fixes only |
| **v0.1.3** | Prior development milestone; supplied notes retained below | Core lifecycle, metrics, helper, and module-hardening work |
| **v0.1.2** | Historical release | Roll20 packaging and initial MECHSUITS structural wrap |
| **v0.1.1.2** | Historical release | CritFumble natural-1 bugfix |
| **v0.1.1.1** | Historical release | Quiet startup and logging improvements |
| **v0.1.1.0** | Initial public release | Original four-module framework |

### Release-history notes

- v0.1.4.2 is not treated as fully confirmed until the real Roll20 API sandbox smoke test passes.
- v0.1.4.1 remains available as the rollback script during v0.1.4.2 confirmation.
- The attempted v0.1.5 file was not imported wholesale. Its unsafe or structurally unreliable changes were rejected; only isolated reviewed ideas were ported.
- Older supplied notes used “Unreleased” and “Staging” labels for v0.1.3–v0.1.5 work. Those records are retained below as historical development evidence rather than silently discarded.
- Where the supplied historical record did not establish a release date, this changelog does not invent one.

---

## [Unreleased]

### Immediate release work

- Complete the real Roll20 smoke-test checklist for v0.1.4.2.
  - Confirm the API sandbox saves and reloads without a red console exception.
  - Confirm the core ready whisper reports `0.1.4.2`.
  - Confirm `!ga-status`, `!ga-config modules`, `!ga-config list`, and `!ga-metrics`.
  - Confirm TokenMod-dependent modules report either `confirmed` or the expected `unverifiable` warning.
  - Confirm a real natural-1 attack, concentration workflow, NPC death/revival marker cycle, NPC HP roll, and module disable/re-enable cycle.
- Keep `GameAssist-v0.1.4.1.js` unchanged as the rollback baseline until the v0.1.4.2 smoke test is complete.
- Freeze broad GameAssist core development after v0.1.4.2 is confirmed so the compatibility-first bridge character-sheet project can begin on a stable foundation.

### Deferred work

- Validated configuration/state snapshot import and restoration.
  - Import requires schema validation, migration rules, preview/dry-run behavior, unknown-branch handling, and rollback semantics.
  - v0.1.4.2 intentionally exports configuration only and provides no import command.
- Native Mord character-sheet support.
  - This belongs to the bridge character-sheet project, not the v0.1.4.2 core release.
- Plugin loader or automatic third-party module discovery.
  - Roll20 does not expose a normal filesystem-style plugin directory.
  - Any future extension contract must be explicit and validated.
- Spell-specific concentration detection, spell names, duration tracking, expiration, and reminders.
- Cooldown, encounter, resource, condition, rest/recovery, and location/AoE modules.
- Rollable-table import/export.
- Expanded verbose-mode diagnostics.

### Explicitly not planned as “fixes”

- Do not route every command and event through the queue.
- Do not claim that a watchdog or timeout can terminate running JavaScript or Roll20 operations.
- Do not automatically delete unexpected state branches.
- Do not claim guaranteed external dependency discovery when Roll20 metadata may be unavailable.

---

## [0.1.4.2] – 2026-06-09

### Release definition

v0.1.4.2 is a **diagnostic and migration-readiness release**. It adds conservative state self-healing, an explicit public queue API, three-state dependency diagnostics, versioned configuration-only snapshots, and more truthful health reporting without changing normal bundled-module event execution.

The release was deliberately kept narrow:

- normal command and event handlers remain direct;
- gameplay-module implementations remain byte-for-byte aligned with the v0.1.4.1 module bodies;
- bootstrap changes are limited to state repair and dependency-status handling;
- no roadmap gameplay modules or character-sheet integration were added.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.2.js` | Release-candidate script | `AB5E2EC627E9BD969997B9FEA0563ED6A9690BD958DD433A38C83FF7F8A3CB35` |
| `GameAssist-v0.1.4.1.js` | Rollback baseline | `E4072A73BECD73EFF4D185F4F30B4A4594DA21DFF85F2C9319F0DA1A55EB08B5` |
| `README-GameAssist-v0.1.4.2.md` | Long-form user/developer handbook | `180AFC8C12E1BFEEA11A9F1EDBC0FD83C115E1DA47867BD4DC1390DD8184289A` |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | Release-specific Roll20 verification checklist | Included with release outputs |

### Version and MECHSUITS metadata

- Advanced the Roll20 header version, MECHSUITS banner `project_version`, and runtime `VERSION` constant to `0.1.4.2`.
  - Roll20 header: `GameAssist-v0.1.4.2.js` line 4.
  - Banner `project_version`: line 83.
  - Runtime `const VERSION = '0.1.4.2'`: line 574.
- Updated only the MECHSUITS sections that received meaningful behavior or contract changes:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:CORE:QUEUE]`
  - `[GAMEASSIST:CORE:OBJECT]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:BOOTSTRAP]`
- Preserved literal codename `GAMEASSIST`; no identifier normalization or tag renaming was performed.
- Preserved prior section commentary under `Prior notes` and added `Changed (v0.1.4.2)` records to the changed sections.
- Completed a structural audit for tag pairing, parent nesting, ancestor-only overlap, canonical-tree agreement, metadata presence, and required section footers.

### Added – State self-healing and audit safety

- Added conservative repair for known module state branches in `[GAMEASSIST:APP:UTILS]`.
  - `ensureStateRoot()` begins at line 276 and guarantees the core `state.GameAssist` containers exist.
  - Known module-branch repair logic records whether the missing/malformed item was the branch, `config`, or `runtime` at lines 333, 337, and 341.
  - `auditState()` begins at line 388.
  - `seedDefaults()` begins at line 423 and runs after repair.
- Known branch behavior:
  - If a known module branch is missing or malformed, GameAssist rebuilds a safe branch container.
  - If `config` is missing or malformed, GameAssist restores a valid object.
  - If `runtime` is missing or malformed, GameAssist restores a valid object.
  - Valid existing configuration values are preserved.
  - Repairs are logged and recorded through `recordMetric('state_repair', ...)` at line 414.
- Unknown branch behavior:
  - Unexpected keys are collected and warned about at line 399.
  - Unknown branches are left untouched during startup.
  - No automatic destructive cleanup occurs.
- Rationale:
  - Known GameAssist-owned shapes can be repaired safely.
  - Unknown branches may contain user data, abandoned module data, or future-extension data; deleting them automatically would be unsafe.
  - This state posture is important before character-sheet development because upgrades and new modules will increase persistent-state complexity.

### Added – Explicit state cleanup command

- Added GM-only `!ga-config cleanup` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1448.
- Cleanup behavior:
  - Preserves known modules and core branches.
  - Deletes only unknown/orphaned branches after the GM explicitly invokes the command.
  - Reports the removed branch names or confirms that no orphaned branches were found.
- Safety boundary:
  - Cleanup is intentionally not executed during startup.
  - Documentation warns the GM to review state warnings before using cleanup.

### Added – Public opt-in queue API

- Exposed `GameAssist.enqueue(task, options)` in `[GAMEASSIST:CORE:OBJECT]` at line 1096.
- Public API behavior:
  - Requires `task` to be a function.
  - Returns `false` and warns when the task is invalid.
  - Returns `true` when accepted.
  - Accepts optional numeric `priority` and positive `timeout`.
  - Falls back to the established default timeout when no valid timeout is supplied.
  - Higher numeric priority runs first; equal-priority jobs preserve enqueue order.
- Existing queue implementation remains in `[GAMEASSIST:CORE:QUEUE]`:
  - `_enqueue(...)` begins at line 618.
  - The job-id stale-completion guard remains intact.
  - The queue continues to serialize only explicitly submitted work and module lifecycle transitions.
- Async contract:
  - Asynchronous queued work must return a Promise that settles when the queued portion is complete.
  - Merely starting `sendChat()` without returning a Promise would allow the queued task to appear complete too early.
- Timeout contract:
  - A timeout releases queue ownership so later jobs can proceed.
  - A timeout cannot cancel the underlying JavaScript callback, `sendChat()` call, or Roll20 operation.
  - The underlying work may finish later; the stale-job guard prevents that late completion from advancing the queue again.
- Rationale:
  - Future modules gain a supported serialization seam without imposing queue latency or coupling on every Roll20 event.

### Changed – Queue and watchdog truthfulness

- Updated `[GAMEASSIST:CORE:QUEUE]` narrative and footer to state the actual operational limit:
  - queue timeouts release the queue;
  - watchdog recovery releases a stuck busy state;
  - neither mechanism kills running JavaScript or Roll20 work.
- Preserved ordinary command/event execution as direct.
- Added `Queue Mode: explicit opt-in; normal event handlers execute directly` to `!ga-status` at line 1507.
- Rejected the old documentation claim that every inbound Roll20 event was queued and watchdog-controlled.
- Rationale:
  - Roll20 offers no general cancellation primitive for a running callback or pending external operation.
  - Accurate documentation is part of operational safety.

### Added – Three-state dependency diagnostics

- Reworked dependency reporting in `[GAMEASSIST:CORE:OBJECT]` through `_checkDependencies(name)` at line 1033.
- Dependency states:
  - `confirmed`: the dependency is positively known to be available.
  - `missing`: the dependency is positively known to be absent.
  - `unverifiable`: Roll20 did not expose enough script metadata to determine presence.
- `_checkDependencies(...)` returns:
  - `status`
  - `missing`
  - `confirmed`
  - `unverifiable`
  - `verified`
- Runtime behavior:
  - Missing dependencies prevent module enablement or cause startup skip.
  - Unverifiable dependencies produce a warning and allow the module to proceed.
  - Modules with no declared dependencies report confirmed.
- Current declared external dependencies:
  - NPCManager → TokenMod (`dependsOn: ['TokenMod']`, line 2300).
  - ConcentrationTracker → TokenMod (`dependsOn: ['TokenMod']`, line 2817).
  - NPCHPRoller does not require TokenMod.
- Rationale:
  - Earlier binary dependency reporting treated unavailable Roll20 metadata as proof of absence.
  - The tri-state model distinguishes evidence from uncertainty and avoids falsely disabling useful modules.

### Added – Versioned configuration-only snapshots

- Added snapshot identifiers to `[GAMEASSIST:POLICY]`:
  - `configFormat: 'gameassist-config-snapshot'`
  - `configSchemaVersion: 1`
  - Snapshot policy group begins at line 201.
- Updated `!ga-config list` in `[GAMEASSIST:INTERFACES:COMMANDS]` beginning at line 1350.
- Snapshot includes:

  ```json
  {
    "format": "gameassist-config-snapshot",
    "schemaVersion": 1,
    "scope": "configuration-only",
    "generatedAt": "<ISO timestamp>",
    "version": "0.1.4.2",
    "flags": {},
    "globalConfig": {},
    "modules": {}
  }
  ```

- Snapshot includes every bundled module configuration.
- Snapshot excludes:
  - runtime caches;
  - metrics;
  - unknown/orphaned branches;
  - arbitrary full `state.GameAssist` data.
- The `GameAssist Config` handout explicitly labels the snapshot scope as configuration-only.
- No import or automatic restore command was added.
- Rationale:
  - Versioning the export now creates a stable future validation boundary.
  - Import/restore is deferred because unsafe state import could be more damaging than a missing feature.

### Added – Health reporting

- Added `getModuleHealth()` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1323.
- Added `formatDependencyStatus()` at line 1337.
- Expanded `!ga-status` at line 1487 to report:
  - command count;
  - event/message count;
  - errors;
  - average explicit queue-task duration;
  - queue length;
  - explicit queue mode statement;
  - last update;
  - total modules;
  - configured modules;
  - running modules;
  - dependency-skipped modules;
  - active listeners;
  - dependency warnings.
- Expanded `!ga-config modules` to show, per module:
  - stored configured state;
  - current runtime state;
  - dependency status.
- Rationale:
  - “Configured” and “running” are not interchangeable.
  - A module can be configured on but skipped, failed, or waiting on dependencies.
  - Health output should reveal that distinction without requiring state-console inspection.

### Changed – Bootstrap order and startup diagnostics

- Updated `[GAMEASSIST:BOOTSTRAP]`, beginning at line 3305.
- Startup order now:
  1. establish core state;
  2. initialize metrics/session timestamp;
  3. clear GameAssist’s internal listener registries;
  4. audit and repair known state;
  5. seed defaults;
  6. deduplicate planned metadata;
  7. run optional compatibility audit;
  8. report core ready;
  9. diagnose dependencies and initialize enabled modules.
- Dependency behavior during startup:
  - missing → warn, disable stored enabled state, leave module inactive;
  - unverifiable → warn and proceed;
  - confirmed → proceed normally.
- Preserved `GameAssist.flags.QUIET_STARTUP = true` default:
  - individual module-ready messages remain suppressed by default;
  - the core-ready message remains visible.

### Documented – Previously hidden commands and configuration

- Documented commands that existed in code but were absent or unclear in older README revisions:
  - `!npc-death-clear` at script line 2237;
  - `!npc-death-audit` at script line 2244;
  - `!ga-config cleanup` at script line 1448;
  - `!ga-metrics [reset]`.
- Documented NPCManager configuration:
  - `autoHide: false` at line 2154;
  - `hideLayer: 'gmlayer'` at line 2155.
- Documented developer metadata and command matching:
  - `dependsOn`
  - `match.caseInsensitive`
  - `match.mode: 'token'`
  - `match.mode: 'prefix'`
- Clarified command behavior:
  - `!npc-death-report` shows recorded deaths;
  - `!npc-death-audit` checks current HP/marker mismatches;
  - `!npc-death-clear` clears the recorded report log;
  - `!critfumblemenu --pid <playerId>` is the internal player-targeted syntax;
  - selected DebugTools tokens are used by omitting `--token`; literal `--token select` is not implemented by the parser;
  - commands are generally case-insensitive; lowercase is not a universal requirement.

### Documentation – Full README reconstruction

- Rebuilt `README-GameAssist-v0.1.4.2.md` as a long-form handbook after the first accurate-but-overly-compact rewrite omitted the original layout and teaching material.
- Restored:
  - numbered sections and table of contents;
  - TL;DR table;
  - architecture explanation and fail-safe table;
  - all six module guides;
  - installation guide;
  - command matrix;
  - configuration reference;
  - developer API;
  - Roll-Table Cookbook;
  - macro recipes;
  - historical benchmark section;
  - detailed troubleshooting;
  - upgrade and rollback paths;
  - contribution guidance;
  - roadmap status;
  - changelog summary;
  - glossary.
- Corrected old claims that described unsuitable, impossible, or unimplemented behavior:
  - removed “zero silent failures” guarantee;
  - removed claim that every event is queued;
  - removed claim that watchdog kills running tasks;
  - removed claim that state audit deletes and reseeds unknown branches;
  - removed guaranteed dependency-discovery claim;
  - corrected `!ga-config list` from full-state backup language to configuration-only snapshot language;
  - corrected startup-message expectations under `QUIET_STARTUP`;
  - corrected defaults, syntax, command purpose, and dependency statements.
- Preserved the old benchmark numbers only as explicitly labeled historical v0.1.3-era evidence, not a v0.1.4.2 performance guarantee.

### Compatibility and behavior boundaries

| Area | v0.1.4.2 Contract |
| --- | --- |
| Roll20 event hooks | Captures native `on` once through `R20_ON`; does not override global `on` or `off`. |
| Normal handlers | Execute directly through initialized/active guards. |
| Queue | Explicit opt-in plus module lifecycle transitions only. |
| Queue timeout | Releases queue; cannot cancel underlying work. |
| Dependency discovery | Best-effort, tri-state, never guaranteed. |
| Unknown state | Warn and preserve until explicit cleanup. |
| Config export | Versioned configuration-only snapshot; no import. |
| Gameplay modules | Preserved from v0.1.4.1; no new gameplay behavior in this release. |
| Character sheet | Not implemented. |

### State and migration impact

- Existing valid module configuration is preserved.
- Known malformed/missing `config` and `runtime` containers are repaired at startup.
- Unknown branches remain intact unless the GM runs `!ga-config cleanup`.
- `!ga-config list` creates a new versioned snapshot shape but does not mutate state.
- No automatic migration removes unknown data.
- No import/restore migration exists.
- Rollback warning:
  - replacing the script with v0.1.4.1 rolls back code;
  - it does not automatically reverse persistent state changes made while v0.1.4.2 was active.

### Explicitly not included

- No implicit queueing of commands/events.
- No cancellation of running JavaScript or Roll20 operations.
- No automatic deletion of unknown state.
- No guaranteed external-script discovery.
- No full-state export/import or snapshot restoration.
- No plugin loader.
- No Rest Manager, encounter tools, cooldown tools, resource tools, condition tools, or location tools.
- No native Mord character-sheet support.
- No new public gameplay command set.

### Automated verification evidence

| Verification | Result | What it established |
| --- | --- | --- |
| JavaScript syntax validation | Passed | Release artifact parses successfully. |
| MECHSUITS structural audit | Passed | No missing parents, invalid overlaps, canonical-tree drift, metadata gaps, or missing footers were detected. |
| Existing command simulation | Passed | Core and bundled command surfaces remained callable without simulation exceptions. |
| Confirmed dependency simulation | Passed | Confirmed dependencies report and initialize correctly. |
| Missing dependency simulation | Passed | Missing dependencies skip/refuse the dependent module. |
| Unverifiable dependency simulation | Passed | Unverifiable dependencies warn and proceed. |
| Known-state repair simulation | Passed | Malformed known `config`/`runtime` containers repair. |
| Valid-config preservation | Passed | Existing valid values survive repair. |
| Unknown-state preservation | Passed | Unknown branches remain untouched at startup. |
| Configuration snapshot generation | Passed | Format, schema version, scope, module configs, and exclusions are correct. |
| Health/status reporting | Passed | Configured/running/skipped counts and warnings appear. |
| Explicit queue serialization | Passed | Explicitly enqueued tasks serialize. |
| Queue-timeout release | Passed | Later task proceeds while underlying timed-out work may finish later. |
| Exact marker/lifecycle regression | Passed | Marker and module lifecycle behavior remained intact. |
| Global event-hook audit | Passed | No global `on`/`off` overrides introduced. |

### Roll20 verification still required

- Paste `GameAssist-v0.1.4.2.js` into a disposable or controlled Roll20 API sandbox.
- Confirm the API sandbox reloads cleanly.
- Run the release smoke test in `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md`.
- Do not retire the v0.1.4.1 rollback baseline until those tests pass.

---

## [0.1.4.1] – 2026-06-08

### Release definition

v0.1.4.1 is a stability-first update built from the uploaded, stable-but-limping v0.1.4 baseline. It preserves v0.1.4 command and bootstrap behavior, incorporates only isolated safe ideas from the failed attempted v0.1.5 upgrade, and aligns the single-file structure with MECHSUITS v1.5.2 requirements without performing a wholesale rewrite.

### Development strategy

- Treated uploaded v0.1.4 as the behavioral baseline.
- Preserved the six-module shape:
  - ConfigUI
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
  - DebugTools
- Avoided broad bootstrap and interface/event lifecycle restructuring.
- Preserved captured Roll20 `R20_ON` behavior.
- Preserved direct normal handler execution.
- Applied changes at narrow MECHSUITS section granularity.
- Kept a separate rollback copy of v0.1.4.

### Version and MECHSUITS metadata

- Advanced Roll20 header, MECHSUITS `project_version`, and runtime `VERSION` to `0.1.4.1`.
  - Header: `GameAssist-v0.1.4.1.js` line 4.
  - Banner: line 74.
  - Runtime version: line 520.
- Preserved literal codename `GAMEASSIST`.
- Audited:
  - banner order and prose;
  - file-scoped canonical tree;
  - section tags and physical nesting;
  - `mechsuit_section.codename`;
  - section `area`;
  - `last_updated_version`;
  - Changed/Maintenance footer discipline;
  - prior-note preservation;
  - required Notes & Comments footers.
- Did not claim that comment-only inherited sections were meaningfully changed.

### Added – Centralized POLICY ownership

- Added/expanded `[GAMEASSIST:POLICY]` beginning at line 163.
- Centralized existing values without changing defaults:
  - queue default timeout;
  - watchdog interval and multiplier;
  - metrics history/duration limits;
  - runtime cache limits;
  - timestamp sanity window;
  - ConfigUI page size;
  - CritFumble roll delay;
  - unsafe configuration keys.
- Used shallow frozen policy groups to reduce accidental runtime mutation.
- Rationale:
  - Shared knobs previously lived in multiple sections.
  - Central policy ownership makes later changes reviewable and rollbackable.
  - Existing values were preserved to avoid changing runtime behavior during the stability release.

### Added – Time seams and timestamp hardening

- Added shared wall-clock helper `now()` at line 227.
- Added monotonic duration helper `monotonic()` at line 231.
- Routed human-facing local-time formatting through `localTime(...)` at line 246.
- Added `sanitizeTimestamp(raw, fallback)` at line 443.
- Routed queue duration measurement through `monotonic()`.
- Routed stored timestamps through the shared wall-clock seam and timestamp sanitizer.
- Rationale:
  - Wall-clock time is appropriate for human and persistent timestamps.
  - Monotonic time is appropriate for durations and timeout measurement.
  - Sanitization prevents malformed/future timestamps from corrupting ordered runtime caches.

### Added – Shared marker helpers

- Added `normalizeMarkerId(marker)` at line 331.
- Added `tokenHasMarker(token, marker)` at line 335.
- Exact-marker behavior:
  - recognizes a configured marker;
  - recognizes counted Roll20 marker values such as `dead@2`;
  - does not match unrelated marker names such as `deadly`.
- Rationale:
  - Substring-style matching can remove or misreport the wrong marker.
  - Shared top-level helpers are visible to module teardown functions and avoid the ConcentrationTracker scoping failure identified in the attempted upgrade.

### Added – Shared runtime self-healing helpers

- Added `ensureRuntimeObject(modState)` at line 411.
- Added `ensureRuntimeKey(runtime, key, kind)` at line 425.
- Added `ensureModRuntimeKey(modState, key, kind)` at line 438.
- Used shared helpers to keep module runtime caches usable after malformed state or older persisted shapes.
- Rationale:
  - Runtime caches are operational and can be safely repaired to known container types.
  - Shared helpers reduce duplicated and inconsistent repair code.

### Changed – Queue timing and stale-completion protection

- Preserved `_enqueue(...)` in `[GAMEASSIST:CORE:QUEUE]`, beginning at line 564.
- Preserved job-id guards at lines 581 and 593:

  ```js
  if (myId !== _jobId) return;
  ```

- Preserved the timed-out completion guard:

  ```js
  if (timedOut) return;
  ```

- Routed queue timing through POLICY and `monotonic()`.
- Emitted the declared metric name through `recordMetric(POLICY.metrics.queueDurationName, ...)` at line 603.
- Rationale:
  - A timed-out job may still finish later.
  - Without the job-id and timed-out guards, late completion could advance the queue twice or corrupt busy-state accounting.

### Changed – Configuration safety and snapshot completeness

- Updated `!ga-config list` beginning at line 1211 to include:
  - runtime version;
  - global flags;
  - root/global configuration;
  - every bundled module configuration.
- Clarified scope:
  - “complete” means complete configuration snapshot;
  - it does not mean full state, runtime cache, or metrics backup.
- Preserved unsafe-key refusal:
  - `BAD_KEYS` sourced from POLICY at line 1242;
  - refusal check at line 1248.
- Preserved `enabled=true|false` routing through module lifecycle methods rather than directly changing state.
- Rationale:
  - Older snapshot behavior omitted module configs.
  - Config export needed to be useful before versioned import could be considered.
  - Prototype-related keys remain unsafe and are explicitly rejected.

### Changed – Shared linked-character validation

- Preserved/exported `GameAssist.getLinkedCharacter` at line 1139.
- Updated modules to use shared linked-token validation at lines including:
  - NPCManager: lines 2008 and 2096;
  - ConcentrationTracker: lines 2476, 2555, and 2743;
  - NPCHPRoller: lines 2818 and 2865.
- Rationale:
  - Modules should not independently assume that tokens are linked, on the Objects layer, or backed by a valid character.
  - Shared validation keeps invalid/unlinked/PC token handling consistent.

### Changed – NPCManager exact marker behavior

- Updated NPCManager to use exact shared marker matching.
- Preserved:
  - `deadMarker: 'dead'`;
  - TokenMod calls;
  - death log behavior;
  - death audit/report commands;
  - configured-marker teardown.
- Teardown begins near line 2142 and clears only the configured marker from eligible current-page tokens.
- Counted marker values such as `dead@2` are recognized.
- Unrelated values such as `deadly` are preserved.
- Rationale:
  - Disable/teardown should clean up the marker GameAssist owns without damaging unrelated status information.

### Changed – ConcentrationTracker lifecycle and runtime safety

- Preserved configured-marker teardown beginning near line 2659.
- Preserved shared marker matching and runtime self-healing.
- Preserved structured `lastDamage` metadata while remaining compatible with legacy numeric values.
- Preserved existing command language:
  - `!concentration`
  - `!cc`
  - `--damage`
  - `--mode`
  - `--off`
  - `--status`
  - `--last`
  - `--config randomize on|off`
  - `!ga-conc-status`
- Rationale:
  - The attempted upgrade exposed a serious helper-scope risk in teardown.
  - Shared helpers ensure teardown can access the configured-marker logic safely.

### Changed – DebugTools exact marker behavior

- Updated DebugTools marker diagnostics to use shared exact marker normalization.
- Marker diagnostics now understand counted markers.
- Preserved:
  - disabled-by-default posture;
  - dry-run-by-default posture;
  - `--apply` requirement for mutations.
- Section change note appears near line 3116.

### Changed – Captured Roll20 event hooks

- Preserved captured native Roll20 handler:

  ```js
  const R20_ON = ...
  ```

  at line 147.
- Preserved use of `R20_ON` for command/event wrappers and `ready`.
- Did not override global `on` or `off`.
- Rationale:
  - Global event-function overrides introduce script-order-dependent interoperability failures with scripts loaded after GameAssist.
  - Roll20 does not provide a dependable general-purpose `off()` contract for these handlers.

### Intentionally excluded from the attempted v0.1.5 upgrade

- Duplicate trailing script fragment.
  - Rejected because duplicated bootstrap/module code could double-register handlers or fail parsing/execution.
- Changed or normalized codename.
  - Rejected because MECHSUITS v1.5.2 requires literal owner-authoritative identifier preservation.
- Global `on`/`off` overrides.
  - Rejected because they create order-dependent cross-script behavior.
- Weakened queue stale-completion guard.
  - Rejected because late completion after timeout could advance the queue twice.
- Broader command matching.
  - Rejected because it could make neighboring command names accidentally trigger.
- Wholesale bootstrap/dependency/interface restructuring.
  - Rejected because the failed whole-file upgrade did not justify expanding the release’s blast radius.

### Verification evidence

| Verification | Result |
| --- | --- |
| JavaScript syntax validation | Passed |
| MECHSUITS structural audit | Passed; no missing parents, invalid overlaps, canonical-tree drift, metadata issues, or missing footers detected |
| Simulated Roll20 startup | Passed with enabled modules wired |
| Core command simulation | Passed without exceptions |
| Unsafe `__proto__` config write | Refused |
| NPC death-marker add/remove simulation | Passed |
| Exact counted marker handling | Passed |
| Unrelated marker preservation | Passed |
| Module disable/enable simulation | Passed |
| Captured native event-hook strategy | Preserved |

### Rollback posture

- v0.1.4.1 is preserved unchanged as the rollback baseline for v0.1.4.2.
- Rollback requires replacing the script and re-running health/smoke tests.
- Script rollback does not automatically restore persistent state.

---

## [0.1.4] – Uploaded Stable-But-Limping Baseline

### Baseline role

- Served as the source baseline for v0.1.4.1.
- Was treated as stable enough to preserve but not “known-good.”
- Included the six-module structure:
  - ConfigUI
  - CritFumble
  - ConcentrationTracker
  - NPCManager
  - NPCHPRoller
  - DebugTools
- Retained TokenMod-based status changes for NPCManager and ConcentrationTracker.
- Preserved captured `R20_ON` behavior and avoided global `on`/`off` overrides.

### Added

- New **ConfigUI** module providing a GM-only chat control panel:
  - module enable/disable buttons;
  - boolean config toggles;
  - pagination;
  - `!ga-config ui`;
  - `!ga-config-ui`.
- New **DebugTools** module:
  - disabled by default;
  - GM-only;
  - dry-run by default;
  - `!ga-debug damage|marker|save`;
  - mutations require `--apply`.
- Public `GameAssist.renderConfigUI(playerId, options)` helper.

### Changed

- Updated README TL;DR, module guides, command matrix, macro recipes, and configuration reference for ConfigUI and DebugTools.
- Advanced runtime version to 0.1.4.
- Retained queue-guarded module lifecycle hooks.

### Known baseline limitations carried into the repair line

- State repair and dependency diagnostics needed clearer, safer semantics.
- Config snapshot behavior and documentation needed correction.
- Marker matching required exact shared helpers.
- Some commands/configuration existed but were not fully documented.
- README described queue/watchdog/state/dependency guarantees more strongly than the Roll20 environment could support.

> No authoritative shipment date was recorded in the supplied changelog. This entry records baseline provenance.

---

## [0.1.3] – Detailed Historical Development Record

This section preserves the supplied granular v0.1.3-era development record, including implementation locations and replaced behavior. The referenced line numbers belong to the historical artifact described by those notes and are retained for audit value.

### Added – Persisted session metrics

- Added persisted session metrics with GM summary/reset command.
  - Added `GameAssist` lines 288-420 for the metrics store helpers:
    - `createMetricsStore`
    - `ensureStateRoot`
    - `recordMetric`
  - Instrumented wrappers at lines 683-742, 796-844, and 1049-1119 to log:
    - commands;
    - events;
    - queue tasks;
    - module toggles;
    - errors.
  - Exposed `!ga-metrics`.
  - Updated the task queue finalizer at lines 197-214 to retain only the latest durations and feed the metrics ring buffer.
  - Exported `getMetricsStore` and `recordMetric` on the public API at lines 927-932.
- Documentation:
  - README TL;DR, Command Matrix, and Troubleshooting sections documented `!ga-metrics`.
  - `script.json` listed the new command and staged version bump.

### Added – Shared token-to-character resolver

- Introduced a shared resolver so modules validate Roll20 objects before use.
  - Added `GameAssist` lines 343-353:

    ```js
    function getLinkedCharacter(token) { ... return { token, character }; }
    ```

  - Added public export at line 836:

    ```js
    GameAssist.getLinkedCharacter = getLinkedCharacter;
    ```

  - Added module usage at historical lines 1213, 1261, 1540, 1611, 1783, 1839, and 1886 so NPCManager, ConcentrationTracker, and NPCHPRoller consistently gate work on verified tokens.
  - Removed duplicated per-module inline checks from the prior implementation:
    - pre-update line 1156: `const charId = token.get('represents');`
    - pre-update line 1168: `const character = getObj('character', charId);`
    - pre-update line 1362: `const charId = token.get('represents');`

### Added – NPCHPRoller auto-roll on token add

- Added opt-in automatic HP rolling for newly created NPC tokens through `autoRollOnAdd`.
  - Added historical lines 1801-1869 to reuse a shared NPC context resolver.
  - New-token handling silently skips non-NPC or invalid tokens.
  - Automatic rolls are annotated in logs.
  - Added `add:graphic` listener metadata at historical lines 1948-1956.
  - Updated README module/config documentation.
- Default remained `false` to avoid event noise and unintended token mutation.

### Changed – Guard-based module handler lifecycle

- Core handler lifecycle moved from physical `off()` calls to module guard flags.
  - Added historical lines 609-620 to store:
    - `initialized`
    - `active`
    - `dependsOn`
    - `wired`
    - `internal`
  - Added handler guards at historical lines 627 and 646-647:

    ```js
    if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;
    ```

  - Preserved the READY gate for normal event handling.
  - Removed prior minimal registration:

    ```js
    MODULES[name] = { initFn, teardown, enabled, initialized: false, events, prefixes };
    ```

  - Removed attempted physical unbinding:

    ```js
    (this._commandHandlers[mod] || []).forEach(h => off(h.event, h.fn));
    (this._listeners[mod] || []).forEach(h => off(h.event, h.fn));
    ```

  - `offCommands` and `offEvents` became logical registry clearing rather than claims of Roll20 listener detachment.

### Changed – Serialized module enable/disable with dependency guards

- Added `_transitioning` checks and queued lifecycle execution across historical lines 718-807.
- Added rollback on initialization failure at historical lines 745-755.
- Added dependency verification helper at historical lines 673-701.
- Added dependency checks inside `enableModule` and bootstrap at historical lines 723-731 and 1945-1955.
- Removed the old eager teardown/clear path:
  - pre-update line 502: `this.offEvents(name);`
  - pre-update line 503: `this.offCommands(name);`
  - pre-update line 504: `clearState(name);`
  - pre-update line 505: `getState(name).config.enabled = true;`
  - removed the analogous disable block at pre-update lines 520-524.

### Changed – State audits became non-destructive

- Added whitelist behavior across historical lines 305-321 so unexpected keys warn without destructive deletion.
- Removed pre-update lines 294-301 that executed:

  ```js
  delete root[k];
  ```

  for unknown or malformed branches.
- This established the safety rule later expanded in v0.1.4.2:
  - known shapes may be repaired;
  - unknown branches are preserved unless explicitly cleaned.

### Changed – State helpers exposed through public API

- Added historical lines 833-835:
  - `GameAssist.getState`
  - `GameAssist.saveState`
  - `GameAssist.clearState`
- Updated module initializers at historical lines 958, 1203, 1324, and 1741 to call `GameAssist.getState(...)`.
- Removed direct internal accessor usage from the previous revision:
  - pre-update line 648: `const modState = getState('CritFumble');`
  - pre-update line 893: `const modState = getState('NPCManager');`
  - pre-update line 996: `const modState = getState('ConcentrationTracker');`
  - pre-update line 1325: `const modState = getState('NPCHPRoller');`

### Changed – Compatibility audit scoring

- Added signature catalog and scoring routine across historical lines 377-518.
- Added summary rows and hints for known/unknown scripts.
- Replaced earlier summary-only logging at pre-update lines 354-357, which reported only known/unknown lists and planned hooks.
- Compatibility output remained gated by `GameAssist.flags.DEBUG_COMPAT`.

### Changed – ConcentrationTracker structured runtime data

- Added structured storage at historical lines 1559-1569.
- Added skipped-token reporting in `handleClear` at historical lines 1600-1624.
- Added `!ga-conc-status` wiring at historical lines 1691-1698.
- Removed previous single-number storage:

  ```js
  modState.runtime.lastDamage[msg.playerid] = damage;
  ```

- Removed silent marker clearing:

  ```js
  if (t) toggleMarker(t, false);
  ```

- Structured metadata included damage, DC, mode, token/character IDs, bonus, player, and timestamp.

### Changed – NPCManager configured-marker teardown

- Added teardown across historical lines 1308-1331.
- Teardown removes the configured marker through TokenMod and reports the number cleared.
- Replaced behavior where disabling NPCManager could leave stale GameAssist-owned death markers on tokens.

### Changed – Chat sanitization and planning utilities

- Added quote escaping at historical line 340:

  ```js
  .replace(/"/g, '&quot;');
  ```

- Added `_dedupePlanned` guard at historical line 667:

  ```js
  if (this._deduped) return;
  ```

- Replaced unconditional deduplication from pre-update lines 493-495.
- Rationale:
  - quoted text should not break Roll20 whisper HTML;
  - planned metadata should not grow repeatedly across reload-like flows.

### Changed – Bootstrap dependency and failure handling

- Added dependency checks and active-flag management at historical lines 1945-1973.
- Set `initialized` and `active` based on actual startup success.
- Removed unconditional initialization loop from pre-update lines 1491-1499:

  ```js
  Object.entries(MODULES).forEach(...)
  ```

- Failed or dependency-blocked modules remain inert instead of appearing active.

### Added – Staged v0.1.3 helper and dependency work

- Added compatibility audit scoring with signature-based hints for:
  - TokenMod
  - ScriptCards
  - APILogic
- Added shared helpers:
  - `GameAssist.createButton(label, command)`
  - `GameAssist.rollTable(tableName)`
- Added GM command `!ga-conc-status`.
- Added declared `dependsOn` checks for module enablement.
- Added structured ConcentrationTracker metadata used by the status report.

### Documentation

- Clarified state-auditor commentary so unexpected branches are documented as warning-only.
- Updated README for:
  - metrics;
  - developer helpers;
  - compatibility scoring;
  - dependency guardrails;
  - `!ga-conc-status`;
  - NPCHPRoller `autoRollOnAdd`.

> No authoritative shipment date was recorded in the supplied development notes.

---

## [0.1.2] – 2025-09-16

### Packaging & Repository Compliance (Roll20 API Repo)

- **Standard Header Added:** Inserted the Roll20-required top-of-file comment containing:
  - name;
  - version;
  - last-updated date;
  - description;
  - syntax/configuration pointers.
- **One-Click Artifacts:** Added:
  - `script.json`;
  - repository-focused `README.md`;
  - `GameAssist/` folder layout suitable for a `roll20-api-scripts` pull request.
- **Dependencies & Tables:** Declared TokenMod usage and documented the exact CritFumble rollable-table names:
  - `CF-Melee`
  - `CF-Ranged`
  - `CF-Thrown`
  - `CF-Spell`
  - `CF-Natural`
  - `Confirm-Crit-Martial`
  - `Confirm-Crit-Magic`

### MECHSUITS v1.5 Structural Wrap (No Runtime Changes)

- **Framing Only:** Introduced:
  - MECHSUITS YAML banner;
  - canonical tree;
  - `[CODENAME:AREA] BEGIN/END` section frames;
  - section notes for maintainability and reviewability.
- **Behavior Parity:** No functional changes; commands and modules remained behaviorally aligned with v0.1.1.2.

### Version & Metadata

- **Version Bump:** Updated version to `0.1.2`.
- **State/Migration:** No migration; `state.GameAssist` structure remained unchanged.

---

## [0.1.1.2] – 2025-06-10

### CritFumble Module

- **Natural 1 Detection Bugfix:**  
  Refactored `hasNaturalOne` to robustly detect natural 1s on d20 attack rolls across template complexity and non-standard inline-roll shapes. This removed `"Cannot read properties of undefined (reading 'r')"` failures and ensured valid attack rolls could be checked without assuming every result contains `.r`.

- **GM Visibility Improvement:**  
  Whispered the **Confirm Critical Miss** confirmation menu to both the GM and the player, rather than only the player, so GM oversight remains consistent.

---

## [0.1.1.1] – 2025-05-30

### Core Framework

- **Quiet Startup Option:**  
  Added `flags.QUIET_STARTUP`, default `true`. Per-module “Ready” chat lines may be suppressed while the core summary remains visible.

- **Logging Improvements:**  
  - Re-implemented `GameAssist.log` for clearer output and log hygiene.
  - Escaped user text.
  - Split multiline output into properly formatted GM whisper content.
  - Preserved message order and formatting.
  - Added `{ startup: true }` metadata so modules can mark suppressible ready messages.

- **Core-Ready Announcement:**  
  The core ready message remains unsuppressed even when quiet startup is enabled.

- **Status Command Update:**  
  - `!ga-status` uses real newline characters.
  - Output remains grouped into one GM whisper.

- **Module Announcements:**  
  - CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller marked their ready messages with `{ startup: true }`.
  - NPCHPRoller adopted the shared startup-output pattern.

- **Summary:**  
  No intended gameplay changes. Work focused on GM chat quality, reduced startup noise, and clearer diagnostics.

---

## [0.1.1.0] – 2025-05-29

- Initial public release of GameAssist.
- Bundled the core loader with four modules:
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
- Established the foundation for later modular expansion and customization.

---

## Historical Staging Labels Preserved

The supplied predecessor changelog used these labels before the v0.1.4.1/v0.1.4.2 repair line was created:

- `[Unreleased]` for much of the detailed v0.1.3-era lifecycle, metrics, state, compatibility, and module work.
- `[Staging] 0.1.4 (blocked by 0.1.3 compliance)` for ConfigUI and DebugTools.
- `[Staging] 0.1.3 (MECHSUITS compliance gate)` for compatibility hints, helpers, dependency checks, and structured concentration data.

Those labels are no longer the current release-status statement, but their detailed implementation records have been retained in the relevant sections above. The attempted v0.1.5 upgrade remains explicitly unshipped.

---

*This changelog records implementation history, rationale, limitations, verification, and release posture. Roadmap ideas and failed upgrade attempts are never presented as shipped features.*

---

## Append-Only Maintenance Policy — Adopted 2026-06-10

This section governs changelog entries added after v0.1.4.2.

- Published entries are preserved as historical records and are not silently rewritten.
- Each new release entry is a curated record of changes since the preceding release entry.
- Corrections to an older entry are appended as a dated correction record that identifies the superseded claim.
- Roadmap work belongs in `ROADMAP.md`; installation and troubleshooting procedures belong in `Smoketest.md`.
- An older entry may receive an appended summary after it is at least three major-version releases behind the current release. The original detailed entry remains preserved.
- Release status, verification results, and artifact names are stated as repository facts rather than internal work narration or editorial judgments.

### Corrections to v0.1.3.x–v0.1.4.2 records

The following corrections supersede inaccurate or temporary wording in the preserved entries above:

| Preserved wording or reference | Corrected record |
| --- | --- |
| `GameAssist-v0.1.4.2.js` | The tracked artifact is `GameAssist-v0.1.4.2`. Its SHA-256 is `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4`. |
| `GameAssist-v0.1.4.1.js` | No v0.1.4.1 script is retained in the repository. Its historical checksum cannot be verified from the repository contents. |
| `README-GameAssist-v0.1.4.2.md` | The tracked handbook is `README.md`. No version-named v0.1.4.2 README is retained. |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | The tracked installation and troubleshooting checklist is `Smoketest.md`. The named release-specific file is not retained. |
| “Mocked Roll20 sandbox” | These checks were simulated Roll20-environment checks, not executions inside the Roll20 API sandbox. |
| “Release candidate,” “stable-but-limping,” “attempted upgrade,” and similar labels | These phrases describe development context recorded at the time. They are not current release-status classifications. |
| “Truthful” or “honest” reporting claims | The durable contract is the specific behavior documented by the corresponding entry, such as configured/running/dependency-skipped counts or three-state dependency reporting. |
| v0.1.4.2 Roll20 confirmation language | The recorded v0.1.4.2 sandbox pass exposed the custom concentration-marker recognition failure addressed by v0.1.4.3. No complete passing v0.1.4.2 sandbox result is recorded. |

### Current release index

| Revision | Status | Repository role |
| --- | --- | --- |
| **v0.1.4.5** | Pre-release; automated verification complete, Roll20 smoke confirmation pending | NPC death-log summary and navigation update |
| **v0.1.4.4** | Previous complete script | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.3** | Previous complete script | Concentration custom-marker recognition and standalone TokenMod interoperability update |
| **v0.1.4.2** | Previous complete script | Diagnostic and migration-readiness release with a known concentration custom-marker limitation |
| **v0.1.4.1** | Historical release; script not retained | Stability-focused repair based on v0.1.4 |
| **v0.1.4** | Historical baseline | Preserved as `GameAssist v0.1.4` |
| **Unreleased v0.1.5 prototype** | Not released | Review source for selected fixes and architecture planning |

---

## [0.1.4.3] – 2026-06-10

### Release definition

v0.1.4.3 improves standalone TokenMod interoperability by resolving configured marker names to the exact marker identities Roll20 stores on tokens. The update focuses on ConcentrationTracker status reporting and marker lifecycle requests while preserving the v0.1.4.x external dependency model.

MarkerService and integrated TokenMod remain assigned to the v0.1.5.x roadmap.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.3` | Versioned v0.1.4.3 script | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist` | Current repository script; identical to `GameAssist-v0.1.4.3` | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist-v0.1.4.2` | Previous complete script | `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4` |

### Root cause addressed

- Roll20 stores a custom marker display name such as `Concentrating` as a token marker tag such as `Concentrating::7191835`.
- v0.1.4.2 compared the configured display name directly with the stored tag.
- A token visibly carrying the configured custom marker could therefore be omitted from `!concentration --status`.
- `deps unverifiable (TokenMod)` was not the cause of the status-read failure. Status reporting reads token markers directly; TokenMod is used when GameAssist requests marker mutation.

### Changed — Shared marker identity resolution

- Added a cached reader for Roll20's campaign custom-marker registry in `[GAMEASSIST:APP:UTILS]`.
- Added structured marker resolution for:
  - lowercase built-in marker ids such as `dead`;
  - custom marker display names such as `Concentrating`;
  - exact stored custom marker tags such as `Concentrating::7191835`;
  - counted marker values such as `Concentrating::7191835@3`.
- Preserved lowercase built-in-marker precedence so a custom marker named `dead` does not replace NPCManager's built-in default.
- Allowed a colliding custom marker to be selected by its complete stored tag.
- Updated `tokenHasMarker(...)` to compare exact resolved marker identities.
- Added fast paths for already-resolved custom tags and literal built-in ids.
- Exact stored custom marker tags now resolve before campaign-registry access, so a valid configured tag such as `Concentrating::7191835` remains usable when Roll20's marker registry is unavailable or malformed.
- Simple matching quote pairs are stripped before marker resolution, so chat-configured values such as `"red"` and `'red'` resolve as `red`.
- Returned explicit resolution failures for unrecognized configured markers.

### Changed — ConcentrationTracker status and lifecycle diagnostics

- `!concentration --status` now:
  - lists current-page tokens carrying the resolved configured marker;
  - returns `No tokens concentrating.` when no matching tokens are present;
  - reports when the current player page cannot be determined;
  - reports an unrecognized configured marker and provides configuration repair syntax;
  - logs a warning when a display name matches multiple custom markers.
- Concentration marker add, remove, and teardown requests now send TokenMod the resolved stored marker tag.
- `!concentration --off` reports that marker removal was requested rather than claiming the asynchronous TokenMod operation completed.
- Teardown stops and logs a warning when the configured marker cannot be resolved.

### Changed — NPCManager death-marker mutation

- NPCManager now resolves the configured death marker before TokenMod add, remove, and teardown requests.
- The default built-in `dead` marker still emits `statusmarkers|+dead` and `statusmarkers|-dead`.
- Built-in color markers such as `red` work even when the saved configuration contains simple wrapping quotes.
- A configured custom display name now emits the exact stored custom marker tag when Roll20's marker registry can resolve it.
- A configured exact custom tag, such as `Dead Custom::abc123`, remains usable even when Roll20's marker registry is unavailable or malformed.
- If the configured death marker cannot be resolved, NPCManager warns instead of sending a misleading TokenMod request or logging a death as completed.

### Documentation and changelog maintenance

- Updated `README.md`, `ROADMAP.md`, and `Smoketest.md` for v0.1.4.3 behavior and validation.
- Added focused concentration-marker checks to `Smoketest.md`.
- Separated release records, roadmap plans, and installation/troubleshooting procedures.
- Adopted the append-only changelog policy above.
- Added appended corrections for inaccurate artifact names and temporary development terminology in preserved v0.1.3.x–v0.1.4.2 records.

### MECHSUITS changes

- Advanced the file header, banner `project_version`, prose guarantee, visual version, and runtime `VERSION` to `0.1.4.3`.
- Applied the Meaningful Change Rule to:
  - `[GAMEASSIST:APP]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:MODULES]`
  - `[GAMEASSIST:MODULES:NPCMANAGER]`
  - `[GAMEASSIST:MODULES:CONCENTRATIONTRACKER]`
- Recorded maintenance-only commentary updates in:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:MODULES:CRITFUMBLE]`
- Preserved literal codename `GAMEASSIST`, existing section tags, and prior notes.
- Confirmed paired tags, proper nesting, and canonical-tree agreement.

### Compatibility and state impact

| Area | v0.1.4.3 behavior |
| --- | --- |
| TokenMod | Remains a separately installed dependency responsible for requested marker mutations. |
| Marker reads/writes | GameAssist reads token markers directly and resolves built-in ids, custom display names, and stored custom tags before marker-dependent read/write decisions. |
| MarkerService | Not included. |
| Integrated TokenMod | Not included. |
| Public commands | Existing v0.1.4.2 command language is preserved. |
| Persistent state | No migration is required; existing ConcentrationTracker configuration remains valid. |
| Rollback | Replacing the script with `GameAssist-v0.1.4.2` restores the previous marker-name comparison behavior. |

### Verification results

| Verification | Result | Coverage |
| --- | --- | --- |
| JavaScript syntax validation | Passed | The current script parses successfully. |
| Current/versioned script identity | Passed | `GameAssist` and `GameAssist-v0.1.4.3` are byte-identical. |
| MECHSUITS structural audit | Passed | Section pairing, nesting, metadata, footers, and canonical tree agree. |
| Simulated Roll20-environment checks | Passed | Empty status, custom and counted markers, built-in markers, exact custom tags, exact custom tags with registry failures, NPC death-marker add command generation, invalid-marker diagnostics, disabled-module diagnostics, and TokenMod teardown command generation. |
| Roll20 API sandbox | Not recorded | Installation and module validation procedures are documented in `Smoketest.md`. |

### Exclusions

- No MarkerService module.
- No integrated TokenMod or StatusInfo module.
- No change to the v0.1.4.x dependency model.
- No configuration import or full-state restore.
- No new gameplay modules.
- No native Mord character-sheet support.

---

## [0.1.4.4] – 2026-07-17

### Release definition

v0.1.4.4 is a small DM-facing readability release. It preserves the v0.1.4.3 marker-recognition and standalone TokenMod interoperability fixes while improving two chat outputs identified in Issue #21.

### Issue addressed

- [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) — Make CritFumble help and NPC death-audit output human-readable.

### Changed — DM-facing command output

- Revised `!critfumble help` from a command list into a quick reference with an `Open Natural 1 Menu` button, common commands, attack types, and exact setup table names.
- Added `!critfumble menu` as the public CritFumble-family command for opening the guided Natural 1 dialogue.
- Added bare `!critfumble` as a help alias, so entering the feature command without a subcommand opens the guide instead of silently doing nothing.
- Preserved `!critfail` as the direct GM player-picker command.
- Preserved existing CritFumble command syntax:
  - `!critfail`
  - `!critfumble`
  - `!critfumble help`
  - `!critfumble menu`
  - `!critfumble-TYPE`
  - `!confirm-crit-martial`
  - `!confirm-crit-magic`
- Changed `!npc-death-audit` from multiple line-by-line log messages into one grouped GM report.
- Added an audit `Scope` row stating that linked NPC tokens are checked and player characters are not included.
- Grouped audit mismatches by action: `Add Marker` for dead NPCs missing the configured marker, and `Clear Marker` for living NPCs still carrying it.
- Preserved useful mismatch details: NPC name, HP, current markers, and token ID.
- Bounded each audit mismatch detail group while preserving total counts, so crowded pages do not produce one oversized Roll20 chat payload.
- Kept unrelated unlinked-page-item notes as informational context, so party markers, scenery, labels, and props do not read like errors.

### Documentation

- Updated `Smoketest.md` so DMs no longer need to reinterpret the old audit success message.
- Updated the CritFumble smoke test to check the quick-reference help panel, the bare `!critfumble` help alias, the `!critfumble menu` guided dialogue, and the unchanged `!critfail` player picker.
- Updated `README.md` to describe the quick reference, guided menu, direct player picker, and the meaning of a clean NPC death audit.
- Updated `ROADMAP.md` so #21, #22, and #23 precede the #24 standalone-interoperability umbrella, with #32 explicitly deferred after the existing issue queue.

### Review fixes

- Hardened `!critfumble help` and `!critfumble menu` matching so extra internal whitespace is accepted.
- Hardened direct fumble rolls so mixed-case commands such as `!CritFumble-melee` resolve the intended fumble type.
- Added a POLICY-owned `npcAuditDetailLimit` cap for grouped NPC death-audit reports.
- Corrected `script.json` so `script` points to the repository's actual `GameAssist` artifact instead of nonexistent `GameAssist.js`.
- Added `!critfumble help` and `!critfumble menu` to the script metadata command list.

### MECHSUITS records

- Updated `[GAMEASSIST:MODULES:CRITFUMBLE]` because the public help output changed.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public audit success output changed.
- Updated `[GAMEASSIST:POLICY]` because the NPC death-audit detail cap is a runtime behavior knob.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.3 artifact remains preserved. The current repository script and the new v0.1.4.4 versioned artifact share:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |
| `GameAssist-v0.1.4.4` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `GameAssist-v0.1.4.4` syntax via stdin check | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.4` byte identity | Passed |
| `git diff --check` | Passed |

Roll20 API sandbox confirmation is still required for the final release gate.

---

## [0.1.4.5] – 2026-07-17

### Release definition

v0.1.4.5 is a narrow NPCManager usability release for Issue #22. It keeps the existing single NPC death log and does not introduce named pools yet. The goal is to make the current death-history workflow easy to scan during play before designing the larger scene/session/campaign pool system.

### Issue addressed

- [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) — Add summarized and named NPC death-log pools.

### Changed — NPC death-history report

- Changed `!npc-death-report` from a line-by-line log dump into a summary-first GM panel.
- The default report now shows:
  - total recorded NPC death events;
  - the latest recorded death;
  - the most frequent NPC names in the log;
  - the most recent entries;
  - buttons for common next steps.
- Added bounded detail views:
  - `!npc-death-report --recent`
  - `!npc-death-report --page N`
  - `!npc-death-report --help`
- Detail pages show newest entries first and use POLICY-owned limits so a long campaign log does not create an oversized Roll20 chat message.
- Preserved the existing single `deathLog` state shape; no migration is required and no existing death history is deleted.
- Preserved `!npc-death-audit` as the current-page HP/marker mismatch checker. The death report remains recorded history, not a current-page inventory.

### Changed — safer log clearing

- Changed `!npc-death-clear` so it now asks for confirmation before deleting recorded death history.
- Added `!npc-death-clear --confirm` as the explicit destructive action.
- Empty-log clears now return a small panel explaining that there is nothing to clear instead of pretending a destructive action happened.

### UX rationale

- The default command now answers the question a DM is most likely asking first: “What has died so far?” without forcing them to read every event.
- Recent/detail views remain available when the GM wants the actual history.
- Clear confirmation prevents accidental loss of session/campaign notes while keeping the workflow simple.
- Named scene/session/campaign pools remain deferred because they need a separate state design, migration plan, and chat menu model.

### Documentation

- Updated `README.md` with the new summary, recent, page, help, and clear-confirm commands.
- Updated `Smoketest.md` so the quick and in-depth NPCManager tests expect a summary dashboard instead of a full log dump.
- Updated `ROADMAP.md` to mark the concise summary path complete and leave named pools for later design.
- Updated `script.json` to version `0.1.4.5`, add `0.1.4.4` to `previousversions`, and list the new death-report command variants.

### MECHSUITS records

- Updated `[GAMEASSIST:POLICY]` because the death-report summary/detail caps are runtime behavior knobs.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public death-report and clear-log behavior changed.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.4 artifact remains preserved. The current repository script and the new v0.1.4.5 versioned artifact share:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `9432F26022EBDC9B0AFC4C6D9EE1F94DF182882DF6EE9595B0EA57C7B1278DFF` |
| `GameAssist-v0.1.4.5` | `9432F26022EBDC9B0AFC4C6D9EE1F94DF182882DF6EE9595B0EA57C7B1278DFF` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.5-pr34-test.js` | `4404294A2203CB37FDD740AA9C43D00B704696AE474ACBEFCDD2074670440961` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `script.json` JSON parse | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.5` byte identity | Passed |
| `git diff --cached --check` | Passed |

Roll20 API sandbox confirmation is still required for the final release gate.
