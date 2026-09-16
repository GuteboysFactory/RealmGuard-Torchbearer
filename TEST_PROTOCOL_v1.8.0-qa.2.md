# Realm Guard / Torchbearer v1.8.0-qa.2 QA Protocol

## Scope
M6 remains shadow-only. qa.2 fixes the diagnosed parity gap where Legacy resolved a raw Versus tie through `_resolveAutomaticVersusTie()` while CORE stopped at `tiePending`. Legacy now exposes only the completed tiebreak result as observation data; CORE independently applies winner, margin, failure margin and disposition consequences. No CORE live writes are enabled.

## 1. Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
```
Expected: `1.8.0-qa.2`, phase `M6`, mode `SHADOW_PARITY`, authority `LEGACY_MIXED`, `liveApplication:false`.

## 2. Reset
```js
game.realmGuard.core.m6.clear()
```

## 3. Automatic Versus tie — primary qa.2 test
Run a Versus action pair and obtain equal effective successes so the normal automatic Versus tiebreak resolves the tie. Complete the action normally. Then run:
```js
game.realmGuard.core.m6.history().filter(e => e.domain === "CONFLICT_RESOLUTION").slice(-3)
game.realmGuard.core.m6.getStatus()
```
Expected latest resolution: `parity:"MATCH"`, `match:true`, Legacy/Core agree on passed side, margin, failure margin, effective successes, both disposition values and `tiePending:false`. `mismatches:0` after a clean reset.

## 4. Non-tie Versus regression
Run Attack vs Defend with unequal successes. Expected interaction and resolution `MATCH`.

## 5. Independent regression
Run an Independent pair. Expected resolution `MATCH`.

## 6. Missile exception regression
Attack vs Attack with Bow/Sling on either side. Expected both interaction rows `versus` and `MATCH`.

## 7. Maneuver regression
Resolve a successful Maneuver with margin > 0. Expected CORE maneuver queue side/margin equals Legacy and resolution is `MATCH`. Complete the Legacy Maneuver UI normally.

## 8. M5 / Token Actor regression
Conflict Tool bonuses and the qa.22 Token Actor resolver must remain unchanged. No red console errors.

## PASS
Automatic resolved Versus tie MATCH, normal Versus MATCH, Independent MATCH, missile interaction MATCH, Maneuver MATCH, and final `mismatches:0`. Legacy Mixed remains live authority.
