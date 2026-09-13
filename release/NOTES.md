Realm Guard / Torchbearer v1.6.0-qa.2 — CORE M4 Real TEST_RESOLVED Advancement Shadow.

v1.6.0-qa.1 verified the M4 service foundation. qa.2 connects completed real Legacy Mixed tests to the CORE domain event bus so AdvancementService can shadow-evaluate actual gameplay results while Legacy remains the sole live writer of Learning and Advancement state.

New in qa.2:
- adds `m4-advancement-shadow-bridge.mjs`
- observes real Legacy `rollRole`, `rollAbility`, `rollBeginnerLuck`, `rollAutomaticVersus` and `rollNatureVersus` completions
- captures the real Learning checkbox decision from the Legacy Roll Dialog
- emits observer-only `TEST_RESOLVED` domain events after completed Legacy tests
- links M4 advancement observations to the latest matching M3 parity result when available
- preserves Legacy Automatic Versus `learningResult:null` semantics rather than inventing an advancement mark after secondary tie resolution
- adds AdvancementService summary diagnostics
- keeps Custom Roll deliberately outside AdvancementService because the free pool has no Learning/Advancement contract
- adds headless advancement-shadow semantics smoke QA

Important preservation:
- Legacy Mixed remains sole live authority
- AdvancementService remains recommendation/shadow only
- no Skill Pass/Fail mark, Ability mark, Beginner's Luck attempt or rating is written by CORE
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- M4 remains SHADOW_SERVICES / live OFF
- Conflict remains on the Legacy adapter path until M6
- no destructive migration or strict-profile correction

QA protocol: TEST_PROTOCOL_v1.6.0-qa.2.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.1 PASS.
