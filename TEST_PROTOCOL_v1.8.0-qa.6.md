# Realm Guard / Torchbearer v1.8.0-qa.6 QA — M6 Runtime & State Authority

## Scope
One consolidated M6 patch: CORE runtime model + state-transition authority for disposition, Maneuver state/effects, action/exchange advancement, outcome and compromise state. Resolution-result authority remains independently protected. Legacy remains writer for Learning, Nature tax, interactive tie transaction and private hidden-plan repository.

## 0. Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.stateHandoffStatus()
game.realmGuard.core.m6.runtimeSnapshot()
```
Expected version 1.8.0-qa.6; resolution and state handoffs enabled; no rollback reasons. Runtime snapshot uses `M6_CONFLICT_RUNTIME_V1`.

## 1. Normal Versus + disposition + advancement
Run Attack vs Defend with a non-tie result. Verify correct pass/fail, disposition change, chat result and automatic movement to the next Action.
Expected state telemetry: matches increase, mismatches 0, errorFallbacks 0.

## 2. Independent + Trumped
Resolve Attack vs Attack (non-missile) and Attack vs Feint. Verify independent damage/trumped behavior remains unchanged and state progresses correctly.

## 3. Automatic Versus tie
Create a supported automatic tie resolution. Verify winner/margin and disposition remain correct. An unresolved interactive tie must stay pending with no state write; that transaction remains deferred.

## 4. Defend recovery
Damage one side, then resolve a successful Defend. Verify recovery is capped at starting Disposition.

## 5. Maneuver effects
Exercise: Impede (-1D next test), Gain Position (+2D next test), Combo (-1D/+2D), Disarm (selected equipped Gear disabled). Verify pending queue, sequential dual Maneuver handling, effect consumption and later action advancement.

## 6. Three Actions -> next Exchange
Complete all three Action pairs. Verify Exchange increments, current Action resets to 1, locks reset, planning returns to GM Planning, hidden plans clear, and a new Exchange Weapon / Tool may be declared.

## 7. Outcome + compromise
Reduce one side to 0. Verify winner/tie, ended Exchange/Action and Compromise stage. Finish with compromise text; verify grade (none/minor/compromise/major or tie), Conflict becomes inactive and completion chat is correct.

## 8. Multi-Ranger + Exchange Tool scope
Use 2+ Rangers. Verify action assignment fairness/no consecutive Ranger rule, independent Actor-scoped Exchange Weapon / Tool declarations, and correct participant in each revealed Action.

## 9. Reload/recovery
At minimum reload in: planning, mid-Action after one side has rolled, Maneuver stage, and new Exchange planning. Verify the active Conflict reopens with the same public runtime state and can continue.

## 10. Token Actor regression
Use an unlinked Token Actor with token-specific equipment. Verify Conflict still resolves equipment/tool source from the token Actor.

## 11. qa.5 stacking regression
Open several roll/transient dialogs from Conflict. They must remain above Conflict every time.

## 12. Final telemetry
```js
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.stateHandoffStatus()
game.realmGuard.core.m6.getStatus()
```
PASS requires resolution mismatches 0/errorFallbacks 0; state mismatches 0/errorFallbacks 0; both enabled; shadow mismatches 0.

## Rollback isolation test (optional but recommended)
```js
game.realmGuard.core.m6.rollbackCoreState("QA_ISOLATION_TEST")
game.realmGuard.core.m6.stateHandoffStatus()
game.realmGuard.core.m6.handoffStatus()
```
Expected only state authority becomes Legacy; resolution remains CORE_M6. Then restore:
```js
game.realmGuard.core.m6.enableCoreState()
```
