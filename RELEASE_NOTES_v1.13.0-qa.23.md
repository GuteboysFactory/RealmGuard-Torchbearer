# Realm Guard / Torchbearer v1.13.0-qa.23 — M10D.18 P2.3 Conflict Shadow Adapter

Based on Torchbearer 2E **Scholar's Guide** Conflict pp. 59–81 and **Dungeoneer's Handbook** weapons pp. 156–159. QA build; Foundry user QA still required.

- Adds seven base conflict types, source-backed action skills, Attack/Defend/Feint/Maneuver interaction matrix (Independent/Versus/No Test), independent obstacles 0/3.
- Disposition uses base ability + rolled successes (minimum 1); Hungry & Thirsty / Exhausted -1s once per team; captain backpack/darkness -1s in relevant conflicts; Injured/Sick -1D requires an already-adjusted dice roll rather than subtracting successes post-roll.
- Read-only captain HP allocation, with explicit choice of odd-point recipients; no guessed participant eligibility.
- Attack/Feint damage minus absorbed protections; knocked-out and overflow guidance. Overflow armor absorption disallowed; teammates receive overflow only through explicit captain/manual handling.
- Defend/Regroup difference: Versus restores margin of success; successful Independent restores 1 + margin; acting character first, then teammates sequentially.
- Maneuver margin costs: Impede 1, Gain Position 2, Disarm 3, Rearm 4; duplicate purchases blocked.
- Win/Lose/Tie read-only guidance: tied conflict implies major compromise both ways; winner undamaged owes none, winner above half owes minor, borderline half/major stays GM judgment. No automatic death, conditions, items or compromise.
- Public diagnostic API: `game.realmGuard.core.m10d.conflict` with status, model, dispositionPlan, actionPlan, hpAllocationPlan, hitPlan, regroupPlan, maneuverPlan and outcomePlan. All pure read-only; no rolls or live writes.
- P2.1 Traits and P2.2 Armor remain VERIFIED. Magic is pending. Existing 14-domain full-core re-audit still required.
- Legacy Mixed remains live authority; M11 PAUSED; global kill switch ENGAGED. Stable v1.12.0 unchanged.
- Syntax/release-preflight/full smoke suite, ZIP checks, release asset re-download and QA-channel promotion follow RELEASE_CHANNELS.md. Foundry tests: TEST_PROTOCOL_v1.13.0-qa.23.md.
