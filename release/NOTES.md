Realm Guard / Torchbearer v1.3.0-qa.1 — CORE M1 QA.

M1 introduces the first operational MG-family Rules Profile infrastructure without replacing the existing v1.2.0 gameplay engines.

New architecture components:
- RulesProfile and ProfileResolver
- immutable ResolvedRulesProfile
- RulesRegistry with provenance/classification/automation metadata
- deterministic Rules Snapshot hash
- explicit realm-guard-legacy-mixed v1 compatibility profile
- GM-only Active Rules Registry diagnostic window
- read/diagnostic API at game.realmGuard.core
- automated headless M1 profile smoke test in the GitHub release gate

Legacy Mixed explicitly records representative current behavior including unrated Wises, structured inventory and enabled Levels/Talents. Strict Realm Guard is not active and no Actor/Item rule data migration is introduced.

Gameplay change: NONE INTENDED.
GOLD baseline: v1.2.0.
Foundry target: v13.351.
