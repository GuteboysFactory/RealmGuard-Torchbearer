# A09 — concrete historical evidence decision

Status: PROPOSAL / DECISION PENDING, 2026-10-13. No acceptance gate or runtime flag changes are implemented. Reviewed implementation baseline: 7848b21d1a48e5bf35d0aa135b919560f820050c. This proposal belongs to A09 in the fixed closure register; it is not another work package.

## Problem and recommendation

The original request requires verifiable Actor/GM provenance and dice history with safe read-only boundaries, source-backed changes/regressions, actual acceptance and no premature release/certification. It does not specify resistance to a malicious GM/world administrator. The later engineering checklist added stronger historical authentication, immutable storage and durable replay requirements. Those stronger terms are not game rules from DH/SG and have not been demonstrated by the current client implementation.

Recommend **R — reviewed prospective history under a trusted GM** for this rules-system re-audit. This is an explicit change to G3's evidence acceptance/threat assumptions, not a lowering of rule parity, source coverage or Foundry verification. Only after user selection may the checklist be revised. Alternative **S — independently authenticated historical authority** preserves the stronger historical claims but requires a separate authority design and feasibility/hosting decision beyond the existing client system. There is no ready supported server-attestation component in the inspected Package A paths.

Until selection: original G3 requirements remain OPEN, all authentication flags FALSE, all 12 register entries OPEN. A05/A06 designs and source review may proceed independently. Do not silently adopt R or implement/deploy S.

## Evidence layers

| Layer | What it supports | What it cannot support |
|---|---|---|
| E0: caller-supplied scenario/trace | Internal rule and arithmetic consistency | That a roll happened or a source/owner/balance existed |
| E1: current registered GM/Actor/Item/native document | Current-session object/source/permission observations | Permissions or values at an earlier operation |
| E2: scoped Legacy callback capture with saved native records | Native-round and copied-snapshot agreement; control execution comparison | Independent proof of origin, immutable chronology or spend causality |
| E3-R: prospective captured record reviewed in real Foundry, trusted-GM model | Auditable operation-time observations under a stated trust assumption; explicit coverage and failure/reload tests | Malicious GM/client/admin forgery or global immutable history |
| E3-S: independently authenticated authoritative events | Only historical claims actually authenticated by that authority and coverage | Unobserved actions, missing old history, fictional relevance or consent not authentically submitted |

Current code reaches bounded E2 for trained Skill base/Fate, with E1 current-source checks. E3-R and E3-S are not implemented or accepted. Native Roll classes, document UUIDs, frozen output objects and arithmetic checks do not turn E2 into E3.

## Concrete options

| Decision | R — trusted-GM prospective audit (recommended) | S — independent historical authority |
|---|---|---|
| Trusted parties | Operating/reviewing GM, Foundry world administrator and approved audit code | Identified independent authority and its operator/key custody; trust boundaries documented separately |
| Threats tested | Accidental edits, stale/mismatched identities, malformed or incomplete histories, wrong participant/resource/targets, ordinary unauthorized player access, concurrent capture/reload/storage failure | R threats plus fabricated client author/source/history, replay and deletion/rollback within the defined authority coverage |
| G3 completion meaning | Required operations have complete prospective records, observed permission/source snapshots, recorded attribution and reproducible real-runtime review under trusted-GM assumptions | Required claims have authority-verified historical snapshots/events, binding to execution/source, append/commit/replay semantics and real-runtime review |
| Authentication flags | Existing historical authentication flags stay FALSE; add separate observed/reviewed coverage fields only after their exact requirements pass | Each flag stays FALSE until its specific authority-backed claim is demonstrated; no blanket authenticated=true |
| Storage/replay boundary | Durable captured-test index within the copied World/recorded audit dataset, tested on reload; backup/export manifest and reviewed final dataset | Authority-owned persistent uniqueness/commit index, external anchors/retention/rollback controls and documented authoritative ingestion |
| Limit | Cannot certify resistance to a dishonest GM/admin or missing/unobserved world history | Extra service/integration/operating scope; unsupported Foundry backend modification is not presumed permitted or feasible |
| Release | Full source/integration/Foundry/final safety gates still required | Same, plus demonstrated authority deployment/verification |

R is not retrospective recovery. Old HTML-only cards remain UNRECOVERABLE FROM CURRENT EVIDENCE. Missing ledger history is unknown, never default zero. A signed hash of a fabricated client event authenticates at most its submission/issuer, not that the event happened. S must authenticate execution/source observations; a service that merely signs submitted JSON does not meet its acceptance standard.

## R: reviewable implementation contract

This specifies future work in A05-A08/A10/A11, not new endpoints installed by this document.

1. Explicit Legacy-owned prospective audit only. CORE never starts a roll, changes rules/profile, spends, writes a ledger or commits progression. Preserve Legacy's different Wise semantics with explicit event kinds. Source-defined TB preview cases remain distinct from actual Legacy events.
2. Record world/test/session IDs, installed candidate source identity, Foundry build and profile/schema identity. Distinguish operation initiator, permission-observed subject and reviewing GM. Capture actual registered user identity and actual operation-time Actor ownership/permission observations, owned source Items, conditions, rewards and known counters. A declared owner list alone stays E0. Never infer player intent/consent from a GM message author.
3. Observe native base/result Rolls and parent/target lineage at each applicable stage before flattening. Record actual attempted and completed resource operations separately, expected/observed before/after balances and relevant source snapshots. An unexplained delta does not prove this test caused it.
4. Source change, lost permission, failed spend, unknown snapshot, malformed native history or conflicting test identity produces explicit INCOMPLETE with the earliest detected reason. Snapshot checks describe observed boundaries, not continuous monitoring of every transient client state. No reroll/re-spend/retry/rollback to repair diagnostic evidence.
5. Proposed record lifecycle: RESERVED/PENDING → observed events → RECORDED or INCOMPLETE. A record reaching RECORDED means scoped capture completed, never FULLY_REAUDITED. Storage reservation/commit must not silently alter live behavior; crashes and storage failures retain a detectable missing/pending state when storage is available. Never claim a cross-document gameplay/storage transaction.
6. Define a durable test/event index and storage schema before code. Its scope is the captured dataset, not every roll ever made in the world. Conflicting/repeated IDs, recovery after reload, deleted record/index mismatch and simultaneous writers must fail closed. Trusted admin can still alter both; do not claim independent anti-replay authentication.
7. Future fields may report operationPermissionObserved, sourceSnapshotCaptured, nativeHistoryConsistent, captureDatasetReplayChecked and runtimeReviewEvidenceId, each with documented stage/coverage. Existing actorSourceAuthenticated, rollSourceAuthenticated, gmPermissionAuthenticated, historicalRewardBalanceVerified, immutableChronologyVerified, duplicateTestCheckAuthenticated and completeTestHistoryVerified remain FALSE. No flag is set by this proposal.
8. A10 ties all required records to the shared final outcome/progression projections; A11 checks actual capture/control parity, two-client permission changes, private access/reload, interrupted operations and ledger/index behavior on Foundry13.351. Review report records dataset manifest and exact installed source/artifact identities. Release and FULLY_REAUDITED remain blocked until all applicable source/integration/runtime/final gates pass.

## S: requirements before any implementation or deployment

No external service, account, credential, key or backend modification is authorized by this proposal. First identify a supported authoritative integration capable of verifying user/session, Actor/Item/permission snapshots and actual native execution/resource operations. The public client API pages reviewed below do not establish such an attestation interface; that is a limitation of this inspection, not a proof no server integration can exist.

The design must specify authority identity, authenticated transport, snapshot/event binding, canonical schema, uniqueness/ordered ingestion, transaction/failure behavior, signing/verification key custody, rotation/revocation, receipt storage and access privacy, offline behavior, retention/backup/rollback coverage and threat-specific acceptance tests. A GM browser holding a signing secret is still a client under that GM's control. A separate collector cannot independently verify dice or resource causality without authoritative observation. If a supported authority cannot be identified, S remains blocked on feasibility rather than being implemented as a misleading signer.

## Exact proposed G3 change if R is selected

Replace the requirement for independently authenticated/immutable historical ownership and replay data with: complete **prospectively observed and reproducibly reviewed** Actor/user/GM/source/native event/resource/counter records for all required Package A routes under a stated trusted-GM model; durable dataset-scoped replay/commit checks; tested privacy/interruption/reload/concurrency and unchanged Legacy controls. Historical authentication and immutable/global-history flags remain FALSE; certificate/report must disclose this assurance boundary.

Retain G1 shared final-result requirements, every G2 source/model/exception requirement, G4 real Foundry13.351 A-D and G5 final candidate/reproducibility/protected release review. R does not remove A05 Ability/supply evidence, A08 full trace lifecycle or any required safe-refusal blocker. No other domain or M11 state is affected.

If S is selected, do not apply this change. Preserve the current stronger G3 wording, investigate a supported authority and prepare its concrete implementation/operating scope for approval before deployment.

## Evidence and verification required for this decision

A09's **proposal subtask** is delivered by this document. A09 itself closes only after an explicit recorded choice, reviewed acceptance wording and the authority/threat/evidence contract is settled. All implementation/runtime subcases retain their own OPEN status. User silence, elapsed time and a general approval to continue drafting are not a selection of R or S.

Current repository inspection: legacy-package-a-audit.mjs, m10d18-tb2e-package-a-legacy-observation.mjs, m10d18-tb2e-package-a-saved-legacy-audit.mjs and m10d18-tb2e-package-a-prospective-trace.mjs. G3 paths store mutable private ChatMessage/native/flag records and copy current client facts; they do not implement independently authenticated historical storage. Other subsystem sockets are not repurposed as an authority.

Official API reference: [Foundry v13 ChatMessage](https://foundryvtt.com/api/v13/classes/foundry.documents.ChatMessage.html) documents client-side data, visibility and mutable document operations; [BaseActor](https://foundryvtt.com/api/v13/classes/foundry.documents.BaseActor.html) and [BaseUser](https://foundryvtt.com/api/v13/classes/foundry.documents.BaseUser.html) provide actor/user document APIs. These describe APIs, not immutable roll-time attestation. Exact v13.351 runtime acceptance remains NOT RUN. Uploaded DH/SG provide the rule requirements through the existing matrix; they do not prescribe cryptographic provenance or these engineering assurance levels.

Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. Stable1.12.0/published QA1.13.0-qa.29/system/channels/READY frozen; 0/14 FULLY_REAUDITED; no release.
