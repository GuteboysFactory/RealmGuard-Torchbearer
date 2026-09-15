# Realm Guard / Torchbearer v1.7.0-qa.21 QA Protocol

## Scope
M5 controlled live handoff for Conflict Tool evaluation only. CORE M5 becomes live authority for provider/effect evaluation after a Legacy parity guard. Legacy Mixed still owns all Conflict state writes and exchange flow.

## 1. Initial status
```js
game.system.version
game.realmGuard.core.m5.conflictTools.handoffStatus()
```
Expected: version `1.7.0-qa.21`, `enabled:true`, `mode:"CORE_EVALUATE_LEGACY_STATE"`, evaluation authority `CORE_M5`, conflict state authority `LEGACY_MIXED`.

## 2. Physical tool match
Reset telemetry. In a Fight, use a physical weapon with a known action modifier (recommended Bow + Maneuver = +2D or Shield + Defend = +2D). Roll the action.
```js
game.realmGuard.core.m5.conflictTools.handoffStatus()
game.realmGuard.core.m5.conflictTools.handoffHistory().slice(-5)
```
Expected latest evaluation: `CORE_EVALUATION_APPLIED`, `providerMatch:true`, `effectMatch:true`, `evaluationAuthority:"CORE_M5"`. No mismatch/error fallback.

## 3. Unarmed compatibility
Plan one legal action with no Tool/Weapon. Roll. Expected event `toolKind:"unarmed"`, `dice:-1`, `CORE_EVALUATION_APPLIED`. This verifies the Legacy Mixed profile override remains live.

## 4. Conditional success
Use Spear on Feint or Axe on Attack. Expected `conditionalSuccess:1` with `CORE_EVALUATION_APPLIED`.

## 5. Narrative/custom tool
Create/use a custom Conflict Tool with a dice or success modifier. Expected `toolKind:"narrative"`, provider/effect match and CORE evaluation applied. If the tool has a requirement, also test Requirement met OFF; bonus must become 0 without mismatch.

## 6. Manual rollback
```js
game.realmGuard.core.m5.conflictTools.rollback("QA_MANUAL_ROLLBACK")
```
Roll a normal Conflict action. Expected `LEGACY_ROLLBACK`, evaluation authority Legacy Mixed; conflict continues normally.
Re-enable:
```js
game.realmGuard.core.m5.conflictTools.enableCoreEvaluation()
game.realmGuard.core.m5.conflictTools.resetHandoffTelemetry()
```

## 7. Final regression
Complete at least one full revealed Action pair. Verify action resolution, disposition change, Maneuver handling where applicable, exchange advancement, chat card and Conflict state remain normal.
Final status must show `enabled:true`, `mismatches:0`, `errorFallbacks:0`, `rollbackReason:""`.

## PASS
Physical + Unarmed + conditional/custom coverage is green, rollback works, re-enable works, no mismatch/error fallback, and Legacy Conflict state/exchange behavior is unchanged.
