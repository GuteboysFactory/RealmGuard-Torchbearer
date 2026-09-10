Realm Guard / Torchbearer v1.4.0-qa.5 — CORE M2 Wise Reroll Effect Provider QA + UEE scroll fix.

qa.1 established the Unified Effect Engine foundation. qa.2 added Condition dice modifiers. qa.3 added selected Trait effects. qa.4 added current Legacy Mixed Conflict Weapon/Tool action modifiers. All previous M2 provider QA steps passed live testing. qa.5 adds selected Wise reroll access as the fourth real Effect Provider and includes the UEE diagnostics scrolling fix requested during qa.4.

New in qa.5:
- Wise Effect Provider: wises.selected-reroll
- selected Wise reroll access becomes a CORE REROLL Effect
- the REROLL Effect describes failed-die eligibility using the current 4+ success threshold
- Angry blocking of beneficial Wise use becomes CAPABILITY_BLOCK
- read-only compareWiseEffects(...) helper compares Legacy Mixed availability/blocking and deterministic failed-die indexes against CORE
- M2 diagnostics now show four registered providers and the expanded shadow scope
- UEE diagnostics content now has an explicit constrained vertical scroll region so all sections remain reachable as the provider list grows
- automated headless Wise provider smoke test added to the release gate

Deliberate scope limits:
- live application remains OFF
- existing Wise reroll code still performs every real reroll
- CORE does not roll or replace dice in qa.5
- no Actor/Item/world migration
- no inventory or Conflict behavior changes
- Conflict Tool legacy no-valid-tool -1D remains profile-specific compatibility behavior only

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 4
- providers: conditions.roll-dice, traits.selected-use, wises.selected-reroll, conflict-tools.action-modifiers

Gameplay change: NONE INTENDED.
GOLD baseline: v1.3.0.
Previous M2 QA: v1.4.0-qa.1 PASS, v1.4.0-qa.2 PASS, v1.4.0-qa.3 PASS. qa.4 functional provider checks passed; its UEE scroll observation is addressed in qa.5.
Foundry target: v13.351.
