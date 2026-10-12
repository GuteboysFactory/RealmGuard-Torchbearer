# G3 — prospective Legacy trace contract and trust boundary

Status: PROPOSED CONTRACT / READ-ONLY VALIDATOR IMPLEMENTED. No capture hook, flag writer, persistence, native Roll publication or live rule change is implemented. G3 remains OPEN. Source basis: DH 59,75,77,108-110; SG 36-38,47,51,87-88. The books supply the rule requirements; envelope IDs and receipt fields below are engineering design choices, not rules printed in the books.

## What the inspected Legacy path actually retains

`module/documents.mjs` owns the existing `rollRole`, `_applyWiseReroll` and `_explodeSixes` paths. Role rolls flatten evaluated Roll results into face arrays; Wise effects replace selected indexes; Fate children are flattened into one bonus array. The pending/final ChatMessage is created/updated with `speaker` and HTML `content`, without persisting those native Roll records or the full result-to-parent links. `module/progression.mjs::spendTrackedResource` performs the existing resource update and returns a spend result, but has no test/event identity tying that receipt to a saved reroll. These are observations of current code, not findings that Legacy should be converted to TB rules.

Old HTML-only records cannot recover the original complete per-die history, owner scope, counters, pre-spend balances or chronology. Current document readers must keep historical authentication false. HTML parsing, current holdings, schema defaults and retroactive GM declarations cannot reconstruct lost observations.

## Version 1 proposed envelope

`tests.prospectiveTracePlan({trace,scenarioInput,gmTraceReviewed:true,previousTestIds})` validates caller-supplied declarations only. It does not resolve world documents, read flags, use RNG, register startup hooks or write anything.

- Envelope: `schemaVersion:1`, `producer:"LEGACY_MIXED"`, `status:"COMPLETE"`, explicit `worldId`, `sessionId`, globally unique `testId`, acting `actorId`, `author`, `participants`, ordered `events`. The producer label is a claim, not proof of origin.
- Author: explicit `userId`, `role:"OWNER"|"GM"`, and reviewing `gmId`. OWNER must occur in the acting snapshot's owner IDs; GM must match its declared GM ID. These are internal scope checks, not real-session permission checks.
- Participant snapshot: unique `actorId`, `ownerUserIds`, `ownedItemIds`, condition names, source `{kind,itemId,name,rating}`, starting `{fate,persona}`, and explicit Skill `{passed,failed}` counters or `null`. Ability/Wise counters must stay `null`: current models cannot supply those histories. No absent field is invented as zero. Additional equipment, Nature, BL learning and entitlement snapshots are still needed for the final comprehensive capture contract.
- Every event has unique `eventId`, exact zero-based contiguous `sequence`, same `testId` and an allowed `type`. One BASE_ROLL and terminal FINAL are required. No events after FINAL.
- Roll record: unique `recordId`, exact plain `Nd6` formula, `evaluated:true`, faces 1–6 and matching arithmetic total. Stable dice IDs are `${recordId}:${index}`. These copied records are declarations; they are not authenticated native Foundry Roll documents.
- Wise events: DEEPER_UNDERSTANDING or OF_COURSE with declared acting-owned `wiseItemId`, reviewed relatedness, explicit target IDs and a result Roll record. Deeper requires one target. Existing reward engine validates failed/reroll eligibility and the complete Of Course target set.
- FATE_LUCK has ordered rounds, each with parent IDs and a distinct new Roll record. Existing engine checks six-parent eligibility, one child per six, complete recursive continuation and Wise-before-Luck order.
- SPEND: acting/helper `actorId`, `resource`, positive integer `amount`, `before`, `after`, and `forEventId`. Balances must chain exactly from that participant's explicit start values; each Wise/Luck/Synergy action has one matching receipt with the proper payer, currency and cost. Receipt order follows observed application order; post-roll reward receipts must follow BASE and precede FINAL. No additional Persona dice/Nature channel spending is supported in this contract version.
- SYNERGY_COMMIT references the ordinary helper and helping source. Commitment and its helper-owned Fate receipt must precede BASE (SG87). A stored result/receipt relationship does not authenticate player consent.
- FINAL records PASS/FAIL, which must equal the existing reward engine's derived final result. Progression authorization/mark writes are deliberately absent.
- `previousTestIds` is an explicitly reviewed external set. The validator rejects a test already in that set, but cannot prove the set complete. Global world/actor/series replay prevention needs durable Legacy-owned state and actual records.

## Required future writer placement — not installed

The future producer must remain in the existing Legacy execution path. CORE never starts or changes a roll, spends a resource, logs advancement or writes the trace. Do not route live Legacy results through TB's different Wise/BL/Nature mechanics to manufacture CORE-compatible records.

Capture original evaluated Roll records and stable target/parent references before flattening/replacement. Observe owner/author/GM scope, relevant Actor/Item/condition/resource/counter state immediately before the existing operation; observe the actual spend outcome and before/after values around the existing awaited update. Record the exact profile and candidate SHA. Any interrupted roll, failed spend, unrecorded reroll, changed context or storage failure must result in PENDING/INCOMPLETE evidence, never fabricated COMPLETE history. A future rollout must demonstrate identical Legacy dice, prompts, spend/learning behavior and chat outcomes in control comparisons, including asynchronous changes. Capture failures cannot silently alter gameplay or be hidden as successful records.

Persisted native data and trace must share one stable test identity and private access scope. Establish actual archive/schema ownership, concurrency/retry policy, bounded size, completion/commit atomicity and a migration/read policy before adding storage. A Forge/Foundry client flag or hash alone is editable and is not a trusted signature. Tamper-evident hashes can detect accidental inconsistency only unless anchored by a separately trusted authority. A trusted provenance service/GM-server commit model requires a concrete implementation and threat review; no such authority exists in this patch.

## What current validation proves

It proves that the submitted bounded envelope is structurally and arithmetically consistent with the submitted scenario and prior-ID set. Outputs explicitly say `CALLER_SUPPLIED_UNATTESTED_TRACE`; capture, native document reads, complete history, immutable ordering and all authentication flags stay false. It rejects inconsistent edits, duplicated/mixed identities, invalid recorded author scope, absent spend receipts, wrong payer/cost/balances, incomplete dice chains and mismatched final outcomes. A coordinated fabricated author/snapshot can still pass consistency checks; the regression verifies that it does not gain authenticated status.

## Remaining G3 gates

Reviewed capture/storage/trust design, full Actor/GM/Item/condition/learning/Ability/supply entitlements at roll time, actual prospective Legacy-produced native records, durable replay/commit checks, and CORE document-based consumption are still missing. The G1 integrated consumer uses saved plain D6 documents and current snapshots; this proposed-envelope validator does not upgrade G1 data into historical proof. Live Foundry v13.351 A-D, reload/private-message/player/concurrency tests and unchanged Legacy control behavior remain NOT RUN. G1/G2 full acceptance and G3-G5 remain OPEN; certifications 0/14; M11 PAUSED; kill switch ENGAGED; no release.
