# Realm Guard / Torchbearer v1.12.0-qa.14 — M10C.3 MG2E Shadow Rule Adapters / Activation-Readiness Foundation

Built after v1.12.0-qa.13 passed full Foundry VTT 13.351 live QA and closed M10C.2.

Highlights:
- closes M10C.2 as FULL PASS / VERIFIED / CLOSED
- advances standalone Mouse Guard 2E Rules Profile to v3
- keeps MG2E FOUNDATION_ONLY, non-selectable, unsupported and non-live
- adds dedicated read-only MG2E shadow adapters for Tests, Advancement, Beginner's Luck learning, Traits, unrated Wise effects, Help, Nature, Recovery, Gear/carrying, Conflict, Players' Turn / End Session, Circles, Natural Order and Character Creation foundation
- exposes the shadow planners under game.realmGuard.core.m10.mg2e
- keeps all MG2E shadow planners at liveApplication:false and zero planned Actor / Item / Journal / world-setting writes
- adds explicit activation-readiness reporting with remaining blockers instead of enabling activation
- keeps MG2E Character Creation foundation-only with no transactional commit, provenance write or relationship write
- preserves standalone MG2E Natural Order through generic Comparative Scale routing with no Actor rank inference/write
- preserves Legacy Mixed, Strict Realm Guard and MG1E behavior
- adds dedicated M10C.3 smoke coverage and release preflight coverage for the MG2E conversion preview
- v1.11.0 remains STABLE / GOLD

Live QA follows TEST_PROTOCOL_v1.12.0-qa.14.md.
