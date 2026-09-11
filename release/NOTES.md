Realm Guard / Torchbearer v1.5.0-qa.3 — CORE M3 expanded real-roll shadow parity.

qa.2 verified real Legacy Mixed ↔ CORE parity for trained Skill, Ability and Automatic Versus with live CORE takeover still OFF. qa.3 expands that observer layer to Beginner's Luck and Fate/Open-6 supplemental dice.

New in v1.5.0-qa.3:
- instruments ordinary Beginner's Luck rolls in the real-roll parity observer
- adds `beginnerLuck` to the parity snapshot model
- captures Fate/Open-6 explosion dice through the existing legacy `_explodeSixes` helper
- extends TestEngine deterministic resolution with supplemental faces that do not alter the prepared base pool
- replays real base/reroll faces plus Fate supplemental faces through CORE
- compares the same five fields: pool, target, successes, outcome and margin
- retains Legacy final-success bridging for legal +success effects
- adds headless smoke coverage for Beginner's Luck and Fate supplemental faces

Deliberate limits:
- Test Engine live application remains OFF
- Legacy Mixed remains authoritative for all live preparation, dice, resources, advancement, chat and state mutation
- M2 Effect Engine remains SHADOW_COMPARE / live OFF with six verified providers
- Beginner's Luck Versus remains SKIPPED until opponent target capture is wired safely
- secondary Versus tiebreak resolution remains SKIPPED
- Fate is only shadow-replayed from the actual Legacy supplemental dice; CORE does not decide or spend Fate
- no migration, strict-profile correction or Conflict takeover

Expected live status:
- `game.realmGuard.core.phase` = M3
- Test Engine = SHADOW_PARITY / live OFF
- parity authority = LEGACY_MIXED
- instrumented methods include rollRole, rollAbility, rollBeginnerLuck, rollAutomaticVersus, rollNatureVersus
- supported special resolution includes FATE_OPEN_SIX
- M2 provider count remains 6

QA protocol: TEST_PROTOCOL_v1.5.0-qa.3.md
Foundry target: v13.351.
Approved development baseline: v1.5.0-qa.2 PASS.
