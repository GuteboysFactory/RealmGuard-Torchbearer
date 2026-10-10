# Realm Guard / Torchbearer v1.13.0-qa.22 — M10D.18 P2.2 Armor Shadow

Builds on the Foundry-verified P2.1 Traits adapter in v1.13.0-qa.21. **QA candidate only — Stable v1.12.0 unchanged.**

- Adds Torchbearer 2E CORE Armor read-only plans based on the Dungeoneer's Handbook pp. 150–151 (leather, chain, plate, helmet) and pp. 156–159 (shield and weapon bypasses), plus Scholar's Guide p. 65 (direct target and overflow damage).
- Damage absorption applies only for Kill, Capture, Drive Off conflict hits from Attack/Feint when the protection holder is directly targeted and leading the action; overflow cannot be protected.
- Leather: one d6 per fight, 4–6 absorbs 1; bows/crossbows/spears bypass. No armor damage from ordinary leather absorption.
- Chain: absorbs 1 unless hit by mace or warhammer; wear d6 1–3 damages the armor, **even when those weapons bypass protection**.
- Plate: absorbs 1; d6 1–2 damages normally, 1–3 versus mace or warhammer.
- Helmet: absorbs one point once; post-use disposition (lost/damaged/destroyed) requires GM determination.
- Shield: +2D Defend when equipped, or absorbs one point once and is destroyed; gear/HP mutations remain disabled.
- Pure diagnostic API: `game.realmGuard.core.m10d.armor.getStatus()/model()/absorptionPlan()/shieldDefendPlan()/repairBoundaryPlan()`. Caller supplies all hit context and d6; **no dice are rolled**. No automatic multi-piece stacking, enchanted variants, or live repair test.
- Adds QA smoke tests for protection matrices, bypass, wear, overflow, phase/target requirements, installed API, fixed read-only state and zero writes.
- P2.1 Traits remains VERIFIED. Conflict and Magic adapters are still pending. Fourteen previous shadows still require full-core reconciliation re-audit. No live promotion.
- Global kill switch remains ENGAGED, M11 integration PAUSED and Legacy Mixed remains live authority. No Actor/Item/Journal/Settings writes or destructive migrations.
- The release workflow must pass syntax, release preflight, historical and new smokes, Foundry ZIP, GitHub Release and asset verification before promoting the QA channel.
- Foundry 13.351 user QA follows `TEST_PROTOCOL_v1.13.0-qa.22.md`. QA success is not a Stable promotion.
