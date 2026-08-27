// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_TRAVEL_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise generic Prepared Destinations and reviewed Travel against the shipped AlmanacAssist artifact."
//   order: ["artifact_identity","prepared_destination_review","travel_review_and_confirmation","scene_travel_evidence"]
//   env:
//     required: ["NODE_RUNTIME"]
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never install named setting data or treat VM checks as live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     spans: ["[GAMEASSIST_ALMANAC_TRAVEL_TEST:CHECKS]"]
//   performance: { notes: "One deterministic isolated VM and bounded generic fixtures." }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
// --- prose banner ---
// This Node-only test proves that prepared destination selection is reviewed,
// Travel starts without advancing time, every segment is previewed before it
// advances time, and arrival atomically changes Location only after acceptance.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_TRAVEL_TEST:CHECKS] BEGIN
// Section Title: Prepared destination and reviewed Travel checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_TRAVEL_TEST",
//   area: "CHECKS",
//   title: "Prepared destination and reviewed Travel checks",
//   guarantees: ["Prepared Locations and generic routes use bounded direct controls.","Travel never advances fictional time or swaps Location until an accepted segment."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["Travel focused regression evidence"],
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function installGenericTravelWorld(harness) {
    const state = harness.state.GameAssist.AlmanacAssist;
    state.config.world = {
        schemaVersion: 2,
        revision: 0,
        regions: [],
        geographies: [],
        ecoregions: [],
        biomes: [],
        locations: [
            { id: 'watch-camp', name: 'Watch Camp', description: 'Generic owner-authored origin', tags: ['camp'] },
            { id: 'river-haven', name: 'River Haven', description: 'Generic owner-authored destination', tags: ['haven'] }
        ],
        destinations: [{
            id: 'haven-session',
            name: 'River Haven Session Context',
            locationId: 'river-haven',
            defaultPace: 'standard',
            description: 'A generic session-prepared place',
            tags: ['session']
        }],
        routes: [{
            id: 'old-road',
            name: 'Old Road',
            fromLocationId: 'watch-camp',
            toLocationId: 'river-haven',
            distanceMiles: 10,
            defaultPace: 'standard',
            terrainNote: 'Owner-authored road note',
            description: 'A generic route',
            tags: ['road']
        }],
        activeLocationId: 'watch-camp',
        favoriteLocationIds: [],
        rulesProfile: '2014'
    };
    state.runtime.weather.current = null;
    state.runtime.weather.forecast = [];
    state.runtime.environment.current = null;
    state.runtime.environment.override = null;
}

function panelName(message) {
    const match = String(message).match(/\{\{name=([^}]*)\}\}/);
    return match ? match[1] : '';
}

function onlyPanel(harness, command) {
    const panels = harness.dispatchCommand(command);
    assert.equal(panels.length, 1, `${command} must produce one compact panel`);
    return panels[0].message;
}

function onlyGrant(map, label) {
    const keys = Object.keys(map || {});
    assert.equal(keys.length, 1, `${label} must retain exactly one review grant`);
    return keys[0];
}

function assertPreparedDestinationReview(harness) {
    installGenericTravelWorld(harness);
    const state = harness.state.GameAssist.AlmanacAssist;
    const initialMinute = state.runtime.time.worldMinute;
    const initialWeather = JSON.stringify(state.runtime.weather);

    const review = onlyPanel(harness, '!aa-location destination --id haven-session');
    assert.match(panelName(review), /Prepared Destination Review/, 'prepared selection must open a review panel');
    assert.match(review, /None yet\. Confirm/, 'prepared selection must clearly say no change happened yet');
    assert.equal(state.config.world.activeLocationId, 'watch-camp', 'prepared destination review must not silently move the party');
    assert.equal(state.runtime.time.worldMinute, initialMinute, 'prepared destination review must not change fictional time');
    assert.equal(JSON.stringify(state.runtime.weather), initialWeather, 'prepared destination review must not overwrite Weather');

    const grant = onlyGrant(state.runtime.world.destinationGrants, 'prepared destination');
    const applied = onlyPanel(harness, `!aa-location destination confirm --grant ${grant}`);
    assert.match(panelName(applied), /Prepared Destination Applied/, 'confirmation must clearly identify the applied destination');
    assert.equal(state.config.world.activeLocationId, 'river-haven', 'prepared destination confirmation must deliberately change only the active Location');
    assert.equal(state.runtime.time.worldMinute, initialMinute, 'prepared destination confirmation must not change fictional time');
    assert.equal(JSON.stringify(state.runtime.weather), initialWeather, 'prepared destination confirmation must preserve Weather authority');
}

function assertTravelReviewAndArrival(harness) {
    installGenericTravelWorld(harness);
    const state = harness.state.GameAssist.AlmanacAssist;
    const startMinute = state.runtime.time.worldMinute;

    const startReview = onlyPanel(harness, '!aa-travel plan --destination haven-session');
    assert.match(panelName(startReview), /Travel \/ Review Start/, 'planning must produce a reviewed start panel');
    assert.match(startReview, /Starting a journey changes neither Location nor fictional time/, 'start review must state its no-write boundary');
    assert.equal(state.config.world.activeLocationId, 'watch-camp', 'travel planning must not change the Location');
    assert.equal(state.runtime.time.worldMinute, startMinute, 'travel planning must not advance time');

    const startGrant = onlyGrant(state.runtime.world.travel.grants, 'travel start');
    const started = onlyPanel(harness, `!aa-travel start --grant ${startGrant}`);
    assert.match(panelName(started), /Travel \/ Journey/, 'accepted start review must open the active Journey panel');
    assert.equal(state.config.world.activeLocationId, 'watch-camp', 'starting a journey must keep the party at its origin');
    assert.equal(state.runtime.time.worldMinute, startMinute, 'starting a journey must not advance time');
    assert.equal(state.runtime.world.travel.journey.remainingMiles, 10, 'starting a journey must retain the full reviewed distance');

    const beforeScene = JSON.stringify(harness.state);
    const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
    assert.equal(JSON.stringify(harness.state), beforeScene, 'SceneResolver must expose active Travel without writing state');
    assert.equal(scene.providers.travel.status, 'available', 'Travel must become an available SceneResolver authority once the generic world model is valid');
    assert.equal(scene.travel.destinationName, 'River Haven', 'SceneResolver must expose the journey destination');
    assert.equal(scene.travel.remainingMiles, 10, 'SceneResolver must expose bounded remaining distance');
    assert.equal(scene.provenance['travel.journey'].authority, 'Travel', 'active journey provenance must identify Travel');
    assert.equal(Object.isFrozen(scene.travel), true, 'active journey evidence must be immutable');

    const blockedMove = onlyPanel(harness, '!aa-location use --id river-haven');
    assert.match(panelName(blockedMove), /Change Location Needs Attention/, 'direct movement while traveling must be refused');
    assert.equal(state.config.world.activeLocationId, 'watch-camp', 'blocked direct movement must preserve the origin Location');

    const blockedRouteEdit = onlyPanel(harness, '!aa-world set route --id old-road --field terrainNote --value "Changed road"');
    assert.match(panelName(blockedRouteEdit), /Worldbuilding Needs Attention/, 'the active journey route must not be rewritten mid-journey');
    assert.equal(state.config.world.routes[0].terrainNote, 'Owner-authored road note', 'blocked active-route editing must preserve the reviewed route evidence');

    const firstSegmentReview = onlyPanel(harness, '!aa-travel continue --hours 1');
    assert.match(panelName(firstSegmentReview), /Travel \/ Review Segment/, 'each journey segment must open a review panel');
    assert.match(firstSegmentReview, /No time change has happened yet/, 'segment review must state that time has not changed');
    assert.equal(state.runtime.time.worldMinute, startMinute, 'segment review must not advance time');
    assert.equal(state.runtime.world.travel.journey.remainingMiles, 10, 'segment review must not mutate journey progress');

    const firstSegmentGrant = onlyGrant(state.runtime.world.travel.grants, 'first travel segment');
    const firstSegment = onlyPanel(harness, `!aa-travel confirm --grant ${firstSegmentGrant}`);
    assert.match(panelName(firstSegment), /Travel \/ Journey/, 'a non-final accepted segment must return to the Journey panel');
    assert.equal(state.runtime.time.worldMinute, startMinute + 60, 'accepted one-hour standard-calendar segment must advance exactly 60 fictional minutes');
    assert.equal(state.config.world.activeLocationId, 'watch-camp', 'a non-final segment must preserve the origin Location');
    assert.equal(state.runtime.world.travel.journey.remainingMiles, 7, 'a one-hour Standard segment must move exactly three miles');

    const arrivalReview = onlyPanel(harness, '!aa-travel continue --hours 4');
    assert.match(arrivalReview, /Arrive at River Haven/, 'a final review must identify arrival before any write');
    assert.equal(state.runtime.time.worldMinute, startMinute + 60, 'arrival review must still not advance time');
    const arrivalGrant = onlyGrant(state.runtime.world.travel.grants, 'arrival travel segment');
    const arrival = onlyPanel(harness, `!aa-travel confirm --grant ${arrivalGrant}`);
    assert.match(panelName(arrival), /Travel \/ Arrived/, 'accepted final segment must clearly identify arrival');
    assert.equal(state.runtime.time.worldMinute, startMinute + 200, 'the final seven-mile Standard segment must advance only the required 140 minutes');
    assert.equal(state.config.world.activeLocationId, 'river-haven', 'arrival must atomically switch the active Location after accepted time travel');
    assert.equal(state.runtime.world.travel.journey, null, 'arrival must close the active journey');
    assert.equal(state.runtime.world.travel.history.at(-1).action, 'arrived', 'arrival must retain bounded journey history evidence');

    const directAlias = onlyPanel(harness, '!travel');
    assert.match(panelName(directAlias), /Travel \/ Start/, 'the direct Travel alias must share the reviewed Travel workflow');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    const harness = createHarness();
    assertPreparedDestinationReview(harness);
    assertTravelReviewAndArrival(harness);
    process.stdout.write('PASS: AlmanacAssist Prepared Destination and Travel focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused generic Prepared Destination and reviewed Travel evidence without claiming live Roll20 acceptance.
// Decision log:
//   CHOICE: prove review-to-confirm behavior through actual command grants — ALT: inspect private helpers; REJECTED: the Roll20 chat command boundary is the contract GMs use.
// [GAMEASSIST_ALMANAC_TRAVEL_TEST:CHECKS] END
// ============================================================================
