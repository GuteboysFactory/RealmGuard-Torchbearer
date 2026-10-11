# QA protocol v1.13.0-qa.27 — M10D.18 P3.3

Canonical sources: DH 60–61, 77; SG 41–57, 83–88, 102–105. Targeted shadow-only patch, not full domain closure.

## Gate A — Install and safety
Verify Foundry v13.351 / system v1.13.0-qa.27, new API `game.realmGuard.core.m10d.recovery.townVenuePlan`, all three historical adapters ready, Legacy Mixed live, M11 paused, global kill switch engaged, liveDomainCount=0. Stable v1.12.0 unchanged.

## Gate B — Resources / Fate / Persona
- Resources 0 without treasure even in hometown => block. Resources 0 + treasure => allowed read-only preview.
- Failed test tax margin 3 with 1 treasure die => 2 tax and advancement reset preview; full insulation => 0 tax.
- Wise reroll after Fate Luck => block; zero failed dice => block. Fate/Persona resource spending remains uncommitted.

## Gate C — Conditions / Recovery
- Injured + Sick: Will/Health recovery => 0 penalty; normal Skill => -2D.
- Angry precision/social versus => -1s; independent GM +1 Ob; exempt recovery.
- Fresh plus another condition => no bonus. Extreme Grind interval 3; Dead documented as noninteractive CORE.
- Food OR water OR wine in safety removes Hungry/Thirsty; under pressure => not permitted.
- Camp food acquisition is GM-confirmed; Cook optional.
- Failed recovery keeps condition without further penalty.
- Town venue table from SG 102-105 validates Streets, Stables, Tavern, Flophouse, Inn, Hotel and their free tests, automatic recovery, bonus dice and lifestyle.

## Gate D — Regression and reload
Existing P2 and P3.1–P3.2 plans, Legacy Mixed Tests/Sheets, Conditions, equipment, Fate/Persona and advancement unaffected. Reload and verify M11 safety persists; no Actor/Item/Journal/Settings mutation or real roll. Confirm CI smoke plus new P3.3 smoke PASS.

Acceptance requires user-confirmed Gates A–D. Full CORE 14-domain re-audit remains OPEN (0/14).
