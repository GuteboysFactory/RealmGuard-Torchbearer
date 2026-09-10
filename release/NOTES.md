Realm Guard / Torchbearer v1.4.0-qa.7 — CORE M2 Talent Effect Provider + roadmap compliance correction.

This build returns M2 to the locked implementation roadmap: M2 changes modifier/effect ownership beneath the existing UI but does not intentionally change the Legacy Mixed tabletop rules.

Roadmap compliance correction:
- the qa.6 live Wise post-roll override has been removed
- live Wise behavior is restored to the pre-qa.6 Legacy Mixed compatibility path
- the existing wises.selected-reroll provider is restored to shadowing that compatibility behavior
- MG2E-specific Wise corrections such as Deeper Understanding / Of Course!, relevance enforcement and profile-specific Wise progression are deferred to the explicit profile phase
- no strict-profile rule correction is activated in M2

New in qa.7:
- Talent Effect Provider: talents.selected-use
- current Legacy Mixed Talent dice bonuses translate to CORE DICE_MODIFIER
- manual Talent effects translate to CORE MANUAL
- once/session and once/conflict consumption intent translate to shadow STATE_CHANGE Effects
- passive Talents do not invent consumption state
- Skill, Ability and General linkage rules are mirrored from the current live Talent resolver
- minimum-level and used-state eligibility are mirrored
- compareTalentEffects(...) compares current Legacy Mixed Talent resolution against CORE
- automated headless Talent provider smoke covers session, passive, conflict, manual, linkage, minimum-level, used-state and provenance
- provider count increases to 6
- UEE diagnostics documents the M2 compliance correction and Talent scope

Existing M2 providers retained:
- conditions.roll-dice
- traits.selected-use
- wises.selected-reroll
- tokens-of-power.selected-use
- talents.selected-use
- conflict-tools.action-modifiers

Deliberate scope limits:
- Effect Engine live application remains OFF
- all six providers remain shadow-only
- no Actor/Item/world migration
- no inventory or Conflict behavior change
- no Wise rule-model conversion
- no Strict Realm Guard or MG2E profile correction

Expected live status:
- phase: M2
- mode: SHADOW_COMPARE
- live application: OFF
- providers: 6

GOLD baseline: v1.3.0.
Foundry target: v13.351.
