# M10D.19 — TB2E Beginner's Luck / Nature Controlled Handoff

**Candidate:** v1.13.0-qa.20  
**Baseline:** v1.13.0-qa.19  
**Foundry target:** 13.351  
**Roadmap location:** M10D.3 source-bounded Tests / Beginner's Luck / Nature, executed as the next bounded M10D.10 Controlled Live Parity handoff  
**Status:** Candidate implementation; Foundry verification pending.

## Purpose

Carry forward the existing TB2E read-only shadows and verify representative Beginner's Luck and Nature tests through the existing CORE M3 Test Engine. This is a deterministic QA handoff, not a new rules engine or ordinary TB2E play.

The handoff uses:
- TB2E Beginner's Luck ability mapping and pool plan.
- TB2E Nature substitution/channel plans and outcome-based tax previews.
- The existing CORE M3 Test Engine with caller-supplied deterministic d6 faces.
- The existing GM-only, QA-only, locked-profile pattern.

## Source-bounded behavior

The supplied Torchbearer 2E Quick Rules Guide describes Beginner's Luck pool ordering, Will/Health skill mappings, Nature substitution, Channel Nature, tax, and retirement timing (physical pages 7, 10–11, 14–19). The Character Creation Guide supplies stock Nature descriptors and starting Nature context (physical pages 26–30).

QA20 checks:
- Beginner's Luck uses its mapped Will or Health ability, halves ability/Wises/Help/supplies/gear together with upward rounding, then adds the documented post-halving sources.
- Beginner's Luck fails closed when the mapped ability is zero; a caller cannot bypass this by omitting a separate injury/sickness flag.
- Nature substitution and Channel Nature use current Nature dice, preserve caller-supplied Obstacle, and generate tax previews from the deterministic M3 outcome.
- Channel Nature is rejected for Resources and Circles and reports the Persona cost without spending it.
- Retirement at Nature 7 is only flagged for manual end-of-session review when **current Nature** reaches 7; reaching Maximum Nature 7 while current Nature remains below 7 does not trigger that review. No retirement is automatic.
- Missing-tool penalties, applicability/narrative decisions, tax application, advancement mutation, trait changes, resource spends, and retirement decisions remain manual or preview-only.

The supplied source matrix remains the authority for unresolved source gaps. QA20 does not infer full skill Obstacle factors or import Legacy/MG behavior.

## Controlled handoff cases

1. Beginner's Luck / Will skill pool and PASS result.
2. Beginner's Luck / Health skill pool and PASS result.
3. Zero-ability Beginner's Luck blocked before M3.
4. Nature substitution within descriptor, PASS, no tax.
5. Nature substitution outside descriptor, FAIL by 2, tax preview of 2.
6. Channel Nature within descriptor, PASS, Persona cost preview only.
7. Channel Nature for Resources rejected before M3.
8. Advancement to Maximum Nature 7 while current Nature remains 6: no retirement review.
9. Current Nature reaches 7: manual end-of-session review required.

## Safety contract

- Runtime must be exactly v1.13.0-qa.20 and the caller must be GM.
- Legacy Mixed remains active. Torchbearer stays FOUNDATION_ONLY, READ_ONLY, unsupported, locked and inactive.
- No profile activation/switch, random roll, ChatMessage, resource spend, test consequence, Actor/Item/Journal/Setting write, advancement write, or Character Creation commit.
- Evidence is MEMORY_ONLY and clears after reload.
- No PR14 work.

## Exit boundary

A pass closes only this nine-case deterministic handoff slice. It does not prove ordinary TB2E playability, apply Nature tax, complete BL learning, validate every source exception, close M10D.10, authorize M10D.11 activation, or complete M10D.12 Core Live / Stable.

## QA evidence

- Automation: `qa/m10d19-tb2e-controlled-bl-nature-smoke.mjs`
- Foundry protocol: `TEST_PROTOCOL_v1.13.0-qa.20.md`
