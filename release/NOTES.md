Realm Guard / Torchbearer v1.10.0-qa.3 — M9 Transactional Commit Plan / Foundry Adapter Shadow

Built from verified v1.10.0-qa.2 PASS.

Highlights:
- CORE M9 now builds the complete CreationCommitPlan for current Legacy Mixed Recruitment.
- Adds a FoundryCreationCommitAdapter preview with explicit transaction phases and compensating rollback semantics.
- Adds independent Legacy commit projection and commit-level parity telemetry.
- Actor data, legacy Recruitment flags, Skills, Traits, Wises, Gear, Conditions, Relationships and CreationProvenance are represented in the CORE plan.
- Legacy createRanger remains the sole live mutation authority.
- CORE adapter is shadow-only and refuses live execution.
- No second Actor, no live provenance write and no normalized M8 relationship write.
- Chat and GM-controlled Relationship NPC review remain post-commit/outside the atomic boundary.
- Gameplay change: NONE INTENDED.
- Foundry VTT 13.351 target.
