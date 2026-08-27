<!--
--- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE"
  project_version: "v2.0.0"
  purpose: "Record the migration-safe WorldPack, palette, geographic-instance, and runtime model that guides AlmanacAssist v2.0.0 implementation."
  order: ["scope","terms","layers","identity","schema","resolution","installation","scale","migration","validation","authoring","delivery"]
  data_class: "Internal"
  ai_data: "internal_redacted"
  refusals:
    - "Never represent protected published settings or copied setting material as built-in WorldPack content."
    - "Never silently overwrite campaign customization, runtime state, or unknown future data."
    - "Never claim local structural checks prove live Roll20 behavior."
  canonical_tree: |
    [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE]/
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCOPE]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MODEL]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCHEMA]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:RESOLUTION]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:INSTALLATION]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCALE]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MIGRATION]
    ├─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:VALIDATION]
    └─ [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:DELIVERY]
-->

# AlmanacAssist v2.0.0 — WorldPack Architecture

This note turns the owner-approved WorldPack Architecture, Scope, and Scaling
Specification into implementation contracts. It is an internal build document,
not a public-release claim. A test or local harness can establish only the named
structural behavior; the Roll20 sandbox remains the final authority for live
rendering, state lifecycle, and campaign usability.

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCOPE] BEGIN -->
## 1. Scope and non-goals

A **WorldPack** is a setting-scale, portable definition package. It is not a
single encounter area, a current Scene snapshot, an opaque `worldExtras` bag, or
a substitute name for the compact legacy starter cards.

A complete built-in WorldPack is expected to support meaningful play immediately:
multiple major Regions and child Regions, a substantial hierarchy of Ecoregion
Instances and Locations, prepared destinations, routes and route legs, a reusable
palette, clear provenance, and compact Session Mode selection. A campaign does
not need to visit every record for a pack to count as complete; it needs enough
connected, prepared, original material to start and sustain play without building
a world from empty records.

`Ember Coast`, `Sunward Expanse`, `Frostfall Marches`, and `Mirewood Basin` are
legacy subregion-scale examples. They may occur as subordinate original geography
inside a larger world only where that placement remains coherent. They are not
WorldPack identities, full-world substitutes, or advertised setting-scale packs.

Published settings named in planning conversations are reference workloads for
scale and architecture only. Built-in content must not include their protected
names, lore, maps, calendars, astronomy, mechanics, copied phrases, or derivative
setting-specific material.

### 1.1 Current built-in catalog boundary

The current v2.0.0 build ships four immutable, original source packages:
**Asterfall Concord**, **Veyra Turning**, **Narthvale Compact**, and **Lumenfen
Atlas**. Each currently contains one root plus eight child Regions, 160 Locations,
24 Prepared Destinations, 215 connected Routes with explicit Route Legs (including
seven original secondary/shortcut choices per child Region), 24 ready-to-activate
Phenomena, and one typed record in every palette collection. That is 456 geographic
records and 12 reusable palette records per source, meeting the medium-world
200–350 Route workload band documented below.

This count is structural source evidence, not a claim of live Roll20 usability.
A source is copied through normalization and an expiring Preview → Confirm plan
before a campaign receives its editable clone. Installation deliberately does not
select a Location, move a party, alter provider state, or start a journey; the
post-install panel routes the GM to choose a starting Location explicitly.

<!-- --- Notes & Comments ---
Changed (v2.0.0): expands every immutable source to 215 Routes and 456 geographic records through seven original non-adjacent secondary/shortcut choices per child Region; this meets the documented 200–350 Route medium-world band without adding copied maps, route data, or setting mechanics.
Prior notes:
  Changed (v2.0.0): records the earlier four-source catalog checkpoint with 160 Locations, 159 Routes, and 400 geographic records, while explicitly retaining the no-live-acceptance boundary.
  Changed (v2.0.0): records the owner correction that legacy named cards are subordinate geography rather than shipped Worlds or full WorldPacks.
Decision log:
  CHOICE: define completeness through connected campaign-ready setting material — ALT: count a few generic records as a world; REJECTED: that repeats the live-product gap found in the compact starter approach.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCOPE] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MODEL] BEGIN -->
## 2. The three-layer model

The implementation keeps three kinds of data distinct even when one GM command
reviews them together.

| Layer | Owner | Mutability | Examples | Must not contain |
| --- | --- | --- | --- | --- |
| **PresetRegistry source** | GameAssist release | immutable | built-in WorldPack source, catalog metadata, release provenance | campaign edits, active Location, weather, transient grants |
| **WorldPack definition** | campaign after installation, or campaign author | editable with provenance | palette, geographic graph, package metadata, dependency declarations | live Scene, active journey, transient confirmation grants |
| **Campaign runtime** | active campaign/session | mutable and bounded | active Location, favorites, recents, travel progress, active phenomena, preview grants | ordinary package source definitions |

An installed preset is a **campaign-owned clone**, not a pointer into the immutable
PresetRegistry. Updating a preset asks the GM to review a new source definition
against the installed clone and a manifest. It never mutates source data and never
silently removes campaign edits.

A custom pack is a campaign-owned WorldPack definition with `provenance.type`
`owner-authored`. It uses the same schema, installation, export, validation, and
conflict contracts as an installed clone. A pack imported from a handout is inert
text until validation and an explicit current confirmation succeed.

### 2.1 Palette definitions vs geographic instances

A palette definition describes a reusable concept. A geographic instance places
that concept in a particular world.

- **Ecoregion Profile:** reusable composition such as "rain-shadow upland" with
  references to reusable climate, biome, geography, hydrology, weather, travel,
  astronomy, and temporal policies where applicable.
- **Ecoregion Instance:** a named, placed part of one geographic graph. It points
  at an Ecoregion Profile and may make documented local overrides.
- **Region:** a named geographic container. A Region may have a `parentRegionId`,
  so a subregion is a child Region rather than an overloaded tag or duplicate
  WorldPack.
- **Location:** a named place in the graph. It inherits context from the nearest
  applicable Ecoregion Instance and Region ancestry, then from the WorldPack
  palette, before campaign-wide fallbacks apply.

The palette uses these first-class collections:

1. Climate Profiles
2. Biome Profiles
3. Environment Profiles
4. Ecoregion Profiles
5. Geography Profiles
6. Hydrology Profiles
7. Weather Policies
8. Travel Profiles
9. Astronomy Profiles
10. Calendars
11. Temporal Context definitions
12. Phenomena Templates

The geographic graph uses Regions, Ecoregion Instances, Locations, Prepared
Destinations, Routes, and Route Legs. Existing legacy geographic and biome record
collections migrate as compatible v1 graph records rather than being magically
relabelled as all-purpose profiles.

<!-- --- Notes & Comments ---
Changed (v2.0.0): establishes the owner-required source/install/runtime and palette/instance separations before broad data authoring.
Decision log:
  CHOICE: preserve installed copies as campaign-owned definitions — ALT: reference immutable presets in place; REJECTED: a release upgrade would overwrite campaign customization or make it impossible to preserve it.
  CHOICE: model Ecoregion Profile and Ecoregion Instance separately — ALT: add optional fields to one overloaded ecoregion record; REJECTED: reusable palette concepts and named geography then become indistinguishable.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MODEL] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCHEMA] BEGIN -->
## 3. Portable definition shape

The canonical portable representation is deterministic JSON with stable key order
on export. The human-editable representation is a documented WorldPack Worksheet:
a fixed marker and one fenced `json` block surrounded by inert author guidance.
The parser accepts either raw canonical JSON or exactly one worksheet JSON block;
it ignores worksheet prose, rejects missing/ambiguous blocks, and never executes
handout text. Both representations normalize to the same definition, retain the
same stable record IDs and provenance, and use the same Preview → Confirm path.

A schema-v2 package has this conceptual shape:

```text
WorldPack v2
├─ format, schemaVersion, id, version, name, description, tags, provenance
├─ palette
│  ├─ climateProfiles, biomeProfiles, environmentProfiles
│  ├─ ecoregionProfiles, geographyProfiles, hydrologyProfiles
│  ├─ weatherPolicies, travelProfiles, astronomyProfiles
│  ├─ calendars, temporalContexts, phenomenonTemplates
├─ world
│  ├─ regions, ecoregionInstances, locations
│  ├─ preparedDestinations, routes, routeLegs
│  └─ named instance-level phenomena where needed
├─ bindings
│  ├─ defaultClimateProfileId, defaultWeatherPolicyId
│  ├─ defaultTravelProfileId, defaultAstronomyProfileId
│  ├─ defaultCalendarId, defaultTemporalContextId
│  └─ defaultEnvironmentProfileId
└─ dependencies
   ├─ external package/provider references only
   └─ resolved internal references are validated directly
```

`bindings` identifies package defaults. It is not runtime state. For example,
`defaultCalendarId` identifies a calendar definition; it does not set the current
fictional minute. A Scene's active Location, a current weather observation, an
in-progress journey, and temporary Phenomena live in campaign runtime.

Every record has a stable `id`, bounded name/description/tags, and source
provenance. Importers reject duplicate IDs within their own type and ambiguous
cross-layer identifiers. A relation declares both its target type and whether
absence is permitted. IDs must remain stable across a compatible update; changing
them is a copy/new-pack operation rather than an invisible update.

### 3.1 Provenance and manifests

A provenance record identifies at least the source type, original source pack ID,
source version, source record ID, and a digest of the source record as installed.
The installed clone retains its own editable record and manifest entry. A changed
campaign record is therefore detectable without comparing it to untrusted source
text at update time.

Package manifests are domain-aware: palette and geographic records appear in
separate collections. This prevents an update implementation from treating a
palette definition as a Location merely because both use an `id` field.

<!-- --- Notes & Comments ---
Changed (v2.0.0): defines the target v2 wire contract and separate canonical/worksheet authoring representations.
Decision log:
  CHOICE: use canonical JSON only after parsing/normalization — ALT: preserve source formatting as semantic data; REJECTED: deterministic digests, review diffs, and conflict checks need a stable canonical form.
  CHOICE: keep binding choices in the definition and live selections in runtime — ALT: persist current Scene in the package; REJECTED: portability would leak campaign session state and make imports destructive.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCHEMA] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:RESOLUTION] BEGIN -->
## 4. Scene and Travel resolution

`SceneResolver` composes a read-only scene from package definition plus campaign
runtime. It does not store a Scene in the package and does not mutate providers
merely to read context.

For a Location, the normal resolution chain is:

```text
explicit safe Location override
→ assigned Ecoregion Instance
→ nearest child/parent Region context
→ WorldPack bindings and referenced palette definitions
→ campaign-wide provider fallback
```

The result retains field-level provenance for the authority actually chosen.
Existing direct Location Climate precedence remains useful: a direct valid Location
climate assignment wins over Ecoregion context; a valid Ecoregion assignment wins
over a campaign fallback. The v2 chain expands this rather than discarding it.
For compatibility, public scene/event scope remains the coarse `location`,
`ecoregion`, or `campaign` value. Separate source-kind evidence distinguishes a
direct Climate region from a Location/Ecoregion WorldPack Climate Profile, so richer
provenance does not break existing consumers that use the coarse scope.

Travel resolves the origin, destination, selected Route, and Route Legs through
the same graph. Route/leg profile choices can supply a travel policy, terrain,
seasonal limitation, and ecoregion transition evidence. Travel never advances time,
changes the active Location, or rewrites weather merely because a route was viewed.
Those remain explicit reviewed runtime operations.

Provider ownership remains clear:

- Time owns canonical fictional minute.
- Calendar/Temporal definitions project or label that minute; they do not create
  competing clocks.
- Climate owns baseline context.
- Weather owns current observed/forecast conditions.
- Environment owns immediate scene state and a deliberate runtime override.
- Astronomy owns celestial context.
- WorldPack definitions supply reusable policies and references, not arbitrary
  writes into those providers.

<!-- --- Notes & Comments ---
Changed (v2.0.0): converts the high-level hierarchy into a concrete SceneResolver and Travel inheritance rule without claiming that all provider adapters are already implemented.
Changed (v2.0.0): preserves coarse public Climate scope values while adding separate source-kind provenance for WorldPack profile resolution.
Decision log:
  CHOICE: resolve through typed references and preserve field provenance — ALT: flatten effective values on package install; REJECTED: a flattened copy loses source authority and cannot react correctly to an intentional campaign override.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:RESOLUTION] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:INSTALLATION] BEGIN -->
## 5. Installation, updates, exports, and deletion safety

### 5.1 Preset installation

A built-in catalog entry previews immutable source metadata and scale facts. The
GM chooses install. The command constructs an install plan containing a campaign
clone, any required palette/geographic records, an installation manifest, and no
runtime changes. A short-lived confirmation grant guards the final atomic commit.

The Library and Installed WorldPacks screen also compare a verified installed
preset clone with its immutable source version. When the source is newer, a visible
**Review Update** control prepares the same expiring, manifest-checked plan. A
current source creates no redundant grant. If a protected campaign edit prevents
replacement, the refusal names a bounded set of affected records and offers a
reviewed **Independent Copy** of the immutable source; it never turns a source into
a live pointer or overwrites the original clone.

### 5.2 Import and custom authoring

Handout text is parsed as data, bounded before deep normalization, validated for
syntax/schema/semantic/reference/conflict issues, and shown as a compact review.
It is never evaluated. The parser must distinguish malformed input from a valid
future schema and must leave unknown future data untouched.

### 5.3 Conflict-aware updates

An update compares the incoming source package to the installed manifest and then
compares each installed clone record to the manifest digest.

- unchanged installed source record: eligible for proposed update;
- campaign-modified record: listed as a bounded named conflict and never overwritten;
- incoming removed geographic or palette record: update refused before preview, so
  the existing campaign clone remains exactly intact;
- new incoming record: proposed as an addition only after the existing manifest
  and campaign-owned clone are verified unchanged;
- changed relation target: normalized and validated before the expiring review.

The current implementation refuses an update containing unresolved conflicts,
missing previously installed records, missing old manifests, or changed installed
palette bindings. It reports a bounded set of affected records and keeps every
campaign branch unchanged. Built-in-source refusals offer an explicit reviewed
Independent Copy path; handout imports retain their explicit Import as Copy mode.
A later merge screen can let a GM choose source/campaign/manual values per field
without weakening the no-silent-overwrite guarantee.

### 5.4 Dependency-aware export

An export starts from selected package roots or package-owned records and follows
typed internal references. It includes needed palette definitions and graph
ancestors, reports external dependencies, excludes runtime, and refuses an export
that would contain broken internal references. A compact whole-world export remains
available for a campaign-owned custom WorldPack.

<!-- --- Notes & Comments ---
Changed (v2.0.0): adds a visible immutable-source Review Update lifecycle, bounded named conflict evidence, and an independently reviewed source-copy recovery path; all branches remain unchanged on refusal.
Prior notes:
  Changed (v2.0.0): establishes the atomic, conflict-aware package lifecycle required before source presets can be safely updated in campaigns.
Decision log:
  CHOICE: retain removed source records rather than delete them during an update — ALT: synchronize deletions automatically; REJECTED: destinations, routes, runtime history, and campaign edits may still reference them.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:INSTALLATION] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCALE] BEGIN -->
## 6. Large-world scale and compact Session Mode

Large settings are a primary workload, not an exception. The implementation must
support packages in the order of hundreds of Locations and Routes while preserving
bounded parsing, state size, and readable Roll20 menus.

The workload targets are intentionally approximate rather than a copied setting
catalog:

| Reference workload class | Regions/subregions | Locations | Routes | Practical package expectation |
| --- | ---: | ---: | ---: | --- |
| medium regional world | 10–20 | 150–250 | 200–350 | several connected campaign arcs |
| large continental world | 20–40 | 350–600 | 500–900 | multiple major theaters and travel networks |
| very broad world or plane | 30–60 | 600+ | 900+ | catalog/index-oriented authoring and session selection |

Policy limits, bounded parser limits, object limits, and export limits must rise
together only after the corresponding code avoids quadratic scans in normal
selectors. The target is not an unbounded database; it is a defensible full-world
budget with early refusal and actionable error text.

Session Mode must never dump a full catalog into chat. Location/route selection is
organized around:

1. Current Area
2. Nearby
3. Prepared
4. Favorites
5. Recent
6. Search
7. bounded All views

The current implementation shows at most three representative records from each
compact root group, then uses 12-entry Search/All/Prepared pages for complete
access. Location and Travel use the same name-first selector model; a Travel
choice still opens the existing reviewed plan rather than moving the party.

Worldbuilding management uses the same bounded-access rule without pretending that
the first page is the whole setting. Each ordinary record collection (Regions,
Geographies, Ecoregions, Biomes, Locations, Prepared Destinations, Routes,
Phenomena, and Session Presets) has a 12-entry name-sorted page, Previous/Next
navigation, and name/tag search. Every displayed record has a direct **Edit**
control, so a GM never has to copy a Technical stable ID merely to reach a distant
record. Paging and search are read-only catalog views; they do not reorder stored
records, change provenance, or move the active Location.

The same rule applies inside editors. A Worldbuilding relation, named Roll20 page,
Climate relation, installed-palette profile, Session Preset overlay, Route Leg
Travel Profile, or Route Leg split-through Location opens a separate 12-entry
name/tag-searchable chooser. It does not embed a partial or setting-scale option
list inside one Roll20 query button. The selection action returns through the
ordinary guarded setter/split path, so hierarchy, route-leg continuity, ownership,
and whole-record validation remain authoritative. Because each Route Leg row itself
contains several guarded edit and split actions, its rich editor uses a stricter
four-leg page; a 32-leg route therefore stays compact while retaining complete
Previous/Next access. Palette roots summarize each typed collection, and each
collection/default binding/cross-palette reference has the same paged chooser
pattern. Each reusable palette collection is independently bounded at 160 records;
that is a package-state limit, not a chat-card size target.

The resolver and UI should use indexes keyed by stable ID, Region ancestry,
Ecoregion Instance, and route endpoint. These indexes are derived in memory from
validated definitions and are never authoritative state. A stale/malformed/future
configuration yields a safe warning rather than an improvised rebuild/write.

<!-- --- Notes & Comments ---
Changed (v2.0.0): caps compact Location and Travel groups at three representatives and isolates complete Search/All/Prepared views to 12-entry pages, including a 640-Location local regression workload.
Changed (v2.0.0): extends 12-entry name-first paging and direct Edit access to every Worldbuilding record collection, so setting-scale management does not depend on Technical stable-ID recall.
Changed (v2.0.0): routes editor relations, palette cross-references/defaults, preset overlays, and Route Leg profile/split choices through complete 12-entry named catalogs; this replaces inline query lists that could silently omit distant records or exceed a safe chat-card size.
Prior notes:
  Changed (v2.0.0): makes setting-scale capacity and bounded selector behavior explicit acceptance engineering rather than a future data-size assumption.
Decision log:
  CHOICE: use derived indexes plus compact selector groups — ALT: increase arrays and render them all; REJECTED: a chat UI becomes unusable and repeated full scans risk Roll20 API stalls.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:SCALE] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MIGRATION] BEGIN -->
## 7. Compatibility and migration rules

The existing v1 portable WorldPack format remains importable. Its eight geographic
collections and external climate-region dependencies are interpreted as a legacy
geographic-only package. It must not be rewritten merely because it was read.

When a GM explicitly imports v1 into a v2-capable build, the installer creates a
campaign-owned compatible clone with a migration record. Legacy direct
`climateRegionId` references remain valid compatibility links; they are not
silently replaced with invented climate profiles. The GM can later use an explicit
migration/editor workflow to attach palette definitions.

Existing campaign `world`, provider configurations, World Library snapshots,
runtime history, favorites, recents, active travel, and unknown future state must
be preserved. A migration may add known empty configuration branches, but it must
not discard unrecognized fields or reinterpret future schema versions. If a saved
branch has a newer schema, the relevant commands stay read-only and report why
mutation was blocked.

The current compact World Library entries remain legacy bootstrap fixtures during
migration. They are not rebranded as full built-in WorldPacks. The implemented
PresetRegistry separately holds immutable full source packages and explicit
source-to-installed clone provenance; compact local starters remain an optional
fast-area alternative rather than a replacement for that catalog.

<!-- --- Notes & Comments ---
Changed (v2.0.0): defines v1 import compatibility and preservation boundaries before the portable schema is widened.
Decision log:
  CHOICE: migrate only on an explicit installation/write path — ALT: upgrade all saved WorldPack/world records at startup; REJECTED: startup writes make rollback and future-schema preservation unsafe.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:MIGRATION] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:VALIDATION] BEGIN -->
## 8. Validation and test matrix

Package validation is layered and emits concise categorized feedback:

1. bounded syntax and JSON-like shape;
2. supported schema/version and safe field names;
3. per-record normalization and stable ID uniqueness;
4. typed internal reference validation;
5. palette/profile semantic validation;
6. graph validation, including Region ancestry and route/leg endpoints;
7. dependency and conflict analysis;
8. atomic install/update/export plan validation.

Focused tests must cover at least:

- v1 saved configuration and v1 package preservation/import compatibility;
- v2 palette vs instance distinction and malformed typed references;
- parent/child Region hierarchy and Ecoregion Profile/Instance resolution;
- duplicate IDs, cycles, missing references, bad provenance, malformed state, and
  unrecognized future schemas;
- immutable source catalog, installed clone independence, custom pack behavior,
  and campaign-record provenance;
- atomic parse/preview/confirm behavior, stale preview refusal, visible built-in
  source-update availability/current-state handling, bounded named update conflicts,
  reviewed independent-copy recovery, copy IDs, and dependency-aware export;
- high-cardinality catalog/index/selector behavior without unbounded chat output,
  including palette collection/default/reference, Worldbuilding relation/page/profile,
  Session Preset overlay, and Route Leg profile/intermediate-location pickers;
- per-palette-collection policy refusal at the 160-record state boundary and
  canonical array handling for multi-template Ecoregion Profile references;
- Scene and Travel inheritance, provider ownership, restart/stale conditions,
  permissions, and player privacy boundaries.

Structural tests and local VM harnesses are not evidence that Roll20's rendered
menus, deferred queries, state lifecycle, or sandbox performance work. Live testing
remains deferred until the complete Issue #96 implementation is built.

<!-- --- Notes & Comments ---
Changed (v2.0.0): names the required test classes so a scale-only fixture cannot be mistaken for complete package behavior.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:VALIDATION] END -->

<!-- ======================================================================== -->
<!-- [GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:DELIVERY] BEGIN -->
## 9. Delivery order

1. Add the migration-safe v2 contracts, distinct registry/install/runtime stores,
   typed validators, and scale-aware policy/index seams while retaining v1 import.
2. Connect core palette references to SceneResolver and Travel before catalog data
   depends on them.
3. Add package catalog, human-editable worksheet, source clone installation,
   conflict-aware update, and dependency-aware export.
4. Add compact Session Mode search/current/nearby/prepared/favorites/recent
   selectors over high-cardinality test data.
5. Author four original, independently installable, provenance-bearing full source
   WorldPacks at setting-appropriate depth. The current sources are Asterfall
   Concord, Veyra Turning, Narthvale Compact, and Lumenfen Atlas; each must remain
   reviewed as a world, not a renamed starter area.
6. Execute focused structural/migration/import/scale/privacy tests, then a relevant
   local regression sweep. Only after the complete code program is built is live
   Roll20 validation eligible to begin.

This order deliberately prevents thousands of authored records from becoming
throwaway data in a legacy schema that cannot preserve palette provenance or
support non-destructive updates.

<!-- --- Notes & Comments ---
Changed (v2.0.0): records the implementation order for the owner-approved setting-scale program.
Decision log:
  CHOICE: build the package model before bulk content — ALT: expand starter fixture literals first; REJECTED: the current v1 boundary cannot faithfully carry the required palette, clone, update, or scaling semantics.
[GAMEASSIST_ALMANAC_WORLDPACK_ARCHITECTURE:DELIVERY] END -->
