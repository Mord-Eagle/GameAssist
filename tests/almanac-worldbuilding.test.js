// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_WORLDBUILDING_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise the bounded AlmanacAssist Worldbuilding place model and current-scene composition against the shipped artifact."
//   order: ["artifact_identity","world_scene_composition","unknown_schema_preservation","future_runtime_preservation","worldbuilding_chat_workflow"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never install published setting data or claim live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_WORLDBUILDING_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap and bounded generic place fixtures." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_WORLDBUILDING_TEST]/
//     └─ [GAMEASSIST_ALMANAC_WORLDBUILDING_TEST:CHECKS]
// --- prose banner ---
// This Node-only check reuses the isolated Roll20-shaped harness. It proves generic
// owner-authored place records compose into a no-write scene, newer unknown world
// configuration and runtime schemas are warning-only, and the GM-facing Worldbuilding/Location workflow uses
// bounded chat controls instead of raw JSON.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_WORLDBUILDING_TEST:CHECKS] BEGIN
// Section Title: Worldbuilding and place composition checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_WORLDBUILDING_TEST",
//   area: "CHECKS",
//   title: "Worldbuilding and place composition checks",
//   guarantees: ["Generic Regions, Geography, Ecoregions, Biomes, and Locations compose into field-owned SceneResolver evidence.","Unknown future world configuration and runtime schemas remain warning-only, mutation-blocked, and chat controls avoid raw JSON."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["Worldbuilding focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_WORLDBUILDING_TEST:CHECKS]"] },
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
    assert.equal(stateDigest(harness), before, 'a place-aware SceneResolver read must not write provider or world state');
    return scene;
}

function installGenericWorld(harness) {
    harness.state.GameAssist.AlmanacAssist.config.world = {
        schemaVersion: 1,
        regions: [{ id: 'northlands', name: 'Northlands', description: 'Generic owner-authored northern region', tags: ['north'] }],
        geographies: [{
            id: 'ridge', name: 'Stone Ridge', regionId: 'northlands', latitudeBand: 'Cool temperate', elevation: 'High',
            terrain: 'Rocky ridge', coast: 'Inland', hydrology: 'Perennial headwaters', roughness: 'Steep', tags: ['rock']
        }],
        biomes: [{
            id: 'pinewood', name: 'Pinewood', vegetation: 'Conifers', aridity: 'Moist', ground: 'Needles and roots',
            water: 'Frequent streams', seasonalResponse: 'Snow cover in winter', tags: ['forest']
        }],
        ecoregions: [{
            id: 'ridge-forest', name: 'Ridge Forest', regionId: 'northlands', geographyId: 'ridge', biomeId: 'pinewood',
            climateRegionId: 'home', waterRegime: 'Cold streams', transition: 'Foothill edge', tags: ['upland']
        }],
        locations: [{
            id: 'watch-camp', name: 'Watch Camp', regionId: 'northlands', geographyId: 'ridge', ecoregionId: 'ridge-forest',
            biomeId: 'pinewood', climateRegionId: 'home', environmentName: 'Sheltered watch camp',
            environmentGround: 'Packed earth', environmentWater: 'Spring nearby', modifiers: { temperatureBias: -4, windBias: 3, visibility: 'Canopy-filtered' },
            tags: ['camp']
        }],
        activeLocationId: 'watch-camp',
        favoriteLocationIds: ['watch-camp'],
        rulesProfile: '2014'
    };
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    runtime.weather.current = null;
    runtime.weather.forecast = [];
    runtime.environment.current = null;
    runtime.environment.override = null;
}

function assertWorldSceneComposition(harness) {
    installGenericWorld(harness);
    const scene = sceneWithoutWrites(harness);

    assert.equal(scene.providers.location.status, 'available', 'valid Worldbuilding state must activate the Location authority');
    assert.equal(scene.location.name, 'Watch Camp', 'the active generic Location must compose into the scene');
    assert.equal(scene.region.name, 'Northlands', 'Region must remain distinct from Location');
    assert.equal(scene.geography.terrain, 'Rocky ridge', 'Geography must own persistent terrain');
    assert.equal(scene.ecoregion.waterRegime, 'Cold streams', 'Ecoregion must own local water regime');
    assert.equal(scene.biome.ground, 'Needles and roots', 'Biome must own ecological ground tendency');
    assert.equal(scene.climate.baseline.regionId, 'home', 'a Location climate reference must be interpreted by ClimateAlmanac');
    assert.equal(scene.environment.current.name, 'Sheltered watch camp', 'Location default Environment must be used only when no current Environment or Weather exists');
    assert.equal(scene.terrain.persistentTerrain, 'Rocky ridge', 'terrain must retain persistent Geography evidence');
    assert.equal(scene.terrain.ecologicalGround, 'Needles and roots', 'terrain must retain ecological Biome evidence');
    assert.equal(scene.terrain.immediateGround, 'Packed earth', 'terrain must retain immediate Environment evidence');
    assert.equal(scene.hydrology.persistent, 'Perennial headwaters', 'persistent hydrology must remain Geography-owned');
    assert.equal(scene.hydrology.ecoregionalRegime, 'Cold streams', 'ecoregional hydrology must remain distinct');
    assert.equal(scene.hydrology.immediateWaterAccess, 'Spring nearby', 'immediate water access must remain Environment-owned');
    assert.equal(scene.provenance['terrain.persistentTerrain'].authority, 'Geography', 'persistent terrain provenance must identify Geography');
    assert.equal(scene.provenance['hydrology.persistent'].authority, 'Geography', 'persistent hydrology provenance must identify Geography');
    assert.equal(Object.isFrozen(scene.location), true, 'nested Location evidence must be immutable');
}

function assertFutureSchemaIsWarningOnly(harness) {
    const config = harness.state.GameAssist.AlmanacAssist.config;
    config.world = { schemaVersion: 99, locations: [{ id: 'future', name: 'Future Data' }] };
    const before = stateDigest(harness);
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(stateDigest(harness), before, 'an unknown future Worldbuilding schema must remain byte-for-byte preserved by SceneResolver');
    assert.equal(config.world.schemaVersion, 99, 'the resolver must not downgrade a future schema');
    assert.ok(scene.warnings.some(warning => warning.code === 'WORLD_CONFIGURATION_UNAVAILABLE'), 'a future Worldbuilding schema must report a clear warning');
    assert.equal(scene.location, null, 'future state must not be reinterpreted as a known active Location');
}

function assertFutureRuntimeIsWarningOnly() {
    const futureWorldRuntime = {
        schemaVersion: 99,
        opaqueFutureTransition: { revision: 501, actor: 'future-build', nested: ['preserve', { verbatim: true }] },
        unknownReviewGrants: [{ id: 'future-grant', expiresAt: 987654321 }]
    };
    const harness = createHarness({ runtime: { world: futureWorldRuntime } });
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const beforeRuntime = JSON.stringify(almanac.runtime.world);
    const beforeConfig = JSON.stringify(almanac.config.world);

    assert.equal(beforeRuntime, JSON.stringify(futureWorldRuntime), 'startup must preserve a future Worldbuilding runtime byte-for-byte rather than normalize it');
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.ok(scene.warnings.some(warning => warning.code === 'WORLD_RUNTIME_UNAVAILABLE'), 'SceneResolver must identify a future Worldbuilding runtime as unavailable');
    assert.equal(scene.travel, null, 'SceneResolver must not derive a journey from a future Worldbuilding runtime');
    assert.equal(scene.phenomena.length, 0, 'SceneResolver must not interpret active phenomena from a future Worldbuilding runtime');
    assert.equal(JSON.stringify(almanac.runtime.world), beforeRuntime, 'SceneResolver must not rewrite a future Worldbuilding runtime');

    const status = harness.dispatchCommand('!Almanac-Status');
    assert.equal(status.length, 1, 'status must remain available for a future Worldbuilding runtime');
    assert.match(status[0].message, /Worldbuilding runtime schema 99 is newer than this AlmanacAssist version/i, 'status must surface an explicit future-runtime warning');
    assert.equal(JSON.stringify(almanac.runtime.world), beforeRuntime, 'status must not normalize or expire future Worldbuilding runtime fields');

    const world = harness.dispatchCommand('!aa-world');
    assert.equal(world.length, 1, 'Worldbuilding hub must remain one compact read-only panel');
    assert.match(world[0].message, /Runtime Safety/i, 'Worldbuilding hub must disclose the mutation block for future runtime state');
    assert.equal(JSON.stringify(almanac.runtime.world), beforeRuntime, 'Worldbuilding hub must not rewrite a future runtime branch');
    const records = harness.dispatchCommand('!aa-world locations');
    assert.equal(records.length, 1, 'Worldbuilding record list must remain one compact read-only panel');
    assert.match(records[0].message, /Runtime Safety/i, 'Worldbuilding record list must disclose the future-runtime mutation block');
    assert.equal(JSON.stringify(almanac.runtime.world), beforeRuntime, 'Worldbuilding record list must not rewrite a future runtime branch');

    [
        '!aa-location',
        '!aa-travel',
        '!aa-phenomena',
        '!aa-presets',
        '!aa-world add region --name "Blocked Region"',
        '!aa-worldpacks import --handout missing-handout',
        '!aa-rules profile --value 2024'
    ].forEach(command => {
        const response = harness.dispatchCommand(command);
        assert.equal(response.length, 1, `${command} must return one safe panel against future Worldbuilding runtime data`);
        assert.match(response[0].message, /Worldbuilding runtime schema 99 is newer than this AlmanacAssist version/i, `${command} must refuse rather than reinterpret future Worldbuilding runtime data`);
        assert.equal(JSON.stringify(almanac.runtime.world), beforeRuntime, `${command} must not rewrite, expire, or normalize future Worldbuilding runtime data`);
        assert.equal(JSON.stringify(almanac.config.world), beforeConfig, `${command} must not commit a Worldbuilding configuration change while future runtime semantics are unknown`);
    });
}

function assertWorldbuildingChatWorkflow(harness) {
    installGenericWorld(harness);

    const world = harness.dispatchCommand('!aa-world');
    assert.equal(world.length, 1, 'Worldbuilding Mode must render one compact category panel');
    assert.match(world[0].message, /\{\{name=Almanac \/ Worldbuilding\}\}/, 'Worldbuilding Mode must identify its navigation hierarchy');
    assert.match(world[0].message, /Change Location/, 'Worldbuilding Mode must surface the normal Location workflow');
    assert.doesNotMatch(world[0].message, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'ordinary Worldbuilding panels must not dump raw JSON');

    const add = harness.dispatchCommand('!aa-world add region --name "Southlands"');
    assert.equal(add.length, 1, 'adding a generic Region must produce one editor panel');
    assert.ok(harness.state.GameAssist.AlmanacAssist.config.world.regions.some(region => region.name === 'Southlands'), 'the explicit GM add action must commit one bounded Region');
    assert.match(add[0].message, /Worldbuilding \/ Region \/ Southlands/, 'the add result must open the new record editor rather than a raw state response');
    assert.match(add[0].message, /Basic/, 'ordinary editor opens must begin with Basic everyday fields');
    ['basic', 'detailed', 'technical'].forEach(layer => {
        const editor = harness.dispatchCommand(`!aa-world edit region --id southlands --layer ${layer}`);
        assert.equal(editor.length, 1, `Region ${layer} layer must render one compact panel`);
        assert.match(editor[0].message, new RegExp(`\\/ ${layer[0].toUpperCase()}${layer.slice(1)}`), `editor title must identify the ${layer} layer`);
        assert.match(editor[0].message, /Editor Layer/, 'all record editor layers must retain progressive-disclosure controls');
        assert.doesNotMatch(editor[0].message, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'editor layers must not dump raw JSON');
    });
    const locationTechnical = harness.dispatchCommand('!aa-world edit location --id watch-camp --layer technical');
    assert.equal(locationTechnical.length, 1, 'Location Technical layer must render one panel');
    assert.match(locationTechnical[0].message, /Provenance/, 'Technical layer must expose explicit campaign/pack provenance');
    assert.match(locationTechnical[0].message, /Stable ID/, 'Technical layer must retain stable identity and guarded removal evidence');

    const favorite = harness.dispatchCommand('!aa-location favorite --id watch-camp');
    assert.equal(favorite.length, 1, 'toggling a Location favorite must return to the picker');
    assert.equal(harness.state.GameAssist.AlmanacAssist.config.world.favoriteLocationIds.includes('watch-camp'), false, 'the explicit favorite action must toggle an existing favorite off');

    const use = harness.dispatchCommand('!aa-location use --id watch-camp');
    assert.equal(use.length, 1, 'choosing a Location must render a clear confirmation');
    assert.equal(harness.state.GameAssist.AlmanacAssist.config.world.activeLocationId, 'watch-camp', 'choosing a Location must deliberately update the active place');
    assert.equal(harness.state.GameAssist.AlmanacAssist.runtime.world.recentLocationIds[0], 'watch-camp', 'choosing a Location must maintain bounded recent-place evidence');
    assert.match(use[0].message, /Current Location/, 'location confirmation must say what changed');

    const directAlias = harness.dispatchCommand('!world locations');
    assert.equal(directAlias.length, 1, 'the direct World alias must share the same handler');
    assert.match(directAlias[0].message, /Worldbuilding \/ Locations/, 'the direct World alias must reach the location editor list');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const harness = createHarness();
    assertWorldSceneComposition(harness);
    assertFutureSchemaIsWarningOnly(harness);
    assertFutureRuntimeIsWarningOnly();
    assertWorldbuildingChatWorkflow(harness);
    process.stdout.write('PASS: AlmanacAssist Worldbuilding focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused generic-place, SceneResolver composition, future configuration/runtime preservation, mutation blocking, and bounded Worldbuilding chat workflow evidence.
// Decision log:
//   CHOICE: use generic owner-authored place fixtures — ALT: install named published-setting data; REJECTED: setting provenance and licensing review remain an explicit separate gate.
// [GAMEASSIST_ALMANAC_WORLDBUILDING_TEST:CHECKS] END
// ============================================================================
