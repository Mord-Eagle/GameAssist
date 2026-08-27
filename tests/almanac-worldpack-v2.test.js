// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_WORLDPACK_V2_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise setting-scale PresetRegistry sources, installed palette clones, operational profile resolution, atomic Route Legs, copy remapping, and malformed v2 refusal in an isolated Roll20-shaped VM."
//   order: ["artifact_identity", "registry", "library_permissions_stale_restart", "four_independent_installs", "scene_profiles", "palette_controls", "palette_catalog_relation_pickers", "calendar_projection", "phenomenon_templates", "large_scale_selector", "route_legs", "active_journey_refusal", "empty_palette_update_guard", "v2_refusal", "copy_remapping"]
//   env: { required: ["NODE_RUNTIME"], secrets: [] }
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never treat this isolated VM suite as live Roll20 acceptance evidence."
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_WORLDPACK_V2_TEST:CHECKS]"] }
//   error_codes: ["INVALID_ARGUMENT", "CONFLICT", "UNPROCESSABLE", "UNAVAILABLE", "INTERNAL"]
// --- prose banner ---
// This focused suite proves local data and command contracts only. It does not
// prove live Roll20 behavior, user-facing performance, or release acceptance.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

const PALETTE_COLLECTIONS = [
    'climateProfiles', 'biomeProfiles', 'environmentProfiles',
    'ecoregionProfiles', 'geographyProfiles', 'hydrologyProfiles',
    'weatherPolicies', 'travelProfiles', 'astronomyProfiles',
    'calendars', 'temporalContexts', 'phenomenonTemplates'
];

function emptyPalette() {
    return Object.fromEntries(PALETTE_COLLECTIONS.map(collection => [collection, []]));
}

function emptyWorld() {
    return {
        regions: [], geographies: [], ecoregions: [], biomes: [],
        locations: [], destinations: [], routes: [], phenomena: []
    };
}

function makeV2Fixture(version = 1) {
    const palette = emptyPalette();
    palette.climateProfiles.push({
        id: 'fixture-climate', name: 'Fixture Climate', description: 'Original fixture climate.', tags: ['fixture'],
        temperatureF: 55, humidity: 60, precipitationChance: 40, windMph: 8, seasonalAdjustments: []
    });
    palette.travelProfiles.push({
        id: 'fixture-travel', name: 'Fixture Trail Pace', description: 'Original fixture travel profile.', tags: ['fixture'],
        defaultPace: 'standard', milesPerHour: 2.5, terrainNote: 'Fixture footing.', seasonalNote: ''
    });
    palette.weatherPolicies.push({
        id: 'fixture-weather', name: 'Fixture Weather', description: 'Original fixture weather policy.', tags: ['fixture'],
        forecastDays: 2, temperatureBias: 1, windBias: 1, precipitationBias: 2, summary: 'Fixture weather evidence.'
    });
    palette.ecoregionProfiles.push({
        id: 'fixture-eco-profile', name: 'Fixture Ecoregion Profile', description: 'Fixture bundle.', tags: ['fixture'],
        climateProfileId: 'fixture-climate', biomeProfileId: null, environmentProfileId: null,
        geographyProfileId: null, hydrologyProfileId: null, weatherPolicyId: 'fixture-weather', travelProfileId: 'fixture-travel',
        astronomyProfileId: null, calendarId: null, temporalContextId: null, phenomenonTemplateIds: [], transition: ''
    });
    const world = emptyWorld();
    world.regions.push({ id: 'fixture-region', name: 'Fixture Region', description: 'Fixture region.', tags: ['fixture'], climateProfileId: 'fixture-climate' });
    world.ecoregions.push({
        id: 'fixture-ecoregion', name: 'Fixture Ecoregion', description: 'Fixture ecoregion.', tags: ['fixture'],
        regionId: 'fixture-region', geographyId: null, biomeId: null, ecoregionProfileId: 'fixture-eco-profile',
        climateProfileId: 'fixture-climate', travelProfileId: 'fixture-travel', weatherPolicyId: 'fixture-weather'
    });
    ['A', 'B', 'C'].forEach((label, index) => world.locations.push({
        id: `fixture-${label.toLowerCase()}`, name: `Fixture ${label}`, description: `Fixture ${label} location.`, tags: ['fixture'],
        regionId: 'fixture-region', ecoregionId: 'fixture-ecoregion', geographyId: null, biomeId: null,
        climateProfileId: 'fixture-climate', environmentName: 'Fixture ground', environmentGround: 'Firm', environmentWater: 'Spring',
        modifiers: { temperatureBias: 0, windBias: 0, visibility: index === 1 ? 'Open' : '' }
    }));
    world.routes.push({
        id: 'fixture-route', name: 'Fixture Three-Stop Route', description: 'Fixture route with two explicit legs.', tags: ['fixture'],
        fromLocationId: 'fixture-a', toLocationId: 'fixture-c', distanceMiles: 10, defaultPace: 'standard', travelProfileId: 'fixture-travel', terrainNote: 'Fixture road.',
        legs: [
            { id: 'fixture-leg-a-b', fromLocationId: 'fixture-a', toLocationId: 'fixture-b', distanceMiles: 4, terrainNote: 'First fixture leg.', travelProfileId: 'fixture-travel', description: '', tags: ['fixture'] },
            { id: 'fixture-leg-b-c', fromLocationId: 'fixture-b', toLocationId: 'fixture-c', distanceMiles: 6, terrainNote: 'Second fixture leg.', travelProfileId: 'fixture-travel', description: '', tags: ['fixture'] }
        ]
    });
    return {
        format: 'GameAssist.AlmanacWorldPack', schemaVersion: 2,
        id: 'fixture-v2-pack', version, name: 'Fixture V2 Pack', description: 'Original isolated v2 package fixture.',
        tags: ['fixture'], provenance: { type: 'owner-authored', origin: 'Test fixture', license: '' },
        palette,
        bindings: {
            defaultClimateProfileId: 'fixture-climate', defaultBiomeProfileId: null, defaultEnvironmentProfileId: null,
            defaultEcoregionProfileId: 'fixture-eco-profile', defaultGeographyProfileId: null, defaultHydrologyProfileId: null,
            defaultWeatherPolicyId: 'fixture-weather', defaultTravelProfileId: 'fixture-travel', defaultAstronomyProfileId: null,
            defaultCalendarId: null, defaultTemporalContextId: null, defaultPhenomenonTemplateId: null
        },
        world,
        dependencies: { climateRegionIds: [], packageIds: [] }
    };
}

function makeEmptyPaletteFixture(version = 1) {
    const pack = makeV2Fixture(version);
    Object.keys(pack.palette).forEach(collection => { pack.palette[collection] = []; });
    Object.keys(pack.bindings).forEach(field => { pack.bindings[field] = null; });
    const profileFields = [
        'climateProfileId', 'biomeProfileId', 'environmentProfileId', 'ecoregionProfileId',
        'geographyProfileId', 'hydrologyProfileId', 'weatherPolicyId', 'travelProfileId',
        'astronomyProfileId', 'calendarId', 'temporalContextId'
    ];
    [...pack.world.regions, ...pack.world.ecoregions, ...pack.world.locations].forEach(record => {
        profileFields.forEach(field => { if (field in record) record[field] = null; });
    });
    pack.world.routes.forEach(route => {
        route.travelProfileId = null;
        (route.legs || []).forEach(leg => { leg.travelProfileId = null; });
    });
    return pack;
}

function createPackHandout(harness, pack) {
    return harness.sandbox.createObj('handout', {
        name: 'WorldPack V2 Fixture', archived: false, notes: JSON.stringify(pack, null, 2)
    });
}

function currentGrant(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.worldPacks.grants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'fixture must retain exactly one WorldPack review grant');
    return ids[0];
}

function decodeNumericEntities(value) {
    return String(value).replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)));
}

function renderedButtonTargets(message) {
    const targets = [];
    const pattern = /\[[^\]]+\]\(([^)]*)\)/g;
    let match;
    while ((match = pattern.exec(String(message)))) targets.push(decodeNumericEntities(match[1]));
    return targets;
}

function hasClosedDeferredPrompts(target) {
    let start = 0;
    while ((start = String(target).indexOf('?{', start)) >= 0) {
        let depth = 1;
        let cursor = start + 2;
        while (cursor < String(target).length && depth) {
            if (target[cursor] === '{') depth += 1;
            else if (target[cursor] === '}') depth -= 1;
            cursor += 1;
        }
        if (depth) return false;
        start = cursor;
    }
    return true;
}

function assertBoundedRenderedTargets(message, label) {
    const targets = renderedButtonTargets(message);
    assert.ok(targets.length > 0, `${label} must render actionable controls`);
    targets.forEach(target => {
        assert.match(target, /^!aa(?:-|\b)/, `${label} must render only executable Almanac command targets`);
        assert.doesNotMatch(target, /\bundefined\b|\bNaN\b|--(?:id|field|value|collection|pack|type)\s*(?:""|$)/, `${label} must not render a blank or malformed command target`);
        assert.equal(hasClosedDeferredPrompts(target), true, `${label} must retain closed deferred Roll20 prompts`);
    });
}

function installPreset(harness, id) {
    const preview = harness.dispatchCommand(`!aa-worldpacks preset install --id ${id}`);
    assert.equal(preview.length, 1, 'built-in install must render exactly one review panel');
    assert.match(preview[0].message, /WorldPack Import Preview/, 'built-in install must remain review-first');
    const commit = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${currentGrant(harness)}`);
    assert.equal(commit.length, 1, 'built-in confirmation must render exactly one commit panel');
    assert.match(commit[0].message, /WorldPack Committed/, 'built-in confirmation must commit one editable clone');
}

function installFixture(harness, pack, mode = 'new') {
    const handout = createPackHandout(harness, pack);
    const preview = harness.dispatchCommand(`!aa-worldpacks import --handout ${handout.id} --mode ${mode}`);
    assert.equal(preview.length, 1, 'fixture import must render exactly one review panel');
    assert.match(preview[0].message, /WorldPack Import Preview/, 'fixture import must remain review-first');
    const commit = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${currentGrant(harness)}`);
    assert.equal(commit.length, 1, 'fixture confirmation must render exactly one response');
    assert.match(commit[0].message, /WorldPack Committed/, 'fixture confirmation must commit atomically');
}

function assertPresetRegistry() {
    const harness = createHarness();
    const registry = harness.sandbox.GameAssist.AlmanacAssist.getWorldPackPresetRegistry();
    assert.equal(registry.schemaVersion, 1, 'built-in WorldPack registry must disclose its immutable registry schema');
    assert.equal(Object.isFrozen(registry), true, 'public registry summaries must be immutable');
    assert.equal(registry.sources.length, 4, 'exactly four original setting-scale built-ins must ship');
    const ids = Array.from(registry.sources, source => source.id);
    assert.deepEqual(ids, ['asterfall-concord', 'veyra-turning', 'narthvale-compact', 'lumenfen-atlas'], 'shipped registry identity must remain stable');
    registry.sources.forEach(source => {
        assert.equal(source.version, 2, `${source.name} must disclose the expanded immutable source version`);
        assert.equal(source.geographicRecordCount, 456, `${source.name} must retain the declared setting-scale geographic workload`);
        assert.equal(source.locationCount, 160, `${source.name} must meet the setting-scale Location workload rather than a starter-area count`);
        assert.ok(source.routeCount >= 200 && source.routeCount <= 350, `${source.name} must meet the 200–350 substantive Route workload target`);
        assert.equal(source.routeCount, 215, `${source.name} must include its expanded primary, connector, and secondary route network`);
        assert.ok(source.regionCount >= 9, `${source.name} must include a hierarchy root and multiple child Regions`);
        assert.ok(source.paletteRecordCount >= 12, `${source.name} must carry the complete reusable profile palette surface`);
        assert.equal(source.provenance.type, 'owner-authored', `${source.name} must declare legally distributable original provenance`);
        assert.match(source.provenance.license, /legally distributable/i, `${source.name} provenance must make distribution basis explicit`);
    });
}

function providerAndRuntimeDigest(almanac) {
    return JSON.stringify({
        activeLocationId: almanac.config.world.activeLocationId,
        favoriteLocationIds: almanac.config.world.favoriteLocationIds,
        time: almanac.runtime.time,
        climate: almanac.runtime.climate,
        astronomy: almanac.runtime.astronomy,
        weather: almanac.runtime.weather,
        environment: almanac.runtime.environment,
        rest: almanac.runtime.rest,
        worldRuntime: almanac.runtime.world
    });
}

function assertPresetLibrarySafetyAndRestart() {
    const harness = createHarness();
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const dashboard = harness.dispatchCommand('!aa-gm');
    assert.match(dashboard[0].message, /Install Full WorldPack/, 'fresh GM dashboard must foreground the full built-in setting route');
    assert.match(dashboard[0].message, /!aa-worldpacks library/, 'fresh GM dashboard must route to the WorldPack Library without command memorization');
    assert.match(dashboard[0].message, /\[Back\]/, 'private Almanac dashboard panels must retain a compact Back recovery control');
    assert.match(dashboard[0].message, /\[Almanac Home\]/, 'private Almanac dashboard panels must retain an Almanac Home recovery control');
    const library = harness.dispatchCommand('!aa-worldpacks library');
    assert.match(library[0].message, /Asterfall Concord/, 'library must list a shipped full source');
    assert.match(library[0].message, /160 Locations/, 'library must disclose setting-scale content rather than hide a starter-sized package');
    assert.match(library[0].message, /\[Back\]/, 'WorldPack Library panels must retain a compact Back recovery control');
    assert.match(library[0].message, /\[Almanac Home\]/, 'WorldPack Library panels must retain an Almanac Home recovery control');
    const player = harness.dispatchCommand('!aa-worldpacks library', 'player-1');
    assert.doesNotMatch(player[0].message, /Asterfall Concord/, 'player command must not expose GM-only preset installation controls');

    const before = providerAndRuntimeDigest(almanac);
    harness.dispatchCommand('!aa-worldpacks preset install --id asterfall-concord');
    const canceledGrant = currentGrant(harness);
    const canceled = harness.dispatchCommand(`!aa-worldpacks cancel --grant ${canceledGrant}`);
    assert.match(canceled[0].message, /discarded/i, 'preset preview must be explicitly cancelable');
    assert.equal(almanac.config.worldPacks.installed.length, 0, 'canceled preset review must not install a pack');
    assert.equal(providerAndRuntimeDigest(almanac), before, 'canceling preset review must leave live providers and world runtime unchanged');

    harness.dispatchCommand('!aa-worldpacks preset install --id asterfall-concord');
    const revisionGrant = currentGrant(harness);
    almanac.config.world.revision += 1;
    const staleRevision = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${revisionGrant}`);
    assert.match(staleRevision[0].message, /changed after review|discarded/i, 'a changed Worldbuilding revision must invalidate preset confirmation');
    assert.equal(almanac.config.worldPacks.installed.length, 0, 'stale preset revision must not partially install content');

    harness.dispatchCommand('!aa-worldpacks preset install --id asterfall-concord');
    const sourceGrant = currentGrant(harness);
    almanac.runtime.worldPacks.grants[sourceGrant].presetVersion = 999;
    const staleSource = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${sourceGrant}`);
    assert.match(staleSource[0].message, /Preset Source Changed|source.*differs from the reviewed version/i, 'preset source-version drift must invalidate confirmation');
    assert.equal(almanac.config.worldPacks.installed.length, 0, 'stale preset source must not partially install content');

    installPreset(harness, 'asterfall-concord');
    const duplicate = harness.dispatchCommand('!aa-worldpacks preset install --id asterfall-concord');
    assert.match(duplicate[0].message, /already installed/i, 'duplicate built-in install must refuse collision rather than overwrite campaign content');
    const committed = harness.dispatchCommand('!aa-location use --id asterfall-concord-location-1-1');
    assert.match(committed[0].message, /Harbor Stead is now active/, 'installed source must expose a direct Session Mode starting Location');

    const restarted = createHarness(JSON.parse(JSON.stringify(almanac)));
    const restored = restarted.state.GameAssist.AlmanacAssist;
    assert.equal(restored.config.worldPacks.installed[0].presetSourceId, 'asterfall-concord', 'preset provenance must survive a sandbox restart');
    assert.equal(restored.config.world.locations.length, 160, 'installed setting graph must survive a sandbox restart');
    assert.equal(restarted.sandbox.GameAssist.AlmanacAssist.getScene().location.name, 'Harbor Stead', 'active installed Location must resolve after restart without reinstallation');
}

/**
 * Create the narrowly scoped persisted shape an earlier v1 built-in source
 * would have left behind before the v2 network expansion: a verified preset
 * clone with its 56 later secondary Routes absent.  This does not change the
 * immutable current source; it exercises the campaign-side update boundary.
 */
function makeLegacyPresetClone(harness, id = 'asterfall-concord') {
    installPreset(harness, id);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const installed = almanac.config.worldPacks.installed.find(pack => pack.id === id);
    const definition = almanac.config.worldPackDefinitions.packs.find(pack => pack.id === id);
    const secondaryIds = new Set(almanac.config.world.routes
        .filter(route => route.sourcePackId === id && route.tags.includes('secondary-route'))
        .map(route => route.id));
    assert.equal(secondaryIds.size, 56, 'current source fixture must identify all later v2 secondary Routes');
    almanac.config.world.routes = almanac.config.world.routes.filter(route => !secondaryIds.has(route.id));
    installed.manifest = installed.manifest.filter(entry => !(entry.collection === 'routes' && secondaryIds.has(entry.id)));
    installed.version = 1;
    installed.presetSourceVersion = 1;
    definition.version = 1;
    return { almanac, installed, definition, secondaryIds };
}

function assertBuiltInPresetSourceUpdates() {
    const missingHarness = createHarness();
    const missing = missingHarness.dispatchCommand('!aa-worldpacks preset update --id asterfall-concord');
    assert.match(missing[0].message, /Install Asterfall Concord before reviewing an update/i, 'a source update must not invent or install a missing clone');
    assert.equal(missingHarness.state.GameAssist.AlmanacAssist.config.worldPacks.installed.length, 0, 'missing-source update refusal must preserve an empty campaign registry');

    const harness = createHarness();
    const { almanac } = makeLegacyPresetClone(harness);
    const runtimeBefore = providerAndRuntimeDigest(almanac);
    const library = harness.dispatchCommand('!aa-worldpacks library');
    assert.match(library[0].message, /Review Update to v2/, 'the built-in library must expose an update review when a verified source clone is older');
    const details = harness.dispatchCommand('!aa-worldpacks preset preview --id asterfall-concord');
    assert.match(details[0].message, /source update v2 is available for review/i, 'preset details must explain the source-update state without command memorization');

    const preview = harness.dispatchCommand('!aa-worldpacks preset update --id asterfall-concord');
    assert.match(preview[0].message, /WorldPack Source Update Preview/, 'built-in updates must show a distinct expiring source-review screen');
    assert.match(preview[0].message, /Update Existing Pack/, 'built-in updates must disclose their non-destructive update mode');
    assert.match(preview[0].message, /unchanged geographic records/i, 'source-update review must explain the campaign-customization conflict policy');
    const commit = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${currentGrant(harness)}`);
    assert.match(commit[0].message, /WorldPack Committed/, 'a verified unchanged built-in clone must update after explicit confirmation');
    const updated = almanac.config.worldPacks.installed.find(pack => pack.id === 'asterfall-concord');
    const updatedDefinition = almanac.config.worldPackDefinitions.packs.find(pack => pack.id === 'asterfall-concord');
    assert.equal(updated.version, 2, 'source update must record the newer immutable package version');
    assert.equal(updated.presetSourceVersion, 2, 'source update must record newer immutable-source provenance');
    assert.equal(updated.manifest.length, 456, 'source update must refresh the complete geographic manifest atomically');
    assert.equal(almanac.config.world.routes.length, 215, 'source update must add the expanded secondary Route workload without reinstalling the pack');
    assert.equal(almanac.config.world.routes.filter(route => route.tags.includes('secondary-route')).length, 56, 'source update must restore every reviewed secondary Route');
    assert.equal(updatedDefinition.version, 2, 'source update must replace only the unchanged installed palette clone with the reviewed source version');
    assert.equal(providerAndRuntimeDigest(almanac), runtimeBefore, 'source update must not move the party or alter provider/runtime state');

    const current = harness.dispatchCommand('!aa-worldpacks preset update --id asterfall-concord');
    assert.match(current[0].message, /Source Is Current/, 'a current built-in source must not create a redundant update grant');
    assert.equal(Object.keys(almanac.runtime.worldPacks.grants).length, 0, 'current-source notice must leave no review grant behind');

    const conflictHarness = createHarness();
    const legacy = makeLegacyPresetClone(conflictHarness);
    const editedLocation = legacy.almanac.config.world.locations.find(location => location.id === 'asterfall-concord-location-1-1');
    editedLocation.description = 'Campaign-authored harbor detail that must survive a source update refusal.';
    const beforeWorld = JSON.stringify(legacy.almanac.config.world);
    const beforeRegistry = JSON.stringify(legacy.almanac.config.worldPacks);
    const beforeDefinitions = JSON.stringify(legacy.almanac.config.worldPackDefinitions);
    const refused = conflictHarness.dispatchCommand('!aa-worldpacks preset update --id asterfall-concord');
    assert.match(refused[0].message, /changed after installation|campaign geographic records/i, 'campaign-edited preset geography must refuse a built-in source update before preview');
    assert.match(refused[0].message, /Harbor Stead.*changed in this campaign/i, 'source-update refusal must identify the protected campaign record rather than leaving a generic conflict mystery');
    assert.match(refused[0].message, /Review as Independent Copy/,  'a refused built-in update must offer a visible non-destructive source-copy recovery path');
    assert.equal(JSON.stringify(legacy.almanac.config.world), beforeWorld, 'source-update conflict refusal must preserve campaign geographic customization');
    assert.equal(JSON.stringify(legacy.almanac.config.worldPacks), beforeRegistry, 'source-update conflict refusal must preserve old source provenance and manifest');
    assert.equal(JSON.stringify(legacy.almanac.config.worldPackDefinitions), beforeDefinitions, 'source-update conflict refusal must preserve campaign-owned palette definitions');
    assert.equal(Object.keys(legacy.almanac.runtime.worldPacks.grants).length, 0, 'source-update conflict refusal must not leave a confirmable grant');

    const copyReview = conflictHarness.dispatchCommand('!aa-worldpacks preset copy --id asterfall-concord');
    assert.match(copyReview[0].message, /Import as Copy/, 'a built-in source copy must use the same explicit reviewed copy mode as portable WorldPacks');
    const copyCommit = conflictHarness.dispatchCommand(`!aa-worldpacks confirm --grant ${currentGrant(conflictHarness)}`);
    assert.match(copyCommit[0].message, /WorldPack Committed/, 'a source copy must commit only after explicit confirmation');
    const copied = legacy.almanac.config.worldPacks.installed.find(pack => pack.id !== 'asterfall-concord');
    assert.ok(copied, 'source-copy recovery must create a second campaign-owned pack rather than replacing the conflicted clone');
    assert.equal(copied.importedFromPackId, 'asterfall-concord', 'source-copy recovery must disclose its source relationship in campaign provenance');
    assert.equal(legacy.almanac.config.world.locations.find(location => location.id === 'asterfall-concord-location-1-1').description, 'Campaign-authored harbor detail that must survive a source update refusal.', 'source-copy recovery must leave the edited original clone untouched');
}

function assertFourIndependentInstalls() {
    ['asterfall-concord', 'veyra-turning', 'narthvale-compact', 'lumenfen-atlas'].forEach(id => {
        const harness = createHarness();
        const before = JSON.stringify(harness.state.GameAssist.AlmanacAssist.config.world);
        const providersBefore = providerAndRuntimeDigest(harness.state.GameAssist.AlmanacAssist);
        installPreset(harness, id);
        const almanac = harness.state.GameAssist.AlmanacAssist;
        assert.equal(almanac.config.worldPacks.installed.length, 1, `${id} must install independently into an empty campaign`);
        assert.equal(almanac.config.worldPacks.installed[0].presetSourceId, id, `${id} must retain PresetRegistry provenance`);
        assert.equal(almanac.config.worldPackDefinitions.packs.length, 1, `${id} must create one campaign-owned definition clone`);
        assert.equal(almanac.config.worldPacks.installed[0].presetSourceVersion, 2, `${id} must retain the expanded immutable source version in campaign provenance`);
        assert.equal(almanac.config.world.regions.length, 9, `${id} must install a hierarchical regional setting`);
        assert.equal(almanac.config.world.locations.length, 160, `${id} must install a setting-scale network of playable Locations`);
        assert.equal(almanac.config.world.routes.length, 215, `${id} must install a 200-plus setting-scale prepared route network`);
        assert.equal(almanac.config.world.routes.filter(route => route.tags.includes('secondary-route')).length, 56, `${id} must retain seven distinct secondary/shortcut route choices across each of eight districts`);
        assert.equal(['regions', 'geographies', 'ecoregions', 'biomes', 'locations', 'destinations', 'routes', 'phenomena'].reduce((count, collection) => count + almanac.config.world[collection].length, 0), 456, `${id} must install the declared complete geographic workload`);
        assert.equal(almanac.config.world.activeLocationId, null, `${id} must not silently move the party during installation`);
        assert.equal(providerAndRuntimeDigest(almanac), providersBefore, `${id} must not alter runtime, Time, Weather, Astronomy, provider, favorites, or journey state during installation`);
        assert.notEqual(JSON.stringify(almanac.config.world), before, `${id} must install a real geographic graph rather than an empty shell`);
    });
}

function assertOperationalProfilesAndControls() {
    const harness = createHarness();
    installPreset(harness, 'asterfall-concord');
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const use = harness.dispatchCommand('!aa-location use --id asterfall-concord-location-1-1');
    assert.match(use[0].message, /Harbor Stead is now active/, 'installed location must be usable in Session Mode');
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(scene.time.current.calendarName, 'Asterfall Concord Reckoning', 'installed Calendar must project the active scene chronology');
    assert.equal(scene.climate.baseline.profileName, 'Asterfall Concord Seasonal Baseline', 'installed Climate Profile must resolve through geographic inheritance');
    assert.equal(scene.climate.baseline.contextScope, 'ecoregion', 'WorldPack profile resolution must retain the stable coarse Ecoregion scope for Scene/API consumers');
    assert.equal(scene.climate.baseline.contextSourceKind, 'ecoregion-profile', 'WorldPack profile resolution must expose its richer source kind without overloading the stable scope token');
    assert.equal(scene.temporal.name, 'Asterfall Concord Local Measure', 'installed Temporal Context must resolve in SceneResolver');
    assert.equal(scene.astronomy.installedProfile.name, 'Asterfall Concord Skywatch', 'installed Astronomy Profile must be visible to SceneResolver');
    assert.equal(scene.worldPack.profiles.travelProfile.id, 'asterfall-concord-travel', 'installed Travel Profile provenance must resolve');

    const weather = harness.dispatchCommand('!aa-weather generate');
    assert.match(weather[0].message, /Installed Weather Policy/, 'Weather UI must disclose a resolved installed policy');
    assert.equal(almanac.runtime.weather.current.weatherPolicyId, 'asterfall-concord-weather-policy', 'generated Weather must retain applied policy provenance');

    const plan = harness.dispatchCommand('!aa-travel plan --location asterfall-concord-location-1-2 --route asterfall-concord-route-1-1');
    assert.match(plan[0].message, /2\.7 miles per fictional hour/, 'Travel Profile speed must affect reviewed Travel planning');

    const palette = harness.dispatchCommand('!aa-worldpacks palette --pack asterfall-concord');
    assert.match(palette[0].message, /Installed Palette/, 'installed palette must have an accessible editor screen');
    const definitionsRevision = almanac.config.worldPackDefinitions.revision;
    const binding = harness.dispatchCommand('!aa-worldpacks binding set --pack asterfall-concord --field defaultWeatherPolicyId --value asterfall-concord-weather-policy');
    assert.match(binding[0].message, /Installed Palette/, 'editable default bindings must return to compact palette controls');
    assert.equal(almanac.config.worldPackDefinitions.revision, definitionsRevision + 1, 'binding save must make a campaign-owned definition change');

    const templateReview = harness.dispatchCommand('!aa-phenomena template --id asterfall-concord-phenomenon-template');
    assert.match(templateReview[0].message, /Review Template Clone/, 'Phenomena Template use must remain explicit and review-first');
    const templateGrant = Object.keys(almanac.runtime.world.phenomenonGrants)[0];
    const templateConfirm = harness.dispatchCommand(`!aa-phenomena confirm --grant ${templateGrant}`);
    assert.match(templateConfirm[0].message, /Worldbuilding \/ Phenomenon/, 'template confirmation must open the editable campaign definition');
    const clone = almanac.config.world.phenomena.find(item => item.sourcePhenomenonTemplateId === 'asterfall-concord-phenomenon-template');
    assert.ok(clone, 'template confirmation must create an editable campaign phenomenon definition');
    assert.equal(almanac.runtime.world.activePhenomena.length, 0, 'template cloning must never activate a phenomenon automatically');
}

function assertPaletteEditingAndCalendarProjection() {
    const harness = createHarness();
    installPreset(harness, 'asterfall-concord');
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const definitions = () => almanac.config.worldPackDefinitions.packs.find(pack => pack.id === 'asterfall-concord');

    const addTravel = harness.dispatchCommand('!aa-worldpacks palette add --pack asterfall-concord --collection travelProfiles --id asterfall-custom-trail --name "Asterfall Custom Trail"');
    assert.match(addTravel[0].message, /Installed Palette/, 'campaign-owned clones must support adding a typed reusable profile');
    const setTravel = harness.dispatchCommand('!aa-worldpacks palette set --pack asterfall-concord --collection travelProfiles --id asterfall-custom-trail --field milesPerHour --value 1.9');
    assert.match(setTravel[0].message, /Travel Profile/, 'the generated palette set command must execute the same validated save path as Edit');
    assert.equal(definitions().palette.travelProfiles.find(profile => profile.id === 'asterfall-custom-trail').milesPerHour, 1.9, 'palette set must persist typed numeric values');

    const profileBinding = harness.dispatchCommand('!aa-world set location --id asterfall-concord-location-1-1 --field travelProfileId --value asterfall-custom-trail');
    assert.match(profileBinding[0].message, /Worldbuilding \/ Location/, 'geographic records must expose typed installed-palette bindings');
    harness.dispatchCommand('!aa-location use --id asterfall-concord-location-1-1');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getScene().worldPack.profiles.travelProfile.id, 'asterfall-custom-trail', 'direct Location profile binding must win in resolved Scene context');

    const setClimate = harness.dispatchCommand('!aa-worldpacks palette set --pack asterfall-concord --collection climateProfiles --id asterfall-concord-climate --field temperatureF --value 65');
    assert.match(setClimate[0].message, /Climate Profile/, 'palette set must update a Climate Profile from its editor command');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getScene().climate.baseline.temperatureF, 65, 'edited installed Climate Profile must affect SceneResolver without provider writes');

    const addCalendar = harness.dispatchCommand('!aa-worldpacks palette add --pack asterfall-concord --collection calendars --id asterfall-standard-projection --name "Asterfall Standard Projection" --providerProfileId standard');
    assert.match(addCalendar[0].message, /Installed Palette/, 'provider-backed Calendar projection must be addable without raw JSON');
    const calendar = definitions().palette.calendars.find(record => record.id === 'asterfall-standard-projection');
    assert.equal(calendar.id, 'asterfall-standard-projection', 'provider-backed Calendar must retain its stable ID');
    assert.equal(calendar.providerProfileId, 'standard', 'provider-backed Calendar must retain its selected projection profile');
    assert.equal(calendar.definition, null, 'provider-backed Calendar must retain a canonical null definition across validation passes');
    harness.dispatchCommand('!aa-world set location --id asterfall-concord-location-1-1 --field calendarId --value asterfall-standard-projection');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getScene().worldPack.profiles.calendar.id, 'asterfall-standard-projection', 'Location Calendar binding must affect only chronology projection selection');

    // A pre-existing macro can still submit the removed provider token, but the
    // campaign clone must immediately store only its current original replacement.
    const legacyProviderId = ['sol', 'amnic'].join('');
    const addMigratedCalendar = harness.dispatchCommand(`!aa-worldpacks palette add --pack asterfall-concord --collection calendars --id asterfall-migrated-projection --name "Asterfall Migrated Projection" --providerProfileId ${legacyProviderId}`);
    assert.match(addMigratedCalendar[0].message, /Installed Palette/, 'legacy calendar projection input must migrate through the ordinary validated clone path');
    assert.equal(definitions().palette.calendars.find(record => record.id === 'asterfall-migrated-projection').providerProfileId, 'cinderturn', 'legacy provider input must never be newly persisted under its removed identifier');
    harness.dispatchCommand('!aa-world set location --id asterfall-concord-location-1-1 --field calendarId --value asterfall-migrated-projection');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getScene().worldPack.profiles.calendar.name, 'Asterfall Migrated Projection', 'a migrated Calendar projection must remain bindable to an installed Location');

    // Ecoregion Profile phenomenon templates are an array relation rather than a
    // scalar profile. The catalog picker must preserve that canonical array shape
    // instead of submitting a malformed one-value string to the palette validator.
    const templatePicker = harness.dispatchCommand('!aa-worldpacks palette reference choose --pack asterfall-concord --collection ecoregionProfiles --id asterfall-concord-ecoregion-profile --field phenomenonTemplateIds --page 0');
    assert.match(templatePicker[0].message, /Asterfall Skyglow/, 'array-valued palette reference picker must expose a named available template');
    const templateBinding = harness.dispatchCommand('!aa-worldpacks palette set --pack asterfall-concord --collection ecoregionProfiles --id asterfall-concord-ecoregion-profile --field phenomenonTemplateIds --value asterfall-concord-phenomenon-template');
    assert.match(templateBinding[0].message, /Ecoregion Profile/, 'array-valued palette reference save must return to its editable record');
    assert.deepEqual(Array.from(definitions().palette.ecoregionProfiles.find(profile => profile.id === 'asterfall-concord-ecoregion-profile').phenomenonTemplateIds), ['asterfall-concord-phenomenon-template'], 'array-valued palette reference save must retain a canonical named template-ID array');
    harness.dispatchCommand('!aa-worldpacks palette set --pack asterfall-concord --collection ecoregionProfiles --id asterfall-concord-ecoregion-profile --field phenomenonTemplateIds --value none');
    assert.deepEqual(Array.from(definitions().palette.ecoregionProfiles.find(profile => profile.id === 'asterfall-concord-ecoregion-profile').phenomenonTemplateIds), [], 'array-valued palette reference clear must retain a canonical empty array');

    const beforeBadBinding = JSON.stringify(almanac.config.world.locations.find(location => location.id === 'asterfall-concord-location-1-1'));
    const badBinding = harness.dispatchCommand('!aa-world set location --id asterfall-concord-location-1-1 --field calendarId --value unavailable-calendar');
    assert.match(badBinding[0].message, /installed palette|unavailable/i, 'unknown typed profile binding must refuse rather than guess a pack owner');
    assert.equal(JSON.stringify(almanac.config.world.locations.find(location => location.id === 'asterfall-concord-location-1-1')), beforeBadBinding, 'refused typed profile binding must not alter geographic state');

    harness.dispatchCommand('!aa-worldpacks palette add --pack asterfall-concord --collection travelProfiles --id asterfall-removable-trail --name "Asterfall Removable Trail"');
    const removalReview = harness.dispatchCommand('!aa-worldpacks palette remove --pack asterfall-concord --collection travelProfiles --id asterfall-removable-trail');
    assert.match(removalReview[0].message, /Confirm Palette Removal/, 'palette removal must require an explicit destructive confirmation');
    const removal = harness.dispatchCommand('!aa-worldpacks palette remove --pack asterfall-concord --collection travelProfiles --id asterfall-removable-trail --confirm yes');
    assert.match(removal[0].message, /Installed Palette/, 'unreferenced palette removal must return to compact palette controls');
    assert.equal(definitions().palette.travelProfiles.some(profile => profile.id === 'asterfall-removable-trail'), false, 'confirmed unreferenced palette removal must delete only that campaign clone record');
    const protectedRemoval = harness.dispatchCommand('!aa-worldpacks palette remove --pack asterfall-concord --collection travelProfiles --id asterfall-concord-travel --confirm yes');
    assert.match(protectedRemoval[0].message, /still used/i, 'referenced palette removal must refuse rather than create dangling defaults or Route Legs');
}

function makePaletteCatalogFixture(recordCount = 25) {
    const pack = makeV2Fixture();
    for (let index = 1; index < recordCount; index += 1) {
        const suffix = String(index).padStart(3, '0');
        pack.palette.climateProfiles.push({
            id: `fixture-climate-${suffix}`, name: `Fixture Climate ${suffix}`, description: `Fixture climate profile ${suffix}.`, tags: ['fixture', 'catalog'],
            temperatureF: 45 + (index % 25), humidity: 50, precipitationChance: 30, windMph: 6, seasonalAdjustments: []
        });
        pack.palette.travelProfiles.push({
            id: `fixture-travel-${suffix}`, name: `Fixture Travel ${suffix}`, description: `Fixture travel profile ${suffix}.`, tags: ['fixture', 'catalog'],
            defaultPace: 'standard', milesPerHour: 2.1 + ((index % 5) / 10), terrainNote: 'Fixture catalog footing.', seasonalNote: ''
        });
        pack.palette.weatherPolicies.push({
            id: `fixture-weather-${suffix}`, name: `Fixture Weather ${suffix}`, description: `Fixture weather policy ${suffix}.`, tags: ['fixture', 'catalog'],
            forecastDays: 2, temperatureBias: 0, windBias: 0, precipitationBias: 0, summary: 'Fixture catalog weather evidence.'
        });
    }
    return pack;
}

/**
 * Palette definitions are independently setting-scale data. This covers the
 * separate catalog/chooser surface rather than assuming that a dozen visible
 * root-card rows can represent every reusable profile or safely fit in a
 * Roll20 query macro.
 */
function assertPaletteCatalogScaleAndBindingPicker() {
    const harness = createHarness();
    installFixture(harness, makePaletteCatalogFixture(25));
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const catalogState = () => JSON.stringify({
        world: almanac.config.world,
        definitions: almanac.config.worldPackDefinitions,
        runtime: almanac.runtime
    });
    const beforeBrowse = catalogState();

    const root = harness.dispatchCommand('!aa-worldpacks palette --pack fixture-v2-pack');
    assert.match(root[0].message, /Climate Profile=25 climate profile records/, 'palette root must disclose complete collection counts instead of silently showing only its first dozen records');
    assert.match(root[0].message, /Manage Default Bindings/, 'palette root must route defaults through a dedicated bounded binding surface');
    assert.ok(root[0].message.length < 6000, 'palette root must remain compact even when one reusable definition collection grows beyond one page');
    assert.doesNotMatch(root[0].message, /Fixture Climate 024/, 'palette root must summarize rather than repeat profile names in an unbounded card');

    const first = harness.dispatchCommand('!aa-worldpacks palette list --pack fixture-v2-pack --collection climateProfiles --page 0');
    assert.match(first[0].message, /Climate Profile 1 of 3/, 'palette catalog must page a 25-record collection from its first record');
    assert.equal((first[0].message.match(/\[Edit\]/g) || []).length, 12, 'palette catalog must expose no more than the configured direct-edit page bound');
    const last = harness.dispatchCommand('!aa-worldpacks palette list --pack fixture-v2-pack --collection climateProfiles --page 2');
    assert.match(last[0].message, /Climate Profile 3 of 3/, 'palette catalog must retain direct access to the final definition page');
    assert.match(last[0].message, /Fixture Climate 024/, 'final palette catalog page must expose distant reusable profiles without a technical ID lookup');
    const search = harness.dispatchCommand('!aa-worldpacks palette search --pack fixture-v2-pack --collection climateProfiles --query "Fixture Climate 024" --page 0');
    assert.match(search[0].message, /Search: fixture climate 024 1 of 1/, 'palette catalog search must resolve a named distant profile through a bounded view');

    const bindings = harness.dispatchCommand('!aa-worldpacks palette bindings --pack fixture-v2-pack');
    assert.match(bindings[0].message, /Default Climate Profile=.*\[Choose\]/, 'default bindings must expose a chooser rather than a raw profile-ID field');
    assert.doesNotMatch(bindings[0].message, /&#63;&#123;|\?\{/, 'default bindings must not embed setting-scale Roll20 option queries in their root card');
    const bindingLast = harness.dispatchCommand('!aa-worldpacks binding choose --pack fixture-v2-pack --field defaultClimateProfileId --page 2');
    assert.match(bindingLast[0].message, /Default Climate Profile 3 of 3/, 'binding chooser must page the complete target profile collection');
    assert.match(bindingLast[0].message, /Fixture Climate 024/, 'binding chooser must make a distant profile directly selectable');
    assert.ok((bindingLast[0].message.match(/\[Use This Default\]/g) || []).length <= 12, 'binding chooser must retain the configured compact action bound');
    const bindingSearch = harness.dispatchCommand('!aa-worldpacks binding choose search --pack fixture-v2-pack --field defaultClimateProfileId --query "Fixture Climate 024" --page 0');
    assert.match(bindingSearch[0].message, /Search: fixture climate 024 1 of 1/, 'binding chooser search must resolve a named distant reusable profile');

    // Every other dynamic profile relation must use the same compact catalog
    // pattern. These are the screens that previously assembled every profile in
    // a Roll20 query button and became unusable at a setting-scale palette.
    const worldEditor = harness.dispatchCommand('!aa-world edit ecoregion --id fixture-ecoregion --layer detailed');
    assert.match(worldEditor[0].message, /!aa-world choose --type ecoregion --id fixture-ecoregion --field climateProfileId --page 0/, 'Worldbuilding profile fields must route to a bounded picker instead of embedding all profile options');
    assert.ok(worldEditor[0].message.length < 6000, 'Worldbuilding profile editor must remain compact with multiple 25-record reusable profile collections');
    const worldProfileLast = harness.dispatchCommand('!aa-world choose --type ecoregion --id fixture-ecoregion --field climateProfileId --page 2');
    assert.match(worldProfileLast[0].message, /Climate Profile 3 of 3/, 'Worldbuilding profile chooser must retain access to its final reusable-profile page');
    assert.match(worldProfileLast[0].message, /Fixture Climate 024/, 'Worldbuilding profile chooser must expose a distant named profile');

    const paletteEditor = harness.dispatchCommand('!aa-worldpacks palette edit --pack fixture-v2-pack --collection ecoregionProfiles --id fixture-eco-profile');
    assert.match(paletteEditor[0].message, /!aa-worldpacks palette reference choose --pack fixture-v2-pack --collection ecoregionProfiles --id fixture-eco-profile --field climateProfileId --page 0/, 'palette cross-reference fields must route to a bounded picker instead of embedding all profile options');
    assert.ok(paletteEditor[0].message.length < 6000, 'palette cross-reference editor must remain compact with multiple 25-record profile collections');
    const paletteProfileLast = harness.dispatchCommand('!aa-worldpacks palette reference choose --pack fixture-v2-pack --collection ecoregionProfiles --id fixture-eco-profile --field climateProfileId --page 2');
    assert.match(paletteProfileLast[0].message, /Climate Profile 3 of 3/, 'palette cross-reference chooser must retain access to the final profile page');
    assert.match(paletteProfileLast[0].message, /Fixture Climate 024/, 'palette cross-reference chooser must expose a distant named profile');

    const legEditor = harness.dispatchCommand('!aa-world route legs --route fixture-route');
    assert.match(legEditor[0].message, /!aa-world route leg choose profile --route fixture-route --id fixture-leg-a-b --page 0/, 'Route Leg profile controls must route to a bounded picker instead of embedding all profile options');
    assert.ok(legEditor[0].message.length < 6000, 'Route Leg editor must remain compact with a multi-page Travel Profile collection');
    const legProfileLast = harness.dispatchCommand('!aa-world route leg choose profile --route fixture-route --id fixture-leg-a-b --page 2');
    assert.match(legProfileLast[0].message, /Travel Profile 3 of 3/, 'Route Leg profile chooser must retain access to the final profile page');
    assert.match(legProfileLast[0].message, /Fixture Travel 024/, 'Route Leg profile chooser must expose a distant named Travel Profile');
    assert.equal(catalogState(), beforeBrowse, 'palette/profile catalogs and relation choosers must be read-only until an explicit selection is made');

    const chosen = harness.dispatchCommand('!aa-worldpacks binding set --pack fixture-v2-pack --field defaultClimateProfileId --value fixture-climate-024');
    assert.match(chosen[0].message, /Installed Palette \/ Default Bindings/, 'choosing a default must return to the focused compact bindings panel');
    const installed = almanac.config.worldPackDefinitions.packs.find(pack => pack.id === 'fixture-v2-pack');
    assert.equal(installed.bindings.defaultClimateProfileId, 'fixture-climate-024', 'binding chooser targets must save only the selected matching installed profile');

    const atLimitHarness = createHarness();
    installFixture(atLimitHarness, makePaletteCatalogFixture(160));
    const atLimitDefinitions = JSON.stringify(atLimitHarness.state.GameAssist.AlmanacAssist.config.worldPackDefinitions);
    const atLimit = atLimitHarness.dispatchCommand('!aa-worldpacks palette add --pack fixture-v2-pack --collection climateProfiles --id fixture-climate-overflow --name "Fixture Climate Overflow"');
    assert.match(atLimit[0].message, /Palette Limit.*160/, 'direct palette creation must enforce the declared per-collection setting-scale bound');
    assert.equal(JSON.stringify(atLimitHarness.state.GameAssist.AlmanacAssist.config.worldPackDefinitions), atLimitDefinitions, 'at-limit palette refusal must preserve the installed campaign clone');

    const oversizedHarness = createHarness();
    const oversized = makePaletteCatalogFixture(161);
    const beforeOversized = JSON.stringify(oversizedHarness.state.GameAssist.AlmanacAssist.config.worldPacks);
    const oversizedHandout = createPackHandout(oversizedHarness, oversized);
    const oversizedResult = oversizedHarness.dispatchCommand(`!aa-worldpacks import --handout ${oversizedHandout.id} --mode new`);
    assert.match(oversizedResult[0].message, /palette\.climateProfiles exceeds the bounded 160-record collection limit/i, 'portable input must enforce the same palette collection bound before review');
    assert.equal(JSON.stringify(oversizedHarness.state.GameAssist.AlmanacAssist.config.worldPacks), beforeOversized, 'oversized palette import refusal must leave the registry unchanged');
}

function assertLargeScaleSessionSelectors() {
    const harness = createHarness();
    ['asterfall-concord', 'veyra-turning', 'narthvale-compact', 'lumenfen-atlas'].forEach(id => installPreset(harness, id));
    const world = harness.state.GameAssist.AlmanacAssist.config.world;
    assert.equal(world.locations.length, 640, 'all four independent full sources must coexist below campaign Worldbuilding limits');
    assert.equal(world.routes.length, 860, 'all four independent 200-plus route networks must coexist below campaign Worldbuilding limits');
    harness.dispatchCommand('!aa-location use --id asterfall-concord-location-1-1');
    const compactLocation = harness.dispatchCommand('!aa-location');
    assert.match(compactLocation[0].message, /Current Area/, 'compact Location Session Mode must retain current-area context');
    assert.match(compactLocation[0].message, /Nearby/, 'compact Location Session Mode must retain Nearby choices');
    assert.match(compactLocation[0].message, /Prepared/, 'compact Location Session Mode must retain Prepared choices');
    assert.ok((compactLocation[0].message.match(/\[Go Here\]/g) || []).length <= 15, 'compact Location root must cap representatives across large-catalog groups');
    const first = harness.dispatchCommand('!aa-location all --page 0');
    assert.match(first[0].message, /All Locations 1 of 54/, 'All Location selector must page a setting-scale multi-pack catalog');
    assert.ok((first[0].message.match(/\[Go Here\]/g) || []).length <= 12, 'All Location selector must retain the configured compact page bound');
    const last = harness.dispatchCommand('!aa-location all --page 53');
    assert.match(last[0].message, /All Locations 54 of 54/, 'bounded selector must retain access to the final catalog page');
    assert.ok(last[0].message.length < 12000, 'large-world selector response must remain bounded for Roll20 chat');

    // Session Mode alone is not enough at setting scale: a GM must also be able
    // to discover and edit every installed Worldbuilding record without recalling
    // a stable ID from a technical screen. Catalog navigation itself remains
    // read-only; only the explicit record editor can prepare a mutation.
    const beforeWorldCatalog = JSON.stringify(world);
    const worldEditorFirst = harness.dispatchCommand('!aa-world locations');
    assert.match(worldEditorFirst[0].message, /Locations 1 of 54/, 'Worldbuilding Locations must page the complete four-pack catalog instead of stopping at its first dozen records');
    assert.ok((worldEditorFirst[0].message.match(/\[Edit\]/g) || []).length <= 12, 'Worldbuilding catalog page must retain the configured direct-edit bound');
    const worldEditorLast = harness.dispatchCommand('!aa-world locations --page 53');
    assert.match(worldEditorLast[0].message, /Locations 54 of 54/, 'Worldbuilding pagination must retain access to the final setting-scale Location page');
    const worldEditorSearch = harness.dispatchCommand('!aa-world locations search --query Harbor --page 0');
    assert.match(worldEditorSearch[0].message, /Search: harbor 1 of 1/, 'Worldbuilding search must expose named catalog records without raw-ID command memorization');
    assert.ok((worldEditorSearch[0].message.match(/\[Edit\]/g) || []).length <= 12, 'Worldbuilding search must retain bounded direct-edit controls');
    const emptyWorldEditorSearch = harness.dispatchCommand('!aa-world locations search');
    assert.match(emptyWorldEditorSearch[0].message, /Enter a location name or tag/i, 'an incomplete catalog search must give a compact next step instead of falling back to an unbounded or ID-only list');
    const worldRouteLast = harness.dispatchCommand('!aa-world routes --page 71');
    assert.match(worldRouteLast[0].message, /Travel Routes 72 of 72/, 'Worldbuilding route catalog must also retain complete paged access at four-pack scale');
    ['regions', 'geographies', 'ecoregions', 'biomes', 'destinations', 'phenomena', 'presets'].forEach(collection => {
        const catalog = harness.dispatchCommand(`!aa-world ${collection}`);
        assert.match(catalog[0].message, /Catalog=/, `${collection} must use the shared bounded Worldbuilding catalog rather than an ID-only or unknown-command path`);
        assert.ok((catalog[0].message.match(/\[Edit\]/g) || []).length <= 12, `${collection} catalog must retain the direct-edit page bound`);
    });

    // Editor relations must not silently inherit the old twelve-choice query
    // ceiling. A route editor and Route Leg both need complete discovery paths
    // across the same 640 Location setting-scale workload.
    const routeEndpointChoices = harness.dispatchCommand('!aa-world choose --type route --id asterfall-concord-route-1-1 --field toLocationId --page 53');
    assert.match(routeEndpointChoices[0].message, /Destination Location 54 of 54/, 'Route endpoint chooser must retain access to the final Location page instead of truncating to its first dozen options');
    assert.ok((routeEndpointChoices[0].message.match(/\[Use This Choice\]/g) || []).length <= 12, 'Route endpoint chooser must retain the direct-selection page bound');
    assert.ok(routeEndpointChoices[0].message.length < 6000, 'Route endpoint chooser must remain compact at four-world Location scale');
    const routeViaChoices = harness.dispatchCommand('!aa-world route leg choose via --route asterfall-concord-route-1-1 --id asterfall-concord-route-1-1-leg-1 --page 53');
    assert.match(routeViaChoices[0].message, /Intermediate Location 54 of 54/, 'Route Leg split chooser must retain access to the final eligible intermediate Location page');
    assert.ok((routeViaChoices[0].message.match(/\[Split Through Here\]/g) || []).length <= 12, 'Route Leg split chooser must retain the direct-action page bound');
    assert.ok(routeViaChoices[0].message.length < 6000, 'Route Leg split chooser must remain compact at four-world Location scale');

    // Decode the ordinary chat-button targets from the setting-scale surfaces.
    // This is structural VM evidence only, but it catches the source-side route
    // assembly regressions that otherwise appear as dead buttons after Roll20
    // renders entity-encoded queries and links.
    const pickerScreens = [
        ['Worldbuilding Location editor', harness.dispatchCommand('!aa-world edit location --id asterfall-concord-location-1-1 --layer detailed')[0].message],
        ['Worldbuilding Region chooser', harness.dispatchCommand('!aa-world choose --type location --id asterfall-concord-location-1-1 --field regionId --page 0')[0].message],
        ['Route Leg editor', harness.dispatchCommand('!aa-world route legs --route asterfall-concord-route-1-1')[0].message],
        ['Route Leg split chooser', routeViaChoices[0].message],
        ['Installed Palette root', harness.dispatchCommand('!aa-worldpacks palette --pack asterfall-concord')[0].message],
        ['Installed Palette bindings', harness.dispatchCommand('!aa-worldpacks palette bindings --pack asterfall-concord')[0].message],
        ['Palette relation chooser', harness.dispatchCommand('!aa-worldpacks palette reference choose --pack asterfall-concord --collection ecoregionProfiles --id asterfall-concord-ecoregion-profile --field climateProfileId --page 0')[0].message]
    ];
    pickerScreens.forEach(([label, message]) => assertBoundedRenderedTargets(message, label));
    assert.equal(JSON.stringify(world), beforeWorldCatalog, 'Worldbuilding catalog pages, relation choosers, and search must not reorder, mutate, or activate campaign records');

    const compactTravel = harness.dispatchCommand('!aa-travel');
    assert.match(compactTravel[0].message, /Nearby/, 'compact Travel Session Mode must prioritize nearby destinations');
    assert.match(compactTravel[0].message, /Search/, 'compact Travel Session Mode must expose name-first destination search');
    assert.match(compactTravel[0].message, /Browse All/, 'compact Travel Session Mode must expose a bounded All-destinations view');
    assert.ok((compactTravel[0].message.match(/\[Plan Travel\]/g) || []).length <= 15, 'compact Travel root must cap representative destination actions across large-catalog groups');
    const travelFirst = harness.dispatchCommand('!aa-travel all --page 0');
    assert.match(travelFirst[0].message, /All Destinations 1 of 54/, 'Travel All view must page the same setting-scale catalog without raw IDs');
    assert.ok((travelFirst[0].message.match(/\[Plan Travel\]/g) || []).length <= 12, 'Travel All view must retain the configured compact page bound');
    const travelLast = harness.dispatchCommand('!aa-travel all --page 53');
    assert.match(travelLast[0].message, /All Destinations 54 of 54/, 'Travel All view must retain access to the final destination page');
    const travelPrepared = harness.dispatchCommand('!aa-travel prepared --page 0');
    assert.match(travelPrepared[0].message, /Prepared Destinations 1 of 8/, 'Travel Prepared view must page the multi-pack prepared-destination catalog');
    assert.ok((travelPrepared[0].message.match(/\[Plan Travel\]/g) || []).length <= 12, 'Travel Prepared view must retain the configured compact page bound');
    const travelSearch = harness.dispatchCommand('!aa-travel search --query Harbor --page 0');
    assert.match(travelSearch[0].message, /Search: harbor 1 of 1/, 'Travel Search must resolve named destination text through a bounded view');
}

function assertRouteLegEditor() {
    const harness = createHarness();
    installFixture(harness, makeV2Fixture());
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const initial = harness.dispatchCommand('!aa-world route legs --route fixture-route');
    assert.match(initial[0].message, /Route Legs/, 'Route Leg editor must be reachable from a route command');
    const split = harness.dispatchCommand('!aa-world route leg split --route fixture-route --id fixture-leg-a-b --via fixture-c --first 2');
    // fixture-c is an existing intermediate Location even though it was previously
    // the route endpoint of the second leg; the whole replacement remains valid.
    assert.match(split[0].message, /Route Legs/, 'atomic split must return to the Route Leg editor');
    let route = almanac.config.world.routes.find(item => item.id === 'fixture-route');
    assert.equal(route.legs.length, 3, 'splitting one nested leg must atomically retain all legs');
    assert.equal(route.legs.reduce((total, leg) => total + leg.distanceMiles, 0), route.distanceMiles, 'split legs must retain route-distance agreement');
    assert.ok(route.legs.every((leg, index) => index === 0 || route.legs[index - 1].toLocationId === leg.fromLocationId), 'split legs must remain continuous');

    const endpointRefusal = harness.dispatchCommand('!aa-world set route --id fixture-route --field fromLocationId --value fixture-b');
    assert.match(endpointRefusal[0].message, /explicit Route Legs/, 'endpoint changes that would silently desynchronize nested legs must be refused');
    const merge = harness.dispatchCommand(`!aa-world route leg merge --route fixture-route --id ${route.legs[0].id}`);
    assert.match(merge[0].message, /Route Legs/, 'atomic merge must return to Route Leg editor');
    route = almanac.config.world.routes.find(item => item.id === 'fixture-route');
    assert.equal(route.legs.length, 2, 'merge must atomically reduce a continuous path');
    const cleared = harness.dispatchCommand('!aa-world route leg clear --route fixture-route --confirm yes');
    assert.match(cleared[0].message, /No Explicit Legs/, 'confirmed clear must remove nested legs without rewriting the route distance');
    route = almanac.config.world.routes.find(item => item.id === 'fixture-route');
    assert.equal(route.legs.length, 0, 'clear must remove only explicit legs');
    assert.equal(route.distanceMiles, 10, 'clear must preserve the ordinary route estimate');
}

function assertRouteLegActiveJourneyRefusal() {
    const harness = createHarness();
    installFixture(harness, makeV2Fixture());
    const almanac = harness.state.GameAssist.AlmanacAssist;
    harness.dispatchCommand('!aa-location use --id fixture-a');
    const review = harness.dispatchCommand('!aa-travel plan --location fixture-c --route fixture-route');
    assert.match(review[0].message, /Review Start/, 'fixture route must be usable by reviewed Travel before active-leg refusal is tested');
    const grant = Object.keys(almanac.runtime.world.travel.grants)[0];
    const start = harness.dispatchCommand(`!aa-travel start --grant ${grant}`);
    assert.match(start[0].message, /Travel \/ Journey/, 'accepted route review must create an active journey');
    const before = JSON.stringify(almanac.config.world.routes.find(route => route.id === 'fixture-route').legs);
    const blocked = harness.dispatchCommand('!aa-world route leg clear --route fixture-route --confirm yes');
    assert.match(blocked[0].message, /Journey Active/, 'Route Leg mutation must be blocked while that route carries an active journey');
    assert.equal(JSON.stringify(almanac.config.world.routes.find(route => route.id === 'fixture-route').legs), before, 'active-journey Route Leg refusal must retain the whole original nested path');
}

function assertEmptyPaletteBindingDigestSafety() {
    const harness = createHarness();
    installFixture(harness, makeEmptyPaletteFixture(1));
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const installed = almanac.config.worldPacks.installed[0];
    const definition = almanac.config.worldPackDefinitions.packs[0];
    assert.equal(installed.definitionManifest.length, 0, 'fixture must exercise an installed v2 definition with an empty palette manifest');
    assert.equal(PALETTE_COLLECTIONS.reduce((count, collection) => count + definition.palette[collection].length, 0), 0, 'fixture definition must have no palette records');

    const updateHandout = createPackHandout(harness, makeEmptyPaletteFixture(2));
    const validReview = harness.dispatchCommand(`!aa-worldpacks import --handout ${updateHandout.id} --mode update`);
    assert.match(validReview[0].message, /Update Existing Pack/, 'an unchanged empty-palette definition must remain updateable');
    harness.dispatchCommand(`!aa-worldpacks cancel --grant ${currentGrant(harness)}`);

    // Simulate a persisted v2 registry snapshot whose bindings no longer match
    // its installed definition. The empty record manifest must not bypass this
    // safety signal merely because no palette rows exist.
    installed.definitionBindingsDigest = 'wp-00000000';
    const beforeWorld = JSON.stringify(almanac.config.world);
    const beforeDefinitions = JSON.stringify(almanac.config.worldPackDefinitions);
    const refused = harness.dispatchCommand(`!aa-worldpacks import --handout ${updateHandout.id} --mode update`);
    assert.match(refused[0].message, /palette definitions.*changed after installation|old manifest cannot be verified/i, 'empty-palette binding-digest mismatch must refuse a destructive update');
    assert.equal(JSON.stringify(almanac.config.world), beforeWorld, 'binding-digest refusal must not alter Worldbuilding');
    assert.equal(JSON.stringify(almanac.config.worldPackDefinitions), beforeDefinitions, 'binding-digest refusal must preserve the campaign-owned empty definition');
}

function assertV2RefusalAndCopyRemapping() {
    const malformedHarness = createHarness();
    const malformed = makeV2Fixture();
    malformed.world.locations[0].climateProfileId = 'missing-profile';
    const before = JSON.stringify(malformedHarness.state.GameAssist.AlmanacAssist.config.worldPacks);
    const invalidHandout = createPackHandout(malformedHarness, malformed);
    const invalid = malformedHarness.dispatchCommand(`!aa-worldpacks import --handout ${invalidHandout.id} --mode new`);
    assert.match(invalid[0].message, /Import Needs Attention/, 'unavailable package-local profile must fail before preview');
    assert.equal(JSON.stringify(malformedHarness.state.GameAssist.AlmanacAssist.config.worldPacks), before, 'malformed v2 profile references must not change the registry');

    const harness = createHarness();
    installFixture(harness, makeV2Fixture());
    const copyHandout = createPackHandout(harness, makeV2Fixture());
    const preview = harness.dispatchCommand(`!aa-worldpacks import --handout ${copyHandout.id} --mode copy`);
    assert.match(preview[0].message, /WorldPack Import Preview/, 'v2 package copy must remain review-first');
    const commit = harness.dispatchCommand(`!aa-worldpacks confirm --grant ${currentGrant(harness)}`);
    assert.match(commit[0].message, /WorldPack Committed/, 'v2 package copy must commit after review');
    const world = harness.state.GameAssist.AlmanacAssist.config.world;
    const copiedRoute = world.routes.find(route => route.sourcePackId === 'fixture-v2-pack-copy');
    assert.ok(copiedRoute, 'copy must receive a fresh package and route identity');
    assert.equal(copiedRoute.legs.length, 2, 'copy must retain nested Route Legs');
    assert.ok(copiedRoute.legs.every(leg => leg.id !== 'fixture-leg-a-b' && leg.id !== 'fixture-leg-b-c'), 'copy must mint fresh nested leg IDs');
    assert.ok(copiedRoute.legs.every(leg => leg.fromLocationId.startsWith('fixture-v2-pack-copy-') && leg.toLocationId.startsWith('fixture-v2-pack-copy-')), 'copy must remap nested leg endpoints to copied Locations');
    assert.ok(copiedRoute.legs.every(leg => leg.travelProfileId.startsWith('fixture-v2-pack-copy-')), 'copy must remap nested Travel Profile references');
}

function run() {
    // Canonical-source development intentionally precedes mirror publication. Full
    // release / Gate 0 runs do not set this opt-out and therefore still require
    // byte-identical executable artifacts before they can pass.
    if (!process.env.GAMEASSIST_SKIP_ARTIFACT_IDENTITY) assertExecutableArtifactsAreIdentical();
    assertPresetRegistry();
    assertPresetLibrarySafetyAndRestart();
    assertBuiltInPresetSourceUpdates();
    assertFourIndependentInstalls();
    assertOperationalProfilesAndControls();
    assertPaletteEditingAndCalendarProjection();
    assertPaletteCatalogScaleAndBindingPicker();
    assertLargeScaleSessionSelectors();
    assertRouteLegEditor();
    assertRouteLegActiveJourneyRefusal();
    assertEmptyPaletteBindingDigestSafety();
    assertV2RefusalAndCopyRemapping();
    process.stdout.write('PASS: AlmanacAssist WorldPack v2 setting-scale focused regression checks\n');
}

if (require.main === module) run();

module.exports = Object.freeze({ run, makeV2Fixture });
// --- Notes & Comments ---
// Changed (v2.0.0): add isolated regression evidence for four immutable original
// setting-scale registry sources, 160-Location installed editable clones, library
// routing/permissions/stale/restart safety, palette and provider-backed calendar
// controls, per-collection palette bounds, paged palette/default/cross-reference
// pickers, Worldbuilding relation/profile/page and Route Leg choice catalogs,
// SceneResolver/Travel profile use, bounded large-catalog selection, nested Route
// Leg atomic editing, source-package refusal, and copy reference remapping. These
// checks intentionally do not claim Roll20 acceptance.
