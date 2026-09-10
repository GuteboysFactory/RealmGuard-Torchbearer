Realm Guard / Torchbearer v1.4.0-qa.6 — CORE M2 Token of Power Effect Provider QA + Wise post-roll decision correction.

qa.1 established the Unified Effect Engine foundation. qa.2 added Condition dice modifiers. qa.3 added selected Trait effects. qa.4 added current Legacy Mixed Conflict Weapon/Tool action modifiers. qa.5 added selected Wise reroll Effects and fixed UEE scrolling. All previous M2 QA steps passed live testing.

New in qa.6:
- Token of Power Effect Provider: tokens-of-power.selected-use
- Level 1 / Level 2 automatic Token bonuses translate to CORE DICE_MODIFIER
- Level 3 failed-die reroll access translates to CORE REROLL
- manual Token effects translate to CORE MANUAL rather than inventing automation
- once/session consumption is described by shadow STATE_CHANGE Effects; CORE does not commit the state
- compareTokenPowerEffects(...) compares current Legacy Mixed Token resolution against CORE
- provider count increases to 5
- UEE diagnostics documents Token of Power scope and Wise decision timing
- automated headless Token of Power provider smoke test covers L1/L2/L3/manual/used/applicability/provenance

Wise UX correction:
- the base dice are now visible before the player commits to a Wise reroll
- when failed dice exist and the Ranger has Wises, a post-roll Wise Reroll dialog offers Use or Keep Result
- a Wise selected in the pre-roll dialog is only the preferred default; leaving Wise=None still allows the post-roll decision
- Angry suppresses beneficial Wise use as before
- accepted Wise use still rerolls all failed dice once, preserving the current Legacy Mixed arithmetic

Deliberate scope limits:
- Effect Engine live application remains OFF
- Conditions, Traits, Wises, Tokens of Power and Conflict Tools remain shadow providers
- Token of Power live mechanics continue to use the existing Legacy Mixed implementation
- no Actor/Item/world migration
- no inventory or Conflict behavior change
- the only intended live behavior change is the timing/confirmation UX for Wise rerolls

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 5
- providers: conditions.roll-dice, traits.selected-use, wises.selected-reroll, tokens-of-power.selected-use, conflict-tools.action-modifiers

GOLD baseline: v1.3.0.
Previous M2 QA: v1.4.0-qa.1 PASS through v1.4.0-qa.5 PASS.
Foundry target: v13.351.
