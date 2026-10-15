# TEST PROTOCOL — v1.13.0-qa.18

## M10D.17 — Controlled TB2E Wises QA Handoff
Foundry VTT 13.351 · baseline v1.13.0-qa.17 · first pilot only

This candidate adds an explicit QA-only, GM-only runtime handoff for the qa.17 VERIFIED Wises shadow adapter. It selects and records source-owned plans only. TB2E remains FOUNDATION_ONLY, non-selectable, unsupported, inactive and without live rule authority.

### Gate A — Runtime and locked-profile boundary

- Install v1.13.0-qa.18 in a QA world; reload with no boot errors.
- Run `game.realmGuard.core.m10d.controlledWises.getStatus()`.
- Confirm `phase=M10D.17`, `qaRuntime=true`, `gmAuthority=true`, `sourceVerified=true`, `profileLocked=true`, `profileInactive=true`, `activationAvailable=false`, `controlledExecutionReady=true`.
- Confirm `liveParityVerified=false`, `activationAuthorized=false`, `profileSwitchAuthorized=false`, `creationCommitAuthorized=false`, and all writes are zero.
- As a non-GM, the runtime handoff rejects. On Stable or a non-1.13 QA runtime, it rejects. Do not activate or switch the TB2E profile.

### Gate B — Supported source-owned plans

Run each explicitly through the QA API:

```js
const w = game.realmGuard.core.m10d.controlledWises;
w.runHandoff("I Am Wise", { hasWise: true, related: true, actingOnInstinct: true });
w.runHandoff("Deeper Understanding", { failedDice: 3, alreadyRerolledFailedDice: 2, hasFate: true });
w.runHandoff("Of Course", { failedDice: 3, hasPersona: true });
w.getStatus();
```

- I Am Wise: one die, replaces Skill Help, no cost, twist risk retained, works while acting on Instinct.
- Deeper Understanding: plan for one eligible failed die and one Fate; already-rerolled dice are excluded.
- Of Course: plan for all failed dice and one Persona; must precede Deeper Understanding when both are intended.
- Evidence reports the TB2E source-owned provider and selected effect.

### Gate C — Fail-closed input and zero-write boundary

Run rejected cases with `expectRejected: true`:

- Missing Wise: `WISE_REQUIRED`.
- Unrelated Wise: `WISE_NOT_RELATED`.
- Missing Fate/Persona: `INSUFFICIENT_FATE` / `INSUFFICIENT_PERSONA`.
- No eligible failed die: `NO_ELIGIBLE_FAILED_DIE`.
- Unknown effect: `UNKNOWN_WISE_EFFECT`.

For all cases confirm `liveApplication=false`, no dice evaluation/reroll, no Fate/Persona spend, and zero Actor/Item/Journal/Setting writes. Before/after snapshots of campaign documents and profile settings must be identical. Existing Legacy Mixed, Strict RG, MG1E and MG2E behavior must remain unchanged.

### Gate D — Ephemeral evidence and stop condition

- Run all nine required plan cases. Confirm `controlledWises.getStatus()` reports 9/9 required cases passed and no pending cases.
- Runtime evidence is `MEMORY_ONLY`; reload and confirm the handoff matrix resets to pending.
- A passing handoff closes only this bounded QA execution slice. It does not prove Wises live parity, ordinary TB2E test playability, M10D.10 completion, M10D.11 activation, or M10D.12 Core Live.
- Stop if any rule is applied, any die is evaluated/rerolled, any resource or document is changed, or any fallback provider is used.

Report Gate A-D PASS/FAIL. Stable remains v1.12.0. Do not test source-blocked domains, Character Creation commit, Conflict automation, or PR14.
