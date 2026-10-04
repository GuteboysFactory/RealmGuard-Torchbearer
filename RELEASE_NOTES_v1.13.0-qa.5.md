# Realm Guard / Torchbearer v1.13.0-qa.5 — M10D.4 TB2E Tests / Dice Bounded Shadow

M10D.3 Help / Teamwork was live-verified and closed on v1.13.0-qa.4.

- Adds a READ_ONLY shadow adapter for the PARTIAL Torchbearer 2E Tests / Dice domain.
- Implements only guide-backed fundamentals: d6 pools, 4+ successes, +D/-D, +s/-s, caller-supplied Obstacle comparison, Versus success comparison and margin calculation.
- Obstacle factors are never invented: DG160 is unavailable, so the adapter requires the Ob value from the caller and reports the normal guide range (Ob 2-5) as guidance only.
- Generic Versus ties remain TIE with manual/source-bounded resolution; the supplied guides do not establish a complete universal tie procedure.
- Models Fate/Luck after-roll open sixes as a plan only: 1 Fate, one new die per rolled 6, recursive on new 6s. It never spends Fate or executes random rolls.
- Adds a bounded Beginner's Luck shadow plan: Ability/Wises/Help/Supplies/Gear before halving (round up), then Traits/Persona/channeled Nature/Fresh/other bonuses after halving. Missing-tools -1D remains manual because the summary is not sufficient for a safe engine ordering decision.
- No live test authority, no resource spend, no advancement mutation and no Actor/Item/Journal/setting writes.
- Existing Legacy Mixed / Strict RG / MG1E / MG2E profiles remain unchanged.
- QA advances to v1.13.0-qa.5. Stable remains v1.12.0.

Focused Foundry VTT 13.351 follow-up: TEST_PROTOCOL_v1.13.0-qa.5.md.
