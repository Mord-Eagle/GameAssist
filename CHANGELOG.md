# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Added
- Introduced a shared token-to-character resolver so every module validates Roll20 objects before use.
  - Added `GameAssist` lines 343-353: `function getLinkedCharacter(token) { ... return { token, character }; }`.
  - Added `GameAssist` line 836: `GameAssist.getLinkedCharacter = getLinkedCharacter;` for public access.
  - Added module usages at `GameAssist` lines 1213, 1261, 1540, 1611, 1783, 1839, and 1886 so NPCManager, ConcentrationTracker, and NPCHPRoller consistently gate work on verified tokens.
  - Removed the per-module inline checks from the prior implementation: `GameAssist` (pre-update) line 1156 `const charId = token.get('represents');`, line 1168 `const character = getObj('character', charId);`, and line 1362 `const charId = token.get('represents');`, which duplicated validation logic.
- NPCHPRoller can now auto-roll HP when new NPC tokens are created on the map (opt-in via `autoRollOnAdd`).
  - Added `GameAssist` lines 1801-1869 to reuse a shared NPC context resolver, allowing the module to silently skip non-NPC tokens when listening for `add:graphic` events and annotate auto rolls in the log output.
  - Added `GameAssist` lines 1948-1956 to register the `add:graphic` listener in the module metadata.
  - Updated documentation (`README.md` §6.4 and §9) to describe the new opt-in behavior and configuration default.

### Changed
- Core handler lifecycle now relies on module guard flags instead of physical `off()` calls.
  - Added `GameAssist` lines 609-620 to store `initialized`, `active`, `dependsOn`, `wired`, and `internal` flags per module.
  - Added `GameAssist` lines 627 and 646-647: `if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;` (plus the READY gate) so wrapped handlers short-circuit when a module is disabled.
  - Removed the previous minimal registration and physical unbinding: `GameAssist` (pre-update) line 447 `MODULES[name] = { initFn, teardown, enabled, initialized: false, events, prefixes };`, line 467 `(this._commandHandlers[mod] || []).forEach(h => off(h.event, h.fn));`, line 473 `if (!READY || !MODULES[mod].initialized) return;`, and line 484 `(this._listeners[mod] || []).forEach(h => off(h.event, h.fn));`.
  - `offCommands`/`offEvents` now treat removal as logical by keeping `this._commandHandlers[mod] = []` and `this._listeners[mod] = []` (lines 641 and 657) instead of detaching sandbox listeners.
- Module enable/disable is serialized with dependency guards and rollback.
  - Added `_transitioning` checks and queued execution across `GameAssist` lines 718-807, including the new rollback on init failure at lines 745-755.
  - Added dependency verification helper at lines 673-701 and `_checkDependencies` usage inside `enableModule` and bootstrap (lines 723-731 and 1945-1955).
  - Removed the old eager teardown/clear path: `GameAssist` (pre-update) line 502 `this.offEvents(name);`, line 503 `this.offCommands(name);`, line 504 `clearState(name);`, line 505 `getState(name).config.enabled = true;`, and the analogous disable block at lines 520-524.
- State namespace audits now warn instead of deleting data and honor core branches.
  - Added whitelist logic across `GameAssist` lines 305-321 so unexpected keys log warnings without destructive deletes.
  - Removed `GameAssist` (pre-update) lines 294-301 that executed `delete root[k];` for unknown or malformed branches.
- Exposed state helpers and updated modules to call them through the public API.
  - Added `GameAssist` lines 833-835 wiring `getState`, `saveState`, and `clearState` onto the exported object.
  - Updated module initializers at lines 958, 1203, 1324, and 1741 to call `GameAssist.getState(...)`.
  - Removed the direct state accessors from the previous revision: `GameAssist` (pre-update) line 648 `const modState = getState('CritFumble');`, line 893 `const modState = getState('NPCManager');`, line 996 `const modState = getState('ConcentrationTracker');`, and line 1325 `const modState = getState('NPCHPRoller');`.
- Compatibility auditing now emits conflict scores and hints.
  - Added the signature catalog and scoring routine across `GameAssist` lines 377-518, including the new summary rows and hint logging.
  - Removed the earlier summary-only logging: `GameAssist` (pre-update) lines 354-357 `GameAssist.log('Compat', ...)` that reported only known/unknown lists and planned hooks.
- ConcentrationTracker preserves richer metadata for repeat checks and validation feedback.
  - Added structured storage at `GameAssist` lines 1559-1569, the skip reporting in `handleClear` at lines 1600-1624, and the `!ga-conc-status` command wiring at lines 1691-1698.
  - Removed the single-number state storage and silent marker clearing: `GameAssist` (pre-update) line 1185 `modState.runtime.lastDamage[msg.playerid] = damage;` and line 1218 `if (t) toggleMarker(t, false);`.
- NPCManager now tears down its configured death markers when disabled so tokens do not retain stale indicators.
  - Added `GameAssist` lines 1308-1331: `teardown: () => { ... sendChat('api', \`!token-mod --ids ${token.id} --set statusmarkers|-${marker}\`); GameAssist.log('NPCManager', \`Cleared ${targets.length} ${marker} marker(s) during teardown.\`); }`.
- Chat sanitization and planning utilities were hardened for Roll20’s HTML pipeline.
  - Added `GameAssist` line 340 `.replace(/"/g, '&quot;');` so quoted text no longer breaks whispers.
  - Added `_dedupePlanned` guard at line 667 `if (this._deduped) return;` to prevent array growth across hot reloads (replacing the unconditional dedupe at pre-update lines 493-495).
- Bootstrapping respects dependency availability and leaves failed modules inert.
  - Added the dependency check and active flag management at `GameAssist` lines 1945-1973, setting `mod.initialized`/`mod.active` based on enablement success.
  - Removed the unconditional init loop `Object.entries(MODULES).forEach` with direct `m.initFn()` from `GameAssist` (pre-update) lines 1491-1499.

### Documentation
- Clarified internal commentary around the state auditor to note that unexpected branches are only warned about.

---

## [0.1.3] – 2025-09-17

### Added
- Compatibility audit scoring with signature-based hints for popular mods (TokenMod, ScriptCards, APILogic), surfaced when `GameAssist.flags.DEBUG_COMPAT` is enabled.
- Shared helpers `GameAssist.createButton(label, command)` and `GameAssist.rollTable(tableName)` for consistent chat button rendering and rollable table execution.
- `!ga-conc-status` GM command to whisper the most recent concentration DC/damage and bonus per player using the enriched `lastDamage` state.

### Changed
- Module enablement now checks declared `dependsOn` requirements (e.g., TokenMod) and refuses to start modules until dependencies are present.
- ConcentrationTracker persists structured metadata for the last concentration check (damage, DC, mode, token/character IDs) to power the new status report.

### Documentation
- README updated for the new GM command, developer helpers, compatibility scoring notes, and dependency guardrails.

---

## [0.1.2] – 2025-09-16

### Packaging & Repository Compliance (Roll20 API Repo)
- **Standard Header Added:** Inserted the Roll20-required top-of-file comment (name, version, last updated, description, syntax/config pointers) above the MECHSUITS banner in `GameAssist.js`.
- **One-Click Artifacts:** Added `script.json` (schema-ready) and a repo-focused `README.md`, and defined a folder layout `GameAssist/` suitable for a pull request to `roll20-api-scripts`.
- **Dependencies & Tables:** Declared **TokenMod** as a dependency and documented the CritFumble rollable tables required (`CF-Melee`, `CF-Ranged`, `CF-Thrown`, `CF-Spell`, `CF-Natural`, `Confirm-Crit-Martial`, `Confirm-Crit-Magic`).

### MECHSUITS v1.5 Structural Wrap (No Runtime Changes)
- **Framing Only:** Introduced a MECHSUITS YAML banner, canonical tree, and `[CODENAME:AREA] BEGIN/END` section frames with notes to improve maintainability and reviewability.
- **Behavior Parity:** No functional changes; all commands and modules behave identically to 0.1.1.2.

### Version & Metadata
- **Version Bump:** Updated version to **0.1.2**.
- **State/Migration:** No migrations; `state.GameAssist` structure unchanged.

---

## [0.1.1.2] – 2025-06-10

### CritFumble Module

- **Natural 1 Detection Bugfix:**  
  Refactored the `hasNaturalOne` function to robustly detect natural 1s on all d20 attack rolls, regardless of template complexity or non-standard inline roll formats. This eliminates `"Cannot read properties of undefined (reading 'r')"` errors and ensures that all valid attack rolls are properly checked for critical fumbles.

- **GM Visibility Improvement:**  
  The ❓ **Confirm Critical Miss** confirmation menu is now whispered to both the GM and the player, not just the player. This makes GM oversight consistent across all critical miss event prompts.

---

## [0.1.1.1] – 2025-05-30

### Core Framework

- **Quiet Startup Option:**  
  Added `flags.QUIET_STARTUP` (default: `true`). GMs can now silence per-module “Ready” chat lines during sandbox boot, except for the single Core summary line.

- **Logging Improvements:**  
  - Re-implemented `GameAssist.log` for better output and log hygiene.
  - Logs now automatically escape user text, split multiline output into properly prefixed `/w gm` blocks, and preserve message order and formatting.
  - `log()` accepts `{ startup: true }` metadata, so modules can control which messages are suppressed by QUIET_STARTUP.

- **Core-Ready Announcement:**  
  - The core “ready” message is never suppressed, even in QUIET_STARTUP mode.

- **Status Command Update:**  
  - `!ga-status` now uses real newline characters for clearer output.
  - Output remains grouped in a single whisper for better readability.

- **Module Announcements:**  
  - All bundled modules (CritFumble, NPCManager, ConcentrationTracker, NPCHPRoller) now mark their “Ready” lines with `{ startup:true }` so they respect QUIET_STARTUP.  
  - NPCHPRoller conforms to this output pattern.

- **Summary:**  
  No functional changes to gameplay. All updates focus on GM chat output quality-of-life, reducing log clutter, and clarifying startup diagnostics.

---

## [0.1.1.0] – 2025-05-29

- Initial public release of GameAssist.
- Bundled the core loader with four modules: CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller.
- Laid foundation for future modular expansion and customization.

---

*This changelog will track all future updates, enhancements, and bug fixes.*
