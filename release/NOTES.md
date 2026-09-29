# Realm Guard / Torchbearer v1.12.0-qa.10 — M10B.10 MG1E Live Readiness Closure

Built after v1.12.0-qa.8 M10B.8 passed full live Foundry VTT 13.351 QA and the M10B.9 activation-readiness audit.

Highlights:
- advances the MG1E foundation to profile v10 and MG1E Character Creation profile to v2
- keeps MG1E FOUNDATION_ONLY, non-selectable, unsupported and non-live
- replaces the two-profile activation whitelist with a generic metadata-driven activation gate
- explicitly proves that MG1E activation remains rejected with zero setting writes
- routes rated-Wise Item Sheet editing through profile capabilities instead of Strict identity
- routes Conflict descriptor-Nature availability through profile policy instead of a Strict id check
- routes Manual active-profile Rules Reference presentation generically
- makes Profile Management activation reporting generic while keeping MG1E locked
- adds generic M10 live-readiness status / APIs
- promotes MG1E CORE M9 Character Creation to READY_WHEN_ACTIVE while live execution remains disabled
- makes M9 skill and Condition provisioning profile-owned
- carries the full MG1E canonical Skill set in new-character commit plans
- provisions the MG1E Sick condition set from the commit plan
- lets CORE M8 ingest profile-owned creation relationships
- adds a profile-owned Character Creation presentation/readiness contract
- adds simulated MG1E transactional-commit QA, including compensating rollback
- performs no existing Actor/Item migration and no live MG1E activation
- v1.11.0 remains STABLE / GOLD
