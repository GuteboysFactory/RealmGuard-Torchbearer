# TEST PROTOCOL — v1.13.0-qa.20

## M10D.19 — Controlled TB2E Beginner's Luck / Nature Handoff
Foundry VTT 13.351 · baseline v1.13.0-qa.19 · next bounded M10D.10 handoff

QA20 routes source-bounded Beginner's Luck and Nature plans through the existing CORE M3 Test Engine using supplied deterministic d6 faces. It is QA evidence only; it does not activate Torchbearer or change a character.

### Gate A — Install and profile boundary

- Install v1.13.0-qa.20 in a QA world and reload.
- Keep **Legacy Mixed** active; do not select or activate Torchbearer.
- Run:
  ```js
  game.realmGuard.core.m10d.controlledBlNature.getStatus()
  ```
- Confirm phase M10D.19, qaRuntime=true, gmAuthority=true, sourceBounded=true, profileLocked=true, profileInactive=true, activationAvailable=false, controlledExecutionReady=true.
- Confirm liveParityVerified=false, activationAuthorized=false, profileSwitchAuthorized=false, creationCommitAuthorized=false, zero writes, and nine pending cases.
- Non-GM calls and any runtime other than qa.20 must reject.

### Gate B — Run all nine deterministic cases

Paste and run this block as GM:

```js
const t = game.realmGuard.core.m10d.controlledBlNature;
t.runHandoff("BL_WILL_POOL_PASS", {
  skillName: "Scout", abilityRating: 4,
  components: { helpDice: 1, gearDice: 1, traitsDice: 1, freshDice: 1 },
  obstacle: 3, faces: [4, 1, 5, 2, 6]
});
t.runHandoff("BL_HEALTH_POOL_PASS", {
  skillName: "Fighter", abilityRating: 3,
  components: { suppliesDice: 1, gearDice: 1, personaDice: 1 },
  obstacle: 2, faces: [4, 2, 3, 6]
});
t.runHandoff("BL_ZERO_ABILITY_BLOCKED", {
  skillName: "Scout", components: {}
});
t.runHandoff("NATURE_SUBSTITUTION_DESCRIPTOR_PASS", {
  currentNature: 4, maximumNature: 5, descriptorApplies: true,
  basePool: 2, obstacle: 3, targetSkill: "Scout", faces: [4, 1, 5, 2, 6, 1]
});
t.runHandoff("NATURE_SUBSTITUTION_OUTSIDE_FAIL", {
  currentNature: 4, maximumNature: 5, descriptorApplies: false,
  basePool: 2, obstacle: 3, targetSkill: "Scout", faces: [4, 1, 2, 3, 1, 1]
});
t.runHandoff("NATURE_CHANNEL_PASS", {
  currentNature: 3, maximumNature: 4, descriptorApplies: true,
  testName: "Scout", targetSkill: "Scout", personaAvailable: 1,
  basePool: 2, obstacle: 2, faces: [4, 5, 1, 2, 3]
});
t.runHandoff("NATURE_CHANNEL_RESOURCES_BLOCKED", {
  currentNature: 3, maximumNature: 4, descriptorApplies: false,
  testName: "Resources", personaAvailable: 1
});
t.runHandoff("NATURE_ADVANCEMENT_MAX7_CURRENT6", {
  currentNature: 5, maximumNature: 6
});
t.runHandoff("NATURE_ADVANCEMENT_CURRENT7", {
  currentNature: 6, maximumNature: 6
});
t.getStatus();
```

Expected:
- Status reports **9/9 passed**, zero failed and no pending cases.
- Beginner's Luck maps Scout to Will and Fighter to Health; both supplied pools resolve PASS.
- Zero ability is blocked before M3, even without an injury/sickness flag.
- Nature substitution within a descriptor passes with no tax; outside a descriptor the supplied result fails by 2 and previews 2 Nature tax.
- Channel Nature passes within a descriptor; Persona cost is shown as a preview and not spent.
- Channel Nature for Resources is rejected before M3.
- Maximum Nature reaching 7 while current Nature reaches only 6 does not request retirement review. Current Nature reaching 7 requests manual review at end of session.
- Each test row identifies the TB2E-owned route to CORE M3 and says supplied faces were evaluated. Planning-only advancement rows do not evaluate dice.

### Gate C — Isolation and no writes

- Keep Legacy Mixed active and the TB2E profile FOUNDATION_ONLY, READ_ONLY, locked and inactive.
- Compare Actor, Item, Journal, Setting and ChatMessage state before and after; they must be identical.
- Confirm no random dice, resource spend, tax application, advancement, trait change, retirement, consequence, profile switch or migration.
- Confirm Legacy Mixed, Strict RG, MG1E and MG2E are unchanged.

### Gate D — Reload and stop boundary

- Reload Foundry, then run `t.getStatus()` again.
- Confirm evidence reset: zero executed cases and nine pending.
- Stop and report FAIL if a random die is rolled, any document/chat/resource is changed, tax is applied, a profile is activated, or any Legacy/MG fallback is used.

Report Gate A–D PASS/FAIL. A pass closes only this nine-case handoff slice. It does not mean TB2E is activated or fully playable, and does not close M10D.10, M10D.11 or M10D.12. Stable remains v1.12.0. Do not test Help, Wises, Traits, Versus, Conditions/Recovery, Grind, Conflict automation, Character Creation commit, or PR14.
