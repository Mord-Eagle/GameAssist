// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise AlmanacAssist's read-only SceneResolver contract against the shipped executable artifact."
//   order: ["artifact_identity","immutable_snapshot","authority_boundaries","disabled_state","presentation"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never add a production-only test export."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap and bounded scene snapshots; no live Roll20 latency claim." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST]/
//     └─ [GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST:CHECKS]
// --- prose banner ---
// This Node-only test imports the shared isolated Roll20-shaped harness from the
// Gate 0 suite. It proves SceneResolver snapshots are defensive and read-only,
// preserve authority boundaries for normal and unusual weather combinations,
// retain disabled state, and feed the compact Scene chat view. It is not a
// replacement for required live Roll20 acceptance evidence.

'use strict';

const assert = require('node:assert/strict');
const {
    POLICY,
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST:CHECKS] BEGIN
// Section Title: SceneResolver regression checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST",
//   area: "CHECKS",
//   title: "SceneResolver regression checks",
//   guarantees: ["Checks immutable, no-write current-scene snapshots and explicit provider ownership.","Checks disabled providers remain explicit rather than becoming invented world facts."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["SceneResolver focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The resolver must consume state defensively. These assertions deliberately
// write only test-fixture state between snapshots; each individual resolution
// is compared byte-for-byte against the state immediately before it runs.
// -----------------------------------------------------------------------------
function stateDigest(harness) {
    return JSON.stringify(harness.state);
}

function resolveWithoutWrites(harness) {
    const before = stateDigest(harness);
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(stateDigest(harness), before, 'getScene() must not write config, runtime, history, or provider state');
    return scene;
}

function assertDeepFrozen(value, path = 'scene') {
    if (!value || typeof value !== 'object') return;
    assert.equal(Object.isFrozen(value), true, `${path} must be frozen`);
    Object.entries(value).forEach(([key, child]) => assertDeepFrozen(child, `${path}.${key}`));
}

function warningCodes(scene) {
    return scene.warnings.map(warning => warning.code);
}

function installUnusualWeather(harness) {
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    runtime.weather.current = {
        stateSchemaVersion: 1,
        id: 'scene-weather-unusual',
        kind: 'rain',
        summary: 'Steady rain beneath a clear-looking sky',
        temperatureF: 47,
        windMph: 12,
        precipitation: 'Rain',
        cloud: 'clear',
        visibility: 'Reduced by rain',
        severity: 2,
        durationHours: 4,
        tags: ['rain'],
        regionId: 'home',
        regionName: 'Temperate Lowlands',
        season: 'Summer',
        context: 'focused test fixture',
        source: 'Manual'
    };
    runtime.weather.forecast = [{
        stateSchemaVersion: 1,
        id: 'scene-weather-forecast',
        kind: 'cloudy',
        summary: 'Clouds gathering',
        temperatureF: 45,
        windMph: 9,
        precipitation: 'None',
        cloud: 'overcast',
        visibility: 'Reduced by cloud',
        severity: 1,
        tags: ['cloud'],
        source: 'Forecast'
    }];
    runtime.environment.current = null;
    runtime.environment.override = null;
}

function assertSnapshotShapeAndImmutability(harness) {
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const scene = resolveWithoutWrites(harness);

    assert.equal(api.sceneStateSchemaVersion, 1, 'the public API must disclose the SceneResolver schema version');
    assert.equal(scene.sceneStateSchemaVersion, api.sceneStateSchemaVersion, 'a snapshot must identify its schema');
    assertDeepFrozen(scene);
    assert.equal(scene.providers.time.status, 'available', 'configured Time must report available while the parent is active');
    assert.equal(scene.providers.climate.status, 'available', 'configured Climate must report available while the parent is active');
    assert.equal(scene.region, null, 'an unassigned Region must not be fabricated');
    assert.equal(scene.geography, null, 'an unassigned Geography must not be fabricated');
    assert.equal(scene.location, null, 'an unassigned Location must not be fabricated');
    assert.equal(scene.providers.phenomena.status, 'available', 'the configured generic Phenomena provider must be available even when no overlay is active');
    assert.equal(scene.phenomena.length, 0, 'an empty Phenomena collection must remain explicit without invented overlay facts');
    assert.equal(scene.rest.pace, 'standard', 'Rest context must be available without requiring a rest preview or sheet write');
    assert.equal(scene.hydrology.persistent, null, 'persistent hydrology must remain distinct and unavailable without Geography');
    assert.equal(warningCodes(scene).includes('SCENE_PROVIDERS_UNAVAILABLE'), false, 'an empty implemented Phenomena provider must not emit a generic unavailable warning');
    assert.ok(warningCodes(scene).includes('TERRAIN_PARTIAL'), 'partial immediate terrain must be explicitly labeled');
    assert.ok(warningCodes(scene).includes('PERSISTENT_HYDROLOGY_UNAVAILABLE'), 'persistent hydrology must be explicitly unavailable');
    assert.ok(scene.warnings.length <= 24, 'SceneResolver warnings must stay bounded by policy');

    assert.throws(() => {
        scene.providers.time.status = 'invented';
    }, { name: 'TypeError' }, 'callers must not mutate a provider status through a snapshot');
    assert.throws(() => {
        scene.warnings.push({ code: 'INVENTED' });
    }, { name: 'TypeError' }, 'callers must not append warnings through a snapshot');
}

function assertAuthorityAndUnusualCombination(harness) {
    installUnusualWeather(harness);
    const scene = resolveWithoutWrites(harness);
    const codes = warningCodes(scene);

    assert.equal(scene.weather.current.temperatureF, 47, 'Weather must retain the one authoritative current temperature');
    assert.equal(scene.weather.forecast.length, 1, 'a committed Weather forecast must be copied into the coherent snapshot');
    assert.equal(scene.provenance['weather.forecast'].authority, 'WeatherAlmanac', 'forecast provenance must remain Weather-owned');
    assert.equal(scene.provenance['weather.temperatureF'].authority, 'WeatherAlmanac', 'current temperature provenance must remain Weather-owned');
    assert.equal(scene.environment.current.source, 'SceneResolver weather interpretation', 'Environment may interpret weather without writing provider state');
    assert.equal(scene.provenance['environment.current'].authority, 'EnviroAlmanac', 'immediate local context must remain Environment-owned');
    assert.equal(scene.hydrology.temporaryWeatherEffects, 'Rain', 'temporary weather effects must be separate from persistent hydrology');
    assert.equal(scene.hydrology.immediateWaterAccess, 'Conditions may affect exposed water', 'immediate water access must be separately labeled');
    assert.ok(codes.includes('WEATHER_CLOUD_PRECIPITATION_COMBINATION'), 'intentional or unusual precipitation/cloud combinations must warn rather than fail');
    assert.ok(codes.includes('WEATHER_SEASON_DIFFERENCE'), 'season mismatches must warn rather than silently rewrite weather');
    assert.equal(codes.includes('WEATHER_CLIMATE_REGION_DIFFERENCE'), false, 'a persisted Weather fixture without the additive context key must still safely match its concrete legacy Climate-region ID');
    assert.ok(scene.astronomy.moons.every(moon => moon.visibility && moon.visibility.visible === false), 'moon phase must remain separate from weather/daylight visibility');
    assert.equal(scene.provenance['astronomy.moons'].authority, 'AstronomyAlmanac', 'moon phases must remain Astronomy-owned');
    assert.equal(scene.provenance['astronomy.moonVisibility'].authority, 'SceneResolver', 'visibility must be an explicit resolved conclusion');
}

function assertDisabledProviderAndManualSeasonFallback(harness) {
    const config = harness.state.GameAssist.AlmanacAssist.config;

    config.submodules.weather = false;
    const weatherDisabled = resolveWithoutWrites(harness);
    assert.equal(weatherDisabled.providers.weather.status, 'disabled', 'a disabled Weather provider must remain disabled in the snapshot');
    assert.equal(weatherDisabled.weather.current, null, 'disabled Weather must not be replaced with saved conditions');
    assert.ok(warningCodes(weatherDisabled).includes('PROVIDER_WEATHER_DISABLED'), 'disabled Weather must have an explicit warning');

    config.submodules.weather = true;
    config.timeAlmanacEnabled = false;
    config.climate.manualSeason = 'Autumn';
    const manualSeason = resolveWithoutWrites(harness);
    assert.equal(manualSeason.time.current, null, 'disabled Time must not be resolved from saved chronology');
    assert.equal(manualSeason.climate.baseline.season, 'Autumn', 'Climate may use its explicit manual season when Time is unavailable');
    assert.equal(manualSeason.climate.baseline.seasonAuthority, 'ClimateAlmanac manual setting', 'manual seasonal fallback must declare its authority');
    assert.ok(warningCodes(manualSeason).includes('CLIMATE_MANUAL_SEASON'), 'manual climate fallback must be visible as a warning');

    config.timeAlmanacEnabled = true;
    config.enabled = false;
    const parentDisabled = resolveWithoutWrites(harness);
    assert.equal(parentDisabled.providers.time.status, 'parent-disabled', 'parent disable must not rewrite configured Time state');
    assert.equal(parentDisabled.providers.climate.status, 'parent-disabled', 'parent disable must not rewrite configured Climate state');
    assert.equal(parentDisabled.time.current, null, 'parent-disabled providers must not resolve saved facts');
    assert.ok(warningCodes(parentDisabled).includes('ALMANAC_PARENT_DISABLED'), 'parent disable must be surfaced once as a bounded warning');

    config.enabled = true;
}

function assertScenePresentation(harness) {
    installUnusualWeather(harness);
    const chats = harness.dispatchCommand('!aa-scene');
    assert.equal(chats.length, 1, 'the Scene command must render one compact panel');
    assert.match(chats[0].message, /\{\{name=Almanac \/ Current World \/ Scene\}\}/, 'the normal Scene panel must keep a compact location hierarchy');
    assert.match(chats[0].message, /World Context=/, 'the normal Scene panel must disclose the compact session World Context before provider details');
    assert.match(chats[0].message, /Immediate Environment/, 'the normal Scene panel must label immediate context separately from Weather');
    assert.match(chats[0].message, /Almanac Home/, 'the normal Scene panel must provide an Almanac Home return');
    assert.doesNotMatch(chats[0].message, /Campaign fallback region|sceneStateSchemaVersion|PERSISTENT_HYDROLOGY_UNAVAILABLE/, 'normal Scene output must keep raw Climate provenance, schema, and warning evidence out of live play');

    const technicalChats = harness.dispatchCommand('!aa-scene technical');
    assert.equal(technicalChats.length, 1, 'the GM technical Scene command must render one focused panel');
    assert.match(technicalChats[0].message, /Scene Details/, 'technical Scene output must be deliberately opened');
    assert.match(technicalChats[0].message, /Campaign fallback region/, 'technical Scene output must retain exact Climate provenance for diagnosis');
    assert.match(technicalChats[0].message, /Provider Status/, 'technical Scene output must expose provenance status intentionally');

    const weatherChats = harness.dispatchCommand('!weather');
    assert.equal(weatherChats.length, 1, 'the Weather menu must render one snapshot-backed panel');
    assert.match(weatherChats[0].message, /Clouds gathering/, 'the Weather forecast display must use the forecast copied into the SceneResolver snapshot');
}

function assertTechnicalAnnouncementsStayPrivate(harness) {
    installUnusualWeather(harness);
    const config = harness.state.GameAssist.AlmanacAssist.config;
    config.announcement = {
        schemaVersion: 4,
        enabled: true,
        audience: 'public',
        style: 'technical',
        preset: 'custom',
        header: 'Scene Test Announcement',
        fields: {
            date: 'off', time: 'off', season: 'off', observances: 'off', moons: 'off',
            weather: 'technical', climate: 'technical', environment: 'technical'
        }
    };
    const preview = harness.dispatchCommand('!aa-preview');
    assert.equal(preview.length, 1, 'a technical announcement preview must render once');
    assert.match(preview[0].message, /GM Only \(technical detail is never public\)/, 'preview must disclose forced private technical delivery');

    const delivered = harness.dispatchCommand('!aa-announce');
    assert.equal(delivered.length, 1, 'a technical announcement delivery must render once');
    assert.match(delivered[0].message, /^\/w (?:gm|&quot;Test GM&quot;)/, 'technical provenance must never be sent as a public chat panel');
    assert.match(delivered[0].message, /Weather \(Technical\)/, 'technical content remains available to the GM who selected it');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const harness = createHarness();
    assertSnapshotShapeAndImmutability(harness);
    assertAuthorityAndUnusualCombination(harness);
    assertDisabledProviderAndManualSeasonFallback(harness);
    assertScenePresentation(harness);
    assertTechnicalAnnouncementsStayPrivate(harness);
    process.stdout.write('PASS: AlmanacAssist SceneResolver focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused Gate 2 SceneResolver snapshot, ownership, disabled-state, warning, and presentation regression evidence.
// Decision log:
//   CHOICE: use the public getScene() boundary to prove no writes — ALT: expose lexical internals only for testing; REJECTED: consumers need the same read-only contract being tested.
//   CHOICE: model unusual weather as a fixture and require a warning — ALT: reject or rewrite a fantasy exception; REJECTED: SceneResolver must retain intentional exceptions while making them reviewable.
// [GAMEASSIST_ALMANAC_SCENE_RESOLVER_TEST:CHECKS] END
// ============================================================================
