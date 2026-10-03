# M10C.6 — MG2E Live Parity QA Foundation

Date: 2026-10-03  
Target: Foundry VTT 13.351  
QA candidate: v1.12.0-qa.17

## Purpose

M10C.6 establishes the zero-write foundation required to run a later controlled MG2E live-parity handoff. It does **not** activate the MG2E Rules Profile and it does **not** claim that live parity has already been observed.

M10C.5 closed the technical Recruitment and Rules Reference blockers. M10C.6 now maps each source-owned MG2E domain to a deterministic candidate provider and the live surface that must be exercised in a later bounded milestone.

## Locked activation state

MG2E remains:

- Rules Profile v3
- FOUNDATION_ONLY
- non-selectable
- unsupported
- liveRuleAuthority = false
- activationAvailable = false
- no `switchToMg2e`
- no Actor / Item / Journal / world-setting migration

## Live-parity foundation matrix

The M10C.6 provider covers 13 source-owned domains:

1. Tests
2. Advancement / Beginner's Luck
3. Traits
4. Wise effects
5. Help
6. Nature
7. Conditions / Recovery
8. Inventory / Gear
9. Conflict
10. Session / Circles / Progression
11. Natural Order
12. Character Creation
13. Rules Reference

Every domain must resolve a deterministic candidate contract before M10C.6 can report `foundationReady:true`.

Four domains intentionally remain explicit controlled handoffs rather than being silently connected to live Actor/Conflict execution:

- WISE_EFFECTS
- HELP
- INVENTORY_GEAR
- CONFLICT

These use the source-owned MG2E adapters established in M10C.3. This prevents MG2E Wises from falling through the Legacy unrated-Wise reroll path and prevents MG2E 2015 weapons/armor from being routed through the MG1E catalog.

## Generic routing hardening

M10C.6 extends the generic capability router so MG2E Session and Circles semantics are recognized as MG-family semantics. M10B.6 source ownership is now edition-aware:

- MG1E -> `MG1E_2008`
- MG2E -> `MG2E_2015`
- Legacy -> `LEGACY_CURRENT`

This is read-only policy routing and does not activate MG2E.

## Readiness audit transition

The historical M10C.4 audit remains the audit provider, but the LIVE_PARITY_QA blocker may now advance from:

`BLOCKED_NOT_RUN`

to:

`FOUNDATION_READY_NOT_RUN`

when the 13-domain matrix is green.

This is **not** closure of live parity. It means the next bounded milestone can execute controlled live handoffs without enabling profile activation.

Expected remaining blockers after M10C.6:

- LIVE_PARITY_QA = FOUNDATION_READY_NOT_RUN
- EXPLICIT_ACTIVATION_MILESTONE = DEFERRED

Expected decision:

`NOT_READY_CONTROLLED_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN`

## Data safety

M10C.6 itself plans or executes:

- Actor writes: 0
- Item writes: 0
- Journal writes: 0
- settings writes: 0
- destructive migration: false
- existing Actor mutation: false

Legacy Mixed, Strict Realm Guard and MG1E remain unchanged.

## Closure gate

M10C.6 closes only after:

- all 13 matrix domains report `foundationReady:true`
- the four controlled handoff domains are explicit
- MG2E activation remains unavailable
- no `switchToMg2e` exists
- readiness audit reports FOUNDATION_READY_NOT_RUN rather than live parity verified
- Legacy / Strict / MG1E regressions remain green in Foundry VTT 13.351
- QA release/channel verification passes

## Next bounded slice

**M10C.7 — MG2E Controlled Live Parity Execution**

M10C.7 may execute the candidate handoffs under QA control. Actual MG2E selectable activation remains a separate explicit milestone.
