Realm Guard / Torchbearer v1.3.0 — CORE M1 GOLD.

M1 establishes the first operational MG-family Rules Profile infrastructure while preserving the v1.2.0 gameplay behavior through the explicit realm-guard-legacy-mixed compatibility profile.

Included architecture components:
- RulesProfile and ProfileResolver
- immutable ResolvedRulesProfile
- RulesRegistry with provenance, classification and automation metadata
- deterministic Rules Snapshot hash
- explicit realm-guard-legacy-mixed v1 compatibility profile
- GM-only Active Rules Registry diagnostic window
- read/diagnostic API at game.realmGuard.core
- automated headless M1 profile smoke test in the GitHub release gate

Live QA result: PASS on Foundry v13.351.

The v1.3.0-qa.1 Registry scroll usability issue was corrected in v1.3.0-qa.2 and verified live. All other reported M1 protocol checks passed.

Legacy Mixed explicitly preserves representative current behavior including unrated Wises, structured inventory and enabled Levels/Talents. Strict Realm Guard is not active and no Actor/Item rule-data migration is introduced.

Gameplay change: NONE INTENDED.
Previous GOLD baseline: v1.2.0.
New GOLD baseline: v1.3.0.
Next architecture phase: M2 Unified Effect Engine.
Foundry target: v13.351.
