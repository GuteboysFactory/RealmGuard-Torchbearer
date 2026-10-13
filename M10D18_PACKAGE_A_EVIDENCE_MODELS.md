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
