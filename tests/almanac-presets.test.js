// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_PRESETS_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise immutable generic PresetRegistry templates, reviewed campaign clone installation, and bounded editable Session Presets against the shipped executable."
//   order: ["artifact_identity","registry_read","preview","reviewed_clone_install","campaign_customization","reference_safety","alias_contract","setting_scale_campaign_catalog"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never install named published setting data or assert live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_PRESETS_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap with bounded generic template and campaign-clone fixtures." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_PRESETS_TEST]/
//     └─ [GAMEASSIST_ALMANAC_PRESETS_TEST:CHECKS]
// --- prose banner ---
// This Node-only check proves generic immutable built-ins are previewed and cloned
// into distinct editable campaign Session Presets. It verifies no provider state is
// changed by installation and campaign-reference deletion remains guarded.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_PRESETS_TEST:CHECKS] BEGIN
// Section Title: PresetRegistry checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_PRESETS_TEST",
//   area: "CHECKS",
//   title: "PresetRegistry checks",
//   guarantees: ["Built-ins remain generic immutable templates and installation creates editable stable campaign clones only after review.","Session Presets retain references without silently applying world-provider or gameplay state."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["PresetRegistry focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_PRESETS_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function installPresetWorld(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.world = {
        schemaVersion: 4,
        revision: 8,
        regions: [],
        geographies: [],
        ecoregions: [],
        biomes: [],
        locations: [{ id: 'watch-camp', name: 'Watch Camp', description: 'Generic owner-authored camp', tags: [] }],
        destinations: [],
        routes: [],
        phenomena: [{
            id: 'ashfall', name: 'Ashfall', description: 'Generic ash overlay', tags: ['ash'], locationId: 'watch-camp',
            category: 'Atmospheric', visibilityNote: 'Fine ash', terrainNote: 'Slick stones', travelNote: 'Cover supplies', severity: 3, defaultDurationHours: 0
        }],
        presets: [],
        activeLocationId: 'watch-camp',
        favoriteLocationIds: [],
        rulesProfile: '2014'
    };
    almanac.runtime.world = {
        schemaVersion: 4,
        revision: 3,
        recentLocationIds: [],
        destinationGrants: {},
        travel: { schemaVersion: 1, revision: 0, journey: null, grants: {}, history: [] },
        phenomenonGrants: {},
        activePhenomena: [],
        phenomenaHistory: [],
        presetGrants: {}
    };
    almanac.runtime.weather.current = {
        id: 'weather-unchanged', summary: 'Clear', temperatureF: 58, windMph: 4,
        precipitation: 'None', cloud: 'Clear', visibility: 'Clear', severity: 0
    };
    almanac.runtime.environment.current = {
        id: 'environment-unchanged', name: 'Firm Ground', visibility: 'Clear', ground: 'Firm', water: 'Normal'
    };
}

function installGrantId(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.world.presetGrants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'one installation review must retain exactly one grant in this fixture');
    return ids[0];
}

function assertRegistryAndReviewedClone(harness) {
    installPresetWorld(harness);
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const registry = api.getPresets();
    assert.equal(api.version, '2.0.0', 'the active AlmanacAssist implementation must identify itself as v2.0.0');
    assert.equal(api.presetRegistrySchemaVersion, 1, 'the public API must disclose the PresetRegistry schema');
    assert.equal(registry.schemaVersion, 1, 'read-only registry output must identify its schema');
    assert.ok(registry.builtIns.length >= 2, 'registry must expose bounded generic built-in templates');
    assert.equal(Object.isFrozen(registry), true, 'registry response must be frozen at the public boundary');
    assert.equal(Object.isFrozen(registry.builtIns[0]), true, 'built-in registry records must be deeply immutable at the public boundary');
    assert.ok(registry.builtIns.every(item => item.tags.includes('generic')), 'built-ins must remain generic rather than bundled setting data');
    const builtInName = registry.builtIns[0].name;
    assert.throws(() => { registry.builtIns[0].name = 'Mutated Template'; }, /read only|Cannot assign/i, 'callers must not be able to mutate a returned built-in');
    assert.equal(api.getPresets().builtIns[0].name, builtInName, 'a returned built-in mutation attempt must never affect the immutable registry');

    const beforeConfig = JSON.stringify(almanac.config.world);
    const beforeWeather = JSON.stringify(almanac.runtime.weather);
    const beforeEnvironment = JSON.stringify(almanac.runtime.environment);
    const beforeMinute = almanac.runtime.time.worldMinute;
    const preview = harness.dispatchCommand('!aa-presets preview --builtin blank-session-context');
    assert.equal(preview.length, 1, 'built-in preview must render one compact panel');
    assert.match(preview[0].message, /Built-in Preview/, 'preview must identify immutable built-in context');
    assert.match(preview[0].message, /no bundled setting lore/i, 'preview must disclose generic built-in safety');
    assert.equal(JSON.stringify(almanac.config.world), beforeConfig, 'preview must not change Worldbuilding configuration');

    const review = harness.dispatchCommand('!aa-presets install --builtin blank-session-context');
    assert.equal(review.length, 1, 'install must first render one review panel');
    assert.match(review[0].message, /Review Install/, 'installation must stop at explicit confirmation');
    assert.equal(almanac.config.world.presets.length, 0, 'reviewing install must not create a campaign clone');

    const installed = harness.dispatchCommand(`!aa-presets confirm --grant ${installGrantId(harness)}`);
    assert.equal(installed.length, 1, 'confirmed install must open one campaign-clone editor');
    assert.match(installed[0].message, /Worldbuilding \/ Session Preset/, 'confirmed installation must open the editable campaign clone');
    assert.equal(almanac.config.world.presets.length, 1, 'accepted installation must create exactly one campaign clone');
    const clone = almanac.config.world.presets[0];
    assert.equal(clone.sourcePresetId, 'blank-session-context', 'clone must retain immutable source identity');
    assert.equal(clone.sourcePresetVersion, 1, 'clone must retain immutable source version');
    assert.ok(clone.id, 'campaign clone must receive a stable editable ID');
    assert.notEqual(clone.id, clone.sourcePresetId, 'campaign clone ID must remain independent from immutable built-in identity');
    const secondReview = harness.dispatchCommand('!aa-presets install --builtin blank-session-context');
    assert.equal(secondReview.length, 1, 'a second reviewed installation must prepare an independent clone rather than edit the first clone');
    harness.dispatchCommand(`!aa-presets confirm --grant ${installGrantId(harness)}`);
    assert.equal(almanac.config.world.presets.length, 2, 'installing a built-in twice must retain two independent campaign clones');
    const secondClone = almanac.config.world.presets.find(item => item.id !== clone.id);
    assert.ok(secondClone && secondClone.id !== clone.id, 'each campaign clone must retain a distinct stable ID');
    assert.equal(secondClone.sourcePresetId, clone.sourcePresetId, 'independent clones may share immutable source provenance only');
    assert.equal(almanac.config.world.activeLocationId, 'watch-camp', 'installation must not change the active Location');
    assert.equal(almanac.runtime.world.activePhenomena.length, 0, 'installation must not activate Phenomena');
    assert.equal(almanac.runtime.world.travel.journey, null, 'installation must not start Travel');
    assert.equal(JSON.stringify(almanac.runtime.weather), beforeWeather, 'installation must not change Weather');
    assert.equal(JSON.stringify(almanac.runtime.environment), beforeEnvironment, 'installation must not change Environment');
    assert.equal(almanac.runtime.time.worldMinute, beforeMinute, 'installation must not advance fictional time');

    const location = harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field locationId --value watch-camp`);
    assert.equal(location.length, 1, 'campaign clone Location assignment must return one editor panel');
    const overlays = harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field phenomenonIds --value ashfall`);
    assert.equal(overlays.length, 1, 'campaign clone Phenomena assignment must return one editor panel');
    const pace = harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field defaultPace --value cautious`);
    assert.equal(pace.length, 1, 'campaign clone pace assignment must return one editor panel');
    const configured = almanac.config.world.presets[0];
    assert.equal(configured.locationId, 'watch-camp', 'campaign clone must retain selected Location reference');
    assert.equal(configured.phenomenonIds[0], 'ashfall', 'campaign clone must retain selected Phenomenon reference');
    assert.equal(configured.defaultPace, 'cautious', 'campaign clone must retain editable travel default');
    const duplicateOverlay = harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field phenomenonIds --value ashfall,ashfall`);
    assert.equal(duplicateOverlay.length, 1, 'duplicate Phenomenon references must normalize into one bounded campaign reference');
    assert.equal(almanac.config.world.presets.find(item => item.id === clone.id).phenomenonIds.length, 1, 'duplicate selected Phenomena must not consume multiple preset slots');
    for (let index = 1; index <= 12; index += 1) {
        almanac.config.world.phenomena.push({
            id: `extra-phenomenon-${index}`, name: `Extra Phenomenon ${index}`, description: '', tags: [], locationId: null,
            category: 'General', visibilityNote: '', terrainNote: '', travelNote: '', severity: 0, defaultDurationHours: 0
        });
    }
    const boundedBefore = JSON.stringify(almanac.config.world.presets.find(item => item.id === clone.id).phenomenonIds);
    const excessive = ['ashfall', ...Array.from({ length: 12 }, (_, index) => `extra-phenomenon-${index + 1}`)].join(',');
    const boundedOverlay = harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field phenomenonIds --value ${excessive}`);
    assert.match(boundedOverlay[0].message, /no more than 12 Phenomenon/i, 'preset Phenomenon selection must refuse more than its bounded reference capacity');
    assert.equal(JSON.stringify(almanac.config.world.presets.find(item => item.id === clone.id).phenomenonIds), boundedBefore, 'bounded reference refusal must preserve the prior campaign preset selection');

    const campaignPreview = harness.dispatchCommand(`!aa-presets preview --id ${clone.id}`);
    assert.equal(campaignPreview.length, 1, 'campaign clone preview must render one compact panel');
    assert.match(campaignPreview[0].message, /Watch Camp/, 'campaign preview must resolve owner-authored Location context');
    assert.match(campaignPreview[0].message, /Ashfall/, 'campaign preview must show prepared overlay references');
    assert.doesNotMatch(campaignPreview[0].message, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'normal PresetRegistry panels must not dump raw JSON');
}

function assertReferenceSafetyAndAliases(harness) {
    installPresetWorld(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const review = harness.dispatchCommand('!aa-presets install --builtin generic-travel-context');
    assert.equal(review.length, 1, 'second fixture must prepare one reviewed clone install');
    harness.dispatchCommand(`!aa-presets confirm --grant ${installGrantId(harness)}`);
    const clone = almanac.config.world.presets[0];
    harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field locationId --value watch-camp`);
    harness.dispatchCommand(`!aa-world set preset --id ${clone.id} --field phenomenonIds --value ashfall`);

    const removeLocation = harness.dispatchCommand('!aa-world remove location --id watch-camp --confirm yes');
    assert.equal(removeLocation.length, 1, 'referenced Location removal must return one guarded panel');
    assert.match(removeLocation[0].message, /Dependencies/, 'preset Location reference must block unsafe removal');
    const removePhenomenon = harness.dispatchCommand('!aa-world remove phenomenon --id ashfall --confirm yes');
    assert.equal(removePhenomenon.length, 1, 'referenced Phenomenon removal must return one guarded panel');
    assert.match(removePhenomenon[0].message, /Dependencies/, 'preset Phenomenon reference must block unsafe removal');

    ['!PRESET-status', '!presets status', '!preset status', '!presets-status', '!aa-presets', '!aa presets', '!aa-presets-status', '!aa presets-status'].forEach(command => {
        const alias = harness.dispatchCommand(command);
        assert.equal(alias.length, 1, `${command} must reach exactly one PresetRegistry panel through registered direct or Almanac aliases`);
        assert.match(alias[0].message, /Almanac \/ Presets/, `${command} must reach the PresetRegistry panel`);
    });
}

function assertReviewRefusalAndMalformedSafety() {
    const staleHarness = createHarness();
    installPresetWorld(staleHarness);
    const staleState = staleHarness.state.GameAssist.AlmanacAssist;
    staleHarness.dispatchCommand('!aa-presets install --builtin blank-session-context');
    const staleGrant = installGrantId(staleHarness);
    staleState.config.world.revision += 1;
    const stale = staleHarness.dispatchCommand(`!aa-presets confirm --grant ${staleGrant}`);
    assert.match(stale[0].message, /Review Changed/, 'changed Worldbuilding revision must refuse a stale reviewed clone');
    assert.equal(staleState.config.world.presets.length, 0, 'stale review must not create a clone');
    assert.equal(Object.keys(staleState.runtime.world.presetGrants).length, 0, 'stale review must be consumed safely');

    const actorHarness = createHarness();
    installPresetWorld(actorHarness);
    const actorState = actorHarness.state.GameAssist.AlmanacAssist;
    actorHarness.dispatchCommand('!aa-presets install --builtin blank-session-context');
    const actorGrant = installGrantId(actorHarness);
    actorState.runtime.world.presetGrants[actorGrant].actorId = 'another-gm-session';
    const foreign = actorHarness.dispatchCommand(`!aa-presets confirm --grant ${actorGrant}`);
    assert.match(foreign[0].message, /another GM session/, 'foreign reviewed confirmation must be refused');
    assert.equal(actorState.config.world.presets.length, 0, 'foreign review must not create a clone');
    assert.ok(actorState.runtime.world.presetGrants[actorGrant], 'foreign review must remain available to its original actor');
    actorState.runtime.world.presetGrants[actorGrant].actorId = 'GM';
    actorHarness.dispatchCommand(`!aa-presets confirm --grant ${actorGrant}`);
    assert.equal(actorState.config.world.presets.length, 1, 'original review actor may confirm the retained review');
    const replay = actorHarness.dispatchCommand(`!aa-presets confirm --grant ${actorGrant}`);
    assert.match(replay[0].message, /expired or was already used/, 'a confirmation grant must refuse replay');
    assert.equal(actorState.config.world.presets.length, 1, 'replay must not create a second clone');

    const expiryHarness = createHarness();
    installPresetWorld(expiryHarness);
    const expiryState = expiryHarness.state.GameAssist.AlmanacAssist;
    expiryHarness.dispatchCommand('!aa-presets install --builtin generic-travel-context');
    const expiryGrant = installGrantId(expiryHarness);
    expiryState.runtime.world.presetGrants[expiryGrant].expiresAt = Date.now() - 1;
    const expired = expiryHarness.dispatchCommand(`!aa-presets confirm --grant ${expiryGrant}`);
    assert.match(expired[0].message, /expired or was already used/, 'expired reviewed confirmation must be refused');
    assert.equal(expiryState.config.world.presets.length, 0, 'expired review must not create a clone');
    assert.equal(Object.keys(expiryState.runtime.world.presetGrants).length, 0, 'expired review must be pruned');

    const boundedHarness = createHarness();
    installPresetWorld(boundedHarness);
    const boundedState = boundedHarness.state.GameAssist.AlmanacAssist;
    // The setting-scale Worldbuilding policy intentionally permits 160 editable
    // Session Presets; populate that exact declared campaign bound rather than
    // the older starter-scale 60-record fixture.
    boundedState.config.world.presets = Array.from({ length: 160 }, (_, index) => ({
        id: `campaign-preset-${index + 1}`, name: `Campaign Preset ${index + 1}`, description: '', tags: [],
        locationId: null, phenomenonIds: [], defaultPace: 'standard', sourcePresetId: null, sourcePresetVersion: null
    }));
    const bounded = boundedHarness.dispatchCommand('!aa-presets install --builtin blank-session-context');
    assert.match(bounded[0].message, /Campaign Preset Limit/, 'installation must refuse at the bounded campaign preset limit');
    assert.equal(Object.keys(boundedState.runtime.world.presetGrants).length, 0, 'bounded refusal must not create a review grant');

    const malformedHarness = createHarness();
    installPresetWorld(malformedHarness);
    const malformedState = malformedHarness.state.GameAssist.AlmanacAssist;
    malformedState.runtime.world.presetGrants = { malformed: { action: 'install', expiresAt: 'not-a-time' } };
    malformedHarness.dispatchCommand('!aa-presets');
    assert.equal(Object.keys(malformedState.runtime.world.presetGrants).length, 0, 'malformed review state must be discarded without a clone or provider write');
    const futureBefore = JSON.stringify(malformedState.config.world);
    malformedState.config.world.schemaVersion = 999;
    const future = malformedHarness.dispatchCommand('!aa-presets');
    assert.match(future[0].message, /Worldbuilding Needs Attention/, 'future Worldbuilding schema must render a warning-only preset panel');
    assert.equal(JSON.stringify(malformedState.config.world), JSON.stringify({ ...JSON.parse(futureBefore), schemaVersion: 999 }), 'future Worldbuilding data must remain byte-for-byte semantically unchanged');
}

/**
 * Campaign Session Presets share the setting-scale Worldbuilding budget. Their
 * Session panel must provide complete preview discovery without turning a
 * 160-record campaign into a first-page-only root card.
 */
function assertCampaignPresetCatalogScale() {
    const harness = createHarness();
    installPresetWorld(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.world.presets = Array.from({ length: 160 }, (_, index) => {
        const suffix = String(index + 1).padStart(3, '0');
        return {
            id: `catalog-preset-${suffix}`, name: `Catalog Preset ${suffix}`,
            description: `Setting-scale campaign preset ${suffix}.`, tags: ['catalog', 'session'],
            locationId: 'watch-camp', phenomenonIds: ['ashfall'], defaultPace: 'standard', sourcePresetId: null, sourcePresetVersion: null
        };
    });
    const before = JSON.stringify({ world: almanac.config.world, runtime: almanac.runtime.world });

    const root = harness.dispatchCommand('!aa-presets');
    assert.match(root[0].message, /Campaign Session Presets \(160\)/, 'PresetRegistry root must disclose the complete campaign-preset count at the setting-scale bound');
    assert.match(root[0].message, /Browse Campaign Presets/, 'PresetRegistry root must offer a visible complete campaign catalog');
    assert.doesNotMatch(root[0].message, /Catalog Preset 160/, 'PresetRegistry root must remain a compact representative view');
    assert.ok(root[0].message.length < 6000, 'PresetRegistry root must remain compact at the 160-record campaign-preset bound');

    const first = harness.dispatchCommand('!aa-presets campaign --page 0');
    assert.match(first[0].message, /Campaign Session Presets 1 of 14/, 'campaign-preset catalog must page the full 160-record setting-scale collection');
    assert.equal((first[0].message.match(/\[Preview\]/g) || []).length, 12, 'campaign-preset catalog must retain the ordinary twelve-preview page bound');
    const last = harness.dispatchCommand('!aa-presets campaign --page 13');
    assert.match(last[0].message, /Campaign Session Presets 14 of 14/, 'campaign-preset catalog must retain access to its final page');
    assert.match(last[0].message, /Catalog Preset 160/, 'campaign-preset catalog must expose a distant campaign preset by name');
    const search = harness.dispatchCommand('!aa-presets campaign search --query "Catalog Preset 160" --page 0');
    assert.match(search[0].message, /Search: catalog preset 160 1 of 1/, 'campaign-preset catalog search must resolve a distant campaign preset without a technical ID');
    const preview = harness.dispatchCommand('!aa-presets preview --id catalog-preset-160');
    assert.match(preview[0].message, /Catalog Preset 160/, 'catalog-visible campaign preset must retain the existing direct preview path');
    assert.equal(JSON.stringify({ world: almanac.config.world, runtime: almanac.runtime.world }), before, 'campaign-preset browse/search/preview paths must remain read-only until an explicit edit or install confirmation');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const registryHarness = createHarness();
    assertRegistryAndReviewedClone(registryHarness);
    const safetyHarness = createHarness();
    assertReferenceSafetyAndAliases(safetyHarness);
    assertReviewRefusalAndMalformedSafety();
    assertCampaignPresetCatalogScale();
    process.stdout.write('PASS: AlmanacAssist PresetRegistry focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused generic PresetRegistry clone/install, campaign-reference safety, and complete 160-record campaign-catalog evidence.
// Decision log:
//   CHOICE: ship generic immutable templates only — ALT: embed named setting packs; REJECTED: published setting provenance and licensing are separate explicit gates.
//   CHOICE: clone after a review — ALT: install a mutable built-in directly; REJECTED: campaign ownership and immutable built-in boundaries would become ambiguous.
// [GAMEASSIST_ALMANAC_PRESETS_TEST:CHECKS] END
// ============================================================================
