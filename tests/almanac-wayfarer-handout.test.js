// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_ALMANAC_WAYFARER_HANDOUT_TEST"
//   project_version: "v2.0.0"
//   purpose: "Exercise the optional versioned editable Wayfarer handout export/import path, validation preview, stale guards, and atomic draft-only commit against the shipped executable."
//   order: ["artifact_identity","export","validation","preview","draft_only_commit","stale_guards","future_runtime","aliases"]
//   env:
//     required: ["NODE_RUNTIME"]
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never call a live Roll20 API or mutate a live campaign while testing."
//     - "Never assert local VM coverage is live Roll20 acceptance."
//   observability:
//     logs: "stdout"
//     metrics: []
//     spans: ["[GAMEASSIST_ALMANAC_WAYFARER_HANDOUT_TEST:CHECKS]"]
//   performance: { notes: "Bounded fresh isolated VM handout fixtures; no network or timer dependency." }
//   concurrency: { model: "single-process deterministic test", idempotency: "each run constructs fresh sandbox state" }
//   compatibility: { accepts: ["Node.js with vm support"], emits: "pass/fail stdout" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   canonical_tree: |
//     [GAMEASSIST_ALMANAC_WAYFARER_HANDOUT_TEST]/
//     └─ [GAMEASSIST_ALMANAC_WAYFARER_HANDOUT_TEST:CHECKS]
// --- prose banner ---
// This Node-only suite proves the optional advanced calendar handout is inert,
// bounded, review-first data. It can replace only the saved draft after stale
// revalidation; it never alters the active calendar or authoritative fictional time.

'use strict';

const assert = require('node:assert/strict');
const {
    createHarness,
    assertExecutableArtifactsAreIdentical
} = require('./almanac-gate0.test.js');

function exportEntry(harness) {
    const entry = harness.state.GameAssist.handouts.entries['AlmanacAssist:wayfarer-calendar-export'];
    assert.ok(entry?.id, 'Wayfarer export must use a stable owned handout entry');
    return entry;
}

function importGrantId(harness) {
    const grants = harness.state.GameAssist.AlmanacAssist.runtime.wayfarerImports.grants;
    const ids = Object.keys(grants);
    assert.equal(ids.length, 1, 'fixture must retain exactly one Wayfarer handout review grant');
    return ids[0];
}

function calendarDigest(almanac) {
    return JSON.stringify({
        active: almanac.config.wayfarer,
        profileId: almanac.config.profileId,
        time: almanac.runtime.time,
        world: almanac.config.world,
        providers: {
            climate: almanac.runtime.climate,
            astronomy: almanac.runtime.astronomy,
            weather: almanac.runtime.weather,
            environment: almanac.runtime.environment,
            rest: almanac.runtime.rest
        }
    });
}

function exportDraft(harness) {
    const response = harness.dispatchCommand('!aa-wayfarer export');
    assert.equal(response.length, 1, 'Wayfarer export must render one compact panel');
    assert.match(response[0].message, /Wayfarer Handout Export Ready/, 'export must identify its result');
    assert.doesNotMatch(response[0].message, /"schemaVersion"|&quot;schemaVersion&quot;/, 'normal export panel must link handout rather than dump raw JSON');
    const entry = exportEntry(harness);
    const handout = harness.sandbox.getObj('handout', entry.id);
    return { entry, handout, document: JSON.parse(handout.get('notes')) };
}

function assertExportAndValidation(harness) {
    const api = harness.sandbox.GameAssist.AlmanacAssist;
    const almanac = harness.state.GameAssist.AlmanacAssist;
    assert.equal(api.wayfarerHandoutSchemaVersion, 1, 'public API must disclose optional Wayfarer handout schema');
    const before = calendarDigest(almanac);
    const { handout, document } = exportDraft(harness);
    assert.equal(document.format, 'GameAssist.WayfarerCalendar', 'export must use versioned calendar handout format');
    assert.equal(document.schemaVersion, 1, 'export must identify handout schema');
    assert.ok(document.definition?.months?.length, 'export must retain editable definition data');
    assert.ok(document.startDate?.period, 'export must retain explicit starting date');
    assert.equal(calendarDigest(almanac), before, 'export must not change active calendar, time, providers, or draft');

    handout.set('notes', '<script>state.GameAssist = { compromised: true };</script>');
    const invalid = harness.dispatchCommand(`!aa-wayfarer import --handout ${handout.id}`);
    assert.equal(invalid.length, 1, 'malformed handout must return one warning panel');
    assert.match(invalid[0].message, /not valid JSON|Validation/i, 'malformed handout must be rejected before import');
    assert.match(invalid[0].message, /No text was executed/i, 'malformed handout path must state inert text safety');
    assert.equal(calendarDigest(almanac), before, 'malformed handout must not change active calendar, time, providers, or draft');

    handout.set('notes', JSON.stringify({ ...document, definition: { ...document.definition, unsupportedField: 'must not be dropped silently' } }));
    const unsupported = harness.dispatchCommand(`!aa-wayfarer import --handout ${handout.id}`);
    assert.equal(unsupported.length, 1, 'unknown versioned-schema field must return one validation panel');
    assert.match(unsupported[0].message, /Wayfarer definition field unsupportedField is not supported/i, 'unknown nested handout fields must be refused rather than silently normalized away');
    assert.equal(calendarDigest(almanac), before, 'unknown nested handout field must not change active calendar, time, providers, or draft');
}

function assertReviewedDraftOnlyImport(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const { handout, document } = exportDraft(harness);
    document.definition.name = 'Imported River Calendar';
    document.definition.weekdays = ['Riverday', 'Marketday', 'Townday'];
    document.definition.months = [
        { name: 'Floodrise', days: 30, season: 'Spring', skipWeekday: false },
        { name: 'Highwater', days: 30, season: 'Summer', skipWeekday: false }
    ];
    document.definition.intercalary = [];
    document.definition.holidays = [];
    document.definition.seasonRanges = [];
    document.definition.leapEvery = 0;
    document.definition.leapName = '';
    document.definition.leapAfterMonth = 0;
    document.definition.hoursPerDay = 20;
    document.definition.minutesPerHour = 60;
    document.startDate = { year: 1, period: 'Floodrise', day: 1, hour: 8, minute: 0 };
    handout.set('notes', JSON.stringify(document, null, 2));
    const activeBefore = calendarDigest(almanac);
    const draftBefore = JSON.stringify(almanac.config.wayfarerDraft);
    const review = harness.dispatchCommand(`!aa-wayfarer import --handout ${handout.id}`);
    assert.equal(review.length, 1, 'valid calendar handout must first render one preview');
    assert.match(review[0].message, /Wayfarer Handout Import Preview/, 'valid handout must stop at explicit review');
    assert.match(review[0].message, /Imported River Calendar/, 'review must identify candidate calendar');
    assert.match(review[0].message, /Scope=.*Active calendar.*remain unchanged/i, 'review must disclose active-calendar boundary');
    assert.equal(JSON.stringify(almanac.config.wayfarerDraft), draftBefore, 'preview must not replace saved draft');
    assert.equal(calendarDigest(almanac), activeBefore, 'preview must not alter active calendar/time/providers');

    const commit = harness.dispatchCommand(`!aa-wayfarer import-confirm --grant ${importGrantId(harness)}`);
    assert.equal(commit.length, 1, 'confirmed Wayfarer import must render one result');
    assert.match(commit[0].message, /Wayfarer Draft Imported/, 'confirmation must identify draft-only result');
    assert.equal(almanac.config.wayfarerDraft.definition.name, 'Imported River Calendar', 'confirmed import must atomically replace only saved draft definition');
    assert.equal(almanac.config.wayfarerDraft.startDate.period, 'Floodrise', 'confirmed import must retain imported starting date');
    assert.ok(Object.values(almanac.config.wayfarerDraft.reviewed).every(value => value === false), 'imported draft must begin unreviewed for deliberate activation review');
    assert.equal(calendarDigest(almanac), activeBefore, 'draft-only import must not alter active calendar, time, Worldbuilding, or providers');
}

function assertStaleGuards(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    const { handout, document } = exportDraft(harness);
    const review = harness.dispatchCommand(`!aa-wayfarer import --handout ${handout.id}`);
    assert.equal(review.length, 1, 'handout import must enter review before stale test');
    const grant = importGrantId(harness);
    document.definition.name = 'Changed After Review';
    handout.set('notes', JSON.stringify(document, null, 2));
    const staleHandout = harness.dispatchCommand(`!aa-wayfarer import-confirm --grant ${grant}`);
    assert.equal(staleHandout.length, 1, 'changed handout confirmation must render one refusal');
    assert.match(staleHandout[0].message, /handout or saved draft changed after preview/i, 'edited handout must invalidate import review');

    // Re-export then change the saved draft through an ordinary direct editor before confirmation.
    const fresh = exportDraft(harness);
    const freshReview = harness.dispatchCommand(`!aa-wayfarer import --handout ${fresh.handout.id}`);
    assert.equal(freshReview.length, 1, 'fresh handout must enter review');
    const staleDraftGrant = importGrantId(harness);
    const changedDraft = harness.dispatchCommand('!aa-wayfarer name --value "Draft Changed Normally"');
    assert.equal(changedDraft.length, 1, 'ordinary Wayfarer editor must change draft during stale test');
    const staleDraft = harness.dispatchCommand(`!aa-wayfarer import-confirm --grant ${staleDraftGrant}`);
    assert.equal(staleDraft.length, 1, 'changed draft confirmation must render one refusal');
    assert.match(staleDraft[0].message, /handout or saved draft changed after preview/i, 'ordinary draft edit must invalidate import review');
    assert.equal(almanac.config.wayfarerDraft.definition.name, 'Draft Changed Normally', 'stale import must preserve ordinary post-review draft edit');
}

function assertFutureImportRuntimePreservation(harness) {
    const almanac = harness.state.GameAssist.AlmanacAssist;
    almanac.runtime.wayfarerImports = { schemaVersion: 99, opaqueFutureGrant: { preserve: true } };
    const before = JSON.stringify(almanac.runtime.wayfarerImports);
    const response = harness.dispatchCommand('!aa-wayfarer import --handout not-a-real-handout');
    assert.equal(response.length, 1, 'future Wayfarer import runtime must render one warning-only panel');
    assert.match(response[0].message, /runtime schema 99 is newer than this AlmanacAssist version/i, 'future Wayfarer import runtime must remain explicit');
    assert.equal(JSON.stringify(almanac.runtime.wayfarerImports), before, 'future Wayfarer import runtime must not be normalized, expired, or reinterpreted');
}

function assertAliases(harness) {
    ['!WAYFARER', '!aa-wayfarer', '!aa wayfarer'].forEach(command => {
        const response = harness.dispatchCommand(command);
        assert.equal(response.length, 1, `${command} must reach one Wayfarer panel`);
        assert.match(response[0].message, /Wayfarer Calendar/, `${command} must reach the calendar manager`);
    });
}

function run() {
    assertExecutableArtifactsAreIdentical();
    assertExportAndValidation(createHarness());
    assertReviewedDraftOnlyImport(createHarness());
    assertStaleGuards(createHarness());
    assertFutureImportRuntimePreservation(createHarness());
    assertAliases(createHarness());
    process.stdout.write('PASS: AlmanacAssist Wayfarer handout focused regression checks\n');
}

run();
// --- Notes & Comments ---
// Changed (v2.0.0): add focused evidence for the optional versioned Wayfarer handout export/edit/import path, inert parser, stale-preview protection, and atomic draft-only confirmation.
// Decision log:
//   CHOICE: import only into the inactive Wayfarer draft — ALT: activate imported calendar directly; REJECTED: calendar display activation and elapsed-time reconciliation need their existing explicit review path.
//   CHOICE: reset imported review flags — ALT: trust handout review state; REJECTED: external editable text must not bypass GM draft review before activation.
