// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise first-run AlmanacAssist onboarding, generic built-in starter worlds, world-library switching, and deferred Roll20 command-button prompts."
//   order: ["artifact_identity","first_run_onboarding","deferred_prompt_contract","starter_world_install","world_switch_preservation"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a campaign while testing."
//     - "Never claim this VM contract replaces focused live Roll20 usability validation."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST:CHECKS]"]
//   performance: { notes: "Fresh isolated VM sandboxes only; starter records stay intentionally compact and bounded." }
//   concurrency: { model: "single-process deterministic test", idempotency: "every check constructs an isolated sandbox" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST]/
//     └─ [GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST:CHECKS]
// --- prose banner ---
// This Node-only suite proves that a fresh GM reaches usable generic starter
// worlds without raw JSON or hidden identifiers. It validates the generated
// command targets before Roll20's final renderer sees them, but deliberately
// leaves a fresh real-Roll20 prompt/render pass as a separate acceptance step.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

// ============================================================================
// [GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST:CHECKS] BEGIN
// Section Title: First-run starter-world and prompt checks
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST",
//   area: "CHECKS",
//   title: "First-run starter-world and prompt checks",
//   guarantees: ["Fresh campaigns receive visible guided paths to usable generic content.","World switches preserve the prior compatible campaign world before loading another saved context.","Prompt-bearing command buttons defer Roll20-sensitive syntax without raw quoted link targets."],
//   depends_on: ["tests/almanac-gate0.test.js"],
//   provides: ["Starter world focused regression evidence"],
//   observability: { logs: "stdout", spans: ["[GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST:CHECKS]"] },
//   last_updated_version: "v2.0.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
function onePanel(harness, command) {
    const messages = harness.dispatchCommand(command);
    assert.equal(messages.length, 1, `${command} must render one compact panel`);
    return messages[0].message;
}

function decodeNumericEntities(value) {
    return String(value).replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)));
}

function buttonTarget(message, label) {
    const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = String(message).match(new RegExp(`\\[${escaped}\\]\\(([^)]*)\\)`));
    assert.ok(match, `expected a ${label} command button`);
    return decodeNumericEntities(match[1]);
}

function allButtonTargets(message) {
    const targets = [];
    const pattern = /\[[^\]]+\]\(([^)]*)\)/g;
    let match;
    while ((match = pattern.exec(String(message)))) targets.push(decodeNumericEntities(match[1]));
    return targets;
}

function resolveDeferredPromptChoiceVariants(target) {
    const input = String(target);
    const spans = [];
    let index = 0;
    while (index < input.length) {
        const start = input.indexOf('?{', index);
        if (start < 0) break;
        let cursor = start + 2;
        let depth = 1;
        while (cursor < input.length && depth) {
            if (input[cursor] === '{') depth++;
            else if (input[cursor] === '}') depth--;
            cursor++;
        }
        assert.equal(depth, 0, `a rendered target must have a closed deferred prompt: ${target}`);
        spans.push({ start, end: cursor, parts: input.slice(start + 2, cursor - 1).split('|') });
        index = cursor;
    }
    if (!spans.length) return [input];

    const submittedChoices = spans.map(span => {
        assert.ok(span.parts.length >= 2, `a rendered target must give each deferred prompt a default or choice: ${target}`);
        const options = span.parts.slice(1);
        // A two-part prompt is normally free text. The only named one-choice
        // selectors in the ordinary Almanac surface intentionally submit their
        // value after the visible clear label.
        if (options.length === 1 && !/^(?:None|No page assignment),[^,]+$/i.test(options[0])) return [options[0]];
        return options.map(option => option.includes(',') ? option.slice(option.lastIndexOf(',') + 1) : option);
    });
    const baseline = submittedChoices.map(options => options[0]);
    const choices = [baseline];
    submittedChoices.forEach((options, promptIndex) => options.slice(1).forEach(option => {
        const variant = baseline.slice();
        variant[promptIndex] = option;
        choices.push(variant);
    }));

    return [...new Set(choices.map(values => {
        let result = '';
        let position = 0;
        spans.forEach((span, spanIndex) => {
            result += input.slice(position, span.start);
            result += values[spanIndex];
            position = span.end;
        });
        return `${result}${input.slice(position)}`;
    }))];
}

function worldState(harness) {
    return harness.state.GameAssist.AlmanacAssist;
}

function assertFirstRunOnboardingAndPromptContract() {
    const harness = createHarness();

    const guide = onePanel(harness, '!Almanac-Guide');
    assert.match(guide, /Choose a Starter World/, 'the ordinary Quick Guide must expose a first-run starter-world path');
    assert.match(guide, /Create a First Location/, 'the ordinary Quick Guide must expose a no-starter first-location path');

    const freshDashboard = onePanel(harness, '!aa-gm');
    assert.match(freshDashboard, /First Campaign Step=No playable world is selected yet/, 'the fresh Session dashboard must make the missing playable world explicit rather than implying a ready campaign');
    assert.match(freshDashboard, /Climate: Temperate Lowlands — Temperate seasonal baseline \(Campaign fallback region\)/, 'the fresh Session dashboard must label generic Climate as campaign fallback while no Location is assigned');

    const world = onePanel(harness, '!aa-world');
    assert.match(world, /Start Here/, 'an empty Worldbuilding hub must explain the first campaign step');
    assert.match(world, /Choose a Starter World/, 'an empty Worldbuilding hub must offer the starter-world collection');
    assert.doesNotMatch(world, /\{&quot;schemaVersion&quot;|"schemaVersion"/, 'first-run guidance must not dump raw configuration');

    const location = onePanel(harness, '!aa-location');
    assert.match(location, /Start With A Usable Place/, 'Change Location must explain why no locations blocks live play');
    assert.match(location, /Choose a Starter World/, 'Change Location must offer a non-dead-end first-run path');
    assert.match(location, /Create a Location/, 'Change Location must allow a direct first location without command memorization');

    const travel = onePanel(harness, '!aa-travel');
    assert.match(travel, /Travel needs at least one named Location/, 'Travel must give an actionable explanation before a location exists');
    assert.match(travel, /Choose a Starter World/, 'Travel must link back to usable setup instead of a dead end');

    const climateRegions = onePanel(harness, '!aa-climate regions');
    assert.match(climateRegions, /--name &#34;&#63;&#123;Region name/, 'a quoted climate-name prompt must defer its quote and roll-query syntax before Roll20 parses the link');
    const addRegionTarget = buttonTarget(climateRegions, 'Add Region');
    assert.match(addRegionTarget, /^!aa-climate region add --name "\?\{Region name\|New Climate Region\}" --profile \?\{Climate type\|/, 'the decoded Add Region target must retain a complete name and profile prompt');
    assert.match(addRegionTarget, /--parent \?\{Parent region\|No parent,none\|Temperate Lowlands,home\}/, 'the decoded Add Region target must provide a visible parent choice rather than demand a hidden identifier');

    const addLocationTarget = buttonTarget(location, 'Create a Location');
    assert.match(addLocationTarget, /^!aa-world add location --name "\?\{Location name\|Starting Location\}"$/, 'direct first-location setup must retain its complete deferred name prompt');

    const added = onePanel(harness, '!aa-climate region add --name "Rainshadow Vale" --profile desert --parent none');
    assert.match(added, /ClimateAlmanac/, 'a fully supplied climate-region command must return the ordinary climate panel');
    assert.ok(
        worldState(harness).config.climate.regions.some(region => region.name === 'Rainshadow Vale' && region.profileId === 'desert'),
        'the complete Add Region command contract must create a usable selected region'
    );

    const firstLocation = onePanel(harness, '!aa-world add location --name "Starting Point"');
    assert.match(firstLocation, /Use During Play/, 'the first manually created Location editor must immediately expose live-play controls');
    assert.equal(worldState(harness).config.world.activeLocationId, 'starting-point', 'the first manually created Location must become current so Travel is no longer blocked');
}

function installStarter(harness, starterId) {
    const output = onePanel(harness, `!aa-world starter install --id ${starterId}`);
    assert.match(output, /World Active/, `${starterId} must confirm the activated world`);
    return output;
}

function assertStarterWorldCollectionIsUsable() {
    const starterIds = ['ember-coast', 'sunward-expanse', 'frostfall-marches', 'mirewood-basin'];
    starterIds.forEach(starterId => {
        const harness = createHarness();
        const preview = onePanel(harness, `!aa-world starter preview --id ${starterId}`);
        assert.match(preview, /Included generic starter world/, `${starterId} preview must disclose generic owner-authored provenance`);
        assert.match(preview, /Start This World/, `${starterId} preview must have a direct start action`);

        installStarter(harness, starterId);
        const almanac = worldState(harness);
        assert.equal(almanac.config.world.locations.length, 3, `${starterId} must install immediate named locations`);
        assert.equal(almanac.config.world.destinations.length, 3, `${starterId} must install prepared destinations`);
        assert.equal(almanac.config.world.routes.length, 2, `${starterId} must install usable travel routes`);
        assert.equal(almanac.config.world.phenomena.length, 2, `${starterId} must install scene-ready phenomena`);
        assert.equal(almanac.config.climate.regions.length, 2, `${starterId} must install selectable climate regions`);
        assert.ok(almanac.config.world.activeLocationId, `${starterId} must activate a first location`);
        assert.equal(almanac.config.worldLibrary.activeWorldId, starterId, `${starterId} must be tracked as the active saved world`);

        const scene = harness.sandbox.GameAssist.AlmanacAssist.getScene();
        assert.ok(scene.location, `${starterId} must resolve an active Location in SceneResolver`);
        assert.ok(scene.climate, `${starterId} must resolve climate context through its installed climate regions`);

        const location = onePanel(harness, '!aa-location');
        assert.match(location, /Prepared Destinations/, `${starterId} must expose prepared destination choices in normal Location flow`);
        const travel = onePanel(harness, '!aa-travel');
        assert.match(travel, /Plan Travel/, `${starterId} must expose travel planning controls without setup commands`);
        assert.match(travel, /All available destinations are already listed above/, `${starterId} must not falsely imply that more Locations need to be created when prepared destinations already cover them`);
        assert.doesNotMatch(travel, /Add another Location in Worldbuilding before planning Travel/, `${starterId} Travel must avoid contradictory empty-list guidance`);
    });
}

function assertOrdinaryRenderedButtonPromptContract() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');
    const ordinaryScreens = [
        '!Almanac-Guide', '!aa-gm', '!aa-time menu', '!cal', '!aa-wayfarer', '!aa-wayfarer edit', '!aa-wayfarer copies', '!aa-wayfarer details', '!aa-wayfarer recovery',
        '!aa-wayfarer stage identity', '!aa-wayfarer stage weekdays', '!aa-wayfarer stage months', '!aa-wayfarer stage intercalary', '!aa-wayfarer stage leap', '!aa-wayfarer stage holidays', '!aa-wayfarer stage seasons',
        '!aa-climate', '!aa-climate regions', '!aa-climate region edit --id ember-coast-climate', '!aa-climate profiles', '!aa-astro', '!aa-astro setup', '!aa-weather', '!aa-weather history', '!aa-enviro', '!aa-enviro edit', '!aa-enviro details',
        '!aa-rest', '!aa-rest rules', '!aa-world', '!aa-world library', '!aa-world starters', '!aa-world locations', '!aa-world ecoregions', '!aa-world destinations', '!aa-world routes',
        '!aa-world edit location --id harbor-stead', '!aa-world edit ecoregion --id ember-coast-ecoregion --layer detailed', '!aa-world edit region --id ember-coast-region', '!aa-world edit geography --id ember-coast-geography', '!aa-world edit biome --id ember-coast-biome',
        '!aa-world edit destination --id to-mosswood-crossing', '!aa-world edit route --id harbor-mosswood-road', '!aa-world edit phenomenon --id ember-fog', '!aa-world edit preset --id ember-arrival',
        '!aa-location', '!aa-travel', '!aa-phenomena', '!aa-presets', '!aa-presets preview --id ember-arrival', '!aa-worldpacks', '!aa-temporal', '!aa-temporal edit --id prime', '!aa-rules', '!aa-announcement-settings', '!aa-announcement-fields'
    ];
    const targets = ordinaryScreens.flatMap(command => allButtonTargets(onePanel(harness, command)));
    assert.ok(targets.length >= 350, 'ordinary starter-world screens must expose a broad actionable button surface for prompt-contract auditing');
    targets.forEach(target => {
        assert.match(target, /^!/, `every rendered action must remain an executable Roll20 API command: ${target}`);
        assert.doesNotMatch(target, /--value\s+(?:true|undefined|null|""|'')(?=\s|$)/i, `a rendered action must not substitute a literal/blank value placeholder: ${target}`);
        assert.doesNotMatch(target, /--period\s+(?:undefined|null|""|'')(?=\s|$)/i, `a rendered action must not omit a calendar period: ${target}`);
        assert.doesNotMatch(target, /--(?:id|name|field)\s+(?:undefined|null|""|'')(?=\s|$)/i, `a rendered action must not omit a required identifier/name/field: ${target}`);
        const promptStarts = (target.match(/\?\{/g) || []).length;
        const promptEnds = (target.match(/\}/g) || []).length;
        assert.equal(promptEnds, promptStarts, `every deferred Roll20 prompt must close before the generated action is rendered: ${target}`);
        assert.doesNotMatch(target, /\?\{[^|}]*\}/, `every deferred Roll20 prompt must include a visible default or choice: ${target}`);
        assert.doesNotMatch(target, /\?\{[^}]*\|\}/, `every deferred Roll20 prompt must include a nonblank default or choice list: ${target}`);
    });

    // Execute each distinct ordinary target against the same restored starter state.
    // This catches a routed-but-broken action that static target inspection alone
    // cannot see, while keeping this VM-only check separate from Roll20 rendering.
    const baseline = JSON.parse(JSON.stringify(worldState(harness)));
    const activeState = worldState(harness);
    [...new Set(targets)].forEach(target => {
        // Exercise the default plus every visible choice of one prompt at a
        // time. This catches valid-but-incompatible combinations such as an
        // inherited root Climate region or duplicate named route endpoints,
        // without pretending this VM parser proves Roll20's final rendering.
        resolveDeferredPromptChoiceVariants(target).forEach(command => {
            Object.keys(activeState).forEach(key => delete activeState[key]);
            Object.assign(activeState, JSON.parse(JSON.stringify(baseline)));
            const result = harness.dispatchCommand(command);
            assert.equal(result.length, 1, `a decoded ordinary action must render one result panel: ${command}`);
            assert.doesNotMatch(result[0].message, /That .* was not recognized/i, `a decoded ordinary action must reach its handler: ${command}`);
            if (/Needs Attention|No Change Made|Review Refused/i.test(result[0].message)) {
                assert.ok(
                    allButtonTargets(result[0].message).some(recovery => recovery.startsWith('!')),
                    `a generated action that needs attention or declines a confirmation must retain a visible recovery path: ${command}`
                );
            }
        });
    });
}

function assertGeneratedValidationRecoveryPaths() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');

    const alreadyCurrent = onePanel(harness, '!aa-time set --year 1 --period January --day 1 --hour 8 --minute 0 --confirm yes');
    assert.match(alreadyCurrent, /requested time is already current/i, 'accepting the exact-current Time query must report its harmless no-op visibly');
    assert.equal(buttonTarget(alreadyCurrent, 'Open Time Controls'), '!aa-time menu', 'an exact-current Time result must return the GM to ordinary Time controls');

    const inheritedRoot = onePanel(harness, '!aa-climate region add --name "Inherited Without Parent" --profile inherit --parent none');
    assert.match(inheritedRoot, /root region must choose a climate profile/i, 'the independently selectable inherit/no-parent query combination must explain why it is invalid');
    assert.equal(buttonTarget(inheritedRoot, 'Climate Regions'), '!aa-climate regions', 'an invalid Climate add combination must return the GM to the named region controls');

    const sameRouteEndpoint = onePanel(harness, '!aa-world set route --id harbor-mosswood-road --field fromLocationId --value mosswood-crossing');
    assert.match(sameRouteEndpoint, /Travel Route needs two different endpoint Locations/i, 'a named route picker must refuse an endpoint that duplicates its other endpoint');
    assert.equal(buttonTarget(sameRouteEndpoint, 'Edit Travel Route'), '!aa-world edit route --id harbor-mosswood-road', 'an invalid named route choice must return directly to the affected route editor');
}

function assertWayfarerOptionalListsUseVisibleClearSentinels() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');
    const festivalStage = onePanel(harness, '!aa-wayfarer stage intercalary');
    assert.match(buttonTarget(festivalStage, 'Replace Festival Days'), /--value "\?\{Use Name:AfterPeriodNumber entries separated by commas; enter None to clear\|None\}"$/, 'an empty optional Wayfarer festival list must use a visible None sentinel instead of a blank --value prompt');
    onePanel(harness, '!aa-wayfarer intercalary --value None');
    onePanel(harness, '!aa-wayfarer holidays --value None');
    onePanel(harness, '!aa-wayfarer seasons --value None');
    const draft = worldState(harness).config.wayfarerDraft.definition;
    assert.equal(draft.intercalary.length, 0, 'the visible None sentinel must intentionally clear optional festival days');
    assert.equal(draft.holidays.length, 0, 'the visible None sentinel must intentionally clear optional holidays');
    assert.equal(draft.seasonRanges.length, 0, 'the visible None sentinel must intentionally clear optional seasonal ranges');
    const holidayStage = onePanel(harness, '!aa-wayfarer stage holidays');
    const seasonStage = onePanel(harness, '!aa-wayfarer stage seasons');
    assert.match(buttonTarget(holidayStage, 'Replace Holidays'), /enter None to clear\|None/, 'an empty optional holiday list must retain a nonblank visible clear sentinel');
    assert.match(buttonTarget(seasonStage, 'Replace Seasonal Ranges'), /enter None to use period labels\|None/, 'an empty optional seasonal-range list must retain a nonblank visible clear sentinel');
}

function assertStarterSessionScreensStayActionable() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');

    const screens = [
        ['!aa-gm', /Current World/, 'the Session dashboard'],
        ['!aa-scene', /Harbor Stead/, 'Current Scene'],
        ['!aa-climate', /Current Region/, 'Climate'],
        ['!aa-weather', /\[Generate\]/, 'Weather'],
        ['!aa-enviro', /Scene Overrides/, 'Environment'],
        ['!aa-astro', /Season and Daylight/, 'Astronomy'],
        ['!aa-location', /Prepared Destinations/, 'Change Location'],
        ['!aa-travel', /Plan Travel/, 'Travel'],
        ['!aa-presets', /Harbor Arrival/, 'Presets'],
        ['!aa-phenomena', /Harbor Fog/, 'Phenomena'],
        ['!aa-rules', /Safety Boundary/, 'Rules Advisor'],
        ['!aa-rest', /How To Use/, 'Rest'],
        ['!aa-worldpacks', /Create Blank Template/, 'WorldPacks'],
        ['!aa-wayfarer', /Export Editable Draft/, 'Wayfarer']
    ];
    const rendered = {};
    screens.forEach(([command, expectation, label]) => {
        const panel = onePanel(harness, command);
        rendered[command] = panel;
        assert.match(panel, expectation, `${label} must render an ordinary usable panel in a starter-installed campaign`);
        assert.doesNotMatch(panel, /That .* was not recognized|Needs Attention/i, `${label} must not strand the GM in a command-error dead end`);
    });

    assert.match(rendered['!aa-scene'], /Immediate Environment=Busy stone quay \| Wet cobbles and dock planks/, 'starter Scene must expose the active Location default environment before Weather is generated');
    assert.match(rendered['!aa-enviro'], /Current Environment=<strong>Busy stone quay<\/strong>/, 'Environment must use the same active Location default shown by Scene rather than a contradictory generic fallback');
    assert.match(rendered['!aa-enviro'], /Source=Using the active Location default/, 'Environment must disclose the active Location as its source when no Weather has been committed');

    assert.match(buttonTarget(rendered['!aa-gm'], 'Choose Advance'), /^!aa-time advance --days \?\{Days\|0\} --hours \?\{Hours\|0\} --minutes \?\{Minutes\|0\}$/, 'Session time advancement must retain all required deferred prompt values');
    assert.match(buttonTarget(rendered['!aa-astro'], 'Forecast'), /^!aa-astro forecast --days \?\{Days\|7\}$/, 'Astronomy forecast must retain its required deferred days prompt');
    assert.match(buttonTarget(rendered['!aa-weather'], 'Forecast'), /^!aa-weather forecast --days \?\{Days\|3\}$/, 'Weather forecast must retain its required deferred days prompt');
    const announceWithoutWeather = onePanel(harness, '!aa-weather announce');
    assert.match(announceWithoutWeather, /Generate or set current Weather before announcing conditions/, 'Weather announce must explain the missing prerequisite rather than strand the GM');
    assert.equal(buttonTarget(announceWithoutWeather, 'Generate Weather'), '!aa-weather generate', 'Weather announce recovery must offer direct generation');
    assert.match(buttonTarget(announceWithoutWeather, 'Set Manual Conditions'), /^!aa-weather manual --summary "\?\{Summary\|Custom Weather\}"/, 'Weather announce recovery must offer the complete manual-condition route');
    assert.match(
        buttonTarget(rendered['!aa-weather'], 'Set Manual Conditions'),
        /^!aa-weather manual --summary "\?\{Summary\|Custom Weather\}" --temp \?\{Temperature F\|60\} --wind \?\{Wind mph\|5\} --precipitation "\?\{Precipitation\|None\}" --cloud "\?\{Cloud cover\|Partly cloudy\}" --visibility "\?\{Visibility\|Clear\}" --severity \?\{Severity \(0-5\)\|1\} --duration \?\{Duration \(fictional hours\)\|8\}$/,
        'Weather must expose a complete deferred manual-conditions prompt from its ordinary screen rather than requiring a hidden command'
    );
    assert.equal(buttonTarget(rendered['!aa-weather'], 'Recent Conditions'), '!aa-weather history', 'Weather must expose retained conditions from its ordinary screen');
    const climateRegions = onePanel(harness, '!aa-climate regions');
    assert.equal(buttonTarget(climateRegions, 'Fine Tune'), '!aa-climate region edit --id ember-coast-climate', 'Climate region Fine Tune must open a focused editor instead of submitting unrelated generic override values');
    const climateRegionEditor = onePanel(harness, '!aa-climate region edit --id ember-coast-climate');
    assert.match(climateRegionEditor, /Each button changes only the named value/, 'Climate region editing must disclose its single-field override boundary');
    assert.match(buttonTarget(climateRegionEditor, 'Temperature Adjustment'), /^!aa-climate region override --id ember-coast-climate --temp \?\{Temperature adjustment in degrees\|0\}$/, 'Climate region temperature editing must submit only its named field with a complete prompt');
    assert.match(buttonTarget(climateRegionEditor, 'Humidity'), /^!aa-climate region override --id ember-coast-climate --humidity \?\{Humidity percent\|70\}$/, 'Climate region humidity editing must default from the actual baseline instead of a destructive generic value');
    assert.match(rendered['!aa-astro'], /sunrise near 7:30 AM, sunset near 4:30 PM/, 'Astronomy must present local clock labels rather than unexplained fractional-hour values');
    assert.doesNotMatch(rendered['!aa-astro'], /sunrise 7\.5|sunset 16\.5/, 'Astronomy must not expose raw 24-hour fractional-clock internals');

    const weatherResult = onePanel(harness, '!aa-weather generate');
    assert.match(weatherResult, /Current=/, 'Generate Weather must provide a visible current-weather result');
    const travelReview = onePanel(harness, '!aa-travel plan --destination to-mosswood-crossing');
    assert.match(travelReview, /Review Start/, 'starter Travel must produce a reviewed start panel rather than a hidden command failure');
    const presetPreview = onePanel(harness, '!aa-presets preview --id ember-arrival');
    assert.match(presetPreview, /Session Preset Preview/, 'starter Session Presets must open a visible preview path');
    assert.match(presetPreview, /Climate: Ember Coast via Location: Harbor Stead/, 'prepared Session Preset previews must disclose the same resolved local Climate source used by Scene and Weather');
}

function assertLocationClimateKeepsClimateAndWeatherCoherent() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');
    const climateEvents = [];
    const subscription = harness.sandbox.GameAssist.AlmanacAssist.observe(event => climateEvents.push(event), {
        owner: 'StarterWorldClimateContextTest',
        types: ['almanac.climate.changed']
    });
    assert.equal(subscription.ok, true, 'a consumer must be able to observe bounded effective-Climate events');

    const movedToMosswood = onePanel(harness, '!aa-location use --id mosswood-crossing');
    const locationClimateEvent = climateEvents.at(-1);
    assert.equal(locationClimateEvent.payload.current.regionId, 'ember-wood-climate', 'a Location change Climate event must expose the newly effective Scene baseline');
    assert.equal(locationClimateEvent.payload.details.currentSceneClimateScope, 'location', 'a Location change Climate event must identify local precedence rather than imply a fallback rewrite');
    assert.equal(locationClimateEvent.payload.details.campaignFallbackRegionId, 'ember-coast-climate', 'a Location change Climate event must retain the separately configured campaign fallback for integrations');
    assert.match(movedToMosswood, /Climate Context=Mosswood Interior — Temperate via Location: Mosswood Crossing/, 'a Location change must visibly identify the newly active Climate context while retaining Weather ownership');
    const climateAtMosswood = onePanel(harness, '!aa-climate');
    assert.match(climateAtMosswood, /Current Region=Mosswood Interior - Temperate/, 'Climate must resolve the active Location climate rather than silently showing the unrelated campaign fallback');
    assert.match(climateAtMosswood, /Location: Mosswood Crossing selects the current Scene baseline/, 'Climate must explain why the active Location takes precedence over the campaign fallback');
    assert.match(climateAtMosswood, /Campaign Fallback Region/, 'Climate must keep the separate fallback selector visible without pretending it changed the active Location');
    onePanel(harness, '!aa-climate region use --id ember-coast-climate');
    const fallbackClimateEvent = climateEvents.at(-1);
    assert.equal(fallbackClimateEvent.payload.details.action, 'campaign-fallback-region-selected', 'selecting a Climate region from a local Scene must disclose that it changes the campaign fallback only');
    assert.equal(fallbackClimateEvent.payload.current.regionId, 'ember-wood-climate', 'a campaign fallback event must preserve the effective local Scene baseline for integrations');
    assert.equal(fallbackClimateEvent.payload.details.campaignFallbackRegionId, 'ember-coast-climate', 'a campaign fallback event must identify the selected fallback separately');
    const mosswoodScene = onePanel(harness, '!aa-scene');
    assert.match(mosswoodScene, /Climate Baseline=Mosswood Interior — Temperate seasonal baseline/, 'Current Scene must visibly show the active Location Climate baseline alongside Weather rather than hiding that context');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getClimate().regionId, 'ember-wood-climate', 'the public default Climate getter must agree with the active Location Scene baseline');
    const statusAtMosswood = onePanel(harness, '!Almanac-Status');
    assert.match(statusAtMosswood, /Current Context=Mosswood Interior \| No committed weather/, 'Status must report the active Location Climate rather than the unrelated campaign fallback');

    const mosswoodWeather = onePanel(harness, '!aa-weather generate');
    assert.match(mosswoodWeather, /Context=Mosswood Interior \| Winter \| ClimateAlmanac — Location: Mosswood Crossing/, 'new Weather must generate against the active Location climate baseline');
    assert.equal(worldState(harness).runtime.weather.current.regionId, 'ember-wood-climate', 'generated Weather must retain the active Location climate provenance');

    const manualMosswoodWeather = onePanel(harness, '!aa-weather manual --summary "Cold river mist" --temp 37 --wind 4 --precipitation Mist --cloud Low --visibility Reduced --severity 2 --duration 6');
    assert.match(manualMosswoodWeather, /Current=Cold river mist \| 37 F \| 4 mph wind/, 'manual Weather must return a visible committed condition');
    assert.match(manualMosswoodWeather, /Context=Mosswood Interior \| Winter \| GM manual weather — Location: Mosswood Crossing/, 'manual Weather must use the same active Location Climate provenance as generated Weather');
    assert.equal(worldState(harness).runtime.weather.current.regionId, 'ember-wood-climate', 'manual Weather must record the active Location climate region without rewriting Climate configuration');
    assert.equal(worldState(harness).runtime.weather.current.source, 'Manual', 'manual Weather must retain its distinct provider provenance');
    const weatherHistory = onePanel(harness, '!aa-weather history');
    assert.match(weatherHistory, /Cold river mist/, 'Recent Conditions must expose committed manual Weather without a hidden audit command');

    onePanel(harness, '!aa-location use --id harbor-stead');
    const retainedWeather = onePanel(harness, '!aa-weather');
    assert.match(retainedWeather, /Location Climate=Current Weather was recorded for Mosswood Interior\. The active Scene now uses Ember Coast/, 'changing Location must transparently retain prior Weather instead of silently relabeling it as the new climate');
    assert.match(retainedWeather, /Generate or Set Manual Conditions when ready/, 'a retained Weather mismatch must offer both ordinary replacement paths');
    const sceneTechnical = onePanel(harness, '!aa-scene technical');
    assert.match(sceneTechnical, /Current Weather was recorded for Mosswood Interior while the active Scene uses Climate region Ember Coast/, 'Scene technical evidence must report retained Weather/active-Climate mismatch until the GM chooses a new Weather result');

    const harborWeather = onePanel(harness, '!aa-weather generate');
    assert.match(harborWeather, /Context=Ember Coast \| Winter \| ClimateAlmanac — Location: Harbor Stead/, 'generating after a Location switch must use the newly active Location climate');
    assert.equal(worldState(harness).runtime.weather.current.regionId, 'ember-coast-climate', 'new Weather must replace only the Weather provider with the new Location climate provenance');
    subscription.unsubscribe();
}

function assertClimateInheritanceAndCampaignFallback() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');
    onePanel(harness, '!aa-location use --id mosswood-crossing');

    const blockedClimateRemoval = onePanel(harness, '!aa-climate region remove --id ember-wood-climate --confirm yes');
    assert.match(blockedClimateRemoval, /Climate Region Is In Use/, 'Climate must refuse to remove a region still selected by a Location or Ecoregion');
    assert.match(blockedClimateRemoval, /Location: Mosswood Crossing/, 'a blocked Climate removal must link to the controlling named Worldbuilding relation');
    assert.ok(worldState(harness).config.climate.regions.some(region => region.id === 'ember-wood-climate'), 'a blocked Climate removal must preserve the in-use region and Scene context');

    const locationEditor = onePanel(harness, '!aa-world edit location --id mosswood-crossing');
    const locationClimateSelector = buttonTarget(locationEditor, 'Set Climate Region');
    assert.match(locationClimateSelector, /\?\{Set Climate Region\|Current: Mosswood Interior,ember-wood-climate\|None,none\|Ember Coast,ember-coast-climate\}/, 'the ordinary Location editor must offer a visible None choice and named Climate regions');
    onePanel(harness, '!aa-world set location --id mosswood-crossing --field climateRegionId --value none');
    onePanel(harness, '!aa-world set ecoregion --id ember-coast-ecoregion --field climateRegionId --value ember-wood-climate');

    const ecoregionClimate = onePanel(harness, '!aa-climate');
    assert.match(ecoregionClimate, /Current Region=Mosswood Interior - Temperate/, 'an active Location without a direct Climate assignment must inherit its Ecoregion Climate');
    assert.match(ecoregionClimate, /Why This Region=Ecoregion: Shorewood Fringe selects the current Scene baseline/, 'Climate must disclose Ecoregion inheritance rather than present it as a hidden campaign fallback');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getClimate().regionId, 'ember-wood-climate', 'the public default Climate getter must honor Ecoregion inheritance');

    const ecoregionManualWeather = onePanel(harness, '!aa-weather manual --summary "Woodland haze" --temp 51 --wind 3 --precipitation Mist --cloud Low --visibility Reduced --severity 1 --duration 4');
    assert.match(ecoregionManualWeather, /Context=Mosswood Interior \| Winter \| GM manual weather — Ecoregion: Shorewood Fringe/, 'manual Weather must retain Ecoregion Climate provenance when a Location has no direct assignment');

    const ecoregionEditor = onePanel(harness, '!aa-world edit ecoregion --id ember-coast-ecoregion --layer detailed');
    const ecoregionClimateSelector = buttonTarget(ecoregionEditor, 'Set Climate Region');
    assert.match(ecoregionClimateSelector, /\?\{Set Climate Region\|Current: Mosswood Interior,ember-wood-climate\|None,none\|Ember Coast,ember-coast-climate\}/, 'the ordinary Ecoregion editor must offer the visible clear/inherit Climate selection');
    onePanel(harness, '!aa-world set ecoregion --id ember-coast-ecoregion --field climateRegionId --value none');

    const fallbackClimate = onePanel(harness, '!aa-climate');
    assert.match(fallbackClimate, /Current Region=Ember Coast - Coastal/, 'without Location or Ecoregion Climate assignments, Climate must use the configured campaign fallback');
    assert.match(fallbackClimate, /Why This Region=Campaign fallback region selects the current Scene baseline/, 'Climate must name campaign fallback provenance when no local relation exists');
    const fallbackScene = onePanel(harness, '!aa-scene');
    assert.match(fallbackScene, /Climate Baseline=Ember Coast — Coastal seasonal baseline via Campaign fallback region/, 'Scene must agree with Climate on the no-local-assignment campaign fallback');
    assert.equal(harness.sandbox.GameAssist.AlmanacAssist.getClimate().regionId, 'ember-coast-climate', 'the public default Climate getter must use campaign fallback only after local sources are absent');

    const fallbackManualWeather = onePanel(harness, '!aa-weather manual --summary "Coastal drizzle" --temp 45 --wind 16 --precipitation Rain --cloud Overcast --visibility Reduced --severity 2 --duration 5');
    assert.match(fallbackManualWeather, /Context=Ember Coast \| Winter \| GM manual weather — Campaign fallback region/, 'manual Weather must retain campaign-fallback provenance only when all local Climate assignments are absent');
}

function assertWorldSwitchPreservesCurrentCampaignContext() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');

    onePanel(harness, '!aa-world add location --name "Camp Ash"');
    assert.ok(worldState(harness).config.world.locations.some(location => location.name === 'Camp Ash'), 'the active starter world must remain editable through normal guided controls');

    installStarter(harness, 'sunward-expanse');
    const afterSunward = worldState(harness);
    assert.equal(afterSunward.config.world.activeLocationId, 'dawn-caravanserai', 'switching to another starter must change active world context');
    assert.deepEqual(
        Array.from(afterSunward.config.worldLibrary.worlds, entry => entry.id).sort(),
        ['ember-coast', 'sunward-expanse'],
        'starting another world must retain the prior starter as a saved switchable context'
    );

    const library = onePanel(harness, '!aa-world library');
    assert.match(library, /Switch Here/, 'World Library must surface saved world switch controls');
    onePanel(harness, '!aa-world switch --id ember-coast');

    const restored = worldState(harness);
    assert.equal(restored.config.world.activeLocationId, 'harbor-stead', 'switching back must restore the prior world active location');
    assert.ok(restored.config.world.locations.some(location => location.name === 'Camp Ash'), 'switching back must restore campaign edits made inside the prior world');
    assert.deepEqual(
        Array.from(restored.config.climate.regions, region => region.id).sort(),
        ['ember-coast-climate', 'ember-wood-climate'],
        'switching back must restore the prior world climate context rather than leaving the other world active'
    );
}

function assertGuidedReferencesAvoidRawIds() {
    const harness = createHarness();
    installStarter(harness, 'ember-coast');

    harness.sandbox.createObj('page', { _id: 'moonrise-page', name: 'Moonrise Landing' });
    const locationEditor = onePanel(harness, '!aa-world edit location --id harbor-stead');
    assert.match(locationEditor, /Assign Roll20 Page/, 'Location editing must offer a page-picker control');
    assert.match(locationEditor, /Use Current Player Page/, 'Location editing must offer a direct current-page assignment action');
    assert.match(locationEditor, /Moonrise Landing,moonrise-page/, 'Location page picker must include a visible named Roll20 page choice');
    assert.doesNotMatch(locationEditor, /\[Page ID\]/, 'Location editing must not make a GM type a hidden Roll20 page ID');
    const namedPageResult = onePanel(harness, '!aa-world set location --id harbor-stead --field pageId --value moonrise-page');
    assert.equal(worldState(harness).config.world.locations.find(location => location.id === 'harbor-stead').pageId, 'moonrise-page', 'a selected named Roll20 page must save through the ordinary setter');
    assert.match(namedPageResult, /Map: Moonrise Landing/, 'the setter result must visibly identify the assigned page rather than only hiding it inside the next query');
    const currentPageResult = onePanel(harness, '!aa-world set location --id harbor-stead --field pageId --value current');
    assert.equal(worldState(harness).config.world.locations.find(location => location.id === 'harbor-stead').pageId, 'page-1', 'Use Current Player Page must store Roll20\'s current player-page reference');
    assert.match(currentPageResult, /Map: Current Player Page/, 'the Current Player Page assignment result must be visible in the editor');
    const clearPageResult = onePanel(harness, '!aa-world set location --id harbor-stead --field pageId --value none');
    assert.equal(worldState(harness).config.world.locations.find(location => location.id === 'harbor-stead').pageId, '', 'No page assignment must clear an existing page reference');
    assert.match(clearPageResult, /Map: No Roll20 page assigned/, 'clearing an assignment must have a visible outcome');
    const climateResult = onePanel(harness, '!aa-world set location --id harbor-stead --field climateRegionId --value ember-wood-climate');
    assert.match(climateResult, /Climate: Mosswood Interior/, 'a selected Climate region must have a visible editor outcome');
    const rejectedPage = onePanel(harness, '!aa-world set location --id harbor-stead --field pageId --value not-a-page');
    assert.match(rejectedPage, /Choose a listed Roll20 page or use Current Player Page/, 'an unknown page reference must refuse safely with a usable recovery message');

    const presetEditor = onePanel(harness, '!aa-world edit preset --id ember-arrival --layer detailed');
    assert.match(presetEditor, /Add Overlay/, 'Preset editing must offer a named overlay choice rather than a comma-separated identifier prompt');
    assert.doesNotMatch(presetEditor, /\[Set Phenomena\]/, 'Preset editing must not ask a GM to type Phenomenon identifiers');
    assert.match(buttonTarget(presetEditor, 'Add Overlay'), /\?\{Add Prepared Phenomenon\|None,none\|Harbor Fog,ember-fog/, 'Preset overlay choices must be a complete named deferred query');
    onePanel(harness, '!aa-world set preset --id ember-arrival --field phenomenonIds --value ember-fog');
    assert.deepEqual(Array.from(worldState(harness).config.world.presets.find(preset => preset.id === 'ember-arrival').phenomenonIds), ['ember-fog'], 'a named preset overlay selection must save through the normal setter');
    const updatedPreset = onePanel(harness, '!aa-world edit preset --id ember-arrival --layer detailed');
    assert.match(updatedPreset, /Remove Harbor Fog/, 'a selected preset overlay must have a visible removal action');

    const packs = onePanel(harness, '!aa-worldpacks');
    assert.doesNotMatch(packs, /WorldPack Handout ID/, 'WorldPack entry must not demand a raw handout ID when no handout exists');
    assert.match(packs, /Create Blank Template/, 'WorldPack entry must provide an actionable no-handout path');

    const wayfarer = onePanel(harness, '!aa-wayfarer');
    assert.doesNotMatch(wayfarer, /Wayfarer Handout ID/, 'Wayfarer entry must not demand a raw handout ID when no handout exists');
    assert.match(wayfarer, /Export Editable Draft/, 'Wayfarer entry must retain its direct handout-creation path');

    harness.sandbox.createObj('handout', { _id: 'handout-world-notes', name: 'World Notes', notes: '' });
    const packsWithHandout = onePanel(harness, '!aa-worldpacks');
    assert.match(packsWithHandout, /Review Handout Import/, 'WorldPacks must offer an ordinary named-handout import action when handouts exist');
    assert.match(decodeNumericEntities(packsWithHandout), /Choose a WorldPack handout\|World Notes,handout-world-notes/, 'WorldPack import must use a visible named handout choice');
    const wayfarerWithHandout = onePanel(harness, '!aa-wayfarer');
    assert.match(decodeNumericEntities(wayfarerWithHandout), /Choose an editable calendar handout\|World Notes,handout-world-notes/, 'Wayfarer import must use a visible named handout choice');

    // Owned exports of the other format are known-invalid selections. Keep the
    // generic campaign handout available, but do not make a GM choose an
    // Almanac-owned WorldPack in a calendar picker (or vice versa).
    onePanel(harness, '!aa-worldpacks template');
    onePanel(harness, '!aa-worldpacks export --id ember-coast-export --name "Ember Coast Export" --version 1');
    onePanel(harness, '!aa-wayfarer export');
    const filteredWorldPackPicker = buttonTarget(onePanel(harness, '!aa-worldpacks'), 'Review Handout Import');
    assert.match(filteredWorldPackPicker, /World Notes,handout-world-notes/, 'WorldPack picker must retain ordinary campaign handouts');
    assert.match(filteredWorldPackPicker, /GameAssist Almanac WorldPack Template/, 'WorldPack picker must retain its own editable template');
    assert.doesNotMatch(filteredWorldPackPicker, /Wayfarer Calendar Export/, 'WorldPack picker must hide the known-incompatible owned Wayfarer export');
    const filteredWayfarerPicker = buttonTarget(onePanel(harness, '!aa-wayfarer'), 'Review Handout Import');
    assert.match(filteredWayfarerPicker, /World Notes,handout-world-notes/, 'Wayfarer picker must retain ordinary campaign handouts');
    assert.match(filteredWayfarerPicker, /Wayfarer Calendar Export/, 'Wayfarer picker must retain its own editable calendar export');
    assert.doesNotMatch(filteredWayfarerPicker, /WorldPack Template|Ember Coast Export/, 'Wayfarer picker must hide known-incompatible owned WorldPack handouts');
}

function assertExistingCampaignIsSavedBeforeSwitching() {
    const harness = createHarness();
    const almanac = worldState(harness);
    almanac.config.world = {
        schemaVersion: 4,
        revision: 0,
        regions: [{ id: 'legacy-region', name: 'Legacy Region' }],
        locations: [{ id: 'legacy-camp', name: 'Legacy Camp', regionId: 'legacy-region', modifiers: {} }],
        activeLocationId: 'legacy-camp',
        favoriteLocationIds: ['legacy-camp'],
        destinations: [], routes: [], geographies: [], ecoregions: [], biomes: [], phenomena: [], presets: [], rulesProfile: '2014'
    };

    installStarter(harness, 'ember-coast');
    const savedLegacy = worldState(harness).config.worldLibrary.worlds.find(entry => entry.origin === 'campaign');
    assert.ok(savedLegacy, 'switching a pre-library campaign world must save it instead of overwriting it');
    assert.equal(savedLegacy.snapshot.world.locations[0].name, 'Legacy Camp', 'the saved legacy world must retain its original location');

    onePanel(harness, `!aa-world switch --id ${savedLegacy.id}`);
    assert.equal(worldState(harness).config.world.activeLocationId, 'legacy-camp', 'a saved existing campaign world must be switchable back into active context');
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertFirstRunOnboardingAndPromptContract();
    assertStarterWorldCollectionIsUsable();
    assertOrdinaryRenderedButtonPromptContract();
    assertGeneratedValidationRecoveryPaths();
    assertWayfarerOptionalListsUseVisibleClearSentinels();
    assertStarterSessionScreensStayActionable();
    assertLocationClimateKeepsClimateAndWeatherCoherent();
    assertClimateInheritanceAndCampaignFallback();
    assertWorldSwitchPreservesCurrentCampaignContext();
    assertGuidedReferencesAvoidRawIds();
    assertExistingCampaignIsSavedBeforeSwitching();
    process.stdout.write('PASS: AlmanacAssist starter-world and prompt regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused evidence for generic built-in starter worlds, first-run guided controls, deferred prompt targets, and saved-world switching.
// Decision log:
//   CHOICE: inspect generated command targets after numeric-entity decoding — ALT: claim source strings alone prove prompt behavior; REJECTED: the live defect occurred at the rendered-button seam.
//   CHOICE: retain a separate focused live Roll20 pass — ALT: treat VM link inspection as final renderer proof; REJECTED: Roll20 remains the authority for final chat rendering and prompts.
// [GAMEASSIST_ALMANAC_STARTER_WORLDS_TEST:CHECKS] END
// ============================================================================
