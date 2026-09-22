Realm Guard / Torchbearer v1.10.0-qa.4 — M9 CORE Live Transactional Commit

Built from verified v1.10.0-qa.3 PASS.

Highlights:
- CORE M9 is now the normal live Recruitment commit authority.
- FoundryCreationCommitAdapter executes the verified Actor/Skills/Traits/Wises/Gear/Conditions plan.
- Recruitment relationships are normalized immediately into M8 Social Network storage without automatic NPC creation.
- New Rangers receive CreationProvenance with the active Rules Profile snapshot hash.
- Critical failures after Actor creation trigger compensating rollback by deleting the partial Ranger.
- Final Legacy-derived and commit projection parity remains a pre-mutation safety gate.
- Legacy createRanger remains available only through an explicit QA-only pre-mutation fallback mode.
- Recruitment Chat and Relationship NPC Review remain post-commit side effects and cannot invalidate a successfully created Ranger.
- Existing Actors are untouched.
- Gameplay change: NONE INTENDED.
- Foundry VTT 13.351 target.
