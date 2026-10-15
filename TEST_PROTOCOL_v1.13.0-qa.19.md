# TEST PROTOCOL — v1.13.0-qa.19

## M10D.18 — Controlled TB2E Basic Test Handoff
Foundry VTT 13.351 · baseline v1.13.0-qa.18 · second bounded M10D.10 handoff

This QA candidate connects the existing TB2E Tests/Dice shadow to the existing CORE M3 Test Engine for deterministic ordinary Ob Tests. The GM supplies the source label, pool, Obstacle, modifiers and d6 faces. The system evaluates those supplied faces through M3 and reports memory-only evidence.

This is not a random roll or ordinary TB2E play. Do not activate/switch to Torchbearer. Skill Obstacle factors remain caller/GM supplied because they are not established by the provided guides.

### Gate A — QA/runtime and profile boundary

- Install v1.13.0-qa.19 in a QA world; reload and confirm no boot errors.
- Keep Legacy Mixed active.
- Run:
  ```js
  game.realmGuard.core.m10d.controlledTests.getStatus()
  ```
- Confirm phase M10D.18, qaRuntime=true, gmAuthority=true, sourceBounded=true, profileLocked=true, profileInactive=true, activationAvailable=false, controlledExecutionReady=true.
- Confirm liveParityVerified=false, activationAuthorized=false, profileSwitchAuthorized=false, creationCommitAuthorized=false, randomRollExecuted=false, and all writes are zero.
- As a non-GM, the handoff must reject. A non-qa.19 runtime must reject. Never switch on the Torchbearer profile.

### Gate B — Deterministic Test handoff cases

Run all six cases through the GM QA API:

```js
const t = game.realmGuard.core.m10d.controlledTests;
t.runHandoff("OB_PASS", {
  sourceName: "Fighter", basePool: 3, obstacle: 2, faces: [4, 2, 6]
});
t.runHandoff("OB_FAIL", {
  sourceName: "Fighter", basePool: 3, obstacle: 2, faces: [1, 2, 3]
});
t.runHandoff("DICE_MODIFIER", {
  sourceName: "Fighter", basePool: 3, diceModifier: 1, obstacle: 2, faces: [4, 5, 1, 2]
});
t.runHandoff("SUCCESS_MODIFIER", {
  sourceName: "Fighter", basePool: 3, successModifier: 1, obstacle: 2, faces: [4, 1, 2]
});
t.runHandoff("INVALID_DICE_COUNT", {
  sourceName: "Fighter", basePool: 3, obstacle: 2, faces: [4, 1]
});
t.runHandoff("INVALID_DIE_FACE", {
  sourceName: "Fighter", basePool: 3, obstacle: 2, faces: [1, 2, 8]
});
t.getStatus();
```

Expected:
- OB_PASS: 2 successes against Ob 2, PASS.
- OB_FAIL: 0 successes against Ob 2, FAIL by 2.
- DICE_MODIFIER: M3 receives four dice and resolves PASS.
- SUCCESS_MODIFIER: one rolled success plus +1 success resolves PASS.
- Invalid count and invalid face: rejected and counted as expected pass cases.
- Each row reports provider TB2E_M10D_TEST_SHADOW_TO_CORE_M3 and route TORCHBEARER2E_TEST_SHADOW_TO_EXISTING_CORE_M3.
- Status reports 6/6 passed, zero failed and no pending cases.

### Gate C — Source, state and isolation

- Confirm the Obstacle remains caller-supplied and obstacleFactorsAutomated=false.
- Confirm the supplied faces were evaluated deterministically; randomRollExecuted=false.
- Confirm the profile remains FOUNDATION_ONLY, READ_ONLY, inactive and locked.
- Before/after Actor, Item, Journal, Setting and ChatMessage snapshots must be identical.
- Confirm no resource spend, advancement, test consequence, profile switch or migration.
- Existing Legacy Mixed, Strict RG, MG1E and MG2E behavior and profiles remain unchanged.

### Gate D — Ephemeral evidence and stop condition

- Evidence is MEMORY_ONLY. Reload the Foundry world and confirm the matrix resets to six pending cases.
- A pass closes only this deterministic controlled Test handoff slice. It does not prove ordinary TB2E playability, general live Test parity, M10D.10 completion, M10D.11 activation or M10D.12 Core Live / Stable.
- Stop and report FAIL if a random die is rolled, a ChatMessage/document/resource is written, an obstacle factor is inferred, a fallback provider is used, or Torchbearer becomes active/selectable.

Report Gate A–D PASS/FAIL. Stable remains v1.12.0. Do not test Versus, Help, Beginner’s Luck, Wises, Nature, Test consequences, Character Creation commit, Conflict automation or PR14.
