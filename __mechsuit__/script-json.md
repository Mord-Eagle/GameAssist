// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST"
//   project_version: "v0.1.4.7"
//   purpose: "Document the non-commentable Roll20 One-Click script.json artifact and its submission contract."
//   order: ["static.wrapper","static.script_json"]
//   env:
//     required: []
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Do not emit secrets or player data outside the Roll20 sandbox."
//     - "Do not override Roll20 global on/off handlers."
//   observability:
//     logs: "none"
//     metrics: []
//     spans: []
//   performance: { notes: "Static metadata only; no runtime cost." }
//   concurrency: { model: "static", idempotency: "N/A" }
//   compatibility: { accepts: ["Roll20 script.json.schema draft-07"], emits: "Roll20 One-Click metadata" }
//   policy: { notes_ref: "[GAMEASSIST:POLICY]" }
//   error_codes: []
//   transport_map:
//     one_click: "Static manifest consumed by Roll20 repository validation and the Mod Library."
//   canonical_tree: |
//     [GAMEASSIST]/
//     `- [GAMEASSIST:STATIC]
//        `- [GAMEASSIST:STATIC:SCRIPT_JSON]
// --- prose banner ---
// This sidecar guarantees that GameAssist script.json follows static then manifest review order for project_version v0.1.4.7. Secrets required: none. It refuses to emit player data outside Roll20 or override Roll20 global on/off handlers.

// ============================================================================
// [GAMEASSIST:STATIC] BEGIN
// Section Title: Static artifact documentation wrapper
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST",
//   area: "STATIC",
//   title: "Static artifacts",
//   guarantees: ["Documents non-commentable release metadata without changing runtime code."],
//   depends_on: ["[GAMEASSIST:POLICY]"],
//   last_updated_version: "v0.1.4.7",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// This wrapper records the contract for static files that cannot carry MECHSUITS comments themselves.
// The child section contains the current Roll20 One-Click manifest and submission decisions.
// -----------------------------------------------------------------------------

// ============================================================================
// [GAMEASSIST:STATIC:SCRIPT_JSON] BEGIN
// Section Title: Roll20 One-Click script manifest
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST",
//   area: "STATIC:SCRIPT_JSON",
//   title: "Roll20 script.json",
//   guarantees: ["Names GameAssist.js consistently.","Validates against Roll20's script.json schema.","Advertises only packaged One-Click versions."],
//   depends_on: ["[GAMEASSIST:POLICY]"],
//   provides: ["script.json"],
//   seams: ["Roll20 One-Click repository validator"],
//   risks: ["Manifest and executable version folders must remain synchronized."],
//   observability: { logs: "none", metrics: [], spans: [] },
//   last_updated_version: "v0.1.4.7",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// script.json is the source of truth for Roll20 One-Click discovery. The project changelog may retain
// older private releases, but previousversions lists only releases physically packaged in the official
// Roll20 folder. The v0.1.4.7 update preserves the three existing One-Click rollback versions.
// -----------------------------------------------------------------------------

```json
{
  "name": "GameAssist",
  "script": "GameAssist.js",
  "version": "0.1.4.7",
  "previousversions": [
    "0.1.1.2",
    "0.1.1.1",
    "0.1.1.0"
  ],
  "description": "# GameAssist\n\nGameAssist is a modular Roll20 Mod/API automation suite for the D&D 5E (2014) character sheet. It combines critical-fumble tools, concentration checks, NPC death tracking and report handouts, and NPC hit-point rolling in one configurable script.\n\n## Quick Start\n\n1. Install GameAssist and its required TokenMod dependency.\n2. Create the seven CritFumble rollable tables listed below.\n3. Save or restart the Mod sandbox.\n4. Run `!ga-status` to check the installation and `!ga-config ui` to open settings.\n\n## Main Commands\n\n- `!ga-status` -- Show a short system check. Use `!ga-status --details` for troubleshooting.\n- `!ga-config ui` -- Open the GM configuration menu.\n- `!critfumble help` -- Open the CritFumble quick-reference guide.\n- `!critfail` -- Open the GM player picker for a manual critical miss.\n- `!concentration` or `!cc` -- Open concentration-check controls.\n- `!npc-death-report --help` -- Open the NPC death-tracking guide and report controls.\n- `!npc-death-audit` -- Check current-page NPC HP against death markers.\n- `!npc-hp-selected` -- Roll HP for selected linked NPC tokens.\n\n## Requirements\n\n- TokenMod 0.8.88 is the supported standalone baseline for NPCManager and ConcentrationTracker marker changes.\n- StatusInfo 0.3.11 is optional and can provide condition descriptions and menus.\n- CritFumble uses these rollable tables: `CF-Melee`, `CF-Ranged`, `CF-Thrown`, `CF-Spell`, `CF-Natural`, `Confirm-Crit-Martial`, and `Confirm-Crit-Magic`.\n\nGameAssist does not create or populate those campaign-specific rollable tables automatically. Features unrelated to a missing optional setup item remain available.\n\n## Documentation\n\nSee the [GameAssist README](https://github.com/Mord-Eagle/GameAssist#readme) for complete setup, commands, examples, module settings, upgrade guidance, and troubleshooting.",
  "authors": "Mord Eagle",
  "roll20userid": "10646976",
  "patreon": "",
  "tipeee": "",
  "useroptions": [],
  "dependencies": ["TokenMod"],
  "modifies": {
    "Campaign.playerpageid": "read",
    "Campaign._token_markers": "read",
    "graphic._pageid": "read",
    "graphic.bar1_value": "read,write",
    "graphic.bar1_max": "read,write",
    "graphic.statusmarkers": "read,write",
    "graphic.represents": "read",
    "graphic.name": "read",
    "graphic.layer": "read,write",
    "graphic.controlledby": "read",
    "character.name": "read",
    "character.controlledby": "read",
    "attribute._characterid": "read",
    "attribute.name": "read",
    "attribute.current": "read",
    "rollabletable.name": "read",
    "tableitem._rollabletableid": "read",
    "tableitem.name": "read",
    "tableitem.weight": "read",
    "handout.name": "read,write",
    "handout.notes": "read,write",
    "handout.inplayerjournals": "read,write",
    "handout.controlledby": "read,write",
    "player._id": "read",
    "player._displayname": "read"
  },
  "conflicts": ["Concentration", "DeathTracker"]
}
```

// --- Notes & Comments ---
// Changed (v0.1.4.7): aligned the One-Click update manifest with Roll20's .js filename, modifies-object, and physical-version requirements.
// Decision log:
//   CHOICE: preserve the three existing official rollback versions - ALT: list every private project release; REJECTED: matching official version folders do not exist.
//   CHOICE: keep TokenMod required and StatusInfo optional - ALT: list both as dependencies; REJECTED: GameAssist runs without StatusInfo.
// [GAMEASSIST:STATIC:SCRIPT_JSON] END
// ============================================================================

// --- Notes & Comments ---
// Changed (v0.1.4.7): added the required sidecar for the non-commentable Roll20 manifest.
// [GAMEASSIST:STATIC] END
// ============================================================================
