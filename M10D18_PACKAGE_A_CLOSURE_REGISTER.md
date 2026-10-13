# Package A — fixed closure register

**A05/A06 design checkpoint:** [Counter and supply evidence models](M10D18_PACKAGE_A_EVIDENCE_MODELS.md) supplies a shared v1 contract and executable read-only baseline validation. UNKNOWN is distinct from reviewed zero; supply quantities are not converted to increments. Baseline validation does not implement storage/event replay or close A05/A06. Next consolidated code work: event/epoch replay and shared final-result integration, with source eligibility exceptions still OPEN.

**A09 decision accepted:** [Historical evidence contract](M10D18_PACKAGE_A_TRUST_DECISION.md) records the explicit user selection of R: trusted GM/admin and prospectively captured, runtime-reviewed history. G3 uses this stated assurance boundary; historical authentication flags stay FALSE. A09 design/decision is SETTLED; capture/model/integration/runtime and full G3 remain OPEN.

Status: OPEN / NOT RELEASED. Inventory v1, 2026-10-13. Reviewed repository baseline: d6cd7595c207ebbb83aba792ab69cbe7fb988094. This register is the work queue beneath the unchanged five G1-G5 completion gates, not a replacement or a lower acceptance standard. It supersedes chronological NEXT instructions elsewhere.

## Where we are

Supported independent Skill/BL integrated read-only planning is implemented. Explicit GM-only Legacy trained Skill diagnostics capture native base/recursive Fate history and acting Fate deltas; separate CORE consumption checks saved consistency, Actor/GM/Skill identities and final outcome without writing or RNG. General Legacy gameplay remains unchanged. Source/model matrix contains 29 review rows, not 29 fully accepted rules.

Baseline final-head CI: [38361548151](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38361548151), 158/158 suites PASS, unpublished ZIP 21/21, preflight/frozen guards PASS. Actual Foundry v13.351 A-D NOT RUN. G1-G5 full acceptance OPEN. 0/14 FULLY_REAUDITED. A green automated baseline is not a percentage of completion.

## Fixed remaining work

A09 design/decision is SETTLED (R explicitly selected); the remaining 11 entries are OPEN. Full G3 remains OPEN. Each closes only when its stated evidence is linked, exceptions resolved and downstream integration/runtime requirements are met. A change may close a subcase without closing its entry. No extra planner or smoke-count milestone creates another work package. Newly discovered failures must be assigned to an existing ID; a genuinely missing source requirement requires a documented register revision, never silent scope expansion or removal.

| ID / gates | Required deliverable | Type / owner | Concrete closure evidence | Dependencies |
|---|---|---|---|---|
| A01 — G2: complete source/task review | Review all 33 Skills and every matrix row against uploaded DH/SG; finish factors, prerequisites, light, fictional applicability and external spell/Versus routing. Distinguish GM judgement from missing implementation. | Source review + code, Codex | Every source requirement has page, code path, positive/negative/exception case and explicit reason for any external dependency. Required safe refusals remain blockers rather than parity claims. | Independent; supplies A10/A11 |
| A02 — G1/G2: timing, Versus and accounting exceptions | Complete Instinct timing, Versus/tie resolution, separate tiebreaker identity, Adventure/Camp/Town/series/conflict and advancement eligibility within Package A. Do not implement unrelated full Conflict domain. | Source review + code, Codex | Shared final-result cases cover each applicable route and mark/attempt eligibility; tie and series records cannot double-count. Written cross-domain boundary with no required case dropped. | A01/A05/A08 |
| A03 — G1/G2: Nature and entitlements | Integrate stock descriptors, Nature substitution/channel/crafting, tax/zero-loss/recovery/conservation/retirement and maximum-based advancement; source-check class/stock/level and Heroic cap/TN exceptions. | Source review + code, Codex | Source-bound positive/negative entitlement cases and complete lifecycle previews, including zero-loss precedence, tax difference and reset. Unsupported required routes resolved, no fabricated eligibility. | A01/A05/A06/A08 |
| A04 — G1/G2: Wise lifecycle | Cover I Am Wise, Deeper, Of Course, Angry, before-Luck sequencing and four-use benefit/choice/reset lifecycle. Preserve Legacy Mixed Wise semantics separately. | Source review + code, Codex | One source-defined lifecycle with valid/invalid targets, costs, sequence, four uses, benefit eligibility and reset projection. Legacy free rerolls are never certified as TB Deeper/Of Course. | A01/A05/A08 |
| A05 — G2/G3: Ability/Nature and learning evidence model | Produce a versioned prospective subject/test/counter ledger design for absent Will/Health/Nature P/F history, plus learning threshold/capacity/forget/rating-loss resets. Then implement required Legacy-owned evidence and CORE projections. | Model design + code, Codex; approval only if concrete proposal changes protected scope | Explicit missing-history state, source rules, migration/backfill policy, duplicate/eligibility/reset rules and positive/negative tests. No default zero, borrowing Skill counters or reconstruction from current values. | Design independent; implementation uses A09 |
| A06 — G2/G3: equipment and supply units | Define source-bound usable supply increments and trace consumption; resolve carried/nested/custom/container/capacity, tool access/adequacy, borrowing and crafting boundaries. | Model design + source/code, Codex | Reviewed unit/classification contract and positive/negative traces with payee/item/container IDs. Quantity is not silently converted to uses; no CORE decrement or inferred lender consent. | Design independent; A01/A09 |
| A07 — G1/G3: complete participation evidence | Bind acting/helper source, acceptance/relevance/consent, conditions, consequences and pre-roll Synergy to the same final result and mark source. | Source/code, Codex | Acting/helper final marks/attempts derive from one outcome; rejected consent/source/condition/budget conflicts; Ability helper cases use A05. Clearly separate GM assertions from observed evidence. | A04/A05/A08/A09 |
| A08 — G3: full prospective trace lifecycle | Extend scoped capture/read-only consumption to required Wise/helper/BL/Versus/Nature routes, resource histories, relevant starting snapshots and failure/pending/storage/replay lifecycle. | Evidence design + Legacy-owned code, Codex | Control comparisons preserve exact Legacy dice/dialogs/spends/chat; capture failures never retry gameplay. Missing/interrupted/failed/duplicate histories fail closed; pending/commit policy is explicit. No rule conversion disguised as capture. | A02-A07 contracts, A09 |
| A09 — G3: historical trust decision SETTLED (R) | Define separately current-session observation, internal saved consistency and historical authentication; identify actual writer/permission/storage authority and mutation/replay boundaries. Selected boundary: prospectively observed and runtime-reviewed evidence under trusted GM/admin; no independent historical authentication claim. | Engineering decision, Codex prepares concrete design; user approves only any change to original acceptance/scope | Reviewed threat/authority model, attainable claims, exact false/true flags, durable replay/storage design and evidence requirements. Mutable client flags, UUIDs/native classes or GM assertions alone cannot close historical authentication. Current consistency-only scope remains engineering progress and full G3 OPEN. | Decision SETTLED; implementation acceptance in A05-A08/A10/A11 |
| A10 — G1: complete shared chain | Join the required source/equipment/participation/test/reward/final/progress/lifecycle routes under one identity; reconcile all 29 matrix rows and resolved exceptions. | Integration + regressions, Codex | Single final result drives every applicable mark/attempt/tax/reset proposal. Cross-route conflicts and source/budget overrides rejected; complete case manifest links A01-A09 evidence. | A01-A09 |
| A11 — G4: real Foundry v13.351 A-D | Prepare exact-SHA unpublished artifact and isolated copied World, then run consolidated protocol including GM/player/private/reload, Legacy published-QA.29 controls, exception cases and before/after records. | Runtime, Codex where accessible; user/environment access when needed | Recorded installed source SHA, artifact SHA256/build/client identities, real document IDs, all A-D results/errors and zero-write CORE snapshots. Mocks and historical confirmations do not close this. | A01-A10 ready for FINAL acceptance; early diagnostics remain partial |
| A12 — G5: final evidence/reproducibility decision | Review complete evidence, repeat candidate CI/ZIP/preflight/frozen guards and rollback/control checks; make separate protected release decision. | Final review, Codex; protected release approval when actually ready | A01-A11 closure evidence reviewed on final candidate, no open required exception, release constraints met. No automatic merge/tag/version/channel/release. | A01-A11 |

## Traceability to the existing 29-row matrix

This is coverage of the current inventory, not a claim the books have no other exceptions. Row numbers refer to the initial table in M10D18_PACKAGE_A_RULE_CODE_TEST_MATRIX.md, excluding its header.

| Matrix rows / subject | Register responsibility |
|---|---|
| 1: D6 result/Ob | A08/A10/A11 |
| 2-4: factors/prerequisites/environment | A01/A10/A11 |
| 5: Versus/ties | A02/A08/A10/A11 |
| 6-8: Help/BL/consequences | A07/A05/A10/A11 |
| 9-13: Wise effects/Luck/Angry | A04/A08/A10/A11 |
| 14: Synergy | A07/A08/A10/A11 |
| 15: Wise four-use lifecycle | A04/A05/A10/A11 |
| 16-20: Nature | A03/A05/A08/A10/A11 |
| 21: Instinct | A02/A10/A11 |
| 22-23: BL/learning/capacity | A05/A08/A10/A11 |
| 24: Heroic cap/TN | A03/A10/A11 |
| 25-26: tools/supplies/containers | A06/A01/A10/A11 |
| 27: P/F requirements | A05/A10/A11 |
| 28: context/tie/series/conflict accounting | A02/A05/A10/A11 |
| 29: advancement/rating-loss resets | A05/A03/A10/A11 |

A09 applies to every historical claim; A12 reviews all rows. Source authority stays the uploaded Dungeoneer's Handbook and Scholar's Guide, using the page mapping in the matrix. Engineering IDs, authority and storage design are not rules from the books.

## Next action and stop conditions

1. A09 is selected and its R evidence contract is accepted. Next: consolidated A05/A06 evidence-model designs (Ability/Nature/learning ledger and supply increments), then grouped source/capture integration. Do not build an independent attestation service or claim authentication from mutable records.
2. Implement consolidated changes against these approved source/evidence contracts, grouping A02-A08 by their shared dependencies. Report entry/subcase evidence, not new smoke milestones as completion.
3. Assemble A10's final case manifest. Only then label an unpublished candidate ready for A11 FINAL acceptance. A12 follows actual runtime evidence.

A decision request must present an actual proposal and explain whether it changes the original full-gate scope. Do not ask the user to approve an undefined architecture. Do not lower G3 to mutable consistency just to unblock work. Lack of runtime access leaves A11 NOT RUN; lack of credible historical authority leaves A09/G3 OPEN. These are specific stop conditions, not endlessly expandable code tasks.

## The end

Package A is done only when its applicable A01-A12 evidence closes G1-G5 for the same final candidate. It covers Tests, Help, Wises, Nature and Abilities/Skills; it does not automatically complete the other nine CORE domain audits, set all 14 certificates or resume M11. A01-A10 are predominantly repository/design work; A09 includes an authority decision and A11 requires real runtime evidence. No honest completion percentage or end date follows from 158 tests or twelve entries.

Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. Stable1.12.0 and published QA1.13.0-qa.29, system/channels/READY remain frozen. No release from this register.
