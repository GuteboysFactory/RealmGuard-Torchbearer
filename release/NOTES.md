Realm Guard / Torchbearer v1.4.0-qa.2 — CORE M2 Condition Effect Provider QA.

qa.1 established the Unified Effect Engine foundation and passed live QA. qa.2 adds the first real Effect Provider while keeping all live gameplay on the existing v1.3.0-compatible logic.

New in qa.2:
- Condition roll-dice Effect Provider: conditions.roll-dice
- active Condition system.rollModifier data maps to CORE DICE_MODIFIER Effects
- Condition system.appliesTo maps to Effect applicability tags
- Effect provenance retains Actor/Condition identity and provider ownership
- independent shadow comparison helper: game.realmGuard.core.effects.compareConditionDice(...)
- M2 diagnostics now show SHADOW_COMPARE mode, one provider and the exact migration scope
- automated condition-provider headless smoke test added to the release gate

Scope is deliberately narrow:
- migrated in shadow: Condition dice modifiers only
- not migrated yet: recovery rules, disposition effects, capability blocks, Trait/Wise blocking or any other Condition behavior
- live application remains OFF
- current roll dialogs and live Condition calculation remain unchanged

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 1
- provider: conditions.roll-dice

Gameplay change: NONE INTENDED.
GOLD baseline: v1.3.0.
Previous M2 QA: v1.4.0-qa.1 PASS.
Foundry target: v13.351.
