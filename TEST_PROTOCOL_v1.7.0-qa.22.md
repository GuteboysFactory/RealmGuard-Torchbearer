# Realm Guard / Torchbearer v1.7.0-qa.22 QA Protocol

## Scope
Targeted Conflict actor-resolution hotfix discovered during qa.21. Conflict must use the active scene Token Actor when exactly one matching token exists, so unlinked/synthetic token Gear, Conditions, Skills, Nature and resources are respected. World Actor remains the safe fallback. qa.21 M5 Conflict Tool evaluation handoff is otherwise unchanged.

## 1. Status
```js
game.system.version
```
Expected `1.7.0-qa.22`.

## 2. Resolver proof
With Dev Testsson on the active scene, run:
```js
const world = game.actors.getName("Dev Testsson");
game.realmGuard.core.m5.conflictTools.inspectActorResolution(world.id)
```
Expected with exactly one scene token: `source:"UNIQUE_SCENE_TOKEN"`, `actor.isToken:true`, and tokenId matching the scene token.

## 3. Conflict Weapon list
Open/start a Fight using Dev Testsson. In planning, Weapon / Tool must reflect the token Actor state. For the reported reproduction, Shield and Dagger/Sword present on the token must be available according to normal Conflict weapon rules.

## 4. World Actor fallback
Remove Dev Testsson token from the scene or test another Actor with no scene token. Resolver must report `WORLD_ACTOR`; existing Conflict behavior must remain unchanged.

## 5. Ambiguity safety
If two tokens on the active scene reference the same world Actor and neither is uniquely controlled, resolver must use `WORLD_ACTOR` and warn rather than guessing. If exactly one matching token is controlled, that controlled token is used.

## 6. qa.21 continuation
Resume qa.21 Conflict Tool evaluation tests: physical Tool, Unarmed, conditional success, custom/narrative Tool, rollback and full Action-pair regression. Final M5 Conflict handoff status must remain enabled with mismatches 0 and errorFallbacks 0.
