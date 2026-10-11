# Foundry QA protocol — v1.13.0-qa.28 · M10D.18 P3.4

Requires Foundry v13.351, target QA manifest channel. Read-only; historical full CORE audit remains 0/14.

## Gate A — Installation and safety
- Foundry system version `1.13.0-qa.28`, Legacy Mixed remains live.
- `game.realmGuard.core.m10d.advancement.townResourcesMarkPlan` and `session.grindCadencePlan` exported.
- M10D historic re-audit required, live integration paused, M11 global kill switch engaged, live domains 0, stable v1.12.0 unchanged.

## Gate B — Inventory & Gear (DH 83–88)
- Carried 4 with one character => requires Laborer; two characters => ordinary carry.
- Nested 0.5 + 1 slot rounds to 2 item slots; satchel 2 used + nested 2 = 4/3 over capacity.
- Cache build no inventory mutations; remote transfer impossible, visiting permits retrieval.
- No item-source catalogue automation or automatic equipment mutations.

## Gate C — Advancement & Session (DH 108–113, SG 39–42, 90–96)
- Level 3 → 4 requires Fate 14, Persona 12 cumulatively and a Town return; level 10 at cap.
- Town Resources: purchases 1 mark, bills 1 mark; if purchase mark caused advancement, bills do not count.
- Normal Grind condition on turn 4; extreme condition on turn 3. Extreme Dead case GM-adjudicated only.
- Exhausted Instinct costs 1 Adventure turn or Camp check; otherwise free.
- Cannot enter Camp without check, rest site or while in immediate danger.
- Dark Camp unsafe event danger penalty -1 instead of -2, dangerous -2 instead of -3; +1 Ob recovery retained.

## Gate D — Regression + reload
- Legacy Mixed Ranger/NPC sheets, rolls, Traits/Armor/Conflict/Magic and P3.1–P3.3 planners unchanged.
- Inventory, Fate/Persona, Advancement, Conditions, HP and other persisted docs unchanged after reload.
- Automatic CI and smoke `qa/m10d-tb2e-p34-inventory-advancement-session-smoke.mjs` pass.
- Global kill switch ENGAGED, M11 PAUSED with zero live domains after reload. No blocking console errors.

Acceptance is explicitly user-attested A–D. P3.4 closure never implies 14/14 domain parity.
