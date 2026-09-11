Realm Guard / Torchbearer v1.5.0-qa.8 — CORE M3 Recovery TestContext shadow parity.

qa.7 verified semantic TestContext classification for ordinary Skill, Ability, Nature, Circles, Beginner's Luck and Versus paths. qa.8 closes the next M3 context gap by identifying real Legacy recovery rolls and replaying them through CORE as `recovery` without changing the existing live recovery workflow.

New in v1.5.0-qa.8:
- identifies the existing Ranger-sheet Recovery flow from its Legacy `ignoreConditions: true` roll signature
- classifies both Ability-based and trained-Skill recovery rolls as TestContext `recovery`
- preserves the real Legacy recovery Obstacle, pool, resolved faces, successes, outcome and margin
- replays those values deterministically through CORE and compares the same five parity fields
- adds headless recovery parity smoke coverage for both Ability recovery and Role/Skill recovery
- status now reports `recovery` in contextCoverage and leaves only `custom` in remainingContextWork

Important preservation:
- Recovery legality, canonical recovery order, GM/Players' Turn Check economy, retry limits and Condition clearing remain entirely Legacy-owned
- CORE does not clear Conditions, spend Checks, mark recovery attempts, or roll dice
- recovery rolls still deliberately ignore the active Condition penalty where the Legacy workflow passes `ignoreConditions: true`
- ordinary Ability/Skill rolls must remain classified as their normal contexts and must not leak into recovery

Preserved from earlier M3 QA:
- Legacy Mixed remains sole live authority
- Test Engine remains SHADOW_PARITY / live OFF
- Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- Beginner's Luck Versus, Automatic Versus/tiebreak, Nature Versus and Fate/Open-6 parity remain intact
- no migration, strict-profile correction or Conflict takeover

Remaining M3 work after qa.8:
- Custom Roll parity
- Custom Content Compatibility matrix
- final M3 promotion matrix / modifier-cancel-multiclient verification

QA protocol: TEST_PROTOCOL_v1.5.0-qa.8.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.7 PASS.
