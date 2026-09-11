Realm Guard / Torchbearer v1.5.0-qa.9 — CORE M3 Custom Roll TestContext shadow parity.

qa.8 verified Recovery parity. qa.9 closes the final TestContext vocabulary gap by observing the existing Ranger-sheet Custom Roll / Free Dice Pool and replaying its real Legacy result through CORE as context `custom`.

New in v1.5.0-qa.9:
- preserves the existing Custom Roll UI and free-pool behavior
- observes Base Dice, Extra Dice, Persona dice, Obstacle, resolved d6 faces, optional Fate/Open-6 supplemental faces, successes, outcome and margin
- replays the completed Legacy result through CORE as TestContext `custom`
- compares the standard five parity fields: pool, target, successes, outcome, margin
- preserves the existing rule that an unlinked Custom Roll records no Learning/Advancement
- status now reports the complete TestContext coverage list and `remainingContextWork: []`

Full M3 TestContext coverage after qa.9:
- ordinary
- ability
- nature
- circles
- beginnerLuck
- versus
- recovery
- custom

Important preservation:
- Custom Roll remains a deliberately freeform table-adjudicated pool
- Conditions, Nature, Help and Learning are not inferred for Custom Roll
- Legacy Mixed remains sole live authority
- CORE remains SHADOW_PARITY / live OFF
- M2 Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- no migration, strict-profile correction or Conflict takeover

Remaining M3 work after qa.9:
- Custom Content Compatibility matrix
- final M3 promotion matrix / modifier-cancel-multiclient verification

QA protocol: TEST_PROTOCOL_v1.5.0-qa.9.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.8 PASS.
