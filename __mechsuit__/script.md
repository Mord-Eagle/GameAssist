<!--
--- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_PR81_CURRENT_SCRIPT"
  project_version: "v2.0.0"
  purpose: "Record the contract for the non-commentable Roll20 script.json package metadata."
  order: ["validate_json", "reconcile_commands", "reconcile_description", "verify_artifact"]
  env: { required: [], optional: [], secrets: [] }
  data_class: "Public"
  ai_data: "none"
  refusals:
    - "Do not emit secrets or player data outside the Roll20 sandbox."
    - "Do not override Roll20 global on/off handlers."
  observability: { logs: "none", metrics: [], spans: [] }
  performance: { notes: "Static metadata; no runtime performance claim." }
  concurrency: { model: "Static document", idempotency: "N/A" }
  compatibility: { accepts: ["JSON"], emits: "Roll20 package metadata" }
  error_codes: []
  transport_map: { notes: "No runtime transport." }
  canonical_tree: |
    [GAMEASSIST_PR81_CURRENT_SCRIPT]/
      [GAMEASSIST_PR81_CURRENT_SCRIPT:STATIC]
--- prose banner ---
GameAssist v2.0.0 package metadata is validated as JSON, reconciled with supported
commands and user-visible behavior, and checked against its release artifact.
No secrets are required. Do not emit secrets or player data outside the Roll20
sandbox. This document describes packaging, not live Roll20 acceptance.
-->

<!-- [GAMEASSIST_PR81_CURRENT_SCRIPT:STATIC] BEGIN -->
<!--
Section Title: Roll20 package metadata
mechsuit_section: {
  codename: "GAMEASSIST_PR81_CURRENT_SCRIPT",
  area: "STATIC",
  title: "Package metadata",
  guarantees: ["Existing command identifiers are preserved.", "The description documents implemented user controls."],
  depends_on: ["GameAssist", "README.md", "Smoketest.md"],
  provides: ["script.json"],
  seams: ["Roll20 One-Click package review"],
  risks: ["Local validation cannot confirm live Roll20 UI behavior."],
  last_updated_version: "v2.0.0"
}
Narrative
The JSON file remains valid package data. This sidecar supplies commentary that
cannot be embedded in that artifact. It contains no campaign-specific records.
-->

# Package Contract

- Source of truth: `../script.json`, edited as structured JSON; it is not generated.
- Regeneration: not applicable. Preserve existing fields and commands when updating supported behavior.
- Release file: `GameAssist.js`, synchronized byte-for-byte with `GameAssist` and `GameAssist-v2.0.0`.
- Description: user-facing Markdown stored as one JSON string. Keep limitations and optional dependencies explicit.
- Verification: parse JSON; check version and script filename; reconcile advertised commands with the current router; compare all three release-file hashes.
- AlmanacAssist 2.0.4 adds Current Settings, editable local influence profiles, and independent named-location snapshots while retaining the linked-world controls and saved data. The package remains GameAssist v2.0.0.

<!--
Notes & Comments
Changed (v2.0.0): Added Current Settings commands and described baseline/profile adjustments with named-location save and recall. The existing command inventory and package version remain intact.
Prior notes:
Changed (v2.0.0): Added explicit location-management and destination-palette commands and described pre-travel location setup; no package version or release filename changed.
Prior notes:
Changed (v2.0.0): Added the metadata sidecar and recorded the natural-world palette command and description update.
Decision log:
  CHOICE: Keep commentary in a sidecar; ALT: add non-schema JSON fields; REJECTED: package consumers should receive only package metadata.
  EXEMPT: This static artifact has no executable validators, envelopes, runtime tunables, metrics, or spans. Validation occurs before delivery using a JSON parser and artifact checks.
  The artifact exceeds 100 lines; its content is not duplicated here.
-->
<!-- [GAMEASSIST_PR81_CURRENT_SCRIPT:STATIC] END -->
