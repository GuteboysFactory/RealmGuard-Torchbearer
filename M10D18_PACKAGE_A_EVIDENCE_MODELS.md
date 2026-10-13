# A05/A06 — prospective counter and supply models v1

Status: DESIGN + EXECUTABLE BASELINE CONTRACT IMPLEMENTED; full A05/A06 OPEN. 2026-10-13. Accepted assurance: R, trusted GM and reviewed prospective history (A09 settled). No Actor/Item schema migration, default counters, storage writer or supply consumption is introduced. CORE remains read-only. Contract API: tests.evidenceBaselinePlan; implementation in m10d18-tb2e-package-a-prospective-trace.mjs, regression qa/m10d18-package-a-evidence-baseline-smoke.mjs.

## Source/model findings

Uploaded Dungeoneer's Handbook printed pages: 68-69 require Nature zero-loss/maximum-based advancement and loss of marks after maximum reduction; 72 caps known Skills at 24 and distinguishes explicit Heroic exceptions; 73-74 distinguish tools, expendable supplies and reusable gear; supplies grant +1D to one applicable roll, at most one increment per test; 75 counts BL attempts toward Maximum Nature, then learning rating2 and erasing attempts, without Will/Health advancement marks; 108-110 require separate P/F counts, rating/rating-minus-one thresholds, no conversion, reset after advancement/rating loss, and test/context accounting. Scholar's Guide 36-38 and 87 bind Help/Synergy/final results; existing matrix and A02/A03/A07 hold their exceptions.

Current data-models.mjs: Will/Health value/max and Nature value/maximum have no P/F history. Role Items store learning.passed/failed and beginnerAttempts with schema defaults. Gear quantity/bundle/slots are inventory quantities, not canonical Skill supply units. Defaults and current holdings cannot establish historical evidence. No rule book defines a universal quantity-to-increment ratio.

## Shared baseline schema (implemented pure contract)

Envelope has exactly schemaVersion1, worldId, actorId, gmId, subjects and supplies. These IDs are declarations, not resolved documents. The API never reads game, constructs a Roll, migrates models or writes storage. Maximum 64 subjects and 128 supply records bound input; limits are engineering limits, not rule caps.

Every evidence value is explicitly one of:

| State | Value | Review metadata | Meaning |
|---|---|---|---|
| UNKNOWN | null | reviewId/reviewerId null | History unavailable; neither zero nor available stock |
| GM_REVIEWED | Exact count object | Nonempty reviewId; reviewerId equals envelope gmId | Explicit reviewed baseline under R, including deliberate zero if known |

Counters/attempts/increments must be nonnegative safe integers below MAX_SAFE_INTEGER; null, booleans, text, fractions and unsafe values are rejected. Omitted fields are rejected. CAPTURED or AUTHENTICATED labels are not accepted by this declaration-only contract. Known declarations are not historical authentication. Outputs are detached/frozen, writesPlanned0, eventApplicationImplemented=false and baselineStored=false.

Subjects bind subjectId to actorId:kind, or actorId:kind:itemId for SKILL/LEARNING, and require epochId. WILL/HEALTH/SKILL normal ratings1-6; NATURE maximum0-7 with separate current0..maximum; LEARNING rating0 with attempts instead of P/F. Skill references must resolve to the existing source index. One Skill name and role Item cannot simultaneously stand for trained and learning subjects. Heroic rating7 for Skill/Ability needs A03 entitlement work and is deliberately outside this v1 contract, not completed parity.

The validator returns counters=null for UNKNOWN and retains distinct reviewed P/F versus reviewed attempts. Nature0/current with positive maximum reports loss-resolution-required; Nature0/0 reports retired state and rejects reviewed nonzero marks, while unknown marks remain unknown. It does not infer that loss/reset has happened, authorize advancement, compute learning readiness from a partial subject list or reinterpret counters as actual Foundry observations. An unknown source baseline remains unknown even when a valid test is later supplied.

Supply records require itemId, unique unitId, sourced skillName, explicit incrementDefinition, unitReviewId/unitReviewerId, quantityMapping=NO_AUTOMATIC_CONVERSION and explicit stock evidence. The definition is a reviewed unit/classification for that item and applicable task, not a book-defined size inferred from its name. Reviewed zero returns incrementAvailable=false; UNKNOWN returns null. The contract does not read or decrement quantity, apply +1D, verify placement/adequacy or infer consent/ownership. Duplicate item/unit allocations are rejected. A specific source exception permitting extra gear remains A01/A06, not a generic multiple-supply override.

## Prospective ledger design (not yet implemented)

Future explicit Legacy diagnostic records reference world/actor/subject/epoch and test/event IDs. Initial baseline is either UNKNOWN or an explicit GM-reviewed starting value, with review reason and evidence references. A newly prepared zero-history test fixture may initialize reviewed zero; an existing Actor may not be silently migrated to zero. Imported Legacy counters may be reviewed as a baseline, but cannot be promoted from current schema values to authenticated past history.

Proposed event records include schemaVersion, eventId/testId, contiguous sequence within the ledger, subjectId/epochId, eventKind, source rule/page, captured source/permission context, recorded final-outcome reference, before/after values, operation and review references. Separate raw capture, eligibility judgement and calculated projection. No user-supplied final PASS/FAIL bypasses the shared final-result derivation.

| Event group | Required handling / closure tests |
|---|---|
| Eligible P/F test | Keep separate counts; use A02/A07 source-defined conditions/context/series eligibility; one subject/test/context credit, no duplicate or P↔F conversion |
| BL attempt | One eligible attempt regardless of PASS/FAIL; never also add an acting Will/Health advancement mark; attempts stay unknown if baseline unknown |
| Learn Skill | Reviewed complete threshold/capacity/forget choice; proposed rating2, attempts erased and new trained epoch; explicit owned source binding, no automatic Skill creation |
| Advance/rating loss | New epoch and explicit reset event; extra marks discarded, old epoch retained for audit. Known reset may establish zero for the new epoch without reconstructing the old unknown counts |
| Nature loss/advance | Capture current/max separately; max reduction erases Nature marks; current0/max-positive needs DH68 trait/loss resolution before normal advancement; 0/0 cannot advance. Maximum-based advancement increases both values preserving tax difference. Temporary-tax and other lifecycle applicability require A03 review rather than an invented generic rating reset |
| Use supply | One reviewed applicable unit for that test; before/after increment arithmetic and unique spend reference, regardless of roll outcome. Separate actual Legacy inventory operation, if any, from diagnostic unit accounting; no inferred quantity decrement |
| Replenish/reclassify | Explicit reviewed event and unit-definition version, with old records preserved. A definition change is not retroactive rescaling of past stock |

Required source/frame data includes final-outcome identity, relevant condition/phase/series context, Maximum Nature at learning review, complete known-Skill roster for capacity/forgetting, source Item references and gear/container/loan/adequacy evidence. A partial baseline envelope cannot establish those facts. A05/A06 remain OPEN until event replay, these fields and shared-chain consumption exist and are exercised in A11.

## Storage and concurrency design boundary (A08 implementation)

Proposed diagnostic-only storage: a separate GM-private audit JournalEntry containing versioned baseline/epoch/index metadata, with immutable-in-memory event copies referenced to private raw capture ChatMessages. This is a proposed destination, not a created document. Current trace schema1/2 stays readable; future envelope version must be explicit. CORE reads only after GM/privacy/source gates, never writes or repairs the index. No new Actor/Item counter fields or mandatory live default capture.

One explicitly admitted GM capture operator/session per audit dataset; every batch checks dataset revision/session, raw record references and unique test/event/subject-context credits before and after persistence. Journal updates are not assumed to provide compare-and-swap or a transaction across gameplay and evidence. Simultaneous sessions, stale revisions, record/index mismatch or interrupted commits must remain INCOMPLETE until reconciled against preserved raw records. Acceptance needs two-client/reload/storage-failure tests; if lost-update/conflict detection is not demonstrated, that subcase remains OPEN. No independent concurrency/replay authentication is claimed under R.

State: initial baseline → RESERVED/PENDING test → observed operation records → RECORDED or INCOMPLETE. Gameplay errors/capture/storage failures never reroll, re-spend or roll back the live operation to fix the audit. Replay scope is this reviewed captured dataset, not all world history. Dataset export records source/build/artifact identity and record/epoch/index manifest; a digest checks a reviewed dataset, not a hostile admin's authenticity. Storage/migration/recovery implementation is A08; read-only shared projection integration A10 and real Foundry acceptance A11.

## Required next consolidated implementation

Implement one event/epoch replay engine consuming these explicit baselines and the captured final-result identities, then connect both counter and supply projections to A10. It must preserve UNKNOWN, detect duplicate credits/consumption, handle reviewed resets/replenishments and reject mismatched event/epoch/source/context identities. In parallel resolve A02/A03/A07 eligibility and A06 equipment/supply source cases. Do not spend another round adding independent baseline planners and call the model complete.

No further scope choice is needed for these read-only designs under selected R. Any future external service, live rules/profile conversion or protected release still requires its actual separate authorization. Full A05/A06/A08/A10/A11/G3 remain OPEN; Foundry13.351 A-D NOT RUN; 0/14 FULLY_REAUDITED. Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable1.12.0/published QA1.13.0-qa.29 frozen; no release.

Verified A05/A06 model/baseline contract code head 2f03f5786a5d32a901832e2c04be8448fb97d1e7: local 159/159 smoke suites and preflight PASS; CI run 38370309357 confirms 159/159, syntax/preflight, unpublished ZIP21/21 dependencies and frozen guards PASS. https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38370309357 . Baselines remain declarations; event replay/storage/integration and Foundry13.351 A-D remain OPEN / NOT RUN.


## 2026-10-13 — native-bound dataset replay implemented in supported scope

`tests.evidenceReplayPlan({baseline,events,previousEventIds,previousCreditKeys,previousSupplyTestIds})` now replays explicit events into detached frozen projections. Entry requires registered active current GM, same world and current world character. TEST_CREDIT resolves the private saved Legacy base/Fate consumer, checks owned captured Skill/rating/epoch, derives the mark from the saved native final result and captured conditions using the existing progress planner. Caller PASS/FAIL overrides are rejected. Only independent Adventure trained Skill credits are currently supported; BL/Ability/Nature test-credit and series/tie/helper routes remain OPEN.

SUPPLY_USE binds one reviewed allocation to that saved test/Skill and enforces one increment per test within the supplied dataset/prior-ID scope. It projects unit stock arithmetic without changing Item quantity. Supply use is GM-asserted: current scoped Legacy producer does not capture a supply bonus/consumption, and the replay does NOT assert that +1D was present in the native pool. Unknown stock remains unknown, cannot verify sufficiency and authorizes no live consumption. SUPPLY_REPLENISH projects reviewed positive increments; unknown initial stock stays null.

SUBJECT_RESET requires a new non-reused epoch and explicit GM review. Normal advancement requires known separate P/F thresholds, rating+1 and reviewed conditions; Sick/Dead and unresolved Nature0 block advancement. Reviewed rating loss or Nature zero-loss/conservation establishes reset zero for the NEW epoch even when old marks were unknown, without recovering the old history. Nature advancement preserves tax difference. Rating-change causality, trait change and lifecycle timing remain GM assertions; LEARNING→SKILL transitions and reclassification are not implemented.

Replay rejects repeated event IDs, repeated subject/test credits across epochs, reused supply tests, stale epochs/captured Skill ratings, manipulated saved outcomes, invalid review/sequence/type, unsafe arithmetic, empty supply stock and invalid reset transitions. Errors expose no partial projected state. Prior sets are explicitly supplied and checked, not a complete durable world index. Duplicate native/current-message guards remain in the saved consumer. No storage, gameplay or resource writes, RNG, profile changes or authenticated-history upgrades. Full A05/A06/A08/A10/A11 remain OPEN, under accepted R; actual Foundry13.351 NOT RUN.

Verified saved-native replay code head 620ecc370da47c13946b37183bdbc7923aec85ba: local160/160 and preflight PASS; CI38372437364 confirms160/160, syntax/preflight, unpublished ZIP21/21 and frozen guards PASS: https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38372437364 . Source-bound saved Skill credit/reset/replenish/supply-use projections are tested in mocks; supply bonus capture, full route/ledger/storage integration and actual Foundry13.351 A-D remain OPEN / NOT RUN.


## 2026-10-13 — BL credit and learning-transition projections

`evidenceReplayPlan` accepts LEARNING_CREDIT with a full integratedTestInput, not an injected outcome. It internally calls the existing integrated document/equipment/participant/reward/final/progress chain and requires BEGINNERS_LUCK for the same Actor, untrained Item/Skill and learning epoch. A known initial reviewed attempts baseline must match the observed current starting record; unknown remains unknown. A reached threshold requires learning review before another credit. One eligible attempt is projected regardless of the chain's final PASS/FAIL; Sick-suppressed credits add zero. It never adds an acting Will/Health mark. Duplicate message/subject credits and reused/stale epochs fail closed; UNKNOWN attempts remain null.

LEARN_SKILL requires the matching eligible credit in the replay, known attempts at least the observed Maximum Nature and compatible Nature context. Current taxed Nature cannot replace the maximum threshold. It requires explicit GM review of the complete canonical trained-Skill roster and exact matching Item IDs. At 24 Skills it requires a valid existing Skill to forget; otherwise forgetItemId must be null. The projection removes the old learning subject/attempts, creates a new trained subject/epoch at rating2 and P/F0, and records a projected roster/replacement without creating or changing any live Item. A forgotten subject present in the dataset is removed from the projected active set while its source/event evidence remains available in the history. Learned or stale learning subjects cannot accept further BL credits.

This uses actual current Actor/Item/Nature sources and saved plain native result documents plus GM-reviewed reward links/eligibility from the existing integrated API. It is NOT a new Legacy BL producer or private schema1/2 capture. Current source snapshots and historical GM assertions remain distinguishable; no immutable history/authentication flags are enabled. No retroactive HTML reconstruction. Learning transition and roster canonicality are reviewed projections under R; real transaction/capture/storage/reload/concurrency acceptance remains OPEN.

Sources: uploaded DH59,72,75 (BL, maximum-Nature attempts, rating2, attempt reset, no Will/Health mark, 24/forget), SG51 and87-88 (conditions and reward-final result), with existing matrix distinctions. Regression uses saved base FAIL→Deeper six→Luck→PASS, plain FAIL credit, Sick, unknown baseline, malformed identity/epoch/outcome overrides, missing resources, incomplete/false roster, capacity replacement and unchanged Actor/Item/message snapshots. Full A05/A08/A10/A11 remains OPEN; Ability/Nature test credits, series/tie/helper dataset credits and Legacy BL capture are still missing; actual Foundry13.351 NOT RUN; no release/certification.
