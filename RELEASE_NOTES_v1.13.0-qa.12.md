# Realm Guard / Torchbearer v1.13.0-qa.12 — M10D.11 TB2E Advancement Bounded Shadow

M10D.10 Inventory / Gear was live-verified and closed on v1.13.0-qa.11.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Advancement domain.
- Models the guide formula: pass requirement = current rating; fail requirement = current rating minus one; normal Skill/Ability cap 6; Resources/Circles cap 10.
- Models Resources/Circles rating 0 -> 1 as the special non-Beginner's-Luck route using reputation, hometown advantage, cash, loot or treasure and at least one passed test.
- Models advancement-mark eligibility: Ob 0 does not count, combat Versus tests do count, unbroken ties do not count, broken ties use the resolved result.
- Models the guide's one counted test per Camp/Town phase and one per Conflict/other series using caller-supplied already-counted state; no broader scope is inferred.
- Models mixed group tests as player choice of Pass or Fail for advancement.
- Models Nature advancement using Maximum Nature and previewing +1 to both current and maximum while preserving tax.
- Models Beginner's Luck learning as attempts equal to Maximum Nature, opening the new Skill at rating 2.
- Models erasing Pass/Fail marks after advancement or rating loss as a zero-write reset preview.
- Records level facts: 10 class levels, cumulative spent Fate/Persona progression, Town-only leveling, two irreversible benefit choices after level 1.
- The visual numeric level-threshold table is not transcribed/automated, and DG113+ class benefits remain unavailable.
- No Pass/Fail mark, rating, Nature, Skill-learning, level, benefit-choice or Actor/Item/Journal/setting mutation.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.12. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.12.md.
