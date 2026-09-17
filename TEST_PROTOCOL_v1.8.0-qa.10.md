# QA — v1.8.0-qa.10

## Skill roll UX

1. Open a Ranger sheet and go to **SKILLS**. Every trained Skill must show **Quick Roll** and **Roll Window**.
2. Quick Roll on a normal trained Skill: roll immediately with automatic Conditions/current Obstacle workflow, then verify chat result and Pass/Fail learning update.
3. Roll Window on the same Skill: full dialog opens and **Help / Teamwork is visible without any extra toggle**. Verify Ask for Help still works.
4. With Obstacle Approval mode active, press Quick Roll. It must fall back to Roll Window so approval cannot be bypassed.
5. Trained Versus Skill: with exactly one target and exactly one legal opposition, Quick Roll may resolve directly. With no target, multiple targets, or multiple legal opposition choices, it must fall back to Roll Window.

## Untrained / Beginner's Luck

6. Untrained list is separated into **WILL-BASED** and **HEALTH-BASED** canonical Skills. No canonical Skill should display the old ambiguous `Will / Health` fallback.
7. Farmer is treated as a physical Skill for Beginner's Luck and therefore appears under **HEALTH-BASED**.
8. A custom/unclassified Skill appears under **CUSTOM / CHOOSE** and asks for Will or Health when first rolled; the chosen base is then persisted.
9. Every untrained Skill shows **Quick Roll** and **Roll Window**.
10. Quick Roll uses the existing Beginner's Luck rules pipeline: pre-half inputs, round up, Persona/Fresh/Tap Nature post-half behavior unchanged. Verify one completed non-tied roll adds exactly one Beginner's Luck attempt.
11. Roll Window for an untrained Skill opens the existing full Beginner's Luck dialog and keeps Teamwork visible.
12. Afraid and zero Will/Health blocks remain enforced.

## Regression

13. Fate/Open 6 behavior remains unchanged on Quick Roll and Roll Window.
14. M6 Conflict smoke tests remain PASS; qa.10 does not change Conflict resolution or state authority.
15. Reload the world and repeat one trained and one untrained roll.
16. Foundry v13.351: sheet remains usable on a laptop-sized/short viewport and the full Roll Window remains scrollable.
