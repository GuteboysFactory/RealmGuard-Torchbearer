# M10C.7 — MG2E Controlled Live Parity Execution

**Date:** 2026-10-03  
**Target build:** v1.12.0-qa.18  
**Foundry:** 13.351  
**Stable baseline:** v1.11.0 STABLE / GOLD  
**Status:** IMPLEMENTED — LIVE QA REQUIRED

## Purpose

M10C.7 executes the four bounded handoffs identified by M10C.6 inside the running Foundry QA environment without activating Mouse Guard 2E as a selectable world profile.

The milestone is deliberately narrower than profile activation. It proves that the source-owned MG2E adapters can be invoked through explicit runtime handoff gates while Legacy Mixed, Strict Realm Guard and MG1E remain untouched.

## Locked activation state

MG2E remains:

- Rules Profile version 3
- Character Creation Profile version 3
- `foundationOnly=true`
- `selectable=false`
- `supported=false`
- `liveRuleAuthority=false`
- `activationAvailable=false`
- no `switchToMg2e`
- no automatic profile switch
- no Actor / Item / Journal migration
- no automatic Wise conversion
- no species-to-rank inference
- no destructive conversion

## Controlled execution domains

Exactly four domains are executable in this milestone:

1. `WISE_EFFECTS`
2. `HELP`
3. `INVENTORY_GEAR`
4. `CONFLICT`

The runtime execution service is:

`module/m10c-mg2e-controlled-live-parity.mjs`

It exposes a bounded QA-only execution path and keeps evidence only in memory for the current runtime session.

## Wise Effects handoff

Controlled execution verifies:

- MG2E Wises remain unrated
- Deeper Understanding uses Fate
- Deeper Understanding rerolls at most one failed die
- the MG2E Wise adapter owns the route
- Legacy unrated-Wise auto-reroll behavior is not authorized

## Help handoff

Controlled execution verifies:

- typed Skill/Ability Teamwork = +1D
- I Am Wise is a separate support route
- I Am Wise replaces normal Help for that contribution
- Teamwork and I Am Wise cannot both be claimed for the same helper/test

## Inventory / Gear handoff

Controlled execution verifies:

- inventory policy = LOOSE
- MG2E carry guidance remains profile-owned
- relevant Gear may provide +1D only with GM approval
- MG1E weapon-catalog routing is not authorized

## Conflict handoff

Controlled execution verifies:

- Fight Defend = Nature
- Fight starting disposition skill = Fighter
- Fight starting disposition bases = Health / Nature
- MG2E 2015 weapon adapter resolves the test weapon
- MG2E armor adapter resolves the test armor
- MG1E weapon-catalog routing is not authorized

## Runtime evidence / zero-write boundary

The M10C.7 execution matrix begins each reload with all four domains in:

`READY_FOR_CONTROLLED_EXECUTION`

Each explicit QA handoff records ephemeral evidence:

- `EXECUTED_PASS`
- or `EXECUTED_FAIL`

No evidence is written to campaign documents or world settings.

Write contract:

- Actors: 0
- Items: 0
- Journals: 0
- settings: 0

## Readiness transition

Before all four domains pass:

- `LIVE_PARITY_QA = CONTROLLED_EXECUTION_IN_PROGRESS`
- `liveParityVerified=false`
- `EXPLICIT_ACTIVATION_MILESTONE = DEFERRED`

After all four domains pass in the same QA runtime:

- `LIVE_PARITY_QA = CLOSED`
- runtime `liveParityVerified=true`
- `EXPLICIT_ACTIVATION_MILESTONE = DEFERRED`
- decision = `NOT_READY_EXPLICIT_ACTIVATION_MILESTONE_REMAINS`
- next step = `M10C.8 MG2E Explicit Activation Milestone`

Static profile metadata deliberately remains `liveParityVerified:false` until a later release records the completed QA result. M10C.7 does not self-authorize activation.

## CORE API

Under:

`game.realmGuard.core.m10.mg2e`

M10C.7 exposes:

- `liveParityFoundationStatus()`
- `liveParityFoundationMatrix()`
- `liveParityStatus()`
- `liveParityMatrix()`
- `runControlledHandoff(domainId, payload?)`
- `resetControlledParity()`

## Promotion gate

M10C.7 closes only after the complete v1.12.0-qa.18 live protocol passes in Foundry VTT 13.351, including:

- all four controlled runtime handoffs
- readiness transition
- activation isolation
- zero-write verification
- Legacy Mixed / Strict / MG1E regression
- release/channel verification

Only then may M10C.8 begin.
