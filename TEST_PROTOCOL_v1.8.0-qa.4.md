# Realm Guard / Torchbearer v1.8.0-qa.4 QA Protocol

## Scope
Each Actor declares one Conflict Weapon / Tool for the full three-card Exchange. The declaration is stamped onto every Action assigned to that Actor when the plan locks. A different declaration can be made when the next Exchange begins. M6 qa.3 resolution handoff remains enabled.

## 1 Initial status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.handoffStatus()
```
Expected `1.8.0-qa.4`, M6 enabled, CORE_M6 resolution authority, LEGACY_MIXED state authority.

## 2 Single Actor
Use an Actor with Shield and Sword. Choose Shield under Exchange Weapon / Tool, then plan Defend, Attack, Maneuver. Every Action slot must show Shield; no per-Action weapon dropdown may exist. Lock and resolve all three. Every reveal uses Shield; bonuses apply only to actions where Shield grants them.

## 3 Next Exchange
After all three cards, choose Sword in the new Exchange. All Actions for that Actor now use Sword.

## 4 Multi-Ranger
Declare different tools per Ranger. Each Ranger keeps their own declaration on every Action they take.

## 5 Custom Tool
Create/select a custom Conflict Tool during planning. It becomes that Actor's Exchange declaration.

## 6 M6 regression
Resolve Versus, Independent and Maneuver.
```js
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.getStatus()
```
Expected handoff mismatches 0, errorFallbacks 0, shadow mismatches 0, enabled true.

## 7 Token Actor regression
Unlinked Token Actor equipment must remain authoritative.

## PASS
No per-Action switching; one declaration per Actor per Exchange; new Exchange allows a new declaration; multi-Ranger independence; M6 and Token Actor remain green.
