Realm Guard / Torchbearer v1.7.0-qa.5 — M5 Gear / Inventory / Conflict Tool CORE foundation.

qa.4 is the approved visual/UX baseline for Equipment Figure and Token Builder. qa.5 returns to the planned M5 architecture work: Gear, Inventory placement, Containers and Conflict Tools now have profile-aware CORE services underneath the existing Legacy Mixed gameplay.

New in qa.5:
- adds `GearService`
- adds `InventoryPolicy` with LOOSE / STRUCTURED / CUSTOM modes
- adds `PlacementValidator`
- adds `ContainerService`
- adds `ConflictToolService`
- adds `ConflictToolEffectProvider`
- Legacy Mixed resolves the current STRUCTURED inventory policy
- structured shadow validation models existing zones, capacities, 2H locks, Cloak/Belt/Pocket restrictions and container capacity
- Conflict Tool architecture supports physical Gear, natural tools/weapons and narrative/contextual tools
- structured Tools may carry multiple action-specific effects and requirements
- backend disable-target capability includes Conflict Tool/Gear/Natural Tool/Trait providers where present
- HARD CORE defines no universal Unarmed penalty; the active Legacy Mixed compatibility evaluator still reports the existing -1D behavior
- exposes read-only diagnostics under `game.realmGuard.core.m5`
- adds M5 service smoke tests and static QA

Important preservation:
- `liveApplication:false`
- no M5 service writes inventory or conflict gameplay state
- Legacy Mixed remains sole live Inventory authority
- Legacy Conflict remains sole live Conflict authority until the later takeover/refactor stages
- no Actor or Item migration
- qa.4 Equipment artwork and Token Builder UX are preserved
- M2, M3 and verified M4 behavior remain unchanged

QA protocol: TEST_PROTOCOL_v1.7.0-qa.5.md
Static QA: STATIC_QA_v1.7.0-qa.5.md
Foundry target: v13.351.
Approved baseline entering this build: v1.7.0-qa.4 PASS for M5 Equipment/portrait UX; M4 remains VERIFIED.
