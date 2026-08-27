// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_REST_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise selected-token RestAlmanac previews, reviewed sheet recovery, fictional-time advancement, and stale safeguards against the shipped artifact."
//   order: ["artifact_identity","selection_recovery","long_rest_preview","reviewed_confirmation","stale_guard","controller_boundary"]
//   env:
//     required: ["NODE_RUNTIME"]
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never treat the isolated VM as a substitute for live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     spans: ["[GAMEASSIST_ALMANAC_REST_TEST:CHECKS]"]
//   performance: { notes: "Fresh deterministic VM fixtures with bounded character attributes and no timer dependency." }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
// --- prose banner ---
// This Node-only suite proves the GM-facing Rest flow begins with a selected,
// supported 2014 PC token, exposes every pending change before confirmation,
// advances fictional time only after accepted recovery, and refuses stale plans.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_REST_TEST:CHECKS] BEGIN
// Section Title: Selected-token RestAlmanac checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_REST_TEST",
//   area: "CHECKS",
//   title: "Selected-token reviewed recovery checks",
//   guarantees: ["Rest requires an eligible selected token.","No sheet or fictional-time write occurs until the exact preview is confirmed.","Changed sheets and unauthorized selections cannot consume a reviewed rest grant."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["RestAlmanac focused regression evidence"],
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function onlyPanel(harness, command, playerId, selected) {
    const panels = harness.dispatchCommand(command, playerId, selected);
    assert.equal(panels.length, 1, `${command} must produce one compact panel`);
    return panels[0].message;
}

function panelName(message) {
    const match = String(message).match(/\{\{name=([^}]*)\}\}/);
    return match ? match[1] : '';
}

function onlyGrant(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.rest.grants;
    const ids = Object.keys(grants || {});
    assert.equal(ids.length, 1, 'one fresh Rest preview must retain one review grant');
    return ids[0];
}

function install2014RestFixture(harness, options = {}) {
    const characterId = options.characterId || 'rest-pc';
    const tokenId = options.tokenId || 'rest-token';
    const controller = options.controller || 'GM';
    const character = harness.sandbox.createObj('character', {
        _id: characterId,
        name: options.name || 'Aster',
        charactersheetname: options.sheetName || 'OGL5E',
        controlledby: controller
    });
    const token = harness.sandbox.createObj('graphic', {
        _id: tokenId,
        name: `${options.name || 'Aster'} Token`,
        represents: character.id,
        layer: options.layer || 'objects',
        controlledby: controller
    });
    const attributes = new Map();
    [
        ['hit_dice', options.hitDice ?? '0', options.hitDiceMax ?? '4'],
        ['hp', options.hp ?? '5', options.hpMax ?? '20'],
        ['lvl1_slots_total', options.slotsTotal ?? '3', ''],
        ['lvl1_slots_expended', options.slotsRemaining ?? '1', '']
    ].forEach(([name, current, max]) => {
        attributes.set(name, harness.sandbox.createObj('attribute', {
            _characterid: character.id,
            name,
            current: String(current),
            max: String(max)
        }));
    });
    return {
        character,
        token,
        attributes,
        selected: [{ _id: token.id, _type: 'graphic' }]
    };
}

function assertSelectionRecovery(harness) {
    const before = JSON.stringify(harness.state.GameAssist.AlmanacAssist.runtime.rest);
    const response = onlyPanel(harness, '!aa-rest preview --type long');
    assert.match(panelName(response), /RestAlmanac Needs Attention/, 'an unselected Rest action must identify its recoverable prerequisite');
    assert.match(response, /Select at least one linked 2014 PC token you control/, 'the unselected Rest response must explain the concrete Roll20 selection prerequisite');
    assert.match(response, /\[Rest\]\(!rest\)/, 'the unselected Rest response must retain a direct return path');
    assert.equal(JSON.stringify(harness.state.GameAssist.AlmanacAssist.runtime.rest), before, 'an unselected Rest action must not create grants or change rest history');
}

function assertReviewedLongRest(harness) {
    const fixture = install2014RestFixture(harness);
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const startingMinute = almanac.runtime.time.worldMinute;
    const startingValues = Object.fromEntries([...fixture.attributes].map(([name, attribute]) => [name, attribute.get('current')]));

    const preview = onlyPanel(harness, '!aa-rest preview --type long', 'GM', fixture.selected);
    assert.match(panelName(preview), /Long Rest Preview/, 'a selected supported PC must reach a named Long Rest preview');
    assert.match(preview, /Aster: Hit Points 5 to 20, Hit Dice 0 to 2, Level 1 Spell Slots 1 to 3/, 'the preview must disclose all verified sheet changes before confirmation');
    assert.match(preview, /No change has been made yet/, 'the preview must explicitly disclose its no-write boundary');
    assert.match(preview, /Advance 8 hour\(s\) after successful sheet changes/, 'the preview must disclose the exact fictional-time result before confirmation');
    assert.deepEqual(
        Object.fromEntries([...fixture.attributes].map(([name, attribute]) => [name, attribute.get('current')])),
        startingValues,
        'opening a Rest preview must not write character attributes'
    );
    assert.equal(almanac.runtime.time.worldMinute, startingMinute, 'opening a Rest preview must not advance fictional time');

    const complete = onlyPanel(harness, `!aa-rest confirm --grant ${onlyGrant(harness)}`);
    assert.match(panelName(complete), /Long Rest Complete/, 'accepted Rest confirmation must identify completion');
    assert.match(complete, /3 verified change\(s\) completed/, 'completion must report the exact reviewed write count');
    assert.match(complete, /Advanced 480 fictional minute\(s\)/, 'completion must report the accepted eight-hour time advance');
    assert.equal(fixture.attributes.get('hp').get('current'), '20', 'a confirmed Long Rest must restore verified HP to its saved maximum');
    assert.equal(fixture.attributes.get('hit_dice').get('current'), '2', 'a confirmed Long Rest must restore half of verified Hit Dice, at least one');
    assert.equal(fixture.attributes.get('lvl1_slots_expended').get('current'), '3', 'a confirmed Long Rest must restore the verified remaining spell-slot field to its total');
    assert.equal(almanac.runtime.time.worldMinute, startingMinute + 480, 'a confirmed Long Rest must advance exactly its reviewed duration');
    assert.equal(almanac.runtime.rest.history.at(-1).typeId, 'long', 'accepted completion must retain bounded rest history evidence');
    assert.equal(Object.keys(almanac.runtime.rest.grants).length, 0, 'accepted completion must consume its one-use review grant');
}

function installWorldPackClockFixture(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    harness.dispatchCommand('!aa-worldpacks preset install --id lumenfen-atlas');
    const grantId = Object.keys(almanac.runtime.worldPacks.grants)[0];
    assert.ok(grantId, 'the WorldPack clock fixture must retain an installation review');
    harness.dispatchCommand(`!aa-worldpacks confirm --grant ${grantId}`);
    harness.dispatchCommand('!aa-location use --id lumenfen-atlas-location-1-1');
    const calendar = almanac.config.worldPackDefinitions.packs[0]?.palette?.calendars?.[0]?.definition;
    assert.ok(calendar, 'the installed WorldPack must expose its editable Calendar definition');
    // Exercise a valid campaign-owned calendar clone whose hours are unlike the
    // saved Standard fallback. This is a runtime behavior fixture rather than a
    // source-package mutation: the production editor validates this same shape.
    calendar.hoursPerDay = 20;
    calendar.minutesPerHour = 75;
    return almanac;
}

function assertWorldPackCalendarRestDuration(harness) {
    const almanac = installWorldPackClockFixture(harness);
    const fixture = install2014RestFixture(harness, { name: 'Clockwork', characterId: 'clock-pc', tokenId: 'clock-token' });
    const startingMinute = almanac.runtime.time.worldMinute;
    const preview = onlyPanel(harness, '!aa-rest preview --type long', 'GM', fixture.selected);
    assert.match(preview, /Campaign Clock=.*7th Hour, 30 minutes/, 'Rest preview must render the active WorldPack Calendar clock rather than the saved Standard fallback');
    assert.match(preview, /Advance 8 hour\(s\) after successful sheet changes from this previewed Campaign Clock moment/, 'Rest preview must describe the same Campaign Clock unit that confirmation will advance');
    const complete = onlyPanel(harness, `!aa-rest confirm --grant ${onlyGrant(harness)}`);
    assert.match(complete, /Advanced 600 fictional minute\(s\)/, 'a Long Rest must convert eight active WorldPack Calendar hours at 75 minutes each');
    assert.equal(almanac.runtime.time.worldMinute, startingMinute + 600, 'Rest confirmation must advance the one Campaign Clock using the active WorldPack Calendar hour length');
    assert.equal(almanac.runtime.rest.history.at(-1).advancedMinutes, 600, 'Rest history must retain the same committed WorldPack-clock duration');
}

function assertStalePlanGuard(harness) {
    const fixture = install2014RestFixture(harness, { name: 'Bram', characterId: 'stale-pc', tokenId: 'stale-token' });
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const beforeMinute = almanac.runtime.time.worldMinute;
    const preview = onlyPanel(harness, '!aa-rest preview --type long', 'GM', fixture.selected);
    assert.match(panelName(preview), /Long Rest Preview/, 'stale-guard fixture must first reach a review panel');
    const grant = onlyGrant(harness);
    fixture.attributes.get('hp').set('current', '7');

    const refused = onlyPanel(harness, `!aa-rest confirm --grant ${grant}`);
    assert.match(panelName(refused), /RestAlmanac Needs Attention/, 'a changed sheet must refuse stale Rest confirmation');
    assert.match(refused, /Bram changed after the preview/, 'a stale Rest result must name the changed selected character');
    assert.equal(fixture.attributes.get('hp').get('current'), '7', 'stale confirmation must preserve the ordinary post-preview sheet change');
    assert.equal(fixture.attributes.get('hit_dice').get('current'), '0', 'stale confirmation must not apply other planned writes');
    assert.equal(almanac.runtime.time.worldMinute, beforeMinute, 'stale confirmation must not advance fictional time');
    assert.equal(Object.keys(almanac.runtime.rest.grants).length, 0, 'a stale review grant must be consumed rather than reused');
}

function assertCustomRestCancellationRecovery(harness) {
    const added = onlyPanel(harness, '!aa-rest custom add --name "Breather" --hours 2 --base record');
    assert.match(panelName(added), /RestAlmanac/, 'adding a bounded custom Rest must return the ordinary Rest panel');
    const cancelled = onlyPanel(harness, '!aa-rest custom remove --id breather --confirm no');
    assert.match(cancelled, /Removing a custom rest requires --confirm yes/, 'declining a generated custom-Rest removal must visibly preserve it');
    assert.match(cancelled, /\[Rest\]\(!aa-rest\)/, 'declining a generated custom-Rest removal must retain a direct Rest recovery control');
    assert.ok(
        harness.state.GameAssist.AlmanacAssist.config.rest.customTypes.some(type => type.id === 'breather'),
        'declining custom-Rest removal must preserve its configuration'
    );
}

function assertControllerBoundary(harness) {
    const fixture = install2014RestFixture(harness, {
        name: 'Cato',
        characterId: 'player-pc',
        tokenId: 'player-token',
        controller: 'player-one'
    });
    const playerPreview = onlyPanel(harness, '!aa-rest preview --type short', 'player-one', fixture.selected);
    assert.match(panelName(playerPreview), /Short Rest Preview/, 'a controller-selected linked 2014 PC must be able to prepare its own Rest preview');
    assert.match(playerPreview, /Cato/, 'a player preview must identify the selected controlled character');

    const unauthorized = install2014RestFixture(harness, {
        name: 'Dara',
        characterId: 'other-pc',
        tokenId: 'other-token',
        controller: 'another-player'
    });
    const refused = onlyPanel(harness, '!aa-rest preview --type short', 'player-one', unauthorized.selected);
    assert.match(panelName(refused), /RestAlmanac Needs Attention/, 'an uncontrolled selected token must not open a player Rest preview');
    assert.match(refused, /token you control/, 'the controller refusal must state the access boundary in visible language');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertSelectionRecovery(createHarness());
    assertReviewedLongRest(createHarness());
    assertWorldPackCalendarRestDuration(createHarness());
    assertStalePlanGuard(createHarness());
    assertCustomRestCancellationRecovery(createHarness());
    assertControllerBoundary(createHarness());
    process.stdout.write('PASS: AlmanacAssist Rest focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused selected-token RestAlmanac evidence after uncommon-screen audit work.
// Decision log:
//   CHOICE: test the chat/selection boundary with ordinary Roll20-shaped objects — ALT: inspect private Rest helpers; REJECTED: the visible selected-token workflow is the GM and player contract.
//   CHOICE: cover a stale attribute change before confirmation — ALT: assert only a successful write; REJECTED: review-first recovery is meaningful only if a changed sheet cannot receive an obsolete plan.
// [GAMEASSIST_ALMANAC_REST_TEST:CHECKS] END
// ============================================================================
