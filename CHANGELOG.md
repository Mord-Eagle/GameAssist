# Changelog

All notable changes to GameAssist are documented in this file.

This changelog is intentionally detailed. It records not only visible features, but also implementation locations, replaced behavior, design rationale, compatibility boundaries, state/migration effects, verification evidence, exclusions, and rollback posture. Line references describe the named release artifact and may move in later revisions; MECHSUITS section names are the more stable long-term locator.

---

## Release Ledger

| Revision | Status | Role |
| --- | --- | --- |
| **v0.1.6.0** | Automated verification passed; Roll20 sandbox acceptance pending | Native Turn Tracker service and mixed-sheet initiative workflows |
| **v0.1.5.1** | Focused Roll20 timezone acceptance passed; complete manual module smoke not rerun | DM-configurable table time and NPC Session-date alignment |
| **v0.1.5.0** | Accepted release candidate; Issues #25-#29 and #32 complete | Integrated marker, token, and condition architecture |
| **v0.1.4.7** | Stable release; automated and Roll20 sandbox verification passed | Standalone TokenMod and StatusInfo interoperability |
| **v0.1.4.6** | Merged release | DM-readable system health and troubleshooting status |
| **v0.1.4.5** | Merged release | NPC death-history buckets, handouts, and arc notes |
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

- v0.1.4.2 requires Roll20 API sandbox smoke confirmation before it should be used as a confirmed table build.
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

| Verificati…29444 tokens truncated…ase. It adds one GM-selected IANA timezone for human-facing GameAssist dates, clocks, and date-managed NPC Sessions while preserving the absolute ISO instants already stored with events. It does not change marker ownership, TokenAssist commands, ConditionAssist definitions, queue behavior, or the accepted v0.1.5.0 integration architecture.

The release implements [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35). NPCManager advances from `1.2.1` to `1.3.0`; ConfigUI advances from `0.1.0` to `0.2.0`. Other feature-module versions remain unchanged.

### Added – Campaign timezone controls

- Added the GM-only `!ga-timezone` command family:
  - `!ga-timezone` and `!ga-timezone help` open the table-time menu;
  - `!ga-timezone set <IANA timezone>` validates and saves a named region;
  - `!ga-timezone clear`, `default`, or `sandbox` restores the Roll20 sandbox clock.
- Added `!ga-config timezone` as a discoverable entry point to the same menu.
- Added common buttons for US Eastern, US Central, US Mountain, US Pacific, UTC, London, Paris, and Sydney, plus a custom IANA-name prompt.
- Added clear current-setting, current-time, and current-Session-date output.
- Added timezone access to both `!ga-status` views and every ConfigUI page.
- Invalid names are refused before state changes. A malformed saved value produces an actionable warning and falls back to sandbox time without deleting the saved evidence.

### Added – Shared time contract

- Added validated timezone helpers in `[GAMEASSIST:APP:UTILS]` for:
  - IANA-name validation and canonicalization;
  - active setting and fallback diagnostics;
  - date/time parts in a selected region;
  - numeric UTC-offset calculation;
  - full human-facing timestamps;
  - compact log times;
  - local `YYYY-MM-DD` date keys;
  - dynamic rendering of stored absolute timestamps.
- Exposed the supported helper surface as `GameAssist.Time` with version `1.0.0`:
  - `validateTimeZone(...)`;
  - `getInfo()`;
  - `formatDateTime(...)`;
  - `formatTime(...)`;
  - `dateKey(...)`.
- Named regions use the runtime's IANA rules and therefore follow daylight-saving changes. Fixed numeric offsets were rejected because they become inaccurate when a region changes between standard and daylight time.
- Forced 24-hour offset calculations to use the `h23` hour cycle so midnight cannot be represented as hour `24` and produce a false one-day offset.
- Reused timezone validation and display formatters through a 32-entry LRU cache. Repeated log and menu rendering no longer reconstructs `Intl.DateTimeFormat`, while arbitrary custom timezone input cannot grow sandbox memory without a bound.

### Changed – Human-facing timestamps

- Routed GameAssist log clocks through the selected timezone.
- Routed simple and detailed status timestamps through the selected timezone.
- Routed configuration snapshot handout headers through the selected timezone while preserving the snapshot's absolute `generatedAt` ISO value.
- Routed condition-status and NPC audit handout update times through the selected timezone.
- Routed concentration activity display times through the selected timezone.
- Routed NPC death, revival, bucket, report, and Arc display times through the selected timezone.
- Historical NPC entries with a valid stored ISO timestamp are formatted dynamically. Changing timezone updates their presentation without changing the event's identity or instant.
- Legacy entries that contain only a preformatted display string retain that string because no reliable absolute instant exists to reinterpret.

### Changed – NPCManager 1.3.0

- Date-managed Session names now follow the configured GameAssist timezone rather than an assumed sandbox/UTC date.
- Setting or clearing the timezone asks a running NPCManager instance to refresh the active date-managed Session immediately.
- NPCManager continues checking the date before report, bucket, Arc, audit, repair, and tracked HP activity so the first event after local midnight enters the new Session.
- A deliberately named Session remains stable across timezone and date changes. **Reset Session Date** restores automatic date management.
- Campaign, Chapter, Section, Session, Arc, death, and revival records are preserved during timezone changes.
- Added `GameAssist.NPCManager.refreshSessionDate(...)` as the narrow internal/public integration hook used by the timezone command.

### State and migration impact

- Added `state.GameAssist.config.timezone`.
- Clean installations and upgraded campaigns default this value to `null`, meaning **Sandbox default**.
- The state self-healer seeds the missing key without replacing any existing root or module configuration.
- Valid saved IANA names survive sandbox reloads.
- Invalid saved names remain visible for diagnosis while runtime formatting safely falls back to sandbox time.
- Existing ISO timestamps, module runtime records, marker state, NPC history, and configuration snapshots are not migrated or rewritten.
- Rolling back to v0.1.5.0 leaves the extra root timezone key inert.

### MECHSUITS records

- Advanced banner `project_version` and runtime `VERSION` to `v0.1.5.1`.
- Updated the meaningful-change metadata and footers for `[GAMEASSIST:POLICY]`, `[GAMEASSIST:APP]`, `[GAMEASSIST:APP:UTILS]`, `[GAMEASSIST:CORE]`, `[GAMEASSIST:CORE:OBJECT]`, `[GAMEASSIST:INTERFACES:COMMANDS]`, `[GAMEASSIST:MODULES:CONFIGUI]`, and `[GAMEASSIST:MODULES:NPCMANAGER]`.
- Preserved the literal `GAMEASSIST` codename and the existing file-scoped section tree; no tag was added, removed, or renamed.
- Added the internal MECHSUITS-framed Issue #35 harness with explicit refusal to contact or substitute for Roll20.

### Documentation and metadata

- Added a readable table-time explanation, Quick Start step, command reference, NPC Session behavior, status description, and release-history summary to `README.md`.
- Added a focused v0.1.5.1 smoke test to `Smoketest.md`, including persistence, invalid input, Kiritimati/Honolulu date crossover, custom Session retention, and safe restoration of the intended timezone.
- Updated `ROADMAP.md` with the Issue #35 implementation and focused Roll20 completion gate.
- Updated `script.json` to advertise v0.1.5.1, expose the timezone commands, describe table-time behavior, include v0.1.5.0 in `previousversions`, and declare both the documented `campaign.token_markers` read and compatibility `_token_markers` read.
- Preserved the accepted `GameAssist-v0.1.5.0` artifact and added a separate v0.1.5.1 artifact.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `GameAssist.js` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `GameAssist-v0.1.5.1` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `previousversions/GameAssist v0.1.5.0` | `254087C9F87E2539F1A6CEBFF5FFAE25D4AA31E65A2DA76D5FACE69D7778CBE7` |

The development source, One-Click publication mirror, and v0.1.5.1 Roll20 test artifact are byte-identical. The preserved v0.1.5.0 previous-version artifact matches the accepted v0.1.5.0 hash.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed |
| Clean-install sandbox-clock fallback | Passed |
| IANA validation and persisted command setting | Passed |
| Winter Eastern offset (`-0500`) | Passed |
| Summer Eastern offset (`-0400`) | Passed |
| Bounded `Intl.DateTimeFormat` reuse | Passed |
| UTC-midnight to prior local-date crossover | Passed |
| Immediate date-managed Session alignment | Passed |
| Next-activity local-midnight rollover | Passed |
| Deliberately named Session retention | Passed |
| Invalid input refusal without configuration loss | Passed |
| Unsupported saved-value fallback and status diagnostic | Passed |
| Sandbox reload persistence | Passed |
| Historical report reformatting after timezone change | Passed |
| Absolute ISO timestamp preservation | Passed |
| Focused Issue #35 harness | Passed (23/23) |
| v0.1.5.0 upgrade/lifecycle regression | Passed (46/46) |

### Roll20 acceptance

The focused Roll20 v0.1.5.1 timezone smoke test passed on 2026-07-19. The owner tested the timezone workflow rather than rerunning the complete manual v0.1.5.1 suite; non-timezone confidence remains grounded in the automated regression results above. This release record therefore claims focused timezone acceptance, not a second full live regression of every module.

---

## [0.1.6.0] – 2026-07-19

### Release definition

GameAssist v0.1.6.0 adds a native Roll20 Turn Tracker foundation and the first InitiativeAssist release. InitiativeAssist supports encounters containing both **D&D 5E by Roll20 (2014)** and **D&D 2024 by Roll20** characters, uses the case-insensitive `!Init-` command family, and keeps initiative setup and rerolls compact enough for active play.

This release implements [Issue #47](https://github.com/Mord-Eagle/GameAssist/issues/47). `TurnTrackerService 1.0.0` becomes a new toggleable core service and `InitiativeAssist 1.0.0` becomes the ninth independently configurable GameAssist module. InitiativeAssist starts disabled so installing or upgrading GameAssist cannot unexpectedly take ownership of an active tracker.

Round counting, automatic turn advancement, status-duration countdowns, current-turn visuals, encounter lifecycle automation, and end-of-turn effects remain outside InitiativeAssist. Those combat-flow responsibilities are deferred to [Issue #48](https://github.com/Mord-Eagle/GameAssist/issues/48) for a future CombatAssist module.

### Added – TurnTrackerService 1.0.0

- Added `[GAMEASSIST:CORE:TURNTRACKERSERVICE]` as the single GameAssist owner of native Turn Tracker reads, observations, and guarded writes.
- Added immutable tracker snapshots containing:
  - the active initiative page;
  - the exact raw `turnorder` value;
  - parsed entries with original indices;
  - a revision fingerprint used to detect concurrent changes.
- Added structural row classification for custom rows, missing-token rows, current-page token rows, and off-page token rows without assigning D&D rules inside the core service.
- Added preservation-first mutations. A consumer supplies a narrow transformation and TurnTrackerService performs at most one `Campaign().set('turnorder', ...)` write after confirming that the page and source revision still match.
- Added observation of `change:campaign:turnorder` and `change:campaign:initiativepage` through Roll20's captured event seam.
- Added own-write echo suppression so GameAssist observers do not process the same service-authored update twice.
- Added the frozen `GameAssist.TurnTrackerService` integration surface for snapshots, classification, guarded application, and observer registration.
- Registered TurnTrackerService with the existing GameAssist lifecycle. Disabling it automatically disables InitiativeAssist while leaving unrelated modules available.

### Added – InitiativeAssist 1.0.0

- Added a case-insensitive `!Init-` namespace with GM menus, status, audit, public initiative calls, player rolls, rerolls, saved groups, and Manager/Observer modes.
- Added `!Init-Go` for a concise public **Roll for initiative** invitation.
- Added `!Init-Go!` for a rotating set of light, table-friendly initiative announcements.
- Added public buttons that let a player roll initiative for an eligible character they control. Player authorization and token eligibility are checked again when the button is used rather than trusted from the original chat message.
- Added a compact player options panel for:
  - normal rolls;
  - advantage;
  - disadvantage;
  - one bonus die;
  - two bonus dice.
- Added common `d4`, `d6`, `d8`, `d10`, and `d12` buttons plus a bounded custom die-side prompt. Two-die rolls collect each die separately so combinations such as `1d6 + 1d4` do not require a special command language.
- Added readable public result messages while preserving Roll20 inline-roll presentation. A failed or unavailable modifier lookup produces a clear response rather than inserting an initiative value of zero.
- Added `!Init-RR` to reroll every eligible living NPC and every Player Character already represented in the active tracker.
- Added narrower reroll choices for PCs, NPCs, selected tracker tokens, individual tracker tokens, and saved encounter groups.
- Added group creation and removal from selected tracker tokens. Groups store token identities, not copies of tracker rows, and remain bounded by policy limits.
- Added a GM status panel that summarizes the active tracker, eligible actors, rows kept unchanged, service availability, and current Manager/Observer mode.
- Added a read-only initiative audit handout for larger troubleshooting results instead of filling chat with row-by-row diagnostics.
- Added `GameAssist.InitiativeAssist.getRoster()` as a narrow read-only integration surface for future GameAssist features.

### Added – Mixed 2014/2024 sheet adapters

- Added D&D 5E by Roll20 (2014) initiative resolution using the represented character's `npc` and `initiative_bonus` attributes.
- Added D&D 2024 by Roll20 initiative resolution through Roll20's asynchronous Computed/Beacon access when available.
- Added 2024 character-type checks using supported sheet data and player-controller evidence rather than assuming every unfamiliar character is an NPC.
- Added mixed encounters: 2014 PCs, 2014 NPCs, 2024 PCs, and 2024 NPCs may appear in the same tracker and reroll batch.
- Added a conservative unavailable-data path. If the 2024 sheet interface cannot provide initiative data, InitiativeAssist retains the existing row and explains that it needs attention.

### Changed – Safe reroll behavior

- `!Init-RR` rolls once for each unique eligible token. If the same token appears more than once in the tracker, each duplicate receives the same new result.
- Sorting is limited to tracker slots owned by the eligible reroll targets. InitiativeAssist does not globally reorder the tracker.
- Custom rows, round counters, objects, dead NPCs, HP/marker disagreements, stale references, off-page rows, and unknown rows retain their original positions and values.
- Unknown properties on rerolled tracker entries are preserved.
- NPCs are treated as living only when HP or marker evidence supports that conclusion. Missing or contradictory death evidence is reported for attention rather than guessed.
- InitiativeAssist verifies the active initiative page after asynchronous modifier resolution and aborts without writing if the page changed.
- InitiativeAssist verifies target-row priorities before applying a completed reroll and aborts without writing if another script or GM changed those targets in the meantime.
- Batch sizes, group counts, group-name lengths, picker sizes, and custom die sizes use bounded policy values.

### Added – Coexistence controls and diagnostics

- Added **Manager mode** for deliberate InitiativeAssist tracker writes.
- Added **Observer mode** for menus, status, and audits without tracker mutation.
- Expanded compatibility diagnostics for GroupInitiative, CombatMaster, CombatTracker, InitiativeTrackerPlus, RoundMaster, TurnMarker1, and AddCustomTurn.
- Compatibility messages describe the overlapping responsibility: initiative rolling, tracker ordering, custom rows, round ownership, or combat-flow management.
- `!ga-status --details` now reports TurnTrackerService availability and InitiativeAssist mode/lifecycle state.
- `!ga-config modules` continues to show the detailed enabled/running state for both the service and module.

### State and migration impact

- Added `state.GameAssist.TurnTrackerService.config.enabled`, defaulting to enabled.
- Added `state.GameAssist.InitiativeAssist.config.enabled`, defaulting to disabled.
- Added `state.GameAssist.InitiativeAssist.config.mode`, defaulting to `manager` for use after the GM explicitly enables the module.
- Added bounded InitiativeAssist runtime storage for named encounter groups.
- Existing GameAssist configuration, runtime data, timezone selection, marker state, condition definitions, NPC history, and TokenAssist state are preserved.
- No existing Roll20 Turn Tracker rows are migrated, rewritten, or normalized during startup.
- Rolling back to v0.1.5.1 leaves the new service/module branches inert.

### MECHSUITS records

- Advanced banner `project_version` and runtime `VERSION` to `v0.1.6.0`.
- Added `CORE:TURNTRACKERSERVICE` and `MODULES:INITIATIVEASSIST` to the file-scoped `canonical_tree` with literal `GAMEASSIST` identifiers.
- Added complete parent-owned section frames, section metadata, narratives, meaningful-change records, decision logs, and required Notes & Comments footers.
- Updated affected ancestor contracts and bootstrap ordering to initialize TurnTrackerService before InitiativeAssist.
- Mechanically verified 24 declared section tags against 24 actual section frames with balanced parent nesting, matching `area` metadata, `last_updated_version` records, and footer records.

### Documentation and metadata

- Expanded `README.md` with InitiativeAssist onboarding, commands, mixed-sheet behavior, player options, reroll preservation rules, configuration, compatibility guidance, macros, troubleshooting, upgrade steps, developer APIs, and the CombatAssist boundary.
- Rebuilt `Smoketest.md` around v0.1.6.0 clean-install and v0.1.5.1-upgrade tracks, then added dedicated TurnTrackerService and InitiativeAssist component tests.
- Added focused tests for mixed-sheet actors, duplicate entries, custom rows, counters, dead NPCs, off-page rows, player authorization, bonus dice, page changes, concurrent priority changes, Observer mode, service disable cascade, malformed tracker data, and audit handout output.
- Updated `ROADMAP.md` with the completed implementation scope for Issue #47 and the deferred CombatAssist scope in Issue #48.
- Updated `script.json` to advertise v0.1.6.0, list the InitiativeAssist command family, include v0.1.5.1 in `previousversions`, declare Turn Tracker and sheet-data access, and describe initiative conflicts in user-facing terms.
- Preserved `GameAssist-v0.1.5.1` and added `previousversions/GameAssist v0.1.5.1` before generating the new versioned artifact.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `B072DB32E809A08AC5E0F6893746362D37D9A3B35222A27C3CC083B4EED042A4` |
| `GameAssist.js` | `B072DB32E809A08AC5E0F6893746362D37D9A3B35222A27C3CC083B4EED042A4` |
| `GameAssist-v0.1.6.0` | `B072DB32E809A08AC5E0F6893746362D37D9A3B35222A27C3CC083B4EED042A4` |
| `previousversions/GameAssist v0.1.5.1` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |

The development source, One-Click publication mirror, and v0.1.6.0 Roll20 test artifact are byte-identical. The preserved v0.1.5.1 previous-version artifact matches its recorded release hash.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed |
| MECHSUITS hierarchy and metadata audit | Passed (24/24 declared and actual sections) |
| InitiativeAssist focused harness | Passed (34/34) |
| ConditionAssist regression harness | Passed (35/35) |
| TokenAssist regression harness | Passed (45/45) |
| v0.1.5.0 integration/lifecycle regression | Passed (46/46) |
| v0.1.5.1 timezone regression | Passed (23/23) |
| `script.json` parse validation | Passed |
| Current release artifact identity | Passed (3/3 byte-identical) |
| Preserved v0.1.5.1 artifact identity | Passed |

### Roll20 acceptance gate

Automated verification is complete. Roll20 sandbox acceptance remains open for the clean-install and v0.1.5.1-upgrade tracks in `Smoketest.md`, including mixed 2014/2024 initiative, public player buttons, `!Init-RR` preservation, Manager/Observer behavior, and coexistence checks with any other campaign script that reads or writes the Turn Tracker. Issue #47 remains open until those live checks pass.

