# v1.12.0-qa.1 — M10B.1 Generic Profile Presentation & Rule Router

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.11.0  
**MG1E activation:** OFF / FOUNDATION_ONLY  
**Gameplay mutation:** NONE intended

## Purpose

Establish a generic, read-only rule/presentation capability layer before any third Rules Profile is allowed to become live.

The patch must not change Legacy Mixed or Realm Guard Strict behavior.

## Gate A — boot / version

Expected:
- system version = 1.12.0-qa.1
- current world profile remains whatever was active before update
- no automatic profile switch
- no Actor/Item/Journal migration
- no red console errors.

## Gate B — capability API

Run:

```js
({
  active: game.realmGuard.core.getActiveRulesProfile(),
  capabilities: game.realmGuard.core.getActiveProfileCapabilities(),
  mg1e: game.realmGuard.core.resolveProfileCapabilities("mg1e")
})
```

Expected:
- active capabilities match the active profile
- capability phase = M10B.1
- `mg1e.profile.foundationOnly === true`
- `mg1e.profile.selectable === false`
- `mg1e.profile.liveRuleAuthority === false`
- MG1E: rated Wises, MG1E Trait levels, no Synergy, LOOSE inventory, unarmed 0D, no Levels/Talents, no Tokens of Power, no Scale
- MG1E condition set contains Sick and not Strained.

## Gate C — current profile regression

No full M10A retest is required.

If Legacy Mixed is active, verify one ordinary roll and confirm current Legacy sheet presentation is unchanged.

If Strict is active, verify one rated Wise/ordinary roll and confirm Levels/Talents remain hidden/inactive as in v1.11.0.

## Gate D — data-preservation contract

The capability snapshot must report:
- `preserveInactiveData: true`
- `preserveConditionItemsOutsideActiveProfile: true`
- `preserveProgressionDataWhenHidden: true`
- `preserveInventoryPlacementMetadata: true`
- `deleteOnProfileSwitch: false`.

MG1E must still not appear as an activation target.

## PASS

qa.1 passes when automated smoke and live boot/regression are clean with zero gameplay change. Only after PASS do we audit the first live-consumer migration to generic capability routing.
