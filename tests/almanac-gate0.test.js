// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_GATE0_TEST"
//   project_version: "v2.0.0"
//   purpose: "Run the focused, dependency-free Gate 0 regression checks for AlmanacAssist against the executable Roll20 artifact."
//   order: ["artifact_identity","sandbox_bootstrap","chronology_contract","lifecycle_contract","command_alias_contract"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never replace the executable artifact with a generated test copy."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS]","[GAMEASSIST_ALMANAC_GATE0_TEST:CHECKS]"]
//   performance: { notes: "One isolated VM bootstrap and bounded chronology boundary checks; no live Roll20 latency claim." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   policy: { notes_ref: "[GAMEASSIST_ALMANAC_GATE0_TEST:POLICY]" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   transport_map:
//     cli: "stdout reports pass; stderr and nonzero exit report a failed assertion"
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_GATE0_TEST]/
//     ├─ [GAMEASSIST_ALMANAC_GATE0_TEST:POLICY]
//     ├─ [GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS]
//     └─ [GAMEASSIST_ALMANAC_GATE0_TEST:CHECKS]
// --- prose banner ---
// This Node-only test verifies artifact identity, then boots GameAssist in an isolated Roll20-shaped VM before checking Gate 0 chronology, configured-state, preserved-state, and normalized-command contracts. It never contacts Roll20 or rewrites executable artifacts; run `node tests/almanac-gate0.test.js` from any working directory.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// ============================================================================
// [GAMEASSIST_ALMANAC_GATE0_TEST:POLICY] BEGIN
// Section Title: Focused Almanac Gate 0 test policy
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_GATE0_TEST",
//   area: "POLICY",
//   title: "Focused Almanac Gate 0 test policy",
//   guarantees: ["All test-only bounds, executable artifact names, and command aliases are centralized here.","The harness reads the shipped source and never changes an executable artifact on disk."],
//   provides: ["POLICY"],
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Policy holds only test behavior. AlmanacAssist remains the authority for real
// chronology and lifecycle behavior; this file only supplies a deterministic
// Roll20-shaped host so those public contracts can be observed under Node.
// -----------------------------------------------------------------------------
const REPOSITORY_ROOT = path.resolve(__dirname, '..');
const POLICY = Object.freeze({
    sourceArtifact: 'GameAssist',
    executableArtifacts: Object.freeze(['GameAssist', 'GameAssist.js', 'GameAssist-v2.0.0']),
    maximumSupportedYear: 9999,
    minutePerHour: 60,
    hoursPerDay: 24,
    initialObjectId: 1,
    firstRandomInteger: 1,
    gmPlayerId: 'GM',
    campaignId: 'campaign',
    dashboardAliases: Object.freeze([
        '!Almanac-GM',
        '!Almanac-DM',
        '!aa-gm',
        '!Almanac GM',
        '!ALMANAC-dm',
        '!AA GM'
    ])
});
// --- Notes & Comments ---
// Changed (v2.0.0): establish focused non-live verification bounds for AlmanacAssist Gate 0.
// Decision log:
//   CHOICE: read the repository's executable artifact directly — ALT: copy a source fragment into the test; REJECTED: a copied fragment could hide artifact drift.
// [GAMEASSIST_ALMANAC_GATE0_TEST:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS] BEGIN
// Section Title: Isolated Roll20-shaped Node harness
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_GATE0_TEST",
//   area: "HARNESS",
//   title: "Isolated Roll20-shaped Node harness",
//   guarantees: ["Each test run uses fresh state, event handlers, objects, and chat capture.","No adapter calls a live Roll20 API or retains campaign state after process exit."],
//   depends_on: ["[GAMEASSIST_ALMANAC_GATE0_TEST:POLICY]"],
//   provides: ["createHarness"],
//   seams: ["Roll20 globals: on, sendChat, getObj, findObjs, createObj, Campaign, playerIsGM"],
//   risks: ["The harness proves core command contracts but does not replace live Roll20 acceptance."],
//   observability: { logs: "captured in-memory", spans: ["[GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The Roll20 adapter is intentionally small and deterministic. It implements
// only the synchronous object and event behavior required to boot the bundled
// script and observe focused Almanac public API and chat routes. A short-lived
// in-memory hook exposes the lexical chronology resolver for its exact boundary
// contract; it is never written into a shipped artifact.
// -----------------------------------------------------------------------------
function createHarness() {
    const handlers = new Map();
    const chats = [];
    const objects = new Map();
    let nextObjectId = POLICY.initialObjectId;

    function objectKey(type, id) {
        return `${type}:${id}`;
    }

    function createObject(type, properties = {}) {
        const id = String(properties._id || properties.id || `${type}-${nextObjectId++}`);
        const values = { ...properties, _id: id, id, _type: type };
        const object = {
            id,
            get(key, callback) {
                const result = values[key];
                if (typeof callback === 'function') callback(result);
                return result;
            },
            set(key, value) {
                if (key && typeof key === 'object') Object.assign(values, key);
                else values[key] = value;
            },
            remove() {
                objects.delete(objectKey(type, id));
            }
        };
        objects.set(objectKey(type, id), object);
        return object;
    }

    const campaign = createObject('campaign', {
        _id: POLICY.campaignId,
        playerpageid: 'page-1',
        playerspecificpages: '{}',
        initiativepage: false,
        turnorder: '[]',
        token_markers: '[]'
    });
    const state = {
        GameAssist: {
            AlmanacAssist: { config: { enabled: true } }
        }
    };
    const sandbox = {
        state,
        on(eventName, callback) {
            const callbacks = handlers.get(eventName) || [];
            callbacks.push(callback);
            handlers.set(eventName, callbacks);
        },
        sendChat(who, message, callback) {
            chats.push({ who, message: String(message) });
            if (typeof callback === 'function') callback([]);
        },
        log() {},
        randomInteger() {
            return POLICY.firstRandomInteger;
        },
        getObj(type, id) {
            return objects.get(objectKey(type, String(id))) || null;
        },
        findObjs(query) {
            return [...objects.values()].filter(object => Object.entries(query || {})
                .every(([key, value]) => object.get(key) === value));
        },
        filterObjs(predicate) {
            return [...objects.values()].filter(predicate);
        },
        createObj(type, properties) {
            return createObject(type, properties);
        },
        Campaign() {
            return campaign;
        },
        playerIsGM(playerId) {
            return playerId === POLICY.gmPlayerId;
        },
        setTimeout() {
            return null;
        },
        clearTimeout() {},
        setInterval() {
            return null;
        },
        clearInterval() {}
    };
    sandbox.globalThis = sandbox;

    const sourcePath = path.join(REPOSITORY_ROOT, POLICY.sourceArtifact);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const hookMarker = '        GameAssist.AlmanacAssist = Object.freeze({';
    const hook = [
        '        // Test-only VM hook: never persisted in a Roll20 artifact.',
        '        globalThis.__GAMEASSIST_ALMANAC_GATE0_HOOKS = Object.freeze({',
        '            resolveWorldMinute: (profile, worldMinute) => resolveWorldMinute(profile, worldMinute),',
        '            profileFor: profileId => profileFor(profileId)',
        '        });',
        ''
    ].join('\n');
    assert.equal(source.includes(hookMarker), true, 'the lexical Almanac test hook seam must remain explicit');
    const instrumentedSource = source.replace(hookMarker, `${hook}${hookMarker}`);
    vm.createContext(sandbox);
    vm.runInContext(instrumentedSource, sandbox, { filename: POLICY.sourceArtifact });
    (handlers.get('ready') || []).forEach(callback => callback());

    function dispatchCommand(content, playerId = POLICY.gmPlayerId) {
        chats.length = 0;
        (handlers.get('chat:message') || []).forEach(callback => callback({
            type: 'api',
            content,
            playerid: playerId,
            who: 'Test GM'
        }));
        return chats.slice();
    }

    return { state, sandbox, dispatchCommand };
}
// --- Notes & Comments ---
// Changed (v2.0.0): add an isolated Roll20-shaped VM harness for deterministic Gate 0 contract checks.
// Decision log:
//   CHOICE: suppress timers in the adapter — ALT: retain Node timers; REJECTED: background module schedules would keep a focused synchronous test process alive.
//   CHOICE: capture chat output in memory — ALT: print every panel; REJECTED: assertions need exact, side-effect-free route evidence.
// [GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_ALMANAC_GATE0_TEST:CHECKS] BEGIN
// Section Title: Gate 0 artifact, chronology, lifecycle, and command checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_GATE0_TEST",
//   area: "CHECKS",
//   title: "Gate 0 contract checks",
//   guarantees: ["Verifies byte-identical artifacts, the removed chronology pre-scan, supported chronology boundaries, configured subsystem status, preserved settings, and normalized dashboard aliases.","Fails fast with Node assertions before reporting success."],
//   depends_on: ["[GAMEASSIST_ALMANAC_GATE0_TEST:POLICY]","[GAMEASSIST_ALMANAC_GATE0_TEST:HARNESS]"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_GATE0_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// These checks cover the narrow Gate 0 contracts without pretending to prove
// live Roll20 behavior. The last valid standard-calendar minute and the first
// invalid minute make the resolver's bounded end-of-range behavior explicit.
// -----------------------------------------------------------------------------
function assertExecutableArtifactsAreIdentical() {
    const artifacts = POLICY.executableArtifacts.map(name => ({
        name,
        content: fs.readFileSync(path.join(REPOSITORY_ROOT, name))
    }));
    const reference = artifacts[0];
    artifacts.slice(1).forEach(artifact => {
        assert.deepEqual(
            artifact.content,
            reference.content,
            `${artifact.name} must remain byte-identical to ${reference.name}`
        );
    });
}

function assertChronologyContract(harness) {
    const source = fs.readFileSync(path.join(REPOSITORY_ROOT, POLICY.sourceArtifact), 'utf8');
    assert.equal(
        source.includes('maximumWorldMinute'),
        false,
        'resolveWorldMinute() must not restore the removed full-range maximumWorldMinute() pre-scan'
    );

    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const hooks = harness.sandbox.__GAMEASSIST_ALMANAC_GATE0_HOOKS;
    const runtime = harness.state.GameAssist.AlmanacAssist.runtime;
    const originalMinute = runtime.time.worldMinute;
    const profile = hooks.profileFor('standard');
    assert.equal(hooks.resolveWorldMinute(profile, -1), null, 'negative world minutes must return null');
    assert.equal(hooks.resolveWorldMinute(profile, Number.POSITIVE_INFINITY), null, 'non-finite world minutes must return null');
    const totalDays = Array.from({ length: POLICY.maximumSupportedYear }, (_, offset) => {
        const year = offset + 1;
        const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        return leap ? 366 : 365;
    }).reduce((total, days) => total + days, 0);
    const lastValidMinute = totalDays * POLICY.hoursPerDay * POLICY.minutePerHour - 1;

    runtime.time.worldMinute = lastValidMinute;
    const finalMoment = api.getTime();
    assert.equal(finalMoment.year, POLICY.maximumSupportedYear, 'the final supported minute must resolve in year 9999');

    runtime.time.worldMinute = lastValidMinute + 1;
    assert.equal(api.getTime(), null, 'the first minute beyond the supported chronology must return null');

    assert.equal(hooks.resolveWorldMinute(profile, lastValidMinute + 1), null, 'the lexical resolver must reject the first minute beyond year 9999');

    runtime.time.worldMinute = originalMinute;
}

function assertConfiguredStatusAndPreservedState(harness) {
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const config = harness.state.GameAssist.AlmanacAssist.config;
    const climateName = 'Gate 0 Preserved Region';

    config.climate.regions[0].name = climateName;
    config.enabled = false;
    const disabledParentStatus = api.getSubmoduleStatus();
    assert.equal(api.isAvailable(), false, 'parent availability must report the disabled module');
    assert.equal(disabledParentStatus.time, true, 'parent disable must not rewrite configured Time state');
    assert.equal(disabledParentStatus.climate, true, 'parent disable must not rewrite configured Climate state');
    assert.equal(Object.isFrozen(disabledParentStatus), true, 'configured status must be a defensive frozen result');

    config.enabled = true;
    config.timeAlmanacEnabled = false;
    const disabledTimeStatus = api.getSubmoduleStatus();
    assert.equal(disabledTimeStatus.time, false, 'the legacy configured Time switch must remain part of Time configuration');
    assert.equal(disabledTimeStatus.climate, true, 'other configured subsystem states must remain independent');

    config.timeAlmanacEnabled = true;
    config.submodules.climate = false;
    assert.equal(api.getSubmoduleStatus().climate, false, 'an explicitly disabled Climate system must report configured off state');
    config.submodules.climate = true;
    assert.equal(config.climate.regions[0].name, climateName, 'disable/re-enable must preserve valid saved configuration');
}

function assertDashboardAliases(harness) {
    POLICY.dashboardAliases.forEach(command => {
        const chats = harness.dispatchCommand(command);
        assert.equal(chats.length, 1, `${command} must produce one compact dashboard panel`);
        assert.match(chats[0].message, /\{\{name=AlmanacAssist\}\}/, `${command} must open the Current World dashboard`);
        assert.match(chats[0].message, /Advance Date &amp; Time/, `${command} must expose time advancement within the dashboard`);
    });
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const harness = createHarness();
    assert.ok(harness.sandbox.GameAssist.AlmanacAssist, 'AlmanacAssist public API must initialize in the isolated sandbox');
    assertChronologyContract(harness);
    assertConfiguredStatusAndPreservedState(harness);
    assertDashboardAliases(harness);
    process.stdout.write('PASS: AlmanacAssist Gate 0 focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): establish executable Gate 0 checks for #92/#93, lifecycle preservation, artifact identity, and close command aliases.
// Decision log:
//   CHOICE: test public AlmanacAssist API/chat contracts plus an in-memory lexical resolver hook — ALT: add production-only test exports; REJECTED: the shipped API must not expand merely for a focused regression test.
//   CHOICE: retain a separate live Roll20 acceptance gate — ALT: claim VM coverage proves Roll20 behavior; REJECTED: query prompts and sandbox rendering still require live evidence.
// [GAMEASSIST_ALMANAC_GATE0_TEST:CHECKS] END
// ============================================================================
