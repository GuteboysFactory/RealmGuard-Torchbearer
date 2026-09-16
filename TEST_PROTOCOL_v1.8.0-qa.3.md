# Realm Guard / Torchbearer v1.8.0-qa.3 QA Protocol

## Scope
First controlled M6 live handoff. CORE becomes live authority only for the completed action-pair resolution result fields: pass/fail, margin, failure margin and effective successes. Legacy Mixed still owns every Conflict state write, disposition mutation, Learning/Nature writes, Maneuver state, exchange advancement and compromise flow. Legacy calculates the result independently first and acts as a parity guard. Any disagreement or CORE exception automatically disables the handoff and uses Legacy immediately.

## 1. Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.handoffStatus()
```
Expected: `1.8.0-qa.3`; `liveApplication:true`; mode `CORE_RESOLUTION_LEGACY_STATE`; handoff enabled; resolutionAuthority `CORE_M6`; conflictStateAuthority `LEGACY_MIXED`; rollbackReason empty.

## 2. Reset telemetry
```js
game.realmGuard.core.m6.clear()
game.realmGuard.core.m6.resetHandoffTelemetry()
```

## 3. Normal Versus
Resolve Attack vs Defend with unequal effective successes. Then:
```js
game.realmGuard.core.m6.handoffHistory().slice(-3)
game.realmGuard.core.m6.getStatus()
```
Expected latest handoff event `CORE_RESOLUTION_APPLIED`, parityGuard `MATCH`, resolutionAuthority `CORE_M6`. Shadow resolution remains `MATCH`; no gameplay/UI change.

## 4. Independent
Resolve an Independent pair. Expected `CORE_RESOLUTION_APPLIED`, no mismatch.

## 5. Automatic Versus tie
Resolve an equal Versus result that completes through the automatic tiebreak. Expected `CORE_RESOLUTION_APPLIED`; winner/margin and final disposition identical to Legacy; no mismatch.

## 6. Maneuver
Resolve a successful Maneuver with margin > 0 and complete the normal Maneuver choice. Expected CORE result applied while Legacy still owns Maneuver queue/state/write.

## 7. Manual rollback
```js
game.realmGuard.core.m6.rollback("QA_MANUAL_ROLLBACK")
game.realmGuard.core.m6.handoffStatus()
```
Expected enabled false, mode `LEGACY_ROLLBACK`, resolutionAuthority `LEGACY_MIXED`, reason `QA_MANUAL_ROLLBACK`. Resolve one action pair; gameplay must work normally and handoff history records `LEGACY_ROLLBACK`.

Re-enable:
```js
game.realmGuard.core.m6.enableCoreResolution()
game.realmGuard.core.m6.resetHandoffTelemetry()
game.realmGuard.core.m6.clear()
```

## 8. Final regression
Resolve at least one complete action pair/exchange. Verify Conflict Tool bonuses, Token Actor resolution, Learning/Nature handling, disposition, chat, Maneuver UI and exchange flow remain unchanged.

Final checks:
```js
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.getStatus()
```
PASS: enabled true; telemetry mismatches 0; errorFallbacks 0; rollbackReason empty; shadow mismatches 0; latest live handoff `CORE_RESOLUTION_APPLIED`.
