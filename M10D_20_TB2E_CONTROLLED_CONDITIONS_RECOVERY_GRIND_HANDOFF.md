# M10D.20 — TB2E Conditions / Recovery / Grind Controlled Handoff

**Candidate:** v1.13.0-qa.21  
**Baseline:** v1.13.0-qa.20  
**Foundry target:** 13.351  
**Roadmap location:** M10D.4 Conditions / Recovery / Grind, executed as the next bounded M10D.10 Controlled Live Parity handoff  
**Status:** Candidate implementation; Foundry verification pending.

## Purpose

Reuse the existing TB2E read-only Condition, Recovery and Session/Grind shadows. Verify selected condition effects through the existing CORE M3 Test Engine and verify Grind/recovery previews in Foundry. This is a controlled QA handoff, not live Torchbearer play or a second rules engine.

Help is outside this QA slice, consistent with Per's direction that the existing help implementation is complete. Conflict automation remains source-blocked.

## Bounded cases

The handoff has 13 cases across four evidence domains:

- Conditions: Fresh modifies an eligible Skill test by +1d; Injured and Sick stack as -2d; Fresh does not modify Resources; a Skill reduced to zero is blocked and displays the Nature fallback boundary.
- Grind: an ordinary Test costs one previewed turn; an Instinct costs zero turns; an unspecified Spell turn cost remains unresolved rather than inferred.
- Recovery: Angry Camp recovery previews Will Ob 2 and one check; Afraid Town recovery without accommodation previews one Lifestyle cost; Hungry/Thirsty Camp recovery requires an allowed food skill and cooking while leaving its Obstacle unavailable; Exhausted retains the unresolved Camp/Town wording; Healer recovery for burns previews Healer Ob 4.
- Source boundary: conflicting Hungry/Thirsty, Exhausted, Injured and Sick conflict-disposition penalties remain explicitly unresolved and are not automated.

Condition dice cases use caller-supplied d6 faces and a caller-supplied Obstacle through CORE M3. Other cases are read-only plans and previews.

## Safety contract

- Runtime is exactly v1.13.0-qa.21 and the caller is GM.
- Legacy Mixed remains active. Torchbearer stays FOUNDATION_ONLY, READ_ONLY, unsupported, locked and inactive.
- No random roll, ChatMessage, Actor/Item/Journal/Setting write, check or Lifestyle spend, condition application/removal, Grind counter mutation, phase transition, profile switch, migration or Character Creation commit.
- Source-ambiguous behavior remains GM/manual or unavailable. No conflict disposition penalties, Hungry Camp Obstacle, Exhausted bonus stacking or event tables are inferred or automated.
- Evidence is memory-only and resets after reload.
- Stable remains v1.12.0. No PR14 work.

## Exit boundary

A pass closes only this 13-case M10D.20 handoff slice. It does not close M10D.4 or M10D.10, establish the complete Adventure-to-Camp/Town-to-Recovery loop, activate TB2E, or complete M10D.11 / M10D.12.

## QA evidence

- Runtime: `module/m10d20-tb2e-controlled-conditions-recovery-grind.mjs`
- Automation: `qa/m10d20-tb2e-controlled-conditions-recovery-grind-smoke.mjs`
- Foundry protocol: `TEST_PROTOCOL_v1.13.0-qa.21.md`
