Realm Guard / Torchbearer v1.5.0-qa.4 — CORE M3 Automatic Versus tie-resolution shadow parity.

qa.3 verified ordinary Beginner's Luck and Fate/Open-6 supplemental dice parity. qa.4 closes the next M3 gap by shadow-replaying resolved Automatic Versus secondary tie procedures through CORE while keeping Legacy Mixed fully authoritative.

New in v1.5.0-qa.4:
- adds a pure TestEngine Versus secondary-resolution stage
- removes the previous Automatic Versus resolved-tiebreak SKIP path
- captures Legacy Automatic Versus tieResolution data after the real Legacy procedure completes
- CORE independently evaluates supported tie outcomes from captured tiebreak faces / resolution method
- supports tiebreaker roll, trait-yield, Fate-resolved tie, second-trait, second-Fate and GM-wins semantics in the pure resolver
- preserves the original five parity fields: pool, target, successes, outcome and margin
- adds headless smoke coverage for resolved tiebreak PASS, trait FAIL and GM-wins FAIL

Deliberate limits:
- Test Engine live application remains OFF
- Legacy Mixed still owns the actual tie dialog, tiebreak dice, Fate spending, checks, chat, learning and all state mutation
- CORE does not roll additional live tiebreak dice; it only resolves captured real Legacy data
- unresolved player-vs-player GM-decision ties remain TIE diagnostics
- Beginner's Luck Versus remains SKIPPED until its opponent target/result capture is wired safely
- M2 Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- no migration, strict-profile correction or Conflict takeover

Expected live status:
- `game.realmGuard.core.phase` = M3
- Test Engine = SHADOW_PARITY / live OFF
- parity authority = LEGACY_MIXED
- supported special resolution includes FATE_OPEN_SIX and AUTOMATIC_VERSUS_TIEBREAK
- Automatic Versus resolved secondary tiebreak should now produce MATCH instead of SKIPPED
- M2 provider count remains 6

QA protocol: TEST_PROTOCOL_v1.5.0-qa.4.md
Foundry target: v13.351.
Approved development baseline: v1.5.0-qa.3 PASS.
