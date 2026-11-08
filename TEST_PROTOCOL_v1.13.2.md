# 1.13.2 — Stable verification

The user approved publication as stable **1.13.2**, continuing 1.13.1. New mechanics/UI apply only to **Legacy Mixed**. For the detailed already-playtested content, see TEST_PROTOCOL_v1.14.0-qa.3.md; the final additions below supersede its optional Disposition handling and automatic Skill list.

1. Open GM and captain/player clients. GM rolls opposition Disposition once; the captain selects a Skill and makes one player-team roll, with optional Help. No participant makes an individual Disposition roll.
2. Try repeated clicks or competing requests. Only one roll per side is accepted. After both totals are committed, a multi-player team must distribute its shared points before equipment/cards.
3. Distribute points as GM, then in another conflict as a participating player who is not the captain. The same team total must be preserved. Incorrect sums, negative/fractional values, unrelated users and stale submissions are rejected.
4. Start with one player. The shared result belongs directly to that player; no allocation editor or step appears.
5. Confirm Back is next to Abort. Review distribution and Disposition, then continue. Existing totals remain and neither roll is offered again. Back from card preparation returns to the appropriate setup step; revealed/resolved actions use the correction behavior without duplicating resource spending or Learning.
6. During Disposition and an action, manually choose a real Skill outside the conflict type's usual list. Confirm no default Skill is silently selected, the normal roll dialog follows, and the actual rating/Beginner's Luck is used.
7. Retain the earlier checks for equipment/Custom tools, manual actor assignment, hidden flips, knockout handling, End Session/Creed rewards and readable Wise questions. Spot-check other active profiles and the accepted startup performance.

The automated browser suite uses production code and real DOM callbacks with controlled Foundry settings, sockets and documents. It explicitly routes a player claim through the authoritative GM and replies before dice are evaluated; no user world is opened or changed by the test.

**QA testers:** the QA build's version 1.14.0-qa.3 compares higher than stable 1.13.2. Switch using the stable manifest rather than expecting the QA channel to offer this as a higher version. Verify the installed version before testing; do not delete world data.
