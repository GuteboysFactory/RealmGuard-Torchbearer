Realm Guard / Torchbearer v1.4.0-qa.4 — CORE M2 Conflict Tool Effect Provider QA.

qa.1 established the Unified Effect Engine foundation. qa.2 added Condition dice modifiers. qa.3 added selected Trait effects. All three previous M2 QA steps passed live testing. qa.4 adds the current Legacy Mixed Conflict Weapon/Tool action modifiers as the third real Effect Provider while keeping all live Conflict behavior on the existing v1.3.0-compatible engine.

New in qa.4:
- Conflict Tool Effect Provider: conflict-tools.action-modifiers
- physical weapon action modifiers mirrored for Shield, Halberd, Whip/Hook and Line, Spear, Staff, Bow, Sling, Axe and Sword
- saved/improvised Conflict Tool dice/success modifiers represented as CORE Effects
- DICE_MODIFIER for action dice bonuses/penalties
- SUCCESS_MODIFIER for conditional success bonuses and success penalties
- CAPABILITY_BLOCK for unmet Conflict Tool requirements
- independent frozen Legacy Mixed reference mirror used by compareConflictToolEffects(...)
- current Legacy Mixed no-valid-tool -1D behavior is preserved only as an explicitly marked legacyCompatibility effect
- M2 diagnostics now show three registered providers and the expanded shadow scope
- automated headless Conflict Tool provider smoke test added to the release gate

Deliberate scope limits:
- live application remains OFF
- existing Conflict engine still calculates and applies all real weapon/tool modifiers
- no Actor/Item/world migration
- no inventory changes
- no Armor/DAMAGE_ABSORB behavior is invented because that is not part of the current live action-modifier path
- future strict profiles may differ from Legacy Mixed; especially the no-tool -1D behavior is not declared a universal CORE rule

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 3
- providers: conditions.roll-dice, traits.selected-use, conflict-tools.action-modifiers

Gameplay change: NONE INTENDED.
GOLD baseline: v1.3.0.
Previous M2 QA: v1.4.0-qa.1 PASS, v1.4.0-qa.2 PASS, v1.4.0-qa.3 PASS.
Foundry target: v13.351.
