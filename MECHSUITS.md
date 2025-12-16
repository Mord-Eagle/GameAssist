**MECHSUITS v1.5.2 — Human-Readable, Assistant-Ready Standard**

**[Mord Eagle Coding Hierarchy, Structure, Using Incrementally Tailored Sections]**

MECHSUITS exists to make code safe to change through clear structure, explicit contracts, and teaching commentary. Version 1.5.2 keeps the v1.5.x guarantees and adds hardening against over-literal assistant behavior: identifiers are **literal and owner-authoritative** (never “normalized” or “namespace-safed”), defaults are fallbacks used only when a value is absent, and “recommended” guidance must not be treated as an implicit MUST.

**Meta-note to AI assistants:** Treat this document as a single, unified contract. If you are asked to produce MECHSUITS-compliant output (framed section replacements, tag/canonical_tree edits, compliance judgments, or anything that asserts “MECHSUITS-compliant”), you MUST first verify the full requirement set—use Section 17 as the minimum checklist. Partial compliance is non-compliance. For small, purely informational questions that do not request compliant artifacts or compliance claims, you may consult only the relevant subsection(s), but you MUST not claim full compliance unless you performed the checklist verification.

RFC-2119 terms apply. Tags and structural tokens remain pure ASCII so they’re easy to see, grep, and reason about.

---

# 1) Purpose, posture, and what v1.5.2 changes

You and your assistants will keep the core MECHSUITS guarantees: every executable file opens with a banner and short plain-language paragraph; code is organized into framed sections that declare guarantees, dependencies, seams, risks, and observability; processing order is part of the public contract; inputs are validated and normalized at edges; envelopes are uniform; tunables live in POLICY; time, logs, metrics, spans, and security are disciplined and explicit.

Version 1.5.2 clarifies scope and strengthens long-term truthfulness while reducing “assistant overreach” failure modes:

• File-scoped canonical tree: the banner’s `canonical_tree` shows the hierarchy of sections that exist in this file only; it never reaches outside the file.  
• Canonical tree update discipline: `canonical_tree` MUST match the file’s actual section tags; if tags change, the tree MUST change in the same edit. Tree drift is non-compliance.  
• Identifier literalism (new in v1.5.2): if a value already exists (codename, tag, span name, metric name, error code, field name), it MUST be copied verbatim. Do not change case, add underscores, pluralize, “namespace-safe,” or otherwise invent variants.  
• Codename derivation for new files: a deterministic derivation algorithm exists as a fallback for files that lack a codename (Section 2). It is not a license to rewrite existing codenames.  
• Codename stability: once a file declares a codename, it MUST remain stable across renames and moves. Changing a codename is a MEANINGFUL change and MUST be explicitly logged (Section 12).  
• Proper nesting (no empty parents): if a child section exists, its parents MUST physically wrap it — children appear between the parent’s `BEGIN` and `END` lines; you must never “close” a parent and then declare its children elsewhere.  
• Non-overlap constraint: if two sections overlap in file ranges, one MUST be a strict ancestor of the other (tag path strict-prefix). Any other overlap is invalid.  
• No missing parents: every subsection has a present parent with header, narrative, and “Notes & Comments” footer, even if the parent has no code.  
• Required outro footers: every code-bearing section ends with a concise “Notes & Comments” block immediately before `END`. Wrapper parents (no code) still require a footer.  
• Whole-section replacement (required delivery): when supplying or updating code, return the entire section frame (`BEGIN…END`) so the owner can replace it wholesale; “replace these few lines” instructions are disallowed except under an explicitly declared snippet exception (Section 12).  
• Replacement granularity: you MAY replace only the specific framed section(s) whose code or contract changed; do not replace ancestors solely because they physically wrap the child.  
• Overall project revision is prominent: the file banner MUST include `project_version: "vX.Y.Z"` at banner-level prominence (easy to find immediately).  
• Per-section change tracking is required: every `mechsuit_section` includes `last_updated_version`, governed by the Meaningful Change Rule (Section 12).  
• Independent versions allowed: sections MAY include `independent_versions` under explicit keys; do not rename existing keys solely to fit an aesthetic (Section 4 + Section 12).  
• TypeScript-first examples: templates are in `.ts` with Node ESM; adapt for `.js` or non-commentable artifacts via sidecars.  
• Preserve existing comments on update: do not delete prior notes; lift them into the section footer under “Prior notes” and add new commentary above.  
• “Three patterns” is conditional: provide three alternatives only when real, consequential variation exists (and/or the user asked for options). Do not emit three by default as busywork.  
• Lifecycle / deprecation vocabulary: sections MAY declare lifecycle state to prevent “stale but intentional” from looking like neglect (Section 4).

---

# 2) Codename derivation, codename stability, and file-scoped canonical tree

**Identifier literalism (v1.5.2).** The codename is an owner-chosen, file-local identifier that appears in tags, span names, and grep workflows. If a file already declares `mechsuit.codename`, that exact string is authoritative and MUST be copied verbatim everywhere (banner, tags, `mechsuit_section.codename`, spans, docs). Do not “normalize” it, do not add/remove underscores, and do not change case.

**Codename character rules.** For machine-findability and greppability, codenames and tag tokens MUST be pure ASCII and MUST NOT contain whitespace. A single connected word like `GAMEASSIST` is valid. Underscores are allowed but not required.

**Codename derivation (fallback for new files only).** If you are generating a new file that lacks an existing codename AND the owner did not provide one, derive it from the project root folder and the file’s basename (without extension):

1) Take the project root folder name as `PROJECT`, and the file’s basename as `BASENAME`.  
2) Normalize each by replacing any non-alphanumeric run with a single underscore, trimming underscores at the ends, and collapsing repeats.  
3) Compose `{PROJECT}_{BASENAME}`. Uppercase is recommended for legibility and grep-ability, but not mandatory.

Examples:  
`Hawk/server.ts` → `HAWK_SERVER` (or `Hawk_SERVER` if you prefer mixed case) → tags like `[HAWK_SERVER:APP]`.  
`Falcon/main.ts` → `FALCON_MAIN` → tags like `[FALCON_MAIN:INTERFACES:CLI]`.  
Folder names beyond the project root are deliberately ignored; the filename carries its own meaning.

**Uniqueness is not enforced by assistants.** Do not modify a codename to make it “more unique” or “namespace-safe.” If a human wants to change it (rare), that is an explicit, MEANINGFUL decision.

**Codename stability (rename-safe).** Once a file declares a codename in its banner, that codename MUST remain stable across file renames and moves. Renaming a file does NOT imply codename change. If a codename must change (rare), it is a MEANINGFUL change and MUST be explicitly recorded in the relevant section footer(s) and in the file banner prose (see Section 12). Where tags/spans/log fields embed the codename, document search/grep guidance in the “Notes & Comments” of the nearest wrapper section.

**File-scoped tree.** The banner’s `canonical_tree` is file-scoped; it MUST mirror only the sections present in this file’s content. It never introduces paths outside `[CODENAME:*]`. Use it as a quick visual index for readers.

**Canonical tree update discipline.** `canonical_tree` MUST match the file’s actual section tags (paths and nesting). If you add, remove, or rename a section tag, you MUST update `canonical_tree` in the same change. If `canonical_tree` disagrees with the actual tags, the file is non-compliant. Mechanical changes that do not change tags do not require tree edits.

---

# 3) File banner (v1.5.2) and prose paragraph

Place the banner at the very top of the file, inside comments, followed immediately by one short paragraph that restates the guarantee, declared order, the overall `project_version`, secrets needed (names only), and at least one explicit refusal. The codename is a literal identifier: copy it verbatim everywhere; do not normalize it. Include `refusals` in the banner as a machine-findable list; the prose paragraph still MUST contain at least one refusal sentence to remain human-readable.

Use the TypeScript-style comment wrapper below even when the file is not TypeScript; adapt comment syntax as needed.

```ts
// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "HAWK_SERVER"                   # stable once set; copy verbatim; do not normalize; do not change on rename
//   project_version: "vX.Y.Z"                 # overall project/script revision; must be easy to find immediately
//   purpose: "One paragraph stating the guarantee and the non-goals."
//   order: ["validate","normalize","handlers","static","fallback"]   # adapt to the surface
//   env:
//     required: ["PORT"]
//     optional: ["HOST"]
//     secrets: ["DB_URL"]                      # names only; never show values
//   data_class: "Internal"                     # Public | Internal | Confidential | Restricted
//   ai_data: "internal_redacted"               # none | internal_redacted | restricted_disallowed
//   refusals:                                  # machine-findable; prose paragraph must also include at least one refusal sentence
//     - "Never log secrets or raw credentials."
//     - "Never emit Restricted data to external model providers."
//   observability:
//     logs: "json"
//     metrics: [{ name: "app.http.request.duration_ms", unit: "ms" }]
//     spans: ["[HAWK_SERVER:APP:CONFIG]","[HAWK_SERVER:INTERFACES:HTTP:EXAMPLES]"]
//   performance: { throughput_rps: 100, latency_p99_ms: 150 }
//   concurrency: { idempotency: "header: Idempotency-Key for POST /api/*", model: "optimistic" }
//   compatibility: { accepts: ["v1","v2"], emits: "v2" }
//   policy: { notes_ref: "[HAWK_SERVER:POLICY]" }     # POLICY carries last_updated_version and optional independent_versions
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   transport_map:
//     http: { "INVALID_ARGUMENT": 400, "NOT_FOUND": 404, "CONFLICT": 409, "UNPROCESSABLE": 422, "RATE_LIMITED": 429, "TIMEOUT": 504, "UNAVAILABLE": 503, "INTERNAL": 500 }
//     grpc: { "INVALID_ARGUMENT": "INVALID_ARGUMENT", "CONFLICT": "ABORTED", "UNAVAILABLE": "UNAVAILABLE", "TIMEOUT": "DEADLINE_EXCEEDED", "INTERNAL": "INTERNAL" }
//     graphql: "HTTP 200; errors[] includes code and meta.traceId; success data in data"
//   canonical_tree: |
//     [HAWK_SERVER]/
//     ├─ [HAWK_SERVER:APP]
//     │  ├─ [HAWK_SERVER:APP:IMPORTS]
//     │  └─ [HAWK_SERVER:APP:UTILS]
//     │     └─ [HAWK_SERVER:APP:UTILS:ENVELOPE]
//     ├─ [HAWK_SERVER:DOMAIN]
//     ├─ [HAWK_SERVER:POLICY]
//     └─ [HAWK_SERVER:INTERFACES:HTTP:EXAMPLES]
// --- prose banner ---
// Restate the guarantee, the order, the project_version, secrets needed (names only), and at least one refusal in plain language.
```

---

# 4) Framed sections, proper nesting, non-overlap, never-missing parents, lifecycle, and required outro footers

Tags and structural tokens are pure ASCII so they’re easy to see, grep, and reason about. Use the exact form `[CODENAME:AREA(:SUB)*] BEGIN` and `[CODENAME:AREA(:SUB)*] END` on their own lines. Put the human title on the line after `BEGIN`, never inside the tag.

**Token grammar (v1.5.2).** `CODENAME` and each `AREA` segment MUST match `[A-Za-z0-9_]+` (ASCII letters/digits/underscore), and the tag MUST NOT contain whitespace. Case is owner-chosen and MUST be preserved exactly (no case-folding). Underscores are allowed but not required.

**Identifier literalism applies to tags.** If the file already uses `[GAMEASSIST:…]`, keep using it. Do not invent alternates like `[GAME_ASSIST:…]` or `[GAMEASSIST_GAMEASSIST:…]`.

**Proper nesting is mandatory.** If a child section exists, its parents MUST physically wrap it: the child’s `BEGIN…END` MUST appear between the parent’s `BEGIN` and `END`. You MUST never close a parent and then declare its children elsewhere — that produces an “empty parent” and violates the hierarchy contract.

Example (shape only; headers/footers omitted for brevity here, but required in real code):

```
[STATUSINFO:INTERFACES] BEGIN
[STATUSINFO:INTERFACES:CHAT] BEGIN
[STATUSINFO:INTERFACES:CHAT] END
[STATUSINFO:INTERFACES:EVENTS] BEGIN
[STATUSINFO:INTERFACES:EVENTS] END
[STATUSINFO:INTERFACES] END
```

**Non-overlap constraint.** Sections must not overlap in file ranges unless one is a strict ancestor of the other. Concretely: if two section ranges overlap, one tag path MUST be a strict prefix of the other (ancestor/descendant). Any other overlap (including sibling interleaving) is invalid.

**No missing parents.** Every `[CODENAME:AREA:SECTION:SUBSECTION]` MUST have a present parent `[CODENAME:AREA:SECTION]` (and all ancestors up to the root area), even if the parent contains only header, narrative, and footer with no code body. Wrapper parents with no code MUST still explain scope, responsibilities, and what the children cover.

**Lifecycle and deprecation (optional but supported).** Sections MAY declare lifecycle state via `lifecycle: "active" | "deprecated" | "frozen"`. If `deprecated`, include a `deprecation` object indicating `since`, `replacement`, and (optionally) `removal_target`. If `frozen`, state the reason (e.g., regulatory, vendor lock) and what changes are allowed.

**Per-section metadata is required.** Every section MUST include a `mechsuit_section` block whose `codename` equals the file banner codename and whose `area` equals the tag path (without codename). Every `mechsuit_section` block MUST include `last_updated_version: "vX.Y.Z"` and MAY include `independent_versions` (see below).

**Independent versions (optional, explicit, non-confusable).** If a section needs additional version signals (schema, state format, protocol), include them under `independent_versions`. When *introducing new keys*, prefer explicit snake_case names that end with `_version` (or use a pre-defined compatibility key already established in your codebase, such as `api_accepts` / `api_emits`). **Do not rename existing keys** just to satisfy a suffix or case style; treat renames as MEANINGFUL and owner-authoritative.

Values MUST be either integers (migration counters) or strings that are clearly scoped (e.g., "schema-v1.2.3" or "2025-12-01"). A bare field named `version` remains disallowed in sections because it is too easy to confuse with project revision.

**Required outro footers.** Every code-bearing section MUST end, immediately before `END`, with a concise “Notes & Comments” footer. Wrapper parents (no code) MUST still include a “Notes & Comments” footer. For significant choices, include a “Decision Log” list. For updates, lift prior commentary into a “Prior notes” subsection rather than deleting it.

Use this exact framing and spacing when feasible (canonical example, generalized; all required fields present):

```ts
// ============================================================================
// [HAWK_SERVER:APP] BEGIN
// Section Title: App container (wrapper)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "APP",
//   title: "App container",
//   guarantees: ["Mount order declared here; children carry code."],
//   depends_on: ["[HAWK_SERVER:POLICY]","[HAWK_SERVER:OBS]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// A high-level description of APP scope and what IMPORTS/UTILS/children will provide.
// This wrapper owns the declared mount order contract and documents why the chosen attach pattern fits.
// -----------------------------------------------------------------------------

// ============================================================================
// ============================================================================
// [HAWK_SERVER:APP:IMPORTS] BEGIN
// Section Title: Runtime imports and singleton wiring
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "APP:IMPORTS",
//   title: "Imports",
//   guarantees: ["Single locus of runtime imports; no side effects beyond wiring."],
//   depends_on: ["[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Why imports are centralized; how this avoids duped loaders and circularities.
// -----------------------------------------------------------------------------
/* code … */
// --- Notes & Comments ---
// Changed (vX.Y.Z): centralize tracing import here; Trade-offs: slight startup cost; Why now: reduce circular init.
// Decision log:
//   CHOICE: centralize tracing init in one import locus — ALT: per-module init; REJECTED: double-init risk.
// [HAWK_SERVER:APP:IMPORTS] END
// ============================================================================

// ============================================================================
// ============================================================================
// [HAWK_SERVER:APP:UTILS] BEGIN
// Section Title: App utilities (envelopes, timing, CSV helpers)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "APP:UTILS",
//   title: "Utilities",
//   guarantees: ["Pure helpers; no IO."],
//   depends_on: ["[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The helpers exposed here are pure; envelope helpers are referenced by interfaces.
// -----------------------------------------------------------------------------

// ============================================================================
// [HAWK_SERVER:APP:UTILS:ENVELOPE] BEGIN
// Section Title: Uniform ok/err envelopes
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "APP:UTILS:ENVELOPE",
//   title: "Envelopes",
//   guarantees: ["Stable ok/err shape; meta.traceId present."],
//   depends_on: ["[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { schema_version: 3 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Success and failure envelope helpers; referenced by HTTP/CLI/GraphQL sections.
// -----------------------------------------------------------------------------
/* code … */
// --- Notes & Comments ---
// Decision log:
//   CHOICE: use simple POJO envelopes over subclassed Error — ALT: custom Error; REJECTED: serialization friction.
//   CHOICE: include meta.traceId in both ok and err — ALT: header-only; REJECTED: harder to diff payloads server/client.
// [HAWK_SERVER:APP:UTILS:ENVELOPE] END
// ============================================================================

// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): reorganized comments for clarity; no runtime changes.
// Prior notes:
//   vX.Y.(Z-1): utilities isolated to keep interfaces thin.
// [HAWK_SERVER:APP:UTILS] END
// ============================================================================

// --- Notes & Comments ---
// Parent wrapper; no direct code. Children enforce mount order and envelopes.
// [HAWK_SERVER:APP] END
// ============================================================================
```

---

# 5) Teaching commentary: docblocks, CHOICE/ALT, DANGER, inline “why”, and refusal discipline

Above validators, normalizers, and business rules, write tight docblocks that explain context, inputs, outputs, invariants, failure modes, edge cases, and the design reason.

When a line could plausibly be A or B (or C), annotate the line with a short CHOICE note explaining why A was selected and call out ALT options rejected. Where use of a construct is hazardous or non-obvious, precede it with a DANGER note that states the hazard and why the trade is still correct.

Refusals are a discipline, not just prose: refusals declared in the banner MUST be honored in code and tests (e.g., do not log secrets; do not emit Restricted data externally).

```ts
/**
 * normalizeX — Edge normalizer that emits canonical Xv2.
 * Context: legacy v1 accepted for compatibility; converted here.
 * Inputs: raw untrusted payload; may be null or malformed.
 * Outputs: canonical Xv2 or throws INVALID_ARGUMENT with field details.
 * Invariants: the core never branches on version or string sentinels after this point.
 * Failure: stable error codes only; never logs raw input or secrets.
 * Design: normalize at the edge so domain stays pure and testable.
 */
// CHOICE: prefer zod.parse over manual checks — ALT: manual if/throw; REJECTED: duplicated rules, higher drift risk.
// DANGER: trimming user strings here can mask intentional whitespace; acceptable per POLICY.csv.grooming = true.
```

---

# 6) Processing order is a contract (optimize over rigidity)

Declare the intended order in the banner and implement it. For servers, your default order remains: API handlers first, then static assets, then SPA fallback, then final error handler, then listeners. Optimization is the governing principle: deviate where measurable merits justify it and record the change in the relevant section footer with a one-line rationale.

Provide a minimal “order proof” for interface surfaces. Keep proofs small and focused (≈10–20 lines): assert that `/api/*` is not intercepted by the SPA fallback; assert first and last handlers by name, not by content. If a proof would be longer than that, summarize the logic in the section footer and reference an external test file by path.

**Three compliant attach patterns (examples, choose by context):**

Note (v1.5.2): the “three patterns” teaching model is for situations with real, consequential variation. In assistant responses, do not output three options by default; output one recommended approach unless the user asked for options or the choice materially changes trade-offs.

Pattern A — Classic Express-style:

```ts
// API first
app.use("/api", apiRouter);
// Static next
app.use(express.static(staticDir));
// SPA fallback third
app.get("*", spaHandler);
// Error handler fourth (last before listeners)
app.use(finalErrorHandler);
// Listener last
app.listen(port);
```

Pattern B — Static on a sub-path with API and SPA sharing root:

```ts
app.use("/assets", express.static(staticDir));           // static on a side path
app.use("/api", apiRouter);                               // api first under root
app.get("/*", spaHandler);                                // catch-all for client routes
app.use(finalErrorHandler);
server.listen(port);
```

Pattern C — Reverse proxy front, app focuses on API and errors:

```ts
app.use("/api", apiRouter);                 // only API mounted here
app.use(finalErrorHandler);                 // error mapping stays local
// Static and SPA are served by CDN/proxy; record that in [CODENAME:INTERFACES:SERVERS:STATIC] footer.
```

Record the chosen pattern and its rationale in the relevant footers.

---

# 7) Uniform envelopes and transport rules

Success is `{ ok: true, data, meta: { traceId } }`. Failure is `{ ok: false, error: "UPPER_SNAKE", data?, meta: { traceId } }`. Keep the code set small and stable for operational sanity: `INVALID_ARGUMENT, NOT_FOUND, CONFLICT, UNAUTHORIZED, FORBIDDEN, UNPROCESSABLE, RATE_LIMITED, TIMEOUT, UNAVAILABLE, INTERNAL`. Map codes to transports exactly as declared in the banner.

HTTP: GET endpoints state stable pagination shape and limits; POST/PUT state idempotency and reflect it in semantics; authN/Z live at the edge; identity passed opaquely to the core.  
GraphQL: application errors return HTTP 200; `errors[]` includes `code` and `meta.traceId`; success data under `data`; mutations state idempotency.  
gRPC: map to canonical statuses as declared; propagate correlation (e.g., `grpc-trace-bin`) consistently.  
Events: verify `schemaVersion`, `idempotencyKey` if present, and `emittedAt` before deserialization; dedupe before domain apply; non-retriables go to dead letter with the same failure envelope; state partitioning and ordering guarantees in narrative and honor them in code.  
CLI: stdout for data, stderr for diagnostics; exit 0 on success, 2 on usage, 1 on unexpected faults; with a machine flag, print uniform envelopes on stdout.

**Helper location.** Define `ok()` and `err()` once per file (for example in `[CODENAME:APP:UTILS:ENVELOPE]`) and reference them from interface sections. Do not redefine per section unless language constraints require it.

---

# 8) Policy governance and magic numbers

Keep tunables in `[CODENAME:POLICY]` and treat that section as the single source of truth for behavioral “knobs.” Change tracking is aligned to the project revision and governed by the Meaningful Change Rule (Section 12): if a knob’s meaning or default changes, that is MEANINGFUL and MUST update `last_updated_version` and record “Changed …” in the footer.

Time knobs tie to timing seams; size knobs tie to performance budgets. When behavior changes, record old value → new value, rationale, and rollback in the section footer. Outside `[POLICY]`, avoid magic numbers. If a temporary inline constant is unavoidable, precede it with `// EXEMPT: <one-line rationale>` and schedule its removal in the footer.

Template:

```ts
// ============================================================================
// [HAWK_SERVER:POLICY] BEGIN
// Section Title: Tunables (rationales inline; change tracking via last_updated_version)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "POLICY",
//   title: "Tunables",
//   guarantees: ["No magic numbers elsewhere; callers import from here."],
//   provides: ["POLICY"],
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { policy_schema_version: 3 },
//   lifecycle: "active",
//   notes: "Update last_updated_version on MEANINGFUL changes; use Maintenance footer lines otherwise."
// }
// -----------------------------------------------------------------------------
// Narrative
// Numbers with reasons. Time knobs tie to timing seams; size knobs tie to budgets.
// -----------------------------------------------------------------------------
export const POLICY = {
  timeoutsMs: { http: 10000, db: 5000, external: 3000 }, // CHOICE: 10s HTTP to keep p99 <150ms @ 100 rps; ALT: 8s; REJECTED: upstream flaps.
  pagination: { defaultSize: 100, maxSize: 1000 },
  retry: { maxAttempts: 3, backoffStartMs: 200, jitter: true },
  csv: { filenamePrefix: "export", maxRows: 100000 }
} as const;
// --- Notes & Comments ---
// Changed (vX.Y.Z): retry.backoffStartMs 250→200; Rationale: flatten head-of-line delay; Rollback: restore 250.
// [HAWK_SERVER:POLICY] END
// ============================================================================
```

---

# 9) Observability discipline (names, attach points by principle, and three patterns)

Logs are compact structured JSON with RFC-3339 UTC timestamp, level, emitting section tag, message, correlation identifiers, and safe domain identifiers. Metric names include units and use dot.case (`app.http.request.duration_ms`). Keep labels to a small reserved set (env, region, codename, section) to control cardinality. Span names mirror section tags and begin at section boundaries. Declare intended metric and span names in the banner and actually emit them where relevant.

Attach points vary by architecture; choose the best fit and document it.

Note (v1.5.2): the three patterns below are teaching examples. Do not create artificial instrumentation or duplicate patterns just to “show three”; pick the best fit and record the rationale.

Pattern A — Middleware attach in app config:

```ts
// [HAWK_SERVER:APP:CONFIG] …
// CHOICE: attach tracing before routers to include all handlers — ALT: per-route; REJECTED: inconsistent spans.
app.use(traceMiddleware);
```

Pattern B — Per-server attach:

```ts
// [HAWK_SERVER:INTERFACES:SERVERS:HTTP] …
httpServer.on("request", traceOnRequest);
```

Pattern C — Proxy-side attach with app-side correlation only:

```ts
// [HAWK_SERVER:OBS:LOGGER] …
logger.with({ traceId: req.header("X-Trace-Id") || gen() });
```

Record which pattern you used and why in the relevant footer.

---

# 10) Time rigor

Expose a clock seam with `now()` for wall-clock stamps and `monotonic()` for durations and timeouts. Machine timestamps are RFC-3339 in UTC. Human-facing exports print local time with an ASCII numeric offset (for example `2025-08-20 11:27:56 -0400`). CSV follows RFC-4180; filenames follow RFC-5987. When relevant, include a `TIMING` section describing drift and NTP assumptions and scheduler behavior across daylight-saving transitions.

---

# 11) Ports and adapters

Put canonical types and ports in `DOMAIN`; adapters live under `INTERFACES:*`. Ports describe shapes, ordering and pagination guarantees, timeout behavior, and surfaced errors, without importing adapters. Adapters bind transports to ports. Keep ports pure and dependency-free; keep adapters thin and explicit about error mapping.

Template:

```ts
// ============================================================================
// [HAWK_SERVER:DOMAIN] BEGIN
// Section Title: Canonical shapes and ports (no I/O)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "DOMAIN",
//   title: "Types & ports",
//   guarantees: ["Pure rules; canonical types only; no vendor types leak in."],
//   provides: ["Example","ExampleRepo"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Canonical types the core trusts. Ports state capabilities and failure modes without binding to adapters.
// -----------------------------------------------------------------------------
export interface Example { id: string; name: string; }
export interface ExampleRepo {
  /** saveIfAbsent — idempotent create; returns existing on duplicate; safe under retries. */
  saveIfAbsent(x: Example): Promise<{ created: boolean; item: Example }>;
  /** list — stable pagination ordered by createdAt then id; prevents dup/omit across pages. */
  list(opts: { limit: number; cursor?: string }): Promise<{ items: Example[]; next?: string }>;
}
// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): docblocks clarified; no contract or type changes.
// [HAWK_SERVER:DOMAIN] END
// ============================================================================
```

---

# 12) Updating code: whole-section replacement, replacement granularity, Meaningful Change Rule, rare snippet exceptions, preserving commentary, and version semantics
**Non-invasive compliance (v1.5.2).** MECHSUITS compliance is not a license to rename identifiers, reformat code, or “clean up” unrelated structure. Preserve existing codenames, tags, span/metric names, error codes, and public symbols verbatim unless the user explicitly asked for a rename or correctness/safety requires it. If you believe a rename is required for compliance, stop and surface it as an explicit decision with trade-offs.

**Whole-section replacement is the required delivery method.** When providing code in reviews or generations, return the complete framed section(s) that must change — from `[CODENAME:…] BEGIN` through `[CODENAME:…] END`, including the header, `mechsuit_section` block, narrative, and the required “Notes & Comments” footer — so the owner can replace it wholesale.

Do not provide “replace these few lines” instructions except under an explicitly declared snippet exception.

**Replacement granularity (avoid unnecessary blast radius).** You MAY replace only the specific framed section(s) that change (often leaf sections). You MUST also replace any ancestor section whose declared contract, guarantees, narrative, order, risks, or observability claims become inaccurate due to the change. If no ancestor declarations become inaccurate, do not replace ancestors solely because they physically wrap the child.

**Meaningful Change Rule (RFC-2119).**

```ts
// Meaningful change rule (RFC-2119)
//
// A change to a section is MEANINGFUL if it changes any observable behavior, contract, or operational profile
// that a reasonable consumer (human, test, dependent section, operator) could detect.
//
// If MEANINGFUL, you MUST:
// (1) set mechsuit_section.last_updated_version = mechsuit.project_version
// (2) record "Changed (vX.Y.Z): ..." in the section footer with rationale + trade-offs as needed
//
// If NOT meaningful, you MUST:
// (1) leave last_updated_version unchanged
// (2) record "Maintenance (vX.Y.Z, no semantic change): ..." in the section footer
//
// "Meaningful" includes (non-exhaustive):
// - Public surface / contract changes: exported symbols, types, input validation rules, normalization rules,
//   envelope shape, error codes, status mapping, schema acceptance/emission, ordering guarantees.
// - Behavioral changes: different side effects, different branching, different defaults, different retries,
//   different timeouts, different caching headers, different idempotency semantics.
// - Operational changes: logging fields/levels, metric names/labels, span boundaries/names, sampling behavior,
//   redaction logic, security posture, secret-handling.
// - Performance / resource semantics: asymptotic changes, new hot-path allocations, concurrency model changes,
//   backpressure behavior, pagination limits that alter load characteristics.
// - Dependency meaning: swapping a dependency in a way that changes behavior guarantees (even if API-compatible).
// - Execution-order / timing semantics: changes that alter evaluation order, error timing, or side-effect ordering
//   in a way a consumer/operator could observe.
//
// Not meaningful (examples):
// - Comment-only edits, narrative grammar/typos.
// - Mechanical formatting (lint/prettier) with no code movement that changes execution order.
// - Pure refactors that are provably behavior-preserving and do not alter contracts or observability semantics.
//
// If in doubt, treat as MEANINGFUL.
```

Three concrete examples to illustrate the boundary:

Example 1 (not meaningful): You rewrite a section’s narrative paragraph for clarity and fix a typo in a docblock. `last_updated_version` stays as-is, and the footer adds: `Maintenance (v2.4.1, no semantic change): narrative tightened; typo fix.`

Example 2 (usually not meaningful): You refactor an internal helper from an inline function to a named function, keeping inputs/outputs identical, preserving ordering, and not touching logs/metrics/spans. `last_updated_version` stays as-is, and you record the maintenance note. If the refactor changes evaluation order or error timing, it becomes meaningful.

Example 3 (meaningful): You change `POLICY.timeoutsMs.http` or alter zod validation rules. That changes behavior/contract, so you MUST set `last_updated_version` to the current `project_version` and record: `Changed (v2.5.0): http timeout 10s→8s; rationale; rollback.`

**Preserve existing commentary.** When you update a section, you MUST preserve existing commentary unless it is clearly deprecated or wrong. Lift prior notes into the footer under “Prior notes” and put your new “Notes & Comments” above them. Do not silently delete institutional memory.

**Independent versions (optional) do not replace last_updated_version.** If you include `independent_versions`, they are additive metadata only. They MUST never be used as a proxy for meaningful freshness. `last_updated_version` is the only required per-section freshness marker and is governed by the Meaningful Change Rule.

**Snippet exceptions (rare) are allowed only for:**

* One-line safety hotfixes that change no structure.
* Single-value POLICY tweaks.
* Minor grammar/typo fixes in narratives or comments.

When you invoke a snippet exception, state explicitly: “Snippet exception invoked” and why it qualifies. Snippet exceptions MUST NOT violate proper nesting, MUST NOT create missing parents, and MUST NOT introduce canonical-tree drift (if a snippet changes tags, it is not eligible for snippet exception).

---

# 13) Non-commentable artifacts, generated code, vendored blobs, and one-off code: sidecars

Some artifacts do not permit comments (`package.json`) or are one-off scripts where embedding a full banner is impractical. In these cases, create a sidecar document adjacent to the artifact using a predictable path and name, for example `__mechsuit__/package.md` or `.mechsuit/package.md`. The sidecar carries the banner, canonical_tree (file-scoped), relevant section headers/footers, and the Decision Log. If the artifact is under 100 lines, include a copy of the code in the sidecar for context. Put a minimal pointer at the top of the artifact (if allowed) like `// see __mechsuit__/package.md`.

**Generated code and vendored blobs.** If a file is generated or vendored (OpenAPI clients, Prisma output, protobuf stubs, `dist/` artifacts), do not “wear a full mechsuit” inside the generated body unless the generator is under your control and intentionally emits the structure. Instead, do one of the following:

Option A (preferred): Sidecar-only MECHSUITS. Create a sidecar with the banner, canonical_tree, and decisions, and treat that sidecar as the authoritative MECHSUITS surface. Include:

* `source_of_truth: "<path or generator command>"`
* `regeneration: "<how to regen>"`
* `editing_refusal: "Do not edit generated output directly."`

Option B (minimal in-file pointer): If comments are allowed in the generated file header, add a minimal pointer banner line at the top: `// GENERATED — see __mechsuit__/... for decisions; do not edit.` Do not attempt to impose full section framing across the generated content.

Edits to generated output are MEANINGFUL only if they change the generated contract as consumed; otherwise they are typically disallowed and should be expressed as changes to the generator source-of-truth and recorded in the sidecar.

---

# 14) Transport-specific examples (TypeScript-first, fully compliant metadata)

HTTP interface (idempotent create/list):

```ts
// ============================================================================
// [HAWK_SERVER:INTERFACES:HTTP:EXAMPLES] BEGIN
// Section Title: HTTP — Example create/list (idempotent create)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "INTERFACES:HTTP:EXAMPLES",
//   title: "Example endpoints",
//   guarantees: ["POST is idempotent via Idempotency-Key; GET is stable-paginated."],
//   depends_on: ["[HAWK_SERVER:DOMAIN]","[HAWK_SERVER:POLICY]","[HAWK_SERVER:APP:UTILS:ENVELOPE]"],
//   observability: {
//     logs: "json",
//     metrics: [{ name: "app.examples.create.count", unit: "count" }],
//     spans: ["[HAWK_SERVER:INTERFACES:HTTP:EXAMPLES]"]
//   },
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active",
//   notes: "Uniform envelopes with meta.traceId; statuses mapped as declared in the banner."
// }
// -----------------------------------------------------------------------------
// Narrative
// Purpose, routes, validation at edge, envelope shape, accepted/emitted versions,
// idempotency, auth, cache, limits, and explicit refusal alignment (no secret logging).
// -----------------------------------------------------------------------------
/* routes using ok/err with meta.traceId… */
// --- Notes & Comments ---
// Changed (vX.Y.Z): add Idempotency-Key enforcement for POST; Trade-offs: storage cost for idempotency ledger; Rollback: disable ledger check.
// Order proof: /api/* not caught by SPA; Decision: cache-control: no-store for POST responses.
// [HAWK_SERVER:INTERFACES:HTTP:EXAMPLES] END
// ============================================================================
```

Static + fallback, error handler wiring by principle:

```ts
// ============================================================================
// [HAWK_SERVER:INTERFACES:SERVERS] BEGIN
// Section Title: Server wiring (wrapper)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "INTERFACES:SERVERS",
//   title: "Servers wrapper",
//   guarantees: ["Documents handler mount order and boundary between API/static/fallback/error."],
//   depends_on: ["[HAWK_SERVER:APP]","[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Wrapper that owns the server mount-order contract; children contain concrete middleware bindings.
// -----------------------------------------------------------------------------

// ============================================================================
// [HAWK_SERVER:INTERFACES:SERVERS:STATIC] BEGIN
// Section Title: Static assets delivery
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "INTERFACES:SERVERS:STATIC",
//   title: "Static",
//   guarantees: ["Serve assets with proper cache headers; never intercept /api/*."],
//   depends_on: ["[HAWK_SERVER:APP:CONFIG]","[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Serve assets with proper cache headers; never intercept /api/*.
// -----------------------------------------------------------------------------
/* static middleware… */
// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): comment clarity and import ordering.
// [HAWK_SERVER:INTERFACES:SERVERS:STATIC] END
// ============================================================================

// ============================================================================
// [HAWK_SERVER:INTERFACES:SERVERS:FALLBACK] BEGIN
// Section Title: SPA catch-all (must be last before error handler)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "INTERFACES:SERVERS:FALLBACK",
//   title: "SPA fallback",
//   guarantees: ["Catch-all never masks /api/* 404s; last before error handler is part of the public contract."],
//   depends_on: ["[HAWK_SERVER:INTERFACES:SERVERS:STATIC]"],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Ensure this never masks /api/* 404s; keeping it last is part of the API.
// -----------------------------------------------------------------------------
/* fallback… */
// --- Notes & Comments ---
// Changed (vX.Y.Z): add explicit /api/* guard before fallback; Why now: prevent SPA masking API 404s.
// [HAWK_SERVER:INTERFACES:SERVERS:FALLBACK] END
// ============================================================================

// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): wrapper narrative updated to match child responsibilities.
// [HAWK_SERVER:INTERFACES:SERVERS] END
// ============================================================================
```

CLI surface:

```ts
// ============================================================================
// [FALCON_MAIN:INTERFACES:CLI:EXAMPLES] BEGIN
// Section Title: CLI — Example admin tool
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "FALCON_MAIN",
//   area: "INTERFACES:CLI:EXAMPLES",
//   title: "Admin CLI",
//   guarantees: ["Exit 0 on success; 2 on usage; 1 on unexpected faults; --machine prints envelopes to stdout."],
//   depends_on: ["[FALCON_MAIN:APP:UTILS:ENVELOPE]","[FALCON_MAIN:POLICY]"],
//   observability: { logs: "json", spans: ["[FALCON_MAIN:INTERFACES:CLI:EXAMPLES]"] },
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Treat CLI as a public surface; stdout for data, stderr for diagnostics; refusal: never print secrets.
// -----------------------------------------------------------------------------
/* CLI implementation… */
// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): reorganize flags help text; behavior unchanged.
// [FALCON_MAIN:INTERFACES:CLI:EXAMPLES] END
// ============================================================================
```

Events consumer:

```ts
// ============================================================================
// [HAWK_SERVER:INTERFACES:EVENTS:EXAMPLES] BEGIN
// Section Title: Events — consumer (schemaVersion, idempotencyKey, emittedAt)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "INTERFACES:EVENTS:EXAMPLES",
//   title: "Example consumer",
//   guarantees: ["Validate envelope; normalize; dedupe before domain apply; DLQ non-retriables."],
//   depends_on: ["[HAWK_SERVER:DOMAIN]","[HAWK_SERVER:LEDGER]","[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { events_schema_version: 2 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// At-least-once delivery; duplicate suppression and idempotent apply happen here.
// -----------------------------------------------------------------------------
/* consumer code… */
// --- Notes & Comments ---
// Changed (vX.Y.Z): enforce emittedAt sanity window; Trade-offs: may DLQ severely skewed clocks; Rollback: widen window.
// Partition key: <field>; Ordering: <rule>; DLQ policy: <short>.
// [HAWK_SERVER:INTERFACES:EVENTS:EXAMPLES] END
// ============================================================================
```

---

# 15) TypeScript first, principled adaptation for other contexts

Examples and templates are in TypeScript with Node ESM (“NodeNext”). For server code that compiles to JavaScript, prefer emitted `.js` extensions in import specifiers to avoid resolution drift. Client bundlers (Vite, Webpack) may import `.ts` directly.

The standard is principle-driven, not dogmatic: where a context makes the style impractical or ill-advised (for example `package.json` with no comments), use the sidecar pattern; if you are writing plain `.js`, keep the same structure and commentary using the host language’s comment style.

When an exceptional context justifies deviation, state the principle you preserved and the reason for the variance in the nearest section footer (“Why now”).

---

# 16) Security and data posture

Never log secrets. State the data class in the banner (Public, Internal, Confidential, Restricted) and redaction/retention rules. The `ai_data` field names the posture; Restricted data never goes to external model providers; Internal data is used with explicit opt-in and redaction. Redaction happens at emission; test it once with a small representative secret corpus and record the approach in `[CODENAME:OBS:LOGGER]` footer.

Refusals declared in the banner are binding. If you introduce any new sink (log, metric label, span attribute, error payload), you MUST evaluate it against refusals and document the decision.

v1.5.2 guardrail: refusals are owner-authored policy. Do not invent additional refusals or rewrite existing refusals as “stronger” language unless the owner asked for it. Adding/removing/modifying refusals is a MEANINGFUL change and should be treated as an explicit decision.

---

# 17) What “wearing a Mechsuit” means in v1.5.2

A file is considered compliant when all of the following are true:

* The banner is present and complete, and includes a prominent `project_version: "vX.Y.Z"` alongside the codename.
* Identifier literalism: existing identifiers (codename, tags, span/metric names, error codes, field names) are copied verbatim; assistants do not normalize, case-fold, or invent variants.
* The banner includes `refusals: [...]` and the prose paragraph includes at least one explicit refusal sentence.
* `canonical_tree` describes only this file’s sections (file-scoped) AND matches the file’s actual section tags (no drift).
* Tags are ASCII, paired, codename-scoped; parents exist for every subsection AND parents physically wrap children (proper nesting — no empty parents).
* Sections do not overlap unless the overlap is strict ancestor/descendant (no sibling interleaving).
* Every section begins with `mechsuit_section` whose `codename` equals the banner codename and whose `area` equals the tag path, and it includes `last_updated_version: "vX.Y.Z"`.
* If present, `independent_versions` keys are explicitly named and cannot be confused with `project_version` (new keys prefer the `_version` suffix; existing keys are preserved and not renamed for style).
* Every code-bearing section ends with a “Notes & Comments” footer immediately before `END`. Wrapper parents still include footers.
* Footers record either “Changed (vX.Y.Z): …” or “Maintenance (vX.Y.Z, no semantic change): …” consistent with the Meaningful Change Rule.
* Updates preserve history: prior commentary is lifted into the footer under “Prior notes” rather than deleted.
* Edge validators and normalizers exist; the core consumes canonical `DOMAIN` shapes.
* Interfaces prove the declared processing order and use uniform envelopes with `meta.traceId`.
* Tunables are centralized in `[CODENAME:POLICY]` or explicitly EXEMPT.
* Declared metric and span names appear at least once where relevant.
* Lines that could surprise carry a one-sentence “why” or a DANGER note.
* Codename remains stable after creation; renames do not change codename unless explicitly logged as MEANINGFUL.
* Generated/vendored artifacts follow the sidecar rule and do not pretend to be hand-authored mechsuit code.

---

# 18) Assistant briefing and operating instructions

**v1.5.2 guardrails (read first).** Preserve existing identifiers verbatim: do not rename codenames, tags, span/metric names, error codes, or exported symbols to satisfy inferred “patterns.” Defaults (codename derivation, helper naming, POLICY centralization, “three patterns”) apply only when a value is absent or the user explicitly asks for a migration.

When you generate or refactor code, produce whole-section replacements (BEGIN to END) rather than fragments. Use the codename derivation rule only for new files that truly lack a codename; if the file already declares a codename, copy it verbatim and do not re-derive or normalize it. Keep the banner at the top; include the file-scoped `canonical_tree`, ensure `project_version` is prominent in the banner, and keep `canonical_tree` consistent with actual tags.

Break code into framed sections with proper nesting: parents must exist, must have headers/narratives/footers, and must physically wrap their children. Ensure non-overlap except strict ancestor/descendant. Validate then normalize at edges; pass canonical shapes to the core. Use centralized envelope helpers rather than re-declaring shapes. Favor optimization over rigidity, but record the rationale in footers whenever you deviate from defaults.

When updating a section, apply the Meaningful Change Rule: update `last_updated_version` only for MEANINGFUL changes; otherwise leave it unchanged and record a Maintenance footer line. Preserve existing commentary by lifting it into “Prior notes” rather than deleting it. If an independent version is needed, add it under `independent_versions` with explicit naming;    do not add ambiguous `version` fields.

When your output must be a non-commentable artifact or generated/vendored code, use the sidecar pattern with source-of-truth and regeneration instructions. Include the artifact content in the sidecar if under 100 lines.

When examples allow real variation (mount order, attach points, helper locations), provide three alternative, compliant patterns with a short description of when to pick each. Keep tests or order proofs short and surgical; if a proof would exceed roughly twenty lines, summarize the logic and reference the external test file by path.

---

## Appendix A — Minimal envelope helpers (referenced by interfaces; fully compliant)

```ts
// ============================================================================
// [HAWK_SERVER:APP:UTILS:ENVELOPE] BEGIN
// Section Title: Uniform ok/err envelopes (helpers)
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_SERVER",
//   area: "APP:UTILS:ENVELOPE",
//   title: "Envelopes",
//   guarantees: ["Stable ok/err shape; meta.traceId present across transports."],
//   depends_on: ["[HAWK_SERVER:POLICY]"],
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { envelope_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Thin helpers in one place; transports map statuses separately via the banner.
// -----------------------------------------------------------------------------
type TraceMeta = { traceId: string };

export function ok<T>(data: T, traceId: string) {
  return { ok: true as const, data, meta: { traceId } as TraceMeta };
}

export function err<E extends string, D = unknown>(code: E, data: D | undefined, traceId: string) {
  // CHOICE: use simple POJO over subclassed Error — ALT: custom Error; REJECTED: serialization friction.
  return { ok: false as const, error: code, data, meta: { traceId } as TraceMeta };
}

// --- Notes & Comments ---
// Maintenance (vX.Y.Z, no semantic change): comment clarity; runtime unchanged.
// Prior notes:
//   v1.4 helpers copied here; unified meta type to reduce drift.
// [HAWK_SERVER:APP:UTILS:ENVELOPE] END
// ============================================================================
```

## Appendix B — Tiny order proof (HTTP, ≤20 lines)

```ts
// Order proof (example) — keep in tests or as code-commented snippet.
// CHOICE: assert shape, not internals.
import request from "supertest";

it("SPA fallback does not catch /api/*", async () => {
  const res = await request(app).get("/api/does-not-exist");
  expect(res.status).toBe(404); // mapped via banner transport_map
  expect(res.body?.meta?.traceId).toBeDefined();
});
```

## Appendix C — Sidecar example for non-commentable artifact (with source-of-truth fields)

````md

# __mechsuit__/package.md

// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "HAWK_PACKAGE"
//   project_version: "vX.Y.Z"
//   purpose: "Document decisions for package.json."
//   order: ["static"]
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Never include secret values in JSON artifacts."
//   canonical_tree: |
//     [HAWK_PACKAGE]/
//     └─ [HAWK_PACKAGE:STATIC:PACKAGE]

// ============================================================================
// [HAWK_PACKAGE:STATIC:PACKAGE] BEGIN
// Section Title: package.json decisions
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "HAWK_PACKAGE",
//   area: "STATIC:PACKAGE",
//   title: "package.json notes",
//   guarantees: ["Captures ESM/resolution/scripts decisions for package.json."],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active",
//   notes: "Non-commentable artifact; this sidecar is the authoritative MECHSUITS surface."
// }
// -----------------------------------------------------------------------------
// Narrative
// Why ESM, scripts layout, engines, and resolution choices.
// -----------------------------------------------------------------------------
```json
{ "type": "module", "scripts": { "build": "tsc -p tsconfig.json" } }
```
// --- Notes & Comments ---
// Changed (vX.Y.Z): keep "type":"module" for NodeNext; ALT: CJS; REJECTED: ESM interop friction.
// [HAWK_PACKAGE:STATIC:PACKAGE] END
// ============================================================================
````

## Appendix D — Canonical section template (copy/paste; v1.5.2 compliant)

```ts
// ============================================================================
// [CODENAME:AREA(:SUB)*] BEGIN
// Section Title: <Human title>
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "CODENAME",           // copy banner codename exactly; do not re-derive/normalize for existing files.
//   area: "AREA(:SUB)*",
//   title: "<short title>",
//   guarantees: ["<promise 1>","<promise 2>"],
//   depends_on: ["[CODENAME:POLICY]","[CODENAME:DOMAIN]"],
//   provides: ["<symbol(s)>"],
//   seams: ["<named seams>"],
//   risks: ["<known limitations>"],
//   observability: { logs: "json", metrics: [{ name: "<dot.name.unit>", unit: "<unit>" }], spans: ["[CODENAME:AREA(:SUB)*]"] },
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { <explicit_name_version>: <int_or_scoped_string> },
//   lifecycle: "active",
//   deprecation: { since: "vX.Y.Z", replacement: "[CODENAME:...]", removal_target: "vA.B.C" },
//   notes: "<link to ADR or rationale id>"
// }
// -----------------------------------------------------------------------------
// Narrative
// Teach purpose, composition with neighbors, invariants, and refusal alignment.
// -----------------------------------------------------------------------------
// /* code … */
// --- Notes & Comments ---
// Changed (vX.Y.Z): …; Trade-offs: …; Future seams: …; Why now: …
// OR
// Maintenance (vX.Y.Z, no semantic change): …
// Decision log:
//   CHOICE: … — ALT: …; REJECTED: …
// Prior notes:
//   vX.Y.(Z-1): …
// [CODENAME:AREA(:SUB)*] END
// ============================================================================
```

Notes on the template: `independent_versions`, `deprecation` are optional; if omitted, remove the fields entirely rather than leaving placeholders.

## Appendix E — Error codes, philosophy, adaptation, and lifecycle guidance

Keep the canonical set for cross-service coherence. When context demands additional domain codes, prefer qualified namespaces like `PAYMENTS_INSUFFICIENT_FUNDS` or `PLAYBACK_UNSUPPORTED_CODEC`, and describe their mapping in the banner’s `transport_map`. In non-commentable JSON artifacts, do not force error code definitions into the file; document them in a sidecar, then reference the sidecar from nearby code or docs.

Lifecycle guidance:

* `active`: normal evolution; apply Meaningful Change Rule.
* `deprecated`: must include `deprecation.since` and `deprecation.replacement` and should include `deprecation.removal_target` when possible; maintain compatibility promises explicitly.
* `frozen`: declare why it is frozen and what “allowed changes” mean (often maintenance-only); maintenance edits still require Maintenance footer lines.

---

### Final note for assistants (v1.5.2)

Preserve existing identifiers verbatim; do not normalize codenames/tags or invent variants. Default to TypeScript examples and Node ESM posture. Follow codename derivation for new files, and preserve codename stability once declared. Keep file trees file-scoped and in sync with actual tags. Ensure parents exist, physically wrap children, and avoid invalid overlaps. End every section with a “Notes & Comments” footer (code-bearing sections required; wrappers still required). Maintain a Decision Log for meaningful choices and use CHOICE/ALT and DANGER notes for forkable or hazardous lines.

Apply the Meaningful Change Rule to govern `last_updated_version` and footer lines: “Changed …” for meaningful changes, “Maintenance …” for non-semantic touches. Preserve prior commentary by lifting it into “Prior notes” rather than deleting it. Allow independent versions only under explicit `independent_versions` keys, never as ambiguous per-section `version`. Use sidecars for non-commentable artifacts and generated/vendored code, including source-of-truth and regeneration instructions.

---

## Analysis (why these choices serve your goals)

The v1.5.2 changes concentrate on preventing long-term drift and making “freshness” and “structure truth” mechanically reliable without CI. Proper nesting plus the ancestor-only overlap rule makes the hierarchy real in the file, not just implied by names. Canonical-tree update discipline prevents the tree from becoming a stale ornament. Codename stability prevents renames from silently breaking grep workflows, span names, and operational conventions. The Meaningful Change Rule turns `last_updated_version` into a signal of semantic freshness instead of a “last touched” timestamp, while the Maintenance footer line preserves release traceability. Replacement granularity prevents whole-section replacement from turning into whole-parent blast-radius, while still requiring correctness when ancestor contracts change. Independent versions remain possible for schema/state/protocol realities but are forced into explicit, non-confusable names so they can’t undermine the clarity that project_version + last_updated_version provides. Lifecycle/deprecation vocabulary makes “intentionally stable” sections legible and prevents operators from mistaking frozen/deprecated states for neglect. Finally, the generated/vendored sidecar rule prevents the standard from encouraging edits that will be overwritten and ensures decisions live where humans can actually maintain them.
