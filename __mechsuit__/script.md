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
  guarantees: ["Existing command identifiers are preserved.", "The description documents implemented user controls.", "One-Click description text is ASCII before and after JSON parsing."],
  depends_on: ["GameAssist", "README.md", "Smoketest.md"],
  provides: ["script.json"],
  seams: ["Roll20 One-Click package review"],
  risks: ["Local validation cannot confirm live Roll20 UI behavior.", "Selecting an older script does not roll back saved campaign data."],
  last_updated_version: "v2.0.0"
}
Narrative
The JSON file remains valid package data. This sidecar supplies commentary that
cannot be embedded in that artifact. It contains no campaign-specific records.
-->

# Package Contract

- Source of truth: `../script.json`, edited as structured JSON; it is not generated.
- Regeneration: not applicable to the manifest. Preserve unrelated fields and all existing commands when updating the description.
- Release file: `GameAssist.js`, synchronized byte-for-byte with `GameAssist` and `GameAssist-v2.0.0`.
- Description: user-facing Markdown stored as one JSON string. Keep both the stored JSON and parsed description 7-bit ASCII; use ordinary punctuation and headings without decorative Unicode or Unicode escapes.
- AlmanacAssist 2.0.5 is explicitly **Beta Testing**, optional, and disabled by default. This designation does not label the whole suite beta.
- Preserve the complete command inventory and practical conflict notes. The listing highlights common commands; the manifest retains the detailed inventory.
- Validate against Roll20's `script.json.schema`, parse the complete JSON, check version and script filename, reconcile advertised commands with the router, and compare all three release-file hashes.
- JSON/schema checks and a local Markdown preview do not establish the appearance of the live One-Click listing.

## Versioned Package Layout

- The staged current release is `GameAssist/2.0.0/GameAssist.js`; `GameAssist/GameAssist.js` is the identical current copy.
- Selected new legacy folders are `1.8.2`, `0.1.7.0`, `0.1.6.1`, and `0.1.5.1`, each containing `GameAssist.js`.
- Source of truth for each new legacy copy is the matching archived `GameAssist-v<version>` file in this repository. Preserve its exact version, content, comments, and license notices.
- Regeneration: copy those source bytes into the matching version directory and verify hashes; do not rebuild a historical release from current sections.
- Editing refusal: do not edit generated release copies directly.
- Preserve Roll20's already-published `0.1.4.7`, `0.1.1.2`, `0.1.1.1`, and `0.1.1.0` directories unchanged. The submission overlay does not replace them with local archives.
- `previousversions` names installable folders, not every development checkpoint. Intermediate unpublished patches remain in repository history without separate One-Click entries.
- Include the current LICENSE and ATTRIBUTIONS.md with the package. Historical builds retain their original commands and dependency requirements.

<!--
Notes & Comments
Maintenance (v2.0.0, no semantic change): Replaced the second introductory paragraph with At a Glance, separated home/help/navigation links from command-format guidance, and labeled the support links. Existing feature limits, beta disclosure, metadata fields, command inventory, and ASCII delivery contract are unchanged.
Prior notes:
Changed (v2.0.0): Rebuilt the launch description as ASCII-only Markdown, added the AlmanacAssist Beta Testing notice, and selected four distinct legacy milestones while retaining published versions. Preserved all 622 commands, conflict notes, authorship, object-access declarations, and executable files.
Decision log:
  CHOICE: Plain ASCII headings and punctuation; ALT: numeric HTML entities; REJECTED: avoid relying on a second rendering transformation for essential installation guidance.
  CHOICE: Keep 0.1.5.1, 0.1.6.1, 0.1.7.0, and 1.8.2 as distinct milestones; omit their unpublished intermediate patches from One-Click while preserving the source archives.
  DANGER: An old filename in previousversions does not provide a downgrade of persistent state. Keep the campaign-copy warning visible.
  EXEMPT: Static metadata has no runtime edges, envelopes, tunables, metrics, or spans. JSON schema, command, encoding, and artifact checks validate its delivery contract.
Prior notes:
Changed (v2.0.0): Added layered Current Settings, seasonal response, daily submenu, and weather-control commands; aligned the description with named selectors and saved layer snapshots. Existing commands and the project version remain unchanged.
Prior notes:
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
