# Foundry QA v1.13.0-qa.29 — M10D.18 P3.5

**Targeted source reconciliation** against DH 26–37, 61–64 and SG 62. **Legacy Mixed sole live**, M11 global kill switch ENGAGED, historical CORE full audit still 0/14.

## Gate A — Install / safety
- Foundry v13.351, installed system `1.13.0-qa.29`.
- New CORE API functions available: `game.realmGuard.core.m10d.circles.factorPlan`, `game.realmGuard.core.m10d.scales.groupScaleComparisonPlan`.
- All three status adapters ready, `liveEnabled:false`; M11 global kill switch engaged, live integration paused and live domains 0.
- Confirm Stable manifest stays v1.12.0.

## Gate B — Circles (DH 61-62)
- `circles.factorPlan({kind:'HIRE_PERSONNEL',personnel:'GUIDE'})` → Ob3; Magician → Ob5; unsupported factor blocked.
- `circles.factorPlan({kind:'FIND_ALLY',position:'GOVERNMENT_OR_RULER',level:'HIGHER',attitude:'LOYAL'})` → Ob7.
- Explicit `ENMITY_CLAUSE` failed test returns targetFound=false, enemyFound=true and dispositionBonus +3s scoped to Drive Off/Convince/Convince Crowd; no NPC write.
- Ordinary failed condition/twist and starting relationship/Loner cases remain backward compatible.

## Gate C — Might, Precedence, Character Creation (DH 26–27, 62–64; SG 62)
- Starting Might 3: Capture M3 permitted, M4 blocked. Raised Might 5: Capture M5, Kill M6 permitted, Drive Off M8 blocked.
- Group Might [2,5,3] vs [1,4] → highest 5 vs 4, +1 differential. Precedence [0,2] vs [4,1] → highest 2 vs 4.
- Precedence target eligibility retained.
- Human Magician/Theurge/Warrior: Will/Health 2/6 allowed, 1/7 and 0/8 rejected, no Actor write.
- Full gear/spells/relic rulebook source available, not auto-granted.

## Gate D — Regression & reload
- New focused smoke and all historical P2, P3.1–P3.4 smokes PASS.
- Existing Ranger/NPC sheets, Skills, Traits, Wises, Equipment, Conditions, Fate/Persona, and Advancement unchanged after reload.
- Recheck M11 PAUSED + global kill switch ENGAGED, Legacy Mixed sole live authority, no new blocking console errors.
- Confirm no live rolls, Actor/Item/Journal/Settings writes, NPC creation or profile activation.

**Acceptance:** User separately confirms Gates A–D. P3.5 targeted QA closure does not certify full CORE source parity across 14 domains.
