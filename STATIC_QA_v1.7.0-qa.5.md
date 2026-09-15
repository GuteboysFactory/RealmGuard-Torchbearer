# STATIC QA — v1.7.0-qa.5

## Build identity
- system version must be `1.7.0-qa.5`
- Foundry compatibility remains `13.351`
- system id remains `realm-guard`
- release download points to `1.7.0-qa.5/realm-guard.zip`

## M5 foundation
- `module/core/m5-services.mjs` exists
- `module/m5-core-service.mjs` exists
- services exposed: GearService, InventoryPolicy, PlacementValidator, ContainerService, ConflictToolService, ConflictToolEffectProvider
- supported policy identifiers: LOOSE / STRUCTURED / CUSTOM
- active Legacy Mixed resolves STRUCTURED
- no live M5 writer/takeover enabled
- no destructive Actor/Item migration

## Inventory compatibility
- structured zone IDs match current Legacy inventory
- hand and 2H validation preserved in shadow validator
- Cloak, Belt, Pocket and capacity checks represented
- Backpack/Satchel container capacity represented
- nested containers remain intentionally deferred to match current layer

## Conflict Tool architecture
- physical Gear supported
- saved narrative/contextual tools supported
- natural Conflict Tools supported
- multiple effects per Tool supported
- requirements supported
- temporary disable state supported
- disable target enumeration can include Tool/Gear/Natural Tool/Trait
- CORE default unarmed Tool effect is 0D
- Legacy Mixed compatibility evaluator preserves current -1D
- no live Conflict refactor/takeover before M6

## Preservation
- qa.4 Equipment Figure remains present
- qa.4 Token Builder UX hotfix remains loaded as esmodule
- M2/M3/M4 imports preserved
- Legacy Inventory remains sole live writer
- Legacy Conflict remains sole live writer

## Automated checks
- `qa/m5-equipment-silhouette-smoke.mjs`
- `qa/m5-core-services-smoke.mjs`
- all previous qa smoke scripts must continue passing in release workflow
- all JS/MJS must pass syntax validation

## Live gate
See `TEST_PROTOCOL_v1.7.0-qa.5.md`.
