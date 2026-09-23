Realm Guard / Torchbearer v1.11.0-qa.4 — M10A.3 Conditions / Recovery

Built after v1.11.0-qa.3 passed live Foundry VTT 13.351 QA.

This build does not activate Strict Realm Guard. Legacy Mixed remains the sole live gameplay profile.

Highlights:
- Adds a non-live Strict Condition policy with derived Healthy plus Hungry & Thirsty, Angry, Tired, Injured and Strained.
- Fresh and Afraid are preserved as Legacy Mixed data and have no Strict mechanical effect.
- Adds a read-only Strict condition provisioning plan with zero Actor/Item writes.
- Adds source-backed Strict Condition roll/disposition planners and zero-rating Condition policy.
- Adds Harvester to Hungry recovery planning and good-night's-rest routes for Tired.
- Adds no-Help policy for Will/Health recovery tests.
- Adds Injured recovery state planning: Health Ob 4, Healer Ob 3 after failure, explicit permanent-reduction review on failed treatment, and Players' Turn waiver planning.
- Permanent reduction targets exclude Resources/Circles and are never auto-selected.
- Adds Strained Ob 4 Will counsel state planning with 2-Check GM Turn counsel economy.
- Adds source-ordered helper lesser-Condition options; GM selection remains required and auto-application remains off.
- Exposes Strict Conditions/Recovery planning under game.realmGuard.core.m10.strict.
- Strict profile advances to version 4 / M10A.3 and remains PREVIEW_ONLY.
- Legacy Mixed Condition provisioning/recovery remains untouched.
- Foundry VTT target remains 13.351.

Next after PASS:
M10A.4 — Gear / Inventory / Conflict Ownership, preceded by a fresh read-only audit.
