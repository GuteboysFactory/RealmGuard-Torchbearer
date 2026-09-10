Realm Guard / Torchbearer v1.4.0-qa.3 — CORE M2 Trait Effect Provider QA.

qa.1 established the Unified Effect Engine foundation. qa.2 added the first real provider, Condition dice modifiers, and passed live QA. qa.3 adds selected Trait roll effects as the second real provider while keeping all live gameplay on the existing v1.3.0-compatible logic.

New in qa.3:
- Trait selected-use Effect Provider: traits.selected-use
- Level 1/2 beneficial Trait +1D translated to CORE DICE_MODIFIER Effects
- Level 3 beneficial Trait +1s translated to CORE SUCCESS_MODIFIER Effects after a passed/tied result
- Trait Against -1D translated to CORE DICE_MODIFIER
- Versus Trait Against opponent +2D translated as an opponent-channel DICE_MODIFIER
- Check entitlement translated to CORE CURRENCY Effects
- Angry/exhausted beneficial Trait blocking translated to CORE CAPABILITY_BLOCK
- independent shadow comparison helper: game.realmGuard.core.effects.compareTraitEffects(...)
- M2 diagnostics now show two registered providers and the expanded shadow scope
- automated headless Trait provider smoke test added to the release gate

Scope remains deliberately non-destructive:
- migrated in shadow: Condition dice modifiers and selected Trait roll-facing effects
- not migrated live: Trait session-use consumption, actual Check awards, resource commits or roll application
- live application remains OFF
- current roll dialogs, Trait helpers and result resolution remain unchanged

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 2
- providers: conditions.roll-dice, traits.selected-use

Gameplay change: NONE INTENDED.
GOLD baseline: v1.3.0.
Previous M2 QA: v1.4.0-qa.1 PASS, v1.4.0-qa.2 PASS.
Foundry target: v13.351.
