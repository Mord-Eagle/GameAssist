// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_TEMPORAL_CONTEXTS_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise explicit bounded temporal context projections, reviewed transitions, reconciliation, stale guards, future-schema preservation, and semantic-event boundaries against the shipped executable."
//   order: ["artifact_identity","read_only_api","context_editing","preview","commit","stale_guard","authority_boundaries","future_schema","future_runtime","aliases"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never claim VM results replace deferred final live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_TEMPORAL_CONTEXTS_TEST:CHECKS]"]
//   performance: { notes: "Fresh bounded isolated VM fixtures; no timers, network, or live sandbox calls." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_TEMPORAL_CONTEXTS_TEST]/
//     └─ [GAMEASSIST_ALMANAC_TEMPORAL_CONTEXTS_TEST:CHECKS]
// --- prose banner ---
// This Node-only suite proves temporal contexts are transparent local projections
// of one authoritative fictional minute, not another ticking global clock. It
// verifies review before transition, explicit reconciliation, no gameplay/provider
// side effects, bounded semantic notifications, and warning-only future state.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

function providerDigest(almanac) {
    return JSON.stringify({
        climate: almanac.runtime.climate,
        astronomy: almanac.runtime.astronomy,
        weather: almanac.runtime.weather,
        environment: almanac.runtime.environment,
        rest: almanac.runtime.rest,
        world: almanac.runtime.world,
        activeLocationId: almanac.config.world.activeLocationId,
        favoriteLocationIds: almanac.config.world.favoriteLocationIds,
        rulesAdvisor: almanac.config.rulesAdvisor,
        worldPacks: almanac.config.worldPacks
    });
}

function addFastPlane(harness) {
    const response = harness.dispatchCommand('!aa-temporal add --name "Fast Plane" --kind planar --rate 2:1 --offset 30');
    assert.equal(response.length, 1, 'adding a temporal context must return one compact editor panel');
    assert.match(response[0].message, /Fast Plane/, 'new context editor must identify the context');
    const contexts = harness.state.GameAssist.AlmanacAssist.config.temporalContexts.contexts;
    const fast = contexts.find(context => context.id === 'fast-plane');
    assert.ok(fast, 'added context must have a stable derived ID');
    assert.equal(fast.kind, 'planar', 'explicit context kind must be retained');
    assert.equal(fast.rateNumerator, 2, 'local rate numerator must be retained');
    assert.equal(fast.rateDenominator, 1, 'canonical rate denominator must be retained');
    assert.equal(fast.epochOffsetMinutes, 30, 'epoch offset must be retained as transparent projection data');
    return fast;
}

function transitionGrantId(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.temporal.grants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'fixture must retain exactly one temporal transition review grant');
    return ids[0];
}

function assertReadOnlyApiAndLayers(harness) {
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const before = JSON.stringify({ config: almanac.config.temporalContexts, runtime: almanac.runtime.temporal });
    const temporal = api.getTemporalContext();
    assert.equal(api.version, '2.0.0', 'active AlmanacAssist implementation must identify itself as v2.0.0');
    assert.equal(api.temporalContextSchemaVersion, 1, 'public API must disclose temporal context schema version');
    assert.equal(temporal.schemaVersion, 1, 'temporal public snapshot must identify its schema');
    assert.equal(temporal.available, true, 'default Prime Context must project the authoritative minute');
    assert.equal(temporal.active.context.id, 'prime', 'Prime Context must be explicit default active context');
    assert.equal(Object.isFrozen(temporal), true, 'temporal public snapshot must be deeply immutable');
    assert.equal(Object.isFrozen(temporal.active.context), true, 'nested temporal context must be deeply immutable');
    assert.throws(() => { temporal.active.context.name = 'Mutated'; }, /read only|Cannot assign/i, 'public temporal context must not be mutable by callers');
    assert.equal(JSON.stringify({ config: almanac.config.temporalContexts, runtime: almanac.runtime.temporal }), before, 'read-only temporal API must not initialize or mutate stored state');

    const fast = addFastPlane(harness);
    const basic = harness.dispatchCommand(`!aa-temporal edit --id ${fast.id} --layer basic`);
    const detailed = harness.dispatchCommand(`!aa-temporal edit --id ${fast.id} --layer detailed`);
    const technical = harness.dispatchCommand(`!aa-temporal edit --id ${fast.id} --layer technical`);
    [basic, detailed, technical].forEach((response, index) => {
        assert.equal(response.length, 1, 'each editor layer must render one panel');
        assert.doesNotMatch(response[0].message, /"schemaVersion"|&quot;schemaVersion&quot;/, 'ordinary temporal editor layers must not dump raw JSON');
        assert.match(response[0].message, /Layers/, 'each editor layer must provide progressive-disclosure navigation');
        assert.ok(index >= 0);
    });
    assert.match(detailed[0].message, /Local:Canonical Rate/, 'Detailed layer must expose explicit mechanics');
    assert.match(technical[0].message, /Projection Formula/, 'Technical layer must expose transparent derivation rather than hidden clock state');
    const scene = harness.dispatchCommand('!aa-scene');
    assert.match(scene[0].message, /Temporal Context/, 'GM Scene view must show the active explicit temporal context');
}

function assertPreviewCommitAndEvents(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const fast = addFastPlane(harness);
    const events = [];
    const subscription = api.observe(event => events.push(event), { owner: 'TemporalContextTest' });
    assert.equal(subscription.ok, true, 'public observer API must accept bounded temporal consumer');
    const timeBefore = almanac.runtime.time.worldMinute;
    const timeRevisionBefore = almanac.runtime.time.revision;
    const providerBefore = providerDigest(almanac);
    const contextBefore = JSON.stringify(almanac.config.temporalContexts);
    const review = harness.dispatchCommand(`!aa-temporal transition --id ${fast.id} --minutes 60`);
    assert.equal(review.length, 1, 'transition must stop at one review panel');
    assert.match(review[0].message, /Transition Preview/, 'transition must identify explicit review phase');
    assert.match(review[0].message, /Canonical Elapsed Time/, 'preview must disclose one authoritative elapsed timeline');
    assert.match(review[0].message, /Local Relationship/, 'preview must disclose both projection relationships');
    assert.match(review[0].message, /Reconciliation/, 'preview must explain non-reversing reconciliation');
    assert.equal(almanac.runtime.time.worldMinute, timeBefore, 'preview must not advance authoritative fictional time');
    assert.equal(almanac.runtime.temporal.activeContextId, 'prime', 'preview must not activate destination context');
    assert.equal(providerDigest(almanac), providerBefore, 'preview must not change providers, gameplay runtime, location, or other state');
    assert.equal(JSON.stringify(almanac.config.temporalContexts), contextBefore, 'preview must not mutate temporal configuration');

    const result = harness.dispatchCommand(`!aa-temporal confirm --grant ${transitionGrantId(harness)}`);
    assert.equal(result.length, 1, 'confirmed transition must render one result panel');
    assert.match(result[0].message, /Temporal Transition Committed/, 'confirmed transition must identify committed result');
    assert.equal(almanac.runtime.time.worldMinute, timeBefore + 60, 'confirmed transition must advance the one authoritative clock only by reviewed canonical minutes');
    assert.equal(almanac.runtime.time.revision, timeRevisionBefore + 1, 'canonical time revision must advance once');
    assert.equal(almanac.runtime.temporal.activeContextId, fast.id, 'confirmed transition must explicitly activate destination context');
    assert.equal(almanac.runtime.temporal.history.length, 1, 'transition must retain bounded reconciliation history');
    const record = almanac.runtime.temporal.history[0];
    assert.equal(record.canonicalElapsedMinutes, 60, 'history must record reviewed canonical elapsed minutes');
    assert.equal(record.departureElapsedLocal, 60, 'Prime Context must project equal local elapsed time');
    assert.equal(record.destinationElapsedLocal, 120, '2:1 context must project explicit doubled local elapsed time');
    assert.equal(providerDigest(almanac), providerBefore, 'transition must not alter providers, gameplay runtime, location, resources, or other state');
    assert.ok(events.some(event => event.type === 'almanac.time.changed'), 'consumers must receive bounded canonical time event rather than private state access');
    const transitionEvent = events.find(event => event.type === 'almanac.temporal.transition');
    assert.ok(transitionEvent, 'consumers must receive bounded committed temporal transition event');
    assert.equal(transitionEvent.payload.destinationContextId, fast.id, 'semantic event must disclose explicit destination identity');
    assert.equal(Object.isFrozen(transitionEvent), true, 'semantic event must remain immutable for consumers');
    subscription.unsubscribe();
}

function assertInstantAndStaleSafety(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const fast = addFastPlane(harness);
    const originalMinute = almanac.runtime.time.worldMinute;
    const instantReview = harness.dispatchCommand(`!aa-temporal transition --id ${fast.id} --minutes 0`);
    assert.equal(instantReview.length, 1, 'zero elapsed context shift must still require review');
    const instant = harness.dispatchCommand(`!aa-temporal confirm --grant ${transitionGrantId(harness)}`);
    assert.equal(instant.length, 1, 'confirmed zero elapsed context shift must render result');
    assert.equal(almanac.runtime.time.worldMinute, originalMinute, 'explicit instantaneous shift must not fabricate a canonical time change');
    assert.equal(almanac.runtime.temporal.activeContextId, fast.id, 'zero elapsed reviewed shift must still explicitly activate destination context');

    // Prepare a return preview, then change canonical time through its ordinary owner. Confirmation must refuse stale data.
    const review = harness.dispatchCommand('!aa-temporal transition --id prime --minutes 30');
    assert.equal(review.length, 1, 'return transition must render preview');
    const staleGrant = transitionGrantId(harness);
    const advance = harness.dispatchCommand('!aa-time advance --minutes 10');
    assert.equal(advance.length, 1, 'ordinary Time owner must be able to change time after a preview');
    const stale = harness.dispatchCommand(`!aa-temporal confirm --grant ${staleGrant}`);
    assert.equal(stale.length, 1, 'stale temporal confirmation must render one refusal');
    assert.match(stale[0].message, /changed after preview|discarded/i, 'changed authoritative time must invalidate transition preview');
    assert.equal(almanac.runtime.temporal.activeContextId, fast.id, 'stale confirmation must preserve active context');
    assert.equal(almanac.runtime.time.worldMinute, originalMinute + 10, 'stale confirmation must not apply reviewed elapsed time a second time');
}

function assertBoundariesAndFutureState(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const fast = addFastPlane(harness);
    // Simulate an independently owned active journey: temporal transition must not overlap it.
    almanac.config.world = {
        schemaVersion: 4, revision: 1, regions: [], geographies: [], ecoregions: [], biomes: [],
        locations: [{ id: 'origin', name: 'Origin', description: '', tags: [] }, { id: 'destination', name: 'Destination', description: '', tags: [] }],
        destinations: [], routes: [], phenomena: [], presets: [], activeLocationId: 'origin', favoriteLocationIds: [], rulesProfile: '2014'
    };
    almanac.runtime.world.travel.journey = {
        schemaVersion: 1, id: 'journey', originLocationId: 'origin', destinationLocationId: 'destination', routeId: null,
        routeName: 'Fixture route', terrainNote: '', totalMiles: 10, remainingMiles: 10, paceId: 'standard', startWorldMinute: almanac.runtime.time.worldMinute
    };
    const blocked = harness.dispatchCommand(`!aa-temporal transition --id ${fast.id} --minutes 10`);
    assert.equal(blocked.length, 1, 'active Travel overlap must return one safety panel');
    assert.match(blocked[0].message, /Finish or cancel the active reviewed Travel journey/i, 'temporal transition must preserve Travel ownership boundary');
    almanac.runtime.world.travel.journey = null;

    const primeRemoval = harness.dispatchCommand('!aa-temporal remove --id prime --confirm yes');
    assert.equal(primeRemoval.length, 1, 'Prime removal must return one refusal panel');
    assert.match(primeRemoval[0].message, /cannot be removed/i, 'Prime Context must remain stable canonical reference');
    const primeMutation = harness.dispatchCommand('!aa-temporal set --id prime --field name --value "Mutable Prime"');
    assert.equal(primeMutation.length, 1, 'Prime mutation must return one refusal panel');
    assert.match(primeMutation[0].message, /immutable/i, 'Prime Context identity and mechanics must remain immutable');
    assert.equal(almanac.config.temporalContexts.contexts.find(context => context.id === 'prime').name, 'Prime Context', 'refused Prime mutation must preserve baseline identity');

    almanac.config.temporalContexts = { schemaVersion: 99, opaqueFutureField: { preserve: true } };
    const before = JSON.stringify(almanac.config.temporalContexts);
    const future = harness.dispatchCommand('!aa-temporal');
    assert.equal(future.length, 1, 'future temporal config must render one warning-only panel');
    assert.match(future[0].message, /newer than this AlmanacAssist version/, 'future temporal config must remain explicit');
    assert.equal(JSON.stringify(almanac.config.temporalContexts), before, 'future temporal config must remain untouched by display path');
    const snapshot = harness.sandbox.GameAssist.AlmanacAssist.getTemporalContext();
    assert.equal(snapshot.available, false, 'public API must refuse to interpret future temporal config');
    assert.match(snapshot.warning, /newer than this AlmanacAssist version/, 'public API must retain future-schema warning');
}

function assertFutureTemporalRuntimePreservation(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.runtime.temporal = { schemaVersion: 99, opaqueFutureGrant: { preserve: true } };
    const before = JSON.stringify(almanac.runtime.temporal);
    const response = harness.dispatchCommand('!aa-temporal');
    assert.equal(response.length, 1, 'future temporal runtime must render one warning-only panel');
    assert.match(response[0].message, /runtime schema 99 is newer than this AlmanacAssist version/i, 'future temporal runtime must remain explicit');
    assert.equal(JSON.stringify(almanac.runtime.temporal), before, 'future temporal runtime must not be normalized, expired, or reinterpreted');
    const snapshot = harness.sandbox.GameAssist.AlmanacAssist.getTemporalContext();
    assert.equal(snapshot.available, false, 'public temporal API must refuse to interpret future runtime state');
    assert.match(snapshot.warning, /runtime schema 99 is newer than this AlmanacAssist version/i, 'public temporal API must surface future runtime warning');
}

function assertAliases(harness) {
    ['!TEMPORAL status', '!temporal-status', '!temporalcontexts-status', '!temporal-contexts-status', '!temporal contexts status', '!aa temporal', '!aa-temporal-contexts-status', '!aa temporal contexts status', '!temporalcontext-status'].forEach(command => {
        const response = harness.dispatchCommand(command);
        assert.equal(response.length, 1, `${command} must reach one temporal context panel`);
        assert.match(response[0].message, /Temporal Contexts/, `${command} must normalize to temporal context controls`);
    });
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertReadOnlyApiAndLayers(createHarness());
    assertPreviewCommitAndEvents(createHarness());
    assertInstantAndStaleSafety(createHarness());
    assertBoundariesAndFutureState(createHarness());
    assertFutureTemporalRuntimePreservation(createHarness());
    assertAliases(createHarness());
    process.stdout.write('PASS: AlmanacAssist Temporal Contexts focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused evidence that temporal contexts are explicit rate projections over one canonical chronology, with review/commit/stale safeguards and no hidden gameplay or provider writes.
// Decision log:
//   CHOICE: observe bounded semantic events from the public Almanac API — ALT: inspect private temporal runtime from a consumer; REJECTED: consumers must receive committed facts rather than couple to private state.
//   CHOICE: assert ordinary Time invalidates a temporal preview — ALT: only exercise successful transitions; REJECTED: stale chronology is the central safety boundary for reconciliation.
