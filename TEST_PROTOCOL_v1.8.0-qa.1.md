# Realm Guard / Torchbearer v1.8.0-qa.1 QA Protocol

## Scope
M6 Conflict Engine refactor begins in shadow-only mode. Legacy Mixed remains the sole live authority. CORE independently recomputes action interaction mode, pass/fail, margins, effective successes, disposition delta and Maneuver queue, then compares against the completed Legacy resolution.

## 1. Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
```
Expected: `1.8.0-qa.1`, phase `M6`, mode `SHADOW_PARITY`, authority `LEGACY_MIXED`, `liveApplication:false`, `mismatches:0`.

## 2. Clear M6 history
```js
game.realmGuard.core.m6.clear()
```

## 3. Versus resolution
Play one normal Versus action pair such as Attack vs Defend. After resolution:
```js
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.history().slice(-6)
```
Expected interaction rows `MATCH` and one `RESOLVE_ACTION_PAIR` row `MATCH`. Check pass/fail, margin, effective successes and both disposition values.

## 4. Independent resolution
Play an Independent pair, preferably Attack vs Attack without missile weapons or a legal independent/trumped combination. Expected `MATCH`; CORE disposition preview equals Legacy.

## 5. Missile interaction exception
Use Attack vs Attack with Bow or Sling on either side. Expected interaction mode `versus` on both sides and parity `MATCH`.

## 6. Maneuver resolution
Resolve a successful Maneuver with margin > 0. Expected `RESOLVE_ACTION_PAIR` parity `MATCH` and CORE `maneuverQueue` matching Legacy side+margin. Complete the normal Legacy Maneuver choice and verify gameplay remains unchanged.

## 7. Conditional successes / penalties regression
Use one Tool that produces conditional +s or -s. Expected M6 resolution parity `MATCH`.

## 8. Regression
Verify Conflict state, chat card, disposition, Learning/Nature tax, Maneuver UI, action advancement, next exchange and Token Actor resolution all behave exactly as before. No red console errors.

## PASS
At least one Versus, one Independent, missile exception and Maneuver resolution observed; all M6 rows MATCH; `mismatches:0`; Legacy remains live authority.
