# M10C.8 — MG2E Explicit QA Activation

Date: 2026-10-03
Target: Foundry VTT 13.351
Candidate: v1.12.0-qa.19

## Entry evidence and authorization

The user confirmed the first option: the complete M10C.7 / v1.12.0-qa.18 live protocol is FULL PASS in Foundry VTT 13.351, including four controlled handoffs, activation isolation, zero-write checks and Legacy/Strict/MG1E regression. The user requested M10C.8 explicitly. This milestone records that prior-release result and authorizes selectable MG2E in QA builds. Automated tests do not stand in for that human live result.

## Activation contract

- MG2E Rules Profile v3 and Character Creation Profile v3 remain independently source-owned.
- Metadata: QA_ACTIVE, foundationOnly=false, selectable=true, supported=true, liveRuleAuthority=true, qaActivationOnly=true.
- liveParityVerified=true refers to the completed qa.18 gate, with explicit release and evidence authority fields.
- Explicit activation authorization and prior parity verification are both required by the generic activation router.
- A GM may choose MG2E in Profile Management or call game.realmGuard.core.m10.switchToMg2e(). No automatic switch occurs.
- Switching writes only activeRulesProfileId and activeRulesProfileVersion. Failure restores both prior values and the prior runtime snapshot. Repeating the same switch is idempotent.
- Stable-runtime MG2E switching remains rejected. Legacy rollback and supported Strict activation remain available; MG1E stays QA-only.
- Reload is required after a profile switch for live QA.

## Live routing

- Actor Wise selection calls the MG2E source adapter before Fate/open sixes. The user may keep the roll, spend 1 Fate for Deeper Understanding (choose one eligible failed die), or spend 1 Persona for Of Course (reroll all eligible failed dice).
- There is no free Legacy unrated-Wise reroll and no rated-Wise self +1D. Existing stored ratings remain untouched. Already-rerolled dice can be excluded by the helper's explicit index contract.
- MG2E Help uses typed sources. Ability tests accept Ability Help or an ally's I Am Wise; Skill tests accept Skill Help or I Am Wise. A helper supplies one accepted source per test, not both. I Am Wise has no helper condition risk but retains twist risk; consequences remain GM adjudication.
- Traits use MG2E L1 once/session, L2 twice/session and L3 +1 success on applicable tests; MG1E traits retain their separate rules.
- Generic Conflict routing recognizes MG2E, including Fight Defend=Nature and Fighter+Health/Nature disposition. Physical weapon evaluation calls MG2E 2015 adapters. Halberd does not use MG1E mode selection; Realm Guard Whip is not inferred as an MG2E Hook and Line.
- The MG2E source armor planner exposes light/heavy absorption, use limits and the mace exception. Armor absorption, carry limits, narrative weapon exceptions and Wise usage-cycle benefits are guided table/GM operations rather than automatic document edits.
- Active MG2E Recruitment enables its existing transactional CORE M9 commit authority; inactive profiles remain preview-only. This can create explicitly requested new characters, but it never migrates existing Actors.
- Profile Management uses the MG2E conversion preview for MG2E switches. The Registry and roll selectors explain the new QA behavior.

## Status and diagnostics

The readiness audit reports READY_EXPLICIT_QA_ACTIVATION and closed implementation blockers. This describes implementation authorization, not completion of qa.19 live activation QA. Stable availability is still false.

The 13-domain foundation matrix remains a read-only candidate contract and continues to report liveParityVerified=false. The runtime controlled-parity status separately reports persisted qa.18 evidence and runtimeParityVerified. A fresh runtime or reset clears diagnostic rows, not the confirmed prior-release result. Re-running diagnostics does not switch the profile or authorize a new release.

## Preserved data

No Actor/Item/Journal migration, Wise conversion, species-to-rank inference, inventory placement rewrite, Condition deletion, provenance rewrite or destructive conversion is introduced. Existing progression, rated Wise fields, inactive Conditions, Gear placement and Creation provenance are preserved across profile round-trips. Only explicit gameplay/Recruitment operations under the selected profile may write their ordinary data.

## Validation and closure

The new smoke covers stable and GM rejection, settings-only switching, partial-write rollback, idempotence, existing-data preservation, active creation authority, MG2E weapon/armor adapters and the Actor Wise reroll path with resource costs and invalid reroll rejection. Historical source/zero-write regression tests now assert the current M10C.8 activation state while retaining their domain and stable rejection checks.

Release publication requires full syntax, preflight and smoke regression, followed by package verification and QA-channel promotion. M10C.8 remains open until TEST_PROTOCOL_v1.12.0-qa.19.md passes in Foundry v13.351. Stable MG2E promotion requires a later explicit decision.
