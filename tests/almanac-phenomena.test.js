// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_PHENOMENA_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise bounded explicit Phenomena overlays, no-write SceneResolver composition, and reviewed Roll20 controls against the shipped executable."
//   order: ["artifact_identity","read_only_scene_overlay","future_record_preservation","active_capacity_preservation","reviewed_activation","reviewed_deactivation","explicit_expiry_cleanup","worldbuilding_controls"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never infer or install published setting data."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_PHENOMENA_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap with bounded generic world fixtures." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_PHENOMENA_TEST]/
//     └─ [GAMEASSIST_ALMANAC_PHENOMENA_TEST:CHECKS]
// --- prose banner ---
// This Node-only check proves that owner-authored Phenomena are explicit,
// immutable scene evidence rather than replacement Weather or Environment state.
// It also exercises the two-step GM activation/deactivation workflow and explicit
// fictional-time expiry cleanup without claiming live Roll20 acceptance.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_PHENOMENA_TEST:CHECKS] BEGIN
// Section Title: Explicit Phenomena overlay checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_PHENOMENA_TEST",
//   area: "CHECKS",
//   title: "Explicit Phenomena overlay checks",
//   guarantees: ["SceneResolver filters scoped and elapsed overlays without writes.","GM overlay changes are reviewed, bounded, and do not replace other provider authority."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["Phenomena focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_PHENOMENA_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function stateDigest(harness) {
    return JSON.stringify(harness.state);
}

function sceneWithoutWrites(harness) {
    const before = stateDigest(harness);
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(stateDigest(harness), before, 'resolving Phenomena must not write world, time, Weather, or Environment state');
    return scene;
}

function installPhenomenaWorld(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.world = {
        schemaVersion: 3,
        revision: 4,
        regions: [],
        geographies: [],
        ecoregions: [],
        biomes: [],
        locations: [
            { id: 'watch-camp', name: 'Watch Camp', description: 'A generic camp', tags: [] },
            { id: 'river-ford', name: 'River Ford', description: 'A generic ford', tags: [] }
        ],
        destinations: [],
        routes: [],
        phenomena: [
            {
                id: 'ashfall', name: 'Ashfall', description: 'Fine ash settles over the road.', tags: ['ash'],
                locationId: 'watch-camp', category: 'Atmospheric', visibilityNote: 'Fine ash reduces distant sightlines.',
                terrainNote: 'Ash makes stones slick.', travelNote: 'Cover supplies and watch footing.', severity: 3,
                defaultDurationHours: 2
            },
            {
                id: 'distant-comet', name: 'Distant Comet', description: 'A harmless astronomical sight.', tags: ['sky'],
                locationId: null, category: 'Celestial', visibilityNote: 'A pale tail is visible after dusk.',
                terrainNote: '', travelNote: '', severity: 1, defaultDurationHours: 0
            }
        ],
        activeLocationId: 'watch-camp',
        favoriteLocationIds: [],
        rulesProfile: '2014'
    };
    almanac.runtime.world = {
        schemaVersion: 3,
        revision: 2,
        recentLocationIds: [],
        destinationGrants: {},
        travel: { schemaVersion: 1, revision: 0, journey: null, grants: {}, history: [] },
        phenomenonGrants: {},
        activePhenomena: [],
        phenomenaHistory: []
    };
    almanac.runtime.weather.current = {
        id: 'weather-unchanged', summary: 'Clear', temperatureF: 58, windMph: 4,
        precipitation: 'None', cloud: 'Clear', visibility: 'Clear', severity: 0
    };
    almanac.runtime.environment.current = {
        id: 'environment-unchanged', name: 'Firm Ground', visibility: 'Clear', ground: 'Firm', water: 'Normal'
    };
}

function assertReadOnlyOverlayComposition(harness) {
    installPhenomenaWorld(harness);
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.phenomenaStateSchemaVersion, 1, 'the public API must disclose the supported Phenomena record schema');
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    const worldMinute = runtime.time.worldMinute;
    runtime.world.activePhenomena = [
        { schemaVersion: 1, id: 'active-ashfall', phenomenonId: 'ashfall', locationId: 'watch-camp', activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: null },
        { schemaVersion: 1, id: 'active-comet', phenomenonId: 'distant-comet', locationId: null, activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: worldMinute + 120 },
        { schemaVersion: 1, id: 'other-place', phenomenonId: 'ashfall', locationId: 'river-ford', activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: null },
        { schemaVersion: 1, id: 'elapsed', phenomenonId: 'distant-comet', locationId: null, activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: worldMinute }
    ];

    const scene = sceneWithoutWrites(harness);
    assert.equal(Array.from(scene.phenomena, item => item.name).join('|'), 'Ashfall|Distant Comet', 'SceneResolver must include current-location and global overlays but filter other locations and elapsed durations');
    assert.equal(scene.terrain.phenomenaEffects[0], 'Ash makes stones slick.', 'Phenomena may add explicit terrain presentation evidence');
    assert.equal(scene.weather.current.id, 'weather-unchanged', 'Phenomena must not replace Weather authority');
    assert.equal(scene.environment.current.id, 'environment-unchanged', 'Phenomena must not replace Environment authority');
    assert.equal(scene.provenance['phenomena.active'].authority, 'Phenomena', 'active overlays must carry Phenomena provenance');
    assert.equal(scene.provenance['terrain.phenomenaEffects'].authority, 'Phenomena', 'terrain presentation effects must remain Phenomena-owned evidence');
    assert.ok(scene.warnings.some(warning => warning.code === 'PHENOMENA_OVERLAY_UNAVAILABLE'), 'elapsed overlays must remain explicit warnings until a GM cleanup action');
    assert.equal(Object.isFrozen(scene.phenomena), true, 'the Phenomena collection must be immutable');
    assert.equal(Object.isFrozen(scene.phenomena[0]), true, 'nested Phenomena evidence must be immutable');
}

function assertFutureRecordIsPreserved(harness) {
    installPhenomenaWorld(harness);
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    runtime.world.activePhenomena = [{ schemaVersion: 99, opaqueFutureField: 'preserve me' }];
    const before = stateDigest(harness);
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(stateDigest(harness), before, 'a newer active Phenomenon record must remain untouched by SceneResolver');
    assert.equal(scene.phenomena.length, 0, 'a newer record must not be guessed into current-scene facts');
    assert.ok(scene.warnings.some(warning => warning.code === 'PHENOMENA_OVERLAY_UNAVAILABLE'), 'a newer record must report warning-only unavailable evidence');
}

function assertCapacityRefusalPreservesOpaqueFutureRecord(harness) {
    installPhenomenaWorld(harness);
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    const opaqueFuture = {
        schemaVersion: 99,
        id: 'future-overlay-record',
        opaqueFutureField: { preserve: 'exactly', nested: ['future', 'data'] }
    };
    runtime.world.activePhenomena = [
        opaqueFuture,
        ...Array.from({ length: 11 }, (_, index) => ({
            schemaVersion: 1,
            id: `known-overlay-${index + 1}`,
            phenomenonId: 'ashfall',
            locationId: 'watch-camp',
            activatedAt: '2026-01-01T00:00:00.000Z',
            expiresWorldMinute: null
        }))
    ];
    const opaqueBefore = JSON.stringify(runtime.world.activePhenomena[0]);
    const activeBefore = JSON.stringify(runtime.world.activePhenomena);
    const refusal = harness.dispatchCommand('!aa-phenomena activate --id distant-comet');
    assert.equal(refusal.length, 1, 'capacity refusal must render one narrow panel');
    assert.match(refusal[0].message, /Active Overlay Limit/, 'a full active collection must refuse a new review before any activation append');
    assert.equal(runtime.world.activePhenomena.length, 12, 'capacity refusal must keep the full active collection intact');
    assert.equal(JSON.stringify(runtime.world.activePhenomena[0]), opaqueBefore, 'capacity refusal must preserve the opaque future record without normalization or displacement');
    assert.equal(JSON.stringify(runtime.world.activePhenomena), activeBefore, 'capacity refusal must not append-and-trim or otherwise reorder active overlays');
    assert.equal(Object.keys(runtime.world.phenomenonGrants).length, 0, 'capacity refusal must not create a review grant');
}

function reviewId(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.world.phenomenonGrants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'a single reviewed action must retain exactly one bounded grant in this fixture');
    return ids[0];
}

function assertReviewedWorkflow(harness) {
    installPhenomenaWorld(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const beforeWeather = JSON.stringify(almanac.runtime.weather);
    const beforeEnvironment = JSON.stringify(almanac.runtime.environment);
    const beforeMinute = almanac.runtime.time.worldMinute;

    const review = harness.dispatchCommand('!aa-phenomena activate --id ashfall');
    assert.equal(review.length, 1, 'activation review must render one narrow GM panel');
    assert.match(review[0].message, /Review Activation/, 'activation must stop at an explicit review card');
    assert.equal(almanac.runtime.world.activePhenomena.length, 0, 'reviewing activation must not activate an overlay');
    assert.match(review[0].message, /Provider Boundaries/, 'review must state non-authoritative boundaries');

    const activate = harness.dispatchCommand(`!aa-phenomena confirm --grant ${reviewId(harness)}`);
    assert.equal(activate.length, 1, 'confirmed activation must render one result panel');
    assert.match(activate[0].message, /Activated/, 'confirmation must state the applied action');
    assert.equal(almanac.runtime.world.activePhenomena.length, 1, 'only accepted activation may add one active overlay');
    const active = almanac.runtime.world.activePhenomena[0];
    assert.equal(active.phenomenonId, 'ashfall', 'active record must reference the reviewed definition');
    assert.equal(active.locationId, 'watch-camp', 'activation must retain the reviewed location scope');
    assert.equal(active.expiresWorldMinute, beforeMinute + 120, 'default duration must become a fictional-time expiration');
    assert.equal(JSON.stringify(almanac.runtime.weather), beforeWeather, 'activation must leave Weather state byte-for-byte unchanged');
    assert.equal(JSON.stringify(almanac.runtime.environment), beforeEnvironment, 'activation must leave Environment state byte-for-byte unchanged');
    assert.equal(almanac.runtime.time.worldMinute, beforeMinute, 'activation must not advance fictional time');

    const scene = sceneWithoutWrites(harness);
    assert.equal(scene.phenomena[0].name, 'Ashfall', 'accepted activation must become current-scene overlay evidence');

    const menu = harness.dispatchCommand('!phenomena');
    assert.equal(menu.length, 1, 'the direct Phenomena alias must share the compact handler');
    assert.match(menu[0].message, /Almanac \/ Phenomena/, 'direct alias must render the Phenomena panel');
    assert.doesNotMatch(menu[0].message, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'normal Phenomena panels must not dump raw JSON');

    const hyphenAlias = harness.dispatchCommand('!PHENOMENA-status');
    assert.equal(hyphenAlias.length, 1, 'the case-insensitive hyphenated Phenomena alias must share the compact handler');
    assert.match(hyphenAlias[0].message, /Almanac \/ Phenomena/, 'the close hyphen variant must reach the Phenomena panel');

    const aaHyphenAlias = harness.dispatchCommand('!aa-phenomena-status');
    assert.equal(aaHyphenAlias.length, 1, 'the Almanac-prefixed close hyphen Phenomena alias must share the compact handler');
    assert.match(aaHyphenAlias[0].message, /Almanac \/ Phenomena/, 'the Almanac-prefixed close hyphen form must reach the Phenomena panel');

    const deactivateReview = harness.dispatchCommand(`!aa-phenomena deactivate --id ${active.id}`);
    assert.equal(deactivateReview.length, 1, 'deactivation must first render one review panel');
    assert.match(deactivateReview[0].message, /Review Deactivation/, 'deactivation must be explicitly reviewed');
    assert.equal(almanac.runtime.world.activePhenomena.length, 1, 'reviewing deactivation must not remove the overlay');

    const deactivate = harness.dispatchCommand(`!aa-phenomena confirm --grant ${reviewId(harness)}`);
    assert.equal(deactivate.length, 1, 'confirmed deactivation must render one result panel');
    assert.match(deactivate[0].message, /Deactivated/, 'deactivation confirmation must state the removal');
    assert.equal(almanac.runtime.world.activePhenomena.length, 0, 'only accepted deactivation may remove the overlay');
    assert.ok(almanac.runtime.world.phenomenaHistory.some(item => item.action === 'activated'), 'activation history must be retained');
    assert.ok(almanac.runtime.world.phenomenaHistory.some(item => item.action === 'deactivated'), 'deactivation history must be retained');
}

function assertExplicitExpiryCleanup(harness) {
    installPhenomenaWorld(harness);
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    runtime.world.activePhenomena = [{
        schemaVersion: 1, id: 'elapsed-ash', phenomenonId: 'ashfall', locationId: 'watch-camp',
        activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: runtime.time.worldMinute
    }];
    const scene = sceneWithoutWrites(harness);
    assert.equal(scene.phenomena.length, 0, 'expired overlays must disappear from a read-only scene without mutating runtime');
    assert.equal(runtime.world.activePhenomena.length, 1, 'expired records remain until an explicit GM cleanup action');

    const cleanup = harness.dispatchCommand('!aa-phenomena cleanup --confirm yes');
    assert.equal(cleanup.length, 1, 'explicit expiry cleanup must render one result panel');
    assert.match(cleanup[0].message, /Cleanup Complete/, 'cleanup must identify its deliberate action');
    assert.equal(runtime.world.activePhenomena.length, 0, 'explicit cleanup must remove elapsed overlays');
    assert.ok(runtime.world.phenomenaHistory.some(item => item.action === 'expired-cleanup'), 'explicit cleanup must leave bounded history evidence');
}

function assertWorldbuildingControls(harness) {
    installPhenomenaWorld(harness);
    const world = harness.dispatchCommand('!aa-world phenomena');
    assert.equal(world.length, 1, 'Worldbuilding must list Phenomenon definitions');
    assert.match(world[0].message, /Worldbuilding \/ Phenomena/, 'Phenomenon definitions must have an organized Worldbuilding entry');

    const editor = harness.dispatchCommand('!aa-world edit phenomenon --id ashfall');
    assert.equal(editor.length, 1, 'a Phenomenon definition must have a bounded chat editor');
    assert.match(editor[0].message, /Scope &amp; Category|Scope & Category/, 'editor must expose scope and category rather than raw JSON');
    assert.match(editor[0].message, /Review Activate/, 'editor must route use through reviewed activation');

    const set = harness.dispatchCommand('!aa-world set phenomenon --id ashfall --field severity --value 4');
    assert.equal(set.length, 1, 'a supported Phenomenon field edit must return the editor');
    assert.equal(harness.state.GameAssist.AlmanacAssist.config.world.phenomena.find(item => item.id === 'ashfall').severity, 4, 'severity must remain bounded editable definition data');
}

function run() {
    assertExecutableArtifactsAreIdentical();

    const overlayHarness = createHarness();
    assertReadOnlyOverlayComposition(overlayHarness);

    const futureHarness = createHarness();
    assertFutureRecordIsPreserved(futureHarness);

    const capacityHarness = createHarness();
    assertCapacityRefusalPreservesOpaqueFutureRecord(capacityHarness);

    const workflowHarness = createHarness();
    assertReviewedWorkflow(workflowHarness);

    const expiryHarness = createHarness();
    assertExplicitExpiryCleanup(expiryHarness);

    const worldbuildingHarness = createHarness();
    assertWorldbuildingControls(worldbuildingHarness);

    process.stdout.write('PASS: AlmanacAssist Phenomena focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused evidence for generic, explicit, reviewed Phenomena overlays, including capacity refusal that preserves opaque future-schema active records.
// Decision log:
//   CHOICE: make expiry cleanup explicit — ALT: silently prune during SceneResolver reads; REJECTED: a read-only resolver must not mutate gameplay-facing state.
//   CHOICE: preserve newer overlay records without interpretation — ALT: coerce or delete unfamiliar shapes; REJECTED: forward data must remain warning-only and recoverable.
// [GAMEASSIST_ALMANAC_PHENOMENA_TEST:CHECKS] END
// ============================================================================
