# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Fixed
- Guard-based command and event wrappers now short-circuit when a module is disabled or uninitialized, preventing residual handlers from firing after `!ga-disable`.

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
