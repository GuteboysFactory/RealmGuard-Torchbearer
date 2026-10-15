# TEST PROTOCOL — v1.13.0-qa.21

## M10D.20 — Controlled TB2E Conditions / Recovery / Grind Handoff
Foundry VTT 13.351 · baseline v1.13.0-qa.20 · bounded M10D.4 handoff under M10D.10

QA21 reuses existing read-only TB2E shadows. Three condition-effect cases use caller-supplied deterministic d6 faces through CORE M3. Other cases inspect Grind and recovery previews. No rule is applied to a character.

### Gate A — Install and profile boundary

- Install v1.13.0-qa.21 in the QA world and reload.
- Keep **Legacy Mixed** active; do not select or activate Torchbearer.
- In the Foundry console as GM, run:
  ```js
  game.realmGuard.core.m10d.controlledConditionsRecoveryGrind.getStatus()
  ```
- Confirm phase `M10D.20`, `qaRuntime=true`, `gmAuthority=true`, `sourceBounded=true`, `profileLocked=true`, `profileInactive=true`, `activationAvailable=false`, and `controlledExecutionReady=true`.
- Confirm `liveParityVerified=false`, activation/profile-switch/creation-commit authorization all false, zero writes, memory-only evidence, and **13 pending cases**.
- Confirm the listed source boundaries remain visible. Non-GM calls and any runtime other than qa.21 must reject.

### Gate B — Run all 13 deterministic handoff cases

Paste the block as GM. It uses only supplied faces and previews; do not add or change a character.

```js
const c = game.realmGuard.core.m10d.controlledConditionsRecoveryGrind;
c.runHandoff("CONDITION_FRESH_SKILL_M3_PASS", {
  basePool: 2, obstacle: 2, faces: [4, 1, 5]
});
c.runHandoff("CONDITION_INJURED_SICK_M3_PASS", {
  basePool: 4, obstacle: 2, faces: [4, 5]
});
c.runHandoff("CONDITION_RESOURCES_FRESH_NO_BONUS", {
  basePool: 2, obstacle: 2, faces: [4, 1]
});
c.runHandoff("CONDITION_ZERO_SKILL_BLOCKED", {});
c.runHandoff("GRIND_TEST_TURN", {});
c.runHandoff("GRIND_INSTINCT_ZERO", {});
c.runHandoff("GRIND_SPELL_SOURCE_REQUIRED", {});
c.runHandoff("RECOVERY_ANGRY_CAMP_PREVIEW", {});
c.runHandoff("RECOVERY_AFRAID_TOWN_COST_PREVIEW", {});
c.runHandoff("RECOVERY_HUNGRY_CAMP_NO_OB", {});
c.runHandoff("RECOVERY_EXHAUSTED_SOURCE_BOUNDARY", {});
c.runHandoff("RECOVERY_HEALER_INJURY_PREVIEW", {});
c.runHandoff("CONFLICT_CONDITION_PENALTY_MANUAL", {});
c.getStatus();
```

Expected:

- Status reports **13/13 passed**, zero failed and no pending cases.
- Fresh adds +1d to an eligible Skill test through M3, but not to Resources.
- Injured and Sick together apply -2d to the supplied Health/Skill family test; dice and Obstacle are caller-supplied and no other factors are automated.
- A Skill reduced to zero is blocked; the Nature fallback is shown without resolving it.
- Ordinary Tests preview one Grind turn; Instincts preview zero; an unspecified spell cost remains unresolved.
- Recovery cases show their source-supported ability, Obstacle, check/Lifestyle cost preview, or manual boundary. Nothing is spent or removed.
- The four-condition Conflict disposition remains unresolved and unautomated.
- Every row reports no live application, random roll, spend, phase/turn/condition mutation, or document/chat write.

### Gate C — Isolation and no writes

- Leave Legacy Mixed active and Torchbearer FOUNDATION_ONLY, READ_ONLY, locked and inactive.
- Compare Actor, Item, Journal, Setting and ChatMessage state before and after; they must be identical.
- Confirm no random dice, check/Lifestyle spend, condition application/removal, turn or phase change, profile switch, migration or fallback to Legacy/MG rules.
- Confirm Legacy Mixed, Strict Realm Guard, MG1E and MG2E still behave as before.

### Gate D — Reload and stop boundary

- Reload Foundry, then run:
  ```js
  game.realmGuard.core.m10d.controlledConditionsRecoveryGrind.getStatus()
  ```
- Confirm evidence reset: zero executed cases and **13 pending**.
- Stop and report FAIL if a random die is rolled, any document/chat/resource/condition/turn/phase changes, any profile activates, or any unresolved source boundary is automated.

Report Gate A–D PASS/FAIL. A pass closes only this 13-case handoff slice. It does not complete M10D.4 / M10D.10, activate TB2E, or prove the full Adventure / Camp / Town / Recovery loop. Stable remains v1.12.0. Do not test Help, Wises, Traits, Versus, Inventory, Conflict automation, Character Creation commit, or PR14.
