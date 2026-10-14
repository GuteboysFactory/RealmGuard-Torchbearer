# M10D.18 — Controlled TB2E Wises Handoff QA

**Candidate:** `codex/m10d-tb2e-wise-pilot`  
**Baseline:** qa.17 source and profile foundation  
**Foundry target:** 13.351  
**State:** QA instructions only; run after this candidate is packaged as an installable QA build.

This slice tests explicit routing to existing TB2E Wises plans. It must not apply a roll effect, spend Fate/Persona, write world data, switch profiles, or alter ordinary Legacy/MG2E rolls.

## Gate A — Runtime lock

- Install the QA build containing this change in a test world.
- Confirm GM can access `game.realmGuard.core.m10d.controlledWiseHandoff`.
- Confirm `getStatus()` reports `qaOnly=true`, `gmOnly=true`, `foundationLocked=true`, `activationAvailable=false`, `liveRuleAuthority=false`, zero writes and `evidenceStorage="IN_MEMORY_ONLY"`.
- Confirm `game.realmGuard.core.m10d.wises` still exposes the same existing shadow methods.

## Gate B — TB2E-owned plan routing

Run in the Foundry console:

```js
const handoff = game.realmGuard.core.m10d.controlledWiseHandoff;
handoff.run("I Am Wise", {hasWise:true, related:true, actingOnInstinct:true, context:"TEST"});
handoff.run("Deeper Understanding", {hasWise:true, related:true, failedDice:3, alreadyRerolledFailedDice:1, hasFate:true});
handoff.run("Of Course", {hasWise:true, related:true, failedDice:3, hasPersona:true});
```

Expected: the source is `TB2E_WISE_SHADOW`; results are `PLAN_ROUTED_NOT_APPLIED`; Deeper Understanding selects one eligible failed die; Of Course selects all failed dice and reports its ordering requirement.

Run rejection cases:

```js
handoff.run("Deeper Understanding", {hasWise:true, related:true, failedDice:1, alreadyRerolledFailedDice:0, hasFate:false});
handoff.run("Of Course", {hasWise:true, related:false, failedDice:2, hasPersona:true});
handoff.run("Free Reroll", {hasWise:true, related:true});
```

Expected: insufficient resource, unrelated Wise, and unknown effect are rejected; none falls back to another provider.

## Gate C — State and profile safety

Before and after Gate B, compare Actor, Item, Journal and active-profile/settings snapshots. They must be identical. Confirm:

- no roll is evaluated, no die is rerolled and no resource is spent;
- `getStatus()` still reports all writes as zero;
- the active profile is unchanged and Torchbearer remains non-selectable;
- a non-GM call is rejected with `GM_ONLY`;
- a non-QA runtime call is rejected with `QA_RUNTIME_REQUIRED`;
- `reset()` clears in-memory evidence only.

## Gate D — Regression

Run the complete repository smoke suite for the QA candidate. Confirm existing Legacy Mixed, Strict Realm Guard, MG1E, MG2E and normal roll behavior are unchanged. M10D.10 remains open until these checks and Foundry QA pass.

Passing this protocol closes only the controlled routing slice. It does not certify live Wises parity, resource spending, TB2E activation, or other M10D domains.
