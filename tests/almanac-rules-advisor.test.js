// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise optional profile-specific RulesAdvisor reminders and prove advisory-only no-write boundaries against the shipped executable."
//   order: ["artifact_identity","read_only_advice","compact_gm_panel","profile_selection","optional_toggle","alias_contract","future_schema_safety"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never interpret advisory text as an instruction to apply gameplay state."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap with a bounded severe-context fixture." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST]/
//     └─ [GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST:CHECKS]
// --- prose banner ---
// This Node-only check proves that RulesAdvisor derives compact generic GM reminders
// from SceneResolver evidence without applying any rules, provider, or gameplay state.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST:CHECKS] BEGIN
// Section Title: Optional advisory-only RulesAdvisor checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST",
//   area: "CHECKS",
//   title: "Optional advisory-only RulesAdvisor checks",
//   guarantees: ["RulesAdvisor emits bounded profile-specific GM reminders from a resolved scene without changing providers or gameplay.","Toggles and profile selection are explicit campaign-configuration choices; future advisor schemas remain warning-only."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["RulesAdvisor focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function stateDigest(harness) {
    return JSON.stringify(harness.state);
}

function installAdvisorWorld(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.rulesAdvisor = { schemaVersion: 1, enabled: true };
    almanac.config.world = {
        schemaVersion: 4,
        revision: 12,
        regions: [],
        geographies: [],
        ecoregions: [],
        biomes: [],
        locations: [{ id: 'winter-pass', name: 'Winter Pass', description: 'Owner-authored pass', tags: [] }],
        destinations: [],
        routes: [],
        phenomena: [{
            id: 'black-squall', name: 'Black Squall', description: 'Owner-authored severe overlay', tags: [], locationId: 'winter-pass',
            category: 'Atmospheric', visibilityNote: 'Ash and snow', terrainNote: 'Slick ice', travelNote: 'Proceed carefully', severity: 4, defaultDurationHours: 0
        }],
        presets: [],
        activeLocationId: 'winter-pass',
        favoriteLocationIds: [],
        rulesProfile: '2014'
    };
    almanac.runtime.world = {
        schemaVersion: 4,
        revision: 4,
        recentLocationIds: [],
        destinationGrants: {},
        travel: { schemaVersion: 1, revision: 0, journey: null, grants: {}, history: [] },
        phenomenonGrants: {},
        activePhenomena: [{
            schemaVersion: 1, id: 'active-squall', phenomenonId: 'black-squall', locationId: 'winter-pass',
            activatedAt: '2026-01-01T00:00:00.000Z', expiresWorldMinute: null
        }],
        phenomenaHistory: [],
        presetGrants: {}
    };
    almanac.runtime.weather.current = {
        id: 'severe-snow', summary: 'Severe snow', temperatureF: 14, windMph: 28,
        precipitation: 'Heavy snow', cloud: 'Overcast', visibility: 'Heavily obscured', severity: 4
    };
    almanac.runtime.environment.current = {
        id: 'deep-snow', name: 'Deep Snow', visibility: 'Limited', ground: 'Deep snow and ice',
        water: 'Freezing', exposure: 'Extreme', severity: 4, tags: ['snow', 'ice']
    };
}

function providerDigest(almanac) {
    return JSON.stringify({
        time: almanac.runtime.time,
        weather: almanac.runtime.weather,
        environment: almanac.runtime.environment,
        worldRuntime: almanac.runtime.world,
        activeLocationId: almanac.config.world.activeLocationId,
        phenomena: almanac.config.world.phenomena
    });
}

function assertReadOnlyAdvice(harness) {
    installAdvisorWorld(harness);
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const before = stateDigest(harness);
    const providersBefore = providerDigest(almanac);
    const advice = api.getRulesAdvice();
    assert.equal(api.rulesAdvisorSchemaVersion, 1, 'the public API must disclose the RulesAdvisor schema');
    assert.equal(advice.schemaVersion, 1, 'advice response must identify its schema');
    assert.equal(advice.available, true, 'compatible advisor and Worldbuilding state must be available');
    assert.equal(advice.enabled, true, 'the optional advisor must report its enabled state');
    assert.equal(advice.profile.id, '2014', 'advice must follow the campaign-selected rules profile');
    assert.equal(Object.isFrozen(advice), true, 'advice response must be immutable at the public boundary');
    assert.equal(Object.isFrozen(advice.notes[0]), true, 'nested advice records must be immutable');
    assert.ok(advice.notes.length <= 6, 'advisory output must remain bounded');
    const noteIds = Array.from(advice.notes, note => note.id).join('|');
    assert.match(noteIds, /exposure/, 'severe scene evidence must produce a generic exposure reminder');
    assert.match(noteIds, /surface/, 'deep snow scene evidence must produce a generic surface reminder');
    assert.match(noteIds, /visibility/, 'obscured scene evidence must produce a generic visibility reminder');
    assert.match(noteIds, /phenomena/, 'severe Phenomena must produce advisory-only context');
    assert.equal(stateDigest(harness), before, 'reading RulesAdvisor advice must not write configuration, providers, or gameplay state');

    const dashboard = harness.dispatchCommand('!aa-gm');
    assert.equal(dashboard.length, 1, 'Current World dashboard must render one compact panel');
    assert.match(dashboard[0].message, /GM Notes/, 'enabled contextual advisor must surface compact GM notes on the dashboard');
    assert.match(dashboard[0].message, /Rules Details/, 'dashboard notes must link to the focused advisor instead of applying anything');
    assert.equal(providerDigest(almanac), providersBefore, 'rendering contextual advice must not change provider or gameplay state');
}

function assertControlsAndAliases(harness) {
    installAdvisorWorld(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const providerBefore = providerDigest(almanac);
    const panel = harness.dispatchCommand('!aa-rules');
    assert.equal(panel.length, 1, 'focused advisor route must render one compact panel');
    assert.match(panel[0].message, /2014 Advisory Profile/, 'focused advisor must identify the selected rules profile');
    assert.match(panel[0].message, /Advice only/, 'focused advisor must state its non-mutating boundary');
    assert.doesNotMatch(panel[0].message, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'normal advisor panels must not dump raw JSON');
    assert.equal(providerDigest(almanac), providerBefore, 'opening the advisor must not change providers or gameplay state');

    ['!RULES status', '!rules-status', '!rules-advisor', '!rulesadvisor', '!RULESADVISOR-status', '!aa rules', '!aa-rules-status', '!aa rulesadvisor-status'].forEach(command => {
        const response = harness.dispatchCommand(command);
        assert.equal(response.length, 1, `${command} must reach exactly one RulesAdvisor panel`);
        assert.match(response[0].message, /Rules Advisor/, `${command} must reach the focused RulesAdvisor handler`);
    });

    const profile = harness.dispatchCommand('!aa-rules profile --value 2024');
    assert.equal(profile.length, 1, 'explicit profile selection must return one advisor panel');
    assert.equal(almanac.config.world.rulesProfile, '2024', 'profile selection must persist only as campaign Worldbuilding configuration');
    assert.match(profile[0].message, /2024 Advisory Profile/, 'advisor output must change with the selected profile');
    assert.equal(providerDigest(almanac), providerBefore, 'profile selection must not change providers or gameplay state');

    const off = harness.dispatchCommand('!aa-rules off');
    assert.equal(off.length, 1, 'explicit advisor toggle must return one panel');
    assert.equal(almanac.config.rulesAdvisor.enabled, false, 'explicit off command must disable optional advisor output');
    assert.match(off[0].message, /RulesAdvisor is disabled/, 'off panel must explain the optional disabled state');
    assert.equal(providerDigest(almanac), providerBefore, 'advisor toggle must not change providers or gameplay state');
    const disabledAdvice = harness.sandbox.GameAssist.AlmanacAssist.getRulesAdvice();
    assert.equal(disabledAdvice.enabled, false, 'public API must expose disabled advisor state');
    assert.equal(disabledAdvice.notes.length, 0, 'disabled advisor must not emit contextual reminders');
    const disabledDashboard = harness.dispatchCommand('!aa-gm');
    assert.doesNotMatch(disabledDashboard[0].message, /GM Notes/, 'disabled advisor must not inject dashboard reminders');

    const on = harness.dispatchCommand('!aa-rules on');
    assert.equal(on.length, 1, 'explicit advisor enable must return one panel');
    assert.equal(almanac.config.rulesAdvisor.enabled, true, 'explicit on command must restore advisor output');
    assert.equal(providerDigest(almanac), providerBefore, 'advisor enable must not change providers or gameplay state');
}

function assertFutureSchemaSafety(harness) {
    installAdvisorWorld(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.config.rulesAdvisor = { schemaVersion: 99, enabled: false, opaqueFutureField: { preserve: true } };
    const advisorBefore = JSON.stringify(almanac.config.rulesAdvisor);
    const providersBefore = providerDigest(almanac);
    const panel = harness.dispatchCommand('!aa-rules');
    assert.equal(panel.length, 1, 'future advisor schema must render one warning-only panel');
    assert.match(panel[0].message, /Rules Advisor Needs Attention/, 'future advisor schema must not be interpreted');
    assert.match(panel[0].message, /newer than this AlmanacAssist version/, 'future advisor schema warning must remain explicit');
    assert.equal(JSON.stringify(almanac.config.rulesAdvisor), advisorBefore, 'future advisor configuration must remain untouched by a panel read');
    assert.equal(providerDigest(almanac), providersBefore, 'future advisor warning panel must not change providers or gameplay state');
    const advice = harness.sandbox.GameAssist.AlmanacAssist.getRulesAdvice();
    assert.equal(advice.available, false, 'public API must refuse to interpret a future advisor schema');
    assert.equal(advice.notes.length, 0, 'future advisor schema must not emit guessed reminders');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const readHarness = createHarness();
    assertReadOnlyAdvice(readHarness);
    const controlsHarness = createHarness();
    assertControlsAndAliases(controlsHarness);
    const futureHarness = createHarness();
    assertFutureSchemaSafety(futureHarness);
    process.stdout.write('PASS: AlmanacAssist RulesAdvisor focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused evidence for optional profile-specific advisory-only RulesAdvisor behavior.
// Decision log:
//   CHOICE: derive generic reminders from the immutable SceneResolver snapshot — ALT: write rules consequences into providers; REJECTED: advice must never become a hidden gameplay authority.
//   CHOICE: retain a warning-only future schema boundary — ALT: coerce or reset unknown advisor configuration; REJECTED: forward state must remain recoverable.
// [GAMEASSIST_ALMANAC_RULES_ADVISOR_TEST:CHECKS] END
// ============================================================================
