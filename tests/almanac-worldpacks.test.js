// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_WORLDPACKS_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise bounded, inert, handout-based WorldPack review, atomic commit, provenance, update, copy, and stale-preview contracts against the shipped executable."
//   order: ["artifact_identity","public_registry","template","validation","preview","atomic_commit","update_copy","future_schema","future_runtime","aliases"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never treat this isolated VM suite as live Roll20 acceptance evidence."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_WORLDPACKS_TEST:CHECKS]"]
//   performance: { notes: "Fresh isolated VM fixtures, bounded WorldPack handout text, no network access." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_WORLDPACKS_TEST]/
//     └─ [GAMEASSIST_ALMANAC_WORLDPACKS_TEST:CHECKS]
// --- prose banner ---
// This Node-only check proves that a WorldPack is inert data until a GM confirms
// a current review. It covers syntax/schema/reference validation, no-overwrite
// policies, provenance manifests, copy identity separation, and future-schema
// refusal without claiming live Roll20 behavior.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

function emptyWorld() {
    return {
        regions: [], geographies: [], ecoregions: [], biomes: [],
        locations: [], destinations: [], routes: [], phenomena: []
    };
}

function worksheetJson(notes) {
    const match = String(notes || '').match(/```json\s*\n([\s\S]*?)\n```/i);
    assert.ok(match, 'WorldPack Worksheet must contain one visible fenced JSON document');
    return JSON.parse(match[1]);
}

function makePack(version = 1) {
    const world = emptyWorld();
    world.regions.push({ id: 'mist-frontier', name: 'Mist Frontier', description: 'Generic owner-authored frontier.', tags: ['generic'] });
    world.geographies.push({
        id: 'wind-ridge', name: 'Wind Ridge', description: 'A high, exposed ridge.', tags: ['ridge'], regionId: 'mist-frontier',
        terrain: version >= 2 ? 'Wind-carved stone' : 'Rocky ridge', elevation: 'High', hydrology: 'Seasonal runnels'
    });
    world.biomes.push({ id: 'cold-steppe', name: 'Cold Steppe', description: 'Open grassland.', tags: ['steppe'], vegetation: 'Sparse grass', aridity: 'Dry', ground: 'Firm' });
    world.ecoregions.push({
        id: 'ridge-steppe', name: 'Ridge Steppe', description: 'A high cold-steppe ecoregion.', tags: ['steppe'],
        regionId: 'mist-frontier', geographyId: 'wind-ridge', biomeId: 'cold-steppe', climateRegionId: null
    });
    world.locations.push({
        id: 'ridge-camp', name: 'Ridge Camp', description: 'A generic ridge camp.', tags: ['camp'], regionId: 'mist-frontier',
        geographyId: 'wind-ridge', ecoregionId: 'ridge-steppe', biomeId: 'cold-steppe', climateRegionId: null,
        environmentName: 'Exposed ground', environmentGround: 'Firm stone', environmentWater: 'None', modifiers: { temperatureBias: 0, windBias: 0, visibility: '' }
    });
    world.locations.push({
        id: 'ford-camp', name: 'Ford Camp', description: 'A generic river crossing camp.', tags: ['camp'], regionId: 'mist-frontier',
        geographyId: 'wind-ridge', ecoregionId: 'ridge-steppe', biomeId: 'cold-steppe', climateRegionId: null,
        environmentName: 'Shallow ford', environmentGround: 'Round stone', environmentWater: 'Shallow water', modifiers: { temperatureBias: 0, windBias: 0, visibility: '' }
    });
    world.destinations.push({ id: 'ridge-destination', name: 'Ridge Camp Destination', description: 'Prepared generic destination.', tags: ['travel'], locationId: 'ridge-camp', defaultPace: 'standard' });
    world.routes.push({ id: 'ridge-ford-route', name: 'Ridge to Ford', description: 'A generic reviewed route.', tags: ['travel'], fromLocationId: 'ridge-camp', toLocationId: 'ford-camp', distanceMiles: 12, defaultPace: 'standard', notes: 'Check local conditions.' });
    world.phenomena.push({
        id: 'thin-mist', name: 'Thin Mist', description: 'A generic visible mist.', tags: ['mist'], locationId: 'ridge-camp', category: 'Atmospheric',
        visibilityNote: 'Low drifting mist', terrainNote: 'No automatic consequence', travelNote: 'Describe conditions', severity: 2, defaultDurationHours: 0
    });
    return {
        format: 'GameAssist.AlmanacWorldPack',
        schemaVersion: 1,
        id: 'mist-frontier-pack',
        version,
        name: 'Mist Frontier Pack',
        description: `Generic owner-authored WorldPack v${version}.`,
        tags: ['generic', 'campaign'],
        provenance: { type: 'owner-authored', origin: 'Campaign owner-authored content', license: '' },
        world,
        dependencies: { climateRegionIds: [] }
    };
}

function createPackHandout(harness, pack = makePack()) {
    return harness.sandbox.createObj('handout', {
        name: 'WorldPack Fixture',
        archived: false,
        notes: JSON.stringify(pack, null, 2)
    });
}

function grantId(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.worldPacks.grants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'fixture must retain exactly one WorldPack review grant');
    return ids[0];
}

function providerDigest(almanac) {
    return JSON.stringify({
        time: almanac.runtime.time,
        climate: almanac.runtime.climate,
        astronomy: almanac.runtime.astronomy,
        weather: almanac.runtime.weather,
        environment: almanac.runtime.environment,
        rest: almanac.runtime.rest,
        worldRuntime: almanac.runtime.world,
        activeLocationId: almanac.config.world.activeLocationId,
        favorites: almanac.config.world.favoriteLocationIds
    });
}

function installV1(harness, handout = createPackHandout(harness)) {
    const review = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode new`);
    assert.equal(review.length, 1, 'WorldPack import must first render one review panel');
    assert.match(review[0].message, /WorldPack Import Preview/, 'valid data must stop at an explicit preview');
    const commit = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${grantId(harness)}`);
    assert.equal(commit.length, 1, 'confirmed WorldPack review must render one result panel');
    assert.match(commit[0].message, /WorldPack Committed/, 'confirmation must identify the atomic commit');
    return handout;
}

function assertPublicRegistryAndTemplate(harness) {
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const before = JSON.stringify(harness.state.GameAssist.AlmanacAssist.config.worldPacks);
    const packs = api.getWorldPacks();
    assert.equal(api.version, '2.0.0', 'the active AlmanacAssist implementation must identify itself as v2.0.0');
    assert.equal(api.worldPackSchemaVersion, 2, 'public API must disclose the latest portable WorldPack schema version');
    assert.equal(api.worldPackRegistrySchemaVersion, 1, 'public API must distinguish the campaign installation registry schema');
    assert.equal(api.worldPackDefinitionSchemaVersion, 1, 'public API must disclose the campaign-owned installed-definition schema');
    assert.equal(packs.schemaVersion, 2, 'read-only WorldPack API result must identify the portable document schema');
    assert.equal(packs.registrySchemaVersion, 1, 'read-only WorldPack API result must distinguish registry schema from document schema');
    assert.equal(Object.isFrozen(packs), true, 'WorldPack API result must be deeply immutable at public boundary');
    assert.equal(Object.isFrozen(packs.installed), true, 'WorldPack installation list must be immutable');
    assert.throws(() => { packs.installed.push({ id: 'mutated' }); }, /read only|not extensible|object is not extensible/i, 'callers must not mutate installed registry output');
    assert.equal(JSON.stringify(harness.state.GameAssist.AlmanacAssist.config.worldPacks), before, 'reading registry must not normalize or write saved configuration');

    const template = harness.dispatchCommand('!aa-worldpacks template');
    assert.equal(template.length, 1, 'template action must produce one compact panel');
    assert.match(template[0].message, /WorldPack Template Ready/, 'template action must identify its result');
    assert.doesNotMatch(template[0].message, /"schemaVersion"|&quot;schemaVersion&quot;/, 'normal template panel must link a handout rather than dump raw JSON');
    const entry = harness.state.GameAssist.handouts.entries['AlmanacAssist:worldpack-template'];
    assert.ok(entry?.id, 'template action must use a stable owned handout identity');
    const notes = harness.sandbox.getObj('handout', entry.id).get('notes');
    assert.match(notes, /<!--\s*GameAssist Almanac WorldPack Worksheet\s*-->/i, 'blank template must use the documented human-editable worksheet envelope');
    assert.match(notes, /Edit the single JSON block below/i, 'worksheet template must explain the safe authoring boundary in the handout itself');
    const parsed = worksheetJson(notes);
    assert.equal(parsed.format, 'GameAssist.AlmanacWorldPack', 'worksheet JSON block must use canonical portable format');
    assert.equal(parsed.schemaVersion, 2, 'blank template must author against the latest palette-plus-geography package schema');
    assert.ok(parsed.palette && typeof parsed.palette === 'object' && !Array.isArray(parsed.palette), 'blank v2 template must make reusable palette ownership explicit');
    assert.ok(parsed.bindings && typeof parsed.bindings === 'object' && !Array.isArray(parsed.bindings), 'blank v2 template must make definition bindings explicit');
    assert.deepEqual(parsed.world, emptyWorld(), 'blank template must contain no named setting lore or runtime data');
    const worksheetReview = harness.dispatchCommand(`!aa-worldpacks import --handout ${entry.id} --mode new`);
    assert.match(worksheetReview[0].message, /WorldPack Import Preview/, 'the generated human-editable worksheet must round-trip through the same inert review path');
    harness.dispatchCommand(`!aa-worldpacks cancel --grant ${grantId(harness)}`);
}

function assertValidationAndPreviewSafety(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const invalid = makePack();
    invalid.world.locations[0].regionId = 'missing-region';
    const invalidHandout = createPackHandout(harness, invalid);
    const worldBefore = JSON.stringify(almanac.config.world);
    const registryBefore = JSON.stringify(almanac.config.worldPacks);
    const invalidResponse = harness.dispatchCommand(`!aa-worldpacks import --handout ${invalidHandout.id} --mode new`);
    assert.equal(invalidResponse.length, 1, 'invalid pack must produce one warning panel');
    assert.match(invalidResponse[0].message, /Validation/, 'invalid references must be surfaced as validation errors');
    assert.match(invalidResponse[0].message, /No text was executed/i, 'invalid JSON path must state inert-text safety');
    assert.equal(JSON.stringify(almanac.config.world), worldBefore, 'invalid data must not change Worldbuilding');
    assert.equal(JSON.stringify(almanac.config.worldPacks), registryBefore, 'invalid data must not change registry');

    const malformedWorksheet = harness.sandbox.createObj('handout', {
        name: 'Malformed WorldPack Worksheet', archived: false,
        notes: '<!-- GameAssist Almanac WorldPack Worksheet -->\n```json\n{}\n```\n```json\n{}\n```'
    });
    const malformedWorksheetResponse = harness.dispatchCommand(`!aa-worldpacks import --handout ${malformedWorksheet.id} --mode new`);
    assert.match(malformedWorksheetResponse[0].message, /exactly one non-empty fenced JSON block/i, 'worksheet parser must refuse ambiguous multiple JSON blocks before normalization');
    assert.equal(JSON.stringify(almanac.config.world), worldBefore, 'ambiguous worksheet refusal must not change Worldbuilding');
    assert.equal(JSON.stringify(almanac.config.worldPacks), registryBefore, 'ambiguous worksheet refusal must not change registry');

    const handout = createPackHandout(harness);
    const providerBefore = providerDigest(almanac);
    const review = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode new`);
    assert.equal(review.length, 1, 'valid import must render one preview');
    assert.match(review[0].message, /Conflict Policy/, 'preview must disclose no-overwrite/review behavior');
    assert.match(review[0].message, /Confirm Install New/, 'preview must expose an explicit confirmation action');
    assert.equal(JSON.stringify(almanac.config.world), worldBefore, 'preview must not commit Worldbuilding');
    assert.equal(JSON.stringify(almanac.config.worldPacks), registryBefore, 'preview must not commit registry');
    assert.equal(providerDigest(almanac), providerBefore, 'preview must not alter providers, time, gameplay runtime, favorites, or active location');
}

function assertAtomicCommitAndStaleHandout(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const handout = createPackHandout(harness);
    const providerBefore = providerDigest(almanac);
    const worldBefore = JSON.stringify(almanac.config.world);
    const registryBefore = JSON.stringify(almanac.config.worldPacks);
    const review = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode new`);
    assert.equal(review.length, 1, 'valid pack must enter preview before commit');
    handout.set('notes', JSON.stringify(makePack(1).world ? { ...makePack(1), description: 'Edited after preview.' } : makePack(1), null, 2));
    const stale = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${grantId(harness)}`);
    assert.equal(stale.length, 1, 'stale handout confirmation must render one warning');
    assert.match(stale[0].message, /handout changed|no longer validates/i, 'handout mutation must invalidate review token');
    assert.equal(JSON.stringify(almanac.config.world), worldBefore, 'stale preview must not partially change Worldbuilding');
    assert.equal(JSON.stringify(almanac.config.worldPacks), registryBefore, 'stale preview must not partially change registry');
    assert.equal(providerDigest(almanac), providerBefore, 'stale preview must not alter provider or gameplay state');

    handout.set('notes', JSON.stringify(makePack(), null, 2));
    installV1(harness, handout);
    assert.equal(almanac.config.world.regions.length, 1, 'atomic commit must add included region');
    assert.equal(almanac.config.world.locations.length, 2, 'atomic commit must add included locations together');
    assert.equal(almanac.config.world.routes.length, 1, 'atomic commit must add included route together');
    assert.equal(almanac.config.world.phenomena.length, 1, 'atomic commit must add included phenomenon together');
    assert.equal(almanac.config.world.activeLocationId, null, 'WorldPack must not change active location');
    assert.equal(almanac.config.world.favoriteLocationIds.length, 0, 'WorldPack must not change favorites');
    assert.equal(providerDigest(almanac), providerBefore, 'confirmed pack must not alter providers, time, or gameplay runtime');
    const installed = almanac.config.worldPacks.installed[0];
    assert.equal(installed.id, 'mist-frontier-pack', 'registry must retain stable pack identity');
    assert.equal(installed.version, 1, 'registry must retain installed pack version');
    assert.equal(installed.manifest.length, 9, 'registry manifest must retain bounded provenance for every imported record');
    assert.ok(almanac.config.world.locations.every(record => record.sourcePackId === 'mist-frontier-pack'), 'imported records must retain source pack provenance');
}

function assertUpdateCopyAndConflictPolicies(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const handout = installV1(harness);
    const duplicate = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode new`);
    assert.equal(duplicate.length, 1, 'duplicate New request must return one panel');
    assert.match(duplicate[0].message, /already installed/i, 'Install New must refuse pack ID collision instead of overwriting');

    handout.set('notes', JSON.stringify(makePack(2), null, 2));
    const updateReview = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode update`);
    assert.equal(updateReview.length, 1, 'higher-version update must first render one preview');
    assert.match(updateReview[0].message, /Update Existing Pack/, 'update preview must state its explicit mode');
    const update = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${grantId(harness)}`);
    assert.equal(update.length, 1, 'confirmed update must render one result');
    assert.match(update[0].message, /WorldPack Committed/, 'valid update must commit atomically');
    assert.equal(almanac.config.worldPacks.installed[0].version, 2, 'registry must advance installed pack version only after confirmation');
    assert.equal(almanac.config.world.geographies[0].terrain, 'Wind-carved stone', 'update must replace only unchanged same-pack record content');

    const copyReview = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode copy`);
    assert.equal(copyReview.length, 1, 'copy must render a preview');
    assert.match(copyReview[0].message, /Import as Copy/, 'copy preview must identify independent copy mode');
    const copied = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${grantId(harness)}`);
    assert.equal(copied.length, 1, 'confirmed copy must render a result');
    assert.equal(almanac.config.worldPacks.installed.length, 2, 'copy must retain a separate installed-pack registry record');
    const copiedInstallation = almanac.config.worldPacks.installed.find(item => item.importedFromPackId === 'mist-frontier-pack');
    assert.ok(copiedInstallation, 'copy registry entry must disclose original pack identity');
    assert.notEqual(copiedInstallation.id, 'mist-frontier-pack', 'copy must receive a distinct pack identity');
    assert.ok(almanac.config.world.locations.some(record => record.sourcePackId === copiedInstallation.id), 'copied records must carry the new copy provenance');

    // Campaign customization changes the old manifest digest, so a later update must be refused rather than overwritten.
    const originalLocation = almanac.config.world.locations.find(record => record.sourcePackId === 'mist-frontier-pack');
    originalLocation.description = 'Campaign customization after pack import.';
    handout.set('notes', JSON.stringify(makePack(3), null, 2));
    const modified = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode update`);
    assert.equal(modified.length, 1, 'modified-record update must return one refusal panel');
    assert.match(modified[0].message, /changed after installation|avoid overwriting campaign customization/i, 'update must refuse modified imported records');
    assert.equal(originalLocation.description, 'Campaign customization after pack import.', 'refused update must preserve campaign customization');
}

function assertFutureWorldPackRuntimePreservation(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.runtime.worldPacks = { schemaVersion: 99, opaqueFutureGrant: { preserve: true } };
    const before = JSON.stringify(almanac.runtime.worldPacks);
    const response = harness.dispatchCommand('!aa-worldpacks');
    assert.equal(response.length, 1, 'future WorldPack runtime must render one warning-only panel');
    assert.match(response[0].message, /runtime schema 99 is newer than this AlmanacAssist version/i, 'future WorldPack runtime must remain explicit');
    assert.equal(JSON.stringify(almanac.runtime.worldPacks), before, 'future WorldPack runtime must not be normalized, expired, or reinterpreted');
}

function assertFutureSchemaAndAliases(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.worldPacks = { schemaVersion: 99, revision: 8, opaqueFutureField: { preserve: true } };
    const before = JSON.stringify(almanac.config.worldPacks);
    const future = harness.dispatchCommand('!aa-worldpacks');
    assert.equal(future.length, 1, 'future registry must render one warning-only panel');
    assert.match(future[0].message, /newer than this AlmanacAssist version/, 'future registry warning must remain explicit');
    assert.equal(JSON.stringify(almanac.config.worldPacks), before, 'future registry must remain unchanged by a display path');
    const apiResult = harness.sandbox.GameAssist.AlmanacAssist.getWorldPacks();
    assert.equal(apiResult.warning.includes('newer than this AlmanacAssist version'), true, 'public API must surface future-schema warning');

    const aliasHarness = createHarness();
    ['!WORLDPACKS status', '!worldpacks-status', '!world-packs-status', '!world packs status', '!aa worldpacks', '!aa-worldpacks-status', '!aa-world-packs-status', '!aa world packs status', '!worldpack-status'].forEach(command => {
        const response = aliasHarness.dispatchCommand(command);
        assert.equal(response.length, 1, `${command} must reach exactly one WorldPack panel`);
        assert.match(response[0].message, /Almanac \/ WorldPacks/, `${command} must normalize into WorldPack controls`);
    });
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertPublicRegistryAndTemplate(createHarness());
    assertValidationAndPreviewSafety(createHarness());
    assertAtomicCommitAndStaleHandout(createHarness());
    assertUpdateCopyAndConflictPolicies(createHarness());
    assertFutureWorldPackRuntimePreservation(createHarness());
    assertFutureSchemaAndAliases(createHarness());
    process.stdout.write('PASS: AlmanacAssist WorldPacks focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused WorldPack evidence for inert editable handouts, bounded review grants, atomic world/registry commits, provenance, update/copy identities, stale previews, and future-schema preservation.
// Decision log:
//   CHOICE: exercise the shipped executable through a VM Roll20-shaped harness — ALT: unit-test copied helpers; REJECTED: copied test logic could drift from the three executable artifacts.
//   CHOICE: assert no-overwrite and stale-review paths alongside successful imports — ALT: test only happy paths; REJECTED: WorldPack safety is primarily defined by its refusal behavior.
