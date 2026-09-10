Realm Guard / Torchbearer v1.4.0-qa.1 — CORE M2 QA.

M2 begins the Unified Effect Engine phase from the v1.3.0 GOLD baseline.

This first M2 build is deliberately foundation-only and runs the new Effect Engine in SHADOW_DIAGNOSTIC mode. It does not take over live roll, Conflict, recovery or other gameplay modifier resolution yet.

New architecture components:
- shared immutable Effect model
- Effect Types, Timings and Stacking registries
- deterministic Effect provider registration and ordering
- appliesTo / excludes context filtering
- declarative requirement evaluation
- source/provider provenance on collected Effects
- type/timing/provider filters
- numeric Effect summary helper
- GM-only CORE M2 Effect Engine diagnostics window
- runtime API at game.realmGuard.core.effects
- automated M2 headless smoke test in the GitHub release gate

Expected live status in qa.1:
- phase: M2
- mode: SHADOW_DIAGNOSTIC
- live application: OFF
- registered live providers: 0

This is intentional. Real Conditions/Traits/Gear/etc. providers will be migrated only after the Effect Engine foundation passes live QA, so any gameplay regression in qa.1 is considered a blocker.

M0 schema/migration state and the M1 realm-guard-legacy-mixed profile/Rules Registry remain unchanged.

Gameplay change: NONE INTENDED.
GOLD baseline: v1.3.0.
Foundry target: v13.351.
