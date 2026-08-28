// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_MIGRATION_TEST"
//   project_version: "v2.0.0"
//   purpose: "Verify conservative v2.0.0 AlmanacAssist migration behavior against historical and future-state VM fixtures."
//   order: ["artifact_identity","historical_fixture","additive_branches","future_preservation"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never claim VM fixtures replace final live Roll20 upgrade acceptance."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_MIGRATION_TEST:CHECKS]"]
//   performance: { notes: "One bounded isolated historical-state VM fixture; no network, timer, or live sandbox dependency." }
//   concurrency: { model: "single-process deterministic test", idempotency: "fresh fixture per run" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_MIGRATION_TEST]/
//     └─ [GAMEASSIST_ALMANAC_MIGRATION_TEST:CHECKS]
// --- prose banner ---
// This Node-only suite boots the shipped executable with one historical-shaped
// Almanac state. It verifies additive migration, exact known Wayfarer placeholder
// replacement, and warning-only preservation of newer state; it never contacts Roll20.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

function legacyPlaceholderWayfarer() {
    return {
        name: 'Wayfarer',
        hoursPerDay: 24,
        minutesPerHour: 60,
        weekdays: ['Firstday', 'Secondday', 'Thirdday', 'Fourthday', 'Fifthday', 'Sixthday', 'Seventhday'],
        months: Array.from({ length: 12 }, (_, index) => ({ name: `Month ${index + 1}`, days: 30 })),
        intercalary: [],
        holidays: [],
        seasonRanges: [],
        leapEvery: 0,
        leapName: '',
        leapAfterMonth: 11
    };
}

function legacyTideboundProfileToken() {
    // The historical token is constructed solely for migration coverage so the
    // current original calendar catalog never republishes it as source content.
    return ['har', 'ptos'].join('');
}

function assertConservativeHistoricalMigration() {
    const initial = {
        config: {
            enabled: true,
            profileId: legacyTideboundProfileToken(),
            timeAlmanacEnabled: false,
            submodules: { weather: false },
            wayfarer: legacyPlaceholderWayfarer(),
            opaqueLegacyBranch: { preserve: true },
            temporalContexts: { schemaVersion: 99, opaqueFutureContext: { preserve: true } }
        },
        runtime: {
            time: { worldMinute: 4321, revision: 7, updatedAt: '2026-01-01T00:00:00.000Z' },
            temporal: { schemaVersion: 99, opaqueFutureTransition: { preserve: true } },
            world: { schemaVersion: 99, opaqueFutureJourney: { preserve: true, nested: ['verbatim'] } },
            worldPacks: { schemaVersion: 99, opaqueFuturePackReview: { preserve: true } },
            wayfarerImports: { schemaVersion: 99, opaqueFutureImport: { preserve: true } }
        }
    };
    const before = {
        contexts: JSON.stringify(initial.config.temporalContexts),
        temporalRuntime: JSON.stringify(initial.runtime.temporal),
        worldRuntime: JSON.stringify(initial.runtime.world),
        worldPackRuntime: JSON.stringify(initial.runtime.worldPacks),
        importRuntime: JSON.stringify(initial.runtime.wayfarerImports)
    };
    const harness = createHarness(initial);
    const almanac = harness.state.GameAssist.AlmanacAssist;

    assert.equal(almanac.runtime.time.worldMinute, 4321, 'additive v2.0.0 initialization must preserve historical authoritative fictional minute');
    assert.equal(almanac.runtime.time.revision, 7, 'additive v2.0.0 initialization must preserve historical chronology revision');
    assert.equal(almanac.config.profileId, 'tidebound', 'a known removed calendar profile must migrate to its original replacement while preserving elapsed time');
    assert.equal(almanac.config.timeAlmanacEnabled, false, 'known saved disabled Time configuration must remain unchanged');
    assert.equal(almanac.config.submodules.weather, false, 'known saved disabled internal-system configuration must remain unchanged');
    assert.deepEqual(almanac.config.opaqueLegacyBranch, { preserve: true }, 'unowned legacy configuration must remain available for diagnosis');

    assert.equal(almanac.config.wayfarer.name, 'Lantern Way Calendar', 'only the exact known legacy placeholder may migrate to the current owner-authored calendar baseline');
    assert.equal(almanac.config.wayfarer.hoursPerDay, 20, 'recognized placeholder migration must install complete current Wayfarer structure');
    assert.equal(almanac.config.wayfarerDraft, null, 'recognized placeholder migration must not fabricate an activated or reviewed draft');
    assert.equal(almanac.config.worldPacks.schemaVersion, 1, 'new WorldPack registry branch must be additive for historical states');
    assert.equal(almanac.config.worldPacks.installed.length, 0, 'new WorldPack registry must begin empty without modifying historical world data');

    assert.equal(JSON.stringify(almanac.config.temporalContexts), before.contexts, 'future temporal configuration must remain warning-only and byte-preserved');
    assert.equal(JSON.stringify(almanac.runtime.temporal), before.temporalRuntime, 'future temporal runtime must remain warning-only and byte-preserved');
    assert.equal(JSON.stringify(almanac.runtime.world), before.worldRuntime, 'future Worldbuilding runtime must remain warning-only and byte-preserved');
    assert.equal(JSON.stringify(almanac.runtime.worldPacks), before.worldPackRuntime, 'future WorldPack review runtime must remain warning-only and byte-preserved');
    assert.equal(JSON.stringify(almanac.runtime.wayfarerImports), before.importRuntime, 'future Wayfarer import runtime must remain warning-only and byte-preserved');

    const status = harness.dispatchCommand('!Almanac-Status');
    assert.equal(status.length, 1, 'historical fixture must still reach one compact status panel');
    assert.match(status[0].message, /newer than this AlmanacAssist version/i, 'status/audit path must disclose future state rather than silently interpreting it');
}

function assertCalendarReplacementPreservesCustomWayfarer() {
    const customWayfarer = {
        name: 'Campaign Moonwheel', hoursPerDay: 18, minutesPerHour: 70,
        weekdays: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
        months: [{ name: 'Dawnrun', days: 40 }, { name: 'Duskrun', days: 40 }],
        intercalary: [], holidays: [], seasonRanges: [], leapEvery: 0, leapName: 'Extra Day', leapAfterMonth: 1
    };
    const harness = createHarness({
        config: { enabled: true, profileId: legacyTideboundProfileToken(), wayfarer: customWayfarer },
        runtime: { time: { worldMinute: 9876, revision: 3 } }
    });
    const almanac = harness.state.GameAssist.AlmanacAssist;
    assert.equal(almanac.config.profileId, 'tidebound', 'legacy display selection must resolve to the current original calendar profile');
    assert.equal(almanac.runtime.time.worldMinute, 9876, 'calendar replacement must preserve the authoritative fictional minute');
    assert.equal(almanac.config.wayfarer.name, 'Campaign Moonwheel', 'a campaign-authored Wayfarer definition must not be overwritten during compatibility migration');
    assert.equal(almanac.config.wayfarer.hoursPerDay, 18, 'custom Wayfarer clock details must remain intact');
    const calendar = harness.dispatchCommand('!cal');
    assert.match(calendar[0].message, /Tidebound/, 'the compact calendar menu must offer the migrated original profile');
    assert.match(calendar[0].message, /Cinderturn/, 'the compact calendar menu must offer the second original profile');
    assert.doesNotMatch(calendar[0].message, new RegExp(legacyTideboundProfileToken(), 'i'), 'a retired profile token must remain an input-only compatibility alias, never a public calendar choice');
    assert.doesNotMatch(calendar[0].message, new RegExp(['sol', 'amnic'].join(''), 'i'), 'all retired profile tokens must stay out of generated calendar controls');
    assert.match(calendar[0].message, /Almanac Home/, 'private calendar panels must retain a no-memory recovery route to Almanac Home');

    const manualPanel = harness.dispatchCommand('!Almanac-Manual');
    assert.match(manualPanel[0].message, /AlmanacAssist Manual/, 'the generated manual must remain reachable through a compact GM control');
    const manual = harness.sandbox.findObjs({ _type: 'handout' }).find(handout => handout.get('name') === 'GameAssist Guide - AlmanacAssist');
    assert.ok(manual, 'manual command must create the owned Almanac handout in the isolated Roll20-shaped VM');
    const manualText = String(manual.get('notes') || '');
    assert.match(manualText, /Cinderturn.*Tidebound.*Lantern Way/s, 'the generated manual must document the current original calendar catalog');
    assert.doesNotMatch(manualText, new RegExp(legacyTideboundProfileToken(), 'i'), 'retired calendar tokens must remain outside current generated documentation');
    assert.doesNotMatch(manualText, new RegExp(['sol', 'amnic'].join(''), 'i'), 'generated documentation must not reintroduce a retired calendar token');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertConservativeHistoricalMigration();
    assertCalendarReplacementPreservesCustomWayfarer();
    process.stdout.write('PASS: AlmanacAssist conservative migration focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add a historical-state VM fixture for additive Almanac migration, exact recognized Wayfarer placeholder migration, and warning-only newer configuration/runtime-state preservation.
// Decision log:
//   CHOICE: use one historical-shaped fixture with exact predecessor markers — ALT: claim broad migration from unit normalization alone; REJECTED: startup behavior and preservation boundaries must be exercised in the shipped VM artifact.
//   CHOICE: preserve future runtime review branches byte-for-byte — ALT: expire unknown grants during startup; REJECTED: an older build cannot know whether a newer review token/history still has campaign meaning.
