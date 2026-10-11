# Realm Guard / Torchbearer v1.13.0-qa.27 — M10D.18 P3.3

**QA candidate only.** Targeted source re-audit of Resources/Fate/Persona, Conditions and Recovery. Read-only shadow; not full source parity for all 14 domains.

- **Resources** (DH 60–61): requires treasure when rating 0; preserve special advancement route, explicit tax insulation/reset status, corrected full-book source availability.
- **Fate/Persona** (DH 77; SG 87–88): optional failed-dice checks and correct Wise-reroll-before-Luck timing.
- **Conditions** (SG 41–55): Injury/Sickness do not penalize Will/Health recovery; Angry uses -1s in versus; Fresh suppressed by any other condition; core Dead and extreme Grind source details now available.
- **Recovery** (SG 47–57, 102–105): Hungry/Thirsty cured with food **or** drink during safety; Cook optional; food acquisition confirmed; Exhausted camp/town available, failure retains condition, no twist; new read-only Town recovery venue plan for Streets, Stables, Tavern, Flophouse, Inn and Hotel.

New API `game.realmGuard.core.m10d.recovery.townVenuePlan` and `townVenueModel`.

**Safety:** Legacy Mixed remains sole live authority; global kill switch ENGAGED; M11 PAUSED; no live test, dice, item, condition, equipment, reward or settings mutations. Stable v1.12.0 frozen. 0/14 fully re-audited historical domains, source findings in `M10D18_P33_SOURCE_FINDINGS.md`. QA gates A–D `TEST_PROTOCOL_v1.13.0-qa.27.md`. Publish/promote QA only after CI success and verified GitHub release assets.
