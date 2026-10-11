# Realm Guard / Torchbearer v1.13.0-qa.29 — M10D.18 P3.5

**QA ONLY — targeted Circles, Scales & Character Creation source fixes; not full 14-domain parity.**

- **Circles (DH 61–62):** Core Circles factors (personnel; Find Ally position+level+attitude) are now available as `game.realmGuard.core.m10d.circles.factorPlan`. Explicit **Enmity Clause** failure finds an enemy instead of the target, with +3 successes to enemy disposition on Drive Off / Convince / Convince Crowd when they oppose the player. No NPC or relationship write.
- **Scales (DH 64, SG 62):** Might goal limits follow the actor's current Might, not just starting Might 3. New `game.realmGuard.core.m10d.scales.groupScaleComparisonPlan` uses the highest Might/Precedence of each team.
- **Character Creation (DH 26–27):** Human Magician, Theurge and Warrior Will+Health distribution total 8, **minimum 2 and maximum 6 each**. Gear, spell and invocation source metadata distinguishes full book access from an unimplemented catalogue.

**Regression:** `qa/m10d-tb2e-p35-circles-scales-creation-smoke.mjs` and historical QA smokes. Foundry Gates A–D in `TEST_PROTOCOL_v1.13.0-qa.29.md`. Primary-source findings in `M10D18_P35_SOURCE_FINDINGS.md`.

**Guardrails:** Torchbearer 2E remains read-only shadow, zero rolls / zero Actor, Item, Journal, Settings mutations, no creation commit. Global kill switch ENGAGED; M11 PAUSED; Legacy Mixed sole live authority. Stable v1.12.0 untouched. All 14 historical CORE domains still require full independent audit (0/14).
