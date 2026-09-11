Realm Guard / Torchbearer v1.5.0-qa.7 — CORE M3 semantic TestContext parity expansion.

qa.6 verified the previously inaccessible Beginner's Luck Versus gameplay path through the normal Ranger-sheet UI, including a deeper second-tie -> GM-wins branch. qa.7 continues M3 by making the CORE shadow layer classify real Legacy tests with their actual semantic TestContext instead of flattening all Ability-family tests into ordinary.

New in v1.5.0-qa.7:
- expands parity snapshot acceptance to the full Test Engine context vocabulary
- trained Skill remains ordinary
- Will / Health / Resources are classified as ability
- Nature tests are classified as nature
- Circles tests are classified as circles
- Nature Versus is classified as nature + versus=true
- preserves Beginner's Luck, Automatic Versus and Fate/Open-6 parity from qa.6
- exposes contextCoverage and remainingContextWork in testParity status

Current parity context coverage after qa.7:
- ordinary
- ability
- nature
- circles
- beginnerLuck
- versus

Remaining M3 context work after this build:
- recovery
- custom
- broader full-matrix modifier/cancel/multiclient promotion coverage before M3 can be considered complete

Preserved:
- Legacy Mixed remains sole live authority
- Test Engine remains SHADOW_PARITY / live OFF
- Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- no strict-profile rule correction
- no migration or gameplay takeover

QA protocol: TEST_PROTOCOL_v1.5.0-qa.7.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.6 PASS.
