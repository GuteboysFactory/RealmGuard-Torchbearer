Realm Guard / Torchbearer v1.5.0-qa.5 — CORE M3 Beginner's Luck Versus shadow parity.

qa.4 verified Automatic Versus secondary tie-resolution parity. qa.5 closes the next M3 gap by feeding real Beginner's Luck Versus data into the same shadow comparison layer while keeping Legacy Mixed fully authoritative.

New in v1.5.0-qa.5:
- removes the previous Beginner's Luck Versus SKIP path
- marks Beginner's Luck parity snapshots explicitly as ordinary or Versus without changing the public TestContext type
- captures the real opponent target for Beginner's Luck Versus
- reconstructs non-tie opponent target from the completed Legacy outcome/margin when no secondary tie trace is required
- captures `_resolveAutomaticVersusTie` inputs/results when Beginner's Luck enters the existing Legacy tiebreak workflow
- replays captured Beginner's Luck Versus target and secondary tie data through CORE TestEngine
- compares the same five fields: pool, target, successes, outcome and margin
- adds headless smoke coverage for Beginner's Luck Versus PASS and resolved tiebreak FAIL

Deliberate limits:
- Test Engine live application remains OFF
- Legacy Mixed still owns Beginner's Luck pool construction, halving order, opponent rolls, Fate, tie dialogs, tiebreak dice, learning, chat and all state mutation
- CORE does not roll opponent or tiebreak dice; it only resolves captured/reconstructed real Legacy data
- M2 Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- no migration, strict-profile correction or Conflict takeover

Expected live status:
- `game.realmGuard.core.phase` = M3
- Test Engine = SHADOW_PARITY / live OFF
- parity authority = LEGACY_MIXED
- supported special resolution includes FATE_OPEN_SIX, AUTOMATIC_VERSUS_TIEBREAK and BEGINNER_LUCK_VERSUS
- Beginner's Luck Versus should now produce MATCH instead of SKIPPED
- M2 provider count remains 6

QA protocol: TEST_PROTOCOL_v1.5.0-qa.5.md
Foundry target: v13.351.
Approved development baseline: v1.5.0-qa.4 PASS.
